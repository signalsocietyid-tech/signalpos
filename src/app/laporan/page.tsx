import { Badge, PageHeader } from "@/components/ui";
import { rupiah } from "@/data/mock";

export default function LaporanPage() {
  return (
    <div>
      <PageHeader
        title="Laporan Laba Rugi"
        desc="Bulan Ini • Semua Cabang • Dapat direkonsiliasi ke database."
        action={<button className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm">Unduh PDF</button>}
      />
      <div className="rounded-xl border border-[#E2E8F0] p-4 text-sm">
        {[
          ["Penjualan Kotor", 50000000, ""],
          ["Diskon", -2000000, "text-red-600"],
          ["Refund", -500000, "text-red-600"],
          ["Pendapatan Bersih", 47500000, "font-bold"],
          ["HPP", -20000000, "text-red-600"],
          ["Laba Kotor", 27500000, "font-bold text-green-700"],
          ["Biaya Operasional", -10000000, "text-red-600"],
          ["Laba Bersih", 17500000, "font-bold text-[#2563EB]"],
        ].map(([label, nilai, cls]) => (
          <div key={label as string} className={`flex justify-between border-b border-[#F1F5F9] py-2 last:border-0 ${cls as string}`}>
            <span>{label}</span>
            <span>{rupiah(nilai as number)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2 text-sm">
        <Badge tone="netral">Margin Kotor 57,9%</Badge>
        <Badge tone="netral">Margin Bersih 36,8%</Badge>
        <Badge tone="netral">Food Cost 42,1%</Badge>
      </div>
    </div>
  );
}
