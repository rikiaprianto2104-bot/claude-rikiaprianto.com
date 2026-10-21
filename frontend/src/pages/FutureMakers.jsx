import React, { useEffect } from 'react';
import { Mic, ShieldCheck, Lock, Play, Info } from 'lucide-react';

/*
 * Halaman menu "Future Maker".
 *
 * Tiga bagian: banner Pixi di atas, materi tiap pertemuan kelas gratis
 * Oktober 2026 sebagai grid, lalu karya siswa (game buatan anak-anak).
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
    ringkas:
      'Kenalan dengan Claude AI, absen seru bersama Pixi, lalu berburu prompt di dalam game Labirin Harta Karun.',
    href: '/future-maker/pertemuan-2/',
  },
  {
    no: 3,
    judul: 'Bangun Portofolio',
    tanggal: 'Minggu, 18 Oktober 2026',
    singkat: '18 Okt',
    ringkas:
      'Praktek membuat game dari karya Pertemuan 1 dan 2: gambar 3D dengan ChatGPT, gamenya dengan Claude, lalu latihan presentasi.',
    href: '/future-maker/pertemuan-3/',
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
 * Karya siswa batch 1. Tiap anak punya:
 *   cover - gambar sampul game (sudah memuat nama anak), taruh di
 *           public/future-maker/karya/fm-b1-XXX/cover.webp
 *   href  - tujuan tombol Mulai. Sekarang langsung ke game-nya; nanti diganti
 *           ke halaman video pembuka yang lanjut ke game.
 * Anak yang cover/href-nya masih null DISEMBUNYIKAN dari halaman (lihat
 * KARYA_TAMPIL). Begitu keduanya diisi, kartunya muncul sendiri.
 */
const KARYA_SISWA = [
  { nomor: 'FM.B1-001', nama: 'Gardala Sangjalu GA', cover: null, href: null },
  { nomor: 'FM.B1-002', nama: 'Al Farras King S.B', cover: '/future-maker/karya/fm-b1-002/cover.webp', href: '/future-maker/karya/fm-b1-002/' },
  { nomor: 'FM.B1-003', nama: 'Farjana', cover: '/future-maker/karya/fm-b1-003/cover.webp', href: '/future-maker/karya/fm-b1-003/' },
  { nomor: 'FM.B1-004', nama: 'Muhammad Umar', cover: '/future-maker/karya/fm-b1-004/cover.webp', href: '/future-maker/karya/fm-b1-004/' },
  { nomor: 'FM.B1-005', nama: 'M. Arsene Putra Kurniawan', cover: null, href: null },
  { nomor: 'FM.B1-006', nama: 'Arshad Alvaronizam Arrafif', cover: null, href: null },
  { nomor: 'FM.B1-007', nama: 'Dzaky Almair', cover: '/future-maker/karya/fm-b1-007/cover.webp', href: '/future-maker/karya/fm-b1-007/' },
  { nomor: 'FM.B1-008', nama: 'M. Althaf Arrayhan', cover: '/future-maker/karya/fm-b1-008/cover.webp', href: '/future-maker/karya/fm-b1-008/' },
  { nomor: 'FM.B1-009', nama: 'M. Ahnaf Syauqi', cover: '/future-maker/karya/fm-b1-009/cover.webp', href: '/future-maker/karya/fm-b1-009/' },
  { nomor: 'FM.B1-010', nama: 'Muhammad Aksa', cover: '/future-maker/karya/fm-b1-010/cover.webp', href: '/future-maker/karya/fm-b1-010/' },
];

// Hanya yang sudah punya sampul dan game.
const KARYA_TAMPIL = KARYA_SISWA.filter((k) => k.href && k.cover);

/*
 * Kartu karya siswa: sampul game memenuhi seluruh kotak. Karena sampulnya
 * sudah memuat nama anak, tombol Play, nama, dan nomor peserta hanya jadi
 * lapisan tipis di atasnya - lencana Play kecil yang samar, lalu nama + nomor
 * + Play besar baru muncul saat disorot.
 */
