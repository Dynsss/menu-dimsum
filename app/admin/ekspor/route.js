import { NextResponse } from "next/server";
import { buatKlienSesi } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function loloskanSelCsv(nilai) {
  const teks = nilai === null || nilai === undefined ? "" : String(nilai);
  const aman = teks.replace(/"/g, '""');
  if (/[",\r\n]/.test(aman)) {
    return `"${aman}"`;
  }
  return aman;
}

export async function GET() {
  try {
    const supabase = await buatKlienSesi();
    const {
      data: { user },
      error: errorAuth,
    } = await supabase.auth.getUser();

    if (errorAuth || !user) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan masuk sebagai admin terlebih dahulu." },
        { status: 401 }
      );
    }

    let { data, error } = await supabase
      .from("produk")
      .select(
        "id, nama, kategori, harga, harga_diskon, badge, stok, aktif, deskripsi, foto_url, created_at"
      )
      .order("id", { ascending: true });

    if (
      error &&
      (error.code === "42703" ||
        error.message?.includes("stok") ||
        error.message?.includes("harga_diskon") ||
        error.message?.includes("badge") ||
        error.message?.includes("aktif"))
    ) {
      ({ data, error } = await supabase
        .from("produk")
        .select("id, nama, kategori, harga, deskripsi, foto_url, created_at")
        .order("id", { ascending: true }));
    }

    if (error) {
      console.error("Gagal mengambil produk untuk ekspor CSV:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data produk dari database." },
        { status: 500 }
      );
    }

    const header = [
      "ID",
      "Nama",
      "Kategori",
      "Harga",
      "Harga Diskon",
      "Badge",
      "Stok",
      "Status Aktif",
      "Deskripsi",
      "Foto URL",
      "Dibuat Pada",
    ];

    const baris = (data ?? []).map((produk) => [
      produk.id,
      produk.nama,
      produk.kategori ?? "",
      produk.harga ?? "",
      produk.harga_diskon ?? "",
      produk.badge ?? "",
      typeof produk.stok === "number" ? produk.stok : "",
      typeof produk.aktif === "boolean" ? (produk.aktif ? "Aktif" : "Nonaktif") : "Aktif",
      produk.deskripsi ?? "",
      produk.foto_url ?? "",
      produk.created_at ?? "",
    ]);

    const isiCsv = [header, ...baris]
      .map((kolom) => kolom.map(loloskanSelCsv).join(","))
      .join("\r\n");

    return new NextResponse(`\uFEFF${isiCsv}`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="produk-dynss-dimsum.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Kesalahan saat mengekspor CSV:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat file CSV." },
      { status: 500 }
    );
  }
}
