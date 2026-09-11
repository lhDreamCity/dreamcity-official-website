import { NextResponse } from "next/server";
import { client } from "@/app/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  let dbOk = false;
  let dbError: string | undefined;
  try {
    const result = await client.execute("SELECT 1 AS ok");
    dbOk = result.rows.length === 1;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(
    {
      status: dbOk ? "ok" : "degraded",
      service: "dreamcity-web",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: { ok: dbOk, error: dbError },
    },
    { status: dbOk ? 200 : 503 }
  );
}
