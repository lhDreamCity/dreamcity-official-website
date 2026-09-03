/**
 * HMAC-SHA256 sign/verify for cookie values.
 *
 * Threat model: stop clients from forging dcw_role / dcw_user / dcw_member to
 * escalate privileges. The role cookie value alone used to be plain text
 * ("admin"); now it's payload.signature where signature is HMAC over payload.
 *
 * Web Crypto API is used (not node:crypto) so the same module loads in both
 * the Node runtime (route handlers) and the Edge runtime (middleware).
 *
 * Failure mode: SESSION_SECRET must be set and >= 32 chars. If it isn't, this
 * module throws at import time rather than silently accepting unsigned cookies.
 */

const SECRET = process.env.SESSION_SECRET;

if (!SECRET || SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET env var is required and must be at least 32 chars. " +
      'Generate one with `openssl rand -base64 48` and add it to .env.local. ' +
      "See .env.local.example.",
  );
}

const ENC = new TextEncoder();

let keyPromise: Promise<CryptoKey> | null = null;
function getKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      "raw",
      ENC.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
  }
  return keyPromise;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let bin = "";
  for (const b of view) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): ArrayBuffer {
  let normalized = s.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) normalized += "=";
  const bin = atob(normalized);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

/** Sign a payload. Returns "payload.signature" format. */
export async function signValue(payload: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, ENC.encode(payload));
  return `${payload}.${toBase64Url(sig)}`;
}

/**
 * Verify a signed cookie value.
 * Returns the original payload if valid; null if missing, tampered, or
 * signed with a different secret.
 */
export async function verifyValue(
  signed: string | undefined,
): Promise<string | null> {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  // Must have a non-empty payload AND a non-empty signature.
  if (idx <= 0 || idx === signed.length - 1) return null;
  const payload = signed.slice(0, idx);
  const sigStr = signed.slice(idx + 1);
  try {
    const sig = fromBase64Url(sigStr);
    const key = await getKey();
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      sig,
      ENC.encode(payload),
    );
    return ok ? payload : null;
  } catch {
    return null;
  }
}
