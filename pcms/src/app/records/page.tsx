// src/app/records/page.tsx
"use client";

import { Suspense } from "react";
import { RecordsView } from "@/components/records/RecordsView";

export default function RecordsPage() {
  return (
    <Suspense>
      <RecordsView />
    </Suspense>
  );
}
