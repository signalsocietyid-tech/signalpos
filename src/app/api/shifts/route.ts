import { NextResponse } from "next/server";
import { createShift, listShifts } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await listShifts() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat shift." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!String(body.cabang ?? "").trim()) return NextResponse.json({ ok: false, error: "Cabang wajib diisi." }, { status: 400 });
  if (!String(body.kasir ?? "").trim()) return NextResponse.json({ ok: false, error: "Kasir wajib diisi." }, { status: 400 });
  try {
    const data = await createShift({
      id: String(body.id ?? `SH-${Date.now()}`),
      cabang: String(body.cabang).trim(),
      kasir: String(body.kasir).trim(),
      kasAwal: Math.max(0, Math.round(Number(body.kasAwal) || 0)),
      mulai: String(body.mulai ?? new Date().toTimeString().slice(0, 5)),
      status: "buka",
      kasAkhir: 0,
      selisih: 0,
      selesai: "",
      catatan: "",
    });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." }, { status: 500 });
  }
}
