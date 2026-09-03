import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE, MEMBER_COOKIE, ROLE_COOKIE } from "@/app/lib/auth";

export async function GET() {
  const store = await cookies();
  store.delete(USER_COOKIE);
  store.delete(MEMBER_COOKIE);
  store.delete(ROLE_COOKIE);
  const base = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";
  return NextResponse.redirect(new URL("/", new URL(base)));
}
