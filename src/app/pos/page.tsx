"use client";

import { useMemo, useState } from "react";
import { useDB, rupiah } from "@/store/db";
import { Modal, ProductArt, QtyStepper, Segmented } from "@/components/ui";

const CAT_ICON: Record<string, string> = {
  Semua: "⊞", Kebab: "🥙", Burger: "🍔", Shawarma: "🌯", Rice: "🍚",
  Fries: "🍟", Snack: "🧆", Minuman: "🥤", Saus: "🧂", Combo: "🍱", "Add-on": "🧀",
};
const TIPE = ["Dine In", "Take Away", "Delivery"] as const;
const BAYAR = [
  { id: "Tunai", icon: "◉" },
  { id: "QRIS", icon: "◈" },
  { id: "Kartu", icon: "▭" },
];
const MEJA = [
  { id: "T1", nama: "Jacob Jones", items: 6, status: "Dapur" },
  { id: "T2", nama: "Bessie Cooper", items: 6, status: "Proses" },
  { id: "T3", nama: "Ralph Edwards", items: 6, status: "Proses" },
  { id: "T4", nama: "Floyd Miles", items: 0, status: "Kosong" },
];

/** ID struk acak — di luar komponen agar tidak dipanggil saat render. */
function buatIdTrx(): string {
  const tgl = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `TRX-${tgl}-${String(Math.floor(100 + Math.random() * 900))}`;
}

