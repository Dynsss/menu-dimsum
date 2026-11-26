"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleAktifProduk } from "@/app/admin/actions";

export default function TombolAktifProduk({ id, aktif = true, onBerhasil }) {
  const router = useRouter();
  const [sedangMemproses, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const sedangAktif = aktif !== false;

  function tanganiToggle() {
    setError(null);
    startTransition(async () => {
      const hasil = await toggleAktifProduk(id, sedangAktif);
      if (hasil?.tidakTerautentikasi) {
        router.push("/admin/login");
        return;
      }
      if (hasil?.error) {
        setError(hasil.error);
        return;
      }
      onBerhasil?.(id, hasil.aktifBaru);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={tanganiToggle}
        disabled={sedangMemproses}
        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
          sedangAktif
            ? "border-garis bg-permukaan text-teks hover:border-bahaya/40 hover:text-bahaya"
            : "border-utama bg-utama/10 text-utama hover:bg-utama hover:text-white"
        }`}
      >
        {sedangMemproses
          ? "Menyimpan..."
          : sedangAktif
            ? "Nonaktifkan"
            : "Aktifkan"}
      </button>
      {error && <span className="text-xs text-bahaya">{error}</span>}
    </div>
  );
}
