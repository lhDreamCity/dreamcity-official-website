import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE, MEMBER_COOKIE } from "@/app/lib/auth";

export async function GET() {
  const store = await cookies();
  store.delete(USER_COOKIE);
  store.delete(MEMBER_COOKIE);
  return NextResponse.redirect(new URL("/", new URL(process.env.NEXTAUTH_URL || "http://localhost:3000")));
}
