// Stateless session: "<expiresAt>.<hmac>" signed with SESSION_SECRET.
// Uses Web Crypto so it works in both Proxy and Route Handlers.
export const SESSION_COOKIE = "authkeep_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

async function hmac(data: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(sig).toString("base64url");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${exp}.${await hmac(String(exp))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(exp));
}

export async function checkPassword(given: string): Promise<boolean> {
  const expected = process.env.WEB_PASSWORD;
  if (!expected) return false;
  // Compare digests so the comparison does not leak the password length.
  const [a, b] = await Promise.all(
    [given, expected].map((v) => crypto.subtle.digest("SHA-256", encoder.encode(v))),
  );
  return safeEqual(Buffer.from(a).toString("hex"), Buffer.from(b).toString("hex"));
}
