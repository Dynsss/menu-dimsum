import { dapatkanInfoHarga, formatRupiah } from "@/lib/format";
import { ambilFotoUtama } from "@/lib/foto";
import Tombol from "@/components/Tombol";
import TombolAktifProduk from "@/components/TombolAktifProduk";

function FotoProduk({ fotoUrl, nama, ukuranKelas }) {
  const fotoUtama = ambilFotoUtama(fotoUrl);

  if (!fotoUtama) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg border border-garis bg-permukaan text-xs text-teks-lembut ${ukuranKelas}`}
      >
        Tanpa foto
      </div>
    );
  }

  return (
    <img
      src={fotoUtama}
      alt={nama}
      className={`shrink-0 rounded-lg border border-garis bg-permukaan object-cover ${ukuranKelas}`}
    />
  );
}

export default function TabelProduk({ daftarProduk, onToggleAktif }) {
  return (
    <>
      {/* Tampilan kartu untuk layar mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {daftarProduk.map((produk) => {
          const { adaDiskon, hargaAktif, hargaCoret } = dapatkanInfoHarga(produk);
          const nonaktif = produk.aktif === false;
          return (
            <article
              key={produk.id}
              className={`flex flex-col gap-3 rounded-2xl border border-garis bg-latar p-4 ${nonaktif ? "opacity-70" : ""}`}
            >
              <div className="flex items-start gap-3">
                <FotoProduk fotoUrl={produk.foto_url} nama={produk.nama} ukuranKelas="h-16 w-16" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-teks-lembut">
                    <span className="rounded bg-permukaan px-1.5 py-0.5 font-semibold text-teks">
                      #{produk.id}
                    </span>
                    <span>{produk.kategori || "Tanpa kategori"}</span>
                    {nonaktif && (
                      <span className="rounded bg-bahaya/10 px-1.5 py-0.5 font-bold text-bahaya">
                        Nonaktif
                      </span>
                    )}
                    {produk.badge && (
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold text-white ${
                          produk.badge === "Terlaris" ? "bg-harga" : "bg-utama"
                        }`}
                      >
                        {produk.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 font-semibold text-teks">{produk.nama}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="inline-block rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
                      {formatRupiah(hargaAktif)}
                    </p>
                    {adaDiskon && (
                      <p className="text-xs text-teks-lembut line-through">
                        {formatRupiah(hargaCoret)}
                      </p>
                    )}
                    {typeof produk.stok === "number" && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          produk.stok <= 0
                            ? "bg-bahaya/10 text-bahaya"
                            : "bg-permukaan text-teks-lembut"
                        }`}
                      >
                        {produk.stok <= 0 ? "Habis" : `Stok: ${produk.stok}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-teks-lembut">
                {produk.deskripsi || "Tidak ada deskripsi."}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <TombolAktifProduk
                  id={produk.id}
                  aktif={produk.aktif !== false}
                  onBerhasil={onToggleAktif}
                />
                {/* US-09 dan US-10 (bonus): ubah dan hapus produk */}
                <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis" className="flex-1">
                  Ubah
                </Tombol>
                <Tombol type="button" varian="bahaya" className="flex-1">
                  Hapus
                </Tombol>
              </div>
            </article>
          );
        })}
      </div>

      {/* Tampilan tabel untuk layar desktop */}
      <div className="hidden overflow-x-auto rounded-2xl border border-garis md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Produk</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Harga</th>
              <th className="px-4 py-3 font-semibold">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {daftarProduk.map((produk) => {
              const { adaDiskon, hargaAktif, hargaCoret } = dapatkanInfoHarga(produk);
              const nonaktif = produk.aktif === false;
              return (
                <tr
                  key={produk.id}
                  className={`border-t border-garis align-top ${nonaktif ? "opacity-70" : ""}`}
                >
                  <td className="px-4 py-3 font-semibold text-teks-lembut">#{produk.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <FotoProduk
                        fotoUrl={produk.foto_url}
                        nama={produk.nama}
                        ukuranKelas="h-12 w-12"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-teks">{produk.nama}</p>
                          {nonaktif && (
                            <span className="rounded bg-bahaya/10 px-1.5 py-0.5 text-xs font-bold text-bahaya">
                              Nonaktif
                            </span>
                          )}
                          {produk.badge && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${
                                produk.badge === "Terlaris" ? "bg-harga" : "bg-utama"
                              }`}
                            >
                              {produk.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 max-w-md text-xs leading-relaxed text-teks-lembut">
                          {produk.deskripsi || "Tidak ada deskripsi."}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-teks-lembut">
                    {produk.kategori || "Tanpa kategori"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className="rounded-md bg-harga-latar px-2 py-0.5 font-bold text-harga">
                        {formatRupiah(hargaAktif)}
                      </span>
                      {adaDiskon && (
                        <span className="text-xs text-teks-lembut line-through">
                          {formatRupiah(hargaCoret)}
                        </span>
                      )}
                      {typeof produk.stok === "number" && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                            produk.stok <= 0
                              ? "bg-bahaya/10 text-bahaya"
                              : "bg-permukaan text-teks-lembut"
                          }`}
                        >
                          {produk.stok <= 0 ? "Habis" : `Stok: ${produk.stok}`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <TombolAktifProduk
                        id={produk.id}
                        aktif={produk.aktif !== false}
                        onBerhasil={onToggleAktif}
                      />
                      {/* US-09 dan US-10 (bonus): ubah dan hapus produk */}
                      <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                        Ubah
                      </Tombol>
                      <Tombol type="button" varian="bahaya">
                        Hapus
                      </Tombol>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
