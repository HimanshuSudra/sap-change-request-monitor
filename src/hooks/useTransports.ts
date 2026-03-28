"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ApiSuccess,
  TransportApprovalResult,
  TransportListResponse,
  TransportMoveResult,
  TransportSyncResult,
} from "@/types";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message ?? json.error ?? "API error");
  }

  return (json as ApiSuccess<T>).data;
}

export const transportKeys = {
  all: ["transports"] as const,
  dashboard: ["transports", "dashboard"] as const,
};

export function useTransports() {
  return useQuery({
    queryKey: transportKeys.dashboard,
    queryFn: () => apiFetch<TransportListResponse>("/api/transports"),
    staleTime: 30_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
}

export function useSyncTransports() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<TransportSyncResult>("/api/transports/sync", {
        method: "POST",
      }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: transportKeys.all });
      toast.success(`Synced ${result.synced} transport request(s)`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Transport sync failed");
    },
  });
}

export function useMoveTransport(target: "QA" | "PROD") {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (trNumber: string) =>
      apiFetch<TransportMoveResult>(
        `/api/transports/${encodeURIComponent(trNumber)}/${target === "QA" ? "move-to-qa" : "move-to-prod"}`,
        { method: "POST" }
      ),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: transportKeys.all });
      toast.success(result.message);
    },
    onError: (err: Error) => {
      toast.error(err.message || `Move to ${target} failed`);
    },
  });
}

export function useRequestProdApproval() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (trNumber: string) =>
      apiFetch<TransportApprovalResult>(
        `/api/transports/${encodeURIComponent(trNumber)}/request-prod-approval`,
        { method: "POST" }
      ),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: transportKeys.all });
      toast.success(result.message);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not request production approval");
    },
  });
}

export function useReviewProdApproval(decision: "APPROVE" | "DECLINE") {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (trNumber: string) =>
      apiFetch<TransportApprovalResult>(
        `/api/transports/${encodeURIComponent(trNumber)}/${decision === "APPROVE" ? "approve-prod" : "decline-prod"}`,
        { method: "POST" }
      ),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: transportKeys.all });
      toast.success(result.message);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not update production approval");
    },
  });
}
