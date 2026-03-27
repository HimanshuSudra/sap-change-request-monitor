# PCMS — Program Change Management System

A modern full-stack web application for tracking SAP program change requests, migrated from Google Apps Script to **Next.js 15 + PostgreSQL + Prisma**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Data Tables | TanStack Table v8 |
| Charts | Recharts |
| State / Data | TanStack Query (React Query) |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL + Prisma ORM |
| Notifications | react-hot-toast |

---

## Quick Start

### 1. Prerequisites

- **Node.js 20+**
- **PostgreSQL 15+** (local or via Docker)
- A `.env.local` file (copy from `.env.example`)

### 2. Clone and install

```bash
git clone <your-repo>
cd pcms
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your database URL and Mojo API credentials
```

### 4. Initialize the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Seed with sample data
npm run db:seed
```

### 5. Run the app

```bash
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── dashboard/           # KPI cards + charts
│   ├── records/             # All records table + form
│   │   ├── new/             # Create record
│   │   └── [id]/edit/       # Edit record
│   ├── reports/             # Analytics + year filtering
│   └── api/                 # Route Handlers (REST API)
│       ├── records/         # GET list, POST create
│       ├── records/[id]/    # GET one, PUT update, DELETE
│       ├── dashboard/       # KPI stats
│       ├── charts/          # Chart aggregations
│       ├── filter-options/  # Dropdown options
│       └── mojo/[reqNo]/    # Mojo Helpdesk autofill
├── components/
│   ├── layout/              # AppShell, Sidebar, Topbar
│   ├── dashboard/           # KpiGrid, chart components
│   ├── records/             # RecordsView, RecordForm, modals
│   └── ui/                  # shadcn/ui + custom UI atoms
├── hooks/                   # React Query hooks
├── lib/                     # Prisma client, utils, API helpers
├── services/                # Business logic (record, settings, mojo)
└── types/                   # Shared TypeScript types
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/records` | List all records (filter: year, status, typeOfRequest, search) |
| `POST` | `/api/records` | Create a new record |
| `GET` | `/api/records/:id` | Get single record |
| `PUT` | `/api/records/:id` | Update record |
| `DELETE` | `/api/records/:id` | Delete record |
| `GET` | `/api/dashboard` | KPI stats |
| `GET` | `/api/charts?year=2024` | Chart aggregation data |
| `GET` | `/api/filter-options` | Dropdown options for form |
| `GET` | `/api/mojo/:requestNumber` | Fetch Mojo ticket details |

---

## Migrating from Google Sheets

### Step 1: Export your data

1. Open your Google Sheet
2. File → Download → CSV (Records sheet)
3. File → Download → CSV (Settings sheet)

### Step 2: Map columns

The Prisma schema exactly mirrors the GAS column names (camelCase). The seed script includes an example of how to import CSV rows.

### Step 3: Import script (example)

```typescript
// Run: npx tsx scripts/import-from-csv.ts
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import prisma from "./src/lib/prisma";

const rows = parse(readFileSync("records.csv"), { columns: true });
for (const row of rows) {
  await prisma.changeRecord.create({
    data: {
      year: row.year,
      typeOfRequest: row.typeOfRequest,
      requestDescription: row.requestDescription,
      status: row.status,
      // ... map all other fields
    }
  });
}
```

### Step 4: Preserve Google Drive links

`documentLink` and `productionBackupLink` are stored as plain strings — your existing Google Drive URLs continue to work as clickable links with no migration needed.

---

## Setting up shadcn/ui components

After cloning, install the required shadcn/ui components:

```bash
npx shadcn-ui@latest init

# Install each component used in the project:
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
```

---

## Mojo Helpdesk Integration

Set these in `.env.local`:

```env
MOJO_API_BASE_URL="https://support.yourdomain.com/api/v2/tickets"
MOJO_API_TOKEN="your-access-key"
```

Then on the New Request form, enter a ticket number and click **Fetch** — the description and requester name auto-populate from Mojo.

---

## Deployment

### Vercel (recommended)

```bash
npx vercel
```

Set environment variables in the Vercel dashboard. Use a managed PostgreSQL provider (Supabase, Neon, PlanetScale, Railway, etc.).

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run db:generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Database Commands

```bash
npm run db:generate    # Regenerate Prisma client after schema changes
npm run db:push        # Push schema changes (dev only)
npm run db:migrate     # Create migration files (production)
npm run db:seed        # Seed sample data
npm run db:studio      # Open Prisma Studio (visual DB browser)
npm run db:reset       # Reset DB and re-seed (⚠ destroys data)
```

---

## Features vs Original GAS App

| Feature | GAS App | Modern App |
|---|---|---|
| Dashboard KPIs | ✅ | ✅ Animated, clickable |
| Status/Type pie charts | ✅ Google Charts | ✅ Recharts |
| Monthly bar chart | ✅ | ✅ Recharts |
| Requester/TR Creator bars | ✅ | ✅ Recharts |
| Click chart → filter records | ✅ | ✅ URL-based routing |
| All Records table | ✅ | ✅ TanStack Table |
| Column sorting | ✅ | ✅ |
| Search / filter | ✅ | ✅ |
| Active filter chips | ✅ | ✅ |
| Export CSV | ✅ | ✅ |
| Pagination | ✅ | ✅ |
| New / Edit form | ✅ | ✅ |
| Form validation | ✅ Basic | ✅ Zod + RHF |
| Mojo autofill | ✅ | ✅ |
| View record modal | ✅ | ✅ Slide-over sheet |
| Delete confirm | ✅ | ✅ AlertDialog |
| Toast notifications | ✅ | ✅ react-hot-toast |
| Reports page | ✅ | ✅ |
| Year-filter chips | ✅ | ✅ |
| Audit trail | ❌ | ✅ AuditLog table |
| Auth / roles | ❌ | 🔜 Ready structure |
| TypeScript | ❌ | ✅ Strict |
| Indexes / fast queries | ❌ | ✅ PostgreSQL indexes |
| Loading states | Partial | ✅ Skeleton loaders |
| Empty states | Partial | ✅ |
| Mobile responsive | Partial | ✅ |
