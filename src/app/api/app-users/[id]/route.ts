import { NextResponse } from "next/server";
import { deleteAppUser, updateAppUser } from "@/lib/db";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (body.role !== undefined && !["admin", "cabang", "kasir"].includes(String(body.role))) {
    return NextResponse.json({ ok: false, error: "Role tidak valid." }, { status: 400 });
  }
  try {
    const rows = await updateAppUser(id, body);
    if (!rows[0]) return NextResponse.json({ ok: false, error: "Pengguna tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true, data: rows[0] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal mengubah." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await deleteAppUser(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menghapus." }, { status: 500 });
  }
}
