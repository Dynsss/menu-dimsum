"use client";

import { useEffect } from "react";

export const KUNCI_TERAKHIR_DILIHAT = "dynss-terakhir-dilihat-v1";
export const MAKS_TERAKHIR_DILIHAT = 6;

export default function CatatTerakhirDilihat({ produk }) {
  useEffect(() => {
    if (!produk?.id) return;

    try {
      const mentah = localStorage.getItem(KUNCI_TERAKHIR_DILIHAT);
      const daftarLama = mentah ? JSON.parse(mentah) : [];
      const daftarValid = Array.isArray(daftarLama)
        ? daftarLama.filter((item) => item && item.id && String(item.id) !== String(produk.id))
        : [];

      const entriBaru = {
        id: produk.id,
        nama: produk.nama,
        harga: produk.harga,
        harga_diskon: produk.harga_diskon ?? null,
        badge: produk.badge ?? null,
        foto_url: produk.foto_url ?? "",
        kategori: produk.kategori ?? "",
        stok: typeof produk.stok === "number" ? produk.stok : null,
      };

      const daftarBaru = [entriBaru, ...daftarValid].slice(0, MAKS_TERAKHIR_DILIHAT);
      localStorage.setItem(KUNCI_TERAKHIR_DILIHAT, JSON.stringify(daftarBaru));
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }, [produk]);

  return null;
}
