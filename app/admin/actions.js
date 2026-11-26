"use server";

import { redirect } from "next/navigation";
import { buatKlienSesi } from "@/lib/supabase/server";

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
