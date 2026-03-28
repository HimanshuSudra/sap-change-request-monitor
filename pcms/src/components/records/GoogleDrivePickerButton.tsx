"use client";

import { useEffect, useRef, useState } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const GOOGLE_API_SCRIPT_ID = "google-api-script";
const GOOGLE_GIS_SCRIPT_ID = "google-gis-script";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

type Props = {
  onPick: (url: string) => void;
};

type GoogleTokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

function loadScript(id: string, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export function GoogleDrivePickerButton({ onPick }: Props) {
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const tokenClientRef = useRef<GoogleTokenClient | null>(null);
  const accessTokenRef = useRef<string>("");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const appId = process.env.NEXT_PUBLIC_GOOGLE_APP_ID;
  const isConfigured = Boolean(apiKey && clientId);

  useEffect(() => {
    if (!isConfigured) return;

    let cancelled = false;

    async function initPicker() {
      try {
        await Promise.all([
          loadScript(GOOGLE_API_SCRIPT_ID, "https://apis.google.com/js/api.js"),
          loadScript(GOOGLE_GIS_SCRIPT_ID, "https://accounts.google.com/gsi/client"),
        ]);

        if (!window.gapi || !window.google?.accounts?.oauth2) {
          throw new Error("Google scripts did not initialize");
        }

        await new Promise<void>((resolve) => {
          window.gapi!.load("picker", () => resolve());
        });

        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId!,
          scope: DRIVE_SCOPE,
          callback: (response) => {
            if (response.error || !response.access_token) {
              setOpening(false);
              toast.error(response.error || "Google Drive authorization failed");
              return;
            }

            accessTokenRef.current = response.access_token;
            openPicker(response.access_token);
          },
        });

        if (!cancelled) {
          setReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[Drive Picker Init Error]", error);
          toast.error("Could not initialize Google Drive Picker");
        }
      }
    }

    void initPicker();

    return () => {
      cancelled = true;
    };
  }, [clientId, isConfigured]);

  function openPicker(token: string) {
    const picker = window.google?.picker as any;
    if (!picker || !apiKey) {
      setOpening(false);
      toast.error("Google Drive Picker is not configured");
      return;
    }

    const view = new picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setMode(picker.DocsViewMode.LIST);

    new picker.PickerBuilder()
      .setDeveloperKey(apiKey)
      .setOAuthToken(token)
      .addView(view)
      .setCallback((data: Record<string, unknown>) => {
        const action = data[picker.Response.ACTION] as string | undefined;
        if (action === picker.Action.CANCEL) {
          setOpening(false);
          return;
        }

        if (action === picker.Action.PICKED) {
          const docs = data[picker.Response.DOCUMENTS] as Array<Record<string, string>> | undefined;
          const first = docs?.[0];
          const pickedUrl =
            first?.[picker.Document.URL] ||
            (first?.[picker.Document.ID]
              ? `https://drive.google.com/file/d/${first[picker.Document.ID]}/view`
              : "");

          if (pickedUrl) {
            onPick(pickedUrl);
            toast.success(`Linked ${first?.[picker.Document.NAME] ?? "Drive file"}`);
          } else {
            toast.error("Google Drive did not return a usable link");
          }
          setOpening(false);
        }
      })
      .build()
      .setVisible(true);
  }

  function handleOpen() {
    if (!isConfigured) {
      toast.error("Google Drive Picker env vars are not configured");
      return;
    }

    if (!ready || !tokenClientRef.current) {
      toast.error("Google Drive Picker is still loading");
      return;
    }

    setOpening(true);
    tokenClientRef.current.requestAccessToken({
      prompt: accessTokenRef.current ? "" : "consent",
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 gap-1.5 text-xs"
      onClick={handleOpen}
      disabled={!isConfigured || !ready || opening}
    >
      {opening ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FolderOpen className="h-3.5 w-3.5" />
      )}
      Pick from Drive
    </Button>
  );
}
