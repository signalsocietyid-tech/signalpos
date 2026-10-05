"use client";

import { useMemo, useState } from "react";
import { Badge, Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { useDB, type AppUser } from "@/store/db";
import { roleLabel } from "@/store/auth";

const ROLES = ["admin", "cabang", "kasir"] as const;

export default function PenggunaPage() {
  const { users, upsertUser, deleteUser, branches } = useDB();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hapus, setHapus] = useState<AppUser | null>(null);
  const [form, setForm] = useState<AppUser>({ id: "", nama: "", username: "", role: "kasir", cabang: "" });

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return users.filter((u) => !s || (u.nama + u.username + u.role).toLowerCase().includes(s));
  }, [users, q]);

  const cabangAktif = branches.filter((b) => b.id !== "semua");

  function bukaTambah() {
    setForm({ id: `U-${Date.now()}`, nama: "", username: "", role: "kasir", cabang: cabangAktif[0]?.nama ?? "" });
    setOpen(true);
  }
  function bukaEdit(u: AppUser) { setForm({ ...u }); setOpen(true); }
  function simpan() {
    if (!form.nama.trim() || !form.username.trim()) return;
    upsertUser({ ...form, username: form.username.toLowerCase().trim(), cabang: form.role === "admin" ? "Semua Cabang" : form.cabang });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Pengguna"
        desc={`${daftar.length} pengguna • Password login demo diatur di layar login (admin/admin123, braga/cabang123, kasir/kasir123).`}
        action={<button onClick={bukaTambah} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Tambah Pengguna</button>}
      />
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
        <span className="text-neutral-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / username…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {daftar.map((u) => (
          <div key={u.id} className="card card-hover p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB] text-sm font-black text-white">
                {u.nama.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{u.nama}</p>
                <p className="tnum text-xs text-neutral-500">@{u.username}</p>
              </div>
              <Badge tone={u.role === "admin" ? "info" : u.role === "cabang" ? "peringatan" : "sukses"}>{roleLabel(u.role)}</Badge>
            </div>
            <p className="mt-2 text-xs text-neutral-500">{u.cabang}</p>
            <div className="mt-3 flex gap-1.5">
              <button onClick={() => bukaEdit(u)} className="press flex-1 rounded-xl border border-[#E2E8F0] py-2 text-[13px] font-bold hover:bg-[#F1F5F9]">Edit</button>
              <button onClick={() => setHapus(u)} disabled={u.username === "admin"} className="press flex-1 rounded-xl border border-red-200 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-40">Hapus</button>
            </div>
          </div>
        ))}
      </div>
      {daftar.length === 0 && <div className="card mt-3 p-10 text-center text-sm text-neutral-500">Tidak ada pengguna yang cocok.</div>}

      <Modal open={open} onClose={() => setOpen(false)} title={form.id && users.some((u) => u.id === form.id) ? "Edit pengguna" : "Tambah pengguna"}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nama lengkap"><input className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="cth. Kasir Dago" /></Field>
          <Field label="Username"><input className={inputCls} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="cth. kasir2" /></Field>
          <Field label="Role">
            <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AppUser["role"] })}>
              {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
            </select>
          </Field>
          <Field label="Cabang">
            <select className={inputCls} value={form.cabang} disabled={form.role === "admin"} onChange={(e) => setForm({ ...form, cabang: e.target.value })}>
              {cabangAktif.map((b) => <option key={b.id} value={b.nama}>{b.nama}</option>)}
            </select>
          </Field>
        </div>
        <button onClick={simpan} disabled={!form.nama.trim() || !form.username.trim()} className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-40">Simpan pengguna</button>
      </Modal>

      <Modal open={!!hapus} onClose={() => setHapus(null)} title="Hapus pengguna?">
        <p className="text-sm text-neutral-600">“{hapus?.nama} (@{hapus?.username})” tidak bisa login lagi.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setHapus(null)} className="press flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-bold">Batal</button>
          <button onClick={() => { if (hapus) deleteUser(hapus.id); setHapus(null); }} className="press flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white">Ya, hapus</button>
        </div>
      </Modal>
    </div>
  );
}
