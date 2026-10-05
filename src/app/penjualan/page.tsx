"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, FilterBar, PageHeader } from "@/components/ui";
import { useDB, rupiah } from "@/store/db";

export default function PenjualanPage() {
  const { sales, activeBranch } = useDB();
  const [status, setStatus] = useState("Semua");
  const [q, setQ] = useState("");

  const daftar = useMemo(() => {
    return sales.filter((s) => {
      const cocokCabang = activeBranch.id === "semua" || s.cabang === activeBranch.nama;
      const cocokStatus = status === "Semua" || s.status === status;
      const cocokQ = (s.id + s.kasir + s.bayar).toLowerCase().includes(q.toLowerCase());
      return cocokCabang && cocokStatus && cocokQ;
    });
  }, [sales, activeBranch, status, q]);

  const omzet = daftar.reduce((s, x) => s + x.total, 0);

  return (
    <div>
      <PageHeader
        title="Penjualan"
        desc={`Menampilkan ${activeBranch.nama} • ${daftar.length} transaksi • ${rupiah(omzet)}. Order dari POS langsung masuk ke sini.`}
        action={<Link href="/pos" className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">+ Buat Transaksi</Link>}
      />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterBar options={["Semua", "LUNAS", "Pending", "Refund"]} defaultValue="Semua" onChange={setStatus} />
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
          <span className="text-neutral-400">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari ID / kasir / metode…" className="w-full bg-transparent text-sm outline-none" />
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
              <tr><th className="px-4 py-3">Transaksi</th><th className="px-4 py-3">Cabang / Kasir</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">HPP</th><th className="px-4 py-3">Laba</th><th className="px-4 py-3">Bayar</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {daftar.map((s) => (
                <tr key={s.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3"><Link href={`/penjualan/${s.id}`} className="font-bold text-[#2563EB] hover:underline">{s.id}</Link><p className="text-xs text-neutral-400">{s.jam}</p></td>
                  <td className="px-4 py-3">{s.cabang} • {s.kasir}</td>
                  <td className="tnum px-4 py-3 font-black">{rupiah(s.total)}</td>
                  <td className="tnum px-4 py-3 text-neutral-500">{rupiah(s.hpp)}</td>
                  <td className="tnum px-4 py-3 font-semibold text-[#2563EB]">{rupiah(s.laba)}</td>
                  <td className="px-4 py-3">{s.bayar}</td>
                  <td className="px-4 py-3"><Badge tone={s.status === "LUNAS" ? "sukses" : s.status === "Pending" ? "peringatan" : "bahaya"}>{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {daftar.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">Belum ada transaksi untuk filter ini.</p>}
      </div>
    </div>
  );
}
