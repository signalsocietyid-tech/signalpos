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

export type Expense = {
  id: string;
  tanggal: string;
  kategori: string;
  jumlah: number;
  cabang: string;
  catatan: string;
};

export type Purchase = {
  id: string;
  tanggal: string;
  supplier: string;
  skuBahan: string;
  namaBahan: string;
  qty: number;
  satuan: string;
  harga: number;
  total: number;
  status: "Draft" | "Diterima";
};

export type Transfer = {
  id: string;
  tanggal: string;
  skuBahan: string;
  namaBahan: string;
  qty: number;
  satuan: string;
  dari: string;
  ke: string;
  status: "Terkirim" | "Diterima";
};

export type Waste = {
  id: string;
  tanggal: string;
  skuBahan: string;
  namaBahan: string;
  qty: number;
  satuan: string;
  alasan: string;
};

export type Opname = {
  id: string;
  tanggal: string;
  skuBahan: string;
  namaBahan: string;
  sistem: number;
  fisik: number;
  selisih: number;
  alasan: string;
  status: "Draft" | "Disetujui";
};

export type AppUser = {
  id: string;
  nama: string;
  username: string;
  role: "admin" | "cabang" | "kasir";
  cabang: string;
};

export type Supplier = {
  id: string;
  nama: string;
  kontak: string;
  termin: string;
  utang: number;
};

export type Settings = {
  pajakPct: number;
  namaToko: string;
  alamatStruk: string;
  cetakOtomatis: boolean;
};

export type ShiftRec = {
  id: string;
  cabang: string;
  kasir: string;
  kasAwal: number;
  mulai: string;
  status: "buka" | "tutup";
  kasAkhir?: number;
  selisih?: number;
  selesai?: string;
  catatan?: string;
};

