// src/services/mojo.service.ts
// Mojo Helpdesk (Gulbrandsen) API integration
// Replaces the GAS fetchMojoRequestDetails() function

import { stripHtml } from "@/lib/utils";
import { MojoDetails } from "@/types";

const BASE_URL = process.env.MOJO_API_BASE_URL;
const ACCESS_KEY = process.env.MOJO_API_TOKEN;
const PORTAL_BASE_URL = process.env.MOJO_PORTAL_BASE_URL ?? "https://support.gulbrandsen.com";

type MojoFetchResult = { success: true; data: MojoDetails } | { success: false; message: string };

function buildMojoTicketUrl(baseUrl: string, ticketNumber: string): string {
  const portalOrigin = PORTAL_BASE_URL.replace(/\/$/, "");
  return `${portalOrigin}/mc/tickets/${encodeURIComponent(ticketNumber)}`;
}

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
    const ticketTitle = stripHtml(json.title || json.subject || "");
    const requestDescription = ticketTitle;
    const mojoTicketUrl = buildMojoTicketUrl(BASE_URL, cleanNumber);

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
        ticketTitle,
        requestDescription,
        requester,
        mojoTicketUrl,
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
