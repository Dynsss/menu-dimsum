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
  let berhasil = false;

  try {
    const supabase = await buatKlienSesi();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Gagal keluar admin:", error);
      return { error: "Gagal mengakhiri sesi. Silakan coba lagi." };
    }

    berhasil = true;
  } catch (error) {
    console.error("Gagal keluar admin:", error);
    return { error: "Terjadi kesalahan saat keluar. Silakan coba lagi." };
  }

  if (berhasil) {
    redirect("/admin/login");
  }
}

export async function gantiPassword(_stateSebelumnya, formData) {
  const passwordBaru = String(formData.get("password_baru") ?? "");
  const konfirmasiPassword = String(formData.get("konfirmasi_password") ?? "");

  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return {
        error: "Sesi login tidak ditemukan atau sudah berakhir. Silakan masuk kembali.",
        sukses: null,
      };
    }

    if (!passwordBaru || passwordBaru.length < 8) {
      return {
        error: "Password baru minimal 8 karakter.",
        sukses: null,
      };
    }

    if (passwordBaru !== konfirmasiPassword) {
      return {
        error: "Password baru dan konfirmasi password tidak sama.",
        sukses: null,
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      console.error("Gagal mengganti password admin:", error);
      return {
        error:
          error.message ||
          "Gagal mengganti password. Pastikan password baru memenuhi ketentuan lalu coba lagi.",
        sukses: null,
      };
    }

    return {
      error: null,
      sukses: "Password berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Kesalahan saat mengganti password:", error);
    return {
      error:
        error instanceof Error && error.message.includes("Konfigurasi Supabase")
          ? error.message
          : "Terjadi kesalahan saat mengganti password. Periksa koneksi dan pengaturan Supabase.",
      sukses: null,
    };
  }
}

const PRODUK_ADMIN_PER_HALAMAN = 10;

