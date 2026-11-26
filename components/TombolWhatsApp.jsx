"use client";

import Link from "next/link";
import { useState } from "react";
import { useKeranjang } from "@/components/KeranjangProvider";
import { dapatkanInfoHarga, formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export default function TombolWhatsApp({ produk }) {
  const { tambahItem } = useKeranjang();
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [baruDitambah, setBaruDitambah] = useState(false);

  const habis = typeof produk.stok === "number" && produk.stok <= 0;
  const batasMaks =
    typeof produk.stok === "number" && produk.stok > 0 ? Math.min(999, produk.stok) : 999;

  if (habis) {
    return (
      <div className="flex flex-col gap-3 pt-2">
        <p className="rounded-lg border border-bahaya/30 bg-bahaya/5 px-4 py-3 text-sm font-medium text-bahaya">
          Stok produk ini sedang habis dan belum dapat dipesan.
        </p>
        <div>
          <button
            type="button"
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-garis px-5 py-3 font-semibold text-teks-lembut sm:w-auto"
          >
            Stok habis
          </button>
        </div>
      </div>
    );
  }

  const { hargaAktif } = dapatkanInfoHarga(produk);
  const jumlahValid = Math.min(
    batasMaks,
    Math.max(1, Number.isFinite(jumlah) ? Math.floor(jumlah) : 1)
  );
  const totalHarga = hargaAktif * jumlahValid;
  const catatanRapi = catatan.trim();

  const nomor = String(toko.nomorWhatsApp).replace(/\D/g, "");
  const pesan =
    `Halo ${toko.nama}, saya ingin memesan ${produk.nama} (${formatRupiah(hargaAktif)}) sebanyak ${jumlahValid}x (Total: ${formatRupiah(totalHarga)}).` +
    (catatanRapi ? ` Varian/catatan: ${catatanRapi}.` : "");
  const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  function ubahJumlah(nilaiBaru) {
    if (nilaiBaru === "") {
      setJumlah(1);
      return;
    }
    const angka = parseInt(nilaiBaru, 10);
    if (!Number.isNaN(angka)) {
      setJumlah(Math.min(999, Math.max(1, angka)));
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="jumlah-pesan" className="text-sm font-medium text-teks">
            Jumlah
          </label>
          <div className="inline-flex items-center overflow-hidden rounded-lg border border-garis bg-latar">
            <button
              type="button"
              onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
              disabled={jumlahValid <= 1}
              aria-label="Kurangi jumlah"
              className="flex h-10 w-10 items-center justify-center bg-permukaan text-lg font-semibold text-teks transition-colors hover:bg-garis disabled:cursor-not-allowed disabled:opacity-40"
            >
              -
            </button>
            <input
              id="jumlah-pesan"
              type="number"
              min={1}
              max={999}
              value={jumlahValid}
              onChange={(e) => ubahJumlah(e.target.value)}
              className="h-10 w-14 border-x border-garis bg-latar text-center text-sm font-semibold text-teks focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setJumlah((prev) => Math.min(999, prev + 1))}
              aria-label="Tambah jumlah"
              className="flex h-10 w-10 items-center justify-center bg-permukaan text-lg font-semibold text-teks transition-colors hover:bg-garis"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-teks-lembut">Total harga</span>
          <span className="rounded-md bg-harga-latar px-2.5 py-1 text-base font-bold text-harga">
            {formatRupiah(totalHarga)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="catatan-varian" className="text-sm font-medium text-teks">
          Varian / catatan <span className="font-normal text-teks-lembut">(opsional)</span>
        </label>
        <input
          id="catatan-varian"
          type="text"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          maxLength={120}
          placeholder="Contoh: Pedas, original, tanpa saus"
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut/70 focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            tambahItem(produk, jumlahValid, catatanRapi);
            setBaruDitambah(true);
            setTimeout(() => setBaruDitambah(false), 2000);
          }}
          className="inline-flex w-full items-center justify-center rounded-lg border border-utama bg-latar px-5 py-3 font-semibold text-utama transition-colors hover:bg-utama hover:text-white sm:w-auto"
        >
          {baruDitambah ? "Ditambahkan ke keranjang!" : "Tambah ke keranjang"}
        </button>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition-colors hover:bg-utama-gelap sm:w-auto"
        >
          Pesan via WhatsApp
        </a>
      </div>

      {baruDitambah && (
        <p className="text-sm text-utama">
          Produk ditambahkan.{" "}
          <Link href="/keranjang" className="font-semibold underline underline-offset-4">
            Lihat keranjang
          </Link>
        </p>
      )}
    </div>
  );
}
