-- SignalPOS — skema Postgres
-- Cara pakai: jalankan file ini sekali di database (Neon/Supabase/Vercel Postgres),
-- lalu isi DATABASE_URL di .env / env Vercel.

create extension if not exists "pgcrypto";

-- ============ cabang ============
create table if not exists branches (
  id text primary key,
  nama text not null,
  alamat text not null default '',
  warna text not null default '#2563EB',
  status text not null default 'Buka' check (status in ('Buka','Tutup')),
  kas bigint not null default 0,
  created_at timestamptz not null default now()
);

-- ============ pengguna ============
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  nama text not null,
  password_hash text not null, -- isi dengan hash bcrypt (jangan plaintext di produksi)
  role text not null check (role in ('admin','cabang','kasir')),
  cabang_id text references branches(id) on delete set null,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ produk ============
create table if not exists products (
  id text primary key,
  nama text not null,
  sku text not null unique,
  kategori text not null default 'Kebab',
  harga integer not null default 0 check (harga >= 0),
  hpp integer not null default 0 check (hpp >= 0),
  status text not null default 'Aktif' check (status in ('Aktif','Nonaktif')),
  stok integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_products_kategori on products(kategori);

-- ============ bahan baku ============
create table if not exists ingredients (
  id text primary key,
  nama text not null,
  sku text not null unique,
  satuan text not null default 'gram',
  stok numeric not null default 0,
  minimum numeric not null default 0,
  harga_rata numeric not null default 0,
  cabang_id text references branches(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============ penjualan ============
create table if not exists sales (
  id text primary key,
  cabang_id text references branches(id) on delete set null,
  cabang_nama text not null default '',
  kasir text not null default '',
  total integer not null default 0,
  hpp integer not null default 0,
  laba integer not null default 0,
  bayar text not null default 'Tunai',
  status text not null default 'LUNAS' check (status in ('LUNAS','Pending','Refund')),
  created_at timestamptz not null default now()
);
create index if not exists idx_sales_cabang on sales(cabang_id);

create table if not exists sale_items (
  id bigserial primary key,
  sale_id text not null references sales(id) on delete cascade,
  product_id text references products(id) on delete set null,
  nama text not null default '',
  qty integer not null default 1 check (qty > 0),
  harga integer not null default 0
);
create index if not exists idx_sale_items_sale on sale_items(sale_id);

-- ============ seed cabang ============
insert into branches (id, nama, alamat, warna, status, kas) values
  ('c1', 'Cabang 1 — Dago', 'Jl. Ir. H. Juanda No. 88', '#2563EB', 'Buka', 2150000),
  ('c2', 'Cabang 2 — Braga', 'Jl. Braga No. 12', '#0284C7', 'Buka', 3240000),
  ('c3', 'Cabang 3 — Cihampelas', 'Jl. Cihampelas No. 45', '#4F46E5', 'Buka', 1780000),
  ('c4', 'Cabang 4 — Buah Batu', 'Jl. Buah Batu No. 203', '#64748B', 'Tutup', 1280000)
on conflict (id) do nothing;

-- ============ seed user demo (password HARUS diganti hash-nya) ============
-- password_hash di bawah hanya placeholder. Generate bcrypt lalu UPDATE.
insert into users (username, nama, password_hash, role, cabang_id) values
  ('admin', 'Administrator', 'GANTI_DENGAN_BCRYPT_admin123', 'admin', null),
  ('braga', 'Manajer Braga', 'GANTI_DENGAN_BCRYPT_cabang123', 'cabang', 'c2'),
  ('kasir', 'Kasir Dago', 'GANTI_DENGAN_BCRYPT_kasir123', 'kasir', 'c1')
on conflict (username) do nothing;

-- ============ seed produk (katalog awal, sama dengan mock) ============
insert into products (id, nama, sku, kategori, harga, hpp, status, stok) values
  ('p1', 'Kebab Beef Small', 'KBB-BEF-S', 'Kebab', 15000, 8200, 'Aktif', 42),
  ('p2', 'Kebab Beef Medium', 'KBB-BEF-M', 'Kebab', 20000, 10800, 'Aktif', 38),
  ('p3', 'Kebab Beef Large', 'KBB-BEF-L', 'Kebab', 25000, 13250, 'Aktif', 51),
  ('p4', 'Kebab Chicken', 'KBB-CHK-01', 'Kebab', 18000, 9400, 'Aktif', 27),
  ('p5', 'Cheese Kebab', 'KBB-CHS-01', 'Kebab', 23000, 12400, 'Aktif', 19),
  ('p6', 'Double Meat Kebab', 'KBB-DM-01', 'Kebab', 32000, 18900, 'Aktif', 12),
  ('p7', 'Kebab Combo', 'CMB-01', 'Combo', 35000, 19200, 'Aktif', 22),
  ('p8', 'Fries', 'SNK-FRS-01', 'Fries', 12000, 4800, 'Aktif', 60),
  ('p9', 'Air Mineral', 'MNM-01', 'Minuman', 5000, 2200, 'Aktif', 120),
  ('p10', 'Soft Drink', 'MNM-02', 'Minuman', 8000, 4100, 'Aktif', 88),
  ('p11', 'Extra Cheese', 'ADD-CHS', 'Add-on', 5000, 3100, 'Aktif', 200),
  ('p12', 'Extra Meat', 'ADD-MET', 'Add-on', 7000, 5200, 'Aktif', 150)
on conflict (id) do update set
  nama = excluded.nama, sku = excluded.sku, kategori = excluded.kategori,
  harga = excluded.harga, hpp = excluded.hpp, status = excluded.status, stok = excluded.stok;

-- ============ seed bahan baku ============
insert into ingredients (id, nama, sku, satuan, stok, minimum, harga_rata, cabang_id) values
  ('b1', 'Beef', 'BB-BEF', 'gram', 8400, 10000, 75, 'c2'),
  ('b2', 'Chicken', 'BB-CHK', 'gram', 15200, 8000, 42, 'c2'),
  ('b3', 'Tortilla', 'BB-TRT', 'pcs', 320, 100, 2500, 'c2'),
  ('b4', 'Lettuce', 'BB-LTC', 'gram', 2100, 2000, 18, 'c2'),
  ('b5', 'Tomato', 'BB-TMT', 'gram', 1800, 2000, 14, 'c2'),
  ('b6', 'Onion', 'BB-ONN', 'gram', 1600, 1500, 12, 'c2'),
  ('b7', 'Cheese', 'BB-CHS', 'gram', 900, 1200, 155, 'c2'),
  ('b8', 'Garlic Sauce', 'BB-GRL', 'gram', 4300, 2000, 32, 'c2'),
  ('b9', 'Packaging', 'KM-PAK', 'pcs', 410, 200, 1400, 'c2')
on conflict (id) do update set
  nama = excluded.nama, sku = excluded.sku, satuan = excluded.satuan,
  stok = excluded.stok, minimum = excluded.minimum, harga_rata = excluded.harga_rata,
  cabang_id = excluded.cabang_id;
