"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

export type Role = "admin" | "cabang" | "kasir";

export type Session = {
  nama: string;
  username: string;
  role: Role;
  /** id cabang untuk role cabang/kasir; null = semua cabang (admin) */
  cabangId: string | null;
  token: string;
};

type AuthCtx = {
  session: Session | null;
  isAuthenticated: boolean;
  role: Role | null;
  login: (s: Session) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "signalpos:session";

function load(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s.username || !s.role || !s.token) return null;
    return s;
  } catch {
    return null;
  }
}

// Snapshot cache agar useSyncExternalStore tidak loop (referensi stabil).
let cached: Session | null | undefined;
const listeners = new Set<() => void>();

function getSnapshot(): Session | null {
  if (cached === undefined) cached = load();
  return cached;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) {
      cached = load();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const router = useRouter();

  const login = useCallback((s: Session) => {
    cached = s;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* abaikan */
    }
    emit();
  }, []);

  const logout = useCallback(() => {
    cached = null;
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* abaikan */
    }
    emit();
    router.push("/login");
  }, [router]);

  return (
    <Ctx.Provider
      value={{ session, isAuthenticated: !!session, role: session?.role ?? null, login, logout }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth harus di dalam AuthProvider");
  return v;
}

/** Label Indonesia untuk role. */
export function roleLabel(role: Role): string {
  if (role === "admin") return "Admin";
  if (role === "cabang") return "Manajer Cabang";
  return "Kasir";
}
