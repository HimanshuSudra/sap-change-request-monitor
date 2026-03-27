// src/components/Providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              borderRadius: "10px",
              fontSize: "13px",
              padding: "12px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#f8fafc" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#f8fafc" } },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
