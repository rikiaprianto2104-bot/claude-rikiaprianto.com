import React, { useEffect, useRef, useState } from 'react';
import { Play, Quote } from 'lucide-react';

/**
 * Satu kartu video testimoni orang tua.
 *
 * Videonya baru dimuat setelah tombol putar diklik: saat halaman dibuka yang
 * diunduh hanya gambar posternya. Tiga video testimoni berukuran ±18 MB, dan
 * halaman ini dipakai untuk iklan — pengunjung yang tidak memutarnya tidak
 * boleh ikut menanggung unduhannya.
 *
 * Dipakai bersama oleh landing Kelas Explorer dan Kelas Lanjutan.
 *
 * @param {object}   item    {nama, peran, src, poster}
 * @param {function} onPutar dipanggil sekali saat video mulai diputar
 */
const KartuVideoTestimoni = ({ item, onPutar }) => {
  const [putar, setPutar] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (putar && videoRef.current) videoRef.current.play().catch(() => {});
  }, [putar]);

  return (
    <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="relative aspect-[1280/570] bg-slate-900">
        {putar ? (
          <video
            ref={videoRef}
            src={item.src}
            poster={item.poster}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setPutar(true);
              if (onPutar) onPutar(item.nama);
            }}
            aria-label={`Putar video testimoni ${item.nama}`}
            className="group absolute inset-0 block h-full w-full"
          >
            <img
              src={item.poster}
              alt={`Cuplikan video testimoni ${item.nama}, orang tua peserta kelas AI anak Future Makers`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-slate-900/25 transition-colors group-hover:bg-slate-900/10" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#2563eb] shadow-xl transition-transform duration-300 group-hover:scale-110">
              <Play size={26} className="ml-1 fill-current" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center gap-2 px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">
        <Quote size={15} className="flex-shrink-0 text-[#2563eb]" />
        {item.nama}
        <span className="font-normal text-slate-500 dark:text-slate-400">
          · {item.peran || 'Testimoni orang tua'}
        </span>
      </figcaption>
    </figure>
  );
};

export default KartuVideoTestimoni;
