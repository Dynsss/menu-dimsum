"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { ambilDaftarProdukAdmin } from "@/app/admin/actions";

function buatUrlAdmin({ q, kategori, halaman }) {
  const params = new URLSearchParams();
  if (q && q.trim()) params.set("q", q.trim());
  if (kategori && kategori.trim()) params.set("kategori", kategori.trim());
  if (halaman && halaman > 1) params.set("halaman", String(halaman));
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

export default function DaftarProdukAdmin({
  daftarProdukAwal,
  daftarKategori = [],
  kataKunciAwal = "",
  kategoriAwal = "",
  halamanAktif = 1,
  totalHalaman = 1,
  totalProdukTersaring = 0,
  totalProdukSemua = 0,
  pesanErrorAwal,
  notifikasiAwal = null,
}) {
  const router = useRouter();
  const [daftarProduk, setDaftarProduk] = useState(daftarProdukAwal);
  const [pesanError, setPesanError] = useState(pesanErrorAwal);
  const [notifikasi, setNotifikasi] = useState(notifikasiAwal);
  const [kataKunciInput, setKataKunciInput] = useState(kataKunciAwal);
  const [sedangMemuat, startTransition] = useTransition();

  useEffect(() => {
    setDaftarProduk(daftarProdukAwal);
  }, [daftarProdukAwal]);

  useEffect(() => {
    setPesanError(pesanErrorAwal);
  }, [pesanErrorAwal]);

  useEffect(() => {
    setKataKunciInput(kataKunciAwal);
  }, [kataKunciAwal]);

  function tanganiCari(event) {
    event.preventDefault();
    router.push(
      buatUrlAdmin({ q: kataKunciInput, kategori: kategoriAwal, halaman: 1 })
    );
  }

  function tanganiUbahKategori(event) {
    router.push(
      buatUrlAdmin({ q: kataKunciInput, kategori: event.target.value, halaman: 1 })
    );
  }

  function muatUlang() {
    startTransition(async () => {
      const hasil = await ambilDaftarProdukAdmin({
        q: kataKunciAwal,
        kategori: kategoriAwal,
        halaman: halamanAktif,
      });

      if (hasil.tidakTerautentikasi) {
        router.push("/admin/login");
        return;
      }

      setPesanError(hasil.pesanError);
      if (!hasil.pesanError) {
        setDaftarProduk(hasil.daftarProduk);
      }
    });
  }

  function resetFilter() {
    setKataKunciInput("");
    router.push("/admin");
  }

  function tanganiToggleAktif(idProduk, aktifBaru) {
    setDaftarProduk((prev) =>
      prev.map((item) =>
        String(item.id) === String(idProduk) ? { ...item, aktif: aktifBaru } : item
      )
    );
    setNotifikasi(
      aktifBaru ? "Produk berhasil diaktifkan." : "Produk berhasil dinonaktifkan."
    );
  }

  function tanganiHapusProduk(idProduk) {
    setDaftarProduk((prev) => prev.filter((item) => String(item.id) !== String(idProduk)));
    setNotifikasi("Produk berhasil dihapus.");
  }

  return (
    <div className="flex flex-col gap-4">
      {notifikasi && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl border border-utama/30 bg-utama/10 px-4 py-3 text-sm font-medium text-utama"
        >
          <p>{notifikasi}</p>
          <button
            type="button"
            onClick={() => setNotifikasi(null)}
            className="text-xs font-semibold underline underline-offset-4 hover:text-utama-gelap"
          >
            Tutup
          </button>
        </div>
      )}

      <form
        onSubmit={tanganiCari}
        className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold">
          Cari produk
          <input
            type="search"
            name="q"
            value={kataKunciInput}
            onChange={(e) => setKataKunciInput(e.target.value)}
            placeholder="Ketik nama produk lalu tekan Cari..."
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-normal text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold sm:w-52">
          Kategori
          <select
            value={kategoriAwal}
            onChange={tanganiUbahKategori}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-normal text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Semua kategori</option>
            {daftarKategori.map((kategori) => (
              <option key={kategori} value={kategori}>
                {kategori}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Tombol type="submit">Cari</Tombol>
          {(kataKunciAwal || kategoriAwal) && (
            <Tombol type="button" varian="garis" onClick={resetFilter}>
              Reset
            </Tombol>
          )}
          <Tombol
            type="button"
            varian="garis"
            onClick={muatUlang}
            disabled={sedangMemuat}
          >
            {sedangMemuat ? "Memuat..." : "Muat ulang"}
          </Tombol>
        </div>
      </form>

      {!pesanError && !sedangMemuat && (
        <p className="text-sm text-teks-lembut">
          Menampilkan {daftarProduk.length} dari {totalProdukTersaring} produk
          {kataKunciAwal || kategoriAwal ? ` (total semua: ${totalProdukSemua})` : ""} — halaman{" "}
          {halamanAktif} dari {totalHalaman}
        </p>
      )}

      {sedangMemuat && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4"
        >
          <p className="text-sm font-semibold text-teks-lembut">Memuat daftar produk...</p>
          <div className="h-14 animate-pulse rounded-xl bg-garis/60" />
          <div className="h-14 animate-pulse rounded-xl bg-garis/60" />
          <div className="h-14 animate-pulse rounded-xl bg-garis/60" />
        </div>
      )}

      {!sedangMemuat && pesanError && (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-2xl border border-bahaya/30 bg-bahaya/5 p-4 text-sm text-bahaya"
        >
          <p>{pesanError}</p>
          <Tombol type="button" varian="garis" onClick={muatUlang}>
            Coba lagi
          </Tombol>
        </div>
      )}

      {!sedangMemuat && !pesanError && totalProdukSemua === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-garis bg-permukaan p-6 text-sm text-teks-lembut">
          <p>Belum ada produk di database.</p>
          <Tombol href="/admin/produk/baru">Tambah produk pertama</Tombol>
        </div>
      )}

      {!sedangMemuat && !pesanError && totalProdukSemua > 0 && daftarProduk.length === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-garis bg-permukaan p-6 text-sm text-teks-lembut">
          <p>Tidak ada produk yang cocok dengan pencarian atau kategori yang dipilih.</p>
          <Tombol type="button" varian="garis" onClick={resetFilter}>
            Reset filter
          </Tombol>
        </div>
      )}

      {!sedangMemuat && !pesanError && daftarProduk.length > 0 && (
        <TabelProduk
          daftarProduk={daftarProduk}
          onToggleAktif={tanganiToggleAktif}
          onHapusProduk={tanganiHapusProduk}
        />
      )}

      {!sedangMemuat && !pesanError && totalHalaman > 1 && (
        <nav
          aria-label="Paginasi produk admin"
          className="mt-2 flex flex-col items-center justify-between gap-3 border-t border-garis pt-4 sm:flex-row"
        >
          <p className="text-sm text-teks-lembut">
            Halaman {halamanAktif} dari {totalHalaman}
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            {halamanAktif > 1 ? (
              <Link
                href={buatUrlAdmin({
                  q: kataKunciAwal,
                  kategori: kategoriAwal,
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
                  href={buatUrlAdmin({
                    q: kataKunciAwal,
                    kategori: kategoriAwal,
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
                href={buatUrlAdmin({
                  q: kataKunciAwal,
                  kategori: kategoriAwal,
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
    </div>
  );
}
