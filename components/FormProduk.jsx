"use client";

import { useActionState, useEffect, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

const aksiBawaan = async () => ({ error: null });

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, action, labelTombol }) {
  const [state, formAction, sedangMemproses] = useActionState(action ?? aksiBawaan, {
    error: null,
    nilai: null,
  });
  const [pratinjauFoto, setPratinjauFoto] = useState(null);
  const [errorFotoLokal, setErrorFotoLokal] = useState(null);

  useEffect(() => {
    return () => {
      if (pratinjauFoto) {
        URL.revokeObjectURL(pratinjauFoto);
      }
    };
  }, [pratinjauFoto]);

  function tanganiPilihFoto(event) {
    const file = event.target.files?.[0];

    if (pratinjauFoto) {
      URL.revokeObjectURL(pratinjauFoto);
    }

    if (!file) {
      setPratinjauFoto(null);
      setErrorFotoLokal(null);
      return;
    }

    const tipeValid = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);
    if (!tipeValid) {
      setErrorFotoLokal("Format foto harus berupa JPG, PNG, WebP, atau GIF.");
      setPratinjauFoto(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorFotoLokal("Ukuran foto maksimal 5 MB.");
      setPratinjauFoto(null);
      return;
    }

    setErrorFotoLokal(null);
    setPratinjauFoto(URL.createObjectURL(file));
  }

  const nilai = state?.nilai ?? {};
  const fotoDitampilkan = pratinjauFoto || produk.foto_url || null;
  const pesanError = errorFotoLokal || state?.error;

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <Input
        label="Nama produk"
        name="nama"
        defaultValue={nilai.nama ?? produk.nama ?? ""}
        placeholder="Contoh: Dimsum Ayam Udang (4 pcs)"
        required
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="1"
        step="1"
        defaultValue={nilai.harga ?? produk.harga ?? ""}
        placeholder="Contoh: 18000"
        required
      />
      <Input
        label="Kategori"
        name="kategori"
        defaultValue={nilai.kategori ?? produk.kategori ?? ""}
        placeholder="Contoh: Dimsum Kukus"
        required
      />

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Foto produk
          <input
            type="file"
            name="foto"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={tanganiPilihFoto}
            required={!produk.foto_url}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-normal text-teks file:mr-3 file:rounded-md file:border-0 file:bg-permukaan file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-teks hover:file:bg-garis focus:border-utama focus:outline-none"
          />
        </label>
        <p className="text-xs text-teks-lembut">
          Unggah gambar berformat JPG, PNG, WebP, atau GIF dengan ukuran maksimal 5 MB.
        </p>
        {fotoDitampilkan && (
          <img
            src={fotoDitampilkan}
            alt="Pratinjau foto produk"
            className="h-32 w-32 rounded-xl border border-garis bg-permukaan object-cover"
          />
        )}
      </div>

      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        defaultValue={nilai.deskripsi ?? produk.deskripsi ?? ""}
        placeholder="Tuliskan deskripsi singkat produk..."
        required
      />

      {pesanError && (
        <p
          role="alert"
          className="rounded-lg border border-bahaya/30 bg-bahaya/5 px-3 py-2 text-sm text-bahaya"
        >
          {pesanError}
        </p>
      )}

      <div className="flex gap-3">
        <Tombol type="submit" disabled={sedangMemproses || Boolean(errorFotoLokal)}>
          {sedangMemproses ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
