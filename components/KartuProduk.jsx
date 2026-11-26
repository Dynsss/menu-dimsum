import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { ambilFotoUtama } from "@/lib/foto";

export default function KartuProduk({ produk }) {
  const fotoUtama = ambilFotoUtama(produk.foto_url);
  const habis = typeof produk.stok === "number" && produk.stok <= 0;

  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
    >
      <div className="relative">
        <img
          src={fotoUtama}
          alt={produk.nama}
          className={`aspect-square w-full bg-permukaan object-cover ${habis ? "opacity-60 grayscale-[30%]" : ""}`}
        />
        {habis && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-bahaya px-2 py-0.5 text-xs font-bold text-white">
            Habis
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs text-teks-lembut">{produk.kategori}</p>
        <h3 className="font-semibold leading-snug group-hover:text-utama">{produk.nama}</h3>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <p className="rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
            {formatRupiah(produk.harga)}
          </p>
          {habis && (
            <span className="rounded-md bg-bahaya/10 px-2 py-0.5 text-xs font-semibold text-bahaya">
              Habis
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
