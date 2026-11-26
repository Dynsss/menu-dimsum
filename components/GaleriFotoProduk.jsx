"use client";

import { useState } from "react";

export default function GaleriFotoProduk({ daftarFoto = [], nama }) {
  const [indeksAktif, setIndeksAktif] = useState(0);

  if (daftarFoto.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-garis bg-permukaan text-sm text-teks-lembut">
        Tanpa foto
      </div>
    );
  }

  const indeksAman = indeksAktif < daftarFoto.length ? indeksAktif : 0;
  const fotoUtama = daftarFoto[indeksAman];

  return (
    <div className="flex flex-col gap-3">
      <img
        src={fotoUtama}
        alt={daftarFoto.length > 1 ? `${nama} - foto ${indeksAman + 1}` : nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />

      {daftarFoto.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Galeri foto produk">
          {daftarFoto.map((url, indeks) => {
            const aktif = indeks === indeksAman;
            return (
              <button
                key={`${url}-${indeks}`}
                type="button"
                onClick={() => setIndeksAktif(indeks)}
                aria-label={`Lihat foto ${indeks + 1}`}
                aria-pressed={aktif}
                className={`overflow-hidden rounded-xl border transition-all ${
                  aktif
                    ? "border-utama ring-2 ring-utama/30"
                    : "border-garis opacity-75 hover:opacity-100"
                }`}
              >
                <img
                  src={url}
                  alt={`${nama} gambar kecil ${indeks + 1}`}
                  className="h-16 w-16 bg-permukaan object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
