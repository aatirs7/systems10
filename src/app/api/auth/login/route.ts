import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCredentials, createSession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/auth/login  { email, password } -> sets the signed session cookie.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  if (!verifyCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(email);
  return NextResponse.json({ ok: true });
}
