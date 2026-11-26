"use client";

import { createContext, useContext, useEffect, useState } from "react";

const KUNCI_STORAGE = "dynss-bandingkan-v1";
const MAKS_BANDINGKAN = 2;

const BandingkanContext = createContext(null);

export function BandingkanProvider({ children }) {
  const [daftarBandingkan, setDaftarBandingkan] = useState([]);
  const [pesanBatas, setPesanBatas] = useState("");
  const [sudahDimuat, setSudahDimuat] = useState(false);

  useEffect(() => {
    try {
      const tersimpan = localStorage.getItem(KUNCI_STORAGE);
      if (tersimpan) {
        const parsed = JSON.parse(tersimpan);
        if (Array.isArray(parsed)) {
          setDaftarBandingkan(parsed.filter((item) => item && item.id).slice(0, MAKS_BANDINGKAN));
        }
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    } finally {
      setSudahDimuat(true);
    }
  }, []);

  useEffect(() => {
    if (!sudahDimuat) return;
    try {
      localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftarBandingkan));
    } catch {
      // Abaikan
    }
  }, [daftarBandingkan, sudahDimuat]);

  useEffect(() => {
    if (!pesanBatas) return;
    const timer = setTimeout(() => setPesanBatas(""), 4000);
    return () => clearTimeout(timer);
  }, [pesanBatas]);

  function apakahDibandingkan(id) {
    return daftarBandingkan.some((item) => String(item.id) === String(id));
  }

  function toggleBandingkan(produk) {
    if (!produk?.id) return;

    const sudahAda = daftarBandingkan.some((item) => String(item.id) === String(produk.id));
    if (sudahAda) {
      setPesanBatas("");
      setDaftarBandingkan((prev) => prev.filter((item) => String(item.id) !== String(produk.id)));
      return;
    }

    if (daftarBandingkan.length >= MAKS_BANDINGKAN) {
      setPesanBatas(
        "Maksimal 2 produk dapat dibandingkan sekaligus. Hapus salah satu produk terlebih dahulu."
      );
      return;
    }

    setPesanBatas("");
    setDaftarBandingkan((prev) => [
      ...prev,
      {
        id: produk.id,
        nama: produk.nama,
        foto_url: produk.foto_url ?? "",
        kategori: produk.kategori ?? "",
      },
    ]);
  }

  function hapusBandingkan(id) {
    setPesanBatas("");
    setDaftarBandingkan((prev) => prev.filter((item) => String(item.id) !== String(id)));
  }

  function kosongkanBandingkan() {
    setPesanBatas("");
    setDaftarBandingkan([]);
  }

  const value = {
    daftarBandingkan,
    pesanBatas,
    bersihkanPesanBatas: () => setPesanBatas(""),
    apakahDibandingkan,
    toggleBandingkan,
    hapusBandingkan,
    kosongkanBandingkan,
  };

  return <BandingkanContext.Provider value={value}>{children}</BandingkanContext.Provider>;
}

export function useBandingkan() {
  const ctx = useContext(BandingkanContext);
  if (!ctx) {
    throw new Error("useBandingkan harus digunakan di dalam BandingkanProvider.");
  }
  return ctx;
}
