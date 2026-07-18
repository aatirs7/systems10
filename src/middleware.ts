import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "s10_session";

// Protects the admin UI. Machine API routes (/api/*) guard themselves with X-API-Key,
// and the login/auth routes must stay public, so both are excluded via the matcher below.
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET;

  let authed = false;
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      authed = true;
    } catch {
      authed = false;
    }
  }

  if (!authed) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except: login page, all API routes, and Next.js internals/assets.
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
