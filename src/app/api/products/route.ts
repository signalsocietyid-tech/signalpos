import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = await listProducts({
    q: searchParams.get("q") ?? undefined,
    kategori: searchParams.get("kategori") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  let body: { nama?: string; sku?: string; kategori?: string; harga?: number; hpp?: number; status?: "Aktif" | "Nonaktif"; stok?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!body.nama?.trim()) return NextResponse.json({ ok: false, error: "Nama produk wajib diisi." }, { status: 400 });
  if (!body.sku?.trim()) return NextResponse.json({ ok: false, error: "SKU wajib diisi." }, { status: 400 });
  const harga = Number(body.harga);
  if (!Number.isFinite(harga) || harga < 0) {
    return NextResponse.json({ ok: false, error: "Harga harus angka >= 0." }, { status: 400 });
  }
  if ((await listProducts({})).some((p) => p.sku === body.sku!.trim())) {
    return NextResponse.json({ ok: false, error: "SKU sudah dipakai." }, { status: 400 });
  }
  const data = await createProduct({
    nama: body.nama.trim(),
    sku: body.sku.trim(),
    kategori: body.kategori?.trim() || "Kebab",
    harga: Math.round(harga),
    hpp: Math.max(0, Math.round(Number(body.hpp) || 0)),
    status: body.status === "Nonaktif" ? "Nonaktif" : "Aktif",
    stok: Math.max(0, Math.round(Number(body.stok) || 0)),
  });
  return NextResponse.json({ ok: true, data }, { status: 201 });
}
