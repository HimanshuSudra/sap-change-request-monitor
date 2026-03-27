"use client";

import { signIn } from "next-auth/react";

export function LoginClient() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
    >
      Continue with Google
    </button>
  );
}
