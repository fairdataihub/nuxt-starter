import type { H3Event } from "h3";

type Bucket = { count: number; resetAt: number };

// In-memory fixed-window limiter. This is per server process: if you run
// multiple instances, swap this for a shared store (e.g. Redis via useStorage).
const buckets = new Map<string, Bucket>();

let lastSweep = Date.now();

const sweep = (now: number) => {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

/**
 * Throws a 429 once `key` has been hit more than `limit` times in `windowMs`.
 * The key is scoped by `name` and the client IP, plus an optional extra
 * discriminator (e.g. the email address being targeted).
 */
export const rateLimit = (
  event: H3Event,
  options: { name: string; limit: number; windowMs: number; extra?: string },
) => {
  const now = Date.now();

  sweep(now);

  // Only trusts X-Forwarded-For when xForwardedFor is enabled; behind a proxy,
  // make sure it sets this header and strips client-supplied values.
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
  const key = [options.name, ip, options.extra ?? ""].join(":");

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });

    return;
  }

  bucket.count += 1;

  if (bucket.count > options.limit) {
    setResponseHeader(
      event,
      "Retry-After",
      Math.ceil((bucket.resetAt - now) / 1000),
    );

    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests. Please try again later.",
    });
  }
};
