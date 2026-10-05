"use client";

import { Badge, PageHeader } from "@/components/ui";
import { useDB, rupiah } from "@/store/db";

export default function LaporanPage() {
  const { sales, activeBranch } = useDB();
  const daftar = sales.filter((s) => activeBranch.id === "semua" || s.cabang === activeBranch.nama);
  const kotor = daftar.reduce((a, s) => a + s.total, 0);
  const hpp = daftar.reduce((a, s) => a + s.hpp, 0);
  const labaKotor = kotor - hpp;
  const operasional = 10000000;
  const labaBersih = labaKotor - operasional;

  const baris: [string, number, string][] = [
    ["Penjualan Kotor", kotor, ""],
    ["Pendapatan Bersih", kotor, "font-bold"],
    ["HPP", -hpp, "text-red-600"],
    ["Laba Kotor", labaKotor, "font-bold text-green-700"],
    ["Biaya Operasional (estimasi)", -operasional, "text-red-600"],
    ["Laba Bersih", labaBersih, "font-bold text-[#2563EB]"],
  ];

  return (
    <div>
      <PageHeader
        title="Laporan Laba Rugi"
        desc={`${activeBranch.nama} • ${daftar.length} transaksi. Data live dari POS.`}
        action={
          <button onClick={() => window.print()} className="press rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-bold shadow-sm hover:bg-[#F1F5F9] print:hidden">
            🖨 Cetak / PDF
          </button>
        }
      />
      <div className="print-area rounded-xl border border-[#E2E8F0] bg-white p-4 text-sm">
        <div className="mb-2 hidden print:block">
          <p className="font-black">SignalPOS — Laporan Laba Rugi</p>
          <p className="text-xs text-slate-500">{activeBranch.nama} • {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        {baris.map(([label, nilai, cls]) => (
          <div key={label} className={`tnum flex justify-between border-b border-[#F1F5F9] py-2 last:border-0 ${cls}`}>
            <span>{label}</span>
            <span>{rupiah(nilai)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2 text-sm print:hidden">
        <Badge tone="netral">Margin Kotor {kotor > 0 ? ((labaKotor / kotor) * 100).toFixed(1).replace(".", ",") : "0,0"}%</Badge>
        <Badge tone="netral">Margin Bersih {kotor > 0 ? ((labaBersih / kotor) * 100).toFixed(1).replace(".", ",") : "0,0"}%</Badge>
        <Badge tone="netral">Food Cost {kotor > 0 ? ((hpp / kotor) * 100).toFixed(1).replace(".", ",") : "0,0"}%</Badge>
      </div>
      <p className="mt-3 text-xs text-slate-400 print:hidden">Tips: di dialog cetak pilih “Save as PDF” untuk mengunduh PDF.</p>
    </div>
  );
}
