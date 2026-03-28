"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme, type ThemeName } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearPointerGlow, cn, trackPointerGlow } from "@/lib/utils";

const THEMES: Array<{ value: ThemeName; label: string; swatch: string; note: string }> = [
  { value: "harbor", label: "Harbor", swatch: "from-teal-500 via-cyan-500 to-amber-400", note: "Clean executive default" },
  { value: "graphite", label: "Graphite", swatch: "from-slate-900 via-orange-500 to-red-500", note: "Bold operational contrast" },
  { value: "ember", label: "Ember", swatch: "from-rose-500 via-amber-400 to-violet-600", note: "Warm high-energy look" },
  { value: "sap", label: "SAP", swatch: "from-sky-500 via-blue-600 to-slate-900", note: "Familiar enterprise palette" },
  { value: "ui5", label: "UI5", swatch: "from-blue-500 via-sky-400 to-indigo-700", note: "Bright platform styling" },
  { value: "cayman", label: "Cayman", swatch: "from-emerald-400 via-teal-500 to-blue-500", note: "GitHub Pages inspired" },
  { value: "minimal", label: "Minimal", swatch: "from-zinc-900 via-zinc-500 to-stone-300", note: "Quiet editorial layout" },
  { value: "hacker", label: "Hacker", swatch: "from-lime-400 via-green-500 to-emerald-300", note: "Terminal-inspired dark mode" },
  { value: "architect", label: "Architect", swatch: "from-orange-500 via-amber-500 to-yellow-400", note: "Warm structural contrast" },
  { value: "midnight", label: "Midnight", swatch: "from-violet-500 via-indigo-500 to-blue-500", note: "Deep dark release board" },
  { value: "slate", label: "Slate", swatch: "from-sky-500 via-slate-500 to-slate-700", note: "Cool steel enterprise tone" },
];

export default function SettingsPage() {
  const { theme, mode, setTheme, toggleMode } = useTheme();

  return (
    <div className="page-reveal space-y-8">
      <section
        className="magnetic-surface glass-panel interactive-spotlight rounded-[2.25rem] border-white/50 px-7 py-10 md:px-10 md:py-12"
        onPointerMove={trackPointerGlow}
        onPointerLeave={clearPointerGlow}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="magnetic-child space-y-4">
            <div className="hero-badge inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
              Workspace Preferences
            </div>
            <div className="space-y-3">
              <h2 className="theme-heading font-display text-4xl font-semibold tracking-tight md:text-[3.5rem] md:leading-[1.02]">
                Tune the visual system for
                <span className="theme-gradient-text"> clarity and motion</span>.
              </h2>
              <p className="theme-body max-w-3xl text-base leading-8 md:text-lg">
                Choose a runtime theme preset, switch light or dark mode, and preview how the dashboard and TRMS surfaces respond to cursor movement and hover.
              </p>
            </div>
          </div>

          <Button variant="outline" className="magnetic-child h-11 gap-2 px-4 text-sm" onClick={toggleMode}>
            {mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {mode === "light" ? "Switch to Dark" : "Switch to Light"}
          </Button>
        </div>
      </section>

      <Card className="glass-panel motion-tile rounded-[1.9rem] border-white/50 bg-white/75">
        <CardHeader>
          <CardTitle className="text-base">Theme Presets</CardTitle>
          <CardDescription className="text-sm">All app themes now live in Settings so the header stays focused on actions and navigation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {THEMES.map((item, index) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTheme(item.value)}
                className={cn(
                  "motion-tile rounded-[1.7rem] border p-5 text-left transition-all",
                  theme === item.value
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-white/55 hover:border-primary/30 hover:bg-white/70"
                )}
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <div className={cn("h-28 rounded-[1.4rem] bg-gradient-to-br", item.swatch)} />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="theme-heading text-base font-semibold">{item.label}</div>
                    <div className="theme-body mt-1 text-sm leading-6">{item.note}</div>
                  </div>
                  {theme === item.value ? (
                    <span className="hero-badge rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Active
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
