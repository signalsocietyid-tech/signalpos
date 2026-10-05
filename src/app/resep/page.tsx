import { Badge, PageHeader } from "@/components/ui";
import { recipeKebabLarge, rupiah } from "@/data/mock";

export default function ResepPage() {
  const total = recipeKebabLarge.reduce((s, r) => s + r.biaya, 0);
  return (
    <div>
      <PageHeader
        title="Resep & HPP"
        desc="Setiap perubahan resep menyimpan versi baru. HPP lama tidak berubah."
        action={
          <button className="rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white">
            Ubah Resep
          </button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-[#E2E8F0] p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Kebab Beef Large</h2>
            <Badge tone="info">Versi 12 • Aktif</Badge>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F1F5F9] text-xs text-neutral-500 uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Bahan</th>
                  <th className="px-3 py-2 text-left">Pemakaian</th>
                  <th className="px-3 py-2 text-right">Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recipeKebabLarge.map((r) => (
                  <tr key={r.nama}>
                    <td className="px-3 py-2 font-medium">{r.nama}</td>
                    <td className="px-3 py-2 text-neutral-500">{r.jumlah}</td>
                    <td className="px-3 py-2 text-right">{rupiah(r.biaya)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="space-y-3">
          <div className="rounded-xl border border-[#2563EB]/40 bg-orange-50/50 p-4">
            <p className="text-xs text-neutral-500 uppercase">Total HPP Produk</p>
            <p className="text-2xl font-bold text-[#2563EB]">{rupiah(total)}</p>
            <p className="mt-1 text-xs text-neutral-500">Harga jual Rp25.000 • Margin 47%</p>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] p-4 text-sm">
            <h3 className="font-semibold">Riwayat Versi</h3>
            <ul className="mt-2 space-y-1.5 text-neutral-600">
              <li>v12 — Saus 25g • Hari ini</li>
              <li>v11 — Beef 100g • 2 minggu lalu</li>
              <li>v10 — Tortilla baru • Bulan lalu</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
