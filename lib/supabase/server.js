import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

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

/**
 * Membuat klien Supabase berbasis sesi cookie admin menggunakan SUPABASE_PUBLISHABLE_KEY.
 * Hanya boleh dipanggil di Server Component, Server Action, atau Route Handler.
 */
export async function buatKlienSesi() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Konfigurasi Supabase Auth belum lengkap. Pastikan SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY sudah diisi."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Dipanggil dari Server Component; cookie sesi diperbarui oleh Server Action atau proxy.
        }
      },
    },
  });
}
