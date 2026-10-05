import { NextResponse } from "next/server";
import { createPurchase, listPurchases } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await listPurchases() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat pembelian." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!String(body.supplier ?? "").trim()) return NextResponse.json({ ok: false, error: "Supplier wajib diisi." }, { status: 400 });
  if (!String(body.skuBahan ?? "").trim()) return NextResponse.json({ ok: false, error: "Bahan wajib dipilih." }, { status: 400 });
  const qty = Number(body.qty);
  if (!Number.isFinite(qty) || qty <= 0) return NextResponse.json({ ok: false, error: "Qty harus > 0." }, { status: 400 });
  try {
    const harga = Math.max(0, Number(body.harga) || 0);
    const rows = await createPurchase({
      id: String(body.id ?? `PO-${Date.now()}`),
      tanggal: String(body.tanggal ?? new Date().toISOString().slice(0, 10)),
      supplier: String(body.supplier).trim(),
      skuBahan: String(body.skuBahan).trim(),
      namaBahan: String(body.namaBahan ?? ""),
      qty,
      satuan: String(body.satuan ?? "pcs"),
      harga,
      total: Math.round(qty * harga),
      status: "Draft",
    });
    return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." }, { status: 500 });
  }
}
