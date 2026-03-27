// src/components/layout/AppShell.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-noise relative flex h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb-layer left-[15%] top-[-3rem] h-44 w-44 bg-cyan-300/25" />
        <div className="orb-layer right-[12%] top-[7rem] h-64 w-64 bg-blue-400/20" style={{ animationDelay: "-4s" }} />
        <div className="orb-layer bottom-[8%] left-[42%] h-56 w-56 bg-sky-200/20" style={{ animationDelay: "-8s" }} />
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
