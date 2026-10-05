import Link from "next/link";
import { Badge, PageHeader } from "@/components/ui";
import { rupiah } from "@/data/mock";

const rincian = [
  { nama: "Beef", biaya: 15000 },
  { nama: "Tortilla", biaya: 5000 },
  { nama: "Sayuran", biaya: 2000 },
  { nama: "Saus", biaya: 2000 },
  { nama: "Packaging", biaya: 1400 },
  { nama: "Cheese", biaya: 3100 },
];

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  return (
    <div>
      <PageHeader
        title={decoded}
        desc="Cabang 2 • Kasir Andi • 19:42"
        action={
          <div className="flex gap-2">
            <Link href="/penjualan" className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm">
              Kembali
            </Link>
            <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              Ajukan Refund
            </button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-[#E2E8F0] p-4 lg:col-span-2">
          <h2 className="font-semibold">Isi Pesanan</h2>
          <ul className="mt-2 divide-y divide-[#E2E8F0] text-sm">
            <li className="flex justify-between py-2">
              <span>2 × Kebab Beef Large</span>
              <span className="font-medium">{rupiah(50000)}</span>
            </li>
            <li className="flex justify-between py-2">
              <span>1 × Extra Cheese</span>
              <span className="font-medium">{rupiah(5000)}</span>
            </li>
          </ul>
          <dl className="mt-3 space-y-1 border-t border-[#E2E8F0] pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-neutral-500">Total</dt><dd className="font-bold">{rupiah(55000)}</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-500">HPP</dt><dd>{rupiah(28500)}</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-500">Laba Kotor</dt><dd className="font-semibold text-green-700">{rupiah(26500)}</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-500">Pembayaran</dt><dd>QRIS • <Badge tone="sukses">LUNAS</Badge></dd></div>
          </dl>
        </section>
        <section className="rounded-xl border border-[#E2E8F0] p-4">
          <h2 className="font-semibold">Rincian HPP</h2>
          <p className="text-xs text-neutral-500">Versi resep v12 • Harga saat transaksi</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {rincian.map((r) => (
              <li key={r.nama} className="flex justify-between rounded-lg bg-[#F1F5F9] px-3 py-1.5">
                <span>{r.nama}</span>
                <span className="font-medium">{rupiah(r.biaya)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-[#E2E8F0] pt-2 text-sm font-bold">
            <span>Total HPP</span>
            <span>{rupiah(28500)}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
