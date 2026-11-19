import { NextResponse } from "next/server";
import { contactSubmissionSchema } from "@/lib/contact-schema";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

const ipSubmissionHistory = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "local-dev";
}

function checkRateLimit(clientKey: string, now: number): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const existing = ipSubmissionHistory.get(clientKey) ?? [];
  const activeTimestamps = existing.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (activeTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = activeTimestamps[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000)
    );
    ipSubmissionHistory.set(clientKey, activeTimestamps);
    return { allowed: false, retryAfterSeconds };
  }

  activeTimestamps.push(now);
  ipSubmissionHistory.set(clientKey, activeTimestamps);

  // Prune stale buckets if map grows in long-lived server processes
  if (ipSubmissionHistory.size > 500) {
    for (const [key, timestamps] of ipSubmissionHistory.entries()) {
      const fresh = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (fresh.length === 0) {
        ipSubmissionHistory.delete(key);
      } else {
        ipSubmissionHistory.set(key, fresh);
      }
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

function isValidResendApiKey(key: string | undefined): key is string {
  if (!key) return false;
  const trimmed = key.trim();
  if (!trimmed || trimmed.includes("your_api_key")) return false;
  return trimmed.length >= 10;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      {
        ok: false,
        code: "UNSUPPORTED_MEDIA_TYPE",
        error: "Requests must be submitted as application/json.",
      },
      { status: 415 }
    );
  }

  const now = Date.now();
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(clientIp, now);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMITED",
        retryAfterSeconds: rateCheck.retryAfterSeconds,
        error: `Too many requests in a short window. Please wait ${rateCheck.retryAfterSeconds}s or email sourasishghosh062@gmail.com directly.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.retryAfterSeconds),
        },
      }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_JSON",
        error: "Malformed JSON payload. Please review your entry and try again.",
      },
      { status: 400 }
    );
  }

  const parsed = contactSubmissionSchema.safeParse(rawBody);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return NextResponse.json(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        error: "Please fix the highlighted fields before sending.",
        fieldErrors: {
          name: flattened.fieldErrors.name?.[0],
          email: flattened.fieldErrors.email?.[0],
          subject: flattened.fieldErrors.subject?.[0],
          message: flattened.fieldErrors.message?.[0],
        },
      },
      { status: 400 }
    );
  }

  const { name, email, subject, message, company } = parsed.data;

  // Honeypot trap: accept silently without hitting email relay
  if (company.trim().length > 0) {
    return NextResponse.json({
      ok: true,
      message: "Transmission received — thank you for reaching out.",
    });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!isValidResendApiKey(resendApiKey)) {
    return NextResponse.json(
      {
        ok: false,
        code: "PROVIDER_NOT_CONFIGURED",
        error:
          "Live Resend email delivery is not configured in this environment yet. Please email sourasishghosh062@gmail.com directly or use Copy Email.",
      },
      { status: 503 }
    );
  }

  const toEmail = process.env.CONTACT_TO_EMAIL || "sourasishghosh062@gmail.com";
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "SIGNAL Portfolio <onboarding@resend.dev>";
  const emailSubject = subject?.trim()
    ? `[SIGNAL] ${subject.trim()} — from ${name.trim()}`
    : `[SIGNAL] New inquiry from ${name.trim()}`;

  const plainText = `SIGNAL PORTFOLIO // INCOMING TRANSMISSION
----------------------------------------
From:    ${name} <${email}>
Subject: ${subject?.trim() || "General Inquiry / Collaboration"}
Date:    ${new Date().toISOString()}
IP:      ${clientIp}

Message:
${message}

----------------------------------------
Reply directly to this email to respond to ${name}.`;

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(emailSubject)}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #07080b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e6eb;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #0e1017; border: 1px solid #232733; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="padding: 24px 32px; background-color: #141722; border-bottom: 1px solid #232733;">
        <span style="font-family: monospace; font-size: 11px; letter-spacing: 0.14em; color: #ff5500; text-transform: uppercase;">SIGNAL // INCOMING TRANSMISSION</span>
        <h1 style="margin: 8px 0 0; font-size: 20px; font-weight: 600; color: #ffffff;">New Portfolio Inquiry</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
          <tr>
            <td style="padding-bottom: 8px; font-size: 13px; color: #8b92a5; width: 90px;">From:</td>
            <td style="padding-bottom: 8px; font-size: 14px; color: #ffffff; font-weight: 500;">
              ${escapeHtml(name)} &lt;<a href="mailto:${escapeHtml(email)}" style="color: #4da8ff; text-decoration: none;">${escapeHtml(email)}</a>&gt;
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 8px; font-size: 13px; color: #8b92a5;">Subject:</td>
            <td style="padding-bottom: 8px; font-size: 14px; color: #ffffff;">
              ${escapeHtml(subject?.trim() || "General Inquiry / Collaboration")}
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 8px; font-size: 13px; color: #8b92a5;">Received:</td>
            <td style="padding-bottom: 8px; font-size: 13px; color: #b4bac8;">
              ${new Date().toUTCString()}
            </td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #8b92a5;">Client IP:</td>
            <td style="font-size: 13px; color: #b4bac8; font-family: monospace;">
              ${escapeHtml(clientIp)}
            </td>
          </tr>
        </table>

        <div style="margin-top: 16px; padding: 20px; background-color: #07080b; border: 1px solid #1f232e; border-radius: 6px;">
          <p style="margin: 0 0 8px; font-size: 11px; font-family: monospace; letter-spacing: 0.08em; color: #8b92a5; text-transform: uppercase;">Message Content</p>
          <div style="font-size: 15px; line-height: 1.6; color: #f0f2f5; white-space: pre-wrap; word-break: break-word;">${escapeHtml(message)}</div>
        </div>

        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #232733; font-size: 12px; color: #6e7687; line-height: 1.5;">
          Hit <strong>Reply</strong> directly in your mail client to respond to ${escapeHtml(name)} at <code style="color: #4da8ff;">${escapeHtml(email)}</code>.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const upstream = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: emailSubject,
        text: plainText,
        html: htmlBody,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      const errorData = (await upstream.json().catch(() => null)) as
        | { message?: string; name?: string }
        | null;
      console.error("[/api/contact] Resend upstream error:", upstream.status, errorData);

      if (upstream.status === 429) {
        return NextResponse.json(
          {
            ok: false,
            code: "UPSTREAM_RATE_LIMITED",
            error:
              "The email delivery rate limit was reached. Please try again shortly or email sourasishghosh062@gmail.com directly.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          code: "UPSTREAM_ERROR",
          error:
            "The mail relay could not deliver this message right now. Please try again shortly or email sourasishghosh062@gmail.com directly.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Transmission received — thank you for reaching out. Sourasish will respond by email soon.",
    });
  } catch (err) {
    console.error("[/api/contact] Network or dispatch failure:", err);
    return NextResponse.json(
      {
        ok: false,
        code: "NETWORK_ERROR",
        error:
          "Timed out reaching the mail relay. Please try again or email sourasishghosh062@gmail.com directly.",
      },
      { status: 502 }
    );
  }
}
