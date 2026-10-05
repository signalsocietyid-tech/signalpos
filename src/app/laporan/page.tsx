"use client";

import { useMemo, useState } from "react";
import { Badge, PageHeader } from "@/components/ui";
import { useDB, rupiah, tanggalOf } from "@/store/db";

type Periode = "Harian" | "Mingguan" | "Bulanan" | "Tahunan";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function rentang(p: Periode, ref: Date): { awal: string; akhir: string; label: string } {
  const hari = iso(ref);
  if (p === "Harian") return { awal: hari, akhir: hari, label: `Hari ini • ${ref.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` };
  if (p === "Mingguan") {
    const a = new Date(ref); a.setDate(a.getDate() - 6);
    return { awal: iso(a), akhir: hari, label: `7 hari terakhir • ${a.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} – ${ref.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}` };
  }
  if (p === "Bulanan") {
    const a = `${hari.slice(0, 7)}-01`;
    return { awal: a, akhir: hari, label: `Bulan ${ref.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}` };
  }
  const y = ref.getFullYear();
  return { awal: `${y}-01-01`, akhir: hari, label: `Tahun ${y}` };
}

function barisWaktu(p: Periode, awal: string, akhir: string): { kunci: string; label: string }[] {
  if (p === "Tahunan") return NAMA_BULAN.map((b, i) => ({ kunci: `${akhir.slice(0, 4)}-${String(i + 1).padStart(2, "0")}`, label: b }));
  const out: { kunci: string; label: string }[] = [];
  const d = new Date(awal + "T00:00:00");
  const stop = new Date(akhir + "T00:00:00");
  while (d <= stop) {
    const k = iso(d);
    out.push({ kunci: k, label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default function LaporanPage() {
  const { sales, saleLines, activeBranch, products } = useDB();
  const [periode, setPeriode] = useState<Periode>("Harian");

  const { daftar, awal, akhir, label } = useMemo(() => {
    const ref = new Date();
    const r = rentang(periode, ref);
    const list = sales.filter((s) => {
      const t = tanggalOf(s);
      return (activeBranch.id === "semua" || s.cabang === activeBranch.nama) && t >= r.awal && t <= r.akhir;
    });
    return { daftar: list, ...r };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, activeBranch, periode]);

  const kotor = daftar.reduce((a, s) => a + s.total, 0);
  const hpp = daftar.reduce((a, s) => a + s.hpp, 0);
  const labaKotor = kotor - hpp;

  const perWaktu = useMemo(() => {
    const rows = barisWaktu(periode, awal, akhir);
    return rows.map((r) => {
      const isi = daftar.filter((s) => {
        const t = tanggalOf(s);
        return periode === "Tahunan" ? t.slice(0, 7) === r.kunci : t === r.kunci;
      });
      return { ...r, trx: isi.length, omzet: isi.reduce((a, s) => a + s.total, 0) };
    });
  }, [daftar, periode, awal, akhir]);

  const perProduk = useMemo(() => {
    const ids = new Set(daftar.map((s) => s.id));
    const map = new Map<string, { nama: string; qty: number; omzet: number }>();
    saleLines.filter((l) => ids.has(l.saleId)).forEach((l) => {
      const e = map.get(l.productId) ?? { nama: l.nama, qty: 0, omzet: 0 };
      e.qty += l.qty;
      e.omzet += l.qty * l.harga;
      map.set(l.productId, e);
    });
    return [...map.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.qty - a.qty);
  }, [daftar, saleLines]);

  const totalQty = perProduk.reduce((a, p) => a + p.qty, 0);
  const topBayar = useMemo(() => {
    const m = new Map<string, number>();
    daftar.forEach((s) => m.set(s.bayar, (m.get(s.bayar) ?? 0) + s.total));
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [daftar]);

  return (
    <div>
      <PageHeader
        title="Laporan Penjualan"
        desc={`${activeBranch.nama} • ${label} • ${daftar.length} transaksi.`}
        action={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <div className="flex gap-1 rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-sm">
              {(["Harian", "Mingguan", "Bulanan", "Tahunan"] as Periode[]).map((p) => (
                <button key={p} onClick={() => setPeriode(p)} className={`press rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${periode === p ? "bg-[#2563EB] text-white" : "text-slate-600 hover:bg-[#F1F5F9]"}`}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => window.print()} className="press rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-bold shadow-sm hover:bg-[#F1F5F9]">
              🖨 Cetak / PDF
            </button>
          </div>
        }
      />

      <div className="print-area">
        <div className="mb-3 hidden print:block">
          <p className="font-black">SignalPOS — Laporan {periode}</p>
          <p className="text-xs text-slate-500">{activeBranch.nama} • {label}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="card p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Omzet</p><p className="tnum mt-1 text-xl font-black text-[#1D4ED8]">{rupiah(kotor)}</p></div>
          <div className="card p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Transaksi</p><p className="tnum mt-1 text-xl font-black">{daftar.length}</p></div>
          <div className="card p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Rata-rata</p><p className="tnum mt-1 text-xl font-black">{rupiah(daftar.length ? Math.round(kotor / daftar.length) : 0)}</p></div>
          <div className="card p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Laba kotor</p><p className="tnum mt-1 text-xl font-black text-[#16A34A]">{rupiah(labaKotor)}</p></div>
        </div>

        <div className="card mt-4 overflow-hidden">
          <p className="border-b border-[#E2E8F0] px-4 py-3 text-sm font-bold">
            {periode === "Tahunan" ? "Omzet per bulan" : "Omzet per hari"} {topBayar ? <span className="ml-2 font-normal text-slate-400">• Top bayar: {topBayar[0]}</span> : null}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-left text-sm">
              <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
                <tr><th className="px-4 py-3">Periode</th><th className="px-4 py-3">Transaksi</th><th className="px-4 py-3">Omzet</th><th className="px-4 py-3">Visual</th></tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {perWaktu.map((r) => {
                  const maks = Math.max(1, ...perWaktu.map((x) => x.omzet));
                  return (
                    <tr key={r.kunci} className="transition hover:bg-[#F8FAFC]">
                      <td className="px-4 py-2.5 font-semibold">{r.label}</td>
                      <td className="tnum px-4 py-2.5">{r.trx}</td>
                      <td className="tnum px-4 py-2.5 font-bold">{rupiah(r.omzet)}</td>
                      <td className="px-4 py-2.5">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-[#F1F5F9]">
                          <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${Math.round((r.omzet / maks) * 100)}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card mt-4 overflow-hidden">
          <p className="border-b border-[#E2E8F0] px-4 py-3 text-sm font-bold">
            Penjualan per produk (qty) <span className="ml-2 font-normal text-slate-400">• total {totalQty.toLocaleString("id-ID")} item</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-left text-sm">
              <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
                <tr><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Omzet</th><th className="px-4 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {perProduk.map((r) => {
                  const prod = products.find((x) => x.id === r.id);
                  return (
                    <tr key={r.id} className="transition hover:bg-[#F8FAFC]">
                      <td className="px-4 py-2.5 font-semibold">{r.nama}</td>
                      <td className="tnum px-4 py-2.5 font-black">{r.qty.toLocaleString("id-ID")}</td>
                      <td className="tnum px-4 py-2.5">{rupiah(r.omzet)}</td>
                      <td className="px-4 py-2.5"><Badge tone={prod?.status === "Aktif" ? "sukses" : "netral"}>{prod?.status ?? "—"}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {perProduk.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Belum ada rincian item pada periode ini. Rincian tercatat mulai transaksi baru setelah update ini.</p>}
          {daftar.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Belum ada transaksi pada periode ini.</p>}
        </div>

        <div className="mt-3 flex gap-2 text-sm print:hidden">
          <Badge tone="netral">HPP {rupiah(hpp)}</Badge>
          <Badge tone="netral">Margin {kotor > 0 ? ((labaKotor / kotor) * 100).toFixed(1).replace(".", ",") : "0,0"}%</Badge>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400 print:hidden">Tips: di dialog cetak pilih “Save as PDF” untuk mengunduh PDF.</p>
    </div>
  );
}