export async function ambilDaftarProdukAdmin(opsi = {}) {
  const kataKunci = typeof opsi?.q === "string" ? opsi.q.trim() : "";
  const kategoriFilter = typeof opsi?.kategori === "string" ? opsi.kategori.trim() : "";
  const halamanDiminta =
    Number.isFinite(Number(opsi?.halaman)) && Number(opsi?.halaman) >= 1
      ? Math.floor(Number(opsi.halaman))
      : 1;
  const perHalaman =
    Number.isFinite(Number(opsi?.perHalaman)) && Number(opsi?.perHalaman) >= 1
      ? Math.floor(Number(opsi.perHalaman))
      : PRODUK_ADMIN_PER_HALAMAN;

  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return {
        tidakTerautentikasi: true,
        daftarProduk: [],
        daftarKategori: [],
        ringkasan: { totalProduk: 0, jumlahHabis: 0, perKategori: [] },
        totalProdukTersaring: 0,
        totalHalaman: 1,
        halamanAktif: 1,
        pesanError: "Sesi login telah berakhir. Silakan masuk kembali.",
      };
    }

    // Ambil ringkasan seluruh katalog untuk dashboard & daftar kategori
    let { data: dataRingkasan, error: errorRingkasan } = await supabase
      .from("produk")
      .select("kategori, stok");

    if (errorRingkasan && (errorRingkasan.code === "42703" || errorRingkasan.message?.includes("stok"))) {
      ({ data: dataRingkasan, error: errorRingkasan } = await supabase
        .from("produk")
        .select("kategori"));
    }

    const petaKategori = new Map();
    let jumlahHabis = 0;
    (dataRingkasan ?? []).forEach((item) => {
      const namaKategori = item.kategori?.trim() || "Tanpa kategori";
      petaKategori.set(namaKategori, (petaKategori.get(namaKategori) ?? 0) + 1);
      if (typeof item.stok === "number" && item.stok <= 0) {
        jumlahHabis += 1;
      }
    });

    const perKategori = Array.from(petaKategori.entries())
      .map(([nama, jumlah]) => ({ nama, jumlah }))
      .sort((a, b) => a.nama.localeCompare(b.nama, "id"));

    const daftarKategori = Array.from(
      new Set((dataRingkasan ?? []).map((item) => item.kategori?.trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "id"));

    const ringkasan = {
      totalProduk: (dataRingkasan ?? []).length,
      jumlahHabis,
      perKategori,
    };

    const bangunQuery = (halamanTarget, sertakanKolomOpsional = true) => {
      const awal = (halamanTarget - 1) * perHalaman;
      const akhir = awal + perHalaman - 1;
      const kolom = sertakanKolomOpsional
        ? "id, nama, harga, harga_diskon, badge, deskripsi, foto_url, kategori, stok, aktif, created_at"
        : "id, nama, harga, deskripsi, foto_url, kategori, created_at";

      let query = supabase.from("produk").select(kolom, { count: "exact" });

      if (kataKunci) {
        query = query.ilike("nama", `%${kataKunci}%`);
      }

      if (kategoriFilter) {
        query = query.eq("kategori", kategoriFilter);
      }

      return query.order("id", { ascending: true }).range(awal, akhir);
    };

    let sertakanKolomOpsional = true;
    let { data, count, error } = await bangunQuery(halamanDiminta, sertakanKolomOpsional);

    if (
      error &&
      (error.code === "42703" ||
        error.message?.includes("stok") ||
        error.message?.includes("harga_diskon") ||
        error.message?.includes("badge") ||
        error.message?.includes("aktif"))
    ) {
      sertakanKolomOpsional = false;
      ({ data, count, error } = await bangunQuery(halamanDiminta, false));
    }

    if (error) {
      console.error("Gagal mengambil daftar produk admin:", error);
      return {
        tidakTerautentikasi: false,
        daftarProduk: [],
        daftarKategori,
        ringkasan,
        totalProdukTersaring: 0,
        totalHalaman: 1,
        halamanAktif: 1,
        pesanError:
          "Gagal mengambil daftar produk dari database. Periksa koneksi Supabase lalu coba muat ulang.",
      };
    }

    const totalProdukTersaring = count ?? 0;
    const totalHalaman = Math.max(1, Math.ceil(totalProdukTersaring / perHalaman));
    let halamanAktif = halamanDiminta;

    if (halamanDiminta > totalHalaman && totalProdukTersaring > 0) {
      halamanAktif = totalHalaman;
      const ulang = await bangunQuery(halamanAktif, sertakanKolomOpsional);
      if (!ulang.error) {
        data = ulang.data;
      }
    }

    return {
      tidakTerautentikasi: false,
      daftarProduk: data ?? [],
      daftarKategori,
      ringkasan,
      totalProdukTersaring,
      totalHalaman,
      halamanAktif,
      pesanError: null,
    };
  } catch (error) {
    console.error("Kesalahan saat mengambil produk admin:", error);
    return {
      tidakTerautentikasi: false,
      daftarProduk: [],
      daftarKategori: [],
      ringkasan: { totalProduk: 0, jumlahHabis: 0, perKategori: [] },
      totalProdukTersaring: 0,
      totalHalaman: 1,
      halamanAktif: 1,
      pesanError:
        error instanceof Error && error.message.includes("Konfigurasi Supabase")
          ? error.message
          : "Terjadi kesalahan saat menghubungkan ke database. Periksa pengaturan Supabase di server.",
    };
  }
}

