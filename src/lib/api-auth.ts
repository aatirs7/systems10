import { NextResponse } from "next/server";

/**
 * Guard for machine endpoints called by Make.com / Clay / Instantly.
 * Checks the shared secret in the `X-API-Key` header against the API_KEY env var.
 *
 * Returns a 401 NextResponse when the key is missing/wrong, or null when authorized.
 * Usage:
 *   const unauthorized = requireApiKey(req);
 *   if (unauthorized) return unauthorized;
 */
export function requireApiKey(req: Request): NextResponse | null {
  const expected = process.env.API_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "Server misconfigured: API_KEY is not set." },
      { status: 500 },
    );
  }
  const provided = req.headers.get("x-api-key");
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
