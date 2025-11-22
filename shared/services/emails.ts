"use server";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail(opts: { to: string; subject: string; html: string }) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  // If using an Ethereal test account, log the preview URL to the server console.
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.info("Preview email:", preview);
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.APP_URL}/verify-email/${token}`;
  await sendMail({
    to: email,
    subject: "Verify Your Email",
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  });
}

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.APP_URL}/reset-password/${token}`;
  await sendMail({
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}

export async function sendContactEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #495057; display: block; margin-bottom: 5px; }
          .value { color: #212529; }
          .message-box { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 10px; }
          .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; color: #212529;">New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">From:</span>
              <span class="value">${data.firstName} ${data.lastName}</span>
            </div>

            <div class="field">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${data.email}">${data.email}</a></span>
            </div>

            ${
              data.phone
                ? `
            <div class="field">
              <span class="label">Phone:</span>
              <span class="value"><a href="tel:${data.phone}">${data.phone}</a></span>
            </div>
            `
                : ""
            }

            <div class="field">
              <span class="label">Subject:</span>
              <span class="value">${data.subject}</span>
            </div>

            <div class="field">
              <span class="label">Message:</span>
              <div class="message-box">
                ${data.message.replace(/\n/g, "<br>")}
              </div>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0;">This message was sent from the Allora Store contact form</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Send email to store
  await sendMail({
    to: process.env.CONTACT_EMAIL || "allora.store.co@gmail.com",
    subject: `Contact Form: ${data.subject}`,
    html,
  });

  // Send confirmation email to customer
  const confirmationHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; color: #212529;">Thank You for Contacting Us!</h2>
          </div>
          <div class="content">
            <p>Hi ${data.firstName},</p>

            <p>Thank you for reaching out to Allora Store. We've received your message and our team will get back to you within 24 hours.</p>

            <p><strong>Your message:</strong></p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
              ${data.message.replace(/\n/g, "<br>")}
            </div>

            <p>If you have any urgent concerns, please feel free to call us at <a href="tel:+15551234567">+1 (555) 123-4567</a>.</p>

            <p>Best regards,<br>The Allora Store Team</p>
          </div>
          <div class="footer">
            <p style="margin: 0;">Allora Store - Your Fashion Destination</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Send confirmation to customer
  await sendMail({
    to: data.email,
    subject: "We've Received Your Message - Allora Store",
    html: confirmationHtml,
  });
}
