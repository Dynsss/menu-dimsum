import Link from "next/link";
import { notFound } from "next/navigation";
import GaleriFotoProduk from "@/components/GaleriFotoProduk";
import KartuProduk from "@/components/KartuProduk";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { buatKlienServer } from "@/lib/supabase/server";
import { dapatkanInfoHarga, formatRupiah } from "@/lib/format";
import { ambilDaftarFoto } from "@/lib/foto";

export const dynamic = "force-dynamic";

async function ambilProduk(id) {
  if (!/^\d+$/.test(id)) {
    return { produk: null, pesanError: null };
  }

  try {
    const supabase = buatKlienServer();
    let { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, harga_diskon, badge, deskripsi, foto_url, kategori, stok")
      .eq("id", id)
      .maybeSingle();

    if (
      error &&
      (error.code === "42703" ||
        error.message?.includes("stok") ||
        error.message?.includes("harga_diskon") ||
        error.message?.includes("badge"))
    ) {
      ({ data, error } = await supabase
        .from("produk")
        .select("id, nama, harga, deskripsi, foto_url, kategori")
        .eq("id", id)
        .maybeSingle());
    }

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
      let { data, error } = await supabase
        .from("produk")
        .select("id, nama, harga, harga_diskon, badge, foto_url, kategori, stok")
        .eq("kategori", produk.kategori)
        .neq("id", produk.id)
        .order("id", { ascending: true })
        .limit(3);

      if (
        error &&
        (error.code === "42703" ||
          error.message?.includes("stok") ||
          error.message?.includes("harga_diskon") ||
          error.message?.includes("badge"))
      ) {
        ({ data, error } = await supabase
          .from("produk")
          .select("id, nama, harga, foto_url, kategori")
          .eq("kategori", produk.kategori)
          .neq("id", produk.id)
          .order("id", { ascending: true })
          .limit(3));
      }

      if (!error && data) {
        produkTerkait = data;
      }
    } catch (error) {
      console.error("Gagal mengambil produk terkait:", error);
    }
  }

  const daftarFoto = ambilDaftarFoto(produk.foto_url);
  const stokHabis = typeof produk.stok === "number" && produk.stok <= 0;
  const { adaDiskon, hargaAktif, hargaCoret } = dapatkanInfoHarga(produk);

  return (
    <>
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        <GaleriFotoProduk daftarFoto={daftarFoto} nama={produk.nama} />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-teks-lembut">{produk.kategori}</p>
            {produk.badge && (
              <span
                className={`rounded-md px-2.5 py-0.5 text-xs font-bold text-white ${
                  produk.badge === "Terlaris" ? "bg-harga" : "bg-utama"
                }`}
              >
                {produk.badge}
              </span>
            )}
            {stokHabis ? (
              <span className="rounded-md bg-bahaya/10 px-2.5 py-0.5 text-xs font-bold text-bahaya">
                Habis
              </span>
            ) : typeof produk.stok === "number" ? (
              <span className="rounded-md bg-permukaan px-2.5 py-0.5 text-xs font-semibold text-teks-lembut">
                Stok: {produk.stok}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
              {formatRupiah(hargaAktif)}
            </p>
            {adaDiskon && (
              <p className="text-base text-teks-lembut line-through">{formatRupiah(hargaCoret)}</p>
            )}
          </div>
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
