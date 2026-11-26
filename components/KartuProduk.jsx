"use client";

import { useState } from "react";
import Link from "next/link";
import TombolFavorit from "@/components/TombolFavorit";
import { useKeranjang } from "@/components/KeranjangProvider";
import { dapatkanInfoHarga, formatRupiah } from "@/lib/format";
import { ambilFotoUtama } from "@/lib/foto";

export default function KartuProduk({ produk }) {
  const { tambahItem } = useKeranjang();
  const [baruDitambah, setBaruDitambah] = useState(false);

  const fotoUtama = ambilFotoUtama(produk.foto_url);
  const habis = typeof produk.stok === "number" && produk.stok <= 0;
  const { adaDiskon, hargaAktif, hargaCoret } = dapatkanInfoHarga(produk);

  function tanganiTambahKeranjang() {
    if (habis) return;
    tambahItem(produk, 1, "");
    setBaruDitambah(true);
    setTimeout(() => setBaruDitambah(false), 1200);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar">
      <Link href={`/produk/${produk.id}`} className="flex flex-1 flex-col">
        <div className="relative">
          <img
            src={fotoUtama}
            alt={produk.nama}
            className={`aspect-square w-full bg-permukaan object-cover ${habis ? "opacity-60 grayscale-[30%]" : ""}`}
          />
          {habis && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-bahaya px-2 py-0.5 text-xs font-bold text-white">
              Habis
            </span>
          )}
          {produk.badge && (
            <span
              className={`absolute right-2.5 top-2.5 rounded-md px-2 py-0.5 text-xs font-bold text-white ${
                produk.badge === "Terlaris" ? "bg-harga" : "bg-utama"
              }`}
            >
              {produk.badge}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <p className="text-xs text-teks-lembut">{produk.kategori}</p>
          <h3 className="font-semibold leading-snug group-hover:text-utama">{produk.nama}</h3>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <p className="rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
              {formatRupiah(hargaAktif)}
            </p>
            {adaDiskon && (
              <p className="text-xs text-teks-lembut line-through">{formatRupiah(hargaCoret)}</p>
            )}
            {habis && (
              <span className="rounded-md bg-bahaya/10 px-2 py-0.5 text-xs font-semibold text-bahaya">
                Habis
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 border-t border-garis p-3 pt-2.5">
        <button
          type="button"
          onClick={tanganiTambahKeranjang}
          disabled={habis}
          className="flex-1 rounded-lg border border-utama px-3 py-1.5 text-xs font-semibold text-utama transition-colors hover:bg-utama hover:text-white disabled:cursor-not-allowed disabled:border-garis disabled:bg-permukaan disabled:text-teks-lembut"
        >
          {habis ? "Stok habis" : baruDitambah ? "Ditambahkan!" : "Tambah ke keranjang"}
        </button>
        <TombolFavorit produk={produk} />
      </div>
    </article>
  );
}
