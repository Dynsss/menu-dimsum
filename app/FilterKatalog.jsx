"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";

function buatUrlKatalog({ kategori, urut, halaman }) {
  const params = new URLSearchParams();
  if (kategori) params.set("kategori", kategori);
  if (urut) params.set("urut", urut);
  if (halaman && halaman > 1) params.set("halaman", String(halaman));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default function FilterKatalog({
  daftarProduk,
  daftarKategori = [],
  kategoriAktif = "",
  urutAktif = "",
  halamanAktif = 1,
  totalHalaman = 1,
  totalProduk = 0,
}) {
  const router = useRouter();
  const pilihanKategori = ["Semua", ...daftarKategori];

  function tanganiPilihKategori(kat) {
    const kategoriBaru = kat === "Semua" ? "" : kat;
    router.push(
      buatUrlKatalog({ kategori: kategoriBaru, urut: urutAktif, halaman: 1 }),
      { scroll: false }
    );
  }

  function tanganiUbahUrutan(event) {
    router.push(
      buatUrlKatalog({ kategori: kategoriAktif, urut: event.target.value, halaman: 1 }),
      { scroll: false }
    );
  }

  return (
    <>
      {/* Toolbar filter kategori dan urutan produk */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
          {pilihanKategori.map((kat) => {
            const aktif = kat === "Semua" ? !kategoriAktif : kategoriAktif === kat;
            return (
              <button
                key={kat}
                type="button"
                onClick={() => tanganiPilihKategori(kat)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  aktif
                    ? "border-utama bg-utama text-white"
                    : "border-garis bg-permukaan text-teks-lembut hover:border-utama hover:text-utama"
                }`}
              >
                {kat}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-sm text-teks-lembut sm:shrink-0">
          <span className="font-medium text-teks">Urutkan:</span>
          <select
            aria-label="Urutkan produk"
            value={urutAktif}
            onChange={tanganiUbahUrutan}
            className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-medium text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Bawaan</option>
            <option value="termurah">Termurah</option>
            <option value="termahal">Termahal</option>
            <option value="terbaru">Terbaru</option>
          </select>
        </label>
      </div>

      {/* Grid produk */}
      {daftarProduk.length === 0 ? (
        <p className="rounded-lg border border-garis bg-permukaan px-4 py-6 text-sm text-teks-lembut">
          Tidak ada produk dalam kategori ini
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {daftarProduk.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}

      {/* Navigasi paginasi */}
      {totalHalaman > 1 && (
        <nav
          aria-label="Paginasi produk"
          className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-garis pt-5 sm:flex-row"
        >
          <p className="text-sm text-teks-lembut">
            Halaman {halamanAktif} dari {totalHalaman} ({totalProduk} produk)
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            {halamanAktif > 1 ? (
              <Link
                href={buatUrlKatalog({
                  kategori: kategoriAktif,
                  urut: urutAktif,
                  halaman: halamanAktif - 1,
                })}
                className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-medium text-teks transition-colors hover:border-utama hover:text-utama"
              >
                Sebelumnya
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-garis bg-permukaan px-3 py-1.5 text-sm font-medium text-teks-lembut opacity-50">
                Sebelumnya
              </span>
            )}

            {Array.from({ length: totalHalaman }, (_, indeks) => indeks + 1).map((nomor) => {
              const sedangAktif = nomor === halamanAktif;
              return sedangAktif ? (
                <span
                  key={nomor}
                  aria-current="page"
                  className="rounded-lg border border-utama bg-utama px-3 py-1.5 text-sm font-semibold text-white"
                >
                  {nomor}
                </span>
              ) : (
                <Link
                  key={nomor}
                  href={buatUrlKatalog({
                    kategori: kategoriAktif,
                    urut: urutAktif,
                    halaman: nomor,
                  })}
                  className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-medium text-teks transition-colors hover:border-utama hover:text-utama"
                >
                  {nomor}
                </Link>
              );
            })}

            {halamanAktif < totalHalaman ? (
              <Link
                href={buatUrlKatalog({
                  kategori: kategoriAktif,
                  urut: urutAktif,
                  halaman: halamanAktif + 1,
                })}
                className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-medium text-teks transition-colors hover:border-utama hover:text-utama"
              >
                Berikutnya
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-garis bg-permukaan px-3 py-1.5 text-sm font-medium text-teks-lembut opacity-50">
                Berikutnya
              </span>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
