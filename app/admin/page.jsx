import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { ambilDaftarProdukAdmin } from "@/app/admin/actions";
import DaftarProdukAdmin from "./DaftarProdukAdmin";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const status = typeof params?.status === "string" ? params.status : "";
  const kataKunci = typeof params?.q === "string" ? params.q.trim() : "";
  const kategoriDipilih = typeof params?.kategori === "string" ? params.kategori.trim() : "";
  const halamanMentah = parseInt(typeof params?.halaman === "string" ? params.halaman : "1", 10);
  const halamanDiminta = Number.isFinite(halamanMentah) && halamanMentah >= 1 ? halamanMentah : 1;

  const {
    tidakTerautentikasi,
    daftarProduk,
    daftarKategori,
    ringkasan,
    totalProdukTersaring,
    totalHalaman,
    halamanAktif,
    pesanError,
  } = await ambilDaftarProdukAdmin({
    q: kataKunci,
    kategori: kategoriDipilih,
    halaman: halamanDiminta,
  });

  if (tidakTerautentikasi) {
    redirect("/admin/login");
  }

  const notifikasiAwal =
    status === "tambah-berhasil"
      ? "Produk baru berhasil ditambahkan."
      : status === "ubah-berhasil"
        ? "Produk berhasil diubah."
        : null;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {!pesanError && (
        <section aria-labelledby="judul-ringkasan" className="flex flex-col gap-4">
          <h2 id="judul-ringkasan" className="text-base font-bold text-teks">
            Ringkasan katalog
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-garis bg-permukaan p-4">
              <p className="text-xs font-semibold text-teks-lembut">Total produk</p>
              <p className="mt-1 text-2xl font-extrabold text-teks">{ringkasan.totalProduk}</p>
            </div>
            <div className="rounded-2xl border border-garis bg-permukaan p-4">
              <p className="text-xs font-semibold text-teks-lembut">Total kategori</p>
              <p className="mt-1 text-2xl font-extrabold text-teks">
                {ringkasan.perKategori.length}
              </p>
            </div>
            <div className="rounded-2xl border border-garis bg-permukaan p-4">
              <p className="text-xs font-semibold text-teks-lembut">Stok habis</p>
              <p className="mt-1 text-2xl font-extrabold text-bahaya">{ringkasan.jumlahHabis}</p>
            </div>
          </div>

          {ringkasan.perKategori.length > 0 && (
            <div className="rounded-2xl border border-garis bg-latar p-4">
              <p className="mb-3 text-xs font-semibold text-teks-lembut">
                Jumlah produk per kategori
              </p>
              <div className="flex flex-wrap gap-2">
                {ringkasan.perKategori.map((item) => (
                  <div
                    key={item.nama}
                    className="inline-flex items-center gap-2 rounded-lg border border-garis bg-permukaan px-3 py-1.5 text-sm"
                  >
                    <span className="font-medium text-teks">{item.nama}</span>
                    <span className="rounded bg-utama px-2 py-0.5 text-xs font-bold text-white">
                      {item.jumlah}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <DaftarProdukAdmin
        daftarProdukAwal={daftarProduk}
        daftarKategori={daftarKategori}
        kataKunciAwal={kataKunci}
        kategoriAwal={kategoriDipilih}
        halamanAktif={halamanAktif}
        totalHalaman={totalHalaman}
        totalProdukTersaring={totalProdukTersaring}
        totalProdukSemua={ringkasan.totalProduk}
        pesanErrorAwal={pesanError}
        notifikasiAwal={notifikasiAwal}
      />
    </div>
  );
}
