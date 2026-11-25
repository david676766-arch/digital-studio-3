import { NextResponse } from "next/server";

/**
 * Project inquiry endpoint.
 *
 * Delivery channels (configure at least one — see README / .env.example):
 *   - Telegram bot:   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 *   - Any webhook:    CONTACT_WEBHOOK_URL (Zapier, Make, n8n, Slack, your CRM…)
 *
 * Without a configured channel the endpoint answers 503 { error: "not_configured" }
 * and the website tells the visitor that the message was NOT sent.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SERVICES = new Set(["web", "video", "ads", "brand", "other"]);

type Payload = Record<string, unknown>;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: silently accept bot submissions without processing them
  if (str(body.website, 200)) return NextResponse.json({ ok: true });

  const entry = {
    name: str(body.name, 200),
    email: str(body.email, 320),
    service: SERVICES.has(str(body.service, 20)) ? str(body.service, 20) : "",
    serviceLabel: str(body.serviceLabel, 120),
    budget: str(body.budget, 80) || null,
    message: str(body.message, 5000),
    locale: str(body.locale, 5),
    receivedAt: new Date().toISOString(),
  };

  const errors: string[] = [];
  if (!entry.name) errors.push("name");
  if (!EMAIL_RE.test(entry.email)) errors.push("email");
  if (!entry.service) errors.push("service");
  if (entry.message.length < 20) errors.push("message");
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const webhook = process.env.CONTACT_WEBHOOK_URL;

  const jobs: Promise<void>[] = [];

  if (token && chatId) {
    const text = [
      "New project inquiry — DIGITAL STUDIO website",
      "",
      `Name: ${entry.name}`,
      `Email: ${entry.email}`,
      `Service: ${entry.serviceLabel || entry.service}`,
      entry.budget ? `Budget: ${entry.budget}` : null,
      `Language: ${entry.locale}`,
      "",
      entry.message,
    ]
      .filter((l) => l !== null)
      .join("\n");
    jobs.push(
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      }).then((res) => {
        if (!res.ok) throw new Error(`Telegram responded ${res.status}`);
      }),
    );
  }

  if (webhook) {
    jobs.push(
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "digital-studio-website", ...entry }),
      }).then((res) => {
        if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      }),
    );
  }

  if (jobs.length === 0) {
    console.warn("[contact] Inquiry NOT delivered: no delivery channel configured (see README).");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const results = await Promise.allSettled(jobs);
  const delivered = results.some((r) => r.status === "fulfilled");
  results.forEach((r) => r.status === "rejected" && console.error("[contact] delivery failed:", r.reason));

  if (!delivered) return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
