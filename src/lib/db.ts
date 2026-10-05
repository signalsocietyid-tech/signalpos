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
      { id: "TRX-20261004-00192", cabang: "Cabang 2 — Braga", kasir: "Andi", jam: "19:42", total: 55000, hpp: 28500, laba: 26500, bayar: "QRIS", status: "LUNAS" },
      { id: "TRX-20261004-00191", cabang: "Cabang 1 — Dago", kasir: "Sinta", jam: "19:35", total: 43000, hpp: 21600, laba: 21400, bayar: "Tunai", status: "LUNAS" },
      { id: "TRX-20261004-00190", cabang: "Cabang 2 — Braga", kasir: "Andi", jam: "19:21", total: 25000, hpp: 13250, laba: 11750, bayar: "QRIS", status: "LUNAS" },
      { id: "TRX-20261004-00189", cabang: "Cabang 3 — Cihampelas", kasir: "Budi", jam: "19:12", total: 67000, hpp: 34800, laba: 32200, bayar: "E-wallet", status: "LUNAS" },
    ],
    ingredients: [...seedIngredients],
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
