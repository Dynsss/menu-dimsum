import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FavoritProvider } from "@/components/FavoritProvider";
import { KeranjangProvider } from "@/components/KeranjangProvider";
import PwaRegister from "@/components/PwaRegister";
import { toko } from "@/lib/toko";

const baseUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: toko.nama,
  description: toko.tagline,
  openGraph: {
    title: toko.nama,
    description: toko.tagline,
    siteName: toko.nama,
    type: "website",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: toko.nama,
  },
};

export const viewport = {
  themeColor: "#1f6b4f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("dynss-tema");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <PwaRegister />
        <FavoritProvider>
          <KeranjangProvider>
            <Header />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
            <Footer />
          </KeranjangProvider>
        </FavoritProvider>
      </body>
    </html>
  );
}
