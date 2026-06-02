/**
 * POST /api/contact
 *
 * Receives a contact form submission and sends an email to
 * bintangmuhammad12@gmail.com via Resend.
 *
 * Expects JSON body: { name, email, subject, message }
 * Returns: { ok: true } or { ok: false, error: string }
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validate } from "@/services/contact";

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "bintangmuhammad354@gmail.com";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  // Reuse the existing validation logic
  const input = body as {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
  const validation = validate(input);
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, fieldErrors: validation.fieldErrors },
      { status: 422 },
    );
  }

  try {
    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        "Portfolio Contact <onboarding@resend.dev>",
      to: [TO_EMAIL],
      replyTo: input.email,
      subject: `[Portfolio] ${input.subject}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f0f0ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0e0e1a 0%,#141428 100%);border-radius:16px 16px 0 0;padding:40px 40px 32px;border:1px solid #1e1e38;border-bottom:none;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#00ff88;">Portfolio Contact</p>
                    <h1 style="margin:0;font-size:28px;font-weight:800;color:#f0f0ff;letter-spacing:-0.02em;">New Message 📬</h1>
                    <p style="margin:8px 0 0;font-size:14px;color:#9090b0;">Someone reached out through your portfolio contact form.</p>
                  </td>
                  <td align="right" valign="top">
                    <div style="width:48px;height:48px;background:linear-gradient(135deg,rgba(0,255,136,0.15),rgba(124,58,237,0.15));border:1px solid rgba(0,255,136,0.3);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;line-height:48px;text-align:center;">✉️</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Info -->
          <tr>
            <td style="background:#0e0e1a;padding:0 40px;border:1px solid #1e1e38;border-top:none;border-bottom:none;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e38;padding-top:28px;padding-bottom:28px;">
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#606080;">Sender Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #1e1e38;width:90px;font-size:12px;color:#606080;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Name</td>
                        <td style="padding:10px 0;border-bottom:1px solid #1e1e38;font-size:15px;font-weight:700;color:#f0f0ff;">${escapeHtml(
                          input.name,
                        )}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #1e1e38;font-size:12px;color:#606080;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Email</td>
                        <td style="padding:10px 0;border-bottom:1px solid #1e1e38;">
                          <a href="mailto:${escapeHtml(
                            input.email,
                          )}" style="font-size:15px;color:#00ff88;text-decoration:none;font-weight:600;">${escapeHtml(
        input.email,
      )}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;font-size:12px;color:#606080;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Subject</td>
                        <td style="padding:10px 0;font-size:15px;color:#f0f0ff;font-weight:600;">${escapeHtml(
                          input.subject,
                        )}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="background:#0e0e1a;padding:0 40px 32px;border:1px solid #1e1e38;border-top:none;border-bottom:none;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#606080;">Message</p>
              <div style="background:#050508;border:1px solid #1e1e38;border-radius:12px;padding:24px;border-left:3px solid #00ff88;">
                <p style="margin:0;font-size:15px;line-height:1.8;color:#c0c0d8;white-space:pre-wrap;">${escapeHtml(
                  input.message,
                )}</p>
              </div>
            </td>
          </tr>

          <!-- Reply CTA -->
          <tr>
            <td style="background:#0e0e1a;padding:24px 40px 32px;border:1px solid #1e1e38;border-top:none;border-bottom:none;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${escapeHtml(
                      input.email,
                    )}?subject=Re: ${escapeHtml(input.subject)}"
                       style="display:inline-block;padding:14px 32px;background:#00ff88;color:#050508;font-weight:700;font-size:15px;border-radius:8px;text-decoration:none;letter-spacing:-0.01em;">
                      Reply to ${escapeHtml(input.name)} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#050508;border:1px solid #1e1e38;border-top:1px solid #1e1e38;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#606080;">
                Received via <a href="https://stareezy.tech/contact" style="color:#00ff88;text-decoration:none;">stareezy.tech/contact</a>
                &nbsp;·&nbsp; Reply-to is set to the sender's email
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return NextResponse.json(
        {
          ok: false,
          error: `Resend error: ${error.message ?? JSON.stringify(error)}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
