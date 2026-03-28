// src/app/records/[id]/edit/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useRecord } from "@/hooks/useRecords";
import { RecordForm } from "@/components/records/RecordForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditRecordPage() {
  const params = useParams<{ id: string }>();
  const { data: record, isLoading, error } = useRecord(params.id);

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-9 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">Record not found</p>
          <p className="text-xs text-slate-400 mt-1">
            The record you are trying to edit does not exist.
          </p>
        </div>
      </div>
    );
  }

  return <RecordForm mode="edit" record={record} />;
}
