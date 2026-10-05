"use client";

import { useMemo, useState } from "react";
import { Badge, Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { useDB, type Waste } from "@/store/db";

const ALASAN = ["Kedaluwarsa", "Rusak", "Salah produksi", "Lainnya"];

export default function WastePage() {
  const { wastes, addWaste, deleteWaste, ingredients } = useDB();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hapus, setHapus] = useState<Waste | null>(null);
  const [form, setForm] = useState({ skuBahan: "", qty: 1, alasan: "Kedaluwarsa" });

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return wastes.filter((w) => !s || (w.namaBahan + w.alasan + w.id).toLowerCase().includes(s));
  }, [wastes, q]);

  const bahan = ingredients.find((b) => b.sku === form.skuBahan);

  function simpan() {
    if (!bahan || form.qty <= 0) return;
    addWaste({
      id: `W-${Date.now()}`,
      tanggal: new Date().toISOString().slice(0, 10),
      skuBahan: bahan.sku,
      namaBahan: bahan.nama,
      qty: Number(form.qty),
      satuan: bahan.satuan,
      alasan: form.alasan,
    });
    setForm({ skuBahan: "", qty: 1, alasan: "Kedaluwarsa" });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Waste"
        desc={`${daftar.length} catatan • Mencatat langsung mengurangi stok bahan.`}
        action={<button onClick={() => setOpen(true)} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Catat Waste</button>}
      />
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
        <span className="text-neutral-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari bahan / alasan…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-left text-sm">
            <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
              <tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Bahan</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Alasan</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {daftar.map((w) => (
                <tr key={w.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="tnum whitespace-nowrap px-4 py-3">{w.tanggal}</td>
                  <td className="px-4 py-3 font-semibold">{w.namaBahan}</td>
                  <td className="tnum px-4 py-3">-{w.qty.toLocaleString("id-ID")} {w.satuan}</td>
                  <td className="px-4 py-3"><Badge tone="peringatan">{w.alasan}</Badge></td>
                  <td className="px-4 py-3 text-right"><button onClick={() => setHapus(w)} className="press text-[13px] font-bold text-red-600 hover:underline">Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {daftar.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">Belum ada waste tercatat.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Catat waste">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Bahan baku">
              <select className={inputCls} value={form.skuBahan} onChange={(e) => setForm({ ...form, skuBahan: e.target.value })}>
                <option value="">— Pilih bahan —</option>
                {ingredients.map((b) => <option key={b.sku} value={b.sku}>{b.nama} (stok: {b.stok.toLocaleString("id-ID")} {b.satuan})</option>)}
              </select>
            </Field>
          </div>
          <Field label={`Qty${bahan ? ` (${bahan.satuan})` : ""}`}><input type="number" min={1} className={inputCls} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} /></Field>
          <Field label="Alasan">
            <select className={inputCls} value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })}>
              {ALASAN.map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
        </div>
        <button onClick={simpan} disabled={!bahan || form.qty <= 0} className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-40">Simpan (stok berkurang)</button>
      </Modal>

      <Modal open={!!hapus} onClose={() => setHapus(null)} title="Hapus waste?">
        <p className="text-sm text-neutral-600">Stok “{hapus?.namaBahan}” akan dikembalikan sejumlah yang dibuang.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setHapus(null)} className="press flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-bold">Batal</button>
          <button onClick={() => { if (hapus) deleteWaste(hapus.id); setHapus(null); }} className="press flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white">Ya, hapus</button>
        </div>
      </Modal>
    </div>
  );
}
