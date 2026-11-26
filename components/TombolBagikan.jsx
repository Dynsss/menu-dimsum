"use client";

import { useState } from "react";

export default function TombolBagikan({ namaProduk }) {
  const [status, setStatus] = useState("");

  async function tanganiBagikan() {
    const url = window.location.href;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: namaProduk,
          text: `Lihat ${namaProduk}`,
          url,
        });
        setStatus("Link dibagikan");
        setTimeout(() => setStatus(""), 2500);
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
        // Lanjutkan ke salin clipboard jika Web Share gagal
      }
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const area = document.createElement("textarea");
        area.value = url;
        area.setAttribute("readonly", "");
        area.style.position = "absolute";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setStatus("Link tersalin");
    } catch {
      setStatus("Gagal menyalin link");
    }

    setTimeout(() => setStatus(""), 2500);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={tanganiBagikan}
        className="inline-flex items-center justify-center rounded-lg border border-garis bg-permukaan px-4 py-2 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
      >
        {status === "Link tersalin" ? "Link tersalin!" : "Bagikan / salin link"}
      </button>
      {status && (
        <span role="status" className="text-sm font-medium text-utama">
          {status}
        </span>
      )}
    </div>
  );
}
