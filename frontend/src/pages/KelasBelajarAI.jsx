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
  Mail,
  MessageCircle,
} from 'lucide-react';
import {
  kelasLanjutan as kelas,
  hargaPerAnak,
  promoBerjalan,
  rupiah,
} from '../data/kelasLanjutan';
import { KARYA_TAMPIL } from '../data/karyaFutureMakers';
import HitungMundurPromo from '../components/HitungMundurPromo';
import KartuHargaKelas from '../components/KartuHargaKelas';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { trackPixel, trackPixelOnce } from '../lib/metaPixel';

const PIXEL_CONTENT = {
  content_name: 'Kelas Artificial Intelligence Anak Yogyakarta',
  content_category: 'Kelas Anak Berbayar',
};

const ikonKelas = { creator: Palette, champions: Trophy, private: UserCheck };
// Tombol umum (hero, cara daftar, CTA penutup) belum tahu kelas mana yang
// diminati, jadi diarahkan ke bagian pemilihan kelas. Formulirnya dibuka dari
// tombol di kartu kelas masing-masing.
const LINK_PILIH_KELAS = '#harga';

const TombolDaftar = ({ label = 'Pilih Kelas & Daftar', className = '', onKlik }) => (
  <a
    href={LINK_PILIH_KELAS}
    onClick={onKlik}
    className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#2563eb] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#2563eb]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-xl hover:shadow-[#2563eb]/40 ${className}`}
  >
    {label}
    <ArrowRight
      size={20}
      className="transition-transform duration-300 group-hover:translate-x-0.5"
    />
  </a>
);

const Bagian = ({ id, children, className = '' }) => (
  <section id={id} className={`scroll-mt-24 py-16 ${className}`}>
    <div className="mx-auto max-w-6xl px-6 lg:px-8">{children}</div>
  </section>
);

