"use client";

import { useMemo, useState } from "react";
import { Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { useDB, rupiah, type Supplier } from "@/store/db";

export default function SupplierPage() {
  const { suppliers, upsertSupplier, deleteSupplier } = useDB();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hapus, setHapus] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Supplier>({ id: "", nama: "", kontak: "", termin: "COD", utang: 0 });

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return suppliers.filter((x) => !s || (x.nama + x.kontak).toLowerCase().includes(s));
  }, [suppliers, q]);
  const totalUtang = daftar.reduce((a, s) => a + s.utang, 0);

  function bukaTambah() { setForm({ id: `S-${Date.now()}`, nama: "", kontak: "", termin: "COD", utang: 0 }); setOpen(true); }
  function bukaEdit(s: Supplier) { setForm({ ...s }); setOpen(true); }
  function simpan() {
    if (!form.nama.trim()) return;
    upsertSupplier({ ...form, utang: Number(form.utang) || 0 });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Supplier"
        desc={`${daftar.length} supplier • total utang ${rupiah(totalUtang)}.`}
        action={<button onClick={bukaTambah} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Tambah Supplier</button>}
      />
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
        <span className="text-neutral-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari supplier…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {daftar.map((s) => (
          <div key={s.id} className="card card-hover p-4">
            <p className="font-bold">{s.nama}</p>
            <p className="tnum mt-0.5 text-xs text-neutral-500">{s.kontak || "—"} • Termin {s.termin}</p>
            <p className={`tnum mt-2 text-lg font-black ${s.utang > 0 ? "text-[#D97706]" : "text-[#16A34A]"}`}>{rupiah(s.utang)}</p>
            <p className="text-[11px] text-neutral-400">{s.utang > 0 ? "Utang berjalan" : "Lunas"}</p>
            <div className="mt-3 flex gap-1.5">
              <button onClick={() => bukaEdit(s)} className="press flex-1 rounded-xl border border-[#E2E8F0] py-2 text-[13px] font-bold hover:bg-[#F1F5F9]">Edit</button>
              <button onClick={() => setHapus(s)} className="press flex-1 rounded-xl border border-red-200 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50">Hapus</button>
            </div>
          </div>
        ))}
      </div>
      {daftar.length === 0 && <div className="card mt-3 p-10 text-center text-sm text-neutral-500">Belum ada supplier.</div>}

      <Modal open={open} onClose={() => setOpen(false)} title={suppliers.some((x) => x.id === form.id) ? "Edit supplier" : "Tambah supplier"}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Nama supplier"><input className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="cth. PT Daging Segar" /></Field></div>
          <Field label="Kontak"><input className={inputCls} value={form.kontak} onChange={(e) => setForm({ ...form, kontak: e.target.value })} placeholder="cth. 0812-xxxx" /></Field>
          <Field label="Termin">
            <select className={inputCls} value={form.termin} onChange={(e) => setForm({ ...form, termin: e.target.value })}>
              <option>COD</option><option>NET 7</option><option>NET 14</option><option>NET 30</option>
            </select>
          </Field>
          <div className="sm:col-span-2"><Field label="Utang berjalan (Rp)"><input type="number" min={0} className={inputCls} value={form.utang} onChange={(e) => setForm({ ...form, utang: Number(e.target.value) })} /></Field></div>
        </div>
        <button onClick={simpan} disabled={!form.nama.trim()} className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-40">Simpan supplier</button>
      </Modal>

      <Modal open={!!hapus} onClose={() => setHapus(null)} title="Hapus supplier?">
        <p className="text-sm text-neutral-600">“{hapus?.nama}” akan dihapus dari daftar.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setHapus(null)} className="press flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-bold">Batal</button>
          <button onClick={() => { if (hapus) deleteSupplier(hapus.id); setHapus(null); }} className="press flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white">Ya, hapus</button>
        </div>
      </Modal>
    </div>
  );
}
