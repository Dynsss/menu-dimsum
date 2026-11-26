"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { hapusProduk } from "@/app/admin/actions";
import Tombol from "@/components/Tombol";

export default function TombolHapusProduk({ id, nama, className = "", onBerhasil }) {
  const router = useRouter();
  const [sedangMemproses, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function tanganiHapus() {
    const dikonfirmasi = window.confirm(
      `Hapus produk "${nama}"? Data yang dihapus tidak dapat dikembalikan.`
    );
    if (!dikonfirmasi) return;

    setError(null);
    startTransition(async () => {
      const hasil = await hapusProduk(id);
      if (hasil?.tidakTerautentikasi) {
        router.push("/admin/login");
        return;
      }
      if (hasil?.error) {
        setError(hasil.error);
        return;
      }
      onBerhasil?.(id);
      router.refresh();
    });
  }

  return (
    <div className={`flex flex-col items-stretch gap-1 ${className}`}>
      <Tombol
        type="button"
        varian="bahaya"
        onClick={tanganiHapus}
        disabled={sedangMemproses}
        className="w-full"
      >
        {sedangMemproses ? "Menghapus..." : "Hapus"}
      </Tombol>
      {error && <span className="text-xs text-bahaya">{error}</span>}
    </div>
  );
}
