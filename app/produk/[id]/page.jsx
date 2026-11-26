import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { buatKlienServer } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

async function ambilProduk(id) {
  if (!/^\d+$/.test(id)) {
    return { produk: null, pesanError: null };
  }

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Gagal mengambil detail produk:", error);
      return {
        produk: null,
        pesanError:
          "Gagal mengambil data produk dari database. Periksa koneksi dan pengaturan Supabase, lalu coba muat ulang halaman.",
      };
    }

    return { produk: data, pesanError: null };
  } catch (error) {
    console.error("Kesalahan koneksi Supabase:", error);
    return {
      produk: null,
      pesanError:
        error instanceof Error && error.message.includes("Konfigurasi Supabase")
          ? error.message
          : "Terjadi kesalahan saat menghubungkan ke database. Periksa pengaturan Supabase di server.",
    };
  }
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const { produk, pesanError } = await ambilProduk(id);

  if (pesanError) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
          Kembali ke katalog
        </Link>
        <p
          role="alert"
          className="rounded-lg border border-bahaya/30 bg-bahaya/5 px-4 py-3 text-sm text-bahaya"
        >
          {pesanError}
        </p>
      </div>
    );
  }

  if (!produk) {
    notFound();
  }

  let produkTerkait = [];
  if (produk.kategori) {
    try {
      const supabase = buatKlienServer();
      const { data, error } = await supabase
        .from("produk")
        .select("id, nama, harga, foto_url, kategori")
        .eq("kategori", produk.kategori)
        .neq("id", produk.id)
        .order("id", { ascending: true })
        .limit(3);

      if (!error && data) {
        produkTerkait = data;
      }
    } catch (error) {
      console.error("Gagal mengambil produk terkait:", error);
    }
  }

  return (
    <>
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
        />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          <p className="text-sm text-teks-lembut">{produk.kategori}</p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
            {formatRupiah(produk.harga)}
          </p>
          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
          <TombolWhatsApp produk={produk} />
        </div>
      </article>

      {produkTerkait.length > 0 && (
        <section aria-labelledby="judul-produk-terkait" className="border-t border-garis py-8">
          <h2 id="judul-produk-terkait" className="mb-5 text-xl font-bold">
            Produk terkait
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
