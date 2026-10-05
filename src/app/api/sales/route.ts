import { NextResponse } from "next/server";
import { createSale, listSales } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  try {
    const data = await listSales({
      cabang: searchParams.get("cabang") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    });
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat penjualan." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: { cabang?: string; kasir?: string; bayar?: string; items?: { id: string; qty: number }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!body.cabang?.trim()) return NextResponse.json({ ok: false, error: "Cabang wajib diisi." }, { status: 400 });
  if (!body.kasir?.trim()) return NextResponse.json({ ok: false, error: "Nama kasir wajib diisi." }, { status: 400 });
  try {
    const result = await createSale({
      cabang: body.cabang.trim(),
      kasir: body.kasir.trim(),
      bayar: body.bayar?.trim() || "Tunai",
      items: Array.isArray(body.items) ? body.items : [],
    });
    if ("error" in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true, data: result }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan penjualan." }, { status: 500 });
  }
}
