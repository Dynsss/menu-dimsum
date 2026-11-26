import { buatKlienServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function dapatkanBaseUrl() {
  return (
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  ).replace(/\/+$/, "");
}

export default async function sitemap() {
  const baseUrl = dapatkanBaseUrl();

  const halamanStatis = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select("id, created_at")
      .order("id", { ascending: true });

    if (error || !data) {
      return halamanStatis;
    }

    const halamanProduk = data.map((produk) => ({
      url: `${baseUrl}/produk/${produk.id}`,
      lastModified: produk.created_at ? new Date(produk.created_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...halamanStatis, ...halamanProduk];
  } catch (error) {
    console.error("Gagal membuat sitemap dari database:", error);
    return halamanStatis;
  }
}
