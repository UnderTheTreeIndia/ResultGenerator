import { cookies } from "next/headers";
import {
  getIronSession,
  type IronSession,
  type SessionOptions,
} from "iron-session";
import { getEnv } from "@/lib/env";

export interface SessionData {
  authenticated?: boolean;
  loginAt?: number;
}

export function sessionOptions(): SessionOptions {
  const env = getEnv();
  return {
    password: env.SESSION_SECRET,
    cookieName: "utt_admin",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}
