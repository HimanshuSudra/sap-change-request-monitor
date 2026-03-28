// src/components/records/RecordsView.tsx
"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { useRecords, useDeleteRecord, useFilterOptions } from "@/hooks/useRecords";
import { ChangeRecordDto } from "@/types";
import { fmtDate, truncate, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RecordDetailSheet } from "./RecordDetailSheet";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import {
  Plus, Download, Search, X, ChevronUp, ChevronDown,
  ChevronsUpDown, Eye, Pencil, Trash2, FileX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const ALL_FILTER_VALUE = "__all__";

// ── Column Definitions ────────────────────────────────────────────

function buildColumns(
  onView: (r: ChangeRecordDto) => void,
  onEdit: (id: string) => void,
  onDelete: (r: ChangeRecordDto) => void
): ColumnDef<ChangeRecordDto>[] {
  return [
    {
      accessorKey: "serialNumber",
      header: "Serial #",
      size: 90,
      cell: ({ getValue }) => (
        <span className="theme-text-muted text-xs">{getValue() as string || "—"}</span>
      ),
    },
    {
      accessorKey: "year",
      header: "Year",
      size: 70,
      cell: ({ getValue }) => (
        <span className="theme-text-muted text-xs font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "typeOfRequest",
      header: "Type",
      size: 130,
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return v ? <StatusBadge value={v} /> : <span className="theme-text-faint">—</span>;
      },
    },
    {
      accessorKey: "requestNumber",
      header: "Req #",
      size: 90,
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return v ? (
          <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono text-foreground">
            {v}
          </code>
        ) : (
          <span className="theme-text-faint">—</span>
        );
      },
    },
    {
      accessorKey: "requestDescription",
      header: "Description",
      size: 220,
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return (
          <span className="text-xs text-foreground" title={v}>
            {truncate(v, 60)}
          </span>
        );
      },
    },
    {
      accessorKey: "programName",
      header: "Program",
      size: 130,
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return v ? (
          <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono theme-text-muted">
            {v}
          </code>
        ) : (
          <span className="theme-text-faint">—</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return v ? <StatusBadge value={v} /> : <span className="theme-text-faint">—</span>;
      },
    },
    {
      accessorKey: "requester",
      header: "Requester",
      size: 110,
      cell: ({ getValue }) => (
        <span className="theme-text-muted text-xs">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "trNumber",
      header: "TR #",
      size: 130,
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return v ? (
          <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono theme-text-muted">
            {v}
          </code>
        ) : (
          <span className="theme-text-faint">—</span>
        );
      },
    },
    {
      accessorKey: "trMovedBy",
      header: "Moved By",
      size: 95,
      cell: ({ getValue }) => (
        <span className="theme-text-muted text-xs">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "trMovedDate",
      header: "Moved Date",
      size: 110,
      cell: ({ getValue }) => (
        <span className="theme-text-muted text-xs">{fmtDate(getValue() as string)}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 100,
      enableSorting: false,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => onView(r)}
              title="View"
              className="theme-text-soft rounded p-1 transition-colors hover:bg-accent hover:text-primary"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onEdit(r.id)}
              title="Edit"
              className="theme-text-soft rounded p-1 transition-colors hover:bg-accent hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(r)}
              title="Delete"
              className="theme-text-soft rounded p-1 transition-colors hover:bg-red-500/10 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];
}

// ── Main Component ────────────────────────────────────────────────

export function RecordsView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL params for initial filter state
  const initialStatus = searchParams.get("status") ?? "";
  const initialType = searchParams.get("typeOfRequest") ?? "";
  const initialYear = searchParams.get("year") ?? "";
  const initialSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [yearFilter, setYearFilter] = useState(initialYear);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [viewRecord, setViewRecord] = useState<ChangeRecordDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChangeRecordDto | null>(null);

  const { data, isLoading } = useRecords({});
  const { data: filterOptions } = useFilterOptions();
  const deleteMutation = useDeleteRecord();

  const allRecords = data?.records ?? [];

  // Client-side filtering (all records already in memory)
  const filtered = useMemo(
    () =>
      allRecords.filter((r) => {
        if (statusFilter && r.status !== statusFilter) return false;
        if (typeFilter && r.typeOfRequest !== typeFilter) return false;
        if (yearFilter && r.year !== yearFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return Object.values(r).some((v) => v && String(v).toLowerCase().includes(q));
        }
        return true;
      }),
    [allRecords, search, statusFilter, typeFilter, yearFilter]
  );

  const columns = useMemo(
    () =>
      buildColumns(
        setViewRecord,
        (id) => router.push(`/records/${id}/edit`),
        setDeleteTarget
      ),
    [router]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  // Active filter chips
  const activeFilters = [
    ...(statusFilter ? [{ label: `Status: ${statusFilter}`, clear: () => setStatusFilter("") }] : []),
    ...(typeFilter ? [{ label: `Type: ${typeFilter}`, clear: () => setTypeFilter("") }] : []),
    ...(yearFilter ? [{ label: `Year: ${yearFilter}`, clear: () => setYearFilter("") }] : []),
    ...(search ? [{ label: `Search: "${search}"`, clear: () => setSearch("") }] : []),
  ];

  function clearAllFilters() {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setYearFilter("");
  }

  function exportCSV() {
    if (!filtered.length) return;
    const keys = Object.keys(filtered[0]) as (keyof ChangeRecordDto)[];
    const lines = [
      keys.join(","),
      ...filtered.map((r) =>
        keys
          .map((k) => {
            const v = String(r[k] ?? "");
            return v.includes(",") || v.includes('"') || v.includes("\n")
              ? `"${v.replace(/"/g, '""')}"`
              : v;
          })
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pcms-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const years = filterOptions?.years ?? [];
  const statuses = filterOptions?.status ?? [];
  const types = filterOptions?.typeOfRequest ?? [];

  // Pagination info
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = filtered.length;
  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <>
      {/* ── Toolbar ───────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="theme-text-soft pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all fields…"
            className="pl-8 h-9 text-xs"
          />
        </div>

        {/* Status filter */}
        <Select
          value={statusFilter || ALL_FILTER_VALUE}
          onValueChange={(value) => setStatusFilter(value === ALL_FILTER_VALUE ? "" : value)}
        >
          <SelectTrigger className="h-9 w-36 text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select
          value={typeFilter || ALL_FILTER_VALUE}
          onValueChange={(value) => setTypeFilter(value === ALL_FILTER_VALUE ? "" : value)}
        >
          <SelectTrigger className="h-9 w-40 text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>All Types</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year filter */}
        <Select
          value={yearFilter || ALL_FILTER_VALUE}
          onValueChange={(value) => setYearFilter(value === ALL_FILTER_VALUE ? "" : value)}
        >
          <SelectTrigger className="h-9 w-28 text-xs">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <span className="theme-text-muted hidden text-xs sm:block">
            {totalRows.toLocaleString()} record{totalRows !== 1 ? "s" : ""}
          </span>
          <Button variant="outline" size="sm" onClick={exportCSV} className="h-9 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button asChild size="sm" className="h-9 gap-1.5 text-xs">
            <Link href="/records/new">
              <Plus className="h-3.5 w-3.5" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Active filter chips ────────────────────────── */}
      {activeFilters.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {activeFilters.map((f, i) => (
            <button
              key={i}
              onClick={f.clear}
              className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/15"
            >
              {f.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            onClick={clearAllFilters}
            className="theme-text-soft text-[11px] underline hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────── */}
      <div className="surface-panel overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="theme-table-header border-b border-border">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        style={{ minWidth: header.column.getSize() }}
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "theme-text-muted px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap",
                          header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="theme-text-faint">
                              {sorted === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-blue-500" />
                              ) : sorted === "desc" ? (
                                <ChevronDown className="h-3 w-3 text-blue-500" />
                              ) : (
                                <ChevronsUpDown className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60">
                    {columns.map((_, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-3 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileX className="theme-text-faint h-10 w-10" />
                      <p className="theme-text-muted text-sm font-medium">No records found</p>
                      <p className="theme-text-soft text-xs">
                        Try adjusting your filters, or{" "}
                        <Link href="/records/new" className="text-blue-500 hover:underline">
                          create a new request
                        </Link>
                      </p>
                      {activeFilters.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-2 text-xs h-8">
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setViewRecord(row.original)}
                    className="theme-hover-surface cursor-pointer border-b border-border/60 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-2.5"
                        onClick={
                          cell.column.id === "actions"
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────── */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="theme-text-muted text-xs">
              Showing {start.toLocaleString()}–{end.toLocaleString()} of{" "}
              {totalRows.toLocaleString()}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-7 w-7 p-0 text-xs"
              >
                ‹
              </Button>

              {Array.from({ length: Math.min(table.getPageCount(), 7) }, (_, i) => {
                const total = table.getPageCount();
                const cur = pageIndex;
                // Windowed page numbers
                let page: number | "…";
                if (total <= 7) {
                  page = i;
                } else if (i === 0) page = 0;
                else if (i === 6) page = total - 1;
                else {
                  const mid = Math.min(Math.max(cur, 2), total - 3);
                  page = mid - 2 + i;
                  if (page < 0 || page >= total) page = "…" as any;
                }
                if (page === "…")
                  return (
                    <span key={i} className="theme-text-soft px-1 text-xs">
                      …
                    </span>
                  );
                return (
                  <Button
                    key={i}
                    variant={page === pageIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => table.setPageIndex(page as number)}
                    className="h-7 w-7 p-0 text-xs"
                  >
                    {(page as number) + 1}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-7 w-7 p-0 text-xs"
              >
                ›
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Record detail sheet ─────────────────────── */}
      <RecordDetailSheet
        record={viewRecord}
        onClose={() => setViewRecord(null)}
        onEdit={(id) => {
          setViewRecord(null);
          router.push(`/records/${id}/edit`);
        }}
        onDelete={(r) => {
          setViewRecord(null);
          setDeleteTarget(r);
        }}
      />

      {/* ── Delete confirm dialog ──────────────────── */}
      <DeleteConfirmDialog
        record={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async (id) => {
          await deleteMutation.mutateAsync(id);
          setDeleteTarget(null);
        }}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
