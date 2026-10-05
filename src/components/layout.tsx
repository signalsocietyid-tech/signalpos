"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDB, rupiah } from "@/store/db";
import { useAuth, roleLabel } from "@/store/auth";

/* ================= Branch switcher ================= */
function BranchSwitcher({ compact }: { compact?: boolean }) {
  const { branches, activeBranchId, setActiveBranchId } = useDB();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const active = branches.find((b) => b.id === activeBranchId) ?? branches[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const list = branches.filter(
    (b) => b.nama.toLowerCase().includes(q.toLowerCase()) || b.alamat.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="press flex items-center gap-2.5 rounded-2xl border border-[#E2E8F0] bg-white py-1.5 pl-2 pr-3 shadow-sm transition hover:border-[#93C5FD]"
        aria-label="Ganti cabang"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ background: active.warna }}>
          {active.nama.replace("Semua Cabang", "★").charAt(0)}
        </span>
        {!compact && (
          <span className="hidden text-left sm:block">
            <span className="block max-w-36 truncate text-[13px] font-bold leading-tight">{active.nama}</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className={`h-1.5 w-1.5 rounded-full ${active.status === "Buka" ? "bg-[#16A34A]" : "bg-slate-300"}`} />
              {active.status} • {rupiah(active.omzetHariIni)}
            </span>
          </span>
        )}
        <span className="text-slate-400">▾</span>
      </button>

      {open && (
        <div className="card absolute left-0 top-12 z-40 w-80 overflow-hidden !rounded-2xl">
          <div className="border-b border-[#E2E8F0] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pilih cabang</p>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari cabang / alamat…"
              className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {list.map((b) => {
              const sel = b.id === activeBranchId;
              return (
                <button
                  key={b.id}
                  onClick={() => { setActiveBranchId(b.id); setOpen(false); }}
                  className={`press flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                    sel ? "bg-[#EFF6FF] ring-1 ring-[#2563EB]/30" : "hover:bg-[#F1F5F9]"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white" style={{ background: b.warna }}>
                    {b.id === "semua" ? "✦" : b.nama.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold">{b.nama}</span>
                      {sel && <span className="rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-bold text-white">Aktif</span>}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{b.alamat}</span>
                    <span className="tnum mt-0.5 block text-[11px] text-slate-500">
                      {b.transaksiHariIni} trx • {rupiah(b.omzetHariIni)} • Kas {rupiah(b.kas)}
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${b.status === "Buka" ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-slate-100 text-slate-500"}`}>
                    {b.status}
                  </span>
                </button>
              );
            })}
            {list.length === 0 && <p className="p-4 text-center text-sm text-slate-500">Tidak ketemu. Coba kata lain.</p>}
          </div>
          <Link href="/cabang" onClick={() => setOpen(false)} className="block border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-center text-[13px] font-bold text-[#2563EB] hover:bg-[#EFF6FF]">
            Kelola cabang →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ================= user badge + logout ================= */
function UserBadge() {
  const { session, logout } = useAuth();
  if (!session) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right sm:block">
        <p className="max-w-28 truncate text-[13px] font-bold leading-tight">{session.nama}</p>
        <p className="text-[11px] text-slate-500">{roleLabel(session.role)}</p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-xs font-black text-white" title={`${session.nama} • ${roleLabel(session.role)}`}>
        {session.nama.charAt(0).toUpperCase()}
      </div>
      <button onClick={logout} className="press rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-2 text-[12px] font-bold text-slate-500 hover:bg-[#F1F5F9] hover:text-slate-800" title="Keluar">
        ⎋
      </button>
    </div>
  );
}

/* ================= navigasi admin ================= */
const adminGroups: { label: string; items: { href: string; label: string; icon: string }[] }[] = [
  { label: "Utama", items: [
    { href: "/", label: "Dashboard", icon: "◧" },
    { href: "/pos", label: "POS Kasir", icon: "◈" },
    { href: "/penjualan", label: "Penjualan", icon: "≡" },
  ]},
  { label: "Katalog", items: [
    { href: "/produk", label: "Produk", icon: "○" },
    { href: "/resep", label: "Resep & HPP", icon: "◎" },
    { href: "/bahan", label: "Bahan Baku", icon: "⬡" },
  ]},
  { label: "Operasional", items: [
    { href: "/stok", label: "Stok", icon: "▤" },
    { href: "/pembelian", label: "Pembelian", icon: "▣" },
    { href: "/transfer", label: "Transfer", icon: "⇄" },
    { href: "/opname", label: "Opname", icon: "◐" },
    { href: "/waste", label: "Waste", icon: "△" },
  ]},
  { label: "Keuangan", items: [
    { href: "/pengeluaran", label: "Pengeluaran", icon: "–" },
    { href: "/shift", label: "Shift & Kas", icon: "◑" },
    { href: "/laporan", label: "Laporan", icon: "▥" },
    { href: "/profitabilitas", label: "Profitabilitas", icon: "▲" },
  ]},
  { label: "Sistem", items: [
    { href: "/cabang", label: "Cabang", icon: "⬣" },
    { href: "/pengguna", label: "Pengguna", icon: "◍" },
    { href: "/supplier", label: "Supplier", icon: "◇" },
    { href: "/pengaturan", label: "Pengaturan", icon: "✦" },
    { href: "/audit", label: "Audit Log", icon: "☰" },
  ]},
];

const posRail = [
  { href: "/pos", label: "Kasir", icon: "◈" },
  { href: "/pos/riwayat", label: "Riwayat", icon: "≡" },
  { href: "/pos/stok", label: "Stok", icon: "▤" },
  { href: "/pos/shift", label: "Shift", icon: "◑" },
  { href: "/pos/menu", label: "Menu", icon: "○" },
  { href: "/admin", label: "Admin", icon: "◧" },
];

function AdminNav({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-5">
      {adminGroups.map((g) => (
        <div key={g.label}>
          <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">{g.label}</p>
          <div className="space-y-0.5">
            {g.items.map((it) => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={onNav}
                  className={`press flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition ${
                    active ? "bg-[#2563EB] text-white shadow-sm" : "text-slate-600 hover:bg-[#EFF6FF] hover:text-[#0F172A]"
                  }`}
                >
                  <span className={`w-4 text-center text-[13px] ${active ? "opacity-90" : "opacity-50"}`}>{it.icon}</span>
                  {it.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/* ================= shell ================= */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { session, isAuthenticated } = useAuth();

  const isLogin = pathname === "/login";
  const isPos = pathname === "/pos" || pathname.startsWith("/pos/");

  // Proteksi halaman: belum login → /login. Kasir → hanya /pos (+ /login).
  useEffect(() => {
    if (isLogin) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (session?.role === "kasir" && !isPos) {
      router.replace("/pos");
    }
  }, [isLogin, isAuthenticated, session, isPos, router, pathname]);

  // Halaman login: layout kosong.
  if (isLogin) return <>{children}</>;

  // Belum ada session: tampilkan loading selagi redirect ke /login.
  if (!isAuthenticated || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm font-semibold text-slate-500">Mengalihkan ke login…</p>
      </div>
    );
  }

  if (isPos) {
    return (
      <div className="flex min-h-screen bg-[#F1F5F9]">
        {/* rel kiri POS */}
        <aside className="sticky top-0 hidden h-screen w-[76px] shrink-0 flex-col items-center border-r border-[#E2E8F0] bg-white py-4 sm:flex">
          <button onClick={() => router.push("/pos")} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB] text-lg font-black text-white shadow-sm" title="Signal POS">
            S
          </button>
          <div className="mt-6 flex flex-1 flex-col items-center gap-1">
            {posRail
              .filter((n) => n.href !== "/admin" || session.role !== "kasir")
              .map((n) => {
              const gotoAdmin = n.href === "/admin";
              const active = n.href === "/pos"
                ? pathname === "/pos"
                : pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href + n.label}
                  href={n.href}
                  title={n.label}
                  className={`press flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[10px] font-bold transition ${
                    active && !gotoAdmin ? "bg-[#2563EB] text-white shadow-sm" : gotoAdmin ? "text-slate-400 hover:bg-[#EFF6FF] hover:text-[#2563EB]" : "text-slate-500 hover:bg-[#EFF6FF] hover:text-slate-800"
                  }`}
                >
                  <span className="text-base leading-none">{n.icon}</span>
                  {n.label}
                </Link>
              );
            })}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">
            {session.nama.charAt(0).toUpperCase()}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* topbar POS */}
          <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/90 backdrop-blur">
            <div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-5">
              <button onClick={() => router.push("/pos")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] font-black text-white sm:hidden">S</button>
              <BranchSwitcher />
              <div className="hidden items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#1D4ED8] md:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2563EB]" />
                Live • POS
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="hidden items-center gap-1 rounded-full bg-[#E2E8F0] p-1 sm:flex">
                  <span className="rounded-full bg-[#2563EB] px-3 py-1 text-xs font-bold text-white">POS</span>
                  {(session.role === "admin" || session.role === "cabang") && (
                    <button onClick={() => router.push("/admin")} className="press rounded-full px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-800">Admin</button>
                  )}
                </div>
                {(session.role === "admin" || session.role === "cabang") && (
                  <button onClick={() => router.push("/admin")} className="press rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] font-bold sm:hidden">Admin</button>
                )}
                <UserBadge />
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    );
  }

  /* ------- panel admin ------- */
  // Kasir tidak boleh ke sini — sudah di-redirect ke /pos di atas.
  if (session.role === "kasir") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm font-semibold text-slate-500">Mengalihkan ke POS…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[#E2E8F0] bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 pb-3 pt-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-base font-black text-white">S</div>
          <div>
            <p className="text-sm font-bold leading-tight">Signal POS</p>
            <p className="text-[11px] text-slate-500">Backoffice • /admin</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4"><AdminNav /></div>
        <div className="border-t border-[#E2E8F0] p-3">
          <button onClick={() => router.push("/pos")} className="press w-full rounded-2xl bg-[#2563EB] py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]">
            Buka POS Kasir →
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/90 backdrop-blur">
          <div className="flex items-center gap-2.5 px-4 py-2.5 lg:px-6">
            <button onClick={() => setOpen(true)} className="press rounded-xl border border-[#E2E8F0] px-2.5 py-1.5 text-sm lg:hidden" aria-label="Buka navigasi">☰</button>
            <BranchSwitcher />
            <div className="hidden items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#1D4ED8] md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" /> Terhubung
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden min-w-44 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 text-[13px] text-slate-400 md:flex">
                <span>⌕</span><span>Cari transaksi, produk…</span>
              </div>
              <div className="hidden items-center gap-1 rounded-full bg-[#E2E8F0] p-1 sm:flex">
                <button onClick={() => router.push("/pos")} className="press rounded-full px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-800">POS</button>
                <span className="rounded-full bg-[#2563EB] px-3 py-1 text-xs font-bold text-white">Admin</span>
              </div>
              <button onClick={() => router.push("/pos")} className="press rounded-xl bg-[#0F172A] px-3.5 py-2 text-[13px] font-bold text-white hover:bg-[#2563EB]">
                Buka POS
              </button>
              <UserBadge />
            </div>
          </div>
        </header>
        <main className="flex-1"><div className="mx-auto max-w-6xl p-4 lg:p-6">{children}</div></main>
      </div>

      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold">Signal POS <span className="ml-1 rounded-full bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">ADMIN</span></p>
              <button onClick={() => setOpen(false)} className="rounded-lg border border-[#E2E8F0] px-2.5 py-1 text-sm">Tutup</button>
            </div>
            <AdminNav onNav={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
