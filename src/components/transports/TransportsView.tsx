"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCheck,
  MailPlus,
  RefreshCcw,
  Rocket,
  Search,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
import {
  useMoveTransport,
  useRequestProdApproval,
  useReviewProdApproval,
  useSyncTransports,
  useTransports,
} from "@/hooks/useTransports";
import { clearPointerGlow, fmtDate, trackPointerGlow, truncate } from "@/lib/utils";
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

  const summary = useMemo(() => {
    const queuedQa = transports.filter((item) => item.qaStatus === "QA_QUEUE").length;
    const importedQa = transports.filter((item) => item.qaStatus === "QA_IMPORTED").length;
    const queuedProd = transports.filter((item) => item.prodStatus === "PROD_QUEUE").length;
    const importedProd = transports.filter((item) => item.prodStatus === "PROD_IMPORTED").length;
    const pendingApproval = transports.filter((item) => item.prodApprovalStatus === "PENDING").length;
    const approved = transports.filter((item) => item.prodApprovalStatus === "APPROVED").length;

    return { queuedQa, importedQa, queuedProd, importedProd, pendingApproval, approved };
  }, [transports]);

  return (
    <div className="page-reveal space-y-8">
      <section
        className="magnetic-surface glass-panel interactive-spotlight theme-spotlight rounded-[2.5rem] border-white/50 px-8 py-10 md:px-10 md:py-12"
        onPointerMove={trackPointerGlow}
        onPointerLeave={clearPointerGlow}
      >
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="magnetic-child space-y-5">
            <div className="hero-badge inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              SAP Transport Operations
            </div>
            <div className="space-y-4">
              <h2 className="theme-heading font-display text-4xl font-semibold tracking-tight md:text-[4rem] md:leading-[0.98]">
                Run DEV to QA to PROD from one
                <span className="theme-gradient-text"> governed release lane</span>.
              </h2>
              <p className="theme-body max-w-3xl text-base leading-8 md:text-lg">
                The TRMS board is tuned for SAP transport movement, approval gating, and live status verification so release managers can work in one wide surface instead of bouncing between logs and side panels.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="h-11 gap-2 px-4 text-sm"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                <RefreshCcw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                Sync SAP Landscape
              </Button>
              <div className="surface-dim flex h-11 items-center gap-2 rounded-2xl px-4 text-sm theme-body">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Auto-refresh every 20 seconds
              </div>
            </div>
          </div>

          <div className="magnetic-child grid gap-4 sm:grid-cols-2">
            <div className="surface-dim rounded-[1.8rem] p-5">
              <div className="section-label">QA lane</div>
              <div className="theme-heading mt-3 text-4xl font-semibold">{summary.importedQa}</div>
              <div className="theme-body mt-2 text-sm leading-6">Imported to QA and cleared for downstream review.</div>
              <div className="ops-divider mt-5 flex items-center justify-between border-t pt-4 text-sm">
                <span className="theme-subtle">Queued</span>
                <span className="theme-heading font-semibold">{summary.queuedQa}</span>
              </div>
            </div>
            <div className="surface-dim rounded-[1.8rem] p-5">
              <div className="section-label">Production lane</div>
              <div className="theme-heading mt-3 text-4xl font-semibold">{summary.importedProd}</div>
              <div className="theme-body mt-2 text-sm leading-6">Requests already landed in production.</div>
              <div className="ops-divider mt-5 flex items-center justify-between border-t pt-4 text-sm">
                <span className="theme-subtle">Queued</span>
                <span className="theme-heading font-semibold">{summary.queuedProd}</span>
              </div>
            </div>
            <div className="surface-dim rounded-[1.8rem] p-5">
              <div className="section-label">Pending approval</div>
              <div className="theme-heading mt-3 text-4xl font-semibold">{summary.pendingApproval}</div>
              <div className="theme-body mt-2 text-sm leading-6">Requests waiting for production sign-off.</div>
            </div>
            <div className="surface-dim rounded-[1.8rem] p-5">
              <div className="section-label">Approved</div>
              <div className="theme-heading mt-3 text-4xl font-semibold">{summary.approved}</div>
              <div className="theme-body mt-2 text-sm leading-6">Requests clear for production import.</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
        {[
          { label: "QA queue", value: summary.queuedQa, note: "Ready to enter or complete QA" },
          { label: "QA imported", value: summary.importedQa, note: "Validated inside the QA landscape" },
          { label: "Prod queue", value: summary.queuedProd, note: "Staged for production import" },
          { label: "Prod imported", value: summary.importedProd, note: "Completed the production hop" },
        ].map((card) => (
          <Card key={card.label} className="glass-panel metric-card rounded-[2rem] border-white/50 bg-white/75">
            <CardContent className="p-6">
              <div className="section-label">{card.label}</div>
              <div className="theme-heading mt-4 text-5xl font-semibold">{card.value}</div>
              <div className="theme-body mt-3 text-sm leading-6">{card.note}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-panel rounded-[2.1rem] border-white/50 bg-white/75">
        <CardHeader className="space-y-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <CardTitle className="text-lg">Transport Release Board</CardTitle>
              <CardDescription className="text-sm">Full-width operational table for queue movement, approvals, and import execution.</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:max-w-sm">
                <Search className="theme-subtle pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search TR, owner, description..."
                  className="h-11 rounded-2xl pl-10 pr-4 text-sm"
                />
              </div>
              <div className="surface-dim flex h-11 items-center gap-2 rounded-2xl px-4 text-sm theme-body">
                <ArrowRight className="h-4 w-4 text-cyan-300" />
                {filtered.length} visible request{filtered.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-sm">
              <thead className="border-b border-border">
                <tr className="theme-subtle text-left text-[11px] font-semibold uppercase tracking-[0.24em]">
                  <th className="px-4 py-4">TR</th>
                  <th className="px-4 py-4">Description</th>
                  <th className="px-4 py-4">Owner</th>
                  <th className="px-4 py-4">QA status</th>
                  <th className="px-4 py-4">Prod status</th>
                  <th className="px-4 py-4">Approval</th>
                  <th className="px-4 py-4">Last sync</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-border/60">
                      {Array.from({ length: 8 }).map((__, column) => (
                        <td key={column} className="px-4 py-5">
                          <div className="h-4 animate-pulse rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="theme-body px-6 py-16 text-center text-base">
                      No transport requests match the current filter. Sync SAP or widen the search criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((transport) => (
                    <tr key={transport.id} className="table-row-motion border-b border-border/60 align-top">
                      <td className="px-4 py-5">
                        <div className="theme-heading font-mono text-sm">{transport.trNumber}</div>
                        <div className="theme-body mt-1 text-xs">{transport.requestStatus ?? "Unknown status"}</div>
                      </td>
                      <td className="theme-body px-4 py-5 text-sm leading-6" title={transport.description ?? ""}>
                        {truncate(transport.description ?? "No description available", 88)}
                      </td>
                      <td className="theme-body px-4 py-5 text-sm">
                        <div>{transport.owner ?? "—"}</div>
                        <div className="theme-subtle mt-1 text-xs">{transport.targetSystem ?? "No target"}</div>
                      </td>
                      <td className="px-4 py-5">
                        <StatusBadge value={humanizeStatus(transport.qaStatus)} />
                        <div className="theme-subtle mt-2 text-xs">{fmtDate(transport.qaImportedAt)}</div>
                      </td>
                      <td className="px-4 py-5">
                        <StatusBadge value={humanizeStatus(transport.prodStatus)} />
                        <div className="theme-subtle mt-2 text-xs">{fmtDate(transport.prodImportedAt)}</div>
                      </td>
                      <td className="px-4 py-5">
                        <StatusBadge value={humanizeStatus(transport.prodApprovalStatus)} />
                        <div className="theme-subtle mt-2 text-xs leading-5">
                          {transport.prodApprovalRequestedAt
                            ? `Requested ${fmtDate(transport.prodApprovalRequestedAt)}`
                            : "No approval requested"}
                        </div>
                      </td>
                      <td className="theme-subtle px-4 py-5 text-xs">{fmtDate(transport.lastSyncedAt)}</td>
                      <td className="px-4 py-5">
                        <div className="flex min-w-[19rem] flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 gap-1.5 rounded-xl px-3 text-xs"
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
                              className="h-9 gap-1.5 rounded-xl px-3 text-xs"
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
                                className="h-9 gap-1.5 rounded-xl px-3 text-xs"
                                onClick={() => approveProdMutation.mutate(transport.trNumber)}
                                disabled={approveProdMutation.isPending}
                              >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 gap-1.5 rounded-xl px-3 text-xs"
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
                            className="h-9 gap-1.5 rounded-xl px-3 text-xs"
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
    </div>
  );
}
