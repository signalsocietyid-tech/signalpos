"use client";

import { useMemo, useState } from "react";
import { Badge, Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { useDB, rupiah } from "@/store/db";

export default function ShiftPage() {
  const { shift, shiftHistory, openShift, closeShift, sales, expenses, activeBranch, branches } = useDB();
  const [tutupOpen, setTutupOpen] = useState(false);
  const [bukaOpen, setBukaOpen] = useState(false);
  const [kasAktual, setKasAktual] = useState(0);
  const [catatan, setCatatan] = useState("");
  const [formBuka, setFormBuka] = useState({ kasir: "Andi", kasAwal: 500000, cabang: "" });

  const buka = shift.status === "buka";
  const tunai = useMemo(
    () => sales.filter((s) => s.bayar === "Tunai" && (shift.cabang === "Semua Cabang" || s.cabang === shift.cabang)).reduce((a, s) => a + s.total, 0),
    [sales, shift.cabang]
  );
  const keluar = useMemo(
    () => expenses.filter((e) => shift.cabang === "Semua Cabang" || e.cabang === shift.cabang).reduce((a, e) => a + e.jumlah, 0),
    [expenses, shift.cabang]
  );
  const seharusnya = shift.kasAwal + tunai - keluar;
  const selisih = kasAktual - seharusnya;

  function konfirmasiTutup() {
    closeShift(Number(kasAktual), catatan.trim());
    setTutupOpen(false);
    setKasAktual(0);
    setCatatan("");
  }
  function konfirmasiBuka() {
    if (!formBuka.kasir.trim()) return;
    openShift({ cabang: formBuka.cabang || activeBranch.nama, kasir: formBuka.kasir.trim(), kasAwal: Number(formBuka.kasAwal) || 0, mulai: new Date().toTimeString().slice(0, 5) });
    setBukaOpen(false);
  }

  const cabangAktif = branches.filter((b) => b.id !== "semua");

  return (
    <div>
      <PageHeader
        title="Shift & Kas"
        desc={`${shift.cabang} • ${buka ? `Shift aktif ${shift.kasir} • mulai ${shift.mulai}` : "Tidak ada shift berjalan"}`}
        action={
          buka
            ? <button onClick={() => { setKasAktual(seharusnya); setTutupOpen(true); }} className="press rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">Tutup Shift</button>
            : <button onClick={() => setBukaOpen(true)} className="press rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#15803D]">Buka Shift</button>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Kas Awal", shift.kasAwal],
          ["Penjualan Tunai", tunai],
          ["Pengeluaran Kas", keluar],
          ["Kas Seharusnya", seharusnya],
        ].map(([l, v]) => (
          <div key={l as string} className="card p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{l}</p>
            <p className="tnum mt-1 text-xl font-black">{rupiah(v as number)}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Badge tone={buka ? "sukses" : "netral"}>{buka ? "Shift berjalan" : "Shift tutup"}</Badge>
        <Badge tone="netral">{shift.cabang}</Badge>
      </div>

      {shiftHistory.length > 0 && (
        <div className="card mt-4 overflow-hidden">
          <p className="border-b border-[#E2E8F0] px-4 py-3 text-sm font-bold">Riwayat shift</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="bg-[#F1F5F9] text-[11px] uppercase tracking-wide text-neutral-500">
                <tr><th className="px-4 py-3">Selesai</th><th className="px-4 py-3">Kasir</th><th className="px-4 py-3">Kas awal</th><th className="px-4 py-3">Kas akhir</th><th className="px-4 py-3">Selisih</th><th className="px-4 py-3">Catatan</th></tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {shiftHistory.map((h) => (
                  <tr key={h.id} className="transition hover:bg-[#F8FAFC]">
                    <td className="tnum whitespace-nowrap px-4 py-3">{h.selesai}</td>
                    <td className="px-4 py-3 font-semibold">{h.kasir}</td>
                    <td className="tnum px-4 py-3">{rupiah(h.kasAwal)}</td>
                    <td className="tnum px-4 py-3 font-bold">{rupiah(h.kasAkhir ?? 0)}</td>
                    <td className={`tnum px-4 py-3 font-bold ${(h.selisih ?? 0) < 0 ? "text-red-600" : "text-[#16A34A]"}`}>
                      {(h.selisih ?? 0) > 0 ? "+" : ""}{rupiah(h.selisih ?? 0).replace("Rp", "Rp")}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{h.catatan || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={tutupOpen} onClose={() => setTutupOpen(false)} title="Tutup shift">
        <div className="grid gap-3">
          <div className="tnum rounded-xl bg-[#F8FAFC] p-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Kas seharusnya</span><b>{rupiah(seharusnya)}</b></div>
          </div>
          <Field label="Kas aktual di laci (Rp)"><input type="number" min={0} className={inputCls} value={kasAktual} onChange={(e) => setKasAktual(Number(e.target.value))} /></Field>
          <div className={`tnum rounded-xl px-4 py-3 text-sm font-bold ${selisih < 0 ? "bg-[#FEE2E2] text-[#DC2626]" : selisih > 0 ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-slate-500"}`}>
            Selisih: {selisih > 0 ? "+" : ""}{rupiah(selisih)}
          </div>
          <Field label="Catatan serah terima"><input className={inputCls} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="cth. Kurang 50rb, cek ulang laci 2" /></Field>
        </div>
        <button onClick={konfirmasiTutup} className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8]">Konfirmasi tutup shift</button>
      </Modal>

      <Modal open={bukaOpen} onClose={() => setBukaOpen(false)} title="Buka shift baru">
        <div className="grid gap-3">
          <Field label="Cabang">
            <select className={inputCls} value={formBuka.cabang} onChange={(e) => setFormBuka({ ...formBuka, cabang: e.target.value })}>
              <option value="">{activeBranch.nama} (aktif)</option>
              {cabangAktif.map((b) => <option key={b.id} value={b.nama}>{b.nama}</option>)}
            </select>
          </Field>
          <Field label="Kasir bertugas"><input className={inputCls} value={formBuka.kasir} onChange={(e) => setFormBuka({ ...formBuka, kasir: e.target.value })} /></Field>
          <Field label="Kas awal (Rp)"><input type="number" min={0} className={inputCls} value={formBuka.kasAwal} onChange={(e) => setFormBuka({ ...formBuka, kasAwal: Number(e.target.value) })} /></Field>
        </div>
        <button onClick={konfirmasiBuka} disabled={!formBuka.kasir.trim()} className="press mt-4 w-full rounded-2xl bg-[#16A34A] py-3 text-sm font-bold text-white hover:bg-[#15803D] disabled:opacity-40">Mulai shift</button>
      </Modal>
    </div>
  );
}
