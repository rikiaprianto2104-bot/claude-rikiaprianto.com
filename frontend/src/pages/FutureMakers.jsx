import React, { useEffect } from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

/*
 * Halaman menu "Future Maker".
 *
 * Isinya sengaja baru satu hal: pintu masuk ke Pixi. Portofolio siswa menyusul
 * nanti dan akan ditaruh di halaman ini juga.
 *
 * Halaman kelas "Kelas Offline Future Makers" TIDAK di sini — itu halaman
 * penjualan yang tinggal di /blog/kelas-future-makers.
 */
const FutureMakers = () => {
  useEffect(() => {
    document.title = 'Future Maker — Ngobrol dengan Pixi | Riki MarkeThink';
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-2xl">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#0d9eff] bg-[#eaf6ff] dark:bg-[#0d9eff]/10 px-3 py-1 rounded-full">
          Future Maker
        </span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Ruang Karya Future Makers
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Tempat berkumpulnya hal-hal seru dari kelas Future Makers. Untuk
          sekarang, kenalan dulu yuk sama maskotnya.
        </p>
      </div>

      {/* Pintu masuk ke Pixi. Halaman Pixi ada di /pixi/ (folder fisik di public/,
          bukan route React) karena butuh seluruh layar untuk model 3D-nya. */}
      <a
        href="/pixi/"
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-10 block rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1220] p-8 md:p-10 max-w-xl transition-all hover:border-[#6c5ce7] hover:shadow-xl hover:shadow-[#6c5ce7]/10"
      >
        <div className="flex items-center gap-6">
          <div
            aria-hidden="true"
            className="w-24 h-24 shrink-0 rounded-2xl bg-gradient-to-br from-[#dcd5ff] to-[#f3f0ff] dark:from-[#2a2270] dark:to-[#1a1547] flex items-center justify-center transition-transform group-hover:scale-105"
          >
            <Sparkles size={48} className="text-[#6c5ce7] dark:text-[#a99bff]" />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Pixi AI
              <ArrowUpRight
                size={22}
                className="text-[#6c5ce7] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
              Robot bintang 3D yang bisa diajak ngobrol sungguhan. Nyalakan
              tombol mikrofonnya, lalu bicara seperti biasa.
            </p>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Gratis, tanpa mendaftar, dan tidak meminta data apa pun.
            </p>
          </div>
        </div>
      </a>
    </div>
  );
};

export default FutureMakers;
