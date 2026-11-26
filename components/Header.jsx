import Link from "next/link";
import TombolKeranjangHeader from "@/components/TombolKeranjangHeader";
import { toko } from "@/lib/toko";

export default function Header() {
  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/tentang"
            className="text-sm font-semibold text-teks-lembut transition-colors hover:text-utama"
          >
            Tentang
          </Link>
          <TombolKeranjangHeader />
        </div>
      </div>
    </header>
  );
}
