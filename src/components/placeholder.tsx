import { Badge, EmptyState, PageHeader } from "@/components/ui";

export function Placeholder({
  title,
  desc,
  cta,
}: {
  title: string;
  desc: string;
  cta?: string;
}) {
  return (
    <div>
      <PageHeader title={title} desc={desc} />
      <EmptyState
        title={`Modul ${title} segera hadir`}
        desc={`${desc} ${cta ? `Rencana aksi: "${cta}". ` : ""}Modul ini belum aktif — tidak ada tombol yang mengarah keluar dari halaman ini.`}
      />
      <div className="mt-3">
        <Badge tone="peringatan">Segera hadir</Badge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {["Filter cabang & periode", "Ekspor CSV / Excel / PDF", "Realtime via Supabase"].map((f) => (
          <div key={f} className="rounded-xl border border-[#E2E8F0] p-3 text-sm text-neutral-600">
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
