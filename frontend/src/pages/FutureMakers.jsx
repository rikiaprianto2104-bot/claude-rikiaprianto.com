import React, { useEffect } from 'react';
import { Sparkles, ArrowUpRight, Lock, Play } from 'lucide-react';

/*
 * Halaman menu "Future Maker".
 *
 * Dua hal di sini: pintu masuk ke Pixi (kiri) dan materi tiap pertemuan kelas
 * gratis Oktober 2026 (kanan). Portofolio siswa menyusul nanti di halaman ini.
 *
 * Materi tiap pertemuan adalah satu file HTML mandiri di public/future-maker/,
 * bukan route React, karena dipakai sebagai slide proyektor di kelas (butuh
 * seluruh layar, dan harus tetap jalan walau WiFi kelas mati).
 *
 * Halaman kelas "Kelas Offline Future Makers" TIDAK di sini — itu halaman
 * penjualan yang tinggal di /blog/kelas-future-makers.
 */
const PERTEMUAN = [
  {
    no: 1,
    judul: 'Puzzle Prompt Ajaib',
    tanggal: 'Minggu, 4 Oktober 2026',
    ringkas:
      'Kenalan dengan AI dan ChatGPT, lalu menyusun resep prompt: SIAPA, APA, GIMANA, DI MANA.',
    href: '/future-maker/pertemuan-1/',
  },
  {
    no: 2,
    judul: 'Labirin Digital',
    tanggal: 'Minggu, 11 Oktober 2026',
    ringkas: 'Materi sedang disiapkan.',
    href: null,
  },
  {
    no: 3,
    judul: 'Bangun Portofolio',
    tanggal: 'Minggu, 18 Oktober 2026',
    ringkas: 'Materi sedang disiapkan.',
    href: null,
  },
  {
    no: 4,
    judul: 'Demo Day',
    tanggal: 'Minggu, 25 Oktober 2026',
    ringkas: 'Materi sedang disiapkan.',
    href: null,
  },
];

const KartuPertemuan = ({ item }) => {
  const siap = Boolean(item.href);

  const isi = (
    <>
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-base font-extrabold ${
            siap
              ? 'bg-[#6c5ce7] text-white'
              : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'
          }`}
        >
          {item.no}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              siap ? 'text-[#6c5ce7] dark:text-[#a99bff]' : 'text-slate-400'
            }`}
          >
            Pertemuan {item.no} · {item.tanggal}
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            {item.judul}
            {siap ? (
              <ArrowUpRight
                size={18}
                className="text-[#6c5ce7] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            ) : (
              <Lock size={15} className="text-slate-400" />
            )}
          </h3>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {item.ringkas}
          </p>

          {siap && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6c5ce7] dark:text-[#a99bff]">
              <Play size={14} className="fill-current" />
              Buka materi
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (!siap) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] p-5 md:p-6">
        {isi}
      </div>
    );
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1220] p-5 md:p-6 transition-all hover:border-[#6c5ce7] hover:shadow-lg hover:shadow-[#6c5ce7]/10"
    >
      {isi}
    </a>
  );
};

const FutureMakers = () => {
  useEffect(() => {
    document.title = 'Future Maker — Materi Kelas & Pixi | Riki MarkeThink';
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
          Tempat berkumpulnya hal-hal seru dari kelas Future Makers. Kenalan dulu
          yuk sama maskotnya, lalu buka materi tiap pertemuan.
        </p>
      </div>

      <div className="mt-12 grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        {/* Kiri: pintu masuk ke Pixi. Halaman Pixi ada di /pixi/ (folder fisik di
            public/, bukan route React) karena butuh seluruh layar untuk model 3D-nya. */}
        <a
          href="/pixi/"
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1220] p-8 md:p-10 transition-all hover:border-[#6c5ce7] hover:shadow-xl hover:shadow-[#6c5ce7]/10"
        >
          <div
            aria-hidden="true"
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#dcd5ff] to-[#f3f0ff] dark:from-[#2a2270] dark:to-[#1a1547] flex items-center justify-center transition-transform group-hover:scale-105"
          >
            <Sparkles size={48} className="text-[#6c5ce7] dark:text-[#a99bff]" />
          </div>

          <h2 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Pixi AI
            <ArrowUpRight
              size={22}
              className="text-[#6c5ce7] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            Robot bintang 3D yang bisa diajak ngobrol sungguhan. Nyalakan tombol
            mikrofonnya, lalu bicara seperti biasa.
          </p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Gratis, tanpa mendaftar, dan tidak meminta data apa pun.
          </p>
        </a>

        {/* Kanan: materi tiap pertemuan. */}
        <div>
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Materi Kelas
            </h2>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Kelas gratis · Oktober 2026
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Slide yang dipakai di kelas. Boleh dibuka lagi di rumah bersama orang
            tua untuk mengulang pelajaran.
          </p>

          <div className="mt-6 space-y-4">
            {PERTEMUAN.map((item) => (
              <KartuPertemuan key={item.no} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutureMakers;
