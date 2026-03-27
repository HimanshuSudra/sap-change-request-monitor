// src/components/records/RecordForm.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateRecord, useUpdateRecord, useMojoFetch, useFilterOptions } from "@/hooks/useRecords";
import { useRecords } from "@/hooks/useRecords";
import { ChangeRecordDto, ChangeRecordFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2, Zap, Info, Code, ArrowLeftRight, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const EMPTY_SELECT_VALUE = "__empty__";

// ── Zod Schema ────────────────────────────────────────────────────

const schema = z.object({
  year:                z.string().min(1, "Year is required"),
  typeOfRequest:       z.string().min(1, "Type of Request is required"),
  requestDescription:  z.string().min(1, "Request Description is required").max(500, "Max 500 characters"),
  status:              z.string().min(1, "Status is required"),
  serialNumber:               z.string().max(30).optional(),
  requestNumber:              z.string().max(30).optional(),
  developmentTaskOrReportName:z.string().optional(),
  tCode:                      z.string().max(20).optional(),
  programName:                z.string().max(50).optional(),
  smartFormOrScript:          z.string().max(80).optional(),
  smartformBackup:            z.string().max(80).optional(),
  programBackup:              z.string().max(80).optional(),
  trNumber:                   z.string().max(30).optional(),
  trCreatedBy:                z.string().max(60).optional(),
  trCreationDate:             z.string().optional(),
  trMovedBy:                  z.enum(["Lokesh", "Manoj", ""]).optional(),
  trMovedDate:                z.string().optional(),
  moveTo:                     z.string().optional(),
  requester:                  z.string().max(80).optional(),
  documentTestCaseChecked:    z.enum(["Yes", "No", "NA", ""]).optional(),
  documentCheckedBy:          z.string().max(80).optional(),
  documentCheckedDate:        z.string().optional(),
  documentUpdated:            z.enum(["Yes", "No", "NA", ""]).optional(),
  programOrConfigurationVerified: z.enum(["Yes", "No", "NA", ""]).optional(),
  documentLink:               z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  productionBackupLink:       z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  remarks:                    z.string().max(400, "Max 400 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Section Header ────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  colorClass = "bg-blue-50 text-blue-600",
}: {
  icon: React.ElementType;
  title: string;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────

function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
  charCount,
  maxChars,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  charCount?: number;
  maxChars?: number;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs font-medium text-foreground">
        {label}{" "}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="theme-text-soft ml-1 font-normal">({hint})</span>}
      </Label>
      {children}
      {maxChars !== undefined && charCount !== undefined && (
        <div className="theme-text-soft text-right text-[10px]">
          {charCount} / {maxChars}
        </div>
      )}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Main Form Component ───────────────────────────────────────────

interface RecordFormProps {
  mode: "create" | "edit";
  record?: ChangeRecordDto;
}

export function RecordForm({ mode, record }: RecordFormProps) {
  const router = useRouter();
  const { data: filterOptions } = useFilterOptions();
  const createMutation = useCreateRecord();
  const updateMutation = useUpdateRecord(record?.id ?? "");
  const mojoMutation = useMojoFetch();

  const isEdit = mode === "edit";
  const isPending = createMutation.isPending || updateMutation.isPending;
  const currentYear = String(new Date().getFullYear());
  const { data: yearRecords } = useRecords({ year: currentYear });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: record
      ? {
          year: record.year ?? "",
          serialNumber: record.serialNumber ?? "",
          typeOfRequest: record.typeOfRequest ?? "",
          requestNumber: record.requestNumber ?? "",
          requestDescription: record.requestDescription ?? "",
          developmentTaskOrReportName: record.developmentTaskOrReportName ?? "",
          tCode: record.tCode ?? "",
          programName: record.programName ?? "",
          smartFormOrScript: record.smartFormOrScript ?? "",
          smartformBackup: record.smartformBackup ?? "",
          programBackup: record.programBackup ?? "",
          trNumber: record.trNumber ?? "",
          trCreatedBy: record.trCreatedBy ?? "",
          trCreationDate: record.trCreationDate ?? "",
          trMovedBy: (record.trMovedBy as any) ?? "",
          trMovedDate: record.trMovedDate ?? "",
          moveTo: record.moveTo ?? "",
          requester: record.requester ?? "",
          documentTestCaseChecked: (record.documentTestCaseChecked as any) ?? "",
          documentCheckedBy: record.documentCheckedBy ?? "",
          documentCheckedDate: record.documentCheckedDate ?? "",
          documentUpdated: (record.documentUpdated as any) ?? "",
          programOrConfigurationVerified: (record.programOrConfigurationVerified as any) ?? "",
          documentLink: record.documentLink ?? "",
          productionBackupLink: record.productionBackupLink ?? "",
          status: record.status ?? "",
          remarks: record.remarks ?? "",
        }
      : { year: String(new Date().getFullYear()) },
  });

  useEffect(() => {
    if (!isEdit) {
      setValue("year", currentYear, { shouldValidate: true });
    }
  }, [currentYear, isEdit, setValue]);

  const descValue = watch("requestDescription") ?? "";
  const remarksValue = watch("remarks") ?? "";
  const requestNumberValue = watch("requestNumber") ?? "";

  // Mojo autofill
  async function handleMojoFetch() {
    const reqNo = requestNumberValue.trim();
    if (!reqNo) {
      toast.error("Enter Request Number first");
      return;
    }
    const result = await mojoMutation.mutateAsync(reqNo);
    if (result.requestDescription) setValue("requestDescription", result.requestDescription);
    if (result.requester) setValue("requester", result.requester);
    toast.success("Mojo details fetched successfully");
  }

  async function onSubmit(data: FormValues) {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data as Partial<ChangeRecordFormData>);
      } else {
        await createMutation.mutateAsync(data as ChangeRecordFormData);
      }
      router.push("/records");
    } catch {
      // errors handled by mutation onError → toast
    }
  }

  const types = filterOptions?.typeOfRequest ?? [];
  const statuses = filterOptions?.status ?? [];
  const moveTos = filterOptions?.moveTo ?? [];
  const nextSerialNumber = isEdit
    ? record?.serialNumber ?? "—"
    : (() => {
        const maxCounter = (yearRecords?.records ?? []).reduce((max, item) => {
          const serial = item.serialNumber?.trim();
          if (!serial) return max;

          const match = serial.match(new RegExp(`^${currentYear}-(\\d+)$`));
          if (!match) return max;

          const parsed = Number.parseInt(match[1], 10);
          return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
        }, 0);

        return `${currentYear}-${String(maxCounter + 1).padStart(3, "0")}`;
      })();

  return (
    <div className="max-w-4xl">
      {/* ── Breadcrumb ─────────────────────────────────── */}
      <div className="mb-6 flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
          <Link href="/records">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </Button>
        <span className="theme-text-faint">/</span>
        <span className="text-sm font-medium text-foreground">
          {isEdit ? `Edit Record #${record?.serialNumber || record?.id.slice(0, 8)}` : "New Request"}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {/* ── Section 1: Request Information ──────────── */}
        <div className="surface-panel rounded-xl p-6">
          <SectionHeader icon={Info} title="Request Information" colorClass="bg-blue-50 text-blue-600" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Year" required error={errors.year?.message}>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <Input
                    value={field.value || currentYear}
                    readOnly
                    className={cn("h-9 text-xs", errors.year && "border-red-400")}
                  />
                )}
              />
            </FormField>

            <FormField label="Serial Number" hint="optional" error={errors.serialNumber?.message}>
              <Input
                value={nextSerialNumber}
                readOnly
                placeholder="Auto-generated"
                className="h-9 text-xs"
              />
            </FormField>

            <FormField label="Type of Request" required error={errors.typeOfRequest?.message}>
              <Controller
                name="typeOfRequest"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn("h-9 text-xs", errors.typeOfRequest && "border-red-400")}>
                      <SelectValue placeholder="Select type…" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {/* Request Number + Mojo Fetch */}
            <FormField label="Request Number" hint="optional">
              <div className="flex gap-2">
                <Input
                  {...register("requestNumber")}
                  placeholder="REQ-####"
                  className="h-9 text-xs flex-1"
                  onBlur={() => {
                    if (requestNumberValue.trim()) handleMojoFetch();
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMojoFetch}
                  disabled={mojoMutation.isPending || !requestNumberValue.trim()}
                  className="h-9 gap-1.5 text-xs whitespace-nowrap"
                >
                  {mojoMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  Fetch
                </Button>
              </div>
              <p className="theme-text-soft text-[10px]">
                Enter a valid Mojo ticket number. This works only after Mojo API URL and token are configured.
              </p>
            </FormField>

            <FormField
              label="Request Description"
              required
              error={errors.requestDescription?.message}
              charCount={descValue.length}
              maxChars={500}
              className="sm:col-span-2"
            >
              <Textarea
                {...register("requestDescription")}
                rows={3}
                placeholder="Describe the change request in detail…"
                className={cn("text-xs resize-none", errors.requestDescription && "border-red-400")}
                maxLength={500}
              />
            </FormField>

            <FormField
              label="Development Task / Report Name"
              hint="optional"
              className="sm:col-span-2"
            >
              <Input {...register("developmentTaskOrReportName")} placeholder="Task or report name" className="h-9 text-xs" />
            </FormField>
          </div>
        </div>

        {/* ── Section 2: Technical Details ─────────────── */}
        <div className="surface-panel rounded-xl p-6">
          <SectionHeader icon={Code} title="Technical Details" colorClass="bg-violet-50 text-violet-600" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="T-Code" hint="optional">
              <Input {...register("tCode")} placeholder="e.g. SE38" className="h-9 text-xs font-mono" />
            </FormField>
            <FormField label="Program Name" hint="optional">
              <Input {...register("programName")} placeholder="e.g. ZPROG_NAME" className="h-9 text-xs font-mono" />
            </FormField>
            <FormField label="SmartForm / Script" hint="optional">
              <Input {...register("smartFormOrScript")} className="h-9 text-xs" />
            </FormField>
            <FormField label="SmartForm Backup" hint="optional">
              <Input {...register("smartformBackup")} className="h-9 text-xs" />
            </FormField>
            <FormField label="Program Backup" hint="optional">
              <Input {...register("programBackup")} className="h-9 text-xs" />
            </FormField>
          </div>
        </div>

        {/* ── Section 3: Transport Request ─────────────── */}
        <div className="surface-panel rounded-xl p-6">
          <SectionHeader icon={ArrowLeftRight} title="Transport Request" colorClass="bg-cyan-50 text-cyan-600" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="TR Number" hint="optional">
              <Input {...register("trNumber")} placeholder="e.g. DEVK9XXXXX" className="h-9 text-xs font-mono" />
            </FormField>
            <FormField label="TR Created By" hint="optional">
              <Input {...register("trCreatedBy")} className="h-9 text-xs" />
            </FormField>
            <FormField label="TR Creation Date" hint="optional">
              <Input {...register("trCreationDate")} type="date" className="h-9 text-xs" />
            </FormField>
            <FormField label="TR Moved By" hint="optional">
              <Controller
                name="trMovedBy"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                    value={field.value || EMPTY_SELECT_VALUE}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>None</SelectItem>
                      <SelectItem value="Lokesh">Lokesh</SelectItem>
                      <SelectItem value="Manoj">Manoj</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="TR Moved Date" hint="optional">
              <Input {...register("trMovedDate")} type="date" className="h-9 text-xs" />
            </FormField>
            <FormField label="Move To" hint="optional">
              <Controller
                name="moveTo"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                    value={field.value || EMPTY_SELECT_VALUE}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>None</SelectItem>
                      {moveTos.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
        </div>

        {/* ── Section 4: Documentation & Verification ──── */}
        <div className="surface-panel rounded-xl p-6">
          <SectionHeader icon={FileText} title="Documentation & Verification" colorClass="bg-amber-50 text-amber-600" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Requester" hint="optional">
              <Input {...register("requester")} className="h-9 text-xs" />
            </FormField>
            <FormField label="Doc Test Case Checked" hint="optional">
              <Controller name="documentTestCaseChecked" control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                    value={field.value || EMPTY_SELECT_VALUE}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>—</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="NA">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
            </FormField>
            <FormField label="Doc Checked By" hint="optional">
              <Input {...register("documentCheckedBy")} className="h-9 text-xs" />
            </FormField>
            <FormField label="Doc Checked Date" hint="optional">
              <Input {...register("documentCheckedDate")} type="date" className="h-9 text-xs" />
            </FormField>
            <FormField label="Document Updated" hint="optional">
              <Controller name="documentUpdated" control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                    value={field.value || EMPTY_SELECT_VALUE}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>—</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="NA">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
            </FormField>
            <FormField label="Program / Config Verified" hint="optional">
              <Controller name="programOrConfigurationVerified" control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value === EMPTY_SELECT_VALUE ? "" : value)}
                    value={field.value || EMPTY_SELECT_VALUE}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>—</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="NA">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
            </FormField>
            <FormField label="Document Link" hint="optional" error={errors.documentLink?.message} className="sm:col-span-2">
              <Input {...register("documentLink")} type="url" placeholder="https://drive.google.com/…" className="h-9 text-xs" />
            </FormField>
            <FormField label="Production Backup Link" hint="optional" error={errors.productionBackupLink?.message} className="sm:col-span-2">
              <Input {...register("productionBackupLink")} type="url" placeholder="https://…" className="h-9 text-xs" />
            </FormField>
          </div>
        </div>

        {/* ── Section 5: Status & Remarks ──────────────── */}
        <div className="surface-panel rounded-xl p-6">
          <SectionHeader icon={CheckCircle} title="Status & Remarks" colorClass="bg-green-50 text-green-600" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Status" required error={errors.status?.message}>
              <Controller name="status" control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn("h-9 text-xs", errors.status && "border-red-400")}>
                      <SelectValue placeholder="Select status…" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
            </FormField>

            <FormField
              label="Remarks"
              hint="optional"
              charCount={remarksValue.length}
              maxChars={400}
              className="sm:col-span-2"
            >
              <Textarea
                {...register("remarks")}
                rows={3}
                placeholder="Additional notes or context…"
                className="text-xs resize-none"
                maxLength={400}
              />
            </FormField>
          </div>
        </div>

        {/* ── Sticky Footer ─────────────────────────────── */}
        <div className="surface-panel-strong sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl px-6 py-4 shadow-lg backdrop-blur-md">
          <Button asChild variant="outline" size="sm" className="text-xs" disabled={isPending}>
            <Link href="/records">Cancel</Link>
          </Button>
          <Button type="submit" size="sm" disabled={isPending} className="gap-2 text-xs min-w-[130px]">
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {isEdit ? "Updating…" : "Saving…"}
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                {isEdit ? "Update Record" : "Save Record"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
