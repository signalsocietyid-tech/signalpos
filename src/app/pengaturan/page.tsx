"use client";

import { useState } from "react";
import { Field, PageHeader, inputCls } from "@/components/ui";
import { useDB } from "@/store/db";

export default function PengaturanPage() {
  const { settings, saveSettings, resetAll } = useDB();
  const [form, setForm] = useState(settings);
  const [ok, setOk] = useState(false);
  const berubah = JSON.stringify(form) !== JSON.stringify(settings);

  function simpan() {
    saveSettings({ ...form, pajakPct: Math.min(100, Math.max(0, Number(form.pajakPct) || 0)) });
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Pengaturan" desc="Pajak POS, identitas struk, dan perilaku kasir. Tersimpan otomatis per perangkat." />
      <div className="card grid gap-4 p-5">
        <Field label="Pajak POS (%)" hint="Dipakai menghitung pajak di kasir & struk.">
          <input type="number" min={0} max={100} className={inputCls} value={form.pajakPct} onChange={(e) => setForm({ ...form, pajakPct: Number(e.target.value) })} />
        </Field>
        <Field label="Nama toko (struk)"><input className={inputCls} value={form.namaToko} onChange={(e) => setForm({ ...form, namaToko: e.target.value })} /></Field>
        <Field label="Alamat struk"><input className={inputCls} value={form.alamatStruk} onChange={(e) => setForm({ ...form, alamatStruk: e.target.value })} /></Field>
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
        <button onClick={simpan} disabled={!berubah} className="press w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-40">
          {ok ? "✓ Tersimpan" : "Simpan pengaturan"}
        </button>
      </div>

      <div className="card mt-4 p-5">
        <p className="text-sm font-bold text-red-700">Zona berbahaya</p>
        <p className="mt-1 text-xs text-slate-500">Kembalikan semua data demo (produk, stok, transaksi, pengaturan) ke awal.</p>
        <button
          onClick={() => { if (window.confirm("Reset SEMUA data ke awal?")) { resetAll(); setForm({ pajakPct: 5, namaToko: "SignalPOS Kebab", alamatStruk: "Jl. Braga No. 12, Bandung", cetakOtomatis: true }); } }}
          className="press mt-3 w-full rounded-2xl border border-red-200 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
        >
          Reset semua data
        </button>
      </div>
    </div>
  );
}
