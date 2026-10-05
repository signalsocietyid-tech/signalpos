"use client";

import { useMemo, useState } from "react";
import { Badge, Field, FilterBar, Modal, PageHeader, ProductArt, inputCls } from "@/components/ui";
import { useDB, rupiah, type Product } from "@/store/db";

const KATS = ["Kebab", "Burger", "Shawarma", "Rice", "Fries", "Snack", "Minuman", "Saus", "Combo", "Add-on"];

const kosong: Product = { id: "", nama: "", sku: "", kategori: "Kebab", harga: 15000, hpp: 8000, status: "Aktif", stok: 20 };

export default function ProdukPage() {
  const { products, upsertProduct, deleteProduct, toggleProduct } = useDB();
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("Semua");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Product>(kosong);
  const [hapus, setHapus] = useState<Product | null>(null);
  const editing = form.id !== "";

  const daftar = useMemo(
    () => products.filter((p) => (kat === "Semua" || p.kategori === kat) && (p.nama + p.sku).toLowerCase().includes(q.toLowerCase())),
    [products, kat, q]
  );

  function bukaTambah() { setForm({ ...kosong, id: `p${Date.now()}`, sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}` }); setOpen(true); }
  function bukaEdit(p: Product) { setForm({ ...p }); setOpen(true); }
  function simpan() {
    if (!form.nama.trim() || !form.sku.trim()) return;
    upsertProduct({ ...form, harga: Number(form.harga) || 0, hpp: Number(form.hpp) || 0, stok: Number(form.stok) || 0 });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Produk"
        desc={`${products.length} menu • harga, HPP & margin otomatis. Tersimpan lokal, langsung tampil di POS.`}
        action={<button onClick={bukaTambah} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Tambah Produk</button>}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
          <span className="text-neutral-400">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / SKU…" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <FilterBar options={["Semua", ...KATS]} defaultValue="Semua" onChange={setKat} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {daftar.map((p) => {
          const margin = p.harga > 0 ? Math.round(((p.harga - p.hpp) / p.harga) * 100) : 0;
          return (
            <div key={p.id} className={`card card-hover overflow-hidden ${p.status === "Nonaktif" ? "opacity-60" : ""}`}>
              <div className="p-2.5 pb-0"><ProductArt kategori={p.kategori} nama={p.nama} /></div>
              <div className="p-4 pt-2.5">
                <div className="flex items-center justify-between">
                  <Badge tone="netral">{p.kategori}</Badge>
                  <button onClick={() => toggleProduct(p.id)} title="Aktif/Nonaktif">
                    <Badge tone={p.status === "Aktif" ? "sukses" : "netral"}>{p.status} ○</Badge>
                  </button>
                </div>
                <h3 className="mt-2 font-bold leading-tight">{p.nama}</h3>
                <p className="text-xs text-neutral-400">{p.sku} • Stok {p.stok ?? "-"}</p>
                <div className="tnum mt-3 grid grid-cols-3 gap-2 rounded-xl bg-[#F1F5F9] p-2.5 text-sm">
                  <div><p className="text-[10px] font-bold uppercase text-neutral-400">Harga</p><p className="font-black">{rupiah(p.harga)}</p></div>
                  <div><p className="text-[10px] font-bold uppercase text-neutral-400">HPP</p><p className="font-semibold">{rupiah(p.hpp)}</p></div>
                  <div><p className="text-[10px] font-bold uppercase text-neutral-400">Margin</p><p className="font-bold text-[#2563EB]">{margin}%</p></div>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <button onClick={() => bukaEdit(p)} className="press flex-1 rounded-xl border border-[#E2E8F0] py-2 text-[13px] font-bold hover:bg-[#F1F5F9]">Edit</button>
                  <button onClick={() => setHapus(p)} className="press flex-1 rounded-xl border border-red-200 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50">Hapus</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {daftar.length === 0 && <div className="card mt-3 p-10 text-center text-sm text-neutral-500">Tidak ada produk yang cocok.</div>}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit produk" : "Tambah produk"}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Nama produk"><input className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="cth. Kebab Beef Large" /></Field></div>
          <Field label="SKU"><input className={inputCls} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
          <Field label="Kategori">
            <select className={inputCls} value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
              {KATS.map((k) => <option key={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Harga jual (Rp)"><input type="number" className={inputCls} value={form.harga} onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })} /></Field>
          <Field label="HPP (Rp)"><input type="number" className={inputCls} value={form.hpp} onChange={(e) => setForm({ ...form, hpp: Number(e.target.value) })} /></Field>
          <Field label="Stok"><input type="number" className={inputCls} value={form.stok ?? 0} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} /></Field>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Aktif" | "Nonaktif" })}>
              <option>Aktif</option><option>Nonaktif</option>
            </select>
          </Field>
        </div>
        <button onClick={simpan} className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8]">Simpan produk</button>
      </Modal>

      <Modal open={!!hapus} onClose={() => setHapus(null)} title="Hapus produk?">
        <p className="text-sm text-neutral-600">“{hapus?.nama}” akan dihapus dari katalog dan POS. Bisa ditambah lagi nanti.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setHapus(null)} className="press flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-bold">Batal</button>
          <button onClick={() => { if (hapus) deleteProduct(hapus.id); setHapus(null); }} className="press flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white">Ya, hapus</button>
        </div>
      </Modal>
    </div>
  );
}
