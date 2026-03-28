"use client";

import { useMemo, useState } from "react";
import { CheckCheck, MailPlus, RefreshCcw, Rocket, Search, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import {
  useMoveTransport,
  useRequestProdApproval,
  useReviewProdApproval,
  useSyncTransports,
  useTransports,
} from "@/hooks/useTransports";
import { fmtDate, truncate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function humanizeStatus(value: string | null | undefined): string {
  if (!value) return "Unknown";
  return value.replaceAll("_", " ");
}

export function TransportsView() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useTransports();
  const syncMutation = useSyncTransports();
  const moveQaMutation = useMoveTransport("QA");
  const moveProdMutation = useMoveTransport("PROD");
  const requestApprovalMutation = useRequestProdApproval();
  const approveProdMutation = useReviewProdApproval("APPROVE");
  const declineProdMutation = useReviewProdApproval("DECLINE");

  const transports = data?.transports ?? [];
  const recentActions = data?.recentActions ?? [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return transports;

    return transports.filter((transport) =>
      [
        transport.trNumber,
        transport.description,
        transport.owner,
        transport.requestStatus,
        transport.targetSystem,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [search, transports]);

  const queuedQa = transports.filter((item) => item.qaStatus === "QA_QUEUE").length;
  const importedQa = transports.filter((item) => item.qaStatus === "QA_IMPORTED").length;
  const queuedProd = transports.filter((item) => item.prodStatus === "PROD_QUEUE").length;
  const importedProd = transports.filter((item) => item.prodStatus === "PROD_IMPORTED").length;

  return (
    <div className="page-reveal space-y-6">
      <section className="glass-panel theme-spotlight rounded-[2rem] border-white/50 px-6 py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
              SAP Transport Control
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Move transports with a clearer
                <span className="theme-gradient-text"> release lane</span>.
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                This screen is wired for SAP 2021-compatible monitoring first. It can run in mock mode today and switch to your SAP OData and action endpoints when those are ready.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              <RefreshCcw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
              Sync SAP
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-panel stagger-in rounded-[1.5rem] border-white/50 bg-white/75">
          <CardHeader className="pb-2">
            <CardDescription>QA Queue</CardDescription>
            <CardTitle className="text-3xl">{queuedQa}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Transport requests waiting to enter or finish QA.</CardContent>
        </Card>
        <Card className="glass-panel stagger-in rounded-[1.5rem] border-white/50 bg-white/75" style={{ animationDelay: "80ms" }}>
          <CardHeader className="pb-2">
            <CardDescription>QA Imported</CardDescription>
            <CardTitle className="text-3xl">{importedQa}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Requests already confirmed in the QA landscape.</CardContent>
        </Card>
        <Card className="glass-panel stagger-in rounded-[1.5rem] border-white/50 bg-white/75" style={{ animationDelay: "160ms" }}>
          <CardHeader className="pb-2">
            <CardDescription>Prod Queue</CardDescription>
            <CardTitle className="text-3xl">{queuedProd}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Requests staged for production import approval.</CardContent>
        </Card>
        <Card className="glass-panel stagger-in rounded-[1.5rem] border-white/50 bg-white/75" style={{ animationDelay: "240ms" }}>
          <CardHeader className="pb-2">
            <CardDescription>Prod Imported</CardDescription>
            <CardTitle className="text-3xl">{importedProd}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Requests that have completed the production hop.</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_0.9fr]">
        <Card className="glass-panel stagger-in rounded-[1.75rem] border-white/50 bg-white/75" style={{ animationDelay: "320ms" }}>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Transport Requests</CardTitle>
                <CardDescription>Move controls stay server-side and audit every action.</CardDescription>
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search TR, owner, description..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    <th className="px-3 py-3">TR</th>
                    <th className="px-3 py-3">Description</th>
                    <th className="px-3 py-3">Owner</th>
                    <th className="px-3 py-3">QA</th>
                    <th className="px-3 py-3">Prod</th>
                    <th className="px-3 py-3">Approval</th>
                    <th className="px-3 py-3">Last Sync</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index} className="border-b border-border/60">
                        {Array.from({ length: 8 }).map((__, column) => (
                          <td key={column} className="px-3 py-4">
                            <div className="h-3 animate-pulse rounded bg-muted" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                        No transport requests found yet. Run a sync after configuring the SAP endpoint, or keep mock mode on to test the flow.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((transport) => (
                      <tr key={transport.id} className="border-b border-border/60 align-top">
                        <td className="px-3 py-4">
                          <div className="font-mono text-xs text-slate-900">{transport.trNumber}</div>
                          <div className="mt-1 text-[11px] text-slate-500">{transport.requestStatus ?? "Unknown status"}</div>
                        </td>
                        <td className="px-3 py-4 text-xs text-slate-700" title={transport.description ?? ""}>
                          {truncate(transport.description ?? "No description available", 70)}
                        </td>
                        <td className="px-3 py-4 text-xs text-slate-700">
                          <div>{transport.owner ?? "—"}</div>
                          <div className="mt-1 text-[11px] text-slate-500">{transport.targetSystem ?? "No target"}</div>
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge value={humanizeStatus(transport.qaStatus)} />
                          <div className="mt-2 text-[11px] text-slate-500">{fmtDate(transport.qaImportedAt)}</div>
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge value={humanizeStatus(transport.prodStatus)} />
                          <div className="mt-2 text-[11px] text-slate-500">{fmtDate(transport.prodImportedAt)}</div>
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge value={humanizeStatus(transport.prodApprovalStatus)} />
                          <div className="mt-2 text-[11px] text-slate-500">
                            {transport.prodApprovalRequestedAt
                              ? `Requested ${fmtDate(transport.prodApprovalRequestedAt)}`
                              : "No approval requested"}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-[11px] text-slate-500">
                          {fmtDate(transport.lastSyncedAt)}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-xs"
                              onClick={() => moveQaMutation.mutate(transport.trNumber)}
                              disabled={moveQaMutation.isPending}
                            >
                              <UploadCloud className="h-3.5 w-3.5" />
                              Move to QA
                            </Button>
                            {transport.prodApprovalStatus === "NOT_REQUESTED" || transport.prodApprovalStatus === "DECLINED" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-xs"
                                onClick={() => requestApprovalMutation.mutate(transport.trNumber)}
                                disabled={requestApprovalMutation.isPending}
                              >
                                <MailPlus className="h-3.5 w-3.5" />
                                Request Approval
                              </Button>
                            ) : null}
                            {transport.prodApprovalStatus === "PENDING" ? (
                              <>
                                <Button
                                  size="sm"
                                  className="gap-1 text-xs"
                                  onClick={() => approveProdMutation.mutate(transport.trNumber)}
                                  disabled={approveProdMutation.isPending}
                                >
                                  <CheckCheck className="h-3.5 w-3.5" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-xs"
                                  onClick={() => declineProdMutation.mutate(transport.trNumber)}
                                  disabled={declineProdMutation.isPending}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Decline
                                </Button>
                              </>
                            ) : null}
                            <Button
                              size="sm"
                              className="gap-1 text-xs"
                              onClick={() => moveProdMutation.mutate(transport.trNumber)}
                              disabled={moveProdMutation.isPending || transport.prodApprovalStatus !== "APPROVED"}
                            >
                              <Rocket className="h-3.5 w-3.5" />
                              Import to Prod
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel stagger-in rounded-[1.75rem] border-white/50 bg-white/75" style={{ animationDelay: "420ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Recent Action Log
            </CardTitle>
            <CardDescription>Every sync and movement request is captured for audit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActions.length === 0 ? (
              <p className="text-sm text-slate-500">No transport actions recorded yet.</p>
            ) : (
              recentActions.map((action) => (
                <div key={action.id} className="rounded-2xl border border-border/70 bg-white/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs text-slate-900">{action.trNumber}</div>
                      <div className="mt-1 text-xs text-slate-600">{action.actionType.replaceAll("_", " ")}</div>
                    </div>
                    <StatusBadge value={action.actionStatus} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{action.message ?? "No message recorded"}</p>
                  <div className="mt-2 text-[11px] text-slate-400">{fmtDate(action.createdAt)}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
