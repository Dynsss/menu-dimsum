"use client";

import { useMemo, useState } from "react";
import KartuProduk from "@/components/KartuProduk";

export default function FilterKatalog({ daftarProduk }) {
  const [kategoriAktif, setKategoriAktif] = useState("Semua");

  // Ambil daftar kategori unik dari data produk
  const daftarKategori = useMemo(() => {
    const unik = [...new Set(daftarProduk.map((p) => p.kategori).filter(Boolean))];
    unik.sort((a, b) => a.localeCompare(b, "id"));
    return ["Semua", ...unik];
  }, [daftarProduk]);

  // Filter produk berdasarkan kategori yang dipilih
  const produkFiltered = useMemo(() => {
    if (kategoriAktif === "Semua") return daftarProduk;
    return daftarProduk.filter((p) => p.kategori === kategoriAktif);
  }, [daftarProduk, kategoriAktif]);

  return (
    <>
      {/* Tombol-tombol filter kategori */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
        {daftarKategori.map((kat) => (
          <button
            key={kat}
            onClick={() => setKategoriAktif(kat)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              kategoriAktif === kat
                ? "border-utama bg-utama text-white"
                : "border-garis bg-permukaan text-teks-lembut hover:border-utama hover:text-utama"
            }`}
          >
            {kat}
          </button>
        ))}
      </div>

      {/* Grid produk */}
      {produkFiltered.length === 0 ? (
        <p className="rounded-lg border border-garis bg-permukaan px-4 py-6 text-sm text-teks-lembut">
          Tidak ada produk dalam kategori ini
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {produkFiltered.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </>
  );
}
