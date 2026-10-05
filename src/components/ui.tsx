"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/* ---------- tone kecil ---------- */
export function Badge({
  children,
  tone = "netral",
}: {
  children: React.ReactNode;
  tone?: "netral" | "sukses" | "peringatan" | "bahaya" | "info";
}) {
  const map: Record<string, string> = {
    netral: "bg-[#F1F5F9] text-slate-600 border-[#E2E8F0]",
    sukses: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
    peringatan: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
    bahaya: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
    info: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
}

/* ---------- kartu statistik ---------- */
export function Card({
  title, value, sub, href, accent,
}: { title: string; value: string; sub?: string; href?: string; accent?: boolean }) {
  const inner = (
    <div className={`card card-hover p-4 ${accent ? "ring-1 ring-[#2563EB]/30" : ""}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{title}</p>
      <p className={`tnum mt-1.5 text-[26px] font-bold tracking-tight ${accent ? "text-[#2563EB]" : "text-[#0F172A]"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
  if (href) return <Link href={href} className="block">{inner}</Link>;
  return inner;
}

export function EmptyState({ title, desc, cta, href }: { title: string; desc: string; cta?: string; href?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF6FF] text-lg text-[#2563EB]">○</div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{desc}</p>
      {cta && href && (
        <Link href={href} className="press mt-4 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]">
          {cta}
        </Link>
      )}
    </div>
  );
}

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
        {desc && <p className="mt-1 max-w-xl text-sm text-slate-500">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function FilterBar({ options, defaultValue, onChange }: { options: string[]; defaultValue?: string; onChange?: (v: string) => void }) {
  const [val, setVal] = useState(defaultValue ?? options[0]);
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-sm">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => { setVal(o); onChange?.(o); }}
          className={`press rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
            val === o ? "bg-[#2563EB] text-white" : "text-slate-600 hover:bg-[#F1F5F9]"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ---------- modal ---------- */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className={`card relative w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[92vh] overflow-y-auto p-5 !rounded-[20px]`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
          <button onClick={onClose} className="press rounded-lg border border-[#E2E8F0] px-2.5 py-1 text-sm text-slate-500 hover:bg-[#F1F5F9]">Tutup</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15";

/* ---------- segmented (Dine in / Take away) ---------- */
export function Segmented<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[#E2E8F0] p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`press rounded-xl px-2 py-2 text-xs font-bold transition ${
            value === o ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ---------- visual produk (pengganti foto, tetap sejuk biru) ---------- */
const ART: Record<string, { bg: string; emoji: string }> = {
  Kebab: { bg: "linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 55%,#BFDBFE 100%)", emoji: "🥙" },
  Burger: { bg: "linear-gradient(135deg,#EFF6FF 0%,#E0E7FF 60%,#C7D2FE 100%)", emoji: "🍔" },
  Shawarma: { bg: "linear-gradient(135deg,#F8FAFC 0%,#E2E8F0 60%,#CBD5E1 100%)", emoji: "🌯" },
  Rice: { bg: "linear-gradient(135deg,#F8FAFC 0%,#F1F5F9 60%,#E2E8F0 100%)", emoji: "🍚" },
  Fries: { bg: "linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 60%,#BFDBFE 100%)", emoji: "🍟" },
  Snack: { bg: "linear-gradient(135deg,#F1F5F9 0%,#E2E8F0 60%,#CBD5E1 100%)", emoji: "🧆" },
  Minuman: { bg: "linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 60%,#BFDBFE 100%)", emoji: "🥤" },
  Saus: { bg: "linear-gradient(135deg,#FEE2E2 0%,#FECACA 60%,#FCA5A5 100%)", emoji: "🧂" },
  Combo: { bg: "linear-gradient(135deg,#EFF6FF 0%,#E0E7FF 55%,#C7D2FE 100%)", emoji: "🍱" },
  "Add-on": { bg: "linear-gradient(135deg,#F1F5F9 0%,#E2E8F0 60%,#CBD5E1 100%)", emoji: "🧀" },
};

export function ProductArt({ kategori, nama, size = "md" }: { kategori: string; nama: string; size?: "sm" | "md" | "lg" }) {
  const a = ART[kategori] ?? { bg: "linear-gradient(135deg,#F1F5F9,#E2E8F0)", emoji: "🍽️" };
  const initials = nama.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const pad = size === "sm" ? "h-12 w-12 text-xl rounded-xl" : size === "lg" ? "h-28 w-full text-5xl rounded-2xl" : "h-24 w-full text-4xl rounded-2xl";
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${pad}`} style={{ background: a.bg }} title={nama}>
      <span className="absolute left-2 top-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 backdrop-blur">
        {initials}
      </span>
      <span className="drop-shadow-sm">{a.emoji}</span>
      <span className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{ background: "radial-gradient(circle at 80% 10%, rgba(255,255,255,.9), transparent 45%)" }} />
    </div>
  );
}

export function QtyStepper({ qty, onMinus, onPlus, dark }: { qty: number; onMinus: () => void; onPlus: () => void; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onMinus} aria-label="Kurangi" className="press flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-base font-bold text-slate-700 hover:bg-[#F1F5F9]">−</button>
      <span className="tnum w-6 text-center text-sm font-bold">{qty}</span>
      <button onClick={onPlus} aria-label="Tambah" className={`press flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-white ${dark ? "bg-[#1D4ED8] hover:bg-[#1E40AF]" : "bg-[#2563EB] hover:bg-[#1D4ED8]"}`}>+</button>
    </div>
  );
}

export function useActive(path: string) {
  const pathname = usePathname();
  return pathname === path || pathname.startsWith(path + "/");
}
