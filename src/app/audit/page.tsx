"use client";

import { useMemo, useState } from "react";
import { Badge, PageHeader } from "@/components/ui";
import { useDB } from "@/store/db";

export default function AuditPage() {
  const { audit } = useDB();
  const [q, setQ] = useState("");

  const daftar = useMemo(() => {
    const s = q.toLowerCase();
    return audit.filter((a) => !s || (a.aksi + a.detail + a.waktu).toLowerCase().includes(s));
  }, [audit, q]);

  return (
    <div>
      <PageHeader
        title="Audit Log"
        desc={`${daftar.length} aktivitas tercatat • Transaksi, produk, stok, shift, dan pengaturan otomatis masuk ke sini.`}
      />
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm">
        <span className="text-neutral-400">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari aksi / detail / waktu…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-left text-sm">
            <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
              <tr><th className="px-4 py-3">Waktu</th><th className="px-4 py-3">Aksi</th><th className="px-4 py-3">Detail</th></tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {daftar.map((a) => (
                <tr key={a.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="tnum whitespace-nowrap px-4 py-3 text-neutral-500">{a.waktu}</td>
                  <td className="whitespace-nowrap px-4 py-3"><Badge tone="info">{a.aksi}</Badge></td>
                  <td className="px-4 py-3">{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {daftar.length === 0 && (
          <p className="p-8 text-center text-sm text-neutral-500">
            Belum ada aktivitas. Lakukan transaksi di POS atau ubah data — otomatis tercatat di sini.
          </p>
        )}
      </div>
    </div>
  );
}
