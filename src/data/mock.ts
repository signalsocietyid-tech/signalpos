export const branches = ["Semua Cabang", "Cabang 1", "Cabang 2", "Cabang 3", "Cabang 4"];
export const periods = ["Hari Ini", "Kemarin", "Minggu Ini", "Bulan Ini", "Custom"];

export type Product = {
  id: string;
  nama: string;
  sku: string;
  kategori: string;
  harga: number;
  hpp: number;
  status: "Aktif" | "Nonaktif";
};

export const categories = [
  "Semua",
  "Kebab",
  "Burger",
  "Shawarma",
  "Rice",
  "Fries",
  "Snack",
  "Minuman",
  "Saus",
  "Combo",
  "Add-on",
];

export const products: Product[] = [
  { id: "p1", nama: "Kebab Beef Small", sku: "KBB-BEF-S", kategori: "Kebab", harga: 15000, hpp: 8200, status: "Aktif" },
  { id: "p2", nama: "Kebab Beef Medium", sku: "KBB-BEF-M", kategori: "Kebab", harga: 20000, hpp: 10800, status: "Aktif" },
  { id: "p3", nama: "Kebab Beef Large", sku: "KBB-BEF-L", kategori: "Kebab", harga: 25000, hpp: 13250, status: "Aktif" },
  { id: "p4", nama: "Kebab Chicken", sku: "KBB-CHK-01", kategori: "Kebab", harga: 18000, hpp: 9400, status: "Aktif" },
  { id: "p5", nama: "Cheese Kebab", sku: "KBB-CHS-01", kategori: "Kebab", harga: 23000, hpp: 12400, status: "Aktif" },
  { id: "p6", nama: "Double Meat Kebab", sku: "KBB-DM-01", kategori: "Kebab", harga: 32000, hpp: 18900, status: "Aktif" },
  { id: "p7", nama: "Kebab Combo", sku: "CMB-01", kategori: "Combo", harga: 35000, hpp: 19200, status: "Aktif" },
  { id: "p8", nama: "Fries", sku: "SNK-FRS-01", kategori: "Fries", harga: 12000, hpp: 4800, status: "Aktif" },
  { id: "p9", nama: "Air Mineral", sku: "MNM-01", kategori: "Minuman", harga: 5000, hpp: 2200, status: "Aktif" },
  { id: "p10", nama: "Soft Drink", sku: "MNM-02", kategori: "Minuman", harga: 8000, hpp: 4100, status: "Aktif" },
  { id: "p11", nama: "Extra Cheese", sku: "ADD-CHS", kategori: "Add-on", harga: 5000, hpp: 3100, status: "Aktif" },
  { id: "p12", nama: "Extra Meat", sku: "ADD-MET", kategori: "Add-on", harga: 7000, hpp: 5200, status: "Aktif" },
];

export type Ingredient = {
  nama: string;
  sku: string;
  satuan: string;
  stok: number;
  minimum: number;
  hargaRata: number;
  cabang: string;
};

export const ingredients: Ingredient[] = [
  { nama: "Beef", sku: "BB-BEF", satuan: "gram", stok: 8400, minimum: 10000, hargaRata: 75, cabang: "Cabang 2" },
  { nama: "Chicken", sku: "BB-CHK", satuan: "gram", stok: 15200, minimum: 8000, hargaRata: 42, cabang: "Cabang 2" },
  { nama: "Tortilla", sku: "BB-TRT", satuan: "pcs", stok: 320, minimum: 100, hargaRata: 2500, cabang: "Cabang 2" },
  { nama: "Lettuce", sku: "BB-LTC", satuan: "gram", stok: 2100, minimum: 2000, hargaRata: 18, cabang: "Cabang 2" },
  { nama: "Tomato", sku: "BB-TMT", satuan: "gram", stok: 1800, minimum: 2000, hargaRata: 14, cabang: "Cabang 2" },
  { nama: "Onion", sku: "BB-ONN", satuan: "gram", stok: 1600, minimum: 1500, hargaRata: 12, cabang: "Cabang 2" },
  { nama: "Cheese", sku: "BB-CHS", satuan: "gram", stok: 900, minimum: 1200, hargaRata: 155, cabang: "Cabang 2" },
  { nama: "Garlic Sauce", sku: "BB-GRL", satuan: "gram", stok: 4300, minimum: 2000, hargaRata: 32, cabang: "Cabang 2" },
  { nama: "Packaging", sku: "KM-PAK", satuan: "pcs", stok: 410, minimum: 200, hargaRata: 1400, cabang: "Cabang 2" },
];

export const recipeKebabLarge = [
  { nama: "Tortilla", jumlah: "1 pcs", biaya: 2500 },
  { nama: "Beef", jumlah: "100 gram", biaya: 7500 },
  { nama: "Lettuce", jumlah: "30 gram", biaya: 540 },
  { nama: "Tomato", jumlah: "20 gram", biaya: 280 },
  { nama: "Onion", jumlah: "15 gram", biaya: 180 },
  { nama: "Saus", jumlah: "25 gram", biaya: 800 },
  { nama: "Mayones", jumlah: "15 gram", biaya: 450 },
  { nama: "Packaging", jumlah: "1 pcs", biaya: 1400 },
];

export const sales = [
  { id: "TRX-20261004-00192", cabang: "Cabang 2", kasir: "Andi", jam: "19:42", total: 55000, hpp: 28500, laba: 26500, bayar: "QRIS", status: "LUNAS" },
  { id: "TRX-20261004-00191", cabang: "Cabang 1", kasir: "Sinta", jam: "19:35", total: 43000, hpp: 21600, laba: 21400, bayar: "Tunai", status: "LUNAS" },
  { id: "TRX-20261004-00190", cabang: "Cabang 2", kasir: "Andi", jam: "19:21", total: 25000, hpp: 13250, laba: 11750, bayar: "QRIS", status: "LUNAS" },
  { id: "TRX-20261004-00189", cabang: "Cabang 3", kasir: "Budi", jam: "19:12", total: 67000, hpp: 34800, laba: 32200, bayar: "E-wallet", status: "LUNAS" },
  { id: "TRX-20261004-00188", cabang: "Cabang 2", kasir: "Andi", jam: "18:58", total: 18000, hpp: 9400, laba: 8600, bayar: "Debit", status: "Refund" },
  { id: "TRX-20261004-00187", cabang: "Cabang 4", kasir: "Rina", jam: "18:44", total: 35000, hpp: 19200, laba: 15800, bayar: "QRIS", status: "Pending" },
];

export function rupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}