export type AuditRec = {
  id: string;
  waktu: string;
  aksi: string;
  detail: string;
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

const seedExpenses: Expense[] = [
  { id: "EX-001", tanggal: "2026-10-04", kategori: "Sewa", jumlah: 1500000, cabang: "Cabang 2 — Braga", catatan: "Sewa mingguan" },
  { id: "EX-002", tanggal: "2026-10-04", kategori: "Listrik", jumlah: 320000, cabang: "Cabang 2 — Braga", catatan: "Token listrik" },
  { id: "EX-003", tanggal: "2026-10-03", kategori: "Gas", jumlah: 280000, cabang: "Cabang 1 — Dago", catatan: "Tabung 12kg ×2" },
];

const seedSuppliers: Supplier[] = [
  { id: "S-01", nama: "PT Daging Segar", kontak: "0812-1001", termin: "NET 14", utang: 2500000 },
  { id: "S-02", nama: "Toko Kemas Jaya", kontak: "0812-1002", termin: "COD", utang: 0 },
];

const seedUsers: AppUser[] = [
  { id: "U-01", nama: "Administrator", username: "admin", role: "admin", cabang: "Semua Cabang" },
  { id: "U-02", nama: "Manajer Braga", username: "braga", role: "cabang", cabang: "Cabang 2 — Braga" },
  { id: "U-03", nama: "Kasir Dago", username: "kasir", role: "kasir", cabang: "Cabang 1 — Dago" },
];

const seedSettings: Settings = {
  pajakPct: 5,
  namaToko: "SignalPOS Kebab",
  alamatStruk: "Jl. Braga No. 12, Bandung",
  cetakOtomatis: true,
};

const seedShift: ShiftRec = {
  id: "SH-001", cabang: "Cabang 2 — Braga", kasir: "Andi", kasAwal: 500000, mulai: "09:00", status: "buka",
};

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
  expenses: Expense[];
  addExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;
  purchases: Purchase[];
  addPurchase: (p: Purchase) => void;
  deletePurchase: (id: string) => void;
  receivePurchase: (id: string) => void;
  transfers: Transfer[];
  addTransfer: (t: Transfer) => void;
  deleteTransfer: (id: string) => void;
  receiveTransfer: (id: string) => void;
  wastes: Waste[];
  addWaste: (w: Waste) => void;
  deleteWaste: (id: string) => void;
  opnames: Opname[];
  addOpname: (o: Opname) => void;
  deleteOpname: (id: string) => void;
  approveOpname: (id: string) => void;
  users: AppUser[];
  upsertUser: (u: AppUser) => void;
  deleteUser: (id: string) => void;
  suppliers: Supplier[];
  upsertSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
  settings: Settings;
  saveSettings: (s: Settings) => void;
  shift: ShiftRec;
  shiftHistory: ShiftRec[];
  openShift: (s: Omit<ShiftRec, "id" | "status">) => void;
  closeShift: (kasAkhir: number, catatan: string) => void;
  audit: AuditRec[];
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
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [opnames, setOpnames] = useState<Opname[]>([]);
  const [users, setUsers] = useState<AppUser[]>(seedUsers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers);
  const [settings, setSettings] = useState<Settings>(seedSettings);
  const [shift, setShift] = useState<ShiftRec>(seedShift);
  const [shiftHistory, setShiftHistory] = useState<ShiftRec[]>([]);
  const [audit, setAudit] = useState<AuditRec[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard: muat persisted state sekali setelah mount
    setBranches(load("signalpos:branches", seedBranches));
    setProducts(load("signalpos:products", seedProducts.map((p, i) => ({ ...p, stok: [42, 38, 51, 27, 19, 12, 22, 60, 120, 88, 200, 150][i] ?? 20 }))));
    setIngredients(load("signalpos:ingredients", seedIngredients));
    setSales(load("signalpos:sales", seedSales));
    setActiveBranchId(load("signalpos:branch", "c2"));
    setExpenses(load("signalpos:expenses", seedExpenses));
    setPurchases(load("signalpos:purchases", []));
    setTransfers(load("signalpos:transfers", []));
    setWastes(load("signalpos:wastes", []));
    setOpnames(load("signalpos:opnames", []));
    setUsers(load("signalpos:users", seedUsers));
    setSuppliers(load("signalpos:suppliers", seedSuppliers));
    setSettings(load("signalpos:settings", seedSettings));
    setShift(load("signalpos:shift", seedShift));
    setShiftHistory(load("signalpos:shiftHistory", []));
    setAudit(load("signalpos:audit", []));
    setReady(true);
  }, []);

  useEffect(() => { if (ready) save("signalpos:branches", branches); }, [branches, ready]);
  useEffect(() => { if (ready) save("signalpos:products", products); }, [products, ready]);
  useEffect(() => { if (ready) save("signalpos:ingredients", ingredients); }, [ingredients, ready]);
  useEffect(() => { if (ready) save("signalpos:sales", sales); }, [sales, ready]);
  useEffect(() => { if (ready) save("signalpos:branch", activeBranchId); }, [activeBranchId, ready]);
  useEffect(() => { if (ready) save("signalpos:expenses", expenses); }, [expenses, ready]);
  useEffect(() => { if (ready) save("signalpos:purchases", purchases); }, [purchases, ready]);
  useEffect(() => { if (ready) save("signalpos:transfers", transfers); }, [transfers, ready]);
  useEffect(() => { if (ready) save("signalpos:wastes", wastes); }, [wastes, ready]);
  useEffect(() => { if (ready) save("signalpos:opnames", opnames); }, [opnames, ready]);
  useEffect(() => { if (ready) save("signalpos:users", users); }, [users, ready]);
  useEffect(() => { if (ready) save("signalpos:suppliers", suppliers); }, [suppliers, ready]);
  useEffect(() => { if (ready) save("signalpos:settings", settings); }, [settings, ready]);
  useEffect(() => { if (ready) save("signalpos:shift", shift); }, [shift, ready]);
  useEffect(() => { if (ready) save("signalpos:shiftHistory", shiftHistory); }, [shiftHistory, ready]);
  useEffect(() => { if (ready) save("signalpos:audit", audit); }, [audit, ready]);

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

  const pushAudit = useCallback((aksi: string, detail: string) => {
    const d = new Date();
    const waktu = `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
    setAudit((prev) => [{ id: `A-${Date.now()}`, waktu, aksi, detail }, ...prev].slice(0, 200));
  }, []);

  const ubahStokBahan = useCallback((sku: string, delta: number) => {
    setIngredients((prev) => prev.map((b) => (b.sku === sku ? { ...b, stok: b.stok + delta } : b)));
  }, []);

  const addSale = useCallback((s: Sale) => {
    setSales((prev) => [s, ...prev]);
    pushAudit("Transaksi", `${s.id} • ${s.cabang} • ${rupiah(s.total)} • ${s.bayar}`);
  }, [pushAudit]);

  const resetAll = useCallback(() => {
    setBranches(seedBranches);
    setProducts(seedProducts.map((p, i) => ({ ...p, stok: [42, 38, 51, 27, 19, 12, 22, 60, 120, 88, 200, 150][i] ?? 20 })));
    setIngredients(seedIngredients);
    setSales(seedSales);
    setActiveBranchId("c2");
    setExpenses(seedExpenses);
    setPurchases([]);
    setTransfers([]);
    setWastes([]);
    setOpnames([]);
    setUsers(seedUsers);
    setSuppliers(seedSuppliers);
    setSettings(seedSettings);
    setShift(seedShift);
    setShiftHistory([]);
    setAudit([]);
  }, []);

  /* ---------- pengeluaran ---------- */
  const addExpense = useCallback((e: Expense) => {
    setExpenses((prev) => [e, ...prev]);
    pushAudit("Pengeluaran", `${e.kategori} • ${rupiah(e.jumlah)} • ${e.cabang}`);
  }, [pushAudit]);
  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
    pushAudit("Hapus pengeluaran", id);
  }, [pushAudit]);

  /* ---------- pembelian ---------- */
  const addPurchase = useCallback((p: Purchase) => {
    setPurchases((prev) => [p, ...prev]);
    pushAudit("Pembelian draft", `${p.supplier} • ${p.namaBahan} ×${p.qty}`);
  }, [pushAudit]);
  const deletePurchase = useCallback((id: string) => {
    setPurchases((prev) => prev.filter((x) => x.id !== id));
    pushAudit("Hapus pembelian", id);
  }, [pushAudit]);
  const receivePurchase = useCallback((id: string) => {
    setPurchases((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Diterima" as const } : x)));
    const p = purchases.find((x) => x.id === id);
    if (p && p.status !== "Diterima") {
      ubahStokBahan(p.skuBahan, p.qty);
      pushAudit("Terima pembelian", `${p.namaBahan} +${p.qty} ${p.satuan} • ${p.supplier}`);
    }
  }, [purchases, ubahStokBahan, pushAudit]);

  /* ---------- transfer ---------- */
  const addTransfer = useCallback((t: Transfer) => {
    setTransfers((prev) => [t, ...prev]);
    pushAudit("Transfer stok", `${t.namaBahan} ×${t.qty} • ${t.dari} → ${t.ke}`);
  }, [pushAudit]);
  const deleteTransfer = useCallback((id: string) => {
    setTransfers((prev) => prev.filter((x) => x.id !== id));
    pushAudit("Hapus transfer", id);
  }, [pushAudit]);
  const receiveTransfer = useCallback((id: string) => {
    setTransfers((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Diterima" as const } : x)));
    const t = transfers.find((x) => x.id === id);
    if (t && t.status !== "Diterima") pushAudit("Terima transfer", `${t.namaBahan} ×${t.qty} di ${t.ke}`);
  }, [transfers, pushAudit]);

  /* ---------- waste ---------- */
  const addWaste = useCallback((w: Waste) => {
    setWastes((prev) => [w, ...prev]);
    ubahStokBahan(w.skuBahan, -w.qty);
    pushAudit("Waste", `${w.namaBahan} -${w.qty} ${w.satuan} • ${w.alasan}`);
  }, [ubahStokBahan, pushAudit]);
  const deleteWaste = useCallback((id: string) => {
    const w = wastes.find((x) => x.id === id);
    setWastes((prev) => prev.filter((x) => x.id !== id));
    if (w) {
      ubahStokBahan(w.skuBahan, w.qty);
      pushAudit("Hapus waste", `${w.namaBahan} (stok dikembalikan)`);
    }
  }, [wastes, ubahStokBahan, pushAudit]);

  /* ---------- opname ---------- */
  const addOpname = useCallback((o: Opname) => {
    setOpnames((prev) => [o, ...prev]);
    pushAudit("Opname draft", `${o.namaBahan} • sistem ${o.sistem}, fisik ${o.fisik}`);
  }, [pushAudit]);
  const deleteOpname = useCallback((id: string) => {
    setOpnames((prev) => prev.filter((x) => x.id !== id));
    pushAudit("Hapus opname", id);
  }, [pushAudit]);
  const approveOpname = useCallback((id: string) => {
    setOpnames((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Disetujui" as const } : x)));
    const o = opnames.find((x) => x.id === id);
    if (o && o.status !== "Disetujui") {
      setIngredients((prev) => prev.map((b) => (b.sku === o.skuBahan ? { ...b, stok: o.fisik } : b)));
      pushAudit("Setujui opname", `${o.namaBahan} • stok diset ${o.fisik} (selisih ${o.selisih})`);
    }
  }, [opnames, pushAudit]);

  /* ---------- pengguna & supplier ---------- */
  const upsertUser = useCallback((u: AppUser) => {
    setUsers((prev) => {
      const ada = prev.some((x) => x.id === u.id);
      if (ada) return prev.map((x) => (x.id === u.id ? u : x));
      return [u, ...prev];
    });
    pushAudit("Simpan pengguna", `${u.nama} • ${u.role}`);
  }, [pushAudit]);
  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((x) => x.id !== id && x.username !== "admin"));
    pushAudit("Hapus pengguna", id);
  }, [pushAudit]);

  const upsertSupplier = useCallback((s: Supplier) => {
    setSuppliers((prev) => {
      const ada = prev.some((x) => x.id === s.id);
      if (ada) return prev.map((x) => (x.id === s.id ? s : x));
      return [s, ...prev];
    });
    pushAudit("Simpan supplier", s.nama);
  }, [pushAudit]);
  const deleteSupplier = useCallback((id: string) => {
    setSuppliers((prev) => prev.filter((x) => x.id !== id));
    pushAudit("Hapus supplier", id);
  }, [pushAudit]);

  /* ---------- pengaturan ---------- */
  const saveSettings = useCallback((s: Settings) => {
    setSettings(s);
    pushAudit("Ubah pengaturan", `Pajak ${s.pajakPct}% • ${s.namaToko}`);
  }, [pushAudit]);

  /* ---------- shift ---------- */
  const openShift = useCallback((s: Omit<ShiftRec, "id" | "status">) => {
    setShift({ ...s, id: `SH-${Date.now()}`, status: "buka" });
    pushAudit("Buka shift", `${s.cabang} • ${s.kasir} • kas awal ${rupiah(s.kasAwal)}`);
  }, [pushAudit]);
  const closeShift = useCallback((kasAkhir: number, catatan: string) => {
    const d = new Date();
    const selesai = `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
    setShift((prev) => {
      if (prev.status !== "buka") return prev;
      const tutup: ShiftRec = { ...prev, status: "tutup", kasAkhir, selisih: kasAkhir - prev.kasAwal, selesai, catatan };
      setShiftHistory((h) => [tutup, ...h]);
      return tutup;
    });
    pushAudit("Tutup shift", `${shift.cabang} • kas akhir ${rupiah(kasAkhir)}${catatan ? ` • ${catatan}` : ""}`);
  }, [shift, pushAudit]);

  const activeBranch = useMemo(
    () => branches.find((b) => b.id === activeBranchId) ?? branches[0],
    [branches, activeBranchId]
  );

  const val: DB = {
    branches, activeBranchId, setActiveBranchId, activeBranch,
    products, upsertProduct, deleteProduct, toggleProduct,
    ingredients, upsertIngredient, deleteIngredient,
    upsertBranch, toggleBranch, sales, addSale, resetAll,
    expenses, addExpense, deleteExpense,
    purchases, addPurchase, deletePurchase, receivePurchase,
    transfers, addTransfer, deleteTransfer, receiveTransfer,
    wastes, addWaste, deleteWaste,
    opnames, addOpname, deleteOpname, approveOpname,
    users, upsertUser, deleteUser,
    suppliers, upsertSupplier, deleteSupplier,
    settings, saveSettings,
    shift, shiftHistory, openShift, closeShift,
    audit,
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
