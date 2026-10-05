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
  tanggal: string;
  total: number;
  hpp: number;
  laba: number;
  bayar: string;
  status: "LUNAS" | "Pending" | "Refund";
};

export type SaleLine = {
  saleId: string;
  productId: string;
  nama: string;
  qty: number;
  harga: number;
};

/** Tanggal transaksi — fallback dari ID (TRX-YYYYMMDD-xxx) untuk data lama. */
export function tanggalOf(s: { id: string; tanggal?: string }): string {
  if (s.tanggal) return s.tanggal;
  const m = s.id.match(/TRX-(\d{4})(\d{2})(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return new Date().toISOString().slice(0, 10);
}

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
  strukHeader: string;
  strukFooter: string;
  tampilkanLogo: boolean;
  ukuranKertas: "58mm" | "80mm" | "A4";
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
  { id: "TRX-20261004-00192", cabang: "Cabang 2 — Braga", kasir: "Andi", jam: "19:42", tanggal: "2026-10-04", total: 55000, hpp: 28500, laba: 26500, bayar: "QRIS", status: "LUNAS" },
  { id: "TRX-20261004-00191", cabang: "Cabang 1 — Dago", kasir: "Sinta", jam: "19:35", tanggal: "2026-10-04", total: 43000, hpp: 21600, laba: 21400, bayar: "Tunai", status: "LUNAS" },
  { id: "TRX-20261004-00190", cabang: "Cabang 2 — Braga", kasir: "Andi", jam: "19:21", tanggal: "2026-10-04", total: 25000, hpp: 13250, laba: 11750, bayar: "QRIS", status: "LUNAS" },
  { id: "TRX-20261004-00189", cabang: "Cabang 3 — Cihampelas", kasir: "Budi", jam: "19:12", tanggal: "2026-10-04", total: 67000, hpp: 34800, laba: 32200, bayar: "E-wallet", status: "LUNAS" },
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
  strukHeader: "",
  strukFooter: "Terima kasih atas kunjungan Anda",
  tampilkanLogo: true,
  ukuranKertas: "80mm",
};

/** Gabungkan settings lama (parsial) dengan default agar field baru selalu ada. */
function mergeSettings(s: Partial<Settings>): Settings {
  return { ...seedSettings, ...s };
}

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

/* ---------- sinkron Supabase (best-effort, fallback lokal) ---------- */
function apiSend(method: string, path: string, body?: unknown) {
  try {
    fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).catch(() => { /* offline → tetap lokal */ });
  } catch { /* abaikan */ }
}

async function apiList<T>(path: string): Promise<T[] | null> {
  try {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return j.ok && Array.isArray(j.data) ? (j.data as T[]) : null;
  } catch {
    return null;
  }
}

async function apiObj<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return j.ok && j.data ? (j.data as T) : null;
  } catch {
    return null;
  }
}

