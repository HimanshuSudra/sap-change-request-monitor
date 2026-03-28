import nodemailer from "nodemailer";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function createTransporter() {
  const user = getRequiredEnv("GMAIL_SMTP_USER");
  const pass = getRequiredEnv("GMAIL_SMTP_APP_PASSWORD");

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendProductionApprovalEmail(params: {
  to: string;
  trNumber: string;
  description: string | null;
  owner: string | null;
  requestLink?: string;
}) {
  const from = process.env.GMAIL_SMTP_FROM || getRequiredEnv("GMAIL_SMTP_USER");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trmsUrl = params.requestLink || `${appUrl}/trms`;

  const transporter = createTransporter();

  await transporter.sendMail({
    from,
    to: params.to,
    subject: `Production approval requested for ${params.trNumber}`,
    text: [
      "Hello Himanshu,",
      "",
      "A production import approval has been requested from TRMS.",
      "",
      `Transport Request: ${params.trNumber}`,
      `Owner: ${params.owner ?? "Unknown"}`,
      `Description: ${params.description ?? "No description available"}`,
      "",
      `Review in PCMS: ${trmsUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 12px">Production approval requested</h2>
        <p>A production import approval has been requested from TRMS.</p>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
          <tr><td><strong>Transport Request</strong></td><td>${params.trNumber}</td></tr>
          <tr><td><strong>Owner</strong></td><td>${params.owner ?? "Unknown"}</td></tr>
          <tr><td><strong>Description</strong></td><td>${params.description ?? "No description available"}</td></tr>
        </table>
        <p style="margin-top:16px">
          <a href="${trmsUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px">
            Open TRMS
          </a>
        </p>
      </div>
    `,
  });
}
