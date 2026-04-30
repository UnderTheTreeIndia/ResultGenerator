import { NextRequest, NextResponse } from "next/server";
import { getIronSession, type IronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/auth/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login route and the auth API itself must be reachable while logged out.
  if (pathname === "/admin/login" || pathname === "/api/auth") {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const session: IronSession<SessionData> = await getIronSession(
    req,
    res,
    sessionOptions(),
  );
  if (session.authenticated) return res;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