async function supabaseAktif(): Promise<boolean> {
  try {
    const r = await fetch("/api/health", { cache: "no-store" });
    if (!r.ok) return false;
    const j = await r.json();
    return j.db === "supabase";
  } catch {
    return false;
  }
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
  addSale: (s: Sale, lines?: SaleLine[], apiItems?: { id: string; qty: number }[]) => void;
  saleLines: SaleLine[];
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
  const [saleLines, setSaleLines] = useState<SaleLine[]>([]);
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
    setSales(load<Sale[]>("signalpos:sales", seedSales).map((s) => ({ ...s, tanggal: tanggalOf(s) })));
    setSaleLines(load("signalpos:saleLines", []));
    setActiveBranchId(load("signalpos:branch", "c2"));
    setExpenses(load("signalpos:expenses", seedExpenses));
    setPurchases(load("signalpos:purchases", []));
    setTransfers(load("signalpos:transfers", []));
    setWastes(load("signalpos:wastes", []));
    setOpnames(load("signalpos:opnames", []));
    setUsers(load("signalpos:users", seedUsers));
    setSuppliers(load("signalpos:suppliers", seedSuppliers));
    setSettings(mergeSettings(load("signalpos:settings", seedSettings)));
    setShift(load("signalpos:shift", seedShift));
    setShiftHistory(load("signalpos:shiftHistory", []));
    setAudit(load("signalpos:audit", []));
    setReady(true);
  }, []);

  // Sinkron dari Supabase bila backend configured (health=db supabase).
  // Gagal/offline → tetap pakai localStorage. Tidak menimpa bila server kosong & lokal ada isi.
  useEffect(() => {
    let hidup = true;
    (async () => {
      if (!(await supabaseAktif())) return;
      const [p, br, sl, ing, ex, sup, po, tr, w, op, au, sh, set, aud, lines] = await Promise.all([
        apiList<Product>("/api/products"),
        apiList<Branch>("/api/branches"),
        apiList<Sale>("/api/sales"),
        apiList<Ingredient>("/api/ingredients"),
        apiList<Expense>("/api/expenses"),
        apiList<Supplier>("/api/suppliers"),
        apiList<Purchase>("/api/purchases"),
        apiList<Transfer>("/api/transfers"),
        apiList<Waste>("/api/wastes"),
        apiList<Opname>("/api/opnames"),
        apiList<AppUser>("/api/app-users"),
        apiList<ShiftRec>("/api/shifts"),
        apiObj<Settings>("/api/settings"),
        apiList<AuditRec>("/api/audit"),
        apiList<SaleLine>("/api/sale-items"),
      ]);
      if (!hidup) return;
      const pakai = <T,>(srv: T[] | null) => (prev: T[]): T[] => (srv === null ? prev : srv.length > 0 || prev.length === 0 ? srv : prev);
      if (p) setProducts(pakai(p));
      if (br) setBranches(pakai(br));
      if (sl) setSales(pakai(sl.map((s) => ({ ...s, tanggal: tanggalOf(s) }))));
      if (ing) setIngredients(pakai(ing));
      if (ex) setExpenses(pakai(ex));
      if (sup) setSuppliers(pakai(sup));
      if (po) setPurchases(pakai(po));
      if (tr) setTransfers(pakai(tr));
      if (w) setWastes(pakai(w));
      if (op) setOpnames(pakai(op));
      if (au) setUsers(pakai(au));
      if (set) setSettings((prev) => mergeSettings({ ...prev, ...set }));
      if (sh) {
        const buka = sh.find((s) => s.status === "buka");
        setShift((prev) => buka ?? sh[0] ?? prev);
        setShiftHistory(sh.filter((s) => s.status !== "buka"));
      }
      if (aud) setAudit(aud);
      if (lines) setSaleLines(lines);
    })();
    return () => { hidup = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (ready) save("signalpos:branches", branches); }, [branches, ready]);
  useEffect(() => { if (ready) save("signalpos:products", products); }, [products, ready]);
  useEffect(() => { if (ready) save("signalpos:ingredients", ingredients); }, [ingredients, ready]);
  useEffect(() => { if (ready) save("signalpos:sales", sales); }, [sales, ready]);
  useEffect(() => { if (ready) save("signalpos:saleLines", saleLines); }, [saleLines, ready]);
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
    const ada = products.some((x) => x.id === p.id);
    setProducts((prev) => {
      if (ada) return prev.map((x) => (x.id === p.id ? p : x));
      return [p, ...prev];
    });
    if (ada) apiSend("PUT", `/api/products/${encodeURIComponent(p.id)}`, p);
    else apiSend("POST", "/api/products", p);
  }, [products]);
  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((x) => x.id !== id));
    apiSend("DELETE", `/api/products/${encodeURIComponent(id)}`);
  }, []);
  const toggleProduct = useCallback((id: string) => {
    const cur = products.find((x) => x.id === id);
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, status: x.status === "Aktif" ? "Nonaktif" : "Aktif" } : x)));
    if (cur) apiSend("PUT", `/api/products/${encodeURIComponent(id)}`, { status: cur.status === "Aktif" ? "Nonaktif" : "Aktif" });
  }, [products]);

  const upsertIngredient = useCallback((b: Ingredient) => {
    const ada = ingredients.some((x) => x.sku === b.sku);
    setIngredients((prev) => {
      if (ada) return prev.map((x) => (x.sku === b.sku ? b : x));
      return [b, ...prev];
    });
    if (ada) apiSend("PUT", `/api/ingredients/${encodeURIComponent(b.sku)}`, b);
    else apiSend("POST", "/api/ingredients", b);
  }, [ingredients]);
  const deleteIngredient = useCallback((sku: string) => {
    setIngredients((prev) => prev.filter((x) => x.sku !== sku));
    apiSend("DELETE", `/api/ingredients/${encodeURIComponent(sku)}`);
  }, []);

  const upsertBranch = useCallback((b: Branch) => {
    const ada = branches.some((x) => x.id === b.id);
    setBranches((prev) => {
      if (ada) return prev.map((x) => (x.id === b.id ? b : x));
      return [...prev, b];
    });
    if (b.id !== "semua") {
      if (ada) apiSend("PUT", `/api/branches/${encodeURIComponent(b.id)}`, b);
      else apiSend("POST", "/api/branches", b);
    }
  }, [branches]);
  const toggleBranch = useCallback((id: string) => {
    const cur = branches.find((x) => x.id === id);
    setBranches((prev) => prev.map((x) => (x.id === id ? { ...x, status: x.status === "Buka" ? "Tutup" : "Buka" } : x)));
    if (cur && id !== "semua") apiSend("PUT", `/api/branches/${encodeURIComponent(id)}`, { status: cur.status === "Buka" ? "Tutup" : "Buka" });
  }, [branches]);

  const pushAudit = useCallback((aksi: string, detail: string) => {
    const d = new Date();
    const rec: AuditRec = { id: `A-${Date.now()}`, waktu: `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`, aksi, detail };
    setAudit((prev) => [rec, ...prev].slice(0, 200));
    apiSend("POST", "/api/audit", rec);
  }, []);

  const ubahStokBahan = useCallback((sku: string, delta: number) => {
    setIngredients((prev) => prev.map((b) => (b.sku === sku ? { ...b, stok: b.stok + delta } : b)));
  }, []);

  const syncStokBahan = useCallback((sku: string, stokBaru: number) => {
    apiSend("PUT", `/api/ingredients/${encodeURIComponent(sku)}`, { stok: stokBaru });
  }, []);

  const stokSetelah = useCallback((sku: string, delta: number): number => {
    const b = ingredients.find((x) => x.sku === sku);
    return (b?.stok ?? 0) + delta;
  }, [ingredients]);

  const addSale = useCallback((s: Sale, lines: SaleLine[] = [], apiItems: { id: string; qty: number }[] = []) => {
    const lengkap: Sale = { ...s, tanggal: tanggalOf(s) };
    setSales((prev) => [lengkap, ...prev]);
    if (lines.length > 0) setSaleLines((prev) => [...lines, ...prev]);
    pushAudit("Transaksi", `${s.id} • ${s.cabang} • ${rupiah(s.total)} • ${s.bayar}`);
    apiSend("POST", "/api/sales", { cabang: s.cabang, kasir: s.kasir, bayar: s.bayar, items: apiItems });
  }, [pushAudit]);

  const resetAll = useCallback(() => {
    setBranches(seedBranches);
    setProducts(seedProducts.map((p, i) => ({ ...p, stok: [42, 38, 51, 27, 19, 12, 22, 60, 120, 88, 200, 150][i] ?? 20 })));
    setIngredients(seedIngredients);
    setSales(seedSales);
    setSaleLines([]);
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
    apiSend("POST", "/api/expenses", e);
  }, [pushAudit]);
  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
    pushAudit("Hapus pengeluaran", id);
    apiSend("DELETE", `/api/expenses/${encodeURIComponent(id)}`);
  }, [pushAudit]);

  /* ---------- pembelian ---------- */
  const addPurchase = useCallback((p: Purchase) => {
    setPurchases((prev) => [p, ...prev]);
    pushAudit("Pembelian draft", `${p.supplier} • ${p.namaBahan} ×${p.qty}`);
    apiSend("POST", "/api/purchases", p);
  }, [pushAudit]);
  const deletePurchase = useCallback((id: string) => {
    setPurchases((prev) => prev.filter((x) => x.id !== id));
    pushAudit("Hapus pembelian", id);
    apiSend("DELETE", `/api/purchases/${encodeURIComponent(id)}`);
  }, [pushAudit]);
  const receivePurchase = useCallback((id: string) => {
    const p = purchases.find((x) => x.id === id);
    setPurchases((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Diterima" as const } : x)));
    if (p && p.status !== "Diterima") {
      ubahStokBahan(p.skuBahan, p.qty);
      syncStokBahan(p.skuBahan, stokSetelah(p.skuBahan, p.qty));
      pushAudit("Terima pembelian", `${p.namaBahan} +${p.qty} ${p.satuan} • ${p.supplier}`);
      apiSend("PATCH", `/api/purchases/${encodeURIComponent(id)}`, { status: "Diterima" });
    }
  }, [purchases, ubahStokBahan, syncStokBahan, stokSetelah, pushAudit]);

  /* ---------- transfer ---------- */
  const addTransfer = useCallback((t: Transfer) => {
    setTransfers((prev) => [t, ...prev]);
    pushAudit("Transfer stok", `${t.namaBahan} ×${t.qty} • ${t.dari} → ${t.ke}`);
    apiSend("POST", "/api/transfers", t);
  }, [pushAudit]);
  const deleteTransfer = useCallback((id: string) => {
    setTransfers((prev) => prev.filter((x) => x.id !== id));
    pushAudit("Hapus transfer", id);
    apiSend("DELETE", `/api/transfers/${encodeURIComponent(id)}`);
  }, [pushAudit]);
  const receiveTransfer = useCallback((id: string) => {
    const t = transfers.find((x) => x.id === id);
    setTransfers((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Diterima" as const } : x)));
    if (t && t.status !== "Diterima") {
      pushAudit("Terima transfer", `${t.namaBahan} ×${t.qty} di ${t.ke}`);
      apiSend("PATCH", `/api/transfers/${encodeURIComponent(id)}`, { status: "Diterima" });
    }
  }, [transfers, pushAudit]);

  /* ---------- waste ---------- */
  const addWaste = useCallback((w: Waste) => {
    setWastes((prev) => [w, ...prev]);
    ubahStokBahan(w.skuBahan, -w.qty);
    syncStokBahan(w.skuBahan, stokSetelah(w.skuBahan, -w.qty));
    pushAudit("Waste", `${w.namaBahan} -${w.qty} ${w.satuan} • ${w.alasan}`);
    apiSend("POST", "/api/wastes", w);
  }, [ubahStokBahan, syncStokBahan, stokSetelah, pushAudit]);
  const deleteWaste = useCallback((id: string) => {
    const w = wastes.find((x) => x.id === id);
    setWastes((prev) => prev.filter((x) => x.id !== id));
    if (w) {
      ubahStokBahan(w.skuBahan, w.qty);
      syncStokBahan(w.skuBahan, stokSetelah(w.skuBahan, w.qty));
      pushAudit("Hapus waste", `${w.namaBahan} (stok dikembalikan)`);
    }
    apiSend("DELETE", `/api/wastes/${encodeURIComponent(id)}`);
  }, [wastes, ubahStokBahan, syncStokBahan, stokSetelah, pushAudit]);

  /* ---------- opname ---------- */
  const addOpname = useCallback((o: Opname) => {
    setOpnames((prev) => [o, ...prev]);
    pushAudit("Opname draft", `${o.namaBahan} • sistem ${o.sistem}, fisik ${o.fisik}`);
    apiSend("POST", "/api/opnames", o);
  }, [pushAudit]);
  const deleteOpname = useCallback((id: string) => {
    setOpnames((prev) => prev.filter((x) => x.id !== id));
    pushAudit("Hapus opname", id);
    apiSend("DELETE", `/api/opnames/${encodeURIComponent(id)}`);
  }, [pushAudit]);
  const approveOpname = useCallback((id: string) => {
    const o = opnames.find((x) => x.id === id);
    setOpnames((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Disetujui" as const } : x)));
    if (o && o.status !== "Disetujui") {
      setIngredients((prev) => prev.map((b) => (b.sku === o.skuBahan ? { ...b, stok: o.fisik } : b)));
      syncStokBahan(o.skuBahan, o.fisik);
      pushAudit("Setujui opname", `${o.namaBahan} • stok diset ${o.fisik} (selisih ${o.selisih})`);
      apiSend("PATCH", `/api/opnames/${encodeURIComponent(id)}`, { status: "Disetujui" });
    }
  }, [opnames, syncStokBahan, pushAudit]);

  /* ---------- pengguna & supplier ---------- */
  const upsertUser = useCallback((u: AppUser) => {
    const ada = users.some((x) => x.id === u.id);
    setUsers((prev) => {
      if (ada) return prev.map((x) => (x.id === u.id ? u : x));
      return [u, ...prev];
    });
    pushAudit("Simpan pengguna", `${u.nama} • ${u.role}`);
    if (ada) apiSend("PATCH", `/api/app-users/${encodeURIComponent(u.id)}`, u);
    else apiSend("POST", "/api/app-users", u);
  }, [users, pushAudit]);
  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((x) => x.id !== id && x.username !== "admin"));
    pushAudit("Hapus pengguna", id);
    apiSend("DELETE", `/api/app-users/${encodeURIComponent(id)}`);
  }, [pushAudit]);

  const upsertSupplier = useCallback((s: Supplier) => {
    const ada = suppliers.some((x) => x.id === s.id);
    setSuppliers((prev) => {
      if (ada) return prev.map((x) => (x.id === s.id ? s : x));
      return [s, ...prev];
    });
    pushAudit("Simpan supplier", s.nama);
    if (ada) apiSend("PATCH", `/api/suppliers/${encodeURIComponent(s.id)}`, s);
    else apiSend("POST", "/api/suppliers", s);
  }, [suppliers, pushAudit]);
  const deleteSupplier = useCallback((id: string) => {
    setSuppliers((prev) => prev.filter((x) => x.id !== id));
    pushAudit("Hapus supplier", id);
    apiSend("DELETE", `/api/suppliers/${encodeURIComponent(id)}`);
  }, [pushAudit]);

  /* ---------- pengaturan ---------- */
  const saveSettings = useCallback((s: Settings) => {
    setSettings(s);
    pushAudit("Ubah pengaturan", `Pajak ${s.pajakPct}% • ${s.namaToko}`);
    apiSend("PUT", "/api/settings", s);
  }, [pushAudit]);

  /* ---------- shift ---------- */
  const openShift = useCallback((s: Omit<ShiftRec, "id" | "status">) => {
    const rec: ShiftRec = { ...s, id: `SH-${Date.now()}`, status: "buka" };
    setShift(rec);
    pushAudit("Buka shift", `${s.cabang} • ${s.kasir} • kas awal ${rupiah(s.kasAwal)}`);
    apiSend("POST", "/api/shifts", rec);
  }, [pushAudit]);
  const closeShift = useCallback((kasAkhir: number, catatan: string) => {
    const d = new Date();
    const selesai = `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
    const cur = shift;
    setShift((prev) => {
      if (prev.status !== "buka") return prev;
      const tutup: ShiftRec = { ...prev, status: "tutup", kasAkhir, selisih: kasAkhir - prev.kasAwal, selesai, catatan };
      setShiftHistory((h) => [tutup, ...h]);
      return tutup;
    });
    pushAudit("Tutup shift", `${cur.cabang} • kas akhir ${rupiah(kasAkhir)}${catatan ? ` • ${catatan}` : ""}`);
    if (cur.status === "buka") {
      apiSend("PATCH", `/api/shifts/${encodeURIComponent(cur.id)}`, { status: "tutup", kasAkhir, selisih: kasAkhir - cur.kasAwal, selesai, catatan });
    }
  }, [shift, pushAudit]);

  const activeBranch = useMemo(
    () => branches.find((b) => b.id === activeBranchId) ?? branches[0],
    [branches, activeBranchId]
  );

  const val: DB = {
    branches, activeBranchId, setActiveBranchId, activeBranch,
    products, upsertProduct, deleteProduct, toggleProduct,
    ingredients, upsertIngredient, deleteIngredient,
    upsertBranch, toggleBranch, sales, addSale, saleLines, resetAll,
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
