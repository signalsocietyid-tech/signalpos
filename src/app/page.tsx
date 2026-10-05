"use client";

import Link from "next/link";
import { Badge, Card, FilterBar, PageHeader } from "@/components/ui";
import { useDB, rupiah } from "@/store/db";

const flow = [
  { label: "Penjualan Kotor", nilai: 50000000, href: "/penjualan" },
  { label: "Diskon & Refund", nilai: -2500000, href: "/penjualan" },
  { label: "Pendapatan Bersih", nilai: 47500000, href: "/penjualan" },
  { label: "HPP", nilai: -20000000, href: "/resep" },
  { label: "Laba Kotor", nilai: 27500000, href: "/laporan" },
  { label: "Biaya Operasional", nilai: -10000000, href: "/pengeluaran" },
  { label: "Laba Bersih", nilai: 17500000, href: "/laporan" },
];
const harian = [42, 58, 51, 66, 74, 88, 62];

export default function Dashboard() {
  const { ingredients, activeBranch, sales } = useDB();
  const menipis = ingredients.filter((b) => b.stok <= b.minimum);
  const omzet = activeBranch.id === "semua" ? 12450000 : activeBranch.omzetHariIni;

  return (
    <div>
      <PageHeader
        title="Ringkasan Bisnis"
        desc={`Memantau ${activeBranch.nama} • ${sales.length} transaksi terbaru masuk otomatis dari POS.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <FilterBar options={["Hari Ini", "Minggu Ini", "Bulan Ini"]} defaultValue="Hari Ini" />
            <Link href="/laporan" className="press rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-bold shadow-sm hover:bg-[#F1F5F9]">
              Unduh Laporan
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card title="Penjualan Hari Ini" value={rupiah(omzet)} sub={`${activeBranch.transaksiHariIni} transaksi • +8,2%`} href="/penjualan" accent />
        <Card title="HPP" value="Rp5.240.000" sub="Food cost 42,1%" href="/resep" />
        <Card title="Laba Kotor" value="Rp7.210.000" sub="Margin 57,9%" href="/laporan" />
        <Card title="Pengeluaran" value="Rp2.100.000" sub="12 pengeluaran hari ini" href="/pengeluaran" />
        <Card title="Laba Bersih" value="Rp5.110.000" sub="Margin bersih 41,0%" href="/laporan" accent />
        <Card title="Transaksi" value={`${activeBranch.transaksiHariIni}`} sub={`Rata-rata ${rupiah(Math.round(omzet / Math.max(activeBranch.transaksiHariIni, 1)))}`} href="/penjualan" />
        <Card title="Food Cost" value="42,1%" sub="Target di bawah 45%" href="/resep" />
        <Card title="Stok Menipis" value={`${menipis.length} bahan`} sub="Perlu pembelian segera" href="/bahan" />
      </div>

      <section className="card mt-4 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold tracking-tight">Alur Keuangan</h2>
            <p className="text-sm text-slate-500">Dari penjualan kotor hingga laba bersih. Klik tiap kartu untuk detail.</p>
          </div>
          <Badge tone="info">Bulan Ini • {activeBranch.nama}</Badge>
        </div>
        <div className="no-scrollbar mt-4 flex items-stretch gap-2 overflow-x-auto pb-1">
          {flow.map((f, i) => (
            <div key={f.label} className="flex items-stretch gap-2">
              <Link href={f.href} className={`press min-w-36 flex-1 rounded-2xl border p-3 transition ${f.label === "Laba Bersih" ? "border-[#2563EB] bg-[#2563EB] text-white shadow-sm" : "border-[#E2E8F0] bg-[#F1F5F9] hover:bg-white"}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wide ${f.label === "Laba Bersih" ? "text-white/80" : "text-slate-500"}`}>{f.label}</p>
                <p className="tnum mt-1 font-black">{rupiah(f.nilai)}</p>
              </Link>
              {i < flow.length - 1 && <span className="self-center text-slate-300">→</span>}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold tracking-tight">Penjualan 7 Hari</h2>
            <Link href="/laporan" className="text-sm font-bold text-[#2563EB]">Lihat laporan</Link>
          </div>
          <div className="mt-4 flex h-40 items-end gap-2">
            {harian.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className={`w-full rounded-full ${i === 5 ? "bg-[#2563EB]" : "bg-[#2563EB]/15"}`} style={{ height: `${v * 1.8}px` }} />
                <span className="text-[11px] font-semibold text-slate-400">{["S", "S", "R", "K", "J", "S", "M"][i]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold tracking-tight">Stok Menipis</h2>
            <Badge tone="peringatan">{menipis.length} bahan</Badge>
          </div>
          <ul className="mt-3 space-y-2">
            {menipis.slice(0, 5).map((b) => (
              <li key={b.sku} className="flex items-center justify-between rounded-xl bg-[#F1F5F9] px-3 py-2.5 text-sm">
                <span className="font-bold">{b.nama}</span>
                <span className="tnum text-slate-500">{b.stok.toLocaleString("id-ID")} {b.satuan}</span>
              </li>
            ))}
            {menipis.length === 0 && <li className="rounded-xl bg-[#DCFCE7] p-3 text-sm font-semibold text-[#16A34A]">Semua stok aman ✓</li>}
          </ul>
          <Link href="/bahan" className="press mt-3 block rounded-xl border border-[#E2E8F0] py-2.5 text-center text-sm font-bold hover:bg-[#F1F5F9]">
            Kelola bahan baku
          </Link>
        </section>
      </div>
    </div>
  );
}
