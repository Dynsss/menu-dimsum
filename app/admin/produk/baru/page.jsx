import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatKlienSesi } from "@/lib/supabase/server";
import { tambahProduk } from "@/app/admin/actions";
import { ambilPilihanKategoriAdmin } from "@/app/admin/kategori/actions";

export const dynamic = "force-dynamic";

export default async function HalamanTambahProduk() {
  const supabase = await buatKlienSesi();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  const daftarKategori = await ambilPilihanKategoriAdmin();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Tambah produk</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Lengkapi informasi produk dan unggah foto untuk ditambahkan ke katalog.
        </p>
      </div>
      <FormProduk
        daftarKategori={daftarKategori}
        action={tambahProduk}
        labelTombol="Simpan produk"
      />
    </div>
  );
}
