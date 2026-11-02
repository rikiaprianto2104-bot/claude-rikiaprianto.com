import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Sparkles,
  Users,
  MapPin,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  Play,
  Quote,
  CreditCard,
  Mail,
  MessageCircle,
  Timer,
  Flame,
  GraduationCap,
  Clapperboard,
  Gamepad2,
  Presentation,
  Wand2,
} from 'lucide-react';
import { kelasLanjutan as bersama, rupiah } from '../data/kelasLanjutan';
import { kelasExplorer as kelas } from '../data/kelasExplorer';
import { KARYA_TAMPIL } from '../data/karyaFutureMakers';
import HitungMundur from '../components/HitungMundur';
import { usePromoExplorer } from '../hooks/usePromoExplorer';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { trackPixel, trackPixelOnce } from '../lib/metaPixel';

const LINK_FORMULIR = `/pendaftaran/${kelas.slug}`;
const ikonPertemuan = [Wand2, Gamepad2, Clapperboard, Presentation];

const pixelContent = {
  content_name: 'Kelas Explorer Future Makers',
  content_category: 'Kelas Anak Berbayar',
};

const Bagian = ({ id, children, className = '' }) => (
  <section id={id} className={`scroll-mt-24 py-16 ${className}`}>
    <div className="mx-auto max-w-6xl px-6 lg:px-8">{children}</div>
  </section>
);

const Label = ({ children }) => (
  <span className="inline-block rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563eb] dark:bg-[#2563eb]/10">
    {children}
  </span>
);

const TombolDaftar = ({ label = 'Daftar Kelas Explorer', className = '', onKlik, terang = false }) => (
  <Link
    to={LINK_FORMULIR}
    onClick={onKlik}
    className={`group inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-lg font-bold transition-all duration-300 hover:-translate-y-0.5 ${
      terang
        ? 'bg-white text-[#2563eb] hover:bg-slate-100'
        : 'bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30 hover:bg-[#1d4ed8] hover:shadow-xl hover:shadow-[#2563eb]/40'
    } ${className}`}
  >
    {label}
    <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-0.5" />
  </Link>
);

// Video dimuat hanya saat diklik: poster saja yang diunduh saat halaman dibuka,
// supaya tiga video (±16 MB) tidak membebani pengunjung yang tidak memutarnya.
const KartuVideo = ({ item, onPutar }) => {
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
              onPutar(item.nama);
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
        <span className="font-normal text-slate-500 dark:text-slate-400">· Testimoni orang tua</span>
      </figcaption>
    </figure>
  );
};

const Harga = ({ promo, besar = false }) => (
  <div>
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      {promo.aktif && (
        <span className="text-lg font-semibold text-slate-400 line-through decoration-2">
          {rupiah(kelas.harga.normal)}
        </span>
      )}
      <span
        className={`font-extrabold tracking-tight text-[#2563eb] ${besar ? 'text-5xl md:text-6xl' : 'text-4xl'}`}
      >
        {rupiah(promo.harga)}
      </span>
    </div>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
      untuk {kelas.jumlahPertemuan} pertemuan · bayar lunas
    </p>
  </div>
);

