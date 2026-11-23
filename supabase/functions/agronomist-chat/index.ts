import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * AgriGuard AI — "Ask AI Agronomist" Edge Function.
 *
 * The ONLY network-backed feature of the app. The Gemini key lives here as a
 * Supabase secret (GEMINI_API_KEY) and is read via Deno.env.get() — it never
 * reaches the browser. The client only POSTs here with a valid Supabase JWT.
 *
 * Auth: a valid Supabase JWT (Bearer header) is required and verified
 * server-side via supabase.auth.getUser(). Anonymous sign-in on the Supabase
 * project provides the session for the no-sign-up MVP.
 *
 * Rate limiting: simple in-process token bucket (10 requests / 60 s per user).
 */

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.6-flash";
const RATE_LIMIT_MAX = 10; // requests
const RATE_LIMIT_WINDOW_SEC = 60; // seconds
const MAX_HISTORY = 20; // messages sent to Gemini
const MAX_CONTENT_CHARS = 4000; // per message
const MAX_CONTEXT_CHARS = 1200; // diagnosis context blob

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
interface DiagnosisContext {
  crop?: string | null;
  diseaseId?: string;
  diseaseName?: string;
  family?: string;
  severity?: string;
  confidence?: number;
}

/** In-process token bucket, keyed by JWT subject (user id). */
const buckets = new Map<string, { tokens: number; last: number }>();

function takeToken(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now() / 1000;
  const bucket = buckets.get(key) ?? { tokens: RATE_LIMIT_MAX, last: now };
  const refill = ((now - bucket.last) / RATE_LIMIT_WINDOW_SEC) * RATE_LIMIT_MAX;
  bucket.tokens = Math.min(RATE_LIMIT_MAX, bucket.tokens + refill);
  bucket.last = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    const perSec = RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_SEC;
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((1 - bucket.tokens) / perSec)) };
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSec: 0 };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Validate + normalize the incoming message history. */
function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    if (role !== "user" && role !== "assistant") continue;
    const content = String((m as { content?: unknown }).content ?? "").trim();
    if (!content) continue;
    out.push({ role, content: content.slice(0, MAX_CONTENT_CHARS) });
  }
  return out.slice(-MAX_HISTORY);
}

function buildSystemPrompt(context: unknown): string {
  const base =
    'You are "AgriGuard AI", a friendly, practical agronomist embedded in a farmer\'s leaf-diagnosis app. ' +
    "Follow these rules:\n" +
    "1. Answer naturally in the same language the farmer used (English, हिंदी or Español).\n" +
    "2. Keep answers concise and actionable — short paragraphs or bullet lists, under ~180 words unless asked for more detail.\n" +
    "3. When diagnosis context is attached, explicitly use its crop and disease to tailor the answer. Connect recommendations to this crop-disease combination and reported severity; do not give only generic crop advice.\n" +
    "4. Treat the diagnosis as an estimate, not a confirmed lab result. Be transparent about its confidence and do not claim to have visually inspected the photo.\n" +
    "5. If the crop or diagnosis is missing, do not guess; ask a brief clarifying question when needed.\n" +
    "6. For chemical treatments, give practical guidance only, never invent brand claims — always tell the farmer to read the product label and consult a local agronomist for exact doses.\n" +
    "7. If the question is outside your knowledge, say so honestly instead of guessing.";
  let contextBlob = "";
  if (context && typeof context === "object") {
    try {
      contextBlob = JSON.stringify(context).slice(0, MAX_CONTEXT_CHARS);
    } catch {
      contextBlob = "";
    }
  }
  if (contextBlob) {
    return `${base}\n\nUse this current diagnosis as the context for the conversation (JSON; crop, disease, severity, confidence):\n${contextBlob}`;
  }
  return `${base}\n\n(No diagnosis attached — the farmer may still ask general agronomy questions.)`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    // 204 must carry a null body — `new Response("ok", {status: 204})` throws.
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  // ---- 1. Require + verify a valid Supabase JWT ----
  const auth = req.headers.get("Authorization") ?? "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!jwt) return json({ error: "auth", message: "missing JWT" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return json({ error: "auth", message: "auth not configured" }, 401);

  const sb = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const {
    data: { user },
    error: userError,
  } = await sb.auth.getUser();
  if (userError || !user) return json({ error: "unauthorized", message: "invalid JWT" }, 401);
  const userId = user.id;

  // ---- 2. Rate limit (token bucket per user) ----
  const rl = takeToken(userId);
  if (!rl.allowed) {
    return json({ error: "rate_limit", retryAfterSec: rl.retryAfterSec }, 429);
  }

  // ---- 3. Parse + sanitize body ----
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request", message: "invalid JSON body" }, 400);
  }
  const { messages, diagnosisContext } = (body ?? {}) as {
    messages?: unknown;
    diagnosisContext?: unknown;
  };
  const history = sanitizeMessages(messages);
  if (history.length === 0) {
    return json({ error: "bad_request", message: "messages array is empty" }, 400);
  }

  const system = buildSystemPrompt(diagnosisContext);
  // ---- 4. Call Gemini (server-side only) ----
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return json({ error: "not_configured", message: "Gemini is not configured" }, 503);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${GEMINI_URL}/${encodeURIComponent(MODEL)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: history.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: { temperature: 0.3, maxOutputTokens: 700 },
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      return json({ error: "timeout", message: "upstream timed out" }, 504);
    }
    return json({ error: "upstream_error", message: "could not reach the language model" }, 502);
  }

  if (!upstream.ok) {
    // Keep provider errors and credentials out of the client response.
    if (upstream.status === 401 || upstream.status === 403) {
      return json({ error: "not_configured", message: "Gemini API key is invalid" }, 503);
    }
    if (upstream.status === 429) {
      return json({ error: "upstream_rate_limit" }, 502);
    }
    return json({ error: "upstream_error" }, 502);
  }

  try {
    const data = (await upstream.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const reply = (data.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim();
    if (!reply) return json({ error: "upstream_error", message: "empty reply" }, 502);
    return json({ reply });
  } catch {
    return json({ error: "upstream_error", message: "unparseable reply" }, 502);
  }
});