import { EmptyState, PageHeader } from "@/components/ui";

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
        title={`Modul ${title} siap didesain`}
        desc={`${desc} Prototype ini menampilkan struktur dan alur. Hubungkan ke Supabase untuk data live.`}
        cta={cta}
        href="/"
      />
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
