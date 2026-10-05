import { Badge, PageHeader } from "@/components/ui";
import { rupiah } from "@/data/mock";

export default function ShiftPage() {
  return (
    <div>
      <PageHeader
        title="Shift & Kas"
        desc="Cabang 2 • Shift aktif Andi & Sinta • 09:00–17:00"
        action={<button className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">Tutup Shift</button>}
      />
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Kas Awal", rupiah(500000)],
          ["Penjualan Tunai", rupiah(1500000)],
          ["Pengeluaran Kas", rupiah(100000)],
          ["Kas Seharusnya", rupiah(1900000)],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-xl border border-[#E2E8F0] p-3">
            <p className="text-xs uppercase text-neutral-500">{l}</p>
            <p className="text-lg font-bold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
        <p className="font-semibold text-red-700">Kas Kurang Rp50.000</p>
        <p className="text-red-600">Kas aktual Rp1.850.000 • Selisih -Rp50.000 • Perlu catatan serah terima.</p>
      </div>
      <div className="mt-3 flex gap-2">
        <Badge tone="sukses">Kas Bersama Aktif</Badge>
        <Badge tone="netral">2 kasir dalam shift</Badge>
      </div>
    </div>
  );
}
