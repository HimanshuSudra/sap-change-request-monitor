"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ApiSuccess,
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
