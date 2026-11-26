export default function LoadingKatalog() {
  return (
    <div role="status" aria-label="Memuat katalog produk" className="flex flex-col gap-8">
      <section className="flex flex-col gap-3 py-10 sm:py-14">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-garis/60 sm:h-12 sm:w-80" />
        <div className="h-6 w-80 max-w-full animate-pulse rounded-lg bg-garis/60" />
        <div className="mt-1 h-4 w-44 animate-pulse rounded-lg bg-garis/60" />
      </section>

      <section className="flex flex-col gap-5">
        <div className="h-7 w-36 animate-pulse rounded-lg bg-garis/60" />

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, indeks) => (
            <div key={indeks} className="h-8 w-20 animate-pulse rounded-full bg-garis/60" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, indeks) => (
            <div
              key={indeks}
              className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
            >
              <div className="aspect-square w-full animate-pulse bg-permukaan" />
              <div className="flex flex-col gap-2 p-3">
                <div className="h-3 w-16 animate-pulse rounded bg-garis/60" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-garis/60" />
                <div className="mt-2 h-6 w-24 animate-pulse rounded bg-garis/60" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
