// src/components/records/RecordDetailSheet.tsx
"use client";

import { ChangeRecordDto } from "@/types";
import { fmtDate, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

interface Props {
  record: ChangeRecordDto | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (r: ChangeRecordDto) => void;
}

function Field({
  label,
  value,
  mono,
  link,
  badge,
  className,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  link?: boolean;
  badge?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <dt className="theme-text-soft text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </dt>
      <dd>
        {!value || value.trim() === "" ? (
          <span className="theme-text-faint text-xs">Not specified</span>
        ) : badge ? (
          <StatusBadge value={value} />
        ) : link ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline break-all"
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            {value.length > 55 ? value.slice(0, 55) + "…" : value}
          </a>
        ) : mono ? (
          <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground">
            {value}
          </code>
        ) : (
          <span className="text-xs whitespace-pre-wrap text-foreground">{value}</span>
        )}
      </dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="theme-text-muted mb-3 border-b border-border pb-1.5 text-[11px] font-semibold uppercase tracking-wider">
      {children}
    </h3>
  );
}

export function RecordDetailSheet({ record, onClose, onEdit, onDelete }: Props) {
  if (!record) return null;

  return (
    <Sheet open={!!record} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-base">
            Record #{record.serialNumber || record.id.slice(0, 8)}
          </SheetTitle>
          <p className="theme-text-muted text-xs">
            {record.typeOfRequest}
            {record.year ? ` · ${record.year}` : ""}
          </p>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Request Information */}
          <div>
            <SectionTitle>Request Information</SectionTitle>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Serial Number" value={record.serialNumber} />
              <Field label="Year" value={record.year} />
              <Field label="Type of Request" value={record.typeOfRequest} badge />
              <Field label="Request Number" value={record.requestNumber} mono />
              <Field label="Mojo Ticket Link" value={record.mojoTicketUrl} link />
              <Field label="Status" value={record.status} badge />
              <Field label="Requester" value={record.requester} />
              <div className="col-span-2">
                <Field label="Request Description" value={record.requestDescription} />
              </div>
              <div className="col-span-2">
                <Field
                  label="Development Task / Report Name"
                  value={record.developmentTaskOrReportName}
                />
              </div>
            </dl>
          </div>

          <Separator />

          {/* Technical Details */}
          <div>
            <SectionTitle>Technical Details</SectionTitle>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="T-Code" value={record.tCode} mono />
              <Field label="Program Name" value={record.programName} mono />
              <Field label="SmartForm / Script" value={record.smartFormOrScript} />
              <Field label="SmartForm Backup" value={record.smartformBackup} />
              <Field label="Program Backup" value={record.programBackup} />
            </dl>
          </div>

          <Separator />

          {/* Transport Request */}
          <div>
            <SectionTitle>Transport Request</SectionTitle>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="TR Number" value={record.trNumber} mono />
              <Field label="TR Created By" value={record.trCreatedBy} />
              <Field label="TR Creation Date" value={fmtDate(record.trCreationDate)} />
              <Field label="TR Moved By" value={record.trMovedBy} />
              <Field label="TR Moved Date" value={fmtDate(record.trMovedDate)} />
              <Field label="Move To" value={record.moveTo} />
            </dl>
          </div>

          <Separator />

          {/* Documentation */}
          <div>
            <SectionTitle>Documentation & Verification</SectionTitle>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Doc Test Case Checked" value={record.documentTestCaseChecked} />
              <Field label="Doc Checked By" value={record.documentCheckedBy} />
              <Field label="Doc Checked Date" value={fmtDate(record.documentCheckedDate)} />
              <Field label="Document Updated" value={record.documentUpdated} />
              <Field label="Program / Config Verified" value={record.programOrConfigurationVerified} />
              <div className="col-span-2">
                <Field label="Document Link" value={record.documentLink} link />
              </div>
              <div className="col-span-2">
                <Field label="Production Backup Link" value={record.productionBackupLink} link />
              </div>
            </dl>
          </div>

          {record.remarks && (
            <>
              <Separator />
              <div>
                <SectionTitle>Remarks</SectionTitle>
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                  {record.remarks}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Metadata */}
          <div className="theme-text-soft flex flex-wrap gap-4 text-[10px]">
            <span>
              ID: <code className="theme-text-muted font-mono text-[10px]">{record.id}</code>
            </span>
            <span>
              Created:{" "}
              {new Date(record.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              Updated:{" "}
              {new Date(record.updatedAt).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onDelete(record)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <Button className="gap-1.5" onClick={() => onEdit(record.id)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit Record
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
