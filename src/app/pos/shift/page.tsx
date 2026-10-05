"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDB, rupiah } from "@/store/db";
import { Badge, Field, Modal, inputCls } from "@/components/ui";

export default function PosShift() {
  const { shift, openShift, closeShift, sales, activeBranch } = useDB();
  const [tutupOpen, setTutupOpen] = useState(false);
  const [kasAktual, setKasAktual] = useState(0);
  const buka = shift.status === "buka";

  const tunai = useMemo(
    () => sales.filter((s) => s.bayar === "Tunai" && (shift.cabang === "Semua Cabang" || s.cabang === shift.cabang)).reduce((a, s) => a + s.total, 0),
    [sales, shift.cabang]
  );
  const seharusnya = shift.kasAwal + tunai;
  const selisih = kasAktual - seharusnya;

  return (
    <div className="mx-auto max-w-3xl p-3 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-black tracking-tight">Shift</h1>
          <p className="text-xs text-slate-500">{shift.cabang} • {buka ? `berjalan sejak ${shift.mulai}` : "tutup"}</p>
        </div>
        <Link href="/pos" className="press rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-bold hover:bg-[#F1F5F9]">
          ← Kasir
        </Link>
      </div>

      <div className="card mt-3 flex items-center justify-between p-4">
        <div>
          <p className="text-[13px] font-bold">Kasir: {shift.kasir}</p>
          <p className="mt-0.5 text-xs text-slate-500">Kas awal {rupiah(shift.kasAwal)} • Tunai masuk {rupiah(tunai)}</p>
        </div>
        <Badge tone={buka ? "sukses" : "netral"}>{buka ? "Berjalan" : "Tutup"}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="card p-3.5 text-center">
          <p className="tnum text-lg font-black">{rupiah(seharusnya)}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">KAS SEHARUSNYA</p>
        </div>
        <div className="card p-3.5 text-center">
          <p className="tnum text-lg font-black">{rupiah(activeBranch.kas)}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">KAS CABANG</p>
        </div>
      </div>

      {buka ? (
        <button onClick={() => { setKasAktual(seharusnya); setTutupOpen(true); }} className="press mt-3 w-full rounded-2xl bg-[#2563EB] py-3.5 text-[15px] font-black text-white hover:bg-[#1D4ED8]">
          Tutup Shift
        </button>
      ) : (
        <button
          onClick={() => openShift({ cabang: activeBranch.nama, kasir: shift.kasir || "Andi", kasAwal: 500000, mulai: new Date().toTimeString().slice(0, 5) })}
          className="press mt-3 w-full rounded-2xl bg-[#16A34A] py-3.5 text-[15px] font-black text-white hover:bg-[#15803D]"
        >
          Buka Shift Baru
        </button>
      )}

      <Modal open={tutupOpen} onClose={() => setTutupOpen(false)} title="Tutup shift">
        <div className="grid gap-3">
          <Field label="Kas aktual di laci (Rp)"><input type="number" min={0} className={inputCls} value={kasAktual} onChange={(e) => setKasAktual(Number(e.target.value))} /></Field>
          <div className={`tnum rounded-xl px-4 py-3 text-sm font-bold ${selisih < 0 ? "bg-[#FEE2E2] text-[#DC2626]" : selisih > 0 ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-slate-500"}`}>
            Selisih: {selisih > 0 ? "+" : ""}{rupiah(selisih)}
          </div>
        </div>
        <button
          onClick={() => { closeShift(Number(kasAktual), "Tutup dari POS"); setTutupOpen(false); }}
          className="press mt-4 w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-bold text-white hover:bg-[#1D4ED8]"
        >
          Konfirmasi tutup shift
        </button>
      </Modal>
    </div>
  );
}
