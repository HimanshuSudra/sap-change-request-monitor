// src/hooks/useRecords.ts
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  ChangeRecordDto,
  ChangeRecordFormData,
  RecordListParams,
  ApiSuccess,
} from "@/types";
import toast from "react-hot-toast";

// ── Fetcher helpers ───────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? json.error ?? "API error");
  }
  return (json as ApiSuccess<T>).data;
}

function buildQueryString(params: RecordListParams): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) qs.set(k, String(v));
  });
  return qs.toString() ? `?${qs.toString()}` : "";
}

// ── Query keys ────────────────────────────────────────────────────

export const recordKeys = {
  all: ["records"] as const,
  list: (params: RecordListParams) => ["records", "list", params] as const,
  detail: (id: string) => ["records", "detail", id] as const,
  dashboard: ["dashboard"] as const,
  charts: (year?: string) => ["charts", year ?? "all"] as const,
  filterOptions: ["filterOptions"] as const,
};

// ── Queries ───────────────────────────────────────────────────────

export function useRecords(params: RecordListParams = {}) {
  return useQuery({
    queryKey: recordKeys.list(params),
    queryFn: () =>
      apiFetch<{ records: ChangeRecordDto[]; total: number }>(
        `/api/records${buildQueryString(params)}`
      ),
    staleTime: 30_000,
  });
}

export function useRecord(id: string, options?: Partial<UseQueryOptions<ChangeRecordDto>>) {
  return useQuery({
    queryKey: recordKeys.detail(id),
    queryFn: () => apiFetch<ChangeRecordDto>(`/api/records/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: recordKeys.dashboard,
    queryFn: () =>
      apiFetch<import("@/types").DashboardStats>("/api/dashboard"),
    staleTime: 60_000,
    refetchInterval: 45_000,
    refetchOnWindowFocus: true,
  });
}

export function useChartData(year?: string) {
  return useQuery({
    queryKey: recordKeys.charts(year),
    queryFn: () =>
      apiFetch<import("@/types").ChartData>(
        `/api/charts${year ? `?year=${year}` : ""}`
      ),
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: recordKeys.filterOptions,
    queryFn: () =>
      apiFetch<import("@/types").FilterOptions>("/api/filter-options"),
    staleTime: 5 * 60_000, // 5 min — options don't change often
  });
}

// ── Mutations ─────────────────────────────────────────────────────

export function useCreateRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ChangeRecordFormData) =>
      apiFetch<ChangeRecordDto>("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recordKeys.all });
      qc.invalidateQueries({ queryKey: recordKeys.dashboard });
      qc.invalidateQueries({ queryKey: ["charts"] });
      toast.success("Record created successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create record");
    },
  });
}

export function useUpdateRecord(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ChangeRecordFormData>) =>
      apiFetch<ChangeRecordDto>(`/api/records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (updated) => {
      qc.setQueryData(recordKeys.detail(id), updated);
      qc.invalidateQueries({ queryKey: recordKeys.all });
      qc.invalidateQueries({ queryKey: recordKeys.dashboard });
      qc.invalidateQueries({ queryKey: ["charts"] });
      toast.success("Record updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update record");
    },
  });
}

export function useDeleteRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<null>(`/api/records/${id}`, { method: "DELETE" }),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: recordKeys.detail(id) });
      qc.invalidateQueries({ queryKey: recordKeys.all });
      qc.invalidateQueries({ queryKey: recordKeys.dashboard });
      qc.invalidateQueries({ queryKey: ["charts"] });
      toast.success("Record deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete record");
    },
  });
}

// ── Mojo autofill ─────────────────────────────────────────────────

export function useMojoFetch() {
  return useMutation({
    mutationFn: (requestNumber: string) =>
      apiFetch<import("@/types").MojoDetails>(
        `/api/mojo/${encodeURIComponent(requestNumber)}`
      ),
    onError: (err: Error) => {
      toast.error(err.message || "Could not fetch Mojo details");
    },
  });
}
