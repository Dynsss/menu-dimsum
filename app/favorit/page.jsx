"use client";

import Link from "next/link";
import { useFavorit } from "@/components/FavoritProvider";
import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";

export default function HalamanFavorit() {
  const { favoritItems, totalFavorit, sudahDimuat } = useFavorit();

  if (!sudahDimuat) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <h1 className="text-2xl font-extrabold">Produk Favorit</h1>
        <div className="h-24 animate-pulse rounded-2xl border border-garis bg-permukaan" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <div>
        <Link
          href="/"
          className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          Kembali ke katalog
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold">Produk Favorit ({totalFavorit})</h1>
      </div>

      {favoritItems.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-garis bg-permukaan p-6">
          <p className="text-sm text-teks-lembut">
            Belum ada produk favorit. Tekan tombol hati pada produk yang kamu suka untuk menyimpannya.
          </p>
          <Tombol href="/">Lihat katalog</Tombol>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {favoritItems.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </div>
  );
}
