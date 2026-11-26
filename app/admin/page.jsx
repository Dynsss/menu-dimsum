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

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      <DaftarProdukAdmin
        daftarProdukAwal={daftarProduk}
        pesanErrorAwal={pesanError}
        notifikasiAwal={notifikasiAwal}
      />
    </div>
  );
}
