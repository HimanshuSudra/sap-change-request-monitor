# PCMS — Google Apps Script → Next.js 15 Migration

---

## PHASE 1 — SYSTEM ANALYSIS

### What the App Does

PCMS (Program Change Management System) is an internal enterprise tool for tracking SAP program change requests across their full lifecycle — from initial request intake through technical transport, documentation, and final verification. It is primarily used in an SAP ABAP development/configuration environment.

---

### Business Entities

| Entity | Description |
|--------|-------------|
| **ChangeRecord** | The core entity. One row = one SAP program change request |
| **Setting** | Key-value dropdown options stored in a Settings sheet |
| **DriveFolder** | Google Drive folder IDs for file attachments (not a DB entity — config only) |

---

### All Form Fields (from Index.html)

**Section 1 — Request Information**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `year` | select | ✅ | Populated from current year ±3/+6 range |
| `serialNumber` | text | — | Manual e.g. `2024-001` |
| `typeOfRequest` | select | ✅ | From Settings sheet `typeOfRequest` key |
| `requestNumber` | text | — | Mojo Helpdesk ticket number (REQ-####) |
| `requestDescription` | textarea | ✅ | 500 char max; auto-filled from Mojo API |
| `developmentTaskOrReportName` | text | — | SAP task/report name |

**Section 2 — Technical Details**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `tCode` | text | — | SAP T-Code e.g. SE38 (monospace) |
| `programName` | text | — | ABAP program name e.g. ZPROG_NAME |
| `smartFormOrScript` | text | — | SmartForm or ABAP script name |
| `smartformBackup` | text | — | Backup identifier |
| `programBackup` | text | — | Backup identifier |

**Section 3 — Transport Request**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `trNumber` | text | — | TR number e.g. DEVK9XXXXX (monospace) |
| `trCreatedBy` | text | — | Person who created the TR |
| `trCreationDate` | date | — | |
| `trMovedBy` | select | — | **Hardcoded enum**: Lokesh \| Manoj |
| `trMovedDate` | date | — | |
| `moveTo` | select | — | From Settings sheet `moveTo` key |

**Section 4 — Documentation & Verification**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `requester` | text | — | Auto-filled from Mojo API |
| `documentTestCaseChecked` | select | — | Yes \| No \| N/A |
| `documentCheckedBy` | text | — | |
| `documentCheckedDate` | date | — | |
| `documentUpdated` | select | — | Yes \| No \| N/A |
| `programOrConfigurationVerified` | select | — | Yes \| No \| N/A |
| `documentLink` | url | — | Google Drive document link |
| `productionBackupLink` | url | — | Production backup link |

**Section 5 — Status & Remarks**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `status` | select | ✅ | From Settings sheet `status` key |
| `remarks` | textarea | — | 400 char max |

**System fields** (not in form): `id`, `createdAt`, `updatedAt`

---

### All API-like Functions

| GAS Function | HTTP Equivalent | Notes |
|---|---|---|
| `getAllRecordsForUi()` | `GET /api/records` | Returns all records |
| `getRecordByIdObject(id)` | `GET /api/records/:id` | Single record lookup |
| `createRecordForUi(data)` | `POST /api/records` | Validates + appends row |
| `updateRecordForUi(data)` | `PUT /api/records/:id` | Updates row by id |
| `deleteRecordForUi({id})` | `DELETE /api/records/:id` | Removes row |
| `getDashboardStatsForUi()` | `GET /api/dashboard` | KPI stats |
| `getChartDataForUi()` | `GET /api/charts` | Chart aggregation data |
| `getFilterOptionsForUi()` | `GET /api/filter-options` | Dropdown options |
| `fetchMojoRequestDetails(reqNo)` | `GET /api/mojo/:reqNo` | External Mojo Helpdesk API |

---

### Charts

**Dashboard charts:**
- Status Distribution — Donut/Pie (`byStatus`)
- Type of Request — Donut/Pie (`byType`)
- Monthly Volume — Column chart (`byMonth`, current year only)
- Top Requesters — Bar chart (`byRequester`, top 10)
- Top TR Creators — Bar chart (`byTrCreatedBy`, top 10)

**Reports charts (year-filtered):**
- Year-over-Year Volume — Bar chart (`byYear`)
- Monthly Request Trend — Line chart (all years or filtered)
- Status Distribution — Pie
- Request Type Distribution — Pie
- Requester Activity — Bar
- TR Creator Activity — Bar
- TR Moved By — Bar (`byTrMovedBy`)

---

### Dependencies on Google Services

| Google Service | Usage |
|---|---|
| `SpreadsheetApp` | All data storage (Records + Settings sheets) |
| `google.script.run` | All frontend→backend RPC calls |
| `HtmlService` | Templating (include pattern) |
| `Google Charts` | All chart rendering |
| `UrlFetchApp` | External Mojo Helpdesk API call |
| `PropertiesService` | Stores MOJO_API_BASE_URL, MOJO_API_TOKEN |
| `Session.getScriptTimeZone()` | Date formatting |
| `ContentService` | JSON response serialization |
| `DriveApp` | (folder IDs referenced in config, not actively used in code) |

---

### Issues in Legacy Code

**Data Integrity:**
- `id` generation is non-sequential: `REQ-{timestamp}-{rand}` — possible collision if concurrent
- No foreign key constraints — Settings values can drift from Records
- `repairMissingIds()` function signals rows without IDs existed historically
- Row deletion shifts all subsequent row numbers (sheet rows, not ids)
- Date handling: timezone-sensitive in GAS, silently broken if tz mismatches

**Security:**
- No authentication — anyone with the Apps Script URL has full access
- `trMovedBy` sanitized server-side but no other input sanitization
- No CSRF protection
- API keys stored in Script Properties (not encrypted, accessible to all editors)

**Scalability:**
- Full sheet scan on every request — O(n) on every API call
- No indexing — `findRowById` is a linear scan
- No caching — `getDashboardStats` re-reads entire sheet on every dashboard load
- Google Sheets API rate limits apply (~300 req/min)

**Maintainability:**
- Monolithic 611-line `code.gs` file
- No TypeScript — no type safety
- UI state managed via global mutable `STATE` object
- DOM manipulation mixed with business logic
- `google.script.run` callbacks are deeply nested, no async/await

---

## PHASE 2 — MODERN ARCHITECTURE DESIGN

### Folder Structure

```
pcms/
├── .env.example
├── .env.local                    # local secrets (gitignored)
├── .gitignore
├── components.json               # shadcn/ui config
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/               # auto-generated
│
└── src/
    ├── app/
    │   ├── layout.tsx            # Root layout with sidebar + topbar
    │   ├── page.tsx              # Redirect to /dashboard
    │   ├── globals.css
    │   ├── dashboard/
    │   │   └── page.tsx
    │   ├── records/
    │   │   ├── page.tsx          # All records table
    │   │   ├── new/
    │   │   │   └── page.tsx
    │   │   └── [id]/
    │   │       ├── page.tsx      # View record (modal-style page)
    │   │       └── edit/
    │   │           └── page.tsx
    │   ├── reports/
    │   │   └── page.tsx
    │   └── api/
    │       ├── records/
    │       │   ├── route.ts      # GET list, POST create
    │       │   └── [id]/
    │       │       └── route.ts  # GET one, PUT update, DELETE
    │       ├── dashboard/
    │       │   └── route.ts
    │       ├── charts/
    │       │   └── route.ts
    │       ├── filter-options/
    │       │   └── route.ts
    │       └── mojo/
    │           └── [requestNumber]/
    │               └── route.ts
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx      # Sidebar + main wrapper
    │   │   ├── Sidebar.tsx
    │   │   └── Topbar.tsx
    │   ├── dashboard/
    │   │   ├── KpiCard.tsx
    │   │   ├── KpiGrid.tsx
    │   │   ├── StatusPieChart.tsx
    │   │   ├── TypePieChart.tsx
    │   │   ├── MonthlyBarChart.tsx
    │   │   └── RequesterBarChart.tsx
    │   ├── records/
    │   │   ├── RecordsTable.tsx  # TanStack Table
    │   │   ├── RecordColumns.tsx # Column definitions
    │   │   ├── RecordForm.tsx    # RHF + Zod
    │   │   ├── RecordDetailSheet.tsx
    │   │   └── DeleteConfirmDialog.tsx
    │   ├── reports/
    │   │   ├── YearFilterChips.tsx
    │   │   ├── YearlyVolumeChart.tsx
    │   │   ├── MonthlyTrendChart.tsx
    │   │   └── ReportPieChart.tsx
    │   └── ui/                   # shadcn/ui auto-generated
    │
    ├── lib/
    │   ├── prisma.ts             # Prisma singleton
    │   ├── api-response.ts       # Typed response helpers
    │   └── utils.ts              # cn(), date helpers
    │
    ├── services/
    │   ├── record.service.ts     # All DB operations for records
    │   ├── settings.service.ts   # Filter options / settings CRUD
    │   └── mojo.service.ts       # External Mojo Helpdesk integration
    │
    ├── types/
    │   └── index.ts              # All shared TypeScript types
    │
    └── hooks/
        ├── useRecords.ts         # React Query for records
        ├── useDashboard.ts       # React Query for KPIs + charts
        ├── useFilterOptions.ts
        └── useMojo.ts
```

### Key Architecture Decisions

- **App Router** with server components for data fetching where possible
- **React Query (TanStack Query)** for client-side cache, mutations, and invalidation
- **Route Handlers** (Next.js) instead of Express — co-located with the app, same deployment
- **Service layer** wraps Prisma — business logic isolated from HTTP handlers
- **Zod schemas** shared between frontend (form validation) and backend (API validation)
- **shadcn/ui** for all UI components — accessible, composable, zero-runtime CSS-in-JS

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pcms"

# Mojo Helpdesk API
MOJO_API_BASE_URL="https://support.yourdomain.com/api/v2/tickets"
MOJO_API_TOKEN="your-mojo-access-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="PCMS"

# Auth (future — set to mock for now)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

---

## PHASE 3 — DATABASE DESIGN

### Schema Decisions

- `ChangeRecord` maps 1:1 to each row in the legacy Records sheet
- `Setting` replaces the Settings sheet (key/value pairs for dropdowns)
- `TrMovedByEnum` replaces the hardcoded `CONFIG.TR_MOVED_BY_OPTIONS` array
- `AuditLog` adds what was missing: immutable audit trail
- `User` stub for future auth — `createdBy` / `updatedBy` on records
- All nullable fields match the original (only 4 fields are truly required)
- `serialNumber` is stored as-is (user-managed string like `2024-001`)
- `id` uses `cuid()` (collision-safe, URL-safe, sortable) instead of `REQ-timestamp-rand`

### Seed Strategy

1. Export Google Sheet as CSV
2. Run `prisma/seed.ts` which imports CSV → ChangeRecord rows
3. Seed Settings from legacy CONFIG values

### Migration from Google Sheets

1. Export Records sheet → `records.csv`
2. Export Settings sheet → `settings.csv`
3. Run provided seed script which maps column headers → Prisma fields
4. Validate row counts match
5. Run `repairMissingIds` equivalent — any missing IDs get a new cuid

---

## PHASE 6 — GOOGLE DEPENDENCY REPLACEMENT

| Google Dependency | Modern Replacement |
|---|---|
| Google Sheets (Records) | PostgreSQL via Prisma |
| Google Sheets (Settings) | PostgreSQL `Setting` table |
| `google.script.run` | `fetch()` to Next.js Route Handlers |
| `HtmlService` templating | React Server/Client Components |
| Google Charts | Recharts (ResponsiveContainer) |
| Drive folder IDs | Config env vars + future S3/local storage |
| `Session.getScriptTimeZone()` | `Intl.DateTimeFormat` / `date-fns-tz` |
| `PropertiesService` | `.env.local` / Vercel environment variables |
| `UrlFetchApp` | Native `fetch()` in server-side Route Handler |
| `ContentService.MimeType.JSON` | `NextResponse.json()` |
| `Utilities.formatDate` | `date-fns` / `toLocaleDateString` |

### Preserving Google Drive Links

Existing `documentLink` and `productionBackupLink` URLs are stored as plain strings in the DB. They continue to work as clickable links. No migration needed — the URLs are still valid Google Drive URLs.

### Hybrid Mode (Optional Future)

If you want to optionally sync back to Google Sheets:
- Add a `POST /api/sync/sheets` route that uses `googleapis` npm package
- Use a Google Service Account with Sheets API access
- Trigger sync on record create/update

---
