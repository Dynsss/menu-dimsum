"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buatKlienServer, buatKlienSesi } from "@/lib/supabase/server";

const TIPE_FOTO_DIIZINKAN = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const UKURAN_MAKSIMAL_FOTO = 5 * 1024 * 1024; // 5 MB
const EKSTENSI_FOTO = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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

export async function loginAdmin(_stateSebelumnya, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let berhasil = false;

  try {
    const supabase = await buatKlienSesi();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: "Email atau password salah. Periksa kembali lalu coba lagi.",
      };
    }

    berhasil = true;
  } catch (error) {
    console.error("Gagal login admin:", error);
    return {
      error:
        error instanceof Error && error.message.includes("Konfigurasi Supabase")
          ? error.message
          : "Terjadi kesalahan saat masuk. Periksa koneksi dan pengaturan Supabase.",
    };
  }

  if (berhasil) {
    redirect("/admin");
  }
}

export async function keluarAdmin() {
  try {
    const supabase = await buatKlienSesi();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Gagal keluar admin:", error);
  }

  redirect("/admin/login");
}

export async function ambilDaftarProdukAdmin() {
  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return {
        tidakTerautentikasi: true,
        daftarProduk: [],
        pesanError: "Sesi login telah berakhir. Silakan masuk kembali.",
      };
    }

    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
      .order("id", { ascending: true });

    if (error) {
      console.error("Gagal mengambil daftar produk admin:", error);
      return {
        tidakTerautentikasi: false,
        daftarProduk: [],
        pesanError:
          "Gagal mengambil daftar produk dari database. Periksa koneksi Supabase lalu coba muat ulang.",
      };
    }

    return {
      tidakTerautentikasi: false,
      daftarProduk: data ?? [],
      pesanError: null,
    };
  } catch (error) {
    console.error("Kesalahan saat mengambil produk admin:", error);
    return {
      tidakTerautentikasi: false,
      daftarProduk: [],
      pesanError:
        error instanceof Error && error.message.includes("Konfigurasi Supabase")
          ? error.message
          : "Terjadi kesalahan saat menghubungkan ke database. Periksa pengaturan Supabase di server.",
    };
  }
}

export async function tambahProduk(_stateSebelumnya, formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const hargaTeks = String(formData.get("harga") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "").trim();
  const foto = formData.get("foto");

  const nilai = {
    nama,
    harga: hargaTeks,
    kategori,
    deskripsi,
  };

  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return {
        error: "Sesi login tidak ditemukan atau sudah berakhir. Silakan masuk kembali.",
        nilai,
      };
    }

    if (!nama) {
      return { error: "Nama produk wajib diisi.", nilai };
    }

    const harga = Number(hargaTeks);
    if (!hargaTeks || !Number.isFinite(harga) || !Number.isInteger(harga) || harga <= 0) {
      return {
        error: "Harga produk wajib diisi dengan angka bulat lebih dari 0.",
        nilai,
      };
    }

    if (!kategori) {
      return { error: "Kategori produk wajib diisi.", nilai };
    }

    if (!deskripsi) {
      return { error: "Deskripsi produk wajib diisi.", nilai };
    }

    if (!foto || typeof foto === "string" || foto.size === 0) {
      return { error: "Foto produk wajib diunggah.", nilai };
    }

    if (!TIPE_FOTO_DIIZINKAN.includes(foto.type)) {
      return { error: "Format foto harus berupa JPG, PNG, WebP, atau GIF.", nilai };
    }

    if (foto.size > UKURAN_MAKSIMAL_FOTO) {
      return { error: "Ukuran foto maksimal 5 MB.", nilai };
    }

    const namaBucket = process.env.SUPABASE_STORAGE_BUCKET || "produk";
    const supabaseStorage = buatKlienServer();

    const { error: errorBucket } = await supabaseStorage.storage.getBucket(namaBucket);
    if (errorBucket) {
      const { error: errorBuatBucket } = await supabaseStorage.storage.createBucket(namaBucket, {
        public: true,
        fileSizeLimit: UKURAN_MAKSIMAL_FOTO,
        allowedMimeTypes: TIPE_FOTO_DIIZINKAN,
      });

      if (errorBuatBucket) {
        console.error("Gagal menyiapkan bucket Storage:", errorBuatBucket);
        return {
          error:
            "Bucket penyimpanan foto belum tersedia di Supabase Storage. Pastikan bucket sudah dibuat atau periksa konfigurasi server.",
          nilai,
        };
      }
    }

    const ekstensi = EKSTENSI_FOTO[foto.type] || "jpg";
    const namaSlug =
      nama
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "produk";
    const pathFoto = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${namaSlug}.${ekstensi}`;
    const bufferFoto = Buffer.from(await foto.arrayBuffer());

    const { error: errorUpload } = await supabaseStorage.storage
      .from(namaBucket)
      .upload(pathFoto, bufferFoto, {
        contentType: foto.type,
        upsert: false,
      });

    if (errorUpload) {
      console.error("Gagal mengunggah foto ke Supabase Storage:", errorUpload);
      return {
        error: "Gagal mengunggah foto produk ke penyimpanan. Coba lagi beberapa saat.",
        nilai,
      };
    }

    const { data: dataUrl } = supabaseStorage.storage.from(namaBucket).getPublicUrl(pathFoto);
    const fotoUrl = dataUrl?.publicUrl;

    if (!fotoUrl) {
      await supabaseStorage.storage.from(namaBucket).remove([pathFoto]).catch(() => {});
      return {
        error: "Gagal mendapatkan URL foto produk setelah unggah.",
        nilai,
      };
    }

    const { error: errorSimpan } = await supabase.from("produk").insert({
      nama,
      harga,
      kategori,
      deskripsi,
      foto_url: fotoUrl,
    });

    if (errorSimpan) {
      console.error("Gagal menyimpan produk ke database:", errorSimpan);
      await supabaseStorage.storage.from(namaBucket).remove([pathFoto]).catch(() => {});
      return {
        error: "Gagal menyimpan data produk ke database. Periksa input lalu coba lagi.",
        nilai,
      };
    }
  } catch (error) {
    console.error("Kesalahan saat menambah produk:", error);
    return {
      error:
        error instanceof Error && error.message.includes("Konfigurasi Supabase")
          ? error.message
          : "Terjadi kesalahan saat menambahkan produk. Periksa koneksi dan pengaturan Supabase.",
      nilai,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?status=tambah-berhasil");
}
