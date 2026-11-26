"use client";

import Link from "next/link";
import { useBandingkan } from "@/components/BandingkanProvider";

export default function BilahBandingkan() {
  const {
    daftarBandingkan,
    pesanBatas,
    bersihkanPesanBatas,
    hapusBandingkan,
    kosongkanBandingkan,
  } = useBandingkan();

  if (daftarBandingkan.length === 0 && !pesanBatas) {
    return null;
  }

  const siapBandingkan = daftarBandingkan.length === 2;
  const tautanBandingkan = siapBandingkan
    ? `/bandingkan?ids=${daftarBandingkan.map((item) => item.id).join(",")}`
    : "/bandingkan";

  return (
    <aside
      aria-label="Perbandingan produk"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-garis bg-latar/95 shadow-lg backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3">
        {pesanBatas && (
          <div
            role="alert"
            className="flex items-center justify-between gap-2 rounded-lg border border-bahaya/30 bg-bahaya/10 px-3 py-2 text-xs font-medium text-bahaya"
          >
            <span>{pesanBatas}</span>
            <button
              type="button"
              onClick={bersihkanPesanBandingkan}
              className="shrink-0 font-bold underline underline-offset-2"
            >
              Tutup
            </button>
          </div>
        )}

        {daftarBandingkan.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-teks-lembut">
                Bandingkan ({daftarBandingkan.length}/2):
              </span>
              {daftarBandingkan.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-garis bg-permukaan px-3 py-1 text-xs font-semibold text-teks"
                >
                  <span className="max-w-[140px] truncate">{item.nama}</span>
                  <button
                    type="button"
                    onClick={() => hapusBandingkan(item.id)}
                    aria-label={`Hapus ${item.nama} dari perbandingan`}
                    className="text-teks-lembut hover:text-bahaya"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={kosongkanBandingkan}
                className="rounded-lg border border-garis px-3 py-1.5 text-xs font-semibold text-teks-lembut hover:border-bahaya hover:text-bahaya"
              >
                Kosongkan
              </button>
              {siapBandingkan ? (
                <Link
                  href={tautanBandingkan}
                  className="rounded-lg bg-utama px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-utama-gelap"
                >
                  Bandingkan sekarang
                </Link>
              ) : (
                <span className="rounded-lg bg-permukaan px-3 py-1.5 text-xs text-teks-lembut">
                  Pilih 1 produk lagi
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
