"use client";

import { useEffect, useState } from "react";
import { Badge, Field, PageHeader, inputCls } from "@/components/ui";
import { useDB, rupiah } from "@/store/db";
import { useAuth, roleLabel } from "@/store/auth";

const LEBAR_KERTAS: Record<string, string> = { "58mm": "220px", "80mm": "300px", A4: "100%" };

export default function PengaturanPage() {
  const { settings, saveSettings, resetAll } = useDB();
  const { session, login } = useAuth();
  const [form, setForm] = useState(settings);
  const [nama, setNama] = useState(session?.nama ?? "");
  const [ok, setOk] = useState(false);
  const [tes, setTes] = useState(false);
  const berubah = JSON.stringify(form) !== JSON.stringify(settings);

  useEffect(() => {
    if (!tes) return;
    const t = setTimeout(() => {
      window.print();
      setTes(false);
    }, 400);
    return () => clearTimeout(t);
  }, [tes]);

  function simpan() {
    saveSettings({ ...form, pajakPct: Math.min(100, Math.max(0, Number(form.pajakPct) || 0)) });
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  }

  function simpanProfil() {
    if (!session || !nama.trim()) return;
    login({ ...session, nama: nama.trim() });
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Pengaturan" desc="Profil, toko, printer, dan desain struk. Tersimpan ke Supabase bila backend aktif." />

      {/* ===== profil ===== */}
      <div className="card grid gap-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Profil saya</p>
          {session && <Badge tone="info">{roleLabel(session.role)}</Badge>}
        </div>
        <Field label="Nama tampilan"><input className={inputCls} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="cth. Andi" /></Field>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-[#F8FAFC] px-3 py-2.5"><p className="text-[11px] font-bold uppercase text-slate-400">Username</p><p className="tnum font-bold">@{session?.username ?? "—"}</p></div>
          <div className="rounded-xl bg-[#F8FAFC] px-3 py-2.5"><p className="text-[11px] font-bold uppercase text-slate-400">Cabang</p><p className="font-bold">{session?.cabangId ?? "Semua cabang"}</p></div>
        </div>
        <button onClick={simpanProfil} disabled={!nama.trim() || nama.trim() === session?.nama} className="press w-full rounded-2xl border border-[#2563EB] py-2.5 text-sm font-bold text-[#1D4ED8] hover:bg-[#EFF6FF] disabled:opacity-40">
          Simpan profil
        </button>
        <p className="text-[11px] text-slate-400">Demo: role & password dikelola di layar login. Ganti nama langsung berlaku di struk & shift.</p>
      </div>

      {/* ===== toko & pajak ===== */}
      <div className="card mt-4 grid gap-4 p-5">
        <p className="text-sm font-bold">Toko & pajak</p>
        <Field label="Pajak POS (%)" hint="Dipakai menghitung pajak di kasir & struk.">
          <input type="number" min={0} max={100} className={inputCls} value={form.pajakPct} onChange={(e) => setForm({ ...form, pajakPct: Number(e.target.value) })} />
        </Field>
        <Field label="Nama toko (struk)"><input className={inputCls} value={form.namaToko} onChange={(e) => setForm({ ...form, namaToko: e.target.value })} /></Field>
        <Field label="Alamat struk"><input className={inputCls} value={form.alamatStruk} onChange={(e) => setForm({ ...form, alamatStruk: e.target.value })} /></Field>
      </div>

      {/* ===== printer ===== */}
      <div className="card mt-4 grid gap-4 p-5">
        <p className="text-sm font-bold">Printer</p>
        <Field label="Ukuran kertas" hint="Browser memakai dialog cetak sistem — pilih printer & Save as PDF di sana.">
          <select className={inputCls} value={form.ukuranKertas} onChange={(e) => setForm({ ...form, ukuranKertas: e.target.value as "58mm" | "80mm" | "A4" })}>
            <option value="58mm">Thermal 58mm</option>
            <option value="80mm">Thermal 80mm</option>
            <option value="A4">A4 / Letter</option>
          </select>
        </Field>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#E2E8F0] px-3.5 py-3">
          <span>
            <span className="block text-sm font-bold">Dialog cetak otomatis</span>
            <span className="block text-xs text-slate-500">Buka dialog cetak setiap pembayaran berhasil</span>
          </span>
          <button
            role="switch"
            aria-checked={form.cetakOtomatis}
            onClick={() => setForm({ ...form, cetakOtomatis: !form.cetakOtomatis })}
            className={`press relative h-7 w-12 rounded-full transition ${form.cetakOtomatis ? "bg-[#2563EB]" : "bg-[#E2E8F0]"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${form.cetakOtomatis ? "left-6" : "left-1"}`} />
          </button>
        </label>
        <button onClick={() => setTes(true)} className="press w-full rounded-2xl border border-[#E2E8F0] py-2.5 text-sm font-bold hover:bg-[#F1F5F9]">
          🖨 Tes cetak
        </button>
      </div>

      {/* ===== desain struk ===== */}
      <div className="card mt-4 grid gap-4 p-5">
        <p className="text-sm font-bold">Desain struk / invoice</p>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#E2E8F0] px-3.5 py-3">
          <span className="text-sm font-bold">Tampilkan logo/inisial toko</span>
          <button
            role="switch"
            aria-checked={form.tampilkanLogo}
            onClick={() => setForm({ ...form, tampilkanLogo: !form.tampilkanLogo })}
            className={`press relative h-7 w-12 rounded-full transition ${form.tampilkanLogo ? "bg-[#2563EB]" : "bg-[#E2E8F0]"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${form.tampilkanLogo ? "left-6" : "left-1"}`} />
          </button>
        </label>
        <Field label="Header tambahan" hint="Baris di bawah nama toko, cth. promo / jam operasional."><input className={inputCls} value={form.strukHeader} onChange={(e) => setForm({ ...form, strukHeader: e.target.value })} placeholder="cth. Buka 08.00–22.00 setiap hari" /></Field>
        <Field label="Footer struk"><input className={inputCls} value={form.strukFooter} onChange={(e) => setForm({ ...form, strukFooter: e.target.value })} /></Field>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Pratinjau ({form.ukuranKertas})</p>
          <div className="rounded-xl bg-[#F1F5F9] p-4">
            <div className="mx-auto rounded-lg bg-white p-4 text-center shadow-sm" style={{ maxWidth: LEBAR_KERTAS[form.ukuranKertas] }}>
              {form.tampilkanLogo && (
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-sm font-black text-white">
                  {form.namaToko.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="mt-1 text-sm font-black">{form.namaToko || "Nama Toko"}</p>
              <p className="text-[11px] text-slate-500">{form.alamatStruk}</p>
              {form.strukHeader && <p className="mt-1 text-[11px] text-slate-600">{form.strukHeader}</p>}
              <div className="tnum my-2 border-t border-dashed border-[#E2E8F0] pt-2 text-left text-[12px]">
                <div className="flex justify-between"><span>Kebab Beef ×2</span><span className="font-bold">{rupiah(50000)}</span></div>
                <div className="flex justify-between font-black"><span>Total</span><span>{rupiah(52500)}</span></div>
              </div>
              <p className="text-[11px] text-slate-500">{form.strukFooter}</p>
            </div>
          </div>
        </div>
        <button onClick={simpan} disabled={!berubah} className="press w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-40">
          {ok ? "✓ Tersimpan" : "Simpan semua pengaturan"}
        </button>
      </div>

      {/* ===== zona berbahaya ===== */}
      <div className="card mt-4 p-5">
        <p className="text-sm font-bold text-red-700">Zona berbahaya</p>
        <p className="mt-1 text-xs text-slate-500">Kembalikan semua data demo ke awal (hanya perangkat ini; data Supabase tidak ikut terhapus).</p>
        <button
          onClick={() => { if (window.confirm("Reset SEMUA data ke awal?")) { resetAll(); } }}
          className="press mt-3 w-full rounded-2xl border border-red-200 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
        >
          Reset semua data
        </button>
      </div>

      {tes && (
        <div className="print-area rounded-lg bg-white p-6 text-center">
          <p className="text-lg font-black">{form.namaToko}</p>
          <p className="text-xs text-slate-500">{form.alamatStruk}</p>
          {form.strukHeader && <p className="mt-1 text-xs">{form.strukHeader}</p>}
          <p className="tnum mt-3 text-sm">— TES CETAK BERHASIL —</p>
          <p className="tnum text-2xl font-black">{rupiah(52500)}</p>
          <p className="mt-2 text-xs text-slate-500">{form.strukFooter}</p>
        </div>
      )}
    </div>
  );
}
