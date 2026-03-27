// src/services/mojo.service.ts
// Mojo Helpdesk (Gulbrandsen) API integration
// Replaces the GAS fetchMojoRequestDetails() function

import { stripHtml } from "@/lib/utils";
import { MojoDetails } from "@/types";

const BASE_URL = process.env.MOJO_API_BASE_URL;
const ACCESS_KEY = process.env.MOJO_API_TOKEN;

type MojoFetchResult = { success: true; data: MojoDetails } | { success: false; message: string };

/** Fetch ticket details from Mojo Helpdesk and return autofill data */
export async function fetchMojoTicket(requestNumber: string): Promise<MojoFetchResult> {
  if (!BASE_URL) {
    return { success: false, message: "MOJO_API_BASE_URL is not configured" };
  }
  if (!ACCESS_KEY) {
    return { success: false, message: "MOJO_API_TOKEN is not configured" };
  }

  // Strip REQ prefix if user enters "REQ55761067" or "REQ-55761067"
  const cleanNumber = requestNumber.replace(/^REQ[- ]?/i, "").trim();

  const url = `${BASE_URL.replace(/\/$/, "")}/${encodeURIComponent(cleanNumber)}?access_key=${encodeURIComponent(ACCESS_KEY)}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 }, // Never cache — always fresh
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Mojo API returned status ${res.status}`,
      };
    }

    const json = await res.json();
    const description = json.description || json.title || "";

    // Extract requester name from various possible response shapes
    let requester = "";
    if (json.requester?.name) {
      requester = json.requester.name;
    } else if (json.user?.full_name) {
      requester = json.user.full_name;
    } else if (json.user_id) {
      const userResult = await fetchMojoUser(json.user_id);
      if (userResult) requester = userResult;
    }

    return {
      success: true,
      data: {
        requestDescription: stripHtml(description),
        requester,
      },
    };
  } catch (err) {
    console.error("[Mojo Service Error]", err);
    return {
      success: false,
      message: `Failed to fetch Mojo ticket: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/** Fetch Mojo user name by user_id */
async function fetchMojoUser(userId: number | string): Promise<string | null> {
  if (!BASE_URL || !ACCESS_KEY) return null;

  const usersBase = BASE_URL.replace(/\/tickets\/?$/, "/users");
  const url = `${usersBase}/${encodeURIComponent(userId)}?access_key=${encodeURIComponent(ACCESS_KEY)}`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.full_name || json.name || json.email || null;
  } catch {
    return null;
  }
}
