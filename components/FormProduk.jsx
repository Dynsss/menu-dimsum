"use client";

import { useActionState, useEffect, useState } from "react";
import { buatDeskripsiAI } from "@/app/admin/actions";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { ambilDaftarFoto } from "@/lib/foto";

const aksiBawaan = async () => ({ error: null });

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, action, labelTombol }) {
  const [state, formAction, sedangMemproses] = useActionState(action ?? aksiBawaan, {
    error: null,
    nilai: null,
  });
  const [nama, setNama] = useState(produk.nama ?? "");
  const [kategori, setKategori] = useState(produk.kategori ?? "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi ?? "");
  const [sedangBuatAI, setSedangBuatAI] = useState(false);
  const [errorAI, setErrorAI] = useState(null);
  const [pratinjauFoto, setPratinjauFoto] = useState([]);
  const [errorFotoLokal, setErrorFotoLokal] = useState(null);

  useEffect(() => {
    if (state?.nilai) {
      setNama(state.nilai.nama ?? "");
      setKategori(state.nilai.kategori ?? "");
      setDeskripsi(state.nilai.deskripsi ?? "");
    }
  }, [state]);

  useEffect(() => {
    return () => {
      pratinjauFoto.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pratinjauFoto]);

  async function tanganiBuatDeskripsiAI() {
    if (!nama.trim() || !kategori.trim()) {
      setErrorAI("Isi nama produk dan kategori terlebih dahulu untuk membuat deskripsi otomatis.");
      return;
    }

    setErrorAI(null);
    setSedangBuatAI(true);
    try {
      const hasil = await buatDeskripsiAI({ nama, kategori });
      if (hasil?.error) {
        setErrorAI(hasil.error);
        return;
      }
      if (hasil?.deskripsi) {
        setDeskripsi(hasil.deskripsi);
      }
    } catch {
      setErrorAI("Gagal membuat deskripsi dengan AI. Coba lagi.");
    } finally {
      setSedangBuatAI(false);
    }
  }

  function tanganiPilihFoto(event) {
    const files = Array.from(event.target.files ?? []);

    pratinjauFoto.forEach((url) => URL.revokeObjectURL(url));

    if (files.length === 0) {
      setPratinjauFoto([]);
      setErrorFotoLokal(null);
      return;
    }

    if (files.length > 5) {
      setErrorFotoLokal("Maksimal 5 foto per produk.");
      setPratinjauFoto([]);
      return;
    }

    const tipeValid = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    for (const file of files) {
      if (!tipeValid.includes(file.type)) {
        setErrorFotoLokal("Format semua foto harus berupa JPG, PNG, WebP, atau GIF.");
        setPratinjauFoto([]);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorFotoLokal("Ukuran setiap foto maksimal 5 MB.");
        setPratinjauFoto([]);
        return;
      }
    }

    setErrorFotoLokal(null);
    setPratinjauFoto(files.map((file) => URL.createObjectURL(file)));
  }

  const nilai = state?.nilai ?? {};
  const daftarFotoLama = ambilDaftarFoto(produk.foto_url);
  const fotoDitampilkan = pratinjauFoto.length > 0 ? pratinjauFoto : daftarFotoLama;
  const pesanError = errorFotoLokal || errorAI || state?.error;

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <Input
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
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
        label="Stok"
        name="stok"
        type="number"
        min="0"
        step="1"
        defaultValue={nilai.stok ?? produk.stok ?? 10}
        placeholder="Contoh: 10 (isi 0 jika habis)"
        required
      />
      <Input
        label="Kategori"
        name="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
        placeholder="Contoh: Dimsum Kukus"
        required
      />

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Foto produk (bisa pilih lebih dari satu)
          <input
            type="file"
            name="foto"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={tanganiPilihFoto}
            required={daftarFotoLama.length === 0}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-normal text-teks file:mr-3 file:rounded-md file:border-0 file:bg-permukaan file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-teks hover:file:bg-garis focus:border-utama focus:outline-none"
          />
        </label>
        <p className="text-xs text-teks-lembut">
          Unggah 1 sampai 5 gambar berformat JPG, PNG, WebP, atau GIF (maksimal 5 MB per foto). Foto pertama menjadi foto utama.
        </p>
        {fotoDitampilkan.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {fotoDitampilkan.map((url, indeks) => (
              <img
                key={`${url}-${indeks}`}
                src={url}
                alt={`Pratinjau foto produk ${indeks + 1}`}
                className="h-24 w-24 rounded-xl border border-garis bg-permukaan object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="deskripsi-produk" className="text-sm font-semibold">
            Deskripsi
          </label>
          <button
            type="button"
            onClick={tanganiBuatDeskripsiAI}
            disabled={sedangBuatAI || sedangMemproses}
            className="rounded-lg border border-utama px-3 py-1.5 text-xs font-semibold text-utama transition-colors hover:bg-utama hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sedangBuatAI ? "Membuat deskripsi..." : "Buat deskripsi dengan AI"}
          </button>
        </div>
        <textarea
          id="deskripsi-produk"
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Tuliskan deskripsi singkat produk..."
          required
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
        <p className="text-xs text-teks-lembut">
          Isi nama produk dan kategori, lalu klik tombol di atas untuk membuat deskripsi otomatis dengan Gemini AI.
        </p>
      </div>

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
