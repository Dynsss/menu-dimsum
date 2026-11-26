"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dapatkanInfoHarga } from "@/lib/format";
import { ambilFotoUtama } from "@/lib/foto";

const KUNCI_STORAGE = "dynss-keranjang-v1";

const KeranjangContext = createContext(null);

export function KeranjangProvider({ children }) {
  const [items, setItems] = useState([]);
  const [sudahDimuat, setSudahDimuat] = useState(false);

  useEffect(() => {
    try {
      const tersimpan = localStorage.getItem(KUNCI_STORAGE);
      if (tersimpan) {
        const parsed = JSON.parse(tersimpan);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((item) => item && item.id && item.jumlah > 0));
        }
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia atau data rusak
    } finally {
      setSudahDimuat(true);
    }
  }, []);

  useEffect(() => {
    if (!sudahDimuat) return;
    try {
      localStorage.setItem(KUNCI_STORAGE, JSON.stringify(items));
    } catch {
      // Abaikan jika gagal menyimpan ke localStorage
    }
  }, [items, sudahDimuat]);

  function tambahItem(produk, jumlah = 1, catatan = "") {
    if (!produk?.id) return;
    if (typeof produk.stok === "number" && produk.stok <= 0) return;

    const jumlahTambah = Math.max(1, Math.floor(Number(jumlah) || 1));
    const catatanRapi = String(catatan ?? "").trim();
    const key = `${produk.id}::${catatanRapi}`;
    const { hargaAktif } = dapatkanInfoHarga(produk);
    const fotoUtama = ambilFotoUtama(produk.foto_url);
    const batasStok = typeof produk.stok === "number" && produk.stok > 0 ? produk.stok : 999;

    setItems((prev) => {
      const indeksAda = prev.findIndex((item) => item.key === key);
      if (indeksAda >= 0) {
        return prev.map((item, idx) =>
          idx === indeksAda
            ? {
                ...item,
                harga: hargaAktif,
                jumlah: Math.min(batasStok, item.jumlah + jumlahTambah),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          key,
          id: produk.id,
          nama: produk.nama,
          harga: hargaAktif,
          foto_url: fotoUtama,
          kategori: produk.kategori ?? "",
          catatan: catatanRapi,
          jumlah: Math.min(batasStok, jumlahTambah),
          stok: typeof produk.stok === "number" ? produk.stok : null,
        },
      ];
    });
  }

  function ubahJumlah(key, jumlahBaru) {
    const angka = Math.floor(Number(jumlahBaru) || 0);
    if (angka <= 0) {
      hapusItem(key);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const batasStok = typeof item.stok === "number" && item.stok > 0 ? item.stok : 999;
        return {
          ...item,
          jumlah: Math.min(batasStok, Math.max(1, angka)),
        };
      })
    );
  }

  function hapusItem(key) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  function kosongkanKeranjang() {
    setItems([]);
  }

  const totalItem = useMemo(
    () => items.reduce((total, item) => total + item.jumlah, 0),
    [items]
  );

  const totalHarga = useMemo(
    () => items.reduce((total, item) => total + item.harga * item.jumlah, 0),
    [items]
  );

  const value = {
    items,
    sudahDimuat,
    totalItem,
    totalHarga,
    tambahItem,
    ubahJumlah,
    hapusItem,
    kosongkanKeranjang,
  };

  return <KeranjangContext.Provider value={value}>{children}</KeranjangContext.Provider>;
}

export function useKeranjang() {
  const ctx = useContext(KeranjangContext);
  if (!ctx) {
    throw new Error("useKeranjang harus digunakan di dalam KeranjangProvider.");
  }
  return ctx;
}
