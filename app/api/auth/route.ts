import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSession } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 },
    );
  }

  const env = getEnv();
  const a = Buffer.from(password);
  const b = Buffer.from(env.ADMIN_PASSWORD);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const session = await getSession();
  session.authenticated = true;
  session.loginAt = Date.now();
  await session.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
