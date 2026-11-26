"use client";

import { createContext, useContext, useEffect, useState } from "react";

const KUNCI_STORAGE = "dynss-favorit-v1";

const FavoritContext = createContext(null);

export function FavoritProvider({ children }) {
  const [favoritItems, setFavoritItems] = useState([]);
  const [sudahDimuat, setSudahDimuat] = useState(false);

  useEffect(() => {
    try {
      const tersimpan = localStorage.getItem(KUNCI_STORAGE);
      if (tersimpan) {
        const parsed = JSON.parse(tersimpan);
        if (Array.isArray(parsed)) {
          setFavoritItems(parsed.filter((item) => item && item.id));
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
      localStorage.setItem(KUNCI_STORAGE, JSON.stringify(favoritItems));
    } catch {
      // Abaikan jika gagal menyimpan ke localStorage
    }
  }, [favoritItems, sudahDimuat]);

  function apakahFavorit(id) {
    return favoritItems.some((item) => String(item.id) === String(id));
  }

  function toggleFavorit(produk) {
    if (!produk?.id) return;

    setFavoritItems((prev) => {
      const sudahAda = prev.some((item) => String(item.id) === String(produk.id));
      if (sudahAda) {
        return prev.filter((item) => String(item.id) !== String(produk.id));
      }

      return [
        {
          id: produk.id,
          nama: produk.nama,
          harga: produk.harga,
          harga_diskon: produk.harga_diskon ?? null,
          badge: produk.badge ?? null,
          foto_url: produk.foto_url ?? "",
          kategori: produk.kategori ?? "",
          stok: typeof produk.stok === "number" ? produk.stok : null,
        },
        ...prev,
      ];
    });
  }

  const value = {
    favoritItems,
    totalFavorit: favoritItems.length,
    sudahDimuat,
    apakahFavorit,
    toggleFavorit,
  };

  return <FavoritContext.Provider value={value}>{children}</FavoritContext.Provider>;
}

export function useFavorit() {
  const ctx = useContext(FavoritContext);
  if (!ctx) {
    throw new Error("useFavorit harus digunakan di dalam FavoritProvider.");
  }
  return ctx;
}
