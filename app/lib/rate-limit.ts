/**
 * Per-key in-memory token-bucket rate limiter.
 *
 * Single-process demo: works fine for the current single-Node server. For a
 * multi-instance deployment, swap the Map for Redis with INCR + EXPIRE.
 *
 * The cleanup timer is unref'd so it doesn't keep the process alive on shutdown.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL_MS = 5 * 60_000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (b.resetAt < now) buckets.delete(k);
  }
}, CLEANUP_INTERVAL_MS);
if (typeof cleanupTimer.unref === "function") cleanupTimer.unref();

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterMs: number };

/**
 * @param key   Identifier for the bucket (e.g. "login:1.2.3.4")
 * @param max   Max requests permitted in the window
 * @param windowMs  Window length in milliseconds
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  if (bucket.count >= max) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count++;
  return { allowed: true, remaining: max - bucket.count };
}

/** Read the best-effort client IP from common proxy headers. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
