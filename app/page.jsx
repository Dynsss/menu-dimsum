import FilterKatalog from "@/app/FilterKatalog";
import { buatKlienServer } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

async function ambilDaftarProduk() {
  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, foto_url, kategori")
      .order("id", { ascending: true });

    if (error) {
      console.error("Gagal mengambil data produk:", error);
      return {
        daftarProduk: [],
        pesanError:
          "Gagal mengambil data produk dari database. Periksa koneksi dan pengaturan Supabase, lalu coba muat ulang halaman.",
      };
    }

    return {
      daftarProduk: data ?? [],
      pesanError: null,
    };
  } catch (error) {
    console.error("Kesalahan koneksi Supabase:", error);
    return {
      daftarProduk: [],
      pesanError:
        error instanceof Error && error.message.includes("Konfigurasi Supabase")
          ? error.message
          : "Terjadi kesalahan saat menghubungkan ke database. Periksa pengaturan Supabase di server.",
    };
  }
}

export default async function HalamanKatalog() {
  const { daftarProduk, pesanError } = await ambilDaftarProduk();

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        {pesanError ? (
          <p
            role="alert"
            className="rounded-lg border border-bahaya/30 bg-bahaya/5 px-4 py-3 text-sm text-bahaya"
          >
            {pesanError}
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-lg border border-garis bg-permukaan px-4 py-6 text-sm text-teks-lembut">
            Belum ada produk
          </p>
        ) : (
          <FilterKatalog daftarProduk={daftarProduk} />
        )}
      </section>
    </>
  );
}
