"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDB, rupiah } from "@/store/db";
import { Badge } from "@/components/ui";

const RENDAH = 15;

export default function PosStok() {
  const { products, ingredients, activeBranch } = useDB();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"produk" | "bahan">("produk");

  const prods = useMemo(() => {
    const s = q.toLowerCase();
    return products.filter((p) => !s || (p.nama + p.sku).toLowerCase().includes(s));
  }, [products, q]);

  const bahans = useMemo(() => {
    const s = q.toLowerCase();
    return ingredients.filter((b) => !s || (b.nama + b.sku).toLowerCase().includes(s));
  }, [ingredients, q]);

  const kritis = products.filter((p) => (p.stok ?? 20) <= RENDAH).length;

  return (
    <div className="mx-auto max-w-3xl p-3 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-black tracking-tight">Stok</h1>
          <p className="text-xs text-slate-500">{activeBranch.nama} • {kritis} produk rendah</p>
        </div>
        <Link href="/pos" className="press rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-bold hover:bg-[#F1F5F9]">
          ← Kasir
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-[#E2E8F0] p-1">
        {(["produk", "bahan"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`press rounded-xl px-2 py-2 text-xs font-bold transition ${tab === t ? "bg-white shadow-sm" : "text-slate-500"}`}>
            {t === "produk" ? "Produk" : "Bahan Baku"}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 shadow-sm">
        <span className="text-slate-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / SKU…" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
        {q && <button onClick={() => setQ("")} className="text-xs font-bold text-slate-400 hover:text-slate-700">✕</button>}
      </div>

      {tab === "produk" ? (
        <div className="mt-3 space-y-2">
          {prods.map((p) => {
            const stok = p.stok ?? 20;
            const rendah = stok <= RENDAH;
            return (
              <div key={p.id} className="card flex items-center gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{p.nama}</p>
                  <p className="tnum mt-0.5 text-xs text-slate-500">{p.sku} • {rupiah(p.harga)}</p>
                </div>
                <Badge tone={p.status === "Aktif" ? "sukses" : "netral"}>{p.status}</Badge>
                <Badge tone={rendah ? "bahaya" : "info"}>{stok}</Badge>
              </div>
            );
          })}
          {prods.length === 0 && <div className="card p-8 text-center text-sm text-slate-500">Tidak ketemu.</div>}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {bahans.map((b) => {
            const tipis = b.stok <= b.minimum;
            return (
              <div key={b.sku} className="card flex items-center gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{b.nama}</p>
                  <p className="tnum mt-0.5 text-xs text-slate-500">Min. {b.minimum.toLocaleString("id-ID")} {b.satuan}</p>
                </div>
                <Badge tone={tipis ? "peringatan" : "sukses"}>{tipis ? "Menipis" : "Aman"}</Badge>
                <p className="tnum text-[13px] font-black">{b.stok.toLocaleString("id-ID")} <span className="font-semibold text-slate-400">{b.satuan}</span></p>
              </div>
            );
          })}
          {bahans.length === 0 && <div className="card p-8 text-center text-sm text-slate-500">Tidak ketemu.</div>}
        </div>
      )}
    </div>
  );
}
