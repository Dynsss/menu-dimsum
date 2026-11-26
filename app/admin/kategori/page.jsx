import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import { ambilDaftarKategoriAdmin } from "./actions";
import KelolaKategori from "./KelolaKategori";

export const dynamic = "force-dynamic";

export default async function HalamanKategoriAdmin() {
  const { tidakTerautentikasi, daftarKategori, tabelBelumAda, pesanError } =
    await ambilDaftarKategoriAdmin();

  if (tidakTerautentikasi) {
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Kelola kategori</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Daftar kategori ini digunakan sebagai pilihan kategori pada form tambah dan ubah produk.
        </p>
      </div>

      {tabelBelumAda ? (
        <div
          role="alert"
          className="rounded-2xl border border-bahaya/30 bg-bahaya/5 p-5 text-sm text-bahaya"
        >
          <p className="font-semibold">Tabel &quot;kategori&quot; belum tersedia di Supabase.</p>
          <p className="mt-1 text-teks-lembut">
            Jalankan SQL pembuatan tabel <code>public.kategori</code> di Supabase SQL Editor lalu
            muat ulang halaman ini.
          </p>
        </div>
      ) : pesanError ? (
        <p
          role="alert"
          className="rounded-2xl border border-bahaya/30 bg-bahaya/5 p-4 text-sm text-bahaya"
        >
          {pesanError}
        </p>
      ) : (
        <KelolaKategori daftarKategori={daftarKategori} />
      )}
    </div>
  );
}
