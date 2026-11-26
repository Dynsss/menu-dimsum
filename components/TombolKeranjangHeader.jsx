"use client";

import Link from "next/link";
import { useKeranjang } from "@/components/KeranjangProvider";

export default function TombolKeranjangHeader() {
  const { totalItem } = useKeranjang();

  return (
    <Link
      href="/keranjang"
      className="inline-flex items-center gap-2 rounded-lg border border-garis bg-permukaan px-3 py-1.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
    >
      <span>Keranjang</span>
      {totalItem > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-utama px-1.5 py-0.5 text-xs font-bold text-white">
          {totalItem}
        </span>
      )}
    </Link>
  );
}
