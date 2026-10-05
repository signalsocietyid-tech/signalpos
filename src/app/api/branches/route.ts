import { NextResponse } from "next/server";
import { createBranch, listBranches } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await listBranches() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat cabang." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: { nama?: string; alamat?: string; warna?: string; status?: "Buka" | "Tutup"; kas?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!body.nama?.trim()) return NextResponse.json({ ok: false, error: "Nama cabang wajib diisi." }, { status: 400 });
  try {
    const data = await createBranch({
      nama: body.nama.trim(),
      alamat: body.alamat?.trim() ?? "",
      warna: body.warna ?? "#2563EB",
      status: body.status === "Tutup" ? "Tutup" : "Buka",
      transaksiHariIni: 0,
      omzetHariIni: 0,
      kas: Math.max(0, Math.round(Number(body.kas) || 0)),
    });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menambah cabang." }, { status: 500 });
  }
}
