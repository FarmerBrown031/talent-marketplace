const SECRET = process.env.SESSION_SECRET;

if (!SECRET) {
  throw new Error("SESSION_SECRET is required");
}

if (
  process.env.NODE_ENV === "production" &&
  SECRET === "change-me-to-a-random-string"
) {
  throw new Error(
    "SESSION_SECRET must be changed from the .env.template default in production"
  );
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

let cachedKey: Promise<CryptoKey> | null = null;

function getKey(): Promise<CryptoKey> {
  if (!cachedKey) {
    cachedKey = crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return cachedKey;
}

function b64urlEncode(bytes: ArrayBuffer): string {
  let str = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): ArrayBuffer {
  const padded =
    s.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((s.length + 3) % 4);
  const raw = atob(padded);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out.buffer;
}

export async function signSession(companyId: string): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${companyId}.${exp}`;
  const sig = await crypto.subtle.sign(
    "HMAC",
    await getKey(),
    encoder.encode(payload)
  );
  return `${payload}.${b64urlEncode(sig)}`;
}

export async function verifySession(
  token: string
): Promise<{ companyId: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [companyId, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  const ok = await crypto.subtle.verify(
    "HMAC",
    await getKey(),
    b64urlDecode(sig),
    encoder.encode(`${companyId}.${expStr}`)
  );
  if (!ok) return null;
  return { companyId };
}
