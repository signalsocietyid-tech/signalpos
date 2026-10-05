import { NextResponse } from "next/server";
import { createSupplier, listSuppliers } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await listSuppliers() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat supplier." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!String(body.nama ?? "").trim()) return NextResponse.json({ ok: false, error: "Nama supplier wajib diisi." }, { status: 400 });
  try {
    const rows = await createSupplier({
      id: String(body.id ?? `S-${Date.now()}`),
      nama: String(body.nama).trim(),
      kontak: String(body.kontak ?? ""),
      termin: String(body.termin ?? "COD"),
      utang: Math.max(0, Math.round(Number(body.utang) || 0)),
    });
    return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." }, { status: 500 });
  }
}
