"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type Role } from "@/store/auth";

type BranchOpt = { id: string; nama: string };

const ROLE_CARDS: { role: Role; judul: string; desc: string; user: string; pass: string; ikon: string }[] = [
  { role: "admin", judul: "Admin", desc: "Akses penuh semua cabang & laporan", user: "admin", pass: "admin123", ikon: "◧" },
  { role: "cabang", judul: "Per Cabang", desc: "Kelola 1 cabang + laporan cabang", user: "braga", pass: "cabang123", ikon: "⬣" },
  { role: "kasir", judul: "Kasir / User", desc: "Hanya kasir POS 1 cabang", user: "kasir", pass: "kasir123", ikon: "◈" },
];

const FALLBACK_BRANCHES: BranchOpt[] = [
  { id: "c1", nama: "Cabang 1 — Dago" },
  { id: "c2", nama: "Cabang 2 — Braga" },
  { id: "c3", nama: "Cabang 3 — Cihampelas" },
  { id: "c4", nama: "Cabang 4 — Buah Batu" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [role, setRole] = useState<Role>("admin");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [cabangId, setCabangId] = useState("c2");
  const [branches, setBranches] = useState<BranchOpt[]>(FALLBACK_BRANCHES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/branches")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && Array.isArray(j.data)) {
          const list = j.data.filter((b: BranchOpt) => b.id !== "semua");
          if (list.length > 0) setBranches(list);
        }
      })
      .catch(() => {
        /* pakai fallback */
      });
  }, []);

  useEffect(() => {
    if (isAuthenticated) router.replace("/admin");
  }, [isAuthenticated, router]);

  function pilihRole(r: Role) {
    setRole(r);
    setError("");
    const c = ROLE_CARDS.find((x) => x.role === r)!;
    setUsername(c.user);
    setPassword(c.pass);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const j = await res.json();
      if (!j.ok) {
        setError(j.error ?? "Login gagal.");
        return;
      }
      const u = j.data.user;
      // Kasir & cabang dikunci ke cabang pilihannya (kecuali admin).
      const finalCabang = u.role === "admin" ? null : cabangId || u.cabangId;
      login({ nama: u.nama, username: u.username, role: u.role, cabangId: finalCabang, token: j.data.token });
      router.push(j.data.redirect as string);
    } catch {
      setError("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#EFF6FF] via-[#F8FAFC] to-white p-4">
      <div className="card grid w-full max-w-4xl overflow-hidden !rounded-3xl md:grid-cols-2">
        {/* panel kiri: branding */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-8 text-white md:flex">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl font-black">S</div>
            <h1 className="mt-5 text-2xl font-black tracking-tight">SignalPOS</h1>
            <p className="mt-1 text-sm text-blue-100">Kasir + backoffice kebab multi-cabang dalam satu sistem biru-putih.</p>
          </div>
          <div className="space-y-2">
            {ROLE_CARDS.map((c) => (
              <button
                key={c.role}
                onClick={() => pilihRole(c.role)}
                className={`press flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  role === c.role ? "border-white bg-white text-[#0F172A]" : "border-white/30 bg-white/10 hover:bg-white/20"
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${role === c.role ? "bg-[#2563EB] text-white" : "bg-white/20"}`}>{c.ikon}</span>
                <span>
                  <span className="block text-sm font-black">Login sebagai {c.judul}</span>
                  <span className={`block text-xs ${role === c.role ? "text-slate-500" : "text-blue-100"}`}>{c.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-blue-200">POS di <b>/pos</b> • Admin di <b>/admin</b> • Masuk di <b>/login</b></p>
        </div>

        {/* panel kanan: form */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] font-black text-white">S</div>
            <p className="font-black">SignalPOS</p>
          </div>

          {/* pilih peran (mobile) */}
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-[#F1F5F9] p-1 md:hidden">
            {ROLE_CARDS.map((c) => (
              <button
                key={c.role}
                onClick={() => pilihRole(c.role)}
                className={`press rounded-xl px-2 py-2 text-xs font-bold transition ${role === c.role ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-500"}`}
              >
                {c.judul}
              </button>
            ))}
          </div>

          <h2 className="mt-4 text-xl font-black tracking-tight text-[#0F172A] md:mt-0">Masuk</h2>
          <p className="mt-1 text-sm text-slate-500">
            {role === "admin" && "Admin: akses penuh ke semua cabang."}
            {role === "cabang" && "Manajer cabang: pilih cabang yang dikelola."}
            {role === "kasir" && "Kasir/user: terkunci ke 1 cabang, langsung ke POS."}
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                placeholder="cth. admin"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                placeholder="••••••••"
              />
            </label>
            {role !== "admin" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Cabang</span>
                <select
                  value={cabangId}
                  onChange={(e) => setCabangId(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.nama}</option>
                  ))}
                </select>
              </label>
            )}
            {error && <p className="rounded-xl bg-[#FEE2E2] px-3 py-2.5 text-sm font-semibold text-[#DC2626]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="press w-full rounded-2xl bg-[#2563EB] py-3 text-sm font-black text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
            >
              {loading ? "Memeriksa…" : "Masuk →"}
            </button>
          </form>

          <div className="tnum mt-4 rounded-2xl bg-[#F1F5F9] p-3 text-[11px] leading-relaxed text-slate-500">
            <p className="font-bold text-slate-600">Akun demo:</p>
            <p>Admin — <b>admin / admin123</b> → /admin</p>
            <p>Cabang — <b>braga / cabang123</b> → /admin?cabang=c2</p>
            <p>Kasir — <b>kasir / kasir123</b> → /pos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
