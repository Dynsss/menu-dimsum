"use client";

import { useBandingkan } from "@/components/BandingkanProvider";

export default function TombolBandingkan({ produk, varian = "kecil" }) {
  const { apakahDibandingkan, toggleBandingkan } = useBandingkan();
  const terpilih = apakahDibandingkan(produk?.id);

  if (varian === "tombol") {
    return (
      <button
        type="button"
        onClick={() => toggleBandingkan(produk)}
        aria-pressed={terpilih}
        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
          terpilih
            ? "border-utama bg-utama text-white"
            : "border-garis bg-permukaan text-teks hover:border-utama hover:text-utama"
        }`}
      >
        {terpilih ? "Dipilih untuk dibandingkan" : "Bandingkan produk"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleBandingkan(produk)}
      aria-pressed={terpilih}
      title={terpilih ? "Hapus dari perbandingan" : "Pilih untuk dibandingkan"}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
        terpilih
          ? "border-utama bg-utama text-white"
          : "border-garis bg-permukaan text-teks hover:border-utama hover:text-utama"
      }`}
    >
      {terpilih ? "Dibandingkan" : "Bandingkan"}
    </button>
  );
}
