export function ambilDaftarFoto(fotoUrl) {
  if (!fotoUrl) return [];

  if (Array.isArray(fotoUrl)) {
    return fotoUrl.map((item) => String(item ?? "").trim()).filter(Boolean);
  }

  const teks = String(fotoUrl).trim();
  if (!teks) return [];

  if (teks.startsWith("[")) {
    try {
      const hasil = JSON.parse(teks);
      if (Array.isArray(hasil)) {
        return hasil.map((item) => String(item ?? "").trim()).filter(Boolean);
      }
    } catch {
      return [teks];
    }
  }

  return [teks];
}

export function ambilFotoUtama(fotoUrl) {
  return ambilDaftarFoto(fotoUrl)[0] ?? "";
}

export function serialisasiFoto(daftarUrl) {
  const bersih = (daftarUrl ?? []).map((item) => String(item ?? "").trim()).filter(Boolean);
  if (bersih.length <= 1) {
    return bersih[0] ?? "";
  }
  return JSON.stringify(bersih);
}