export default function PosPage() {
  const { products, activeBranch, addSale, settings } = useDB();
  const aktif = useMemo(() => products.filter((p) => p.status === "Aktif"), [products]);

  const [kategori, setKategori] = useState("Semua");
  const [cari, setCari] = useState("");
  const [tipe, setTipe] = useState<(typeof TIPE)[number]>("Dine In");
  const [bayar, setBayar] = useState("QRIS");
  const [meja, setMeja] = useState("T4");
  const [mejaOpen, setMejaOpen] = useState(false);
  const [sort, setSort] = useState<"populer" | "murah" | "mahal">("populer");
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([{ id: "p3", qty: 2 }]);
  type Struk = { id: string; jam: string; meja: string; tipe: string; bayar: string; subtotal: number; pajak: number; total: number; lines: { nama: string; harga: number; qty: number }[] };
  const [struk, setStruk] = useState<Struk | null>(null);

  const cats = useMemo(() => {
    const map = new Map<string, number>();
    aktif.forEach((p) => map.set(p.kategori, (map.get(p.kategori) ?? 0) + 1));
    return [{ nama: "Semua", count: aktif.length }, ...[...map.entries()].map(([nama, count]) => ({ nama, count }))];
  }, [aktif]);

  const daftar = useMemo(() => {
    const hasil = aktif.filter((p) => (kategori === "Semua" || p.kategori === kategori) && p.nama.toLowerCase().includes(cari.toLowerCase()));
    if (sort === "murah") hasil.sort((a, b) => a.harga - b.harga);
    if (sort === "mahal") hasil.sort((a, b) => b.harga - a.harga);
    return hasil;
  }, [aktif, kategori, cari, sort]);

  const baris = cart
    .map((c) => ({ ...c, produk: aktif.find((p) => p.id === c.id) ?? products.find((p) => p.id === c.id)! }))
    .filter((b) => b.produk);
  const qtyOf = (id: string) => cart.find((c) => c.id === id)?.qty ?? 0;

  const subtotal = baris.reduce((s, b) => s + b.produk.harga * b.qty, 0);
  const pajak = Math.round((subtotal * settings.pajakPct) / 100);
  const total = subtotal + pajak;

  function tambah(id: string) {
    setCart((prev) => prev.find((c) => c.id === id) ? prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)) : [...prev, { id, qty: 1 }]);
  }
  function kurang(id: string) {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c)).filter((c) => c.qty > 0));
  }

  function bayarSekarang() {
    if (baris.length === 0) return;
    const id = buatIdTrx();
    const d = new Date();
    const jam = d.toTimeString().slice(0, 5);
    const tanggal = d.toISOString().slice(0, 10);
    const hpp = baris.reduce((s, b) => s + b.produk.hpp * b.qty, 0);
    const lines = baris.map((b) => ({ saleId: id, productId: b.produk.id, nama: b.produk.nama, qty: b.qty, harga: b.produk.harga }));
    addSale(
      { id, cabang: activeBranch.nama, kasir: "Andi", jam, tanggal, total, hpp, laba: total - hpp, bayar, status: "LUNAS" },
      lines,
      baris.map((b) => ({ id: b.produk.id, qty: b.qty }))
    );
    // Snapshot struk SEBELUM keranjang dikosongkan (anggap pembayaran demo selalu berhasil).
    setStruk({ id, jam, meja, tipe, bayar, subtotal, pajak, total, lines: baris.map((b) => ({ nama: b.produk.nama, harga: b.produk.harga, qty: b.qty })) });
    setCart([]);
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col xl:flex-row">
      {/* ===== tengah ===== */}
      <div className="min-w-0 flex-1 px-3 pb-6 pt-3 sm:px-5">
        {/* search */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 shadow-sm">
            <span className="text-slate-400">⌕</span>
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari produk, mis. kebab beef…" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
            {cari && <button onClick={() => setCari("")} className="text-xs font-bold text-slate-400 hover:text-slate-700">✕</button>}
          </div>
          <button
            onClick={() => setSort((s) => (s === "populer" ? "murah" : s === "murah" ? "mahal" : "populer"))}
            className="press flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white text-slate-600 shadow-sm"
            title={sort === "populer" ? "Urut: populer (ketuk: termurah)" : sort === "murah" ? "Urut: termurah (ketuk: termahal)" : "Urut: termahal (ketuk: populer)"}
          >
            {sort === "populer" ? "⧩" : sort === "murah" ? "↓" : "↑"}
          </button>
        </div>

        {/* kategori */}
        <div className="no-scrollbar -mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
          {cats.map((c) => {
            const sel = kategori === c.nama;
            return (
              <button
                key={c.nama}
                onClick={() => setKategori(c.nama)}
                className={`press w-[104px] shrink-0 rounded-2xl border p-3 text-left transition ${
                  sel ? "border-[#2563EB] bg-[#EFF6FF] shadow-sm" : "border-[#E2E8F0] bg-white hover:border-[#93C5FD]"
                }`}
              >
                <span className="text-xl">{CAT_ICON[c.nama] ?? "○"}</span>
                <span className={`mt-1.5 block truncate text-[13px] font-bold ${sel ? "text-[#1D4ED8]" : "text-slate-700"}`}>{c.nama === "Semua" ? "All" : c.nama}</span>
                <span className="text-[11px] text-slate-400">{c.count} items</span>
              </button>
            );
          })}
        </div>

        {/* grid produk */}
        {daftar.length === 0 ? (
          <div className="card mt-3 p-10 text-center text-sm text-slate-500">Belum ada produk di kategori ini.</div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
            {daftar.map((p) => {
              const q = qtyOf(p.id);
              return (
                <div key={p.id} className={`card card-hover overflow-hidden p-2.5 ${q > 0 ? "ring-1 ring-[#2563EB]/40" : ""}`}>
                  <div className="relative">
                    <ProductArt kategori={p.kategori} nama={p.nama} />
                    {p.diskonPct ? (
                      <span className="absolute right-2 top-2 rounded-full bg-[#2563EB] px-2 py-0.5 text-[10px] font-black text-white">-{p.diskonPct}%</span>
                    ) : null}
                  </div>
                  <div className="px-1.5 pb-1.5 pt-2.5">
                    <p className="clamp-2 min-h-10 text-[13.5px] font-bold leading-snug">{p.nama}</p>
                    <p className="tnum mt-0.5 text-[13px] font-black text-[#1D4ED8]">{rupiah(p.harga)}</p>
                    <p className="text-[11px] text-slate-400">Stok {p.stok ?? 20} • HPP {rupiah(p.hpp)}</p>
                    {q === 0 ? (
                      <button onClick={() => tambah(p.id)} className="press mt-2 w-full rounded-xl bg-[#EFF6FF] py-2 text-[13px] font-bold text-[#1D4ED8] transition hover:bg-[#2563EB] hover:text-white">
                        Add to Dish
                      </button>
                    ) : (
                      <div className="mt-2 flex items-center justify-between rounded-xl bg-[#EFF6FF] px-2 py-1">
                        <button onClick={() => kurang(p.id)} className="press flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-bold text-[#1D4ED8] shadow-sm">−</button>
                        <span className="tnum text-sm font-black text-[#1D4ED8]">{q}</span>
                        <button onClick={() => tambah(p.id)} className="press flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-base font-bold text-white">+</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* strip meja */}
        <div className="no-scrollbar -mx-3 mt-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
          {MEJA.map((t) => {
            const sel = meja === t.id;
            return (
              <button key={t.id} onClick={() => setMeja(t.id)} className={`press flex shrink-0 items-center gap-2.5 rounded-2xl border py-2 pl-2 pr-4 text-left transition ${sel ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#93C5FD]"}`}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${sel ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-slate-600"}`}>{t.id}</span>
                <span>
                  <span className="block max-w-28 truncate text-[13px] font-bold">{t.nama}</span>
                  <span className="block text-[11px] text-slate-500">{t.items > 0 ? `${t.items} items → ${t.status}` : "Kosong"}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== panel kanan: current order ===== */}
      <div className="w-full shrink-0 border-t border-[#E2E8F0] bg-white xl:w-[380px] xl:border-l xl:border-t-0">
        <div className="sticky top-[57px] flex max-h-[calc(100vh-57px)] flex-col">
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <div>
              <h2 className="text-lg font-black tracking-tight">Meja {meja}</h2>
              <p className="text-xs text-slate-500">{activeBranch.nama} • Andi (Kasir)</p>
            </div>
            <button onClick={() => setMejaOpen(true)} className="press flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-slate-500" title="Pilih meja">✎</button>
          </div>

          <div className="px-5"><Segmented options={[...TIPE]} value={tipe} onChange={setTipe} /></div>

          <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto px-5 py-1">
            {baris.length === 0 && (
              <div className="rounded-2xl bg-[#F1F5F9] p-5 text-center text-[13px] text-slate-500">
                Keranjang kosong.<br />Ketuk <b>Add to Dish</b> untuk menambah.
              </div>
            )}
            {baris.map((b) => (
              <div key={b.id} className="flex gap-3 rounded-2xl border border-[#E2E8F0] p-2.5">
                <ProductArt kategori={b.produk.kategori} nama={b.produk.nama} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="clamp-2 text-[13px] font-bold leading-snug">{b.produk.nama}</p>
                  <p className="tnum mt-0.5 text-xs text-slate-500">{rupiah(b.produk.harga)} <span className="font-bold text-slate-700">×{b.qty}</span></p>
                  <div className="mt-1.5"><QtyStepper qty={b.qty} onMinus={() => kurang(b.id)} onPlus={() => tambah(b.id)} /></div>
                </div>
                <p className="tnum text-[13px] font-black text-[#1D4ED8]">{rupiah(b.produk.harga * b.qty)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-[#E2E8F0] px-5 py-4">
            <dl className="tnum space-y-1 text-[13px]">
              <div className="flex justify-between text-slate-500"><dt>Sub Total</dt><dd className="font-semibold text-slate-700">{rupiah(subtotal)}</dd></div>
              <div className="flex justify-between text-slate-500"><dt>Pajak {settings.pajakPct}%</dt><dd>{rupiah(pajak)}</dd></div>
              <div className="flex items-baseline justify-between pt-1"><dt className="text-sm font-bold">Total Amount</dt><dd className="text-lg font-black">{rupiah(total)}</dd></div>
            </dl>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BAYAR.map((m) => (
                <button key={m.id} onClick={() => setBayar(m.id)} className={`press rounded-2xl border py-2.5 text-center transition ${bayar === m.id ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] hover:bg-[#F1F5F9]"}`}>
                  <span className="block text-base">{m.icon}</span>
                  <span className={`block text-[11px] font-bold ${bayar === m.id ? "text-[#1D4ED8]" : "text-slate-500"}`}>{m.id}</span>
                </button>
              ))}
            </div>
            <button onClick={bayarSekarang} disabled={baris.length === 0} className="press tnum mt-3 w-full rounded-2xl bg-[#2563EB] py-3.5 text-[15px] font-black text-white shadow-sm transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40">
              Place Order • {rupiah(total)}
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">{tipe} • {bayar} • Struk otomatis tercetak</p>
          </div>
        </div>
      </div>

      <Modal open={mejaOpen} onClose={() => setMejaOpen(false)} title="Pilih meja">
        <div className="grid grid-cols-2 gap-2">
          {MEJA.map((t) => {
            const sel = meja === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setMeja(t.id); setMejaOpen(false); }}
                className={`press rounded-2xl border p-3 text-left transition ${sel ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] hover:border-[#93C5FD]"}`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-black">{t.id}</span>
                  {sel && <span className="rounded-full bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">Aktif</span>}
                </span>
                <span className="mt-0.5 block truncate text-[13px] font-bold">{t.nama}</span>
                <span className="block text-[11px] text-slate-500">{t.items > 0 ? `${t.items} items → ${t.status}` : "Kosong"}</span>
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal open={!!struk} onClose={() => setStruk(null)} title="Pembayaran berhasil ✓">
        {struk && (
          <div className="print-area mx-auto bg-white" style={{ maxWidth: settings.ukuranKertas === "58mm" ? "220px" : settings.ukuranKertas === "80mm" ? "300px" : "100%" }}>
            {settings.tampilkanLogo && (
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-sm font-black text-white print:bg-black">
                {settings.namaToko.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="mt-1 rounded-2xl bg-[#EFF6FF] p-4 text-center print:bg-white print:p-0">
              <p className="text-sm font-black">{settings.namaToko}</p>
              <p className="text-[11px] text-slate-500">{settings.alamatStruk}</p>
              {settings.strukHeader && <p className="mt-0.5 text-[11px] text-slate-600">{settings.strukHeader}</p>}
              <p className="tnum mt-1 text-xs font-bold text-[#1D4ED8]">{struk.id}</p>
              <p className="mt-0.5 text-[11px] text-slate-600">{struk.jam} • Meja {struk.meja} • {struk.tipe} • {struk.bayar} • {activeBranch.nama}</p>
              <p className="tnum mt-1 text-2xl font-black">{rupiah(struk.total)}</p>
            </div>
            <div className="tnum mt-3 space-y-1.5 text-[13px]">
              {struk.lines.map((l) => (
                <div key={l.nama} className="flex items-center justify-between">
                  <span className="font-semibold">{l.nama} <span className="text-slate-400">×{l.qty}</span></span>
                  <span className="font-bold">{rupiah(l.harga * l.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-dashed border-[#E2E8F0] pt-2 text-slate-500"><span>Subtotal</span><span>{rupiah(struk.subtotal)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Pajak {settings.pajakPct}%</span><span>{rupiah(struk.pajak)}</span></div>
              <div className="flex justify-between text-base font-black"><span>Total</span><span>{rupiah(struk.total)}</span></div>
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-400">{settings.strukFooter} • Struk tersimpan di Riwayat & Penjualan</p>
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2 print:hidden">
          <button onClick={() => window.print()} className="press rounded-2xl border border-[#2563EB] py-3 text-sm font-bold text-[#1D4ED8] hover:bg-[#EFF6FF]">🖨 Cetak struk</button>
          <button onClick={() => setStruk(null)} className="press rounded-2xl bg-[#0F172A] py-3 text-sm font-bold text-white">Pesanan baru</button>
        </div>
      </Modal>
    </div>
  );
}
