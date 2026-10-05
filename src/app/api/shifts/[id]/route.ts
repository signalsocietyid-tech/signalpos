import { NextResponse } from "next/server";
import { updateShift } from "@/lib/db";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  try {
    const data = await updateShift(id, {
      status: "tutup",
      kasAkhir: Math.max(0, Math.round(Number(body.kasAkhir) || 0)),
      selisih: Math.round(Number(body.selisih) || 0),
      selesai: String(body.selesai ?? ""),
      catatan: String(body.catatan ?? ""),
    });
    if (!data) return NextResponse.json({ ok: false, error: "Shift tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal mengubah." }, { status: 500 });
  }
}
