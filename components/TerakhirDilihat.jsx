"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";
import { KUNCI_TERAKHIR_DILIHAT } from "@/components/CatatTerakhirDilihat";

export default function TerakhirDilihat({ daftarIdAktif = [] }) {
  const [daftarProduk, setDaftarProduk] = useState([]);

  useEffect(() => {
    try {
      const mentah = localStorage.getItem(KUNCI_TERAKHIR_DILIHAT);
      if (!mentah) return;
      const parsed = JSON.parse(mentah);
      if (Array.isArray(parsed)) {
        const setIdAktif = new Set(daftarIdAktif.map(String));
        const tersaring = parsed.filter(
          (item) => item && item.id && setIdAktif.has(String(item.id))
        );
        setDaftarProduk(tersaring);
        if (tersaring.length !== parsed.length) {
          localStorage.setItem(KUNCI_TERAKHIR_DILIHAT, JSON.stringify(tersaring));
        }
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia atau data rusak
    }
  }, [daftarIdAktif]);

  if (daftarProduk.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="judul-terakhir-dilihat"
      className="mt-10 flex flex-col gap-4 border-t border-garis pt-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="judul-terakhir-dilihat" className="text-xl font-bold">
          Terakhir dilihat
        </h2>
        <button
          type="button"
          onClick={() => {
            setDaftarProduk([]);
            try {
              localStorage.removeItem(KUNCI_TERAKHIR_DILIHAT);
            } catch {
              // Abaikan
            }
          }}
          className="text-xs font-semibold text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          Hapus riwayat
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {daftarProduk.map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>
    </section>
  );
}
