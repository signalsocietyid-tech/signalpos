import { NextResponse } from "next/server";
import { createTransfer, listTransfers } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await listTransfers() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat transfer." }, { status: 500 });
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
  if (!String(body.dari ?? "").trim() || !String(body.ke ?? "").trim()) return NextResponse.json({ ok: false, error: "Cabang asal & tujuan wajib diisi." }, { status: 400 });
  if (String(body.dari).trim() === String(body.ke).trim()) return NextResponse.json({ ok: false, error: "Cabang asal & tujuan harus beda." }, { status: 400 });
  const qty = Number(body.qty);
  if (!Number.isFinite(qty) || qty <= 0) return NextResponse.json({ ok: false, error: "Qty harus > 0." }, { status: 400 });
  try {
    const rows = await createTransfer({
      id: String(body.id ?? `TR-${Date.now()}`),
      tanggal: String(body.tanggal ?? new Date().toISOString().slice(0, 10)),
      skuBahan: String(body.skuBahan).trim(),
      namaBahan: String(body.namaBahan ?? ""),
      qty,
      satuan: String(body.satuan ?? "pcs"),
      dari: String(body.dari).trim(),
      ke: String(body.ke).trim(),
      status: "Terkirim",
    });
    return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." }, { status: 500 });
  }
}
