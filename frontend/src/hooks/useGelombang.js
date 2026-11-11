import { useEffect, useState } from 'react';
import {
  akhirHargaPromo,
  gelombangSaatIni,
} from '../data/kelasLanjutan';

/**
 * Status gelombang pendaftaran Kelas Lanjutan, diperbarui tiap detik.
 *
 * `sisa` menghitung mundur ke akhir gelombang promo TERAKHIR — saat harga
 * benar-benar kembali normal — bukan ke akhir gelombang yang sedang berjalan.
 * Gelombang 1 dan 2 harganya sama, jadi hitung mundur ke akhir Gelombang 1
 * akan menjanjikan kenaikan harga yang tidak akan terjadi.
 *
 * Saat tenggatnya lewat sementara halaman masih terbuka, `aktif` berubah
 * sendiri jadi false dan harga di seluruh halaman ikut kembali normal tanpa
 * perlu dimuat ulang.
 */
export const useGelombang = () => {
  const [sekarang, setSekarang] = useState(() => Date.now());
  const sisaMs = Math.max(0, akhirHargaPromo() - sekarang);
  const aktif = sisaMs > 0;

  useEffect(() => {
    if (!aktif) return undefined;
    const id = setInterval(() => setSekarang(Date.now()), 1000);
    return () => clearInterval(id);
  }, [aktif]);

  const detik = Math.floor(sisaMs / 1000);
  return {
    aktif,
    sekarang: gelombangSaatIni(sekarang),
    sisa: {
      hari: Math.floor(detik / 86400),
      jam: Math.floor((detik % 86400) / 3600),
      menit: Math.floor((detik % 3600) / 60),
      detik: detik % 60,
    },
  };
};
