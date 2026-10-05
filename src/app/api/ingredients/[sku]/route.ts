import { NextResponse } from "next/server";
import { deleteIngredient, updateIngredient } from "@/lib/db";

export async function PUT(req: Request, ctx: { params: Promise<{ sku: string }> }) {
  const { sku } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  try {
    const r = await updateIngredient(sku, {
      ...(typeof body.stok === "number" ? { stok: body.stok } : {}),
      ...(typeof body.minimum === "number" ? { minimum: body.minimum } : {}),
      ...(typeof body.hargaRata === "number" ? { hargaRata: body.hargaRata } : {}),
      ...(typeof body.nama === "string" ? { nama: body.nama } : {}),
      ...(typeof body.satuan === "string" ? { satuan: body.satuan } : {}),
    });
    if (!r) return NextResponse.json({ ok: false, error: "Bahan tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true, data: r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal mengubah." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ sku: string }> }) {
  const { sku } = await ctx.params;
  try {
    if (!(await deleteIngredient(sku))) return NextResponse.json({ ok: false, error: "Bahan tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menghapus." }, { status: 500 });
  }
}
