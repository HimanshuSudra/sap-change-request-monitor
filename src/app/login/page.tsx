import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { LoginClient } from "./LoginClient";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="app-noise flex min-h-screen items-center justify-center px-6 py-12">
      <div className="surface-panel-strong w-full max-w-md rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="hero-badge inline-flex rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]">
          Gulbrandsen Access
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
          Sign in to PCMS
        </h1>
        <p className="theme-text-muted mt-3 text-sm leading-6">
          Use your Google account ending with <strong>@gulbrandsen.com</strong> to access the SAP change request monitor.
        </p>

        <div className="mt-8">
          <LoginClient />
        </div>
      </div>
    </main>
  );
}
