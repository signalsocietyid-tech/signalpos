"use client";

import Link from "next/link";
import { useDB, rupiah } from "@/store/db";
import { Badge } from "@/components/ui";

export default function PosShift() {
  const { activeBranch, sales } = useDB();
  const milikCabang = sales.filter((t) => activeBranch.id === "semua" || t.cabang === activeBranch.nama);
  const omzet = milikCabang.reduce((a, t) => a + t.total, 0);

  return (
    <div className="mx-auto max-w-3xl p-3 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-black tracking-tight">Shift Berjalan</h1>
          <p className="text-xs text-slate-500">{activeBranch.nama}</p>
        </div>
        <Link href="/pos" className="press rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-bold hover:bg-[#F1F5F9]">
          ← Kasir
        </Link>
      </div>

      <div className="card mt-3 flex items-center justify-between p-4">
        <div>
          <p className="text-[13px] font-bold">Shift Pagi • 08.00 – 16.00</p>
          <p className="mt-0.5 text-xs text-slate-500">Kasir bertugas: Andi</p>
        </div>
        <Badge tone={activeBranch.status === "Buka" ? "sukses" : "netral"}>{activeBranch.status}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="card p-3.5 text-center">
          <p className="tnum text-lg font-black">{milikCabang.length}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">TRANSAKSI</p>
        </div>
        <div className="card p-3.5 text-center">
          <p className="tnum text-lg font-black">{rupiah(omzet)}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">OMZET</p>
        </div>
        <div className="card p-3.5 text-center">
          <p className="tnum text-lg font-black">{rupiah(activeBranch.kas)}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">KAS</p>
        </div>
      </div>

      <div className="card mt-3 space-y-2 p-4">
        <h2 className="text-sm font-bold">Transaksi shift ini</h2>
        {milikCabang.slice(0, 8).map((t) => (
          <div key={t.id} className="tnum flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3 py-2 text-[13px]">
            <span className="font-bold">{t.id}</span>
            <span className="text-slate-500">{t.jam} • {t.bayar}</span>
            <span className="font-black">{rupiah(t.total)}</span>
          </div>
        ))}
        {milikCabang.length === 0 && <p className="text-sm text-slate-500">Belum ada transaksi pada shift ini.</p>}
      </div>
    </div>
  );
}
