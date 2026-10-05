import { NextResponse } from "next/server";
import { createOpname, listOpnames } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await listOpnames() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat opname." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!String(body.skuBahan ?? "").trim()) return NextResponse.json({ ok: false, error: "Bahan wajib dipilih." }, { status: 400 });
  if (!String(body.alasan ?? "").trim()) return NextResponse.json({ ok: false, error: "Alasan wajib diisi." }, { status: 400 });
  try {
    const sistem = Number(body.sistem) || 0;
    const fisik = Number(body.fisik) || 0;
    const rows = await createOpname({
      id: String(body.id ?? `OP-${Date.now()}`),
      tanggal: String(body.tanggal ?? new Date().toISOString().slice(0, 10)),
      skuBahan: String(body.skuBahan).trim(),
      namaBahan: String(body.namaBahan ?? ""),
      sistem,
      fisik,
      selisih: fisik - sistem,
      alasan: String(body.alasan).trim(),
      status: "Draft",
    });
    return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." }, { status: 500 });
  }
}
