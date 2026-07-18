import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "s10_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Copy .env.example to .env and fill it in.");
  }
  return new TextEncoder().encode(secret);
}

/** Parse ADMIN_USERS ("email:password,email2:password2") into a lookup map. */
function adminUsers(): Map<string, string> {
  const raw = process.env.ADMIN_USERS ?? "";
  const map = new Map<string, string>();
  for (const pair of raw.split(",")) {
    const idx = pair.indexOf(":");
    if (idx === -1) continue;
    const email = pair.slice(0, idx).trim().toLowerCase();
    const password = pair.slice(idx + 1); // password may itself contain ":"
    if (email) map.set(email, password);
  }
  return map;
}

/** Validate an email/password against the ADMIN_USERS allowlist. */
export function verifyCredentials(email: string, password: string): boolean {
  const users = adminUsers();
  const expected = users.get(email.trim().toLowerCase());
  return expected !== undefined && expected === password;
}

/** Issue a signed session cookie for the given admin email. */
export async function createSession(email: string): Promise<void> {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Returns the logged-in admin's email, or null if there is no valid session. */
export async function getSession(): Promise<{ email: string } | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.email === "string") return { email: payload.email };
    return null;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
