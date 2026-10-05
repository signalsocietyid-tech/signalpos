# AGENTS.md — Aturan untuk AI Agent

> File ini wajib dipatuhi setiap AI agent yang mengedit repo ini.

## 1. Baca dulu
Sebelum coding, baca: `MEMORY.md`, `src/app/layout.tsx`, `src/components/layout.tsx`, `src/store/db.tsx`, `src/store/auth.tsx`, `src/app/globals.css`.

## 2. Perintah verifikasi
- Setelah ubah kode, jalankan minimal: `npm run build` (wajib lolos). Jalankan `npm run lint` bila menyentuh banyak file.
- Jangan menambah dependensi tanpa alasan. Repo ini sengaja ringan (next/react saja).
- PowerShell 5.1: rantai perintah pakai `; if ($?) { ... }`, bukan `&&`.

## 3. Konvensi kode
- Bahasa UI: Indonesia. Uang: `rupiah(n)` dari `@/store/db`. Angka rata: class `tnum`.
- Warna: biru-putih. Primary `#2563EB`, dark `#1D4ED8`, soft `#EFF6FF`, line `#E2E8F0`, teks `#0F172A`.
- Dilarang mengembalikan orange `#FF6B00` / hijau `#1A7F3D` sebagai warna primary.
- Kartu pakai class `.card` + `.card-hover` + `.press` dari `globals.css`.
- Client state: tambah ke `src/store/db.tsx` (persist `signalpos:*`). Session: `src/store/auth.tsx` (`signalpos:session`).
- Backend: tambah Route Handler di `src/app/api/<nama>/route.ts`, pakai helper dari `src/lib/db.ts`. Jangan akses `localStorage` di server.

## 4. Routing
- `/login` = layout kosong (tanpa sidebar). Jangan bungkus dengan AdminNav.
- `/pos` = layout POS (rel kiri 76px + topbar cabang + panel order kanan). Deteksi via `pathname === "/pos" || pathname.startsWith("/pos/")`.
- Admin = semua rute lain + alias `/admin` (redirect ke `/`). Toggle POS/Admin harus ke `/pos` dan `/admin`, bukan `/`.
- Proteksi: halaman admin butuh role `admin|cabang`. Halaman `/pos` butuh `admin|cabang|kasir`. Guard ada di `AppShell`; jangan bypass.

## 5. Jangan lakukan
- Jangan hapus `DBProvider`/`AuthProvider` dari `layout.tsx`.
- Jangan commit `.env` (sudah di `.gitignore`). Boleh commit `.env.example`.
- Jangan hardcode secret. Pakai `process.env`.
- Jangan buat file dokumentasi baru (*.md) kecuali diminta — cukup update `MEMORY.md`.

## 6. Backend & DB
- `src/lib/db.ts` = satu-satunya tempat switch memory vs Supabase (`supaConfigured()` dari `src/lib/supabase.ts`). Semua fungsi store async.
- Supabase diakses via PostgREST (fetch), tanpa ORM. Key `service_role` hanya di server — jangan expose ke browser.
- Skema: ubah `db/schema.sql` + catat di `MEMORY.md`. User menjalankan SQL via Supabase SQL Editor; jangan bikin migrasi otomatis tanpa diminta.
- API harus return JSON + status code benar (200/201/400/401/404/500). Validasi input minimal (nama/harga/role). Bungkus call Supabase dengan try/catch → 500 + pesan error.

## 7. Login & role
- User demo di `src/lib/auth.ts` (`DEMO_USERS`). Password plaintext hanya untuk demo — tulis komentar `// DEMO ONLY`.
- Role values: `"admin" | "cabang" | "kasir"`. Alias `user` = `kasir`.
- Setelah login: `admin → /admin`, `cabang → /admin?cabang=<id>`, `kasir → /pos`.
