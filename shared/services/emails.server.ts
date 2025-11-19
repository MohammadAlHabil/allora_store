"use server";

import nodemailer from "nodemailer";
import { EmailServiceError } from "@/shared/lib/errors/server";
import { APP_URL } from "../constants/constant";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SERVICE = process.env.SMTP_SERVICE || "gmail";
const SMTP_FROM = process.env.SMTP_FROM || `no-reply@${APP_URL ?? "localhost"}`;
const DISABLE_EMAIL = process.env.DISABLE_EMAIL === "true";

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
    return { success: true, skipped: true };
  }

  try {
    const info = await primaryTransporter.sendMail({
      from: SMTP_FROM,
      ...opts,
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.info("Preview email:", preview);
    return { success: true };
  } catch (err) {
    const e = err as { code?: string; message?: string };

    // Try fallback for network errors
    if (e.code && NETWORK_ERRORS.has(e.code)) {
      try {
        await fallbackTransporter.sendMail({
          from: SMTP_FROM,
          ...opts,
        });

        return { success: true, fallback: true };
      } catch (e2) {
        const fallbackErr = e2 as Error;

        // Both transports failed - throw error with full details
        throw new EmailServiceError("Failed to send email after fallback attempt", {
          to: opts.to,
          subject: opts.subject,
          primaryError: e.message,
          fallbackError: fallbackErr.message,
        });
      }
    }

    // Non-network error - throw immediately
    throw new EmailServiceError(e.message || "Failed to send email", {
      to: opts.to,
      subject: opts.subject,
      code: e.code,
    });
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
