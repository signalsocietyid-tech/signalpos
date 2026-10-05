import { NextResponse } from "next/server";
import { deletePurchase, updatePurchase } from "@/lib/db";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  const status = String(body.status ?? "");
  if (status !== "Diterima") return NextResponse.json({ ok: false, error: "Status hanya mendukung Diterima." }, { status: 400 });
  try {
    const rows = await updatePurchase(id, { status: "Diterima" });
    if (!rows[0]) return NextResponse.json({ ok: false, error: "Pembelian tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true, data: rows[0] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal mengubah." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await deletePurchase(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menghapus." }, { status: 500 });
  }
}
