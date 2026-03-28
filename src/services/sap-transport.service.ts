import {
  Prisma,
  TransportApprovalStatus,
  TransportActionStatus,
  TransportActionType,
  TransportStageStatus,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { toTransportActionDto, toTransportDto } from "@/lib/utils";
import { sendProductionApprovalEmail } from "@/services/mail.service";
import {
  TransportListResponse,
  TransportApprovalResult,
  TransportMoveResult,
  TransportSyncResult,
} from "@/types";

type TargetEnvironment = "QA" | "PROD";
type ApprovalDecision = "APPROVE" | "DECLINE";

const PROD_APPROVER_EMAIL = "hsudra@gulbrandsen.com";

interface NormalizedTransport {
  trNumber: string;
  description?: string | null;
  owner?: string | null;
  requestType?: string | null;
  requestStatus?: string | null;
  developmentClass?: string | null;
  targetSystem?: string | null;
  sourceSystem?: string | null;
  sourceClient?: string | null;
  qaStatus?: TransportStageStatus;
  qaImportedAt?: Date | null;
  qaReturnCode?: string | null;
  prodStatus?: TransportStageStatus;
  prodImportedAt?: Date | null;
  prodReturnCode?: string | null;
  sapUpdatedAt?: Date | null;
  rawPayload?: Prisma.InputJsonValue;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function envFlag(name: string, fallback = false): boolean {
  const raw = process.env[name];
  if (!raw) return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

function buildAuthHeader(username?: string, password?: string): string | undefined {
  if (!username || !password) return undefined;
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function sanitizeStageStatus(value: unknown, fallback: TransportStageStatus): TransportStageStatus {
  if (!value) return fallback;
  const raw = String(value).trim().toUpperCase();
  const values = Object.values(TransportStageStatus);
  return values.includes(raw as TransportStageStatus) ? (raw as TransportStageStatus) : fallback;
}

function deriveMockQaStatus(requestStatus: string | null, moveTo: string | null): TransportStageStatus {
  const status = (requestStatus ?? "").toLowerCase();
  const move = (moveTo ?? "").toLowerCase();

  if (move.includes("prod")) return TransportStageStatus.QA_IMPORTED;
  if (status.includes("closed") || status.includes("done")) return TransportStageStatus.QA_IMPORTED;
  if (status.includes("qa")) return TransportStageStatus.QA_QUEUE;
  return TransportStageStatus.DEV_ONLY;
}

function deriveMockProdStatus(requestStatus: string | null, moveTo: string | null): TransportStageStatus {
  const status = (requestStatus ?? "").toLowerCase();
  const move = (moveTo ?? "").toLowerCase();

  if (status.includes("prod")) return TransportStageStatus.PROD_IMPORTED;
  if (move.includes("prod")) return TransportStageStatus.PROD_QUEUE;
  return TransportStageStatus.UNKNOWN;
}

function normalizeTransport(payload: Record<string, unknown>): NormalizedTransport | null {
  const trNumber = String(
    payload.TransportRequest ??
      payload.trNumber ??
      payload.TRKORR ??
      payload.trkorr ??
      ""
  ).trim();

  if (!trNumber) return null;

  return {
    trNumber,
    description: String(payload.RequestText ?? payload.description ?? payload.AS4TEXT ?? "").trim() || null,
    owner: String(payload.CreatedBy ?? payload.owner ?? payload.AS4USER ?? "").trim() || null,
    requestType: String(payload.RequestType ?? payload.requestType ?? payload.TRFUNCTION ?? "").trim() || null,
    requestStatus: String(payload.RequestStatus ?? payload.requestStatus ?? payload.TRSTATUS ?? "").trim() || null,
    developmentClass: String(payload.DevelopmentClass ?? payload.developmentClass ?? payload.KORRDEV ?? "").trim() || null,
    targetSystem: String(payload.TargetSystem ?? payload.targetSystem ?? payload.TARSYSTEM ?? "").trim() || null,
    sourceSystem: String(payload.SourceSystem ?? payload.sourceSystem ?? "").trim() || null,
    sourceClient: String(payload.SourceClient ?? payload.sourceClient ?? "").trim() || null,
    qaStatus: sanitizeStageStatus(payload.QaStatus ?? payload.qaStatus, TransportStageStatus.UNKNOWN),
    qaImportedAt: parseDate(payload.QaImportedAt ?? payload.qaImportedAt),
    qaReturnCode: String(payload.QaReturnCode ?? payload.qaReturnCode ?? "").trim() || null,
    prodStatus: sanitizeStageStatus(payload.ProdStatus ?? payload.prodStatus, TransportStageStatus.UNKNOWN),
    prodImportedAt: parseDate(payload.ProdImportedAt ?? payload.prodImportedAt),
    prodReturnCode: String(payload.ProdReturnCode ?? payload.prodReturnCode ?? "").trim() || null,
    sapUpdatedAt: parseDate(payload.ChangedAt ?? payload.sapUpdatedAt),
    rawPayload: payload as Prisma.InputJsonValue,
  };
}

async function fetchSapTransportFeed(): Promise<NormalizedTransport[]> {
  const url = process.env.SAP_TR_READ_URL;
  if (!url) {
    throw new Error("SAP_TR_READ_URL is not configured");
  }

  const authHeader = buildAuthHeader(process.env.SAP_TR_USERNAME, process.env.SAP_TR_PASSWORD);
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`SAP read endpoint failed with HTTP ${response.status}`);
  }

  const json = await response.json();
  const rawItems =
    (Array.isArray(json?.d?.results) && json.d.results) ||
    (Array.isArray(json?.value) && json.value) ||
    (Array.isArray(json) && json) ||
    [];

  return rawItems
    .map((item: unknown) => normalizeTransport(item as Record<string, unknown>))
    .filter((item: NormalizedTransport | null): item is NormalizedTransport => Boolean(item));
}

async function buildMockTransportFeed(): Promise<NormalizedTransport[]> {
  const records = await prisma.changeRecord.findMany({
    where: { trNumber: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return records
    .filter((record) => Boolean(record.trNumber))
    .map((record) => ({
      trNumber: record.trNumber!,
      description: record.requestDescription,
      owner: record.trCreatedBy ?? record.requester,
      requestType: record.typeOfRequest,
      requestStatus: record.status,
      developmentClass: record.programName,
      targetSystem: record.moveTo,
      sourceSystem: "DEV",
      sourceClient: null,
      qaStatus: deriveMockQaStatus(record.status, record.moveTo),
      qaImportedAt:
        deriveMockQaStatus(record.status, record.moveTo) === TransportStageStatus.QA_IMPORTED
          ? record.trMovedDate ?? record.updatedAt
          : null,
      qaReturnCode: null,
      prodStatus: deriveMockProdStatus(record.status, record.moveTo),
      prodImportedAt:
        deriveMockProdStatus(record.status, record.moveTo) === TransportStageStatus.PROD_IMPORTED
          ? record.trMovedDate ?? record.updatedAt
          : null,
      prodReturnCode: null,
      sapUpdatedAt: record.updatedAt,
      rawPayload: {
        source: "mock",
        changeRecordId: record.id,
      },
    }));
}

async function upsertTransports(transports: NormalizedTransport[]): Promise<number> {
  let synced = 0;

  for (const transport of transports) {
    const changeRecord = await prisma.changeRecord.findFirst({
      where: { trNumber: transport.trNumber },
      select: { id: true },
    });

    await prisma.transportRequest.upsert({
      where: { trNumber: transport.trNumber },
      create: {
        trNumber: transport.trNumber,
        description: transport.description ?? null,
        owner: transport.owner ?? null,
        requestType: transport.requestType ?? null,
        requestStatus: transport.requestStatus ?? null,
        developmentClass: transport.developmentClass ?? null,
        targetSystem: transport.targetSystem ?? null,
        sourceSystem: transport.sourceSystem ?? null,
        sourceClient: transport.sourceClient ?? null,
        qaStatus: transport.qaStatus ?? TransportStageStatus.UNKNOWN,
        qaImportedAt: transport.qaImportedAt ?? null,
        qaReturnCode: transport.qaReturnCode ?? null,
        prodStatus: transport.prodStatus ?? TransportStageStatus.UNKNOWN,
        prodImportedAt: transport.prodImportedAt ?? null,
        prodReturnCode: transport.prodReturnCode ?? null,
        prodApprovalStatus: TransportApprovalStatus.NOT_REQUESTED,
        lastAction: "SYNC",
        lastSyncedAt: new Date(),
        sapUpdatedAt: transport.sapUpdatedAt ?? null,
        rawPayload: transport.rawPayload,
        changeRecordId: changeRecord?.id ?? null,
      },
      update: {
        description: transport.description ?? null,
        owner: transport.owner ?? null,
        requestType: transport.requestType ?? null,
        requestStatus: transport.requestStatus ?? null,
        developmentClass: transport.developmentClass ?? null,
        targetSystem: transport.targetSystem ?? null,
        sourceSystem: transport.sourceSystem ?? null,
        sourceClient: transport.sourceClient ?? null,
        qaStatus: transport.qaStatus ?? TransportStageStatus.UNKNOWN,
        qaImportedAt: transport.qaImportedAt ?? null,
        qaReturnCode: transport.qaReturnCode ?? null,
        prodStatus: transport.prodStatus ?? TransportStageStatus.UNKNOWN,
        prodImportedAt: transport.prodImportedAt ?? null,
        prodReturnCode: transport.prodReturnCode ?? null,
        lastAction: "SYNC",
        lastSyncedAt: new Date(),
        sapUpdatedAt: transport.sapUpdatedAt ?? null,
        rawPayload: transport.rawPayload,
        changeRecordId: changeRecord?.id ?? null,
      },
    });

    synced += 1;
  }

  return synced;
}

async function createActionAudit(params: {
  trNumber: string;
  actionType: TransportActionType;
  actionStatus: TransportActionStatus;
  environment?: string | null;
  message?: string;
  requestBody?: Prisma.InputJsonValue;
  responseBody?: Prisma.InputJsonValue;
}): Promise<void> {
  const transport = await prisma.transportRequest.findUnique({
    where: { trNumber: params.trNumber },
    select: { id: true },
  });

  await prisma.transportActionAudit.create({
    data: {
      trNumber: params.trNumber,
      actionType: params.actionType,
      actionStatus: params.actionStatus,
      environment: params.environment ?? null,
      requestedBy: "PCMS",
      message: params.message ?? null,
      requestBody: params.requestBody,
      responseBody: params.responseBody,
      transportId: transport?.id ?? null,
    },
  });
}

async function runMockMove(trNumber: string, target: TargetEnvironment): Promise<TransportMoveResult> {
  const now = new Date();
  const transport = await prisma.transportRequest.findUnique({ where: { trNumber } });

  if (!transport) {
    throw new Error(`Transport not found: ${trNumber}`);
  }

  if (target === "PROD" && transport.prodApprovalStatus !== TransportApprovalStatus.APPROVED) {
    throw new Error(`Production approval is required before importing ${trNumber}`);
  }

  const updateData =
    target === "QA"
      ? {
          qaStatus: TransportStageStatus.QA_QUEUE,
          lastAction: "MOVE_TO_QA",
          lastSyncedAt: now,
        }
      : {
          prodStatus: TransportStageStatus.PROD_QUEUE,
          prodApprovalStatus: TransportApprovalStatus.APPROVED,
          lastAction: "MOVE_TO_PROD",
          lastSyncedAt: now,
        };

  await prisma.transportRequest.update({
    where: { trNumber },
    data: updateData,
  });

  await createActionAudit({
    trNumber,
    actionType: target === "QA" ? TransportActionType.MOVE_TO_QA : TransportActionType.MOVE_TO_PROD,
    actionStatus: TransportActionStatus.SUCCESS,
    environment: target,
    message: `Mock ${target} move queued successfully`,
    requestBody: { trNumber, target, mode: "mock" },
    responseBody: { queuedAt: now.toISOString() },
  });

  return {
    trNumber,
    target,
    status: TransportActionStatus.SUCCESS,
    message: `Mock ${target} move queued successfully`,
  };
}

async function runSapMove(trNumber: string, target: TargetEnvironment): Promise<TransportMoveResult> {
  const url = process.env.SAP_TR_ACTION_URL;
  if (!url) {
    throw new Error("SAP_TR_ACTION_URL is not configured");
  }

  const existingTransport = await prisma.transportRequest.findUnique({ where: { trNumber } });
  if (target === "PROD" && existingTransport?.prodApprovalStatus !== TransportApprovalStatus.APPROVED) {
    throw new Error(`Production approval is required before importing ${trNumber}`);
  }

  const payload = { trNumber, target };
  const authHeader = buildAuthHeader(
    process.env.SAP_TR_ACTION_USERNAME ?? process.env.SAP_TR_USERNAME,
    process.env.SAP_TR_ACTION_PASSWORD ?? process.env.SAP_TR_PASSWORD
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const responseText = await response.text();
  const parsedResponse = responseText ? safeJsonParse(responseText) : null;

  if (!response.ok) {
    await createActionAudit({
      trNumber,
      actionType: target === "QA" ? TransportActionType.MOVE_TO_QA : TransportActionType.MOVE_TO_PROD,
      actionStatus: TransportActionStatus.FAILED,
      environment: target,
      message: `SAP action endpoint failed with HTTP ${response.status}`,
      requestBody: payload,
      responseBody: parsedResponse ?? responseText,
    });

    throw new Error(`SAP action endpoint failed with HTTP ${response.status}`);
  }

  await prisma.transportRequest.update({
    where: { trNumber },
    data: target === "QA"
      ? { qaStatus: TransportStageStatus.QA_QUEUE, lastAction: "MOVE_TO_QA", lastSyncedAt: new Date() }
      : { prodStatus: TransportStageStatus.PROD_QUEUE, lastAction: "MOVE_TO_PROD", lastSyncedAt: new Date() },
  });

  await createActionAudit({
    trNumber,
    actionType: target === "QA" ? TransportActionType.MOVE_TO_QA : TransportActionType.MOVE_TO_PROD,
    actionStatus: TransportActionStatus.SUCCESS,
    environment: target,
    message: `SAP ${target} move request submitted successfully`,
    requestBody: payload,
    responseBody: parsedResponse ?? responseText,
  });

  return {
    trNumber,
    target,
    status: TransportActionStatus.SUCCESS,
    message: `SAP ${target} move request submitted successfully`,
  };
}

export async function requestProductionApproval(trNumber: string): Promise<TransportApprovalResult> {
  const transport = await prisma.transportRequest.findUnique({ where: { trNumber } });

  if (!transport) {
    throw new Error(`Transport not found: ${trNumber}`);
  }

  const now = new Date();
  const requestLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/trms`;

  await prisma.transportRequest.update({
    where: { trNumber },
    data: {
      prodApprovalStatus: TransportApprovalStatus.PENDING,
      prodApprovalRequestedAt: now,
      prodApprovalRequestedBy: "PCMS Demo User",
      prodApprovalDecisionAt: null,
      prodApprovalDecisionBy: null,
      prodApprovalEmailSentAt: now,
      lastAction: "REQUEST_PROD_APPROVAL",
      lastSyncedAt: now,
    },
  });

  await sendProductionApprovalEmail({
    to: PROD_APPROVER_EMAIL,
    trNumber,
    description: transport.description,
    owner: transport.owner,
    requestLink,
  });

  await createActionAudit({
    trNumber,
    actionType: TransportActionType.MOVE_TO_PROD,
    actionStatus: TransportActionStatus.PENDING,
    environment: "PROD",
    message: `Production approval requested and email sent to ${PROD_APPROVER_EMAIL}`,
    requestBody: { trNumber, approver: PROD_APPROVER_EMAIL },
    responseBody: { requestLink, requestedAt: now.toISOString() },
  });

  return {
    trNumber,
    approvalStatus: TransportApprovalStatus.PENDING,
    message: `Approval request created. Email sent to ${PROD_APPROVER_EMAIL}.`,
  };
}

export async function reviewProductionApproval(
  trNumber: string,
  decision: ApprovalDecision
): Promise<TransportApprovalResult> {
  const transport = await prisma.transportRequest.findUnique({ where: { trNumber } });

  if (!transport) {
    throw new Error(`Transport not found: ${trNumber}`);
  }

  const now = new Date();
  const approvalStatus =
    decision === "APPROVE" ? TransportApprovalStatus.APPROVED : TransportApprovalStatus.DECLINED;

  await prisma.transportRequest.update({
    where: { trNumber },
    data: {
      prodApprovalStatus: approvalStatus,
      prodApprovalDecisionAt: now,
      prodApprovalDecisionBy: "hsudra@gulbrandsen.com",
      lastAction: decision === "APPROVE" ? "PROD_APPROVED" : "PROD_DECLINED",
      lastSyncedAt: now,
      ...(decision === "DECLINE"
        ? { prodStatus: TransportStageStatus.UNKNOWN }
        : {}),
    },
  });

  await createActionAudit({
    trNumber,
    actionType: TransportActionType.MOVE_TO_PROD,
    actionStatus: decision === "APPROVE" ? TransportActionStatus.SUCCESS : TransportActionStatus.FAILED,
    environment: "PROD",
    message:
      decision === "APPROVE"
        ? `Production approval granted by ${PROD_APPROVER_EMAIL}`
        : `Production approval declined by ${PROD_APPROVER_EMAIL}`,
    requestBody: { trNumber, decision },
    responseBody: { decidedAt: now.toISOString() },
  });

  return {
    trNumber,
    approvalStatus,
    message:
      decision === "APPROVE"
        ? "Production request approved. Import to production is now enabled."
        : "Production request declined. Import to production remains blocked.",
  };
}

function safeJsonParse(value: string): Prisma.InputJsonValue | null {
  try {
    return JSON.parse(value) as Prisma.InputJsonValue;
  } catch {
    return null;
  }
}

export async function getTransportDashboardData(): Promise<TransportListResponse> {
  const [transports, recentActions] = await Promise.all([
    prisma.transportRequest.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 200,
    }),
    prisma.transportActionAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    transports: transports.map(toTransportDto),
    recentActions: recentActions.map(toTransportActionDto),
    total: transports.length,
  };
}

export async function syncTransports(): Promise<TransportSyncResult> {
  const mockMode = envFlag("SAP_TR_MOCK_MODE", true);
  const transports = mockMode ? await buildMockTransportFeed() : await fetchSapTransportFeed();
  const synced = await upsertTransports(transports);

  await createActionAudit({
    trNumber: "*",
    actionType: TransportActionType.SYNC,
    actionStatus: TransportActionStatus.SUCCESS,
    environment: null,
    message: `Transport sync completed in ${mockMode ? "mock" : "sap"} mode`,
    requestBody: { mode: mockMode ? "mock" : "sap" },
    responseBody: { synced },
  });

  return {
    synced,
    mode: mockMode ? "mock" : "sap",
  };
}

export async function moveTransport(trNumber: string, target: TargetEnvironment): Promise<TransportMoveResult> {
  const mockMode = envFlag("SAP_TR_MOCK_MODE", true);
  return mockMode ? runMockMove(trNumber, target) : runSapMove(trNumber, target);
}
