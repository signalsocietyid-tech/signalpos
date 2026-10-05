import { NextResponse } from "next/server";
import { createExpense, listExpenses } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await listExpenses() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat pengeluaran." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  const jumlah = Number(body.jumlah);
  if (!Number.isFinite(jumlah) || jumlah <= 0) return NextResponse.json({ ok: false, error: "Jumlah harus > 0." }, { status: 400 });
  try {
    const rows = await createExpense({
      id: String(body.id ?? `EX-${Date.now()}`),
      tanggal: String(body.tanggal ?? new Date().toISOString().slice(0, 10)),
      kategori: String(body.kategori ?? "Operasional"),
      jumlah: Math.round(jumlah),
      cabang: String(body.cabang ?? ""),
      catatan: String(body.catatan ?? ""),
    });
    return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." }, { status: 500 });
  }
}
