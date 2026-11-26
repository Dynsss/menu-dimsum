export default function LoadingDetailProduk() {
  return (
    <div
      role="status"
      aria-label="Memuat detail produk"
      className="grid gap-8 py-8 md:grid-cols-2 md:py-12"
    >
      <div className="aspect-square w-full animate-pulse rounded-2xl border border-garis bg-permukaan" />

      <div className="flex flex-col gap-4">
        <div className="h-4 w-32 animate-pulse rounded bg-garis/60" />
        <div className="h-4 w-24 animate-pulse rounded bg-garis/60" />
        <div className="h-9 w-3/4 animate-pulse rounded-lg bg-garis/60" />
        <div className="h-8 w-32 animate-pulse rounded-md bg-garis/60" />
        <div className="flex flex-col gap-2 pt-2">
          <div className="h-4 w-full animate-pulse rounded bg-garis/60" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-garis/60" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-garis/60" />
        </div>
        <div className="mt-2 flex gap-3">
          <div className="h-12 w-44 animate-pulse rounded-lg bg-garis/60" />
          <div className="h-12 w-44 animate-pulse rounded-lg bg-garis/60" />
        </div>
      </div>
    </div>
  );
}
