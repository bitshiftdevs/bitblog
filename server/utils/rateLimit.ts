import type { H3Event } from "h3";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const getClientKey = (event: H3Event) => {
  const fwd =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-real-ip") ||
    getRequestHeader(event, "x-forwarded-for");
  const ip = fwd?.split(",")[0].trim() || event.node.req.socket?.remoteAddress || "unknown";
  return ip;
};

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  scope: string;
  keyFn?: (event: H3Event) => string;
}

/**
 * Throws 429 when the caller exceeds the allowed request rate.
 * Uses per-process memory; on serverless this is best-effort until upgraded to KV/Redis.
 */
export function enforceRateLimit(event: H3Event, opts: RateLimitOptions) {
  const now = Date.now();
  const key = `${opts.scope}:${opts.keyFn ? opts.keyFn(event) : getClientKey(event)}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    setResponseHeader(event, "x-ratelimit-limit", String(opts.max));
    setResponseHeader(event, "x-ratelimit-remaining", String(opts.max - 1));
    return;
  }

  if (existing.count >= opts.max) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    setResponseHeader(event, "retry-after", String(retryAfter));
    setResponseHeader(event, "x-ratelimit-limit", String(opts.max));
    setResponseHeader(event, "x-ratelimit-remaining", "0");
    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
    });
  }

  existing.count += 1;
  setResponseHeader(event, "x-ratelimit-limit", String(opts.max));
  setResponseHeader(event, "x-ratelimit-remaining", String(opts.max - existing.count));
}

// Periodic cleanup so the map does not grow unbounded on long-running processes.
if (typeof globalThis !== "undefined" && !(globalThis as any).__rlSweep) {
  (globalThis as any).__rlSweep = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }, 60_000);
  // Do not keep the event loop alive just for the sweep.
  (globalThis as any).__rlSweep?.unref?.();
}