const KartuKarya = ({ item }) => (
  <a
    href={item.href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Mulai game karya ${item.nama}, nomor peserta ${item.nomor}`}
    className={`group relative block aspect-square overflow-hidden rounded-3xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#6c5ce7]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c5ce7]`}
  >
    <img
      src={item.cover}
      alt={`Sampul game karya ${item.nama}`}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />

    {/* Lencana Play samar, selalu ada supaya jelas kartunya bisa diklik. */}
    <span
      aria-hidden="true"
      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition-opacity group-hover:opacity-0"
    >
      <Play size={14} className="ml-0.5 fill-current" />
    </span>

    {/* Lapisan saat disorot / difokus: Play besar, nama, nomor peserta. */}
    <span
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/55 px-4 text-center opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#6c5ce7] shadow-lg">
        <Play size={26} className="ml-1 fill-current" />
      </span>
      <span>
        <span className="block text-lg font-extrabold leading-snug text-white tracking-tight">
          {item.nama}
        </span>
        <span className="mt-0.5 block text-xs font-light tracking-wide text-white/70">
          {item.nomor}
        </span>
      </span>
    </span>
  </a>
);

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
        className="group mt-20 flex flex-col md:flex-row md:items-center gap-6 md:gap-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-6 md:p-8 transition-all hover:border-[#6c5ce7] hover:shadow-xl hover:shadow-[#6c5ce7]/10"
      >
        {/* Maskot Pixi dibuat besar dan sengaja "keluar" dari kotak ungu di
            belakangnya (tidak ada overflow-hidden) supaya mencolok. WebP-nya
            transparan, jadi aman di mode terang maupun gelap. */}
        <div className="relative shrink-0 w-44 h-36 md:w-64 md:h-44 self-start md:self-center">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-32 md:h-40 rounded-3xl bg-gradient-to-br from-[#dcd5ff] to-[#f3f0ff] dark:from-[#2a2270] dark:to-[#1a1547] transition-transform duration-300 group-hover:scale-105"
          />
          <img
            src="/future-maker/media/pixi-maskot.webp"
            alt="Pixi, robot bintang maskot kelas Future Makers"
            width="256"
            height="256"
            decoding="async"
            className="absolute bottom-1 left-1/2 -translate-x-1/2 h-44 w-44 md:h-60 md:w-60 max-w-none object-contain drop-shadow-[0_10px_14px_rgba(76,58,180,0.3)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-3"
          />
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

      {/* -- Karya siswa ---------------------------------------------------
          3 kolom (2 di HP); kalau sisa satu, di tengah baris bawah. Nanti
          tiap tombol Mulai membuka video pembuka lalu lanjut ke game-nya. */}
      <div className="mt-20 max-w-xl">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Karya Siswa
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
          Game buatan anak-anak Future Makers batch 1. Pilih satu, lalu tekan
          Mulai untuk memainkannya.
        </p>
      </div>

      {/* Disclaimer: karya anak-anak, bukan produk resmi pihak mana pun. */}
      <aside
        role="note"
        className="mt-5 max-w-3xl flex gap-3 rounded-2xl border border-amber-200 dark:border-amber-400/20 bg-amber-50/70 dark:bg-amber-400/5 p-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
      >
        <Info size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p>
          <strong className="font-bold text-slate-800 dark:text-slate-100">
            Disclaimer:
          </strong>{' '}
          Seluruh game di bagian ini adalah hasil kreativitas dan murni buah
          pikiran anak-anak peserta Future Makers. Apabila terdapat kesamaan
          karakter, tokoh, judul, maupun nama dengan karya atau pihak lain, kami
          memohon maaf yang sebesar-besarnya. Karya ini dibuat semata-mata
          sebagai ajang kreativitas anak.
        </p>
      </aside>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {KARYA_TAMPIL.map((item, i) => (
          // Kalau sisa 1 sendirian di baris terakhir 3 kolom, taruh di tengah.
          <div
            key={item.nomor}
            className={i === KARYA_TAMPIL.length - 1 && KARYA_TAMPIL.length % 3 === 1 ? 'md:col-start-2' : ''}
          >
            <KartuKarya item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FutureMakers;
