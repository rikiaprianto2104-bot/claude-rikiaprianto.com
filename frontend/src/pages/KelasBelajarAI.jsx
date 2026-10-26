import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Sparkles,
  Users,
  MapPin,
  CalendarDays,
  Palette,
  Trophy,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Play,
  Quote,
  CreditCard,
  Tag,
} from 'lucide-react';
import { kelasLanjutan as kelas, rupiah } from '../data/kelasLanjutan';
import { KARYA_TAMPIL } from '../data/karyaFutureMakers';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { trackPixel, trackPixelOnce } from '../lib/metaPixel';

// Parameter event Meta Pixel — hanya info konten, tanpa data pribadi pengunjung.
const PIXEL_CONTENT = {
  content_name: 'Kelas Lanjutan Future Makers',
  content_category: 'Kelas Anak Berbayar',
};

const ikonKelas = {
  creator: Palette,
  champions: Trophy,
  private: UserCheck,
};

const LINK_DAFTAR = `/${kelas.slug}`;

const TombolDaftar = ({ label = 'Daftar Sekarang', className = '', onKlik }) => (
  <Link
    to={LINK_DAFTAR}
    onClick={onKlik}
    className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#2563eb] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#2563eb]/30 transition-all duration-300 hover:bg-[#1d4ed8] hover:shadow-xl hover:shadow-[#2563eb]/40 hover:-translate-y-0.5 ${className}`}
  >
    {label}
    <ArrowRight
      size={20}
      className="transition-transform duration-300 group-hover:translate-x-0.5"
    />
  </Link>
);

