"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { ambilDaftarProdukAdmin } from "@/app/admin/actions";

export default function DaftarProdukAdmin({
  daftarProdukAwal,
  pesanErrorAwal,
  notifikasiAwal = null,
}) {
  const router = useRouter();
  const [daftarProduk, setDaftarProduk] = useState(daftarProdukAwal);
  const [pesanError, setPesanError] = useState(pesanErrorAwal);
  const [notifikasi, setNotifikasi] = useState(notifikasiAwal);
  const [kataKunci, setKataKunci] = useState("");
  const [kategoriDipilih, setKategoriDipilih] = useState("");
  const [sedangMemuat, startTransition] = useTransition();

  const daftarKategori = useMemo(() => {
    const kumpulan = new Set();
    daftarProduk.forEach((produk) => {
      if (produk.kategori) {
        kumpulan.add(produk.kategori);
      }
    });
    return Array.from(kumpulan).sort((a, b) => a.localeCompare(b, "id"));
  }, [daftarProduk]);

  const produkTersaring = useMemo(() => {
    const kata = kataKunci.trim().toLowerCase();

    return daftarProduk.filter((produk) => {
      const cocokNama = !kata || String(produk.nama ?? "").toLowerCase().includes(kata);
      const cocokKategori = !kategoriDipilih || produk.kategori === kategoriDipilih;
      return cocokNama && cocokKategori;
    });
  }, [daftarProduk, kataKunci, kategoriDipilih]);

  function muatUlang() {
    startTransition(async () => {
      const hasil = await ambilDaftarProdukAdmin();

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
    setKataKunci("");
    setKategoriDipilih("");
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

      <div className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold">
          Cari produk
          <input
            type="search"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Ketik nama produk..."
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-normal text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold sm:w-52">
          Kategori
          <select
            value={kategoriDipilih}
            onChange={(e) => setKategoriDipilih(e.target.value)}
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

        <Tombol
          type="button"
          varian="garis"
          onClick={muatUlang}
          disabled={sedangMemuat}
          className="sm:shrink-0"
        >
          {sedangMemuat ? "Memuat..." : "Muat ulang"}
        </Tombol>
      </div>

      {!pesanError && !sedangMemuat && (
        <p className="text-sm text-teks-lembut">
          Menampilkan {produkTersaring.length} dari {daftarProduk.length} produk
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

      {!sedangMemuat && !pesanError && daftarProduk.length === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-garis bg-permukaan p-6 text-sm text-teks-lembut">
          <p>Belum ada produk di database.</p>
          <Tombol href="/admin/produk/baru">Tambah produk pertama</Tombol>
        </div>
      )}

      {!sedangMemuat && !pesanError && daftarProduk.length > 0 && produkTersaring.length === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-garis bg-permukaan p-6 text-sm text-teks-lembut">
          <p>Tidak ada produk yang cocok dengan pencarian atau kategori yang dipilih.</p>
          <Tombol type="button" varian="garis" onClick={resetFilter}>
            Reset filter
          </Tombol>
        </div>
      )}

      {!sedangMemuat && !pesanError && produkTersaring.length > 0 && (
        <TabelProduk daftarProduk={produkTersaring} onToggleAktif={tanganiToggleAktif} />
      )}
    </div>
  );
}
