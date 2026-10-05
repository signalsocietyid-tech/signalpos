import { NextResponse } from "next/server";
import { deleteBranch, getBranch, updateBranch } from "@/lib/db";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (id === "semua") {
    return NextResponse.json({ ok: false, error: "Cabang agregat tidak bisa diubah." }, { status: 400 });
  }
  try {
    const b = await updateBranch(id, {
      ...(typeof body.nama === "string" ? { nama: body.nama.trim() } : {}),
      ...(typeof body.alamat === "string" ? { alamat: body.alamat } : {}),
      ...(typeof body.warna === "string" ? { warna: body.warna } : {}),
      ...(body.status === "Buka" || body.status === "Tutup" ? { status: body.status } : {}),
      ...(typeof body.kas === "number" ? { kas: Math.max(0, Math.round(body.kas)) } : {}),
    });
    if (!b) return NextResponse.json({ ok: false, error: "Cabang tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true, data: b });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal mengubah cabang." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (id === "semua") {
    return NextResponse.json({ ok: false, error: "Cabang agregat tidak bisa dihapus." }, { status: 400 });
  }
  try {
    if (!(await getBranch(id))) return NextResponse.json({ ok: false, error: "Cabang tidak ditemukan." }, { status: 404 });
    if (!(await deleteBranch(id))) return NextResponse.json({ ok: false, error: "Gagal menghapus cabang." }, { status: 400 });
    return NextResponse.json({ ok: true, data: { id } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menghapus cabang." }, { status: 500 });
  }
}
