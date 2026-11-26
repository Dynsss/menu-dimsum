"use client";

import Link from "next/link";
import { useFavorit } from "@/components/FavoritProvider";

export default function TombolFavoritHeader() {
  const { totalFavorit } = useFavorit();

  return (
    <Link
      href="/favorit"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-teks-lembut transition-colors hover:text-utama"
    >
      <span>Favorit</span>
      {totalFavorit > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-bahaya px-1.5 py-0.5 text-xs font-bold text-white">
          {totalFavorit}
        </span>
      )}
    </Link>
  );
}
