"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { hapusKategori, tambahKategori, ubahKategori } from "./actions";
import Tombol from "@/components/Tombol";

const stateAwal = { error: null, sukses: null };

function BarisKategori({ kategori, onSelesai }) {
  const [sedangUbah, setSedangUbah] = useState(false);
  const [namaEdit, setNamaEdit] = useState(kategori.nama);
  const [stateUbah, aksiUbah, prosesUbah] = useActionState(ubahKategori, stateAwal);
  const [stateHapus, aksiHapus, prosesHapus] = useActionState(hapusKategori, stateAwal);

  useEffect(() => {
    if (stateUbah?.sukses) {
      setSedangUbah(false);
      onSelesai?.(stateUbah.sukses, null);
    } else if (stateUbah?.error) {
      onSelesai?.(null, stateUbah.error);
    }
  }, [stateUbah, onSelesai]);

  useEffect(() => {
    if (stateHapus?.sukses) {
      onSelesai?.(stateHapus.sukses, null);
    } else if (stateHapus?.error) {
      onSelesai?.(null, stateHapus.error);
    }
  }, [stateHapus, onSelesai]);

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-garis bg-latar p-4 sm:flex-row sm:items-center sm:justify-between">
      {sedangUbah ? (
        <form action={aksiUbah} className="flex flex-1 flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={kategori.id} />
          <input
            type="text"
            name="nama"
            value={namaEdit}
            onChange={(e) => setNamaEdit(e.target.value)}
            required
            className="min-w-44 flex-1 rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
          />
          <Tombol type="submit" disabled={prosesUbah}>
            {prosesUbah ? "Menyimpan..." : "Simpan"}
          </Tombol>
          <Tombol
            type="button"
            varian="garis"
            onClick={() => {
              setSedangUbah(false);
              setNamaEdit(kategori.nama);
            }}
          >
            Batal
          </Tombol>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-teks">{kategori.nama}</span>
            <span className="rounded-md bg-permukaan px-2 py-0.5 text-xs font-medium text-teks-lembut">
              {kategori.jumlahProduk} produk
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Tombol
              type="button"
              varian="garis"
              onClick={() => {
                setNamaEdit(kategori.nama);
                setSedangUbah(true);
              }}
            >
              Ubah
            </Tombol>

            <form
              action={aksiHapus}
              onSubmit={(e) => {
                if (!window.confirm(`Hapus kategori "${kategori.nama}"?`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={kategori.id} />
              <Tombol type="submit" varian="bahaya" disabled={prosesHapus}>
                {prosesHapus ? "Menghapus..." : "Hapus"}
              </Tombol>
            </form>
          </div>
        </>
      )}
    </li>
  );
}

export default function KelolaKategori({ daftarKategori }) {
  const formTambahRef = useRef(null);
  const [stateTambah, aksiTambah, prosesTambah] = useActionState(tambahKategori, stateAwal);
  const [pesanSukses, setPesanSukses] = useState(null);
  const [pesanError, setPesanError] = useState(null);

  useEffect(() => {
    if (stateTambah?.sukses) {
      formTambahRef.current?.reset();
      setPesanSukses(stateTambah.sukses);
      setPesanError(null);
    } else if (stateTambah?.error) {
      setPesanError(stateTambah.error);
      setPesanSukses(null);
    }
  }, [stateTambah]);

  function tanganiHasilBaris(sukses, error) {
    if (sukses) {
      setPesanSukses(sukses);
      setPesanError(null);
    } else if (error) {
      setPesanError(error);
      setPesanSukses(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        ref={formTambahRef}
        action={aksiTambah}
        className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold">
          Tambah kategori baru
          <input
            type="text"
            name="nama"
            placeholder="Contoh: Dimsum Goreng"
            required
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-normal text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </label>
        <Tombol type="submit" disabled={prosesTambah} className="sm:shrink-0">
          {prosesTambah ? "Menambah..." : "Tambah kategori"}
        </Tombol>
      </form>

      {pesanSukses && (
        <p
          role="status"
          className="rounded-xl border border-utama/30 bg-utama/10 px-4 py-3 text-sm font-medium text-utama"
        >
          {pesanSukses}
        </p>
      )}

      {pesanError && (
        <p
          role="alert"
          className="rounded-xl border border-bahaya/30 bg-bahaya/5 px-4 py-3 text-sm text-bahaya"
        >
          {pesanError}
        </p>
      )}

      {daftarKategori.length === 0 ? (
        <p className="rounded-2xl border border-garis bg-permukaan p-6 text-sm text-teks-lembut">
          Belum ada kategori tersimpan.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftarKategori.map((kategori) => (
            <BarisKategori
              key={kategori.id}
              kategori={kategori}
              onSelesai={tanganiHasilBaris}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
