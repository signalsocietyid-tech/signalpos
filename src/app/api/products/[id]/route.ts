import { NextResponse } from "next/server";
import { deleteProduct, getProduct, listProducts, updateProduct } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const p = await getProduct(id);
  if (!p) return NextResponse.json({ ok: false, error: "Produk tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ ok: true, data: p });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (body.sku && (await listProducts({})).some((p) => p.id !== id && p.sku === String(body.sku))) {
    return NextResponse.json({ ok: false, error: "SKU sudah dipakai produk lain." }, { status: 400 });
  }
  const p = await updateProduct(id, {
    ...(typeof body.nama === "string" ? { nama: body.nama.trim() } : {}),
    ...(typeof body.sku === "string" ? { sku: body.sku.trim() } : {}),
    ...(typeof body.kategori === "string" ? { kategori: body.kategori } : {}),
    ...(typeof body.harga === "number" ? { harga: Math.max(0, Math.round(body.harga)) } : {}),
    ...(typeof body.hpp === "number" ? { hpp: Math.max(0, Math.round(body.hpp)) } : {}),
    ...(typeof body.stok === "number" ? { stok: Math.max(0, Math.round(body.stok)) } : {}),
    ...(body.status === "Aktif" || body.status === "Nonaktif" ? { status: body.status } : {}),
  });
  if (!p) return NextResponse.json({ ok: false, error: "Produk tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ ok: true, data: p });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!(await deleteProduct(id))) {
    return NextResponse.json({ ok: false, error: "Produk tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data: { id } });
}
