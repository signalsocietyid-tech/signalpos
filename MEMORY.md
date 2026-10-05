# MEMORY.md — SignalPOS

> Memori proyek untuk AI agent + developer. Baca file ini dulu sebelum mengubah kode.

## 1. Ringkasan
SignalPOS = sistem kasir + backoffice untuk bisnis kebab multi-cabang.
- **Kasir (POS):** rute `/pos` — layout rel kiri ramping, katalog cepat, keranjang kanan, bayar Tunai/QRIS/Kartu.
- **Admin/Backoffice:** rute `/` (kanonis) + alias `/admin` — layout sidebar penuh: Dashboard, Penjualan, Produk, Resep & HPP, Bahan, Stok, Pembelian, Transfer, Opname, Waste, Pengeluaran, Shift & Kas, Laporan, Profitabilitas, Cabang, Pengguna, Supplier, Pengaturan, Audit.
- **Login:** rute `/login` — pilih peran: `admin` (akses penuh → `/admin`), `cabang` (manajer cabang → `/admin` terfilter cabang), `kasir`/`user` (kasir → `/pos` terkunci 1 cabang).

## 2. Stack
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- State client: `src/store/db.tsx` (DBProvider, localStorage `signalpos:*`) + `src/store/auth.tsx` (AuthProvider, session `signalpos:session`).
- Backend: Route Handlers `src/app/api/*` (memory bila env Supabase kosong, Supabase PostgREST bila `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` diisi — lihat `src/lib/db.ts` + `src/lib/supabase.ts`).
- DB: Supabase Postgres `https://luoixbircduzgyeyfxyi.supabase.co`. Skema + seed: `db/schema.sql`.

## 3. Colour palette (final: biru-putih)
- Primary: `#2563EB` (blue-600), hover/dark `#1D4ED8` (blue-700), soft bg `#EFF6FF` / `#DBEAFE`.
- Ink teks: `#0F172A` (slate-900). Background app: `#F8FAFC` (slate-50) untuk admin, `#F1F5F9` untuk POS.
- Line/border: `#E2E8F0` (slate-200).
- Sukses: `#16A34A` + bg `#DCFCE7`. Peringatan: `#D97706` + bg `#FEF3C7`. Bahaya: `#DC2626` + bg `#FEE2E2`.
- Jangan pakai orange `#FF6B00` atau hijau tua `#1A7F3D` sebagai primary lagi (hanya boleh untuk status kecil bila perlu).

## 4. Struktur folder
```
src/app/page.tsx            → Dashboard admin (kanonis, alias /admin)
src/app/admin/page.tsx      → redirect ke / (agar link /admin valid)
src/app/login/page.tsx      → login panel 3 peran
src/app/pos/page.tsx        → POS kasir
src/app/api/health/         → GET health check
src/app/api/products/       → CRUD produk
src/app/api/branches/       → CRUD cabang
src/app/api/sales/          → list + create penjualan
src/app/api/auth/login/      → login dummy → token base64
src/components/layout.tsx   → AppShell (branch /pos vs /login vs admin)
src/components/ui.tsx       → Badge, Card, Modal, Field, Segmented, ProductArt
src/store/db.tsx            → data cabang/produk/bahan/penjualan
src/store/auth.tsx          → session & role guard
src/lib/db.ts               → abstraksi store backend (memory → Postgres)
src/lib/auth.ts             → user demo, sign token, cek role
db/schema.sql               → skema Postgres
```

## 5. Aturan bisnis
- Harga dalam Rupiah integer (tanpa desimal). Format via `rupiah(n)`.
- Pajak POS = 5% dari subtotal. HPP per produk dari `data/mock.ts`. Laba = total - hpp.
- Stok menipis bila `stok <= minimum`.
- Cabang `semua` hanya agregat, tidak untuk transaksi.
- Role: `admin` = semua cabang + semua menu. `cabang` = 1 cabang, bisa lihat laporan cabangnya. `kasir`/`user` = hanya `/pos` + riwayat, terkunci 1 cabang.

## 6. Akun demo (login panel)
- Admin: `admin / admin123`
- Manajer cabang (Braga): `braga / cabang123`
- Kasir (Dago): `kasir / kasir123`
- Token = base64(payload). Bukan JWT sungguhan — ganti dengan Auth.js/NextAuth saat produksi.

## 7. Env & database (Supabase)
- Salin `.env.example` → `.env` untuk lokal.
- Supabase project: `https://luoixbircduzgyeyfxyi.supabase.co`.
- Langkah awal (sekali saja):
  1. Buka Supabase Dashboard → SQL Editor → paste seluruh `db/schema.sql` → Run (membuat tabel + seed cabang/user/produk/bahan).
  2. Project Settings → API → salin `service_role` key (rahasia!) ke `SUPABASE_SERVICE_ROLE_KEY`, dan `anon public` ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  3. Restart `npm run dev`. Cek `/api/health` → `"db":"supabase"`, dan `/api/products` mengembalikan 12 produk.
- Tanpa kedua env → mode `memory` (data hilang saat restart — wajar untuk demo).
- `service_role` hanya dipakai di server (`src/lib/supabase.ts`). Jangan taruh di `NEXT_PUBLIC_*`.

## 8. Cara jalan
```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev             # http://localhost:3000
npm run build           # wajib lolos sebelum push/deploy
npm run lint
```
- `/login` → pilih peran → otomatis redirect sesuai role.
- Jika port 3000 dipakai: matikan proses lama dulu (satu instance saja).

## 9. Deploy (Vercel)
1. Push ke GitHub.
2. Import di Vercel → framework Next.js.
3. Env (Settings → Environment Variables): `NEXTAUTH_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` (isi URL produksi).
4. Deploy. Cek `https://<app>/api/health` harus `{"ok":true,"db":"supabase"}`.

## 10. Status deploy 2026-10-05 (akun signalsocietyid-tech)
- Vercel project: `signalsocietyid-tech/signalpos` (`prj_m29yst7t0Icjl9pATNuE3YQ8tkPx`), connect ke GitHub `signalsocietyid-tech/signalpos`.
- Production: `https://signalpos-vert.vercel.app` (alias), verified `/api/health` → `{"ok":true,"db":"supabase"}`.
- 7 env production sudah diisi via CLI (termasuk `NEXTAUTH_SECRET` acak baru). `NEXT_PUBLIC_APP_URL` masih placeholder — tidak dipakai di `src`, aman.
- Project lama `sein-workspace/signalpos` (punya masiahsein16-bot) tidak dipakai — boleh dihapus dari dashboard.
- Sisa: push kode lokal (`main`: `def2de2` + merge `78c9a7f`) ke GitHub masih 403 untuk `perdinaindoutama` maupun `masiahsein16-bot`. Minta akses Write ke repo, lalu `git push -u origin main`. Setelah itu auto-deploy Vercel jalan per push.