function validasiInputProduk(formData, { wajibFoto }) {
  const nama = String(formData.get("nama") ?? "").trim();
  const hargaTeks = String(formData.get("harga") ?? "").trim();
  const hargaDiskonTeks = String(formData.get("harga_diskon") ?? "").trim();
  const badgeTeks = String(formData.get("badge") ?? "").trim();
  const stokTeks = String(formData.get("stok") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "").trim();
  const daftarFoto = formData
    .getAll("foto")
    .filter((item) => item && typeof item !== "string" && item.size > 0);

  const nilai = {
    nama,
    harga: hargaTeks,
    harga_diskon: hargaDiskonTeks,
    badge: badgeTeks,
    stok: stokTeks,
    kategori,
    deskripsi,
  };

  const errorField = {};

  if (!nama) {
    errorField.nama = "Nama produk wajib diisi.";
  }

  const harga = Number(hargaTeks);
  if (!hargaTeks || !Number.isFinite(harga) || !Number.isInteger(harga) || harga <= 0) {
    errorField.harga = "Harga produk wajib berupa angka bulat lebih dari 0.";
  }

  let hargaDiskon = null;
  if (hargaDiskonTeks !== "") {
    const angkaDiskon = Number(hargaDiskonTeks);
    if (
      !Number.isFinite(angkaDiskon) ||
      !Number.isInteger(angkaDiskon) ||
      angkaDiskon <= 0 ||
      (Number.isFinite(harga) && harga > 0 && angkaDiskon >= harga)
    ) {
      errorField.harga_diskon =
        "Harga diskon harus berupa angka bulat lebih dari 0 dan lebih kecil dari harga normal.";
    } else {
      hargaDiskon = angkaDiskon;
    }
  }

  const badge = ["Baru", "Terlaris"].includes(badgeTeks) ? badgeTeks : null;

  const stokNilai = stokTeks === "" ? "0" : stokTeks;
  const stok = Number(stokNilai);
  if (!Number.isFinite(stok) || !Number.isInteger(stok) || stok < 0) {
    errorField.stok = "Stok produk harus berupa angka bulat 0 atau lebih.";
  }

  if (!kategori) {
    errorField.kategori = "Kategori produk wajib dipilih atau diisi.";
  }

  if (!deskripsi) {
    errorField.deskripsi = "Deskripsi produk wajib diisi.";
  }

  if (wajibFoto && daftarFoto.length === 0) {
    errorField.foto = "Foto produk wajib diunggah.";
  } else if (daftarFoto.length > 5) {
    errorField.foto = "Maksimal 5 foto per produk.";
  } else {
    for (const foto of daftarFoto) {
      if (!TIPE_FOTO_DIIZINKAN.includes(foto.type)) {
        errorField.foto = "Format semua foto harus berupa JPG, PNG, WebP, atau GIF.";
        break;
      }
      if (foto.size > UKURAN_MAKSIMAL_FOTO) {
        errorField.foto = "Ukuran setiap foto maksimal 5 MB.";
        break;
      }
    }
  }

  return {
    nilai,
    errorField,
    data: {
      nama,
      harga,
      hargaDiskon,
      badge,
      stok,
      kategori,
      deskripsi,
      daftarFoto,
    },
  };
}

