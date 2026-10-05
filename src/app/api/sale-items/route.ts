import { NextResponse } from "next/server";
import { listSaleItems } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await listSaleItems() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat item penjualan." }, { status: 500 });
  }
}
