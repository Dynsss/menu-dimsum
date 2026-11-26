import Tombol from "@/components/Tombol";

export default function TidakDitemukan() {
  return (
    <div className="flex flex-col items-start gap-4 py-16">
      <span className="rounded-md bg-permukaan px-2.5 py-1 text-xs font-bold text-utama">
        404
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-teks-lembut">
        Maaf, halaman atau produk yang kamu cari tidak tersedia atau sudah dipindahkan.
      </p>
      <div className="pt-2">
        <Tombol href="/">Kembali ke beranda</Tombol>
      </div>
    </div>
  );
}
