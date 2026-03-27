// src/components/layout/Topbar.tsx
"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Search, RefreshCw, Moon, Sun, Palette, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTheme, type ThemeName } from "@/components/ThemeProvider";
import { signOut, useSession } from "next-auth/react";

const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/dashboard": {
    title: "Dashboard",
    sub: "Program Change Management Overview",
  },
  "/records": {
    title: "All Records",
    sub: "Browse and manage all change requests",
  },
  "/records/new": {
    title: "New Request",
    sub: "Create a new program change request",
  },
  "/reports": {
    title: "Reports & Analytics",
    sub: "Trends, distributions and performance metrics",
  },
};

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: session } = useSession();
  const { theme, mode, setTheme, toggleMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const themes: Array<{ value: ThemeName; label: string }> = [
    { value: "sap", label: "SAP" },
    { value: "ui5", label: "UI5" },
    { value: "anime", label: "Anime" },
    { value: "marvel", label: "Marvel" },
  ];

  // Find best matching meta entry
  let meta = PAGE_META[pathname];
  if (!meta) {
    const match = Object.entries(PAGE_META).find(([k]) =>
      pathname.startsWith(k)
    );
    meta = match?.[1] ?? { title: "PCMS", sub: "" };
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries();
    await new Promise((r) => setTimeout(r, 600)); // brief visual feedback
    setRefreshing(false);
    toast.success("Data refreshed");
  }, [qc]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (search.trim()) {
        router.push(`/records?search=${encodeURIComponent(search.trim())}`);
      }
    },
    [search, router]
  );

  return (
    <header className="glass-panel relative z-10 mx-4 mt-4 flex h-16 flex-shrink-0 items-center gap-4 rounded-3xl border-white/40 px-4 md:mx-6 md:px-6">
      {/* Mobile hamburger */}
      <button
        className="theme-text-muted hover:text-foreground lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold leading-tight text-foreground">
          {meta.title}
        </h1>
        {meta.sub && (
          <p className="theme-text-muted hidden truncate text-xs leading-tight sm:block">
            {meta.sub}
          </p>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setThemeMenuOpen((open) => !open)}
            className="surface-panel-strong theme-text-muted flex h-10 items-center gap-2 rounded-2xl px-3 text-xs font-medium transition-colors hover:text-foreground"
          >
            <Palette className="h-3.5 w-3.5" />
            {themes.find((item) => item.value === theme)?.label}
          </button>
          {themeMenuOpen && (
            <div className="glass-panel absolute right-0 top-12 z-50 w-40 rounded-2xl p-2">
              {themes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setTheme(item.value);
                    setThemeMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors",
                    theme === item.value
                      ? "bg-primary text-primary-foreground"
                      : "theme-text-muted hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <span>{item.label}</span>
                  {theme === item.value && <span>Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleMode}
          className="surface-panel-strong theme-text-muted flex h-10 w-10 items-center justify-center rounded-2xl transition-colors hover:text-foreground"
          title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {mode === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>

        {/* Global quick search */}
        <form onSubmit={handleSearch} className="hidden md:block">
          <div className="relative">
            <Search className="theme-text-soft pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Quick search…"
              className="theme-field h-10 w-56 rounded-2xl border pl-8 pr-3 text-xs shadow-inner transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </form>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh data"
          className="surface-panel-strong theme-text-muted flex h-10 w-10 items-center justify-center rounded-2xl transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
          />
        </button>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="surface-panel-strong theme-text-muted hidden h-10 items-center gap-2 rounded-2xl px-3 text-xs font-medium transition-colors hover:text-foreground lg:flex"
          title={session?.user?.email ?? "Sign out"}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="max-w-40 truncate">{session?.user?.email ?? "Sign out"}</span>
        </button>
      </div>
    </header>
  );
}