const KelasBelajarAI = () => {
  const [ctaVisible, setCtaVisible] = useState(true);
  const viewContentSent = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      setCtaVisible(doc.scrollHeight - (window.scrollY + window.innerHeight) > 240);

      // Meta Pixel: ViewContent setelah pengunjung melewati 50% halaman.
      if (viewContentSent.current) return;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable < 0.5) return;

      viewContentSent.current = true;
      trackPixelOnce('viewcontent_kelas_lanjutan', 'ViewContent', {
        ...PIXEL_CONTENT,
        content_type: 'landing_page',
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Pengunjung menuju formulir pendaftaran — niat mendaftar, bukan sekadar baca.
  const handleDaftar = useCallback((posisi) => {
    trackPixel('InitiateCheckout', {
      ...PIXEL_CONTENT,
      content_type: 'buka_formulir',
      button_position: posisi,
    });
  }, []);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Kelas Lanjutan Future Makers',
      description:
        'Kelas lanjutan AI untuk anak: Creator, Champions, dan Private. Anak berkarya, berprestasi, dan membangun portofolio digital.',
      provider: {
        '@type': 'Person',
        name: 'Riki MarkeThink',
        url: 'https://rikiaprianto.com',
      },
      offers: kelas.kelas.map((k) => ({
        '@type': 'Offer',
        name: k.nama,
        price: String(k.harga.promo),
        priceCurrency: 'IDR',
        availability: 'https://schema.org/LimitedAvailability',
        url: `https://rikiaprianto.com/${kelas.slug}`,
      })),
    }),
    []
  );

  useDocumentMeta({
    title:
      'Kelas Lanjutan Future Makers — Creator, Champions & Private | Riki MarkeThink',
    description:
      'Kelas lanjutan AI untuk anak di Yogyakarta. Tiga jalur: Creator untuk berkarya, Champions untuk kompetisi, dan Private 1-on-1. Kelas mulai Januari 2027.',
    keywords: [
      'kelas lanjutan AI anak',
      'kelas AI anak Yogyakarta',
      'kompetisi AI anak',
      'portofolio digital anak',
      'Future Makers',
    ],
    type: 'article',
    jsonLd,
  });

  const fakta = [
    { icon: Users, label: '3 jalur kelas', nilai: 'Creator · Champions · Private' },
    { icon: CalendarDays, label: 'Kelas mulai', nilai: 'Januari 2027' },
    { icon: MapPin, label: 'Lokasi', nilai: kelas.lokasi },
    { icon: CreditCard, label: 'Pembayaran', nilai: 'Lunas atau cicilan 5x' },
  ];

  return (
    <div className="pb-24 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef4ff] to-white dark:from-[#101a2e] dark:to-[#0b1220]">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#2563eb]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-400/10" />

        <div className="relative mx-auto max-w-6xl px-6 pt-10 pb-16 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-[#2563eb] dark:text-slate-400"
          >
            <ChevronLeft size={16} /> Kembali ke Blog
          </Link>

          <div className="mt-8 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563eb] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                  <Sparkles size={12} /> {kelas.brand}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                  Kelas Lanjutan 2027
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-[3.3rem]">
                {kelas.headline}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                {kelas.intro}
              </p>

              <blockquote className="mt-7 border-l-4 border-[#2563eb] py-1 pl-5">
                <p className="flex gap-2 text-lg italic leading-relaxed text-slate-800 dark:text-slate-100">
                  <Quote size={18} className="mt-1.5 flex-shrink-0 text-[#2563eb]" />
                  {kelas.kutipan.teks}
                </p>
                <footer className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {kelas.kutipan.sumber}
                </footer>
              </blockquote>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <TombolDaftar onKlik={() => handleDaftar('hero')} />
                <a
                  href="#karya-anak"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-7 py-4 font-semibold text-slate-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] dark:border-white/15 dark:text-slate-200"
                >
                  <Play size={18} /> Lihat Karya Anak-anak
                </a>
              </div>
            </div>

            {/* Kartu fakta */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sekilas Kelas Lanjutan
              </p>
              <div className="mt-5 space-y-5">
                {fakta.map((f) => (
                  <div key={f.label} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2563eb] dark:bg-[#2563eb]/10">
                      <f.icon size={20} />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        {f.label}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {f.nilai}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-t border-slate-100 pt-5 text-xs leading-relaxed text-slate-500 dark:border-white/5 dark:text-slate-400">
                {kelas.jadwalBelajar}. Kursi sangat terbatas: Creator maks 8 anak,
                Champions maks 6 anak, Private hanya 3 anak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiga kelas */}
      <section className="bg-slate-50 py-16 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563eb] dark:bg-[#2563eb]/10">
              Pilih Jalur Anak
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              3 Kelas Lanjutan, 3 Masa Depan
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
              Setiap anak berbeda. Pilih kelas yang paling cocok dengan minat dan
              tujuan si kecil.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {kelas.kelas.map((k) => {
              const Icon = ikonKelas[k.id] || Palette;
              const adaPromo = k.harga.promo < k.harga.normal;
              return (
                <div
                  key={k.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:border-[#2563eb]/60 hover:shadow-xl hover:shadow-[#2563eb]/10 dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2563eb] dark:bg-[#2563eb]/10">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                    {k.nama}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                    {k.ringkas}
                  </p>
                  <p className="mt-4 flex-1 leading-relaxed text-slate-600 dark:text-slate-400">
                    {k.deskripsi}
                  </p>
                  <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
                    <strong className="font-bold">Hasil akhir:</strong>{' '}
                    {k.hasilAkhir}
                  </p>
                  <div className="mt-5 border-t border-slate-100 pt-5 dark:border-white/5">
                    {adaPromo && (
                      <p className="text-sm text-slate-400 line-through">
                        {rupiah(k.harga.normal)}
                      </p>
                    )}
                    <p className="text-2xl font-extrabold text-[#2563eb]">
                      {rupiah(k.harga.promo)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {adaPromo
                        ? 'Harga khusus alumni Kelas Future Makers'
                        : 'Tanpa promo — hanya 3 kursi'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Karya anak-anak */}
      <section id="karya-anak" className="scroll-mt-24 bg-white py-16 dark:bg-[#0b1220]">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563eb] dark:bg-[#2563eb]/10">
              Bukti Nyata
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Game Buatan Anak-anak Kelas Sebelumnya
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
              Semua game di bawah ini dibuat sendiri oleh peserta Kelas Future
              Makers batch 1 dengan bantuan AI. Klik salah satu, mainkan bersama
              si kecil — ini yang akan anak Anda bisa buat.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {KARYA_TAMPIL.map((item) => (
              <a
                key={item.nomor}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Mainkan game karya ${item.nama}`}
                className="group relative block aspect-square overflow-hidden rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#2563eb]/25"
              >
                <img
                  src={item.cover}
                  alt={`Sampul game karya ${item.nama}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition-opacity group-hover:opacity-0"
                >
                  <Play size={14} className="ml-0.5 fill-current" />
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent p-3 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="block text-sm font-bold text-white">
                    {item.nama}
                  </span>
                  <span className="block text-[11px] text-white/70">
                    {item.nomor}
                  </span>
                </span>
              </a>
            ))}
          </div>

          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
            Karya anak-anak usia 6–12 tahun, dibuat dalam 4 pertemuan. Lihat
            seluruhnya di{' '}
            <Link to="/future-maker" className="font-medium text-[#2563eb] hover:underline">
              halaman Future Makers
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Harga */}
      <section className="bg-slate-50 py-16 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563eb] dark:bg-[#2563eb]/10">
              <Tag size={12} /> Investasi Pendidikan
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Harga &amp; Cara Pembayaran
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
              Alumni Kelas Future Makers mendapat harga khusus. Mendaftarkan
              kakak dan adik sekaligus menambah potongan {kelas.diskonSaudaraPersen}% per anak.
            </p>
          </div>

          {/* overflow-x-auto, bukan overflow-hidden: di layar HP tabel 4 kolom
              lebih lebar dari layar, jadi digeser bukan dipotong. */}
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/[0.06]">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-200">
                    Kelas
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                    Harga normal
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                    Alumni
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                    Kakak-adik
                  </th>
                </tr>
              </thead>
              <tbody>
                {kelas.kelas.map((k, i) => (
                  <tr
                    key={k.id}
                    className={i % 2 ? 'bg-slate-50 dark:bg-white/[0.02]' : undefined}
                  >
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                      {k.nama}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400">
                      {rupiah(k.harga.normal)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[#2563eb]">
                      {rupiah(k.harga.promo)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-700 dark:text-slate-300">
                      {k.tanpaPromo ? '—' : `${rupiah(k.harga.saudaraPromo)} / anak`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <CreditCard size={18} className="text-[#2563eb]" /> Cicilan{' '}
                {kelas.cicilan.jumlah}x tanpa bunga
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {kelas.cicilan.catatan} Cicilan pertama dibayar{' '}
                {kelas.cicilan.bulan[0]}, sebelum kelas dimulai.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Users size={18} className="text-[#2563eb]" /> Promo saudara
                kandung
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Diskon {kelas.diskonSaudaraPersen}% per anak untuk kakak-adik
                kandung. Boleh kombinasi kelas, misalnya kakak Champions dan adik
                Creator. Tidak berlaku untuk Kelas Private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coach & cara daftar */}
      <section className="bg-white py-16 dark:bg-[#0b1220]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Siapa yang Membimbing
            </h2>
            <p className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
              {kelas.coach.nama}
            </p>
            <p className="text-sm text-[#2563eb]">{kelas.coach.peran}</p>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
              {kelas.coach.bio}
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Cara Daftar
            </h2>
            <ol className="mt-6 space-y-4">
              {kelas.caraDaftar.map((langkah, i) => (
                <li key={langkah} className="flex gap-4">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-sm font-bold text-[#2563eb] dark:bg-[#2563eb]/10">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-slate-700 dark:text-slate-300">
                    {langkah}
                  </span>
                </li>
              ))}
            </ol>
            <TombolDaftar
              className="mt-7"
              onKlik={() => handleDaftar('cara_daftar')}
            />
          </div>
        </div>
      </section>

      {/* CTA penutup */}
      <section className="bg-slate-50 py-16 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] p-8 text-center text-white md:p-12">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
            <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-white/10" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
                Kursi Sangat Terbatas
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/90">
                Creator 8 kursi, Champions 6 kursi, Private hanya 3 kursi.
                Amankan tempat si kecil sebelum diambil orang lain.
              </p>
              <ul className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/85">
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Harga khusus alumni
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Diskon kakak-adik {kelas.diskonSaudaraPersen}%
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Bisa dicicil {kelas.cicilan.jumlah}x
                </li>
              </ul>
              <div className="mt-8 flex justify-center">
                <Link
                  to={LINK_DAFTAR}
                  onClick={() => handleDaftar('cta_penutup')}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#2563eb] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Isi Formulir Pendaftaran
                  <ArrowRight
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA melayang (mobile) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md transition-all duration-300 md:hidden dark:border-white/10 dark:bg-[#0b1220]/95 ${
          ctaVisible
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              Kelas Lanjutan 2027
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              Creator · Champions · Private
            </p>
          </div>
          <Link
            to={LINK_DAFTAR}
            onClick={() => handleDaftar('bar_mobile')}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 font-bold text-white"
          >
            Daftar <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default KelasBelajarAI;
