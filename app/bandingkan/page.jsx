import Link from "next/link";
import { notFound } from "next/navigation";
import { buatKlienServer } from "@/lib/supabase/server";
import { dapatkanInfoHarga, formatRupiah } from "@/lib/format";
import { ambilFotoUtama } from "@/lib/foto";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bandingkan Produk",
};

function parseIdsDariQuery(params) {
  const daftarMentah = [];
  if (typeof params?.ids === "string") {
    daftarMentah.push(...params.ids.split(","));
  }
  if (typeof params?.p1 === "string") daftarMentah.push(params.p1);
  if (typeof params?.p2 === "string") daftarMentah.push(params.p2);

  const unik = [];
  for (const bagian of daftarMentah) {
    const bersih = bagian.trim();
    if (/^\d+$/.test(bersih) && !unik.includes(bersih)) {
      unik.push(bersih);
    }
  }
  return unik;
}

function isKolomHilang(error) {
  return Boolean(
    error &&
      (error.code === "42703" ||
        error.message?.includes("stok") ||
        error.message?.includes("harga_diskon") ||
        error.message?.includes("badge") ||
        error.message?.includes("aktif"))
  );
}

async function ambilProdukUntukBandingkan(ids) {
  const supabase = buatKlienServer();
  const daftarKolom = [
    "id, nama, harga, harga_diskon, badge, deskripsi, foto_url, kategori, stok, aktif",
    "id, nama, harga, deskripsi, foto_url, kategori, aktif",
    "id, nama, harga, harga_diskon, badge, deskripsi, foto_url, kategori, stok",
    "id, nama, harga, deskripsi, foto_url, kategori",
  ];

  let data = null;
  let error = null;
  for (const kolom of daftarKolom) {
    ({ data, error } = await supabase.from("produk").select(kolom).in("id", ids));
    if (!isKolomHilang(error)) break;
  }

  return { data, error };
}

export default async function HalamanBandingkan({ searchParams }) {
  const params = await searchParams;
  const ids = parseIdsDariQuery(params);

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
          Kembali ke katalog
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">Bandingkan 2 Produk</h1>
        <p className="text-sm text-teks-lembut">
          Belum ada produk yang dipilih. Pilih dua produk dari katalog untuk melihat perbandingan berdampingan.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
        >
          Pilih produk di katalog
        </Link>
      </div>
    );
  }

  if (ids.length !== 2) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
          Kembali ke katalog
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">Bandingkan 2 Produk</h1>
        <p className="text-sm text-teks-lembut">
          Perbandingan membutuhkan tepat 2 produk yang berbeda. Silakan pilih satu produk lagi dari katalog.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
        >
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  let data = null;
  let error = null;
  try {
    ({ data, error } = await ambilProdukUntukBandingkan(ids));
  } catch (err) {
    console.error("Kesalahan koneksi Supabase saat membandingkan produk:", err);
    error = err;
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
          Kembali ke katalog
        </Link>
        <p
          role="alert"
          className="rounded-lg border border-bahaya/30 bg-bahaya/5 px-4 py-3 text-sm text-bahaya"
        >
          Gagal memuat data perbandingan produk dari database.
        </p>
      </div>
    );
  }

  const produkTerurut = ids
    .map((id) => (data ?? []).find((item) => String(item.id) === id))
    .filter((item) => item && item.aktif !== false);

  if (produkTerurut.length < 2) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Perbandingan Produk
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {produkTerurut.map((produk) => {
          const fotoUtama = ambilFotoUtama(produk.foto_url);
          const { adaDiskon, hargaAktif, hargaCoret } = dapatkanInfoHarga(produk);
          const stokHabis = typeof produk.stok === "number" && produk.stok <= 0;

          return (
            <article
              key={produk.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
            >
              <Link href={`/produk/${produk.id}`} className="block bg-permukaan">
                <img
                  src={fotoUtama}
                  alt={produk.nama}
                  className="aspect-[4/3] w-full object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-permukaan px-2.5 py-0.5 text-xs font-semibold text-teks-lembut">
                    {produk.kategori || "Tanpa kategori"}
                  </span>
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

                <h2 className="text-xl font-bold leading-snug">
                  <Link href={`/produk/${produk.id}`} className="hover:text-utama">
                    {produk.nama}
                  </Link>
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-harga-latar px-3 py-1 text-lg font-bold text-harga">
                    {formatRupiah(hargaAktif)}
                  </span>
                  {adaDiskon && (
                    <span className="text-sm text-teks-lembut line-through">
                      {formatRupiah(hargaCoret)}
                    </span>
                  )}
                </div>

                <div className="border-t border-garis pt-3">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-teks-lembut">
                    Deskripsi
                  </h3>
                  <p className="text-sm leading-relaxed text-teks-lembut">
                    {produk.deskripsi?.trim() || "Belum ada deskripsi untuk produk ini."}
                  </p>
                </div>

                <div className="mt-auto pt-2">
                  <Link
                    href={`/produk/${produk.id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
                  >
                    Lihat detail produk
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
