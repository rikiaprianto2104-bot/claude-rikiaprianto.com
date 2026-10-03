import React, { useEffect } from 'react';
import { Sparkles, Mic, ShieldCheck, Lock, Play } from 'lucide-react';

/*
 * Halaman menu "Future Maker".
 *
 * Dua bagian: banner Pixi di atas, lalu materi tiap pertemuan kelas gratis
 * Oktober 2026 sebagai grid di bawahnya. Portofolio siswa menyusul nanti di
 * halaman ini juga.
 *
 * Materi tiap pertemuan adalah satu file HTML mandiri di public/future-maker/,
 * bukan route React, karena dipakai sebagai slide proyektor di kelas (butuh
 * seluruh layar, dan harus tetap jalan walau WiFi kelas mati).
 *
 * Halaman kelas "Kelas Offline Future Makers" TIDAK di sini - itu halaman
 * penjualan yang tinggal di /blog/kelas-future-makers.
 */
const PERTEMUAN = [
  {
    no: 1,
    judul: 'Puzzle Prompt Ajaib',
    tanggal: 'Minggu, 4 Oktober 2026',
    singkat: '4 Okt',
    ringkas:
      'Kenalan dengan AI dan ChatGPT, lalu menyusun resep prompt: SIAPA, APA, GIMANA, DI MANA.',
    href: '/future-maker/pertemuan-1/',
  },
  {
    no: 2,
    judul: 'Labirin Digital',
    tanggal: 'Minggu, 11 Oktober 2026',
    singkat: '11 Okt',
    ringkas: 'Materi sedang disiapkan.',
    href: null,
  },
  {
    no: 3,
    judul: 'Bangun Portofolio',
    tanggal: 'Minggu, 18 Oktober 2026',
    singkat: '18 Okt',
    ringkas: 'Materi sedang disiapkan.',
    href: null,
  },
  {
    no: 4,
    judul: 'Demo Day',
    tanggal: 'Minggu, 25 Oktober 2026',
    singkat: '25 Okt',
    ringkas: 'Materi sedang disiapkan.',
    href: null,
  },
];

const TERBUKA = PERTEMUAN.filter((p) => p.href).length;

/*
 * Kartu materi. Yang sudah ada materinya jadi <a>; yang belum sengaja TIDAK
 * dibuat tombol mati - teksnya saja, supaya tidak ada yang mengklik lalu
 * bingung kenapa tidak terjadi apa-apa.
 */
const KartuPertemuan = ({ item }) => {
  const siap = Boolean(item.href);

  const isi = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span
          aria-hidden="true"
          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-base font-extrabold ${
            siap
              ? 'bg-[#6c5ce7] text-white'
              : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'
          }`}
        >
          {item.no}
        </span>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            siap
              ? 'bg-[#f3f0ff] dark:bg-[#6c5ce7]/15 text-[#6c5ce7] dark:text-[#a99bff]'
              : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
          }`}
        >
          {!siap && <Lock size={11} />}
          {siap ? 'Sudah dibuka' : 'Segera'}
        </span>
      </div>

      <p
        className={`mt-5 text-xs font-semibold ${
          siap ? 'text-[#6c5ce7] dark:text-[#a99bff]' : 'text-slate-400'
        }`}
      >
        {item.tanggal}
      </p>
      <h3 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
        {item.judul}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {item.ringkas}
      </p>

      {/* Tombol didorong ke bawah supaya rata walau tinggi teksnya beda-beda. */}
      <div className="mt-auto pt-5">
        {siap ? (
          <span className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#6c5ce7] px-4 py-2.5 text-sm font-bold text-white transition-colors group-hover:bg-[#5a4bd4]">
            <Play size={14} className="fill-current" />
            Buka materi
          </span>
        ) : (
          <span className="flex items-center justify-center w-full rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500">
            Dibuka {item.singkat}
          </span>
        )}
      </div>
    </>
  );

  const dasar = 'flex flex-col rounded-2xl p-5 h-full border transition-all';

  if (!siap) {
    return (
      <div
        className={`${dasar} border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]`}
      >
        {isi}
      </div>
    );
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group ${dasar} border-[#6c5ce7] bg-white dark:bg-[#0b1220] shadow-sm hover:shadow-xl hover:shadow-[#6c5ce7]/10 hover:-translate-y-0.5`}
    >
      {isi}
    </a>
  );
};

const FutureMakers = () => {
  useEffect(() => {
    document.title = 'Future Maker - Materi Kelas & Pixi | Riki MarkeThink';
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 md:py-24">
      {/* -- Judul halaman ------------------------------------------------ */}
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

      {/* -- Banner Pixi ---------------------------------------------------
          Halaman Pixi ada di /pixi/ (folder fisik di public/, bukan route
          React) karena butuh seluruh layar untuk model 3D-nya. */}
      <a
        href="/pixi/"
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-12 flex flex-col md:flex-row md:items-center gap-6 md:gap-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-6 md:p-8 transition-all hover:border-[#6c5ce7] hover:shadow-xl hover:shadow-[#6c5ce7]/10"
      >
        <div
          aria-hidden="true"
          className="w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-[#dcd5ff] to-[#f3f0ff] dark:from-[#2a2270] dark:to-[#1a1547] flex items-center justify-center transition-transform group-hover:scale-105"
        >
          <Sparkles size={40} className="text-[#6c5ce7] dark:text-[#a99bff]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6c5ce7] dark:text-[#a99bff]">
            Maskot Kelas
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pixi AI
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            Robot bintang 3D yang bisa diajak ngobrol sungguhan. Nyalakan tombol
            mikrofonnya, lalu bicara seperti biasa.
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <ShieldCheck size={15} className="shrink-0" />
            Gratis, tanpa mendaftar, dan tidak meminta data apa pun.
          </p>
        </div>

        <span className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6c5ce7] px-6 py-3.5 text-base font-bold text-white transition-colors group-hover:bg-[#5a4bd4]">
          <Mic size={18} />
          Ngobrol dengan Pixi
        </span>
      </a>

      {/* -- Materi kelas -------------------------------------------------- */}
      <div className="mt-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Materi Kelas
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            Slide yang dipakai di kelas. Boleh dibuka lagi di rumah bersama orang
            tua untuk mengulang pelajaran.
          </p>
        </div>

        <div className="lg:text-right lg:shrink-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {TERBUKA} dari {PERTEMUAN.length} materi terbuka
          </p>
          <div
            className="mt-2 h-1.5 w-full lg:w-52 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={TERBUKA}
            aria-valuemin={0}
            aria-valuemax={PERTEMUAN.length}
            aria-label="Materi yang sudah terbuka"
          >
            <div
              className="h-full rounded-full bg-[#6c5ce7]"
              style={{ width: `${(TERBUKA / PERTEMUAN.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PERTEMUAN.map((item) => (
          <KartuPertemuan key={item.no} item={item} />
        ))}
      </div>
    </div>
  );
};

export default FutureMakers;
