import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { ambilDaftarProdukAdmin } from "@/app/admin/actions";
import DaftarProdukAdmin from "./DaftarProdukAdmin";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const { status } = await searchParams;
  const { tidakTerautentikasi, daftarProduk, pesanError } = await ambilDaftarProdukAdmin();

  if (tidakTerautentikasi) {
    redirect("/admin/login");
  }

  const notifikasiAwal =
    status === "tambah-berhasil"
      ? "Produk baru berhasil ditambahkan."
      : status === "ubah-berhasil"
        ? "Produk berhasil diubah."
        : null;

  const petaKategori = new Map();
  let jumlahHabis = 0;

  daftarProduk.forEach((produk) => {
    const namaKategori = produk.kategori?.trim() || "Tanpa kategori";
    petaKategori.set(namaKategori, (petaKategori.get(namaKategori) ?? 0) + 1);
    if (typeof produk.stok === "number" && produk.stok <= 0) {
      jumlahHabis += 1;
    }
  });

  const ringkasanKategori = Array.from(petaKategori.entries())
    .map(([nama, jumlah]) => ({ nama, jumlah }))
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));

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
              <p className="mt-1 text-2xl font-extrabold text-teks">{daftarProduk.length}</p>
            </div>
            <div className="rounded-2xl border border-garis bg-permukaan p-4">
              <p className="text-xs font-semibold text-teks-lembut">Total kategori</p>
              <p className="mt-1 text-2xl font-extrabold text-teks">{ringkasanKategori.length}</p>
            </div>
            <div className="rounded-2xl border border-garis bg-permukaan p-4">
              <p className="text-xs font-semibold text-teks-lembut">Stok habis</p>
              <p className="mt-1 text-2xl font-extrabold text-bahaya">{jumlahHabis}</p>
            </div>
          </div>

          {ringkasanKategori.length > 0 && (
            <div className="rounded-2xl border border-garis bg-latar p-4">
              <p className="mb-3 text-xs font-semibold text-teks-lembut">
                Jumlah produk per kategori
              </p>
              <div className="flex flex-wrap gap-2">
                {ringkasanKategori.map((item) => (
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
        pesanErrorAwal={pesanError}
        notifikasiAwal={notifikasiAwal}
      />
    </div>
  );
}
