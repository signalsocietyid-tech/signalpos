import { NextResponse } from "next/server";
import { createAppUser, listAppUsers } from "@/lib/db";

const ROLES = ["admin", "cabang", "kasir"];

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await listAppUsers() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat pengguna." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!String(body.nama ?? "").trim()) return NextResponse.json({ ok: false, error: "Nama wajib diisi." }, { status: 400 });
  if (!String(body.username ?? "").trim()) return NextResponse.json({ ok: false, error: "Username wajib diisi." }, { status: 400 });
  if (!ROLES.includes(String(body.role))) return NextResponse.json({ ok: false, error: "Role tidak valid." }, { status: 400 });
  try {
    const rows = await createAppUser({
      id: String(body.id ?? `U-${Date.now()}`),
      nama: String(body.nama).trim(),
      username: String(body.username).toLowerCase().trim(),
      role: String(body.role) as "admin" | "cabang" | "kasir",
      cabang: String(body.cabang ?? ""),
    });
    return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." }, { status: 500 });
  }
}