const KelasBelajarAI = () => {
  const [ctaVisible, setCtaVisible] = useState(true);
  const [promoAktif, setPromoAktif] = useState(() => promoBerjalan());
  const viewContentSent = useRef(false);

  const matikanPromo = useCallback(() => setPromoAktif(false), []);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      setCtaVisible(doc.scrollHeight - (window.scrollY + window.innerHeight) > 240);

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

  const handleDaftar = useCallback((posisi) => {
    trackPixel('InitiateCheckout', {
      ...PIXEL_CONTENT,
      content_type: 'buka_formulir',
      button_position: posisi,
    });
  }, []);

  // Course + FAQPage + Breadcrumb: tiga schema yang paling berguna untuk
  // halaman kelas berbayar di hasil pencarian.
  const jsonLd = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'Kelas Artificial Intelligence untuk Anak di Yogyakarta',
        description: kelas.seo.deskripsi,
        url: kelas.seo.canonical,
        image: `https://rikiaprianto.com${kelas.seo.ogImage}`,
        inLanguage: 'id-ID',
        educationalLevel: 'Anak usia 6-15 tahun',
        teaches: 'Artificial Intelligence, pembuatan game, karya digital',
        provider: {
          '@type': 'Organization',
          name: 'Future Makers by Riki MarkeThink',
          url: 'https://rikiaprianto.com',
          areaServed: { '@type': 'City', name: 'Yogyakarta' },
        },
        hasCourseInstance: kelas.kelas.map((k) => ({
          '@type': 'CourseInstance',
          name: k.nama,
          courseMode: 'Offline',
          courseWorkload: k.ringkas,
          location: {
            '@type': 'Place',
            name: 'Yogyakarta',
            address: {
              '@type': 'PostalAddress',
              addressLocality: kelas.kontak.kota,
              addressRegion: kelas.kontak.wilayah,
              addressCountry: 'ID',
            },
          },
          offers: {
            '@type': 'Offer',
            price: String(hargaPerAnak(k.id, { promoAktif })),
            priceCurrency: 'IDR',
            availability: 'https://schema.org/LimitedAvailability',
            url: `https://rikiaprianto.com/${kelas.slug}`,
          },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: kelas.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://rikiaprianto.com/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://rikiaprianto.com/blog' },
          { '@type': 'ListItem', position: 3, name: 'Kelas Artificial Intelligence Anak Yogyakarta', item: kelas.seo.canonical },
        ],
      },
    ],
    [promoAktif]
  );

  useDocumentMeta({
    title: kelas.seo.judul,
    description: kelas.seo.deskripsi,
    keywords: kelas.seo.kataKunci,
    image: `https://rikiaprianto.com${kelas.seo.ogImage}`,
    url: kelas.seo.canonical,
    type: 'article',
    jsonLd,
  });

  // Canonical: wajib ada supaya mesin pencari tahu alamat resmi halaman ini.
  useEffect(() => {
    let tag = document.head.querySelector('link[rel="canonical"]');
    const dibuatDiSini = !tag;
    const nilaiAwal = tag ? tag.getAttribute('href') : null;
    if (!tag) {
      tag = document.createElement('link');
      tag.setAttribute('rel', 'canonical');
      document.head.appendChild(tag);
    }
    tag.setAttribute('href', kelas.seo.canonical);
    return () => {
      if (dibuatDiSini) tag.remove();
      else tag.setAttribute('href', nilaiAwal);
    };
  }, []);

  const fakta = [
    { icon: Users, label: 'Untuk anak', nilai: 'Usia 6–15 tahun' },
    { icon: CalendarDays, label: 'Kelas mulai', nilai: 'Januari 2027' },
    { icon: MapPin, label: 'Lokasi', nilai: 'Offline Yogyakarta' },
    { icon: CreditCard, label: 'Pembayaran', nilai: 'Lunas atau cicilan 5x' },
  ];

  return (
    <article className="pb-24 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef4ff] to-white dark:from-[#101a2e] dark:to-[#0b1220]">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#2563eb]/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 pt-10 pb-16 lg:px-8">
          <nav aria-label="Breadcrumb">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-[#2563eb] dark:text-slate-400"
            >
              <ChevronLeft size={16} /> Kembali ke Blog
            </Link>
          </nav>

          <div className="mt-8 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563eb] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                  <Sparkles size={12} /> {kelas.brand}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <MapPin size={12} /> Yogyakarta
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white md:text-5xl">
                Kelas Artificial Intelligence untuk Anak di Yogyakarta
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                Anak usia 6–15 tahun belajar memakai AI untuk membuat game,
                gambar, video, dan website sendiri — lalu mengubahnya jadi
                portofolio dan prestasi. Tiga pilihan kelas: Creator, Champions,
                dan Private.
              </p>

              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  '12 pertemuan, kelas kecil maksimal 8 anak',
                  'Mentor mendampingi langsung setiap anak',
                  'Anak pulang membawa karya, bukan catatan',
                  'Bisa dicicil 5x tanpa bunga',
                ].map((t) => (
                  <li
                    key={t}
                    className="flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <TombolDaftar onKlik={() => handleDaftar('hero')} />
                <a
                  href="#karya-anak"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-7 py-4 font-semibold text-slate-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] dark:border-white/15 dark:text-slate-200"
                >
                  <Play size={18} /> Lihat Karya Anak
                </a>
              </div>
            </div>

            {/* Foto utama + fakta */}
            <div>
              <img
                src={kelas.foto[0].src}
                width={kelas.foto[0].w}
                height={kelas.foto[0].h}
                alt={kelas.foto[0].alt}
                fetchpriority="high"
                className="aspect-[3/2] w-full rounded-3xl object-cover shadow-xl shadow-slate-900/10"
              />
              <div className="mt-5 grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                {fakta.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2563eb] dark:bg-[#2563eb]/10">
                      <f.icon size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">
                        {f.label}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {f.nilai}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Foto kegiatan */}
      <Bagian id="suasana-kelas" className="bg-white dark:bg-[#0b1220]">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563eb] dark:bg-[#2563eb]/10">
            Suasana Kelas
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Seperti Ini Kelas AI Anak Kami Berjalan
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Bukan kelas ceramah. Setiap anak memegang laptopnya sendiri,
            didampingi mentor, dan langsung mencoba sampai karyanya jadi.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {kelas.foto.slice(1).map((f) => (
            <img
              key={f.src}
              src={f.src}
              width={f.w}
              height={f.h}
              alt={f.alt}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm"
            />
          ))}
        </div>
      </Bagian>

      {/* Pilihan kelas + harga */}
      <Bagian id="harga" className="bg-slate-50 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563eb] dark:bg-[#2563eb]/10">
            Pilih Kelas
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Tiga Pilihan Kelas AI untuk Anak
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Biaya sudah mencakup seluruh pertemuan, modul, akun AI berbayar, dan
            sertifikat. Tidak ada biaya tersembunyi.
          </p>
        </div>

        {promoAktif && (
          <div className="mx-auto mt-8 max-w-xl">
            <HitungMundurPromo
              berakhir={kelas.promo.berakhir}
              label={kelas.promo.label}
              onSelesai={matikanPromo}
            />
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          {kelas.kelas.map((k) => (
            <KartuHargaKelas
              key={k.id}
              kelas={k}
              promoAktif={promoAktif}
              unggulan={k.id === 'creator'}
              onDaftar={(id) => handleDaftar(`kartu_${id}`)}
            />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
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
              <Users size={18} className="text-[#2563eb]" /> Mendaftar kakak-adik
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Mendaftarkan dua anak atau lebih juga mendapat potongan{' '}
              {kelas.promo.persen}% per anak untuk Creator dan Champions.
              Potongan tidak ditumpuk dengan promo yang sedang berjalan.
            </p>
          </div>
        </div>
      </Bagian>


      {/* Karya anak */}
      <Bagian id="karya-anak" className="bg-white dark:bg-[#0b1220]">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563eb] dark:bg-[#2563eb]/10">
            Bukti Nyata
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Game Buatan Anak-anak Kelas Sebelumnya
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Semua game di bawah ini dibuat sendiri oleh peserta Kelas Future
            Makers dengan bantuan AI. Klik salah satu dan mainkan bersama si
            kecil — ini yang akan anak Anda bisa buat.
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
                alt={`Game buatan ${item.nama}, peserta kelas AI anak Yogyakarta`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition-opacity group-hover:opacity-0"
              >
                <Play size={14} className="ml-0.5 fill-current" />
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent p-3 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="block text-sm font-bold text-white">{item.nama}</span>
                <span className="block text-[11px] text-white/70">{item.nomor}</span>
              </span>
            </a>
          ))}
        </div>
      </Bagian>

      {/* Coach & cara daftar */}
      <Bagian id="mentor" className="bg-slate-50 dark:bg-white/[0.02]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Siapa yang Membimbing
            </h2>
            <blockquote className="mt-6 border-l-4 border-[#2563eb] py-1 pl-5">
              <p className="flex gap-2 italic leading-relaxed text-slate-700 dark:text-slate-200">
                <Quote size={16} className="mt-1 flex-shrink-0 text-[#2563eb]" />
                {kelas.kutipan.teks}
              </p>
              <footer className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {kelas.kutipan.sumber}
              </footer>
            </blockquote>
            <p className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
              {kelas.coach.nama}
            </p>
            <p className="text-sm text-[#2563eb]">{kelas.coach.peran}</p>
            <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
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
            <TombolDaftar className="mt-7" onKlik={() => handleDaftar('cara_daftar')} />
          </div>
        </div>
      </Bagian>

      {/* FAQ */}
      <Bagian id="faq" className="bg-white dark:bg-[#0b1220]">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Pertanyaan yang Sering Ditanyakan
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {kelas.faq.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-slate-900 dark:text-white">
                <h3 className="text-base font-semibold">{f.q}</h3>
                <span className="flex-shrink-0 text-xl leading-none text-[#2563eb] transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </Bagian>

      {/* Lokasi & kontak */}
      <Bagian id="kontak" className="bg-slate-50 dark:bg-white/[0.02]">
        <div className="grid grid-cols-1 gap-8 rounded-3xl border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03] md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Lokasi &amp; Kontak
            </h2>
            <p className="mt-4 flex items-start gap-2 leading-relaxed text-slate-600 dark:text-slate-400">
              <MapPin size={18} className="mt-1 flex-shrink-0 text-[#2563eb]" />
              {kelas.kontak.catatanAlamat}
            </p>
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <MessageCircle size={18} className="text-[#2563eb]" />
              WhatsApp:{' '}
              <a
                href={`https://wa.me/${kelas.whatsapp.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#2563eb] hover:underline"
              >
                {kelas.whatsapp.display}
              </a>
            </p>
            <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Mail size={18} className="text-[#2563eb]" />
              <a
                href={`mailto:${kelas.kontak.email}`}
                className="font-semibold text-[#2563eb] hover:underline"
              >
                {kelas.kontak.email}
              </a>
            </p>
            <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Sparkles size={18} className="text-[#2563eb]" />
              Diselenggarakan oleh {kelas.coach.nama}
            </p>
          </div>
        </div>
      </Bagian>

      {/* CTA penutup */}
      <Bagian className="bg-white dark:bg-[#0b1220]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] p-8 text-center text-white md:p-12">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
              Amankan Kursi Anak Sekarang
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/90">
              Creator 8 kursi, Champions 6 kursi, Private hanya 3 kursi. Isi
              formulir pendaftaran, pilih kelas dan cara bayar, lalu kursinya
              langsung kami kunci.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href={LINK_PILIH_KELAS}
                onClick={() => handleDaftar('cta_penutup')}
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#2563eb] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Pilih Kelas &amp; Daftar
                <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </Bagian>

      {/* CTA melayang (mobile) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md transition-all duration-300 md:hidden dark:border-white/10 dark:bg-[#0b1220]/95 ${
          ctaVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              Kelas AI Anak Yogyakarta
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              Mulai {rupiah(hargaPerAnak('creator', { promoAktif }))}
            </p>
          </div>
          <a
            href={LINK_PILIH_KELAS}
            onClick={() => handleDaftar('bar_mobile')}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 font-bold text-white"
          >
            Pilih Kelas <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </article>
  );
};

export default KelasBelajarAI;
