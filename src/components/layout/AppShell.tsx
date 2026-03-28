// src/components/layout/AppShell.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/login")) {
    return <>{children}</>;
  }

  return (
    <div className="app-noise relative flex h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb-layer left-[15%] top-[-3rem] h-44 w-44 bg-cyan-300/25" />
        <div className="orb-layer right-[12%] top-[7rem] h-64 w-64 bg-blue-400/20" style={{ animationDelay: "-4s" }} />
        <div className="orb-layer bottom-[8%] left-[42%] h-56 w-56 bg-sky-200/20" style={{ animationDelay: "-8s" }} />
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/46 backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 pb-6 pt-2 md:px-6 md:pb-8 lg:px-8 lg:pb-10">
          <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
