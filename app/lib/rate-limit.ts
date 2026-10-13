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

/** Read the best-effort client IP from common proxy headers.
 *
 * @param trustedDepth  How many reverse proxies in front of this app we trust.
 *   `0` (default) — dev / no-proxy: take the leftmost entry of `X-Forwarded-For`
 *     (or `X-Real-IP`, or `"unknown"`). Simple, but trusts whatever the client sent.
 *   `N >= 1`      — production behind N proxies (e.g. caddy in front, depth=1):
 *     take the N-th entry from the right. Caddy appends the real client IP to XFF
 *     without stripping prior entries, so an attacker can prepend a spoofed IP.
 *     Picking the rightmost untrusted hop gives the IP that the trusted proxy
 *     actually saw. Falls back to leftmost if XFF is shorter than depth.
 *
 *   Sourced from `TRUSTED_PROXY_DEPTH` env (set in docker-compose to 1 for prod;
 *   unset → default 0 in dev). Per-call override allowed but rarely needed.
 */
export function getClientIp(req: Request, trustedDepth?: number): string {
  const depth = trustedDepth ?? Number(process.env.TRUSTED_PROXY_DEPTH ?? 0);
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      if (depth > 0 && parts.length >= depth) {
        // depth=1 → parts[length-1] (rightmost = the IP the trusted proxy appended)
        // depth=2 → parts[length-2] (skip the rightmost trusted, take the one before)
        const idx = parts.length - depth;
        if (parts[idx]) return parts[idx]!;
      }
      return parts[0]!;
    }
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
