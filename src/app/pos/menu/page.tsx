"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDB, rupiah } from "@/store/db";
import { Badge } from "@/components/ui";

export default function PosMenu() {
  const { products, toggleProduct } = useDB();
  const [q, setQ] = useState("");

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return products.filter((p) => !s || (p.nama + p.sku + p.kategori).toLowerCase().includes(s));
  }, [products, q]);

  const aktif = products.filter((p) => p.status === "Aktif").length;

  return (
    <div className="mx-auto max-w-3xl p-3 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-black tracking-tight">Menu</h1>
          <p className="text-xs text-slate-500">{aktif} dari {products.length} produk aktif di kasir</p>
        </div>
        <Link href="/pos" className="press rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-bold hover:bg-[#F1F5F9]">
          ← Kasir
        </Link>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 shadow-sm">
        <span className="text-slate-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari menu…" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
        {q && <button onClick={() => setQ("")} className="text-xs font-bold text-slate-400 hover:text-slate-700">✕</button>}
      </div>

      <div className="mt-3 space-y-2">
        {daftar.map((p) => (
          <div key={p.id} className="card flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold">{p.nama}</p>
              <p className="tnum mt-0.5 text-xs text-slate-500">{p.kategori} • {rupiah(p.harga)}</p>
            </div>
            <Badge tone={p.status === "Aktif" ? "sukses" : "netral"}>{p.status}</Badge>
            <button
              onClick={() => toggleProduct(p.id)}
              className={`press rounded-xl px-3.5 py-2 text-xs font-bold transition ${p.status === "Aktif" ? "border border-[#E2E8F0] text-slate-500 hover:bg-[#F1F5F9]" : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"}`}
            >
              {p.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        ))}
        {daftar.length === 0 && <div className="card p-8 text-center text-sm text-slate-500">Tidak ketemu.</div>}
      </div>
    </div>
  );
}
