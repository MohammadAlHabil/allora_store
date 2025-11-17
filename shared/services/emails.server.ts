"use server";

import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SERVICE = process.env.SMTP_SERVICE || "gmail";
const SMTP_FROM = process.env.SMTP_FROM || `no-reply@${process.env.APP_URL ?? "localhost"}`;
const DISABLE_EMAIL = process.env.DISABLE_EMAIL === "true";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

const primaryTransporter =
  SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        service: SMTP_SERVICE,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    : nodemailer.createTransport({ jsonTransport: true });

const fallbackTransporter = nodemailer.createTransport({ jsonTransport: true });

const NETWORK_ERRORS = new Set([
  "ETIMEDOUT",
  "ESOCKET",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENETUNREACH",
]);

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  if (DISABLE_EMAIL) {
    console.info("Emails disabled (DISABLE_EMAIL=true). Skipping sendMail:", opts.to);
    return { success: true, skipped: true };
  }

  try {
    const info = await primaryTransporter.sendMail({
      from: SMTP_FROM,
      ...opts,
    });

    // const preview = nodemailer.getTestMessageUrl(info);
    // if (preview) console.info("Preview email:", preview);

    return { success: true };
  } catch (err) {
    const e = err as { code?: string; message?: string };
    console.warn("Primary email send failed:", e.message || e);

    if (e.code && NETWORK_ERRORS.has(e.code)) {
      try {
        await fallbackTransporter.sendMail({
          from: SMTP_FROM,
          ...opts,
        });

        console.info("Email captured via fallback jsonTransport.");
        return { success: true, fallback: true };
      } catch (e2) {
        console.warn("Fallback transport also failed:", (e2 as Error).message ?? e2);
      }
    }

    return { success: false, error: e.message };
  }
}

function buildUrl(type: "verify" | "reset", token: string) {
  const paths: Record<typeof type, string> = {
    verify: "verify-email",
    reset: "reset-password",
  };

  return `${APP_URL}/${paths[type]}/${token}`;
}

export async function sendVerificationEmail(email: string, token: string) {
  return sendMail({
    to: email,
    subject: "Verify Your Email",
    html: `<p>Click <a href="${buildUrl("verify", token)}">here</a> to verify your email.</p>`,
  });
}

export async function sendResetPasswordEmail(email: string, token: string) {
  return sendMail({
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click <a href="${buildUrl("reset", token)}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}
