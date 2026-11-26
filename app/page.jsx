import FilterKatalog from "@/app/FilterKatalog";
import { buatKlienServer } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

const URUT_VALID = ["termurah", "termahal", "terbaru"];
const PRODUK_PER_HALAMAN = 12;

async function ambilDaftarKategori(supabase) {
  const { data, error } = await supabase.from("produk").select("kategori");
  if (error || !data) return [];

  const unik = [...new Set(data.map((item) => item.kategori).filter(Boolean))];
  unik.sort((a, b) => a.localeCompare(b, "id"));
  return unik;
}

async function ambilDaftarProduk({ urut, kategori, halaman }) {
  try {
    const supabase = buatKlienServer();
    const daftarKategori = await ambilDaftarKategori(supabase);

    const bangunQuery = (halamanTarget, sertakanStok = true) => {
      const awal = (halamanTarget - 1) * PRODUK_PER_HALAMAN;
      const akhir = awal + PRODUK_PER_HALAMAN - 1;
      const kolom = sertakanStok
        ? "id, nama, harga, foto_url, kategori, created_at, stok"
        : "id, nama, harga, foto_url, kategori, created_at";

      let query = supabase.from("produk").select(kolom, { count: "exact" });

      if (kategori) {
        query = query.eq("kategori", kategori);
      }

      if (urut === "termurah") {
        query = query.order("harga", { ascending: true }).order("id", { ascending: true });
      } else if (urut === "termahal") {
        query = query.order("harga", { ascending: false }).order("id", { ascending: true });
      } else if (urut === "terbaru") {
        query = query.order("created_at", { ascending: false }).order("id", { ascending: false });
      } else {
        query = query.order("id", { ascending: true });
      }

      return query.range(awal, akhir);
    };

    let sertakanStok = true;
    let { data, count, error } = await bangunQuery(halaman, sertakanStok);

    if (error && (error.code === "42703" || error.message?.includes("stok"))) {
      sertakanStok = false;
      ({ data, count, error } = await bangunQuery(halaman, false));
    }

    if (error) {
      console.error("Gagal mengambil data produk:", error);
      return {
        daftarProduk: [],
        daftarKategori,
        totalProduk: 0,
        totalHalaman: 1,
        halamanAktif: 1,
        pesanError:
          "Gagal mengambil data produk dari database. Periksa koneksi dan pengaturan Supabase, lalu coba muat ulang halaman.",
      };
    }

    const totalProduk = count ?? 0;
    const totalHalaman = Math.max(1, Math.ceil(totalProduk / PRODUK_PER_HALAMAN));
    let halamanAktif = halaman;

    if (halaman > totalHalaman && totalProduk > 0) {
      halamanAktif = totalHalaman;
      const ulang = await bangunQuery(halamanAktif, sertakanStok);
      if (!ulang.error) {
        data = ulang.data;
      }
    }

    return {
      daftarProduk: data ?? [],
      daftarKategori,
      totalProduk,
      totalHalaman,
      halamanAktif,
      pesanError: null,
    };
  } catch (error) {
    console.error("Kesalahan koneksi Supabase:", error);
    return {
      daftarProduk: [],
      daftarKategori: [],
      totalProduk: 0,
      totalHalaman: 1,
      halamanAktif: 1,
      pesanError:
        error instanceof Error && error.message.includes("Konfigurasi Supabase")
          ? error.message
          : "Terjadi kesalahan saat menghubungkan ke database. Periksa pengaturan Supabase di server.",
    };
  }
}

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const urutMentah = typeof params?.urut === "string" ? params.urut : "";
  const urutAktif = URUT_VALID.includes(urutMentah) ? urutMentah : "";
  const kategoriAktif = typeof params?.kategori === "string" ? params.kategori.trim() : "";
  const halamanMentah = parseInt(typeof params?.halaman === "string" ? params.halaman : "1", 10);
  const halamanDiminta = Number.isFinite(halamanMentah) && halamanMentah >= 1 ? halamanMentah : 1;

  const { daftarProduk, daftarKategori, totalProduk, totalHalaman, halamanAktif, pesanError } =
    await ambilDaftarProduk({
      urut: urutAktif,
      kategori: kategoriAktif,
      halaman: halamanDiminta,
    });

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
        ) : daftarProduk.length === 0 && !kategoriAktif ? (
          <p className="rounded-lg border border-garis bg-permukaan px-4 py-6 text-sm text-teks-lembut">
            Belum ada produk
          </p>
        ) : (
          <FilterKatalog
            daftarProduk={daftarProduk}
            daftarKategori={daftarKategori}
            kategoriAktif={kategoriAktif}
            urutAktif={urutAktif}
            halamanAktif={halamanAktif}
            totalHalaman={totalHalaman}
            totalProduk={totalProduk}
          />
        )}
      </section>
    </>
  );
}
