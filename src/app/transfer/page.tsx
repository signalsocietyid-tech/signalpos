"use client";

import { useMemo, useState } from "react";
import { Badge, Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { useDB } from "@/store/db";

/** ID acak — di luar komponen agar tidak dipanggil saat render. */
function buatId(): string {
  return `TR-${Date.now()}`;
}

export default function TransferPage() {
  const { transfers, addTransfer, deleteTransfer, receiveTransfer, ingredients, branches } = useDB();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ skuBahan: "", qty: 1, dari: "", ke: "" });

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return transfers.filter((t) => !s || (t.namaBahan + t.dari + t.ke + t.id).toLowerCase().includes(s));
  }, [transfers, q]);

  const cabangAktif = branches.filter((b) => b.id !== "semua");
  const bahan = ingredients.find((b) => b.sku === form.skuBahan);

  function simpan() {
    if (!bahan || !form.dari || !form.ke || form.dari === form.ke || form.qty <= 0) return;
    const asal = cabangAktif.find((b) => b.id === form.dari)?.nama ?? form.dari;
    const tujuan = cabangAktif.find((b) => b.id === form.ke)?.nama ?? form.ke;
    addTransfer({
      id: buatId(),
      tanggal: new Date().toISOString().slice(0, 10),
      skuBahan: bahan.sku,
      namaBahan: bahan.nama,
      qty: Number(form.qty),
      satuan: bahan.satuan,
      dari: asal,
      ke: tujuan,
      status: "Terkirim",
    });
    setForm({ skuBahan: "", qty: 1, dari: "", ke: "" });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Transfer Stok"
        desc={`${daftar.length} transfer • Stok tujuan bertambah setelah diterima.`}
        action={<button onClick={() => setOpen(true)} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Buat Transfer</button>}
      />
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
        <span className="text-neutral-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari bahan / cabang…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-left text-sm">
            <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
              <tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Bahan</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Dari → Ke</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {daftar.map((t) => (
                <tr key={t.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="tnum whitespace-nowrap px-4 py-3">{t.tanggal}</td>
                  <td className="px-4 py-3 font-semibold">{t.namaBahan}</td>
                  <td className="tnum px-4 py-3">{t.qty.toLocaleString("id-ID")} {t.satuan}</td>
                  <td className="px-4 py-3">{t.dari} → {t.ke}</td>
                  <td className="px-4 py-3"><Badge tone={t.status === "Diterima" ? "sukses" : "info"}>{t.status}</Badge></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {t.status === "Terkirim" ? (
                      <span className="flex justify-end gap-2">
                        <button onClick={() => receiveTransfer(t.id)} className="press text-[13px] font-bold text-[#1D4ED8] hover:underline">Tandai diterima</button>
                        <button onClick={() => deleteTransfer(t.id)} className="press text-[13px] font-bold text-red-600 hover:underline">Hapus</button>
                      </span>
                    ) : <span className="text-xs text-slate-400">Selesai</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {daftar.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">Belum ada transfer.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Buat transfer">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Bahan baku">
              <select className={inputCls} value={form.skuBahan} onChange={(e) => setForm({ ...form, skuBahan: e.target.value })}>
                <option value="">— Pilih bahan —</option>
                {ingredients.map((b) => <option key={b.sku} value={b.sku}>{b.nama} ({b.satuan})</option>)}
              </select>
            </Field>
          </div>
          <Field label={`Qty${bahan ? ` (${bahan.satuan})` : ""}`}><input type="number" min={1} className={inputCls} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} /></Field>
          <div />
          <Field label="Dari cabang">
            <select className={inputCls} value={form.dari} onChange={(e) => setForm({ ...form, dari: e.target.value })}>
              <option value="">— Pilih —</option>
              {cabangAktif.map((b) => <option key={b.id} value={b.id}>{b.nama}</option>)}
            </select>
          </Field>
          <Field label="Ke cabang">
            <select className={inputCls} value={form.ke} onChange={(e) => setForm({ ...form, ke: e.target.value })}>
              <option value="">— Pilih —</option>
              {cabangAktif.map((b) => <option key={b.id} value={b.id}>{b.nama}</option>)}
            </select>
          </Field>
        </div>
        <button onClick={simpan} disabled={!bahan || !form.dari || !form.ke || form.dari === form.ke || form.qty <= 0} className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-40">Simpan transfer</button>
      </Modal>
    </div>
  );
}
