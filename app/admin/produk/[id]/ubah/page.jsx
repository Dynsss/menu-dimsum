import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";
import { buatKlienSesi } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const supabase = await buatKlienSesi();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  let { data: produk, error } = await supabase
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori, stok")
    .eq("id", id)
    .maybeSingle();

  if (error && (error.code === "42703" || error.message?.includes("stok"))) {
    ({ data: produk, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori")
      .eq("id", id)
      .maybeSingle());
  }

  if (error || !produk) {
    notFound();
  }

  async function ubahProdukDenganId(_stateSebelumnya, formData) {
    "use server";
    formData.set("id", id);
    formData.set("foto_url_lama", produk.foto_url ?? "");
    return ubahProduk(_stateSebelumnya, formData);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk produk={produk} action={ubahProdukDenganId} labelTombol="Simpan perubahan" />
    </div>
  );
}
