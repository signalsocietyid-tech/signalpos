import { NextResponse } from "next/server";
import { createAudit, listAudit } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await listAudit() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat audit." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!String(body.aksi ?? "").trim()) return NextResponse.json({ ok: false, error: "Aksi wajib diisi." }, { status: 400 });
  try {
    const d = new Date();
    const rows = await createAudit({
      id: String(body.id ?? `A-${Date.now()}`),
      waktu: String(body.waktu ?? `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`),
      aksi: String(body.aksi).trim(),
      detail: String(body.detail ?? ""),
    });
    return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." }, { status: 500 });
  }
}
