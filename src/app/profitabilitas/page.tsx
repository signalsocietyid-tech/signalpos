"use client";

import { useMemo, useState } from "react";
import { Badge, PageHeader } from "@/components/ui";
import { useDB, rupiah } from "@/store/db";

export default function ProfitabilitasPage() {
  const { products, sales } = useDB();
  const [q, setQ] = useState("");

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return products
      .map((p) => {
        const marginRp = p.harga - p.hpp;
        const marginPct = p.harga > 0 ? (marginRp / p.harga) * 100 : 0;
        return { ...p, marginRp, marginPct };
      })
      .filter((p) => !s || (p.nama + p.sku + p.kategori).toLowerCase().includes(s))
      .sort((a, b) => b.marginPct - a.marginPct);
  }, [products, q]);

  const omzet = sales.reduce((a, s) => a + s.total, 0);
  const hpp = sales.reduce((a, s) => a + s.hpp, 0);

  return (
    <div>
      <PageHeader
        title="Profitabilitas"
        desc={`Margin per produk • Omzet tercatat ${rupiah(omzet)} dengan HPP ${rupiah(hpp)}.`}
      />
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
        <span className="text-neutral-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-left text-sm">
            <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
              <tr><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Harga</th><th className="px-4 py-3">HPP</th><th className="px-4 py-3">Laba/produk</th><th className="px-4 py-3">Margin</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {daftar.map((p) => (
                <tr key={p.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3"><span className="font-semibold">{p.nama}</span><p className="text-xs text-neutral-400">{p.kategori} • {p.sku}</p></td>
                  <td className="tnum px-4 py-3 font-bold">{rupiah(p.harga)}</td>
                  <td className="tnum px-4 py-3 text-neutral-500">{rupiah(p.hpp)}</td>
                  <td className={`tnum px-4 py-3 font-black ${p.marginRp >= 0 ? "text-[#16A34A]" : "text-red-600"}`}>{rupiah(p.marginRp)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-[#F1F5F9]">
                        <div className={`h-full rounded-full ${p.marginPct >= 50 ? "bg-[#16A34A]" : p.marginPct >= 30 ? "bg-[#2563EB]" : "bg-[#D97706]"}`} style={{ width: `${Math.min(100, Math.max(0, p.marginPct))}%` }} />
                      </div>
                      <span className="tnum text-xs font-bold">{p.marginPct.toFixed(1).replace(".", ",")}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge tone={p.status === "Aktif" ? "sukses" : "netral"}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {daftar.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">Tidak ada produk yang cocok.</p>}
      </div>
    </div>
  );
}
