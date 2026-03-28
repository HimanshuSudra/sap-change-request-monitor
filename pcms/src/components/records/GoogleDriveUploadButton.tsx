"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const DRIVE_UPLOAD_SCOPE = "https://www.googleapis.com/auth/drive.file";

type Props = {
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
};

type GoogleTokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

async function ensureGoogleScripts(): Promise<void> {
  const ensure = (id: string, src: string) =>
    new Promise<void>((resolve, reject) => {
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

  await ensure("google-gis-script", "https://accounts.google.com/gsi/client");
}

export function GoogleDriveUploadButton({
  onUpload,
  accept = ".ssf,.xml,.txt,.zip,.pdf,.doc,.docx",
  label = "Upload File",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const accessTokenRef = useRef("");
  const tokenClientRef = useRef<GoogleTokenClient | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const configured = Boolean(clientId);

  async function getToken(): Promise<string> {
    if (accessTokenRef.current) {
      return accessTokenRef.current;
    }

    await ensureGoogleScripts();

    if (!window.google?.accounts?.oauth2 || !clientId) {
      throw new Error("Google upload auth is not configured");
    }

    return new Promise<string>((resolve, reject) => {
      tokenClientRef.current =
        tokenClientRef.current ??
        window.google!.accounts!.oauth2!.initTokenClient({
          client_id: clientId,
          scope: DRIVE_UPLOAD_SCOPE,
          callback: (response) => {
            if (response.error || !response.access_token) {
              reject(new Error(response.error || "Google Drive authorization failed"));
              return;
            }
            accessTokenRef.current = response.access_token;
            resolve(response.access_token);
          },
        });

      tokenClientRef.current.requestAccessToken({
        prompt: accessTokenRef.current ? "" : "consent",
      });
    });
  }

  async function makeDomainReadable(fileId: string, token: string) {
    await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "domain",
        domain: "gulbrandsen.com",
      }),
    });
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      setUploading(true);
      const token = await getToken();

      const metadata = {
        name: file.name,
      };

      const formData = new FormData();
      formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      formData.append("file", file);

      const uploadResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }

      const uploaded = (await uploadResponse.json()) as {
        id?: string;
        webViewLink?: string;
        webContentLink?: string;
      };

      if (!uploaded.id) {
        throw new Error("Google Drive did not return a file ID");
      }

      await makeDomainReadable(uploaded.id, token);

      const finalUrl =
        uploaded.webViewLink ||
        uploaded.webContentLink ||
        `https://drive.google.com/file/d/${uploaded.id}/view`;

      onUpload(finalUrl);
      toast.success(`${file.name} uploaded to Google Drive`);
    } catch (error) {
      console.error("[Drive Upload Error]", error);
      toast.error(error instanceof Error ? error.message : "File upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelected}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 text-xs"
        disabled={!configured || uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {label}
      </Button>
    </>
  );
}
