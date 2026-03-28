// prisma/seed.ts
// Run: npx prisma db seed

import {
  PrismaClient,
  YesNoNa,
  TrMovedBy,
  TransportApprovalStatus,
  TransportStageStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PCMS database...");

  // ── Settings (dropdown options) ──────────────────────────────────

  const settingsData = [
    // Type of Request
    { key: "typeOfRequest", value: "Development", order: 1 },
    { key: "typeOfRequest", value: "Configuration", order: 2 },
    { key: "typeOfRequest", value: "Enhancement", order: 3 },
    { key: "typeOfRequest", value: "Bug Fix", order: 4 },
    { key: "typeOfRequest", value: "Report", order: 5 },

    // Status
    { key: "status", value: "Open", order: 1 },
    { key: "status", value: "In Progress", order: 2 },
    { key: "status", value: "Pending", order: 3 },
    { key: "status", value: "On Hold", order: 4 },
    { key: "status", value: "Closed", order: 5 },
    { key: "status", value: "Completed", order: 6 },
    { key: "status", value: "Cancelled", order: 7 },

    // Move To
    { key: "moveTo", value: "Production", order: 1 },
    { key: "moveTo", value: "Quality", order: 2 },
    { key: "moveTo", value: "Development", order: 3 },
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key_value: { key: s.key, value: s.value } },
      update: { order: s.order },
      create: s,
    });
  }

  console.log(`✅ Seeded ${settingsData.length} settings`);

  // ── Sample Records (for development/demo) ───────────────────────

  const sampleRecords = [
    {
      year: "2024",
      serialNumber: "2024-001",
      typeOfRequest: "Development",
      requestNumber: "REQ-001",
      requestDescription: "Add new vendor payment report to FI module",
      developmentTaskOrReportName: "ZRPT_VENDOR_PAYMENT",
      tCode: "SE38",
      programName: "ZRPT_VENDOR_PAYMENT",
      trNumber: "DEVK900001",
      trCreatedBy: "Manoj",
      trCreationDate: new Date("2024-01-15"),
      trMovedBy: TrMovedBy.Manoj,
      trMovedDate: new Date("2024-01-20"),
      moveTo: "Production",
      requester: "Finance Team",
      documentTestCaseChecked: YesNoNa.Yes,
      documentCheckedBy: "Lokesh",
      documentCheckedDate: new Date("2024-01-18"),
      documentUpdated: YesNoNa.Yes,
      programOrConfigurationVerified: YesNoNa.Yes,
      documentLink: "https://drive.google.com/file/d/example1",
      status: "Closed",
      remarks: "Successfully deployed to production",
    },
    {
      year: "2024",
      serialNumber: "2024-002",
      typeOfRequest: "Configuration",
      requestNumber: "REQ-002",
      requestDescription: "Update tax configuration for GST changes",
      tCode: "FTXP",
      trNumber: "DEVK900002",
      trCreatedBy: "Lokesh",
      trCreationDate: new Date("2024-02-10"),
      trMovedBy: TrMovedBy.Lokesh,
      trMovedDate: new Date("2024-02-15"),
      moveTo: "Production",
      requester: "Tax Department",
      documentTestCaseChecked: YesNoNa.Yes,
      documentCheckedBy: "Manoj",
      documentCheckedDate: new Date("2024-02-13"),
      documentUpdated: YesNoNa.Yes,
      programOrConfigurationVerified: YesNoNa.Yes,
      status: "Closed",
    },
    {
      year: "2024",
      serialNumber: "2024-003",
      typeOfRequest: "Enhancement",
      requestNumber: "REQ-003",
      requestDescription: "Enhance purchase order approval workflow",
      developmentTaskOrReportName: "ZMM_PO_APPROVAL",
      tCode: "ME21N",
      programName: "ZMM_PO_WORKFLOW",
      trNumber: "DEVK900003",
      trCreatedBy: "Manoj",
      trCreationDate: new Date("2024-03-05"),
      moveTo: "Quality",
      requester: "Procurement",
      documentTestCaseChecked: YesNoNa.No,
      documentUpdated: YesNoNa.No,
      programOrConfigurationVerified: YesNoNa.No,
      status: "In Progress",
      remarks: "Waiting for UAT sign-off",
    },
    {
      year: "2024",
      serialNumber: "2024-004",
      typeOfRequest: "Bug Fix",
      requestNumber: "REQ-004",
      requestDescription: "Fix incorrect calculation in payroll deduction program",
      programName: "ZHR_PAYROLL_DEDUCT",
      tCode: "SE38",
      trNumber: "DEVK900004",
      trCreatedBy: "Lokesh",
      trCreationDate: new Date("2024-04-01"),
      trMovedBy: TrMovedBy.Lokesh,
      trMovedDate: new Date("2024-04-03"),
      moveTo: "Production",
      requester: "HR Department",
      documentTestCaseChecked: YesNoNa.Yes,
      documentCheckedBy: "Lokesh",
      documentCheckedDate: new Date("2024-04-02"),
      documentUpdated: YesNoNa.Yes,
      programOrConfigurationVerified: YesNoNa.Yes,
      status: "Closed",
    },
    {
      year: "2025",
      serialNumber: "2025-001",
      typeOfRequest: "Development",
      requestNumber: "REQ-005",
      requestDescription: "New customer aging report for AR module",
      developmentTaskOrReportName: "ZRPT_AR_AGING",
      tCode: "SE38",
      programName: "ZRPT_AR_AGING",
      trCreatedBy: "Manoj",
      trCreationDate: new Date("2025-01-10"),
      requester: "Finance",
      documentTestCaseChecked: YesNoNa.No,
      status: "Open",
    },
    {
      year: "2025",
      serialNumber: "2025-002",
      typeOfRequest: "Configuration",
      requestDescription: "Update material ledger settings for new plant",
      tCode: "OMX1",
      trCreatedBy: "Lokesh",
      trCreationDate: new Date("2025-02-20"),
      requester: "Plant Operations",
      status: "Pending",
      remarks: "Awaiting plant code assignment from IT",
    },
  ];

  for (const r of sampleRecords) {
    await prisma.changeRecord.create({ data: r });
  }

  console.log(`✅ Seeded ${sampleRecords.length} sample change records`);

  const sampleTransports = [
    {
      trNumber: "DEVK900101",
      description: "Vendor aging report moved for QA validation",
      owner: "Manoj",
      requestType: "Workbench",
      requestStatus: "Released",
      developmentClass: "ZFI_REPORTS",
      targetSystem: "QAS",
      sourceSystem: "DEV",
      sourceClient: "100",
      qaStatus: TransportStageStatus.QA_IMPORTED,
      qaImportedAt: new Date("2026-03-15T10:30:00Z"),
      prodStatus: TransportStageStatus.UNKNOWN,
      prodApprovalStatus: TransportApprovalStatus.NOT_REQUESTED,
      lastAction: "SYNC",
      lastSyncedAt: new Date("2026-03-27T08:30:00Z"),
    },
    {
      trNumber: "DEVK900102",
      description: "Material master enhancement waiting for production approval",
      owner: "Lokesh",
      requestType: "Workbench",
      requestStatus: "Released",
      developmentClass: "ZMM_ENH",
      targetSystem: "PRD",
      sourceSystem: "DEV",
      sourceClient: "100",
      qaStatus: TransportStageStatus.QA_IMPORTED,
      qaImportedAt: new Date("2026-03-20T09:15:00Z"),
      prodStatus: TransportStageStatus.UNKNOWN,
      prodApprovalStatus: TransportApprovalStatus.PENDING,
      prodApprovalRequestedAt: new Date("2026-03-27T09:30:00Z"),
      prodApprovalRequestedBy: "PCMS Demo User",
      prodApprovalEmailSentAt: new Date("2026-03-27T09:31:00Z"),
      lastAction: "REQUEST_PROD_APPROVAL",
      lastSyncedAt: new Date("2026-03-27T09:31:00Z"),
    },
    {
      trNumber: "DEVK900103",
      description: "Plant configuration approved and ready for production import",
      owner: "Himanshu",
      requestType: "Customizing",
      requestStatus: "Released",
      developmentClass: "ZPP_CFG",
      targetSystem: "PRD",
      sourceSystem: "DEV",
      sourceClient: "100",
      qaStatus: TransportStageStatus.QA_IMPORTED,
      qaImportedAt: new Date("2026-03-24T12:00:00Z"),
      prodStatus: TransportStageStatus.UNKNOWN,
      prodApprovalStatus: TransportApprovalStatus.APPROVED,
      prodApprovalRequestedAt: new Date("2026-03-26T11:00:00Z"),
      prodApprovalRequestedBy: "PCMS Demo User",
      prodApprovalDecisionAt: new Date("2026-03-26T15:00:00Z"),
      prodApprovalDecisionBy: "hsudra@gulbrandsen.com",
      prodApprovalEmailSentAt: new Date("2026-03-26T11:01:00Z"),
      lastAction: "PROD_APPROVED",
      lastSyncedAt: new Date("2026-03-26T15:00:00Z"),
    },
  ];

  for (const transport of sampleTransports) {
    await prisma.transportRequest.upsert({
      where: { trNumber: transport.trNumber },
      update: transport,
      create: transport,
    });
  }

  console.log(`✅ Seeded ${sampleTransports.length} sample transport requests`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
