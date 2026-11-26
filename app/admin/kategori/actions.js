"use server";

import { revalidatePath } from "next/cache";
import { buatKlienSesi } from "@/lib/supabase/server";

async function dapatkanAdminSesi() {
  const supabase = await buatKlienSesi();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase: null, user: null };
  }

  return { supabase, user };
}

export async function ambilDaftarKategoriAdmin() {
  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return {
        tidakTerautentikasi: true,
        daftarKategori: [],
        tabelBelumAda: false,
        pesanError: "Sesi login telah berakhir. Silakan masuk kembali.",
      };
    }

    const { data: dataKategori, error: errorKategori } = await supabase
      .from("kategori")
      .select("id, nama, created_at")
      .order("nama", { ascending: true });

    if (errorKategori) {
      if (
        errorKategori.code === "42P01" ||
        errorKategori.message?.includes("does not exist") ||
        errorKategori.message?.includes("schema cache")
      ) {
        return {
          tidakTerautentikasi: false,
          daftarKategori: [],
          tabelBelumAda: true,
          pesanError: null,
        };
      }

      console.error("Gagal mengambil daftar kategori:", errorKategori);
      return {
        tidakTerautentikasi: false,
        daftarKategori: [],
        tabelBelumAda: false,
        pesanError: "Gagal mengambil daftar kategori dari database.",
      };
    }

    const { data: dataProduk } = await supabase.from("produk").select("kategori");
    const hitungPerKategori = new Map();
    (dataProduk ?? []).forEach((item) => {
      const nama = item.kategori?.trim();
      if (nama) {
        hitungPerKategori.set(nama, (hitungPerKategori.get(nama) ?? 0) + 1);
      }
    });

    const daftarKategori = (dataKategori ?? []).map((item) => ({
      ...item,
      jumlahProduk: hitungPerKategori.get(item.nama) ?? 0,
    }));

    return {
      tidakTerautentikasi: false,
      daftarKategori,
      tabelBelumAda: false,
      pesanError: null,
    };
  } catch (error) {
    console.error("Kesalahan saat mengambil kategori:", error);
    return {
      tidakTerautentikasi: false,
      daftarKategori: [],
      tabelBelumAda: false,
      pesanError: "Terjadi kesalahan saat menghubungkan ke database.",
    };
  }
}

export async function ambilPilihanKategoriAdmin() {
  try {
    const { supabase, user } = await dapatkanAdminSesi();
    if (!user || !supabase) return [];

    const { data, error } = await supabase
      .from("kategori")
      .select("nama")
      .order("nama", { ascending: true });

    if (!error) {
      return (data ?? []).map((item) => item.nama).filter(Boolean);
    }

    const { data: dataProduk } = await supabase.from("produk").select("kategori");
    const unik = [
      ...new Set((dataProduk ?? []).map((item) => item.kategori?.trim()).filter(Boolean)),
    ];
    unik.sort((a, b) => a.localeCompare(b, "id"));
    return unik;
  } catch {
    return [];
  }
}

export async function tambahKategori(_stateSebelumnya, formData) {
  const nama = String(formData.get("nama") ?? "").trim();

  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return { error: "Sesi login telah berakhir. Silakan masuk kembali.", sukses: null };
    }

    if (!nama) {
      return { error: "Nama kategori wajib diisi.", sukses: null };
    }

    const { error } = await supabase.from("kategori").insert({ nama });

    if (error) {
      if (error.code === "23505") {
        return { error: `Kategori "${nama}" sudah ada.`, sukses: null };
      }
      console.error("Gagal menambah kategori:", error);
      return { error: "Gagal menambahkan kategori ke database.", sukses: null };
    }

    revalidatePath("/admin/kategori");
    revalidatePath("/admin/produk/baru");
    revalidatePath("/admin");
    return { error: null, sukses: `Kategori "${nama}" berhasil ditambahkan.` };
  } catch (error) {
    console.error("Kesalahan saat menambah kategori:", error);
    return { error: "Terjadi kesalahan saat menambahkan kategori.", sukses: null };
  }
}

export async function ubahKategori(_stateSebelumnya, formData) {
  const id = String(formData.get("id") ?? "").trim();
  const namaBaru = String(formData.get("nama") ?? "").trim();

  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return { error: "Sesi login telah berakhir. Silakan masuk kembali.", sukses: null };
    }

    if (!id || !/^\d+$/.test(id)) {
      return { error: "ID kategori tidak valid.", sukses: null };
    }

    if (!namaBaru) {
      return { error: "Nama kategori tidak boleh kosong.", sukses: null };
    }

    const { data: kategoriLama, error: errorAmbil } = await supabase
      .from("kategori")
      .select("id, nama")
      .eq("id", id)
      .maybeSingle();

    if (errorAmbil || !kategoriLama) {
      return { error: "Kategori tidak ditemukan.", sukses: null };
    }

    const { error: errorUpdate } = await supabase
      .from("kategori")
      .update({ nama: namaBaru })
      .eq("id", id);

    if (errorUpdate) {
      if (errorUpdate.code === "23505") {
        return { error: `Kategori "${namaBaru}" sudah ada.`, sukses: null };
      }
      console.error("Gagal mengubah kategori:", errorUpdate);
      return { error: "Gagal mengubah nama kategori.", sukses: null };
    }

    if (kategoriLama.nama !== namaBaru) {
      await supabase
        .from("produk")
        .update({ kategori: namaBaru })
        .eq("kategori", kategoriLama.nama);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/kategori");
    revalidatePath("/admin/produk/baru");
    return { error: null, sukses: `Kategori berhasil diubah menjadi "${namaBaru}".` };
  } catch (error) {
    console.error("Kesalahan saat mengubah kategori:", error);
    return { error: "Terjadi kesalahan saat mengubah kategori.", sukses: null };
  }
}

export async function hapusKategori(_stateSebelumnya, formData) {
  const id = String(formData.get("id") ?? "").trim();

  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return { error: "Sesi login telah berakhir. Silakan masuk kembali.", sukses: null };
    }

    if (!id || !/^\d+$/.test(id)) {
      return { error: "ID kategori tidak valid.", sukses: null };
    }

    const { data: kategori, error: errorAmbil } = await supabase
      .from("kategori")
      .select("id, nama")
      .eq("id", id)
      .maybeSingle();

    if (errorAmbil || !kategori) {
      return { error: "Kategori tidak ditemukan.", sukses: null };
    }

    const { count, error: errorHitung } = await supabase
      .from("produk")
      .select("id", { count: "exact", head: true })
      .eq("kategori", kategori.nama);

    if (errorHitung) {
      console.error("Gagal memeriksa pemakaian kategori:", errorHitung);
      return { error: "Gagal memeriksa apakah kategori masih dipakai produk.", sukses: null };
    }

    if ((count ?? 0) > 0) {
      return {
        error: `Kategori "${kategori.nama}" masih dipakai oleh ${count} produk dan tidak dapat dihapus.`,
        sukses: null,
      };
    }

    const { error: errorHapus } = await supabase.from("kategori").delete().eq("id", id);

    if (errorHapus) {
      console.error("Gagal menghapus kategori:", errorHapus);
      return { error: "Gagal menghapus kategori dari database.", sukses: null };
    }

    revalidatePath("/admin/kategori");
    revalidatePath("/admin/produk/baru");
    revalidatePath("/admin");
    return { error: null, sukses: `Kategori "${kategori.nama}" berhasil dihapus.` };
  } catch (error) {
    console.error("Kesalahan saat menghapus kategori:", error);
    return { error: "Terjadi kesalahan saat menghapus kategori.", sukses: null };
  }
}
