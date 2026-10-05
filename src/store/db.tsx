"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ingredients as seedIngredients, products as seedProducts } from "@/data/mock";

export type Branch = {
  id: string;
  nama: string;
  alamat: string;
  warna: string;
  status: "Buka" | "Tutup";
  transaksiHariIni: number;
  omzetHariIni: number;
  kas: number;
};

export type Product = {
  id: string;
  nama: string;
  sku: string;
  kategori: string;
  harga: number;
  hpp: number;
  status: "Aktif" | "Nonaktif";
  stok?: number;
  diskonPct?: number;
};

export type Ingredient = {
  nama: string;
  sku: string;
  satuan: string;
  stok: number;
  minimum: number;
  hargaRata: number;
  cabang: string;
};

export type Sale = {
  id: string;
  cabang: string;
  kasir: string;
  jam: string;
  total: number;
  hpp: number;
  laba: number;
  bayar: string;
  status: "LUNAS" | "Pending" | "Refund";
};

const seedBranches: Branch[] = [
  { id: "semua", nama: "Semua Cabang", alamat: "Agregat 4 outlet", warna: "#0F172A", status: "Buka", transaksiHariIni: 348, omzetHariIni: 12450000, kas: 8450000 },
  { id: "c1", nama: "Cabang 1 — Dago", alamat: "Jl. Ir. H. Juanda No. 88", warna: "#2563EB", status: "Buka", transaksiHariIni: 96, omzetHariIni: 3420000, kas: 2150000 },
  { id: "c2", nama: "Cabang 2 — Braga", alamat: "Jl. Braga No. 12", warna: "#0284C7", status: "Buka", transaksiHariIni: 128, omzetHariIni: 4860000, kas: 3240000 },
  { id: "c3", nama: "Cabang 3 — Cihampelas", alamat: "Jl. Cihampelas No. 45", warna: "#4F46E5", status: "Buka", transaksiHariIni: 74, omzetHariIni: 2610000, kas: 1780000 },
  { id: "c4", nama: "Cabang 4 — Buah Batu", alamat: "Jl. Buah Batu No. 203", warna: "#64748B", status: "Tutup", transaksiHariIni: 0, omzetHariIni: 0, kas: 1280000 },
];

const seedSales: Sale[] = [
  { id: "TRX-20261004-00192", cabang: "Cabang 2 — Braga", kasir: "Andi", jam: "19:42", total: 55000, hpp: 28500, laba: 26500, bayar: "QRIS", status: "LUNAS" },
  { id: "TRX-20261004-00191", cabang: "Cabang 1 — Dago", kasir: "Sinta", jam: "19:35", total: 43000, hpp: 21600, laba: 21400, bayar: "Tunai", status: "LUNAS" },
  { id: "TRX-20261004-00190", cabang: "Cabang 2 — Braga", kasir: "Andi", jam: "19:21", total: 25000, hpp: 13250, laba: 11750, bayar: "QRIS", status: "LUNAS" },
  { id: "TRX-20261004-00189", cabang: "Cabang 3 — Cihampelas", kasir: "Budi", jam: "19:12", total: 67000, hpp: 34800, laba: 32200, bayar: "E-wallet", status: "LUNAS" },
];

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function save(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch { /* abaikan */ }
}

type DB = {
  branches: Branch[];
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  activeBranch: Branch;
  products: Product[];
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  toggleProduct: (id: string) => void;
  ingredients: Ingredient[];
  upsertIngredient: (b: Ingredient) => void;
  deleteIngredient: (sku: string) => void;
  upsertBranch: (b: Branch) => void;
  toggleBranch: (id: string) => void;
  sales: Sale[];
  addSale: (s: Sale) => void;
  resetAll: () => void;
};

