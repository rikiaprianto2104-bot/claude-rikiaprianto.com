import { useEffect, useState } from 'react';
import { kelasExplorer, promoBerakhirMs } from '../data/kelasExplorer';

/**
 * Status promo Kelas Explorer yang diperbarui tiap detik.
 * Dipakai bersama oleh landing page dan formulir supaya harga yang tampil
 * selalu sama, termasuk saat promo habis ketika halaman masih terbuka.
 */
export const usePromoExplorer = () => {
  const [sekarang, setSekarang] = useState(() => Date.now());
  const sisaMs = Math.max(0, promoBerakhirMs() - sekarang);
  const aktif = sisaMs > 0;

  useEffect(() => {
    if (!aktif) return undefined;
    const id = setInterval(() => setSekarang(Date.now()), 1000);
    return () => clearInterval(id);
  }, [aktif]);

  const detik = Math.floor(sisaMs / 1000);
  return {
    aktif,
    harga: aktif ? kelasExplorer.harga.promo : kelasExplorer.harga.normal,
    hemat: aktif ? kelasExplorer.harga.normal - kelasExplorer.harga.promo : 0,
    sisa: {
      hari: Math.floor(detik / 86400),
      jam: Math.floor((detik % 86400) / 3600),
      menit: Math.floor((detik % 3600) / 60),
      detik: detik % 60,
    },
  };
};
