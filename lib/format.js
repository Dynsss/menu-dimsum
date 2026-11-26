export function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
}

export function dapatkanInfoHarga(produk) {
  const hargaNormal = Number(produk?.harga ?? 0);
  const hargaDiskon = produk?.harga_diskon;
  const adaDiskon =
    typeof hargaDiskon === "number" && hargaDiskon > 0 && hargaDiskon < hargaNormal;

  return {
    adaDiskon,
    hargaAktif: adaDiskon ? hargaDiskon : hargaNormal,
    hargaCoret: adaDiskon ? hargaNormal : null,
  };
}
