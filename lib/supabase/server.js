import { createClient } from "@supabase/supabase-js";

/**
 * Membuat klien Supabase khusus server menggunakan SUPABASE_SECRET_KEY.
 * Hanya boleh dipanggil di Server Component, Server Action, atau Route Handler.
 */
export function buatKlienServer() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Pastikan SUPABASE_URL dan SUPABASE_SECRET_KEY sudah diisi."
    );
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
