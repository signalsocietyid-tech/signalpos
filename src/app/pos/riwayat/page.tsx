"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDB, rupiah } from "@/store/db";
import { Badge } from "@/components/ui";

export default function PosRiwayat() {
  const { sales, activeBranch } = useDB();
  const [q, setQ] = useState("");

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return sales.filter(
      (t) =>
        (activeBranch.id === "semua" || t.cabang === activeBranch.nama) &&
        (!s || (t.id + t.kasir + t.bayar).toLowerCase().includes(s))
    );
  }, [sales, activeBranch, q]);

  const total = daftar.reduce((a, t) => a + t.total, 0);

  return (
    <div className="mx-auto max-w-3xl p-3 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-black tracking-tight">Riwayat Transaksi</h1>
          <p className="text-xs text-slate-500">{activeBranch.nama} • {daftar.length} transaksi</p>
        </div>
        <Link href="/pos" className="press rounded-xl bg-[#2563EB] px-3.5 py-2 text-[13px] font-bold text-white hover:bg-[#1D4ED8]">
          + Transaksi baru
        </Link>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 shadow-sm">
        <span className="text-slate-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari ID, kasir, metode bayar…" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
        {q && <button onClick={() => setQ("")} className="text-xs font-bold text-slate-400 hover:text-slate-700">✕</button>}
      </div>

      <div className="card mt-3 flex items-center justify-between p-4">
        <p className="text-[13px] font-semibold text-slate-500">Total terkumpul</p>
        <p className="tnum text-lg font-black text-[#1D4ED8]">{rupiah(total)}</p>
      </div>

      <div className="mt-3 space-y-2">
        {daftar.map((t) => (
          <div key={t.id} className="card flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="tnum truncate text-[13px] font-bold">{t.id}</p>
              <p className="mt-0.5 text-xs text-slate-500">{t.jam} • {t.kasir} • {t.bayar}</p>
            </div>
            <Badge tone={t.status === "LUNAS" ? "sukses" : "peringatan"}>{t.status}</Badge>
            <p className="tnum text-[15px] font-black">{rupiah(t.total)}</p>
          </div>
        ))}
        {daftar.length === 0 && (
          <div className="card p-8 text-center text-sm text-slate-500">
            Belum ada transaksi di cabang ini.<br />Ketuk <b>+ Transaksi baru</b> untuk mulai.
          </div>
        )}
      </div>
    </div>
  );
}
