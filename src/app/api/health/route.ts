import { NextResponse } from "next/server";
import { dbMode } from "@/lib/db";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "signalpos",
    db: dbMode(),
    time: new Date().toISOString(),
  });
}
