"use client";

import { useFavorit } from "@/components/FavoritProvider";

export default function TombolFavorit({ produk, varian = "ikon" }) {
  const { apakahFavorit, toggleFavorit } = useFavorit();
  const aktif = apakahFavorit(produk.id);

  if (varian === "tombol") {
    return (
      <button
        type="button"
        onClick={() => toggleFavorit(produk)}
        aria-pressed={aktif}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
          aktif
            ? "border-bahaya/40 bg-bahaya/10 text-bahaya"
            : "border-garis bg-permukaan text-teks hover:border-bahaya/40 hover:text-bahaya"
        }`}
      >
        <span aria-hidden="true">{aktif ? "♥" : "♡"}</span>
        <span>{aktif ? "Tersimpan di favorit" : "Tambah ke favorit"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleFavorit(produk)}
      aria-pressed={aktif}
      aria-label={aktif ? `Hapus ${produk.nama} dari favorit` : `Simpan ${produk.nama} ke favorit`}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-base transition-colors ${
        aktif
          ? "border-bahaya/40 bg-bahaya/10 text-bahaya"
          : "border-garis bg-permukaan text-teks-lembut hover:border-bahaya/40 hover:text-bahaya"
      }`}
    >
      <span aria-hidden="true">{aktif ? "♥" : "♡"}</span>
    </button>
  );
}
