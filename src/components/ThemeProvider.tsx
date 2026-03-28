"use client";

import * as React from "react";

export type ThemeName = "harbor" | "graphite" | "ember" | "sap" | "ui5";
export type ColorMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeName;
  mode: ColorMode;
  setTheme: (theme: ThemeName) => void;
  toggleMode: () => void;
};

const THEME_STORAGE_KEY = "pcms-theme";
const MODE_STORAGE_KEY = "pcms-mode";

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeName, mode: ColorMode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", mode === "dark");
}

function normalizeTheme(theme: string | null): ThemeName {
  switch (theme) {
    case "sap":
    case "ui5":
      return theme;
    case "anime":
      return "ember";
    case "marvel":
      return "graphite";
    case "harbor":
    case "graphite":
    case "ember":
      return theme;
    default:
      return "harbor";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeName>("harbor");
  const [mode, setMode] = React.useState<ColorMode>("light");

  React.useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const savedMode = window.localStorage.getItem(MODE_STORAGE_KEY) as ColorMode | null;
    const nextTheme = normalizeTheme(savedTheme);
    const nextMode = savedMode ?? "light";
    setThemeState(nextTheme);
    setMode(nextMode);
    applyTheme(nextTheme, nextMode);
  }, []);

  const setTheme = React.useCallback((nextTheme: ThemeName) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme, mode);
  }, [mode]);

  const toggleMode = React.useCallback(() => {
    setMode((current) => {
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem(MODE_STORAGE_KEY, next);
      applyTheme(theme, next);
      return next;
    });
  }, [theme]);

  const value = React.useMemo(
    () => ({ theme, mode, setTheme, toggleMode }),
    [theme, mode, setTheme, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
