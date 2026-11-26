import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";

function FotoProduk({ fotoUrl, nama, ukuranKelas }) {
  if (!fotoUrl) {
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
      src={fotoUrl}
      alt={nama}
      className={`shrink-0 rounded-lg border border-garis bg-permukaan object-cover ${ukuranKelas}`}
    />
  );
}

export default function TabelProduk({ daftarProduk }) {
  return (
    <>
      {/* Tampilan kartu untuk layar mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {daftarProduk.map((produk) => (
          <article
            key={produk.id}
            className="flex flex-col gap-3 rounded-2xl border border-garis bg-latar p-4"
          >
            <div className="flex items-start gap-3">
              <FotoProduk fotoUrl={produk.foto_url} nama={produk.nama} ukuranKelas="h-16 w-16" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-teks-lembut">
                  <span className="rounded bg-permukaan px-1.5 py-0.5 font-semibold text-teks">
                    #{produk.id}
                  </span>
                  <span>{produk.kategori || "Tanpa kategori"}</span>
                </div>
                <h2 className="mt-1 font-semibold text-teks">{produk.nama}</h2>
                <p className="mt-1 inline-block rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
                  {formatRupiah(produk.harga ?? 0)}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-teks-lembut">
              {produk.deskripsi || "Tidak ada deskripsi."}
            </p>
            <div className="flex gap-2 pt-1">
              {/* US-09 dan US-10 (bonus): ubah dan hapus produk */}
              <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis" className="flex-1">
                Ubah
              </Tombol>
              <Tombol type="button" varian="bahaya" className="flex-1">
                Hapus
              </Tombol>
            </div>
          </article>
        ))}
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
            {daftarProduk.map((produk) => (
              <tr key={produk.id} className="border-t border-garis align-top">
                <td className="px-4 py-3 font-semibold text-teks-lembut">#{produk.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <FotoProduk
                      fotoUrl={produk.foto_url}
                      nama={produk.nama}
                      ukuranKelas="h-12 w-12"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-teks">{produk.nama}</p>
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
                  <span className="rounded-md bg-harga-latar px-2 py-0.5 font-bold text-harga">
                    {formatRupiah(produk.harga ?? 0)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
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
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
