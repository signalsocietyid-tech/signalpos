"use client";

import { useMemo, useState } from "react";
import { Badge, Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { useDB, rupiah, type Expense } from "@/store/db";

const KATS = ["Sewa", "Listrik", "Air", "Gas", "Gaji", "Operasional", "Lainnya"];

export default function PengeluaranPage() {
  const { expenses, addExpense, deleteExpense, branches, activeBranch } = useDB();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hapus, setHapus] = useState<Expense | null>(null);
  const [form, setForm] = useState({ kategori: "Operasional", jumlah: 0, cabang: "", catatan: "" });

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return expenses.filter(
      (e) =>
        (activeBranch.id === "semua" || e.cabang === activeBranch.nama) &&
        (!s || (e.kategori + e.catatan + e.id).toLowerCase().includes(s))
    );
  }, [expenses, activeBranch, q]);
  const total = daftar.reduce((a, e) => a + e.jumlah, 0);

  function simpan() {
    if (form.jumlah <= 0) return;
    addExpense({
      id: `EX-${Date.now()}`,
      tanggal: new Date().toISOString().slice(0, 10),
      kategori: form.kategori,
      jumlah: Number(form.jumlah),
      cabang: form.cabang || activeBranch.nama,
      catatan: form.catatan.trim(),
    });
    setForm({ kategori: "Operasional", jumlah: 0, cabang: "", catatan: "" });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Pengeluaran"
        desc={`${daftar.length} pengeluaran • total ${rupiah(total)}. Mengurangi laba bersih.`}
        action={<button onClick={() => setOpen(true)} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Tambah Pengeluaran</button>}
      />
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
        <span className="text-neutral-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kategori / catatan…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
              <tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Kategori</th><th className="px-4 py-3">Cabang</th><th className="px-4 py-3">Jumlah</th><th className="px-4 py-3">Catatan</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {daftar.map((e) => (
                <tr key={e.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="tnum whitespace-nowrap px-4 py-3">{e.tanggal}</td>
                  <td className="px-4 py-3"><Badge tone="netral">{e.kategori}</Badge></td>
                  <td className="px-4 py-3">{e.cabang}</td>
                  <td className="tnum px-4 py-3 font-black">{rupiah(e.jumlah)}</td>
                  <td className="px-4 py-3 text-neutral-500">{e.catatan || "—"}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => setHapus(e)} className="press text-[13px] font-bold text-red-600 hover:underline">Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {daftar.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">Belum ada pengeluaran.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah pengeluaran">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Kategori">
            <select className={inputCls} value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
              {KATS.map((k) => <option key={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Jumlah (Rp)"><input type="number" min={0} className={inputCls} value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })} /></Field>
          <Field label="Cabang">
            <select className={inputCls} value={form.cabang} onChange={(e) => setForm({ ...form, cabang: e.target.value })}>
              <option value="">{activeBranch.nama} (aktif)</option>
              {branches.filter((b) => b.id !== "semua").map((b) => <option key={b.id} value={b.nama}>{b.nama}</option>)}
            </select>
          </Field>
          <Field label="Catatan"><input className={inputCls} value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="cth. Token listrik" /></Field>
        </div>
        <button onClick={simpan} disabled={form.jumlah <= 0} className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-40">Simpan pengeluaran</button>
      </Modal>

      <Modal open={!!hapus} onClose={() => setHapus(null)} title="Hapus pengeluaran?">
        <p className="text-sm text-neutral-600">“{hapus?.kategori} • {hapus && rupiah(hapus.jumlah)}” akan dihapus permanen.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setHapus(null)} className="press flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-bold">Batal</button>
          <button onClick={() => { if (hapus) deleteExpense(hapus.id); setHapus(null); }} className="press flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white">Ya, hapus</button>
        </div>
      </Modal>
    </div>
  );
}
