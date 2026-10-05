import { Badge, PageHeader } from "@/components/ui";

const gerak = [
  { tgl: "04 Okt 19:42", cabang: "Cabang 2", bahan: "Beef", jenis: "Pemakaian Penjualan", jumlah: "-200 gram", ref: "TRX-20261004-00192" },
  { tgl: "04 Okt 18:10", cabang: "Cabang 2", bahan: "Tortilla", jumlah: "+100 pcs", ref: "PO-20261003-014" },
  { tgl: "04 Okt 15:02", cabang: "Cabang 1", bahan: "Beef", jumlah: "+10 kg", ref: "Transfer TRF-088" },
  { tgl: "04 Okt 12:20", cabang: "Cabang 2", bahan: "Cheese", jumlah: "-120 gram", ref: "Waste WST-031" },
  { tgl: "04 Okt 09:05", cabang: "Cabang 2", bahan: "Beef", jumlah: "-600 gram", ref: "Opname OPN-012" },
];

export default function StokPage() {
  return (
    <div>
      <PageHeader
        title="Stok"
        desc="Setiap perubahan tercatat di buku stok. Tidak ada overwrite langsung."
        action={
          <button className="rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white">
            Mulai Stock Opname
          </button>
        }
      />
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
        <table className="w-full min-w-180 text-left text-sm">
          <thead className="bg-[#F1F5F9] text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2.5">Tanggal</th>
              <th className="px-4 py-2.5">Bahan</th>
              <th className="px-4 py-2.5">Jenis</th>
              <th className="px-4 py-2.5">Jumlah</th>
              <th className="px-4 py-2.5">Referensi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {gerak.map((g, i) => (
              <tr key={i}>
                <td className="px-4 py-2.5 text-neutral-500">{g.tgl}<br />{g.cabang}</td>
                <td className="px-4 py-2.5 font-medium">{g.bahan}</td>
                <td className="px-4 py-2.5"><Badge tone="netral">{g.jenis}</Badge></td>
                <td className="px-4 py-2.5 font-semibold">{g.jumlah}</td>
                <td className="px-4 py-2.5 text-neutral-500">{g.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
