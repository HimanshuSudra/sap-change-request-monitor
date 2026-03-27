// src/components/records/DeleteConfirmDialog.tsx
"use client";

import { ChangeRecordDto } from "@/types";
import { truncate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface Props {
  record: ChangeRecordDto | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteConfirmDialog({ record, onClose, onConfirm, isDeleting }: Props) {
  if (!record) return null;

  const label = record.requestDescription
    ? `"${truncate(record.requestDescription, 60)}"`
    : `Record #${record.serialNumber || record.id.slice(0, 8)}`;

  return (
    <AlertDialog open={!!record} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirm Deletion
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                You are about to permanently delete{" "}
                <strong className="text-slate-900">{label}</strong>.
              </p>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> This record will be permanently removed and cannot
                  be recovered.
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(record.id)}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? "Deleting…" : "Delete Permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
