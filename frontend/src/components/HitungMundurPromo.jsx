import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

const sisaWaktu = (batasMs) => {
  const selisih = batasMs - Date.now();
  if (selisih <= 0) return null;
  return {
    jam: Math.floor(selisih / 3_600_000),
    menit: Math.floor((selisih % 3_600_000) / 60_000),
    detik: Math.floor((selisih % 60_000) / 1000),
  };
};

const Angka = ({ nilai, satuan }) => (
  <span className="flex flex-col items-center">
    <span className="min-w-[3rem] rounded-xl bg-white/15 px-2 py-1.5 text-2xl font-extrabold tabular-nums md:text-3xl">
      {String(nilai).padStart(2, '0')}
    </span>
    <span className="mt-1 text-[10px] uppercase tracking-wider text-white/70">
      {satuan}
    </span>
  </span>
);

/**
 * Hitung mundur ke batas promo yang sebenarnya (kelasLanjutan.promo.berakhir).
 * Begitu lewat, komponen ini menghilang dan onSelesai dipanggil sekali supaya
 * halaman kembali menampilkan harga normal — bukan hitungan yang mengulang
 * sendiri tiap hari.
 */
const HitungMundurPromo = ({ berakhir, label, onSelesai }) => {
  const batasMs = new Date(berakhir).getTime();
  const [sisa, setSisa] = useState(() => sisaWaktu(batasMs));

  useEffect(() => {
    const id = setInterval(() => {
      const berikutnya = sisaWaktu(batasMs);
      setSisa(berikutnya);
      if (!berikutnya) {
        clearInterval(id);
        if (onSelesai) onSelesai();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [batasMs, onSelesai]);

  if (!sisa) return null;

  const batas = new Date(batasMs);
  const tanggalBatas = batas.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });

  return (
    <div className="rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 p-5 text-white shadow-lg shadow-rose-600/25">
      <p className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider">
        <Timer size={16} /> {label}
      </p>
      <div className="mt-3 flex items-start justify-center gap-3">
        <Angka nilai={sisa.jam} satuan="Jam" />
        <span className="pt-1.5 text-2xl font-bold text-white/60">:</span>
        <Angka nilai={sisa.menit} satuan="Menit" />
        <span className="pt-1.5 text-2xl font-bold text-white/60">:</span>
        <Angka nilai={sisa.detik} satuan="Detik" />
      </div>
      <p className="mt-3 text-center text-xs text-white/85">
        Promo berakhir {tanggalBatas} pukul{' '}
        {batas.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta',
        })}{' '}
        WIB. Setelah itu harga kembali normal.
      </p>
    </div>
  );
};

export default HitungMundurPromo;