const Ctx = createContext<DB | null>(null);

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>(seedBranches);
  const [products, setProducts] = useState<Product[]>(() =>
    seedProducts.map((p, i) => ({ ...p, stok: [42, 38, 51, 27, 19, 12, 22, 60, 120, 88, 200, 150][i] ?? 20 }))
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>(seedIngredients);
  const [sales, setSales] = useState<Sale[]>(seedSales);
  const [activeBranchId, setActiveBranchId] = useState("c2");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard: muat persisted state sekali setelah mount
    setBranches(load("signalpos:branches", seedBranches));
    setProducts(load("signalpos:products", seedProducts.map((p, i) => ({ ...p, stok: [42, 38, 51, 27, 19, 12, 22, 60, 120, 88, 200, 150][i] ?? 20 }))));
    setIngredients(load("signalpos:ingredients", seedIngredients));
    setSales(load("signalpos:sales", seedSales));
    setActiveBranchId(load("signalpos:branch", "c2"));
    setReady(true);
  }, []);

  useEffect(() => { if (ready) save("signalpos:branches", branches); }, [branches, ready]);
  useEffect(() => { if (ready) save("signalpos:products", products); }, [products, ready]);
  useEffect(() => { if (ready) save("signalpos:ingredients", ingredients); }, [ingredients, ready]);
  useEffect(() => { if (ready) save("signalpos:sales", sales); }, [sales, ready]);
  useEffect(() => { if (ready) save("signalpos:branch", activeBranchId); }, [activeBranchId, ready]);

  const upsertProduct = useCallback((p: Product) => {
    setProducts((prev) => {
      const ada = prev.some((x) => x.id === p.id);
      if (ada) return prev.map((x) => (x.id === p.id ? p : x));
      return [p, ...prev];
    });
  }, []);
  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((x) => x.id !== id));
  }, []);
  const toggleProduct = useCallback((id: string) => {
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, status: x.status === "Aktif" ? "Nonaktif" : "Aktif" } : x)));
  }, []);

  const upsertIngredient = useCallback((b: Ingredient) => {
    setIngredients((prev) => {
      const ada = prev.some((x) => x.sku === b.sku);
      if (ada) return prev.map((x) => (x.sku === b.sku ? b : x));
      return [b, ...prev];
    });
  }, []);
  const deleteIngredient = useCallback((sku: string) => {
    setIngredients((prev) => prev.filter((x) => x.sku !== sku));
  }, []);

  const upsertBranch = useCallback((b: Branch) => {
    setBranches((prev) => {
      const ada = prev.some((x) => x.id === b.id);
      if (ada) return prev.map((x) => (x.id === b.id ? b : x));
      return [...prev, b];
    });
  }, []);
  const toggleBranch = useCallback((id: string) => {
    setBranches((prev) => prev.map((x) => (x.id === id ? { ...x, status: x.status === "Buka" ? "Tutup" : "Buka" } : x)));
  }, []);

  const addSale = useCallback((s: Sale) => {
    setSales((prev) => [s, ...prev]);
  }, []);

  const resetAll = useCallback(() => {
    setBranches(seedBranches);
    setProducts(seedProducts.map((p, i) => ({ ...p, stok: [42, 38, 51, 27, 19, 12, 22, 60, 120, 88, 200, 150][i] ?? 20 })));
    setIngredients(seedIngredients);
    setSales(seedSales);
    setActiveBranchId("c2");
  }, []);

  const activeBranch = useMemo(
    () => branches.find((b) => b.id === activeBranchId) ?? branches[0],
    [branches, activeBranchId]
  );

  const val: DB = {
    branches, activeBranchId, setActiveBranchId, activeBranch,
    products, upsertProduct, deleteProduct, toggleProduct,
    ingredients, upsertIngredient, deleteIngredient,
    upsertBranch, toggleBranch, sales, addSale, resetAll,
  };
  return <Ctx.Provider value={val}>{children}</Ctx.Provider>;
}

export function useDB() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDB harus di dalam DBProvider");
  return v;
}

export function rupiah(n: number) {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}
