export default function LoadingAdmin() {
  return (
    <div className="flex flex-col gap-6 py-8" role="status" aria-label="Memuat halaman admin">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-permukaan" />
      <div className="h-16 animate-pulse rounded-2xl border border-garis bg-permukaan" />
      <div className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4">
        <p className="text-sm text-teks-lembut">Memuat daftar produk...</p>
        <div className="h-14 animate-pulse rounded-xl bg-garis/60" />
        <div className="h-14 animate-pulse rounded-xl bg-garis/60" />
        <div className="h-14 animate-pulse rounded-xl bg-garis/60" />
      </div>
    </div>
  );
}
