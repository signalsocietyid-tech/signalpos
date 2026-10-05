"use client";

import { useMemo, useState } from "react";
import { Badge, Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { useDB, type Ingredient } from "@/store/db";

const kosong: Ingredient = { nama: "", sku: "", satuan: "gram", stok: 0, minimum: 1000, hargaRata: 0, cabang: "Cabang 2 — Braga" };

export default function BahanPage() {
  const { ingredients, upsertIngredient, deleteIngredient } = useDB();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Ingredient>(kosong);
  const [hapus, setHapus] = useState<Ingredient | null>(null);

  const daftar = useMemo(() => ingredients.filter((b) => (b.nama + b.sku).toLowerCase().includes(q.toLowerCase())), [ingredients, q]);
  const _isEdit = ingredients.some((b) => b.sku === form.sku);

  function bukaTambah() { setForm({ ...kosong, sku: `BB-${Math.floor(100 + Math.random() * 900)}` }); setOpen(true); }
  function bukaEdit(b: Ingredient) { setForm({ ...b }); setOpen(true); }

  return (
    <div>
      <PageHeader
        title="Bahan Baku"
        desc={`${ingredients.length} bahan • stok vs minimum terpantau otomatis.`}
        action={<button onClick={bukaTambah} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Tambah Bahan</button>}
      />
      <div className="card mb-3 flex items-center gap-2 p-2 pl-3">
        <span className="text-neutral-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari bahan / SKU…" className="w-full bg-transparent py-1.5 text-sm outline-none" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-left text-sm">
            <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
              <tr><th className="px-4 py-3">Bahan</th><th className="px-4 py-3">Stok</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Harga rata-rata</th><th className="px-4 py-3 text-right">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {daftar.map((b) => {
                const low = b.stok <= b.minimum;
                const pct = Math.min(100, Math.round((b.stok / Math.max(b.minimum * 1.5, 1)) * 100));
                return (
                  <tr key={b.sku} className="transition hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3"><p className="font-bold">{b.nama}</p><p className="text-xs text-neutral-400">{b.sku} • {b.cabang}</p></td>
                    <td className="px-4 py-3">
                      <p className="tnum font-bold">{b.stok.toLocaleString("id-ID")} {b.satuan}</p>
                      <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-[#E2E8F0]">
                        <div className={`h-full rounded-full ${low ? "bg-[#DC2626]" : "bg-[#2563EB]"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-400">Min. {b.minimum.toLocaleString("id-ID")}</p>
                    </td>
                    <td className="px-4 py-3">{low ? <Badge tone="peringatan">Menipis</Badge> : <Badge tone="sukses">Aman</Badge>}</td>
                    <td className="tnum px-4 py-3">Rp{b.hargaRata.toLocaleString("id-ID")}/{b.satuan}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-1.5">
                      <button onClick={() => bukaEdit(b)} className="press rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-bold hover:bg-[#F1F5F9]">Edit</button>
                      <button onClick={() => setHapus(b)} className="press rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Hapus</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={_isEdit ? "Edit bahan" : "Tambah bahan"}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Nama bahan"><input className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="cth. Beef slice" /></Field></div>
          <Field label="SKU"><input className={inputCls} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
          <Field label="Satuan">
            <select className={inputCls} value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })}>
              {["gram", "pcs", "ml", "pack"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Stok saat ini"><input type="number" className={inputCls} value={form.stok} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} /></Field>
          <Field label="Stok minimum"><input type="number" className={inputCls} value={form.minimum} onChange={(e) => setForm({ ...form, minimum: Number(e.target.value) })} /></Field>
          <div className="sm:col-span-2"><Field label="Harga rata-rata (Rp)"><input type="number" className={inputCls} value={form.hargaRata} onChange={(e) => setForm({ ...form, hargaRata: Number(e.target.value) })} /></Field></div>
        </div>
        <button onClick={() => { if (!form.nama.trim() || !form.sku.trim()) return; upsertIngredient(form); setOpen(false); }} className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white">Simpan bahan</button>
      </Modal>

      <Modal open={!!hapus} onClose={() => setHapus(null)} title="Hapus bahan?">
        <p className="text-sm text-neutral-600">“{hapus?.nama}” akan dihapus dari daftar stok.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setHapus(null)} className="press flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-bold">Batal</button>
          <button onClick={() => { if (hapus) deleteIngredient(hapus.sku); setHapus(null); }} className="press flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white">Ya, hapus</button>
        </div>
      </Modal>
    </div>
  );
}
