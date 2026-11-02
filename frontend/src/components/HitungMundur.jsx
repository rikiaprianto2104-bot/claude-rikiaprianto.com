import React from 'react';

const dua = (n) => String(n).padStart(2, '0');

/**
 * Hitung mundur Hari : Jam : Menit : Detik. Nilainya datang dari
 * usePromoExplorer, komponen ini hanya menampilkan.
 * `terang` dipakai di atas latar biru (kartu promo).
 */
const HitungMundur = ({ sisa, terang = false }) => {
  const kotak = [
    ['Hari', sisa.hari],
    ['Jam', sisa.jam],
    ['Menit', sisa.menit],
    ['Detik', sisa.detik],
  ];
  return (
    <div
      role="timer"
      aria-label={`Sisa waktu promo: ${sisa.hari} hari ${sisa.jam} jam ${sisa.menit} menit`}
      className="flex items-center gap-2 sm:gap-3"
    >
      {kotak.map(([label, nilai]) => (
        <div
          key={label}
          className={`flex w-16 flex-col items-center rounded-2xl px-2 py-3 sm:w-20 ${
            terang ? 'bg-white/15 text-white' : 'bg-slate-900 text-white dark:bg-white/10'
          }`}
        >
          <span className="text-2xl font-extrabold tabular-nums leading-none sm:text-3xl">
            {dua(nilai)}
          </span>
          <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default HitungMundur;