export async function tambahProduk(_stateSebelumnya, formData) {
  const { nilai, errorField, data } = validasiInputProduk(formData, { wajibFoto: true });

  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return {
        error: "Sesi login tidak ditemukan atau sudah berakhir. Silakan masuk kembali.",
        errorField: {},
        nilai,
      };
    }

    if (Object.keys(errorField).length > 0) {
      return {
        error: "Periksa kembali isian yang masih salah.",
        errorField,
        nilai,
      };
    }

    const { nama, harga, hargaDiskon, badge, stok, kategori, deskripsi, daftarFoto } = data;

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

    let { error: errorSimpan } = await supabase.from("produk").insert({
      nama,
      harga,
      harga_diskon: hargaDiskon,
      badge,
      stok,
      kategori,
      deskripsi,
      foto_url: serialisasiFoto(daftarUrlFoto),
    });

    if (
      errorSimpan &&
      (errorSimpan.code === "42703" ||
        errorSimpan.message?.includes("stok") ||
        errorSimpan.message?.includes("harga_diskon") ||
        errorSimpan.message?.includes("badge"))
    ) {
      ({ error: errorSimpan } = await supabase.from("produk").insert({
        nama,
        harga,
        kategori,
        deskripsi,
        foto_url: serialisasiFoto(daftarUrlFoto),
      }));
    }

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
  const { nilai, errorField, data } = validasiInputProduk(formData, { wajibFoto: false });

  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return {
        error: "Sesi login tidak ditemukan atau sudah berakhir. Silakan masuk kembali.",
        errorField: {},
        nilai,
      };
    }

    if (!id || !/^\d+$/.test(id)) {
      return { error: "ID produk tidak valid.", errorField: {}, nilai };
    }

    if (Object.keys(errorField).length > 0) {
      return {
        error: "Periksa kembali isian yang masih salah.",
        errorField,
        nilai,
      };
    }

    const { nama, harga, hargaDiskon, badge, stok, kategori, deskripsi, daftarFoto } = data;

    const dataUpdate = {
      nama,
      harga,
      harga_diskon: hargaDiskon,
      badge,
      stok,
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

    let { error: errorSimpan } = await supabase
      .from("produk")
      .update(dataUpdate)
      .eq("id", id);

    if (
      errorSimpan &&
      (errorSimpan.code === "42703" ||
        errorSimpan.message?.includes("stok") ||
        errorSimpan.message?.includes("harga_diskon") ||
        errorSimpan.message?.includes("badge"))
    ) {
      const {
        stok: _abaikanStok,
        harga_diskon: _abaikanDiskon,
        badge: _abaikanBadge,
        ...dataTanpaOpsional
      } = dataUpdate;
      ({ error: errorSimpan } = await supabase
        .from("produk")
        .update(dataTanpaOpsional)
        .eq("id", id));
    }

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

export async function hapusProduk(id) {
  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return {
        tidakTerautentikasi: true,
        error: "Sesi login tidak ditemukan atau sudah berakhir. Silakan masuk kembali.",
      };
    }

    const idTeks = String(id ?? "").trim();
    if (!idTeks || !/^\d+$/.test(idTeks)) {
      return { error: "ID produk tidak valid." };
    }

    const { error } = await supabase.from("produk").delete().eq("id", idTeks);

    if (error) {
      console.error("Gagal menghapus produk:", error);
      return { error: "Gagal menghapus produk dari database." };
    }

    revalidatePath("/");
    revalidatePath(`/produk/${idTeks}`);
    revalidatePath("/admin");
    revalidatePath("/sitemap.xml");
    return { error: null };
  } catch (error) {
    console.error("Kesalahan saat menghapus produk:", error);
    return { error: "Terjadi kesalahan saat menghapus produk." };
  }
}

export async function toggleAktifProduk(id, aktifSaatIni) {
  try {
    const { supabase, user } = await dapatkanAdminSesi();

    if (!user || !supabase) {
      return {
        tidakTerautentikasi: true,
        error: "Sesi login tidak ditemukan atau sudah berakhir. Silakan masuk kembali.",
      };
    }

    const idTeks = String(id ?? "").trim();
    if (!idTeks || !/^\d+$/.test(idTeks)) {
      return { error: "ID produk tidak valid." };
    }

    const aktifBaru = !Boolean(aktifSaatIni);
    const { error } = await supabase
      .from("produk")
      .update({ aktif: aktifBaru })
      .eq("id", idTeks);

    if (error) {
      if (error.code === "42703" || error.message?.includes("aktif")) {
        return {
          error: "Kolom 'aktif' belum ada di tabel produk. Jalankan SQL migrasi di Supabase terlebih dahulu.",
        };
      }
      console.error("Gagal mengubah status aktif produk:", error);
      return { error: "Gagal mengubah status produk di database." };
    }

    revalidatePath("/");
    revalidatePath(`/produk/${idTeks}`);
    revalidatePath("/admin");
    revalidatePath("/sitemap.xml");
    return { error: null, aktifBaru };
  } catch (error) {
    console.error("Kesalahan saat mengubah status aktif produk:", error);
    return { error: "Terjadi kesalahan saat mengubah status produk." };
  }
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
