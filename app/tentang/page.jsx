import Link from "next/link";
import Tombol from "@/components/Tombol";
import { toko } from "@/lib/toko";

export const metadata = {
  title: `Tentang ${toko.nama}`,
  description: `Profil, alamat, jam buka, dan kontak ${toko.nama}.`,
};

export default function HalamanTentang() {
  const nomor = String(toko.nomorWhatsApp).replace(/\D/g, "");
  const nomorTampil = nomor.startsWith("62") ? `+${nomor}` : nomor;
  const pesan = `Halo ${toko.nama}, saya ingin bertanya mengenai produk Anda.`;
  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col gap-8 py-8 md:py-12">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="self-start text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          Kembali ke katalog
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tentang {toko.nama}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-teks-lembut">{toko.tagline}</p>
      </div>

      <section
        aria-labelledby="judul-profil"
        className="rounded-2xl border border-garis bg-permukaan p-6"
      >
        <h2 id="judul-profil" className="text-lg font-bold text-teks">
          Profil toko
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-teks-lembut">
          {toko.nama} menyediakan pilihan dimsum dan produk kuliner rumahan yang dibuat segar
          dengan bahan pilihan. Kamu bisa melihat daftar menu di katalog dan langsung memesan lewat
          WhatsApp tanpa ribet.
        </p>
      </section>

      <section aria-label="Informasi dan kontak toko" className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-garis bg-latar p-5">
          <h2 className="text-sm font-bold text-teks">Alamat</h2>
          <p className="mt-2 text-sm leading-relaxed text-teks-lembut">{toko.alamat}</p>
        </div>

        <div className="rounded-2xl border border-garis bg-latar p-5">
          <h2 className="text-sm font-bold text-teks">Jam buka</h2>
          <p className="mt-2 text-sm leading-relaxed text-teks-lembut">{toko.jamBuka}</p>
        </div>

        <div className="rounded-2xl border border-garis bg-latar p-5">
          <h2 className="text-sm font-bold text-teks">Kontak WhatsApp</h2>
          <p className="mt-2 text-sm font-semibold text-teks">{nomorTampil}</p>
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-utama px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-utama-gelap"
          >
            Chat via WhatsApp
          </a>
        </div>
      </section>

      <div>
        <Tombol href="/">Lihat katalog produk</Tombol>
      </div>
    </div>
  );
}
