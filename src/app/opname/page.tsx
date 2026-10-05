"use client";

import { useMemo, useState } from "react";
import { Badge, Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { useDB } from "@/store/db";

export default function OpnamePage() {
  const { opnames, addOpname, deleteOpname, approveOpname, ingredients } = useDB();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ skuBahan: "", fisik: 0, alasan: "" });

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return opnames.filter((o) => !s || (o.namaBahan + o.id).toLowerCase().includes(s));
  }, [opnames, q]);

  const bahan = ingredients.find((b) => b.sku === form.skuBahan);
  const selisih = bahan ? Number(form.fisik) - bahan.stok : 0;

  function simpan() {
    if (!bahan || !form.alasan.trim()) return;
    addOpname({
      id: `OP-${Date.now()}`,
      tanggal: new Date().toISOString().slice(0, 10),
      skuBahan: bahan.sku,
      namaBahan: bahan.nama,
      sistem: bahan.stok,
      fisik: Number(form.fisik),
      selisih,
      alasan: form.alasan.trim(),
      status: "Draft",
    });
    setForm({ skuBahan: "", fisik: 0, alasan: "" });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Stock Opname"
        desc={`${daftar.length} opname • Disetujui → stok bahan disesuaikan ke hasil fisik. Wajib alasan.`}
        action={<button onClick={() => setOpen(true)} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Mulai Opname</button>}
      />
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
        <span className="text-neutral-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari bahan…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-left text-sm">
            <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
              <tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Bahan</th><th className="px-4 py-3">Sistem</th><th className="px-4 py-3">Fisik</th><th className="px-4 py-3">Selisih</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {daftar.map((o) => (
                <tr key={o.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="tnum whitespace-nowrap px-4 py-3">{o.tanggal}</td>
                  <td className="px-4 py-3"><span className="font-semibold">{o.namaBahan}</span><p className="text-xs text-neutral-400">{o.alasan}</p></td>
                  <td className="tnum px-4 py-3">{o.sistem.toLocaleString("id-ID")}</td>
                  <td className="tnum px-4 py-3">{o.fisik.toLocaleString("id-ID")}</td>
                  <td className={`tnum px-4 py-3 font-bold ${o.selisih < 0 ? "text-red-600" : o.selisih > 0 ? "text-[#16A34A]" : ""}`}>
                    {o.selisih > 0 ? "+" : ""}{o.selisih.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3"><Badge tone={o.status === "Disetujui" ? "sukses" : "peringatan"}>{o.status}</Badge></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {o.status === "Draft" ? (
                      <span className="flex justify-end gap-2">
                        <button onClick={() => approveOpname(o.id)} className="press text-[13px] font-bold text-[#1D4ED8] hover:underline">Setujui</button>
                        <button onClick={() => deleteOpname(o.id)} className="press text-[13px] font-bold text-red-600 hover:underline">Hapus</button>
                      </span>
                    ) : <span className="text-xs text-slate-400">Stok disesuaikan</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {daftar.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">Belum ada opname.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Mulai opname">
        <div className="grid gap-3">
          <Field label="Bahan baku">
            <select className={inputCls} value={form.skuBahan} onChange={(e) => setForm({ ...form, skuBahan: e.target.value, fisik: ingredients.find((b) => b.sku === e.target.value)?.stok ?? 0 })}>
              <option value="">— Pilih bahan —</option>
              {ingredients.map((b) => <option key={b.sku} value={b.sku}>{b.nama} (sistem: {b.stok.toLocaleString("id-ID")} {b.satuan})</option>)}
            </select>
          </Field>
          <Field label={`Stok fisik${bahan ? ` (${bahan.satuan})` : ""}`}><input type="number" min={0} className={inputCls} value={form.fisik} onChange={(e) => setForm({ ...form, fisik: Number(e.target.value) })} /></Field>
          <div className={`tnum rounded-xl px-4 py-3 text-sm font-bold ${selisih < 0 ? "bg-[#FEE2E2] text-[#DC2626]" : selisih > 0 ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-slate-500"}`}>
            Selisih: {selisih > 0 ? "+" : ""}{selisih.toLocaleString("id-ID")}
          </div>
          <Field label="Alasan (wajib)"><input className={inputCls} value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })} placeholder="cth. Susut timbangan / tumpah" /></Field>
        </div>
        <button onClick={simpan} disabled={!bahan || !form.alasan.trim()} className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-40">Simpan draft</button>
      </Modal>
    </div>
  );
}
