"use client";

import { useEffect, useState } from "react";

const KUNCI_TEMA = "dynss-tema";

export default function TombolModeGelap() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    setGelap(document.documentElement.classList.contains("dark"));
  }, []);

  function tanganiToggle() {
    const modeBerikutnya = !gelap;
    setGelap(modeBerikutnya);
    document.documentElement.classList.toggle("dark", modeBerikutnya);
    try {
      localStorage.setItem(KUNCI_TEMA, modeBerikutnya ? "dark" : "light");
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  return (
    <button
      type="button"
      onClick={tanganiToggle}
      aria-label={gelap ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={gelap ? "Mode terang" : "Mode gelap"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-permukaan text-teks transition-colors hover:border-utama hover:text-utama"
    >
      {gelap ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
