// Satu-satunya tempat switch memory vs Supabase.
// - Tanpa SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY → in-memory (demo; hilang saat restart).
// - Dengan keduanya → PostgREST Supabase (lihat src/lib/supabase.ts).
// Skema tabel: db/schema.sql (jalankan sekali di Supabase SQL Editor).

import { products as seedProducts, ingredients as seedIngredients } from "@/data/mock";
import { sbDelete, sbInsert, sbList, sbUpdate, supaConfigured } from "./supabase";

export type ProductRow = {
  id: string;
  nama: string;
  sku: string;
  kategori: string;
  harga: number;
  hpp: number;
  status: "Aktif" | "Nonaktif";
  stok?: number;
};

export type BranchRow = {
  id: string;
  nama: string;
  alamat: string;
  warna: string;
  status: "Buka" | "Tutup";
  transaksiHariIni: number;
  omzetHariIni: number;
  kas: number;
};

export type SaleRow = {
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

export type IngredientRow = {
  nama: string;
  sku: string;
  satuan: string;
  stok: number;
  minimum: number;
  hargaRata: number;
  cabang: string;
};

export function dbMode(): "supabase" | "memory" {
  return supaConfigured() ? "supabase" : "memory";
}

export function taxPct(): number {
  const v = Number(process.env.TAX_PCT ?? process.env.NEXT_PUBLIC_TAX_PCT ?? 5);
  return Number.isFinite(v) && v >= 0 ? v : 5;
}

// ---------- seed memory ----------
const seedBranches: BranchRow[] = [
  { id: "semua", nama: "Semua Cabang", alamat: "Agregat 4 outlet", warna: "#0F172A", status: "Buka", transaksiHariIni: 348, omzetHariIni: 12450000, kas: 8450000 },
  { id: "c1", nama: "Cabang 1 — Dago", alamat: "Jl. Ir. H. Juanda No. 88", warna: "#2563EB", status: "Buka", transaksiHariIni: 96, omzetHariIni: 3420000, kas: 2150000 },
  { id: "c2", nama: "Cabang 2 — Braga", alamat: "Jl. Braga No. 12", warna: "#0284C7", status: "Buka", transaksiHariIni: 128, omzetHariIni: 4860000, kas: 3240000 },
  { id: "c3", nama: "Cabang 3 — Cihampelas", alamat: "Jl. Cihampelas No. 45", warna: "#4F46E5", status: "Buka", transaksiHariIni: 74, omzetHariIni: 2610000, kas: 1780000 },
  { id: "c4", nama: "Cabang 4 — Buah Batu", alamat: "Jl. Buah Batu No. 203", warna: "#64748B", status: "Tutup", transaksiHariIni: 0, omzetHariIni: 0, kas: 1280000 },
];

type Mem = {
  products: ProductRow[];
  branches: BranchRow[];
  sales: SaleRow[];
  ingredients: IngredientRow[];
  expenses: ExpenseRow[];
  suppliers: SupplierRow[];
  purchases: PurchaseRow[];
  transfers: TransferRow[];
  wastes: WasteRow[];
  opnames: OpnameRow[];
  appUsers: AppUserRow[];
  settings: SettingsRow | null;
  shifts: ShiftRow[];
  audit: AuditRow[];
};

// Singleton per proses (dev: HMR-safe via globalThis).
const g = globalThis as unknown as { __signalposMem?: Mem };
if (!g.__signalposMem) {
  g.__signalposMem = {
    products: seedProducts.map((p, i) => ({
      ...p,
      stok: [42, 38, 51, 27, 19, 12, 22, 60, 120, 88, 200, 150][i] ?? 20,
    })),
    branches: seedBranches,
    sales: [
      { id: "TRX-20261004-00192", cabang: "Cabang 2 — Braga", kasir: "Andi", jam: "19:42", tanggal: "2026-10-04", total: 55000, hpp: 28500, laba: 26500, bayar: "QRIS", status: "LUNAS" },
      { id: "TRX-20261004-00191", cabang: "Cabang 1 — Dago", kasir: "Sinta", jam: "19:35", tanggal: "2026-10-04", total: 43000, hpp: 21600, laba: 21400, bayar: "Tunai", status: "LUNAS" },
      { id: "TRX-20261004-00190", cabang: "Cabang 2 — Braga", kasir: "Andi", jam: "19:21", tanggal: "2026-10-04", total: 25000, hpp: 13250, laba: 11750, bayar: "QRIS", status: "LUNAS" },
      { id: "TRX-20261004-00189", cabang: "Cabang 3 — Cihampelas", kasir: "Budi", jam: "19:12", tanggal: "2026-10-04", total: 67000, hpp: 34800, laba: 32200, bayar: "E-wallet", status: "LUNAS" },
    ],
    ingredients: [...seedIngredients],
    expenses: [],
    suppliers: [],
    purchases: [],
    transfers: [],
    wastes: [],
    opnames: [],
    appUsers: [],
    settings: null,
    shifts: [],
    audit: [],
  };
}
const mem: Mem = g.__signalposMem;

// ---------- mapper Supabase (snake_case) → Row ----------
type SBProduct = { id: string; nama: string; sku: string; kategori: string; harga: number; hpp: number; status: "Aktif" | "Nonaktif"; stok: number };
type SBBranch = { id: string; nama: string; alamat: string; warna: string; status: "Buka" | "Tutup"; kas: number };
type SBSale = { id: string; cabang_nama: string; kasir: string; total: number; hpp: number; laba: number; bayar: string; status: SaleRow["status"]; created_at: string };
type SBIngredient = { id: string; nama: string; sku: string; satuan: string; stok: number; minimum: number; harga_rata: number; cabang_id: string | null };

function jamDari(createdAt: string): string {
  const d = new Date(createdAt);
  return Number.isNaN(d.getTime()) ? "--:--" : d.toTimeString().slice(0, 5);
}

function like(v: string): string {
  return encodeURIComponent(`*${v}*`);
}

// ---------- products ----------
export async function listProducts(filter?: { q?: string; kategori?: string; status?: string }): Promise<ProductRow[]> {
  if (!supaConfigured()) {
    const q = (filter?.q ?? "").toLowerCase();
    return mem.products.filter(
      (p) =>
        (!q || (p.nama + p.sku).toLowerCase().includes(q)) &&
        (!filter?.kategori || filter.kategori === "Semua" || p.kategori === filter.kategori) &&
        (!filter?.status || p.status === filter.status)
    );
  }
  const and: string[] = [];
  if (filter?.q) and.push(`or=(nama.ilike.${like(filter.q)},sku.ilike.${like(filter.q)})`);
  if (filter?.kategori && filter.kategori !== "Semua") and.push(`kategori=eq.${encodeURIComponent(filter.kategori)}`);
  if (filter?.status) and.push(`status=eq.${encodeURIComponent(filter.status)}`);
  const q = `select=*&order=nama${and.length > 0 ? `&and=(${and.join(",")})` : ""}`;
  return sbList<SBProduct>("products", q);
}

export async function getProduct(id: string): Promise<ProductRow | undefined> {
  if (!supaConfigured()) return mem.products.find((p) => p.id === id);
  const rows = await sbList<SBProduct>("products", `select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0];
}

export async function createProduct(input: Omit<ProductRow, "id"> & { id?: string }): Promise<ProductRow> {
  const row = { ...input, id: input.id || `p${Date.now()}` };
  if (!supaConfigured()) {
    mem.products.unshift(row);
    return row;
  }
  const rows = await sbInsert<SBProduct>("products", [{ ...row, stok: row.stok ?? 0 }]);
  return rows[0];
}

export async function updateProduct(id: string, patch: Partial<ProductRow>): Promise<ProductRow | undefined> {
  if (!supaConfigured()) {
    const i = mem.products.findIndex((p) => p.id === id);
    if (i < 0) return undefined;
    mem.products[i] = { ...mem.products[i], ...patch, id };
    return mem.products[i];
  }
  const rest: Partial<ProductRow> = { ...patch };
  delete rest.id;
  const rows = await sbUpdate<SBProduct>("products", `id=eq.${encodeURIComponent(id)}`, rest);
  return rows[0];
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!supaConfigured()) {
    const n = mem.products.length;
    mem.products = mem.products.filter((p) => p.id !== id);
    return mem.products.length < n;
  }
  await sbDelete("products", `id=eq.${encodeURIComponent(id)}`);
  return true;
}

// ---------- branches ----------
export async function listBranches(): Promise<BranchRow[]> {
  if (!supaConfigured()) return mem.branches;
  const rows = await sbList<SBBranch>("branches", "select=*&order=nama");
  const mapped: BranchRow[] = rows.map((b) => ({
    id: b.id,
    nama: b.nama,
    alamat: b.alamat ?? "",
    warna: b.warna ?? "#2563EB",
    status: b.status,
    transaksiHariIni: 0,
    omzetHariIni: 0,
    kas: Number(b.kas) || 0,
  }));
  // Baris agregat "semua": omzet & transaksi hari ini dari penjualan hari ini.
  let omzet = 0;
  let trx = 0;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const sales = await sbList<{ total: number }>("sales", `select=total&created_at=gte.${today}T00:00:00`);
    trx = sales.length;
    omzet = sales.reduce((s, r) => s + (Number(r.total) || 0), 0);
  } catch {
    /* agregat opsional */
  }
  const kas = mapped.reduce((s, b) => s + b.kas, 0);
  return [
    { id: "semua", nama: "Semua Cabang", alamat: `Agregat ${mapped.length} outlet`, warna: "#0F172A", status: "Buka", transaksiHariIni: trx, omzetHariIni: omzet, kas },
    ...mapped,
  ];
}

export async function getBranch(id: string): Promise<BranchRow | undefined> {
  const all = await listBranches();
  return all.find((b) => b.id === id);
}

export async function createBranch(input: Omit<BranchRow, "id"> & { id?: string }): Promise<BranchRow> {
  const row: BranchRow = { ...input, id: input.id || `c${Date.now()}` };
  if (!supaConfigured()) {
    mem.branches.push(row);
    return row;
  }
  const rows = await sbInsert<SBBranch>("branches", [
    { id: row.id, nama: row.nama, alamat: row.alamat, warna: row.warna, status: row.status, kas: row.kas },
  ]);
  const b = rows[0];
  return { ...row, nama: b.nama, alamat: b.alamat ?? "", warna: b.warna ?? row.warna, status: b.status, kas: Number(b.kas) || 0 };
}

export async function updateBranch(id: string, patch: Partial<BranchRow>): Promise<BranchRow | undefined> {
  if (!supaConfigured()) {
    const i = mem.branches.findIndex((b) => b.id === id);
    if (i < 0) return undefined;
    mem.branches[i] = { ...mem.branches[i], ...patch, id };
    return mem.branches[i];
  }
  if (id === "semua") return undefined;
  const rest: Partial<BranchRow> = { ...patch };
  delete rest.id;
  delete rest.transaksiHariIni;
  delete rest.omzetHariIni;
  const rows = await sbUpdate<SBBranch>("branches", `id=eq.${encodeURIComponent(id)}`, rest);
  const b = rows[0];
  if (!b) return undefined;
  return { id: b.id, nama: b.nama, alamat: b.alamat ?? "", warna: b.warna ?? "#2563EB", status: b.status, transaksiHariIni: 0, omzetHariIni: 0, kas: Number(b.kas) || 0 };
}

export async function deleteBranch(id: string): Promise<boolean> {
  if (id === "semua") return false;
  if (!supaConfigured()) {
    const n = mem.branches.length;
    mem.branches = mem.branches.filter((b) => b.id !== id);
    return mem.branches.length < n;
  }
  await sbDelete("branches", `id=eq.${encodeURIComponent(id)}`);
  return true;
}

// ---------- sales ----------
export async function listSales(filter?: { cabang?: string; status?: string; q?: string }): Promise<SaleRow[]> {
  if (!supaConfigured()) {
    const q = (filter?.q ?? "").toLowerCase();
    return mem.sales.filter(
      (s) =>
        (!filter?.cabang || filter.cabang === "semua" || s.cabang === filter.cabang) &&
        (!filter?.status || filter.status === "Semua" || s.status === filter.status) &&
        (!q || (s.id + s.kasir + s.bayar).toLowerCase().includes(q))
    );
  }
  const and: string[] = [];
  if (filter?.cabang && filter.cabang !== "semua") and.push(`cabang_nama=eq.${encodeURIComponent(filter.cabang)}`);
  if (filter?.status && filter.status !== "Semua") and.push(`status=eq.${encodeURIComponent(filter.status)}`);
  if (filter?.q) and.push(`or=(id.ilike.${like(filter.q)},kasir.ilike.${like(filter.q)},bayar.ilike.${like(filter.q)})`);
  const q = `select=*&order=created_at.desc&limit=200${and.length > 0 ? `&and=(${and.join(",")})` : ""}`;
  const rows = await sbList<SBSale>("sales", q);
  return rows.map((s) => ({
    id: s.id,
    cabang: s.cabang_nama,
    kasir: s.kasir,
    jam: jamDari(s.created_at),
    tanggal: String(s.created_at ?? "").slice(0, 10),
    total: Number(s.total) || 0,
    hpp: Number(s.hpp) || 0,
    laba: Number(s.laba) || 0,
    bayar: s.bayar,
    status: s.status,
  }));
}

export async function createSale(input: {
  cabang: string;
  kasir: string;
  bayar: string;
  items: { id: string; qty: number }[];
}): Promise<SaleRow | { error: string }> {
  if (!input.items || input.items.length === 0) return { error: "Keranjang kosong." };
  let subtotal = 0;
  let hpp = 0;
  const lines: { id: string; nama: string; qty: number; harga: number }[] = [];
  for (const it of input.items) {
    const p = await getProduct(it.id);
    if (!p) return { error: `Produk tidak ditemukan: ${it.id}` };
    if (p.status !== "Aktif") return { error: `Produk nonaktif: ${p.nama}` };
    const qty = Math.max(1, Math.floor(it.qty));
    subtotal += p.harga * qty;
    hpp += p.hpp * qty;
    lines.push({ id: p.id, nama: p.nama, qty, harga: p.harga });
  }
  const total = Math.round(subtotal * (1 + taxPct() / 100));
  const d = new Date();
  const id = `TRX-${d.toISOString().slice(0, 10).replaceAll("-", "")}-${String(Math.floor(100 + Math.random() * 900))}`;
  const row: SaleRow = {
    id,
    cabang: input.cabang,
    kasir: input.kasir,
    jam: d.toTimeString().slice(0, 5),
    tanggal: d.toISOString().slice(0, 10),
    total,
    hpp,
    laba: total - hpp,
    bayar: input.bayar,
    status: "LUNAS",
  };
  if (!supaConfigured()) {
    mem.sales.unshift(row);
    return row;
  }
  await sbInsert("sales", [
    { id, cabang_nama: input.cabang, kasir: input.kasir, total, hpp, laba: total - hpp, bayar: input.bayar, status: "LUNAS" },
  ]);
  try {
    await sbInsert("sale_items", lines.map((l) => ({ sale_id: id, product_id: l.id, nama: l.nama, qty: l.qty, harga: l.harga })));
  } catch {
    /* item detail opsional */
  }
  return row;
}

// ---------- ingredients ----------
async function branchIdToNama(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const rows = await sbList<SBBranch>("branches", "select=id,nama");
    rows.forEach((b) => map.set(b.id, b.nama));
  } catch {
    /* abaikan */
  }
  return map;
}

export async function listIngredients(q?: string): Promise<IngredientRow[]> {
  if (!supaConfigured()) {
    const s = (q ?? "").toLowerCase();
    if (!s) return mem.ingredients;
    return mem.ingredients.filter((b) => (b.nama + b.sku).toLowerCase().includes(s));
  }
  const names = await branchIdToNama();
  const query = `select=*&order=nama${q ? `&or=(nama.ilike.${like(q)},sku.ilike.${like(q)})` : ""}`;
  const rows = await sbList<SBIngredient>("ingredients", query);
  return rows.map((b) => ({
    nama: b.nama,
    sku: b.sku,
    satuan: b.satuan,
    stok: Number(b.stok) || 0,
    minimum: Number(b.minimum) || 0,
    hargaRata: Number(b.harga_rata) || 0,
    cabang: (b.cabang_id && names.get(b.cabang_id)) || "—",
  }));
}

export async function createIngredient(input: IngredientRow): Promise<IngredientRow | { error: string }> {
  if (!supaConfigured()) {
    if (mem.ingredients.some((b) => b.sku === input.sku)) return { error: "SKU sudah dipakai." };
    mem.ingredients.unshift(input);
    return input;
  }
  // Petakan nama cabang → id bila cocok.
  let cabangId: string | null = null;
  try {
    const rows = await sbList<SBBranch>("branches", "select=id,nama");
    cabangId = rows.find((b) => b.nama === input.cabang)?.id ?? null;
  } catch {
    /* abaikan */
  }
  const rows = await sbInsert<SBIngredient>("ingredients", [
    {
      id: `b${Date.now()}`,
      nama: input.nama,
      sku: input.sku,
      satuan: input.satuan,
      stok: input.stok,
      minimum: input.minimum,
      harga_rata: input.hargaRata,
      cabang_id: cabangId,
    },
  ]);
  const b = rows[0];
  return { nama: b.nama, sku: b.sku, satuan: b.satuan, stok: Number(b.stok) || 0, minimum: Number(b.minimum) || 0, hargaRata: Number(b.harga_rata) || 0, cabang: input.cabang };
}

export async function updateIngredient(sku: string, patch: Partial<{ stok: number; minimum: number; hargaRata: number; nama: string; satuan: string }>): Promise<IngredientRow | undefined> {
  if (!supaConfigured()) {
    const i = mem.ingredients.findIndex((x) => x.sku === sku);
    if (i < 0) return undefined;
    mem.ingredients[i] = { ...mem.ingredients[i], ...patch };
    return mem.ingredients[i];
  }
  const body: Record<string, unknown> = {};
  if (patch.stok !== undefined) body.stok = patch.stok;
  if (patch.minimum !== undefined) body.minimum = patch.minimum;
  if (patch.hargaRata !== undefined) body.harga_rata = patch.hargaRata;
  if (patch.nama !== undefined) body.nama = patch.nama;
  if (patch.satuan !== undefined) body.satuan = patch.satuan;
  const rows = await sbUpdate<SBIngredient>("ingredients", `sku=eq.${encodeURIComponent(sku)}`, body);
  const r = rows[0];
  if (!r) return undefined;
  const names = await branchIdToNama();
  return { nama: r.nama, sku: r.sku, satuan: r.satuan, stok: Number(r.stok) || 0, minimum: Number(r.minimum) || 0, hargaRata: Number(r.harga_rata) || 0, cabang: (r.cabang_id && names.get(r.cabang_id)) || "—" };
}

export async function deleteIngredient(sku: string): Promise<boolean> {
  if (!supaConfigured()) {
    const n = mem.ingredients.length;
    mem.ingredients = mem.ingredients.filter((x) => x.sku !== sku);
    return mem.ingredients.length < n;
  }
  await sbDelete("ingredients", `sku=eq.${encodeURIComponent(sku)}`);
  return true;
}

// ============================================================
// Modul operasional & sistem — Supabase bila configured, memory bila tidak.
// Kolom DB snake_case; Row client camelCase (dipetakan di sini).
// ============================================================

export type ExpenseRow = { id: string; tanggal: string; kategori: string; jumlah: number; cabang: string; catatan: string };
export type SupplierRow = { id: string; nama: string; kontak: string; termin: string; utang: number };
export type PurchaseRow = { id: string; tanggal: string; supplier: string; skuBahan: string; namaBahan: string; qty: number; satuan: string; harga: number; total: number; status: "Draft" | "Diterima" };
export type TransferRow = { id: string; tanggal: string; skuBahan: string; namaBahan: string; qty: number; satuan: string; dari: string; ke: string; status: "Terkirim" | "Diterima" };
export type WasteRow = { id: string; tanggal: string; skuBahan: string; namaBahan: string; qty: number; satuan: string; alasan: string };
export type OpnameRow = { id: string; tanggal: string; skuBahan: string; namaBahan: string; sistem: number; fisik: number; selisih: number; alasan: string; status: "Draft" | "Disetujui" };
export type AppUserRow = { id: string; nama: string; username: string; role: "admin" | "cabang" | "kasir"; cabang: string };
export type SettingsRow = { pajakPct: number; namaToko: string; alamatStruk: string; cetakOtomatis: boolean; strukHeader: string; strukFooter: string; tampilkanLogo: boolean; ukuranKertas: string };
export type ShiftRow = { id: string; cabang: string; kasir: string; kasAwal: number; mulai: string; status: "buka" | "tutup"; kasAkhir: number; selisih: number; selesai: string; catatan: string };
export type AuditRow = { id: string; waktu: string; aksi: string; detail: string };

const DEF_SETTINGS: SettingsRow = {
  pajakPct: 5, namaToko: "SignalPOS Kebab", alamatStruk: "Jl. Braga No. 12, Bandung",
  cetakOtomatis: true, strukHeader: "", strukFooter: "Terima kasih atas kunjungan Anda",
  tampilkanLogo: true, ukuranKertas: "80mm",
};

// --- generic helpers (kolom snake_case <-> camelCase dangkal) ---
function toSnake<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const sk = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    out[sk === "pajak_pct" ? "pajak_pct" : sk] = v;
  }
  return out;
}

async function listRows<T>(table: string, order = "created_at.desc", limit = 200): Promise<T[]> {
  if (!supaConfigured()) {
    const memAny = mem as unknown as Record<string, T[]>;
    return [...(memAny[table === "audit_logs" ? "audit" : table] ?? [])].slice(0, limit);
  }
  return sbList<T>(table, `select=*&order=${order}&limit=${limit}`);
}

async function insertRows<T>(table: string, rows: unknown[]): Promise<T[]> {
  if (!supaConfigured()) {
    const memAny = mem as unknown as Record<string, T[]>;
    const key = table === "audit_logs" ? "audit" : table;
    memAny[key] = [...(rows as T[]), ...(memAny[key] ?? [])];
    return rows as T[];
  }
  return sbInsert<T>(table, rows.map((r) => toSnake(r as Record<string, unknown>)));
}

async function patchRows<T>(table: string, id: string, patch: Record<string, unknown>): Promise<T[]> {
  if (!supaConfigured()) {
    const memAny = mem as unknown as Record<string, T[]>;
    const key = table === "audit_logs" ? "audit" : table;
    memAny[key] = (memAny[key] ?? []).map((r) => ((r as unknown as Record<string, unknown>).id === id ? { ...r, ...patch } : r));
    return memAny[key].filter((r) => ((r as unknown as Record<string, unknown>).id === id));
  }
  const clean: Record<string, unknown> = { ...patch };
  delete clean.id;
  return sbUpdate<T>(table, `id=eq.${encodeURIComponent(id)}`, toSnake(clean));
}

async function removeRow(table: string, id: string): Promise<void> {
  if (!supaConfigured()) {
    const memAny = mem as unknown as Record<string, unknown[]>;
    const key = table === "audit_logs" ? "audit" : table;
    memAny[key] = (memAny[key] ?? []).filter((r) => (r as Record<string, unknown>).id !== id);
    return;
  }
  await sbDelete(table, `id=eq.${encodeURIComponent(id)}`);
}

// --- expenses ---
export const listExpenses = (): Promise<ExpenseRow[]> => listRows<ExpenseRow>("expenses");
export const createExpense = (r: ExpenseRow): Promise<ExpenseRow[]> => insertRows<ExpenseRow>("expenses", [r]);
export const deleteExpense = (id: string): Promise<void> => removeRow("expenses", id);

// --- suppliers ---
export const listSuppliers = (): Promise<SupplierRow[]> => listRows<SupplierRow>("suppliers", "nama");
export const createSupplier = (r: SupplierRow): Promise<SupplierRow[]> => insertRows<SupplierRow>("suppliers", [r]);
export const updateSupplier = (id: string, p: Partial<SupplierRow>): Promise<SupplierRow[]> => patchRows<SupplierRow>("suppliers", id, p);
export const deleteSupplier = (id: string): Promise<void> => removeRow("suppliers", id);

// --- purchases ---
export const listPurchases = (): Promise<PurchaseRow[]> => listRows<PurchaseRow>("purchases");
export const createPurchase = (r: PurchaseRow): Promise<PurchaseRow[]> => insertRows<PurchaseRow>("purchases", [r]);
export const updatePurchase = (id: string, p: Partial<PurchaseRow>): Promise<PurchaseRow[]> => patchRows<PurchaseRow>("purchases", id, p);
export const deletePurchase = (id: string): Promise<void> => removeRow("purchases", id);

// --- transfers ---
export const listTransfers = (): Promise<TransferRow[]> => listRows<TransferRow>("transfers");
export const createTransfer = (r: TransferRow): Promise<TransferRow[]> => insertRows<TransferRow>("transfers", [r]);
export const updateTransfer = (id: string, p: Partial<TransferRow>): Promise<TransferRow[]> => patchRows<TransferRow>("transfers", id, p);
export const deleteTransfer = (id: string): Promise<void> => removeRow("transfers", id);

// --- wastes ---
export const listWastes = (): Promise<WasteRow[]> => listRows<WasteRow>("wastes");
export const createWaste = (r: WasteRow): Promise<WasteRow[]> => insertRows<WasteRow>("wastes", [r]);
export const deleteWaste = (id: string): Promise<void> => removeRow("wastes", id);

// --- opnames ---
export const listOpnames = (): Promise<OpnameRow[]> => listRows<OpnameRow>("opnames");
export const createOpname = (r: OpnameRow): Promise<OpnameRow[]> => insertRows<OpnameRow>("opnames", [r]);
export const updateOpname = (id: string, p: Partial<OpnameRow>): Promise<OpnameRow[]> => patchRows<OpnameRow>("opnames", id, p);
export const deleteOpname = (id: string): Promise<void> => removeRow("opnames", id);

// --- app users ---
export const listAppUsers = (): Promise<AppUserRow[]> => listRows<AppUserRow>("app_users", "nama");
export const createAppUser = (r: AppUserRow): Promise<AppUserRow[]> => insertRows<AppUserRow>("app_users", [r]);
export const updateAppUser = (id: string, p: Partial<AppUserRow>): Promise<AppUserRow[]> => patchRows<AppUserRow>("app_users", id, p);
export const deleteAppUser = (id: string): Promise<void> => removeRow("app_users", id);

// --- settings (satu baris id=default) ---
type SBSettings = { pajak_pct: number; nama_toko: string; alamat_struk: string; cetak_otomatis: boolean; struk_header: string; struk_footer: string; tampilkan_logo: boolean; ukuran_kertas: string };
function mapSettings(s: SBSettings): SettingsRow {
  return { pajakPct: Number(s.pajak_pct) || 0, namaToko: s.nama_toko ?? "", alamatStruk: s.alamat_struk ?? "", cetakOtomatis: !!s.cetak_otomatis, strukHeader: s.struk_header ?? "", strukFooter: s.struk_footer ?? "", tampilkanLogo: s.tampilkan_logo !== false, ukuranKertas: s.ukuran_kertas ?? "80mm" };
}
export async function getSettings(): Promise<SettingsRow> {
  if (!supaConfigured()) return mem.settings ?? DEF_SETTINGS;
  const rows = await sbList<SBSettings>("settings", "select=*&id=eq.default&limit=1");
  return rows[0] ? mapSettings(rows[0]) : DEF_SETTINGS;
}
export async function saveSettingsRow(s: SettingsRow): Promise<SettingsRow> {
  if (!supaConfigured()) {
    mem.settings = { ...s };
    return mem.settings;
  }
  const res = await fetch(`${process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/settings`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([{ id: "default", ...toSnake(s) }]),
  });
  if (!res.ok) throw new Error(`Supabase upsert settings gagal: HTTP ${res.status}`);
  const rows = (await res.json()) as SBSettings[];
  return rows[0] ? mapSettings(rows[0]) : s;
}

// --- shifts ---
type SBShift = { id: string; cabang: string; kasir: string; kas_awal: number; mulai: string; status: "buka" | "tutup"; kas_akhir: number; selisih: number; selesai: string; catatan: string };
function mapShift(s: SBShift): ShiftRow {
  return { id: s.id, cabang: s.cabang ?? "", kasir: s.kasir ?? "", kasAwal: Number(s.kas_awal) || 0, mulai: s.mulai ?? "", status: s.status, kasAkhir: Number(s.kas_akhir) || 0, selisih: Number(s.selisih) || 0, selesai: s.selesai ?? "", catatan: s.catatan ?? "" };
}
export async function listShifts(limit = 50): Promise<ShiftRow[]> {
  if (!supaConfigured()) return [...mem.shifts].slice(0, limit);
  const rows = await sbList<SBShift>("shifts", `select=*&order=created_at.desc&limit=${limit}`);
  return rows.map(mapShift);
}
export async function createShift(r: ShiftRow): Promise<ShiftRow> {
  if (!supaConfigured()) {
    mem.shifts.unshift(r);
    return r;
  }
  const rows = await sbInsert<SBShift>("shifts", [toSnake({ ...r })]);
  return mapShift(rows[0]);
}
export async function updateShift(id: string, p: Partial<ShiftRow>): Promise<ShiftRow | undefined> {
  if (!supaConfigured()) {
    const i = mem.shifts.findIndex((s) => s.id === id);
    if (i < 0) return undefined;
    mem.shifts[i] = { ...mem.shifts[i], ...p, id };
    return mem.shifts[i];
  }
  const rest = { ...p };
  delete (rest as Partial<ShiftRow>).id;
  const rows = await sbUpdate<SBShift>("shifts", `id=eq.${encodeURIComponent(id)}`, toSnake(rest));
  return rows[0] ? mapShift(rows[0]) : undefined;
}

// --- audit ---
export const listAudit = (limit = 200): Promise<AuditRow[]> => listRows<AuditRow>("audit_logs", "created_at.desc", limit);
export const createAudit = (r: AuditRow): Promise<AuditRow[]> => insertRows<AuditRow>("audit_logs", [r]);

// --- sale items (lines per transaksi, untuk laporan qty) ---
export type SaleItemRow = { saleId: string; productId: string; nama: string; qty: number; harga: number };
type SBSaleItem = { sale_id: string; product_id: string | null; nama: string; qty: number; harga: number };
export async function listSaleItems(limit = 2000): Promise<SaleItemRow[]> {
  if (!supaConfigured()) return [];
  const rows = await sbList<SBSaleItem>("sale_items", `select=sale_id,product_id,nama,qty,harga&order=sale_id.desc&limit=${limit}`);
  return rows.map((r) => ({ saleId: r.sale_id, productId: r.product_id ?? "", nama: r.nama ?? "", qty: Number(r.qty) || 0, harga: Number(r.harga) || 0 }));
}
