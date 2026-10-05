"use client";

import { useState } from "react";
import { Badge, Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { useDB, rupiah, type Branch } from "@/store/db";

export default function CabangPage() {
  const { branches, activeBranchId, setActiveBranchId, upsertBranch, toggleBranch } = useDB();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Branch>({ id: "", nama: "", alamat: "", warna: "#2563EB", status: "Buka", transaksiHariIni: 0, omzetHariIni: 0, kas: 0 });
  const isEdit = branches.some((b) => b.id === form.id && form.id !== "");

  function tambah() {
    setForm({ id: `c${Date.now()}`, nama: "", alamat: "", warna: "#2563EB", status: "Buka", transaksiHariIni: 0, omzetHariIni: 0, kas: 0 });
    setOpen(true);
  }
  function edit(b: Branch) { setForm({ ...b }); setOpen(true); }

  const outlet = branches.filter((b) => b.id !== "semua");

  return (
    <div>
      <PageHeader
        title="Cabang"
        desc="Pilih cabang aktif untuk memfilter seluruh panel. Klik kartu untuk berpindah — tanpa dropdown kaku."
        action={<button onClick={tambah} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Tambah Cabang</button>}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {outlet.map((b) => {
          const sel = b.id === activeBranchId;
          return (
            <button key={b.id} onClick={() => setActiveBranchId(b.id)} className={`card card-hover press p-4 text-left ${sel ? "ring-2 ring-[#2563EB]/40" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white" style={{ background: b.warna }}>{b.nama.charAt(0)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold">{b.nama}</p>
                    {sel && <Badge tone="sukses">Aktif</Badge>}
                    <Badge tone={b.status === "Buka" ? "sukses" : "netral"}>{b.status}</Badge>
                  </div>
                  <p className="truncate text-xs text-neutral-500">{b.alamat}</p>
                </div>
              </div>
              <div className="tnum mt-3 grid grid-cols-3 gap-2 rounded-xl bg-[#F1F5F9] p-3 text-center">
                <div><p className="text-lg font-black">{b.transaksiHariIni}</p><p className="text-[11px] text-neutral-500">Transaksi</p></div>
                <div><p className="text-[13px] font-black">{rupiah(b.omzetHariIni)}</p><p className="text-[11px] text-neutral-500">Omzet</p></div>
                <div><p className="text-[13px] font-black">{rupiah(b.kas)}</p><p className="text-[11px] text-neutral-500">Kas</p></div>
              </div>
              <div className="mt-3 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                <span onClick={() => edit(b)} className="press flex-1 cursor-pointer rounded-xl border border-[#E2E8F0] py-2 text-center text-[13px] font-bold hover:bg-[#F1F5F9]">Edit</span>
                <span onClick={() => toggleBranch(b.id)} className="press flex-1 cursor-pointer rounded-xl border border-[#E2E8F0] py-2 text-center text-[13px] font-bold hover:bg-[#F1F5F9]">{b.status === "Buka" ? "Tutup" : "Buka"}</span>
                <span onClick={() => setActiveBranchId(b.id)} className={`press flex-1 cursor-pointer rounded-xl py-2 text-center text-[13px] font-bold ${sel ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-[#2563EB] text-white"}`}>{sel ? "Dipakai" : "Pakai"}</span>
              </div>
            </button>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={isEdit ? "Edit cabang" : "Tambah cabang"}>
        <div className="grid gap-3">
          <Field label="Nama cabang"><input className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="cth. Cabang 5 — Setiabudi" /></Field>
          <Field label="Alamat"><input className={inputCls} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Jl. …" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Warna"><input type="color" className="h-11 w-full cursor-pointer rounded-xl border border-[#E2E8F0]" value={form.warna} onChange={(e) => setForm({ ...form, warna: e.target.value })} /></Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Buka" | "Tutup" })}>
                <option>Buka</option><option>Tutup</option>
              </select>
            </Field>
          </div>
        </div>
        <button onClick={() => { if (!form.nama.trim()) return; upsertBranch(form); setActiveBranchId(form.id); setOpen(false); }} className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white">Simpan cabang</button>
      </Modal>
    </div>
  );
}
