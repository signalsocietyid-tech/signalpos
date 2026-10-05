"use client";

import { useMemo, useState } from "react";
import { Badge, Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { useDB, rupiah, type Purchase } from "@/store/db";

export default function PembelianPage() {
  const { purchases, addPurchase, deletePurchase, receivePurchase, suppliers, ingredients } = useDB();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplier: "", skuBahan: "", qty: 1, harga: 0 });

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return purchases.filter((p) => !s || (p.supplier + p.namaBahan + p.id).toLowerCase().includes(s));
  }, [purchases, q]);

  const bahan = ingredients.find((b) => b.sku === form.skuBahan);
  const total = Number(form.qty) * Number(form.harga);

  function simpan() {
    if (!form.supplier || !bahan || form.qty <= 0) return;
    addPurchase({
      id: `PO-${Date.now()}`,
      tanggal: new Date().toISOString().slice(0, 10),
      supplier: form.supplier,
      skuBahan: bahan.sku,
      namaBahan: bahan.nama,
      qty: Number(form.qty),
      satuan: bahan.satuan,
      harga: Number(form.harga),
      total,
      status: "Draft",
    });
    setForm({ supplier: "", skuBahan: "", qty: 1, harga: 0 });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Pembelian"
        desc={`${daftar.length} pembelian • Barang diterima → stok bahan otomatis bertambah.`}
        action={<button onClick={() => setOpen(true)} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Buat Pembelian</button>}
      />
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
        <span className="text-neutral-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari supplier / bahan…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-left text-sm">
            <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
              <tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Bahan</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {daftar.map((p) => (
                <tr key={p.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="tnum whitespace-nowrap px-4 py-3">{p.tanggal}</td>
                  <td className="px-4 py-3 font-semibold">{p.supplier}</td>
                  <td className="px-4 py-3">{p.namaBahan}</td>
                  <td className="tnum px-4 py-3">{p.qty.toLocaleString("id-ID")} {p.satuan}</td>
                  <td className="tnum px-4 py-3 font-black">{rupiah(p.total)}</td>
                  <td className="px-4 py-3"><Badge tone={p.status === "Diterima" ? "sukses" : "peringatan"}>{p.status}</Badge></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {p.status === "Draft" ? (
                      <span className="flex justify-end gap-2">
                        <button onClick={() => receivePurchase(p.id)} className="press text-[13px] font-bold text-[#1D4ED8] hover:underline">Terima</button>
                        <button onClick={() => deletePurchase(p.id)} className="press text-[13px] font-bold text-red-600 hover:underline">Hapus</button>
                      </span>
                    ) : <span className="text-xs text-slate-400">Stok +{p.qty}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {daftar.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">Belum ada pembelian.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Buat pembelian">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Supplier">
              <select className={inputCls} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
                <option value="">— Pilih supplier —</option>
                {suppliers.map((s) => <option key={s.id} value={s.nama}>{s.nama}</option>)}
              </select>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Bahan baku">
              <select className={inputCls} value={form.skuBahan} onChange={(e) => setForm({ ...form, skuBahan: e.target.value })}>
                <option value="">— Pilih bahan —</option>
                {ingredients.map((b) => <option key={b.sku} value={b.sku}>{b.nama} ({b.satuan})</option>)}
              </select>
            </Field>
          </div>
          <Field label={`Qty${bahan ? ` (${bahan.satuan})` : ""}`}><input type="number" min={1} className={inputCls} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} /></Field>
          <Field label="Harga per satuan (Rp)"><input type="number" min={0} className={inputCls} value={form.harga} onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })} /></Field>
        </div>
        <div className="tnum mt-3 flex items-center justify-between rounded-xl bg-[#EFF6FF] px-4 py-3 text-sm font-bold text-[#1D4ED8]">
          <span>Total</span><span>{rupiah(total)}</span>
        </div>
        <button onClick={simpan} disabled={!form.supplier || !bahan || form.qty <= 0} className="press mt-3 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-40">Simpan draft</button>
      </Modal>
    </div>
  );
}
