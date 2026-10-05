import { NextResponse } from "next/server";
import { getSettings, saveSettingsRow } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await getSettings() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal memuat pengaturan." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }
  try {
    const data = await saveSettingsRow({
      pajakPct: Math.min(100, Math.max(0, Number(body.pajakPct) || 0)),
      namaToko: String(body.namaToko ?? "SignalPOS Kebab"),
      alamatStruk: String(body.alamatStruk ?? ""),
      cetakOtomatis: body.cetakOtomatis !== false,
      strukHeader: String(body.strukHeader ?? ""),
      strukFooter: String(body.strukFooter ?? ""),
      tampilkanLogo: body.tampilkanLogo !== false,
      ukuranKertas: ["58mm", "80mm", "A4"].includes(String(body.ukuranKertas)) ? String(body.ukuranKertas) : "80mm",
    });
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." }, { status: 500 });
  }
}