const KelasExplorer = () => {
  const promo = usePromoExplorer();
  const [ctaVisible, setCtaVisible] = useState(true);
  const viewContentSent = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      setCtaVisible(doc.scrollHeight - (window.scrollY + window.innerHeight) > 240);

      if (viewContentSent.current) return;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0 || window.scrollY / scrollable < 0.5) return;

      viewContentSent.current = true;
      trackPixelOnce('viewcontent_kelas_explorer', 'ViewContent', {
        ...pixelContent,
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
      ...pixelContent,
      content_type: 'buka_formulir',
      button_position: posisi,
    });
  }, []);

  // Harga di data terstruktur mengikuti status promo saat halaman dibuka.
  const hargaSaatIni = promo.harga;
  const jsonLd = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'Kelas Explorer: Belajar AI dan Membuat Game untuk Anak',
        description: kelas.seo.deskripsi,
        url: kelas.seo.canonical,
        image: `https://rikiaprianto.com${kelas.seo.ogImage}`,
        inLanguage: 'id-ID',
        educationalLevel: `Anak usia ${kelas.usia.min}-${kelas.usia.max} tahun`,
        teaches: 'Artificial Intelligence, ChatGPT, Claude AI, pembuatan game sederhana',
        provider: {
          '@type': 'Organization',
          name: 'Future Makers by Riki MarkeThink',
          url: 'https://rikiaprianto.com',
          areaServed: { '@type': 'City', name: 'Yogyakarta' },
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          name: 'Kelas Explorer batch November–Desember 2026',
          courseMode: 'Offline',
          startDate: '2026-11-22',
          endDate: '2026-12-20',
          location: {
            '@type': 'Place',
            name: 'Yogyakarta',
            address: {
              '@type': 'PostalAddress',
              addressLocality: bersama.kontak.kota,
              addressRegion: bersama.kontak.wilayah,
              addressCountry: 'ID',
            },
          },
          offers: {
            '@type': 'Offer',
            price: String(hargaSaatIni),
            priceCurrency: 'IDR',
            priceValidUntil: '2026-11-14',
            availability: 'https://schema.org/LimitedAvailability',
            url: kelas.seo.canonical,
          },
        },
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
          { '@type': 'ListItem', position: 3, name: 'Kelas Explorer', item: kelas.seo.canonical },
        ],
      },
    ],
    [hargaSaatIni]
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
    { icon: Users, label: 'Untuk anak', nilai: `Usia ${kelas.usia.min}–${kelas.usia.max} tahun` },
    { icon: CalendarDays, label: 'Kelas mulai', nilai: `22 November 2026, ${kelas.jam}` },
    { icon: MapPin, label: 'Lokasi', nilai: kelas.lokasi },
    { icon: CreditCard, label: 'Pembayaran', nilai: 'Lunas, tanpa cicilan' },
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
                {promo.aktif && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                    <Flame size={12} /> Promo terbatas
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white md:text-5xl">
                Kelas Explorer: Anak Belajar AI dan Membuat Game Sendiri
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                Anak usia {kelas.usia.min}–{kelas.usia.max} tahun belajar ChatGPT dan Claude AI untuk membuat
                karakter dan game buatannya sendiri, lalu mempresentasikannya di Demo Day di depan orang tua
                dan teman-teman. Cukup 4 pertemuan.
              </p>

              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  `${kelas.jumlahPertemuan} pertemuan, setiap hari ${kelas.hari} pukul ${kelas.jam}`,
                  `Kelas kecil, maksimal ${kelas.kuota} anak`,
                  'Dibimbing 1 Coach dan Miss di setiap pertemuan',
                  'Anak pulang membawa game buatannya sendiri',
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <TombolDaftar onKlik={() => handleDaftar('hero')} />
                <a
                  href="#testimoni"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-7 py-4 font-semibold text-slate-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] dark:border-white/15 dark:text-slate-200"
                >
                  <Play size={18} /> Lihat Testimoni
                </a>
              </div>
            </div>

            <div>
              <img
                src={bersama.foto[0].src}
                width={bersama.foto[0].w}
                height={bersama.foto[0].h}
                alt={bersama.foto[0].alt}
                fetchPriority="high"
                className="aspect-[3/2] w-full rounded-3xl object-cover shadow-xl shadow-slate-900/10"
              />
              <div className="mt-5 grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                {fakta.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2563eb] dark:bg-[#2563eb]/10">
                      <f.icon size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">{f.label}</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.nilai}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Harga + hitung mundur promo */}
      <Bagian id="harga" className="bg-white dark:bg-[#0b1220]">
        <div className="mx-auto max-w-3xl text-center">
          <Label>Harga &amp; Jadwal</Label>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            {promo.aktif ? `Harga Promo Hanya Sampai ${kelas.promoSampaiLabel}` : 'Biaya Kelas Explorer'}
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Biaya mencakup seluruh {kelas.jumlahPertemuan} pertemuan dan pendampingan Coach dan Miss. Tidak ada
            biaya tersembunyi.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border-2 border-[#2563eb] bg-white shadow-xl shadow-[#2563eb]/10 dark:bg-white/[0.03]">
          {promo.aktif && (
            <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] px-6 py-7 text-white md:flex-row md:justify-between md:px-10">
              <div className="text-center md:text-left">
                <p className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider md:justify-start">
                  <Timer size={16} /> Promo berakhir dalam
                </p>
                <p className="mt-1 text-sm text-white/80">
                  Hemat {rupiah(promo.hemat)}. Setelah {kelas.promoSampaiLabel}, harga kembali{' '}
                  {rupiah(kelas.harga.normal)}.
                </p>
              </div>
              <HitungMundur sisa={promo.sisa} terang />
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 p-7 md:grid-cols-2 md:p-10">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Kelas Explorer</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {kelas.jumlahPertemuan} pertemuan · setiap {kelas.hari} · {kelas.jam} · maks {kelas.kuota} anak
              </p>
              <div className="mt-6">
                <Harga promo={promo} besar />
              </div>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {[
                  'Belajar ChatGPT dan Claude AI',
                  'Membuat karakter dan game sendiri',
                  'Demo Day di depan orang tua',
                  `Usia ${kelas.usia.min}–${kelas.usia.max} tahun, tanpa perlu bisa coding`,
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 size={17} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
                    {t}
                  </li>
                ))}
              </ul>
              <TombolDaftar className="mt-7 w-full sm:w-auto" onKlik={() => handleDaftar('kartu_harga')} />
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Pembayaran hanya lunas. Kursi terkunci setelah bukti transfer diterima.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 dark:bg-white/[0.04]">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <CalendarDays size={18} className="text-[#2563eb]" /> Jadwal 4 pertemuan
              </h3>
              <div className="mt-4 space-y-4">
                {kelas.jadwal.map((b) => (
                  <div key={b.bulan}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{b.bulan}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {b.tanggal.map((t) => (
                        <span
                          key={t}
                          className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-extrabold text-[#2563eb] shadow-sm dark:bg-[#2563eb]/15"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Semua pertemuan jatuh di hari {kelas.hari} pukul {kelas.jam}. Alamat lengkap dikirim lewat WhatsApp
                setelah pendaftaran dikonfirmasi.
              </p>
            </div>
          </div>
        </div>
      </Bagian>

      {/* Materi 4 pertemuan */}
      <Bagian id="materi" className="bg-slate-50 dark:bg-white/[0.02]">
        <div className="max-w-2xl">
          <Label>Materi Belajar</Label>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            4 Pertemuan, Dari Ide Sampai Game Jadi
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Setiap pertemuan membangun yang sebelumnya: dari membuat karakter, merakit game, sampai
            mempresentasikannya.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {kelas.pertemuan.map((p, i) => {
            const Ikon = ikonPertemuan[i];
            return (
              <div
                key={p.nomor}
                className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#2563eb] text-white">
                    <Ikon size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
                      Pertemuan {p.nomor} · {p.alat}
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{p.judul}</h3>
                  </div>
                </div>
                <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{p.isi}</p>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                  <GraduationCap size={14} className="text-[#2563eb]" /> Dibimbing {p.pembimbing}
                </p>
              </div>
            );
          })}
        </div>
      </Bagian>

      {/* Testimoni video */}
      <Bagian id="testimoni" className="bg-white dark:bg-[#0b1220]">
        <div className="max-w-2xl">
          <Label>Testimoni</Label>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Kata Orang Tua Setelah Demo Day
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Video ini direkam langsung di Demo Day, saat anak-anak menampilkan karyanya di depan orang tua.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {kelas.testimoni.map((t) => (
            <KartuVideo
              key={t.src}
              item={t}
              onPutar={(nama) =>
                trackPixel('ViewContent', {
                  ...pixelContent,
                  content_type: 'putar_testimoni',
                  content_ids: [nama],
                })
              }
            />
          ))}
        </div>
      </Bagian>

      {/* Suasana kelas */}
      <Bagian id="suasana-kelas" className="bg-slate-50 dark:bg-white/[0.02]">
        <div className="max-w-2xl">
          <Label>Suasana Kelas</Label>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Seperti Ini Kelas AI Anak Kami Berjalan
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Bukan kelas ceramah. Setiap anak memegang laptopnya sendiri, didampingi Coach dan Miss, dan langsung
            mencoba sampai karyanya jadi.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {bersama.foto.slice(1).map((f) => (
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

      {/* Karya anak */}
      <Bagian id="karya-anak" className="bg-white dark:bg-[#0b1220]">
        <div className="max-w-2xl">
          <Label>Bukti Nyata</Label>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Game Buatan Anak-anak Kelas Sebelumnya
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Semua game di bawah ini dibuat sendiri oleh peserta Future Makers dengan bantuan AI. Klik salah satu
            dan mainkan bersama si kecil.
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
                {bersama.kutipan.teks}
              </p>
              <footer className="mt-2 text-sm text-slate-500 dark:text-slate-400">{bersama.kutipan.sumber}</footer>
            </blockquote>
            <p className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">{bersama.coach.nama}</p>
            <p className="text-sm text-[#2563eb]">{bersama.coach.peran}</p>
            <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">{bersama.coach.bio}</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Setiap pertemuan Coach didampingi 1 Miss. Di pertemuan 3 (praktikum) ada 2 Miss supaya setiap anak
              terpantau saat membuat game.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Cara Daftar
            </h2>
            <ol className="mt-6 space-y-4">
              {[
                'Klik tombol daftar di halaman ini.',
                'Isi nama anak, usia anak, dan nama orang tua/wali.',
                'Transfer pembayaran lunas ke rekening yang tertera.',
                'Kirim formulir dan bukti transfer lewat WhatsApp, kursi anak resmi terkunci.',
              ].map((langkah, i) => (
                <li key={langkah} className="flex gap-4">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-sm font-bold text-[#2563eb] dark:bg-[#2563eb]/10">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-slate-700 dark:text-slate-300">{langkah}</span>
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
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
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
              {bersama.kontak.catatanAlamat}
            </p>
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <MessageCircle size={18} className="text-[#2563eb]" />
              WhatsApp:{' '}
              <a
                href={`https://wa.me/${bersama.whatsapp.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#2563eb] hover:underline"
              >
                {bersama.whatsapp.display}
              </a>
            </p>
            <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Mail size={18} className="text-[#2563eb]" />
              <a href={`mailto:${bersama.kontak.email}`} className="font-semibold text-[#2563eb] hover:underline">
                {bersama.kontak.email}
              </a>
            </p>
            <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Sparkles size={18} className="text-[#2563eb]" />
              Diselenggarakan oleh {bersama.coach.nama}
            </p>
          </div>
        </div>
      </Bagian>

      {/* CTA penutup */}
      <Bagian className="bg-white dark:bg-[#0b1220]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] p-8 text-center text-white md:p-12">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">Amankan Kursi Anak Sekarang</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/90">
              Satu kelas hanya {kelas.kuota} anak. Mulai 22 November 2026,{' '}
              {promo.aktif
                ? `harga promo ${rupiah(promo.harga)} hanya sampai ${kelas.promoSampaiLabel}.`
                : `biayanya ${rupiah(promo.harga)} untuk 4 pertemuan.`}
            </p>
            {promo.aktif && (
              <div className="mt-6 flex justify-center">
                <HitungMundur sisa={promo.sisa} terang />
              </div>
            )}
            <div className="mt-8 flex justify-center">
              <TombolDaftar terang onKlik={() => handleDaftar('cta_penutup')} />
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
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">Kelas Explorer</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {promo.aktif && (
                <span className="mr-1.5 line-through">{rupiah(kelas.harga.normal)}</span>
              )}
              <span className="font-semibold text-[#2563eb]">{rupiah(promo.harga)}</span>
            </p>
          </div>
          <Link
            to={LINK_FORMULIR}
            onClick={() => handleDaftar('bar_mobile')}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 font-bold text-white"
          >
            Daftar <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default KelasExplorer;
