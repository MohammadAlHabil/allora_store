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

export async function sendOrderConfirmationEmail(
  email: string,
  orderData: {
    orderNumber: string;
    orderId: string;
    total: number;
    currency: string;
    items: Array<{
      title: string;
      quantity: number;
      unitPrice: number;
    }>;
    shippingAddress?: {
      firstName?: string | null;
      lastName?: string | null;
      line1?: string | null;
      city?: string | null;
      region?: string | null;
      postalCode?: string | null;
      country?: string | null;
    } | null;
  }
) {
  const itemsHtml = orderData.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${orderData.currency} ${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${orderData.currency} ${(item.quantity * item.unitPrice).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const shippingHtml = orderData.shippingAddress
    ? `
      <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
        <h3 style="margin-top: 0;">Shipping Address</h3>
        <p style="margin: 5px 0;">${orderData.shippingAddress.firstName || ""} ${orderData.shippingAddress.lastName || ""}</p>
        <p style="margin: 5px 0;">${orderData.shippingAddress.line1 || ""}</p>
        <p style="margin: 5px 0;">${orderData.shippingAddress.city || ""}, ${orderData.shippingAddress.region || ""} ${orderData.shippingAddress.postalCode || ""}</p>
        <p style="margin: 5px 0;">${orderData.shippingAddress.country || ""}</p>
      </div>
    `
    : "";

  return sendMail({
    to: email,
    subject: `Order Confirmation - ${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #DA5A2C; padding-bottom: 10px;">Order Confirmed!</h1>
        <p>Thank you for your order. Your order has been confirmed and will be processed soon.</p>

        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p style="margin: 5px 0;"><strong>Total:</strong> ${orderData.currency} ${orderData.total.toFixed(2)}</p>
        </div>

        <h2 style="color: #333; margin-top: 30px;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        ${shippingHtml}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
          <p>You can view your order details at <a href="${APP_URL}/orders/${orderData.orderId}" style="color: #DA5A2C;">My Orders</a></p>
          <p style="font-size: 12px; margin-top: 20px;">If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `,
  });
}
