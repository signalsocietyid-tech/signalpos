import { NextResponse } from "next/server";
import { createIngredient, listIngredients } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  try {
    return NextResponse.json({ ok: true, data: await listIngredients(searchParams.get("q") ?? undefined) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat bahan." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: { nama?: string; sku?: string; satuan?: string; stok?: number; minimum?: number; hargaRata?: number; cabang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!body.nama?.trim()) return NextResponse.json({ ok: false, error: "Nama bahan wajib diisi." }, { status: 400 });
  if (!body.sku?.trim()) return NextResponse.json({ ok: false, error: "SKU wajib diisi." }, { status: 400 });
  try {
    const result = await createIngredient({
      nama: body.nama.trim(),
      sku: body.sku.trim(),
      satuan: body.satuan?.trim() || "gram",
      stok: Number(body.stok) || 0,
      minimum: Number(body.minimum) || 0,
      hargaRata: Number(body.hargaRata) || 0,
      cabang: body.cabang?.trim() || "Cabang 2",
    });
    if ("error" in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true, data: result }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menambah bahan." }, { status: 500 });
  }
}
