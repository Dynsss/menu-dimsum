"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serialisasiFoto } from "@/lib/foto";
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
  const daftarFoto = formData
    .getAll("foto")
    .filter((item) => item && typeof item !== "string" && item.size > 0);

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

    if (daftarFoto.length === 0) {
      return { error: "Foto produk wajib diunggah.", nilai };
    }

    if (daftarFoto.length > 5) {
      return { error: "Maksimal 5 foto per produk.", nilai };
    }

    for (const foto of daftarFoto) {
      if (!TIPE_FOTO_DIIZINKAN.includes(foto.type)) {
        return { error: "Format semua foto harus berupa JPG, PNG, WebP, atau GIF.", nilai };
      }

      if (foto.size > UKURAN_MAKSIMAL_FOTO) {
        return { error: "Ukuran setiap foto maksimal 5 MB.", nilai };
      }
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

    const namaSlug =
      nama
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "produk";

    const pathTerunggah = [];
    const daftarUrlFoto = [];

    for (let indeks = 0; indeks < daftarFoto.length; indeks += 1) {
      const foto = daftarFoto[indeks];
      const ekstensi = EKSTENSI_FOTO[foto.type] || "jpg";
      const pathFoto = `${Date.now()}-${indeks + 1}-${crypto.randomUUID().slice(0, 8)}-${namaSlug}.${ekstensi}`;
      const bufferFoto = Buffer.from(await foto.arrayBuffer());

      const { error: errorUpload } = await supabaseStorage.storage
        .from(namaBucket)
        .upload(pathFoto, bufferFoto, {
          contentType: foto.type,
          upsert: false,
        });

      if (errorUpload) {
        console.error("Gagal mengunggah foto ke Supabase Storage:", errorUpload);
        if (pathTerunggah.length > 0) {
          await supabaseStorage.storage.from(namaBucket).remove(pathTerunggah).catch(() => {});
        }
        return {
          error: "Gagal mengunggah foto produk ke penyimpanan. Coba lagi beberapa saat.",
          nilai,
        };
      }

      pathTerunggah.push(pathFoto);
      const { data: dataUrl } = supabaseStorage.storage.from(namaBucket).getPublicUrl(pathFoto);
      if (!dataUrl?.publicUrl) {
        await supabaseStorage.storage.from(namaBucket).remove(pathTerunggah).catch(() => {});
        return {
          error: "Gagal mendapatkan URL foto produk setelah unggah.",
          nilai,
        };
      }
      daftarUrlFoto.push(dataUrl.publicUrl);
    }

    const { error: errorSimpan } = await supabase.from("produk").insert({
      nama,
      harga,
      kategori,
      deskripsi,
      foto_url: serialisasiFoto(daftarUrlFoto),
    });

    if (errorSimpan) {
      console.error("Gagal menyimpan produk ke database:", errorSimpan);
      if (pathTerunggah.length > 0) {
        await supabaseStorage.storage.from(namaBucket).remove(pathTerunggah).catch(() => {});
      }
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

export async function ubahProduk(_stateSebelumnya, formData) {
  const id = String(formData.get("id") ?? "").trim();
  const nama = String(formData.get("nama") ?? "").trim();
  const hargaTeks = String(formData.get("harga") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "").trim();
  const fotoUrlLama = String(formData.get("foto_url_lama") ?? "").trim();
  const daftarFoto = formData
    .getAll("foto")
    .filter((item) => item && typeof item !== "string" && item.size > 0);

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

    if (!id || !/^\d+$/.test(id)) {
      return { error: "ID produk tidak valid.", nilai };
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

    if (daftarFoto.length > 5) {
      return { error: "Maksimal 5 foto per produk.", nilai };
    }

    for (const foto of daftarFoto) {
      if (!TIPE_FOTO_DIIZINKAN.includes(foto.type)) {
        return { error: "Format semua foto harus berupa JPG, PNG, WebP, atau GIF.", nilai };
      }

      if (foto.size > UKURAN_MAKSIMAL_FOTO) {
        return { error: "Ukuran setiap foto maksimal 5 MB.", nilai };
      }
    }

    const dataUpdate = {
      nama,
      harga,
      kategori,
      deskripsi,
    };

    if (daftarFoto.length > 0) {
      const namaBucket = process.env.SUPABASE_STORAGE_BUCKET || "produk";
      const supabaseStorage = buatKlienServer();

      const namaSlug =
        nama
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 40) || "produk";

      const pathTerunggah = [];
      const daftarUrlFoto = [];

      for (let indeks = 0; indeks < daftarFoto.length; indeks += 1) {
        const foto = daftarFoto[indeks];
        const ekstensi = EKSTENSI_FOTO[foto.type] || "jpg";
        const pathFoto = `${Date.now()}-${indeks + 1}-${crypto.randomUUID().slice(0, 8)}-${namaSlug}.${ekstensi}`;
        const bufferFoto = Buffer.from(await foto.arrayBuffer());

        const { error: errorUpload } = await supabaseStorage.storage
          .from(namaBucket)
          .upload(pathFoto, bufferFoto, {
            contentType: foto.type,
            upsert: false,
          });

        if (errorUpload) {
          console.error("Gagal mengunggah foto ke Supabase Storage:", errorUpload);
          if (pathTerunggah.length > 0) {
            await supabaseStorage.storage.from(namaBucket).remove(pathTerunggah).catch(() => {});
          }
          return {
            error: "Gagal mengunggah foto produk ke penyimpanan. Coba lagi beberapa saat.",
            nilai,
          };
        }

        pathTerunggah.push(pathFoto);
        const { data: dataUrl } = supabaseStorage.storage.from(namaBucket).getPublicUrl(pathFoto);
        if (!dataUrl?.publicUrl) {
          await supabaseStorage.storage.from(namaBucket).remove(pathTerunggah).catch(() => {});
          return {
            error: "Gagal mendapatkan URL foto produk setelah unggah.",
            nilai,
          };
        }
        daftarUrlFoto.push(dataUrl.publicUrl);
      }

      dataUpdate.foto_url = serialisasiFoto(daftarUrlFoto);
    }

    const { error: errorSimpan } = await supabase
      .from("produk")
      .update(dataUpdate)
      .eq("id", id);

    if (errorSimpan) {
      console.error("Gagal menyimpan perubahan produk ke database:", errorSimpan);
      return {
        error: "Gagal menyimpan perubahan produk ke database. Periksa input lalu coba lagi.",
        nilai,
      };
    }
  } catch (error) {
    console.error("Kesalahan saat mengubah produk:", error);
    return {
      error:
        error instanceof Error && error.message.includes("Konfigurasi Supabase")
          ? error.message
          : "Terjadi kesalahan saat mengubah produk. Periksa koneksi dan pengaturan Supabase.",
      nilai,
    };
  }

  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  revalidatePath("/admin");
  redirect("/admin?status=ubah-berhasil");
}

export async function buatDeskripsiAI({ nama, kategori }) {
  const namaRapi = String(nama ?? "").trim();
  const kategoriRapi = String(kategori ?? "").trim();

  try {
    const { user } = await dapatkanAdminSesi();

    if (!user) {
      return {
        deskripsi: null,
        error: "Sesi login tidak ditemukan atau sudah berakhir. Silakan masuk kembali.",
      };
    }

    if (!namaRapi || !kategoriRapi) {
      return {
        deskripsi: null,
        error: "Isi nama produk dan kategori terlebih dahulu sebelum membuat deskripsi dengan AI.",
      };
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return {
        deskripsi: null,
        error: "GEMINI_API_KEY belum diatur di environment variable server (.env.local).",
      };
    }

    const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const prompt = [
      "Buatkan deskripsi produk UMKM kuliner/toko dalam bahasa Indonesia yang singkat, menarik, jelas, dan jujur.",
      `Nama produk: ${namaRapi}`,
      `Kategori: ${kategoriRapi}`,
      "Aturan: tulis 2 sampai 3 kalimat saja (maksimal 350 karakter), tanpa tanda kutip pembuka/penutup, tanpa markdown, dan tanpa bullet point.",
    ].join("\n");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        console.error("Gemini API error:", response.status, detail);
        return {
          deskripsi: null,
          error:
            response.status === 401 || response.status === 403
              ? "Kunci Gemini API tidak valid atau tidak memiliki izin."
              : "Gagal membuat deskripsi dari Gemini API. Coba lagi beberapa saat.",
        };
      }

      const data = await response.json();
      const deskripsi = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text ?? "")
        .join("")
        .trim();

      if (!deskripsi) {
        return {
          deskripsi: null,
          error: "Gemini API tidak mengembalikan teks deskripsi. Coba lagi.",
        };
      }

      return {
        deskripsi,
        error: null,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Kesalahan saat memanggil Gemini API:", error);
    return {
      deskripsi: null,
      error:
        error instanceof Error && error.name === "AbortError"
          ? "Permintaan ke Gemini API melebihi batas waktu. Coba lagi."
          : "Terjadi kesalahan saat menghubungi Gemini API di server.",
    };
  }
}
