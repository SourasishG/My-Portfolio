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

function isValidFormspreeEndpoint(rawUrl: string | undefined): rawUrl is string {
  if (!rawUrl) return false;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.includes("your_form_id")) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
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
      message: "Message received — thank you for reaching out.",
    });
  }

  const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT;
  if (!isValidFormspreeEndpoint(formspreeEndpoint)) {
    return NextResponse.json(
      {
        ok: false,
        code: "PROVIDER_NOT_CONFIGURED",
        error:
          "Live Formspree delivery is not connected in this environment yet. Please email sourasishghosh062@gmail.com directly or use Copy Email.",
      },
      { status: 503 }
    );
  }

  try {
    const upstream = await fetch(formspreeEndpoint.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        subject: subject || "Portfolio Contact (SIGNAL)",
        message,
        _subject: subject
          ? `[SIGNAL] ${subject} — from ${name}`
          : `[SIGNAL] New inquiry from ${name}`,
        _replyto: email,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
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
        "Signal received — thank you for writing. Sourasish will respond by email soon.",
    });
  } catch {
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
