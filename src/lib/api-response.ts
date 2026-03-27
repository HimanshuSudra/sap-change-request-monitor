// src/lib/api-response.ts
import { NextResponse } from "next/server";
import { ApiSuccess, ApiError } from "@/types";

export function ok<T>(data: T, message?: string, status = 200) {
  const body: ApiSuccess<T> = { success: true, data, ...(message ? { message } : {}) };
  return NextResponse.json(body, { status });
}

export function created<T>(data: T, message?: string) {
  return ok(data, message ?? "Created successfully", 201);
}

export function apiError(message: string, status = 400, error?: string) {
  const body: ApiError = {
    success: false,
    error: error ?? message,
    message,
  };
  return NextResponse.json(body, { status });
}

export function notFound(message = "Record not found") {
  return apiError(message, 404);
}

export function serverError(err: unknown) {
  console.error("[PCMS API Error]", err);
  return apiError(
    "An unexpected error occurred. Please try again.",
    500,
    err instanceof Error ? err.message : String(err)
  );
}
