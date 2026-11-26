"use client";

import Link from "next/link";
import { useKeranjang } from "@/components/KeranjangProvider";
import Tombol from "@/components/Tombol";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export default function HalamanKeranjang() {
  const { items, sudahDimuat, totalItem, totalHarga, ubahJumlah, hapusItem, kosongkanKeranjang } =
    useKeranjang();

  const nomor = String(toko.nomorWhatsApp).replace(/\D/g, "");
  const barisPesanan = items.map((item, indeks) => {
    const subtotal = formatRupiah(item.harga * item.jumlah);
    const catatan = item.catatan ? ` (Catatan: ${item.catatan})` : "";
    return `${indeks + 1}. ${item.nama} x${item.jumlah} - ${subtotal}${catatan}`;
  });
  const pesanWhatsApp = [
    `Halo ${toko.nama}, saya ingin memesan:`,
    ...barisPesanan,
    "",
    `Total: ${formatRupiah(totalHarga)}`,
  ].join("\n");
  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesanWhatsApp)}`;

  if (!sudahDimuat) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <h1 className="text-2xl font-extrabold">Keranjang</h1>
        <div className="h-24 animate-pulse rounded-2xl border border-garis bg-permukaan" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/"
            className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
          >
            Kembali ke katalog
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold">Keranjang ({totalItem})</h1>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={kosongkanKeranjang}
            className="text-sm font-semibold text-bahaya underline underline-offset-4 hover:opacity-80"
          >
            Kosongkan keranjang
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-garis bg-permukaan p-6">
          <p className="text-sm text-teks-lembut">Keranjang belanja kamu masih kosong.</p>
          <Tombol href="/">Lihat katalog</Tombol>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            {items.map((item) => (
              <article
                key={item.key}
                className="flex flex-col gap-4 rounded-2xl border border-garis bg-latar p-4 sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-start gap-3">
                  {item.foto_url ? (
                    <img
                      src={item.foto_url}
                      alt={item.nama}
                      className="h-20 w-20 shrink-0 rounded-xl border border-garis bg-permukaan object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-garis bg-permukaan text-xs text-teks-lembut">
                      Tanpa foto
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produk/${item.id}`}
                      className="font-semibold text-teks hover:text-utama"
                    >
                      {item.nama}
                    </Link>
                    {item.catatan && (
                      <p className="mt-0.5 text-xs text-teks-lembut">Catatan: {item.catatan}</p>
                    )}
                    <p className="mt-1 text-sm text-teks-lembut">
                      {formatRupiah(item.harga)} / item
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                  <div className="inline-flex items-center overflow-hidden rounded-lg border border-garis bg-latar">
                    <button
                      type="button"
                      onClick={() => ubahJumlah(item.key, item.jumlah - 1)}
                      aria-label={`Kurangi jumlah ${item.nama}`}
                      className="flex h-9 w-9 items-center justify-center bg-permukaan text-base font-semibold text-teks hover:bg-garis"
                    >
                      -
                    </button>
                    <span className="flex h-9 min-w-10 items-center justify-center border-x border-garis px-2 text-sm font-semibold">
                      {item.jumlah}
                    </span>
                    <button
                      type="button"
                      onClick={() => ubahJumlah(item.key, item.jumlah + 1)}
                      aria-label={`Tambah jumlah ${item.nama}`}
                      className="flex h-9 w-9 items-center justify-center bg-permukaan text-base font-semibold text-teks hover:bg-garis"
                    >
                      +
                    </button>
                  </div>

                  <p className="min-w-24 text-right font-bold text-harga">
                    {formatRupiah(item.harga * item.jumlah)}
                  </p>

                  <button
                    type="button"
                    onClick={() => hapusItem(item.key)}
                    className="rounded-lg border border-bahaya/30 px-3 py-1.5 text-xs font-semibold text-bahaya hover:bg-bahaya/5"
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-garis bg-permukaan p-5">
            <h2 className="text-lg font-bold">Ringkasan pesanan</h2>
            <div className="flex items-center justify-between text-sm text-teks-lembut">
              <span>Total item</span>
              <span className="font-semibold text-teks">{totalItem}</span>
            </div>
            <div className="flex items-center justify-between border-t border-garis pt-3">
              <span className="font-semibold text-teks">Total harga</span>
              <span className="rounded-md bg-harga-latar px-2.5 py-1 text-lg font-bold text-harga">
                {formatRupiah(totalHarga)}
              </span>
            </div>
            <a
              href={urlWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-utama-gelap"
            >
              Pesan semua via WhatsApp
            </a>
          </aside>
        </div>
      )}
    </div>
  );
}
