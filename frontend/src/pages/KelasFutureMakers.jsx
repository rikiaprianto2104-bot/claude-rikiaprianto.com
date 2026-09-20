import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  MessageCircle,
  Sparkles,
  Users,
  MapPin,
  Clock,
  CalendarDays,
  Gift,
  Puzzle,
  Gamepad2,
  Code2,
  Flag,
  Lightbulb,
  Brain,
  Star,
  Heart,
  Play,
  ArrowUpRight,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { futureMakersClass as kelas } from '../mock';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { trackPixel, trackPixelOnce } from '../lib/metaPixel';

// Parameter event Meta Pixel — sengaja hanya berisi info konten,
// tidak ada data pribadi pengunjung.
const PIXEL_CONTENT = {
  content_name: 'Kelas Offline Future Makers',
  content_category: 'Kelas Anak',
};

const scheduleIcons = {
  puzzle: Puzzle,
  gamepad: Gamepad2,
  code: Code2,
  flag: Flag,
};

const benefitIcons = {
  lightbulb: Lightbulb,
  brain: Brain,
  users: Users,
  star: Star,
  heart: Heart,
};

const waLink = `https://wa.me/${kelas.whatsapp.number}?text=${encodeURIComponent(
  kelas.whatsapp.message
)}`;

const SeatButton = ({
  className = '',
  label = 'Pesan Seat',
  size = 'lg',
  position = 'hero',
  onLead,
}) => (
  <a
    href={waLink}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => onLead(position)}
    className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] font-bold text-white shadow-lg shadow-[#25D366]/30 hover:bg-[#1eb455] hover:shadow-xl hover:shadow-[#25D366]/40 hover:-translate-y-0.5 transition-all duration-300 ${
      size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base'
    } ${className}`}
  >
    <MessageCircle size={size === 'lg' ? 22 : 18} />
    {label}
    <ArrowUpRight
      size={size === 'lg' ? 20 : 16}
      className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300"
    />
  </a>
);

const GameDemo = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 shadow-2xl shadow-slate-900/20">
      <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-slate-900">
        {playing ? (
          <iframe
            src={kelas.demoGame.url}
            title={kelas.demoGame.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="fullscreen; autoplay; gamepad"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 w-full h-full"
            aria-label={`Mainkan ${kelas.demoGame.title}`}
          >
            <img
              src={kelas.demoGame.image}
              alt={kelas.demoGame.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-[1.02] transition-all duration-500"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="w-20 h-20 rounded-full bg-white/95 text-[#0d9eff] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Play size={32} className="ml-1" fill="currentColor" />
              </span>
              <span className="text-white font-bold text-lg drop-shadow-lg">
                Klik untuk Main
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-white dark:bg-white/[0.04] border-t border-slate-200 dark:border-white/10">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {kelas.demoGame.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dibuat dengan bantuan AI &middot; Bisa dimainkan langsung di halaman
            ini
          </p>
        </div>
        <a
          href={kelas.demoGame.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0d9eff] hover:underline flex-shrink-0"
        >
          Buka layar penuh <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  );
};

const KelasFutureMakers = () => {
  // Sembunyikan CTA melayang saat pembaca sudah sampai ke footer.
  const [ctaVisible, setCtaVisible] = useState(true);
  // Penanda agar ViewContent hanya dikirim sekali per kunjungan.
  const viewContentSent = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const distanceToBottom =
        doc.scrollHeight - (window.scrollY + window.innerHeight);
      setCtaVisible(distanceToBottom > 240);

      // Meta Pixel: ViewContent setelah pengunjung melewati 50% halaman.
      if (viewContentSent.current) return;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable < 0.5) return;

      viewContentSent.current = true;
      trackPixelOnce('viewcontent_kelas_future_makers', 'ViewContent', {
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

  // Meta Pixel: Lead dikirim lebih dulu, baru WhatsApp dibuka.
  // Link memakai target="_blank" sehingga halaman ini tidak ditinggalkan
  // dan request event tetap sempat terkirim.
  const handleLead = useCallback((position) => {
    trackPixel('Lead', {
      ...PIXEL_CONTENT,
      content_type: 'whatsapp_click',
      // Hanya posisi tombol, bukan data pengunjung.
      button_position: position,
    });
  }, []);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `${kelas.title} — ${kelas.subtitle}`,
      description: kelas.excerpt,
      startDate: '2026-10-04T15:00:00+07:00',
      endDate: '2026-10-25T17:00:00+07:00',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: kelas.location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Yogyakarta',
          addressCountry: 'ID',
        },
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR',
        availability: 'https://schema.org/LimitedAvailability',
        url: 'https://rikiaprianto.com/blog/kelas-future-makers',
      },
      organizer: {
        '@type': 'Person',
        name: kelas.host.name,
        url: 'https://rikiaprianto.com',
      },
      typicalAgeRange: '6-12',
    }),
    []
  );

  useDocumentMeta({
    title: `${kelas.title} — Kelas AI Gratis untuk Anak 6–12 Tahun | Riki MarkeThink`,
    description: kelas.excerpt,
    keywords: [
      'kelas AI untuk anak',
      'kelas coding anak Yogyakarta',
      'belajar bikin game untuk anak',
      'kelas gratis anak Yogyakarta',
      'Future Makers',
      'AI untuk anak',
      'kelas offline Yogyakarta',
    ],
    image: kelas.image,
    url:
      typeof window !== 'undefined'
        ? window.location.href
        : 'https://rikiaprianto.com/blog/kelas-future-makers',
    type: 'article',
    jsonLd,
  });

  const facts = [
    { icon: Users, label: 'Usia', value: kelas.age },
    { icon: MapPin, label: 'Lokasi', value: kelas.location },
    { icon: Clock, label: 'Waktu', value: '15.00 WIB — Selesai' },
    { icon: CalendarDays, label: 'Jadwal', value: '4x Pertemuan, Oktober 2026' },
  ];

  const cocokUntuk = [
    'Anak berusia 6–12 tahun dan suka bermain game atau menggambar di layar.',
    'Orang tua ingin waktu layar anak berubah jadi kegiatan produktif.',
    'Anak belum pernah coding sama sekali — kelas ini memang untuk pemula.',
    'Berdomisili di Yogyakarta atau bisa hadir offline setiap Minggu di bulan Oktober 2026.',
    'Anak siap menunjukkan karyanya di depan orang tua saat Demo Day.',
  ];

  return (
    <div className="pb-24 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f4faff] to-white dark:from-[#101a2e] dark:to-[#0b1220]">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#0d9eff]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-amber-300/20 dark:bg-amber-400/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-10 pb-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0d9eff] transition-colors"
          >
            <ChevronLeft size={16} /> Kembali ke Blog
          </Link>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#0d9eff] px-3 py-1.5 rounded-full">
                  <Sparkles size={12} /> {kelas.brand}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-300 px-3 py-1.5 rounded-full">
                  <Gift size={12} /> {kelas.price}
                </span>
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                {kelas.title}
              </h1>
              <p className="mt-4 text-xl md:text-2xl font-bold text-[#0d9eff]">
                {kelas.subtitle}
              </p>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {kelas.audience}. Dari ide kecil jadi karya nyata: anak belajar
                membuat game dan website sendiri dengan bantuan AI, lalu
                memamerkannya di Demo Day.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <SeatButton position="hero" onLead={handleLead} />
                <a
                  href="#coba-game"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full border-2 border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 font-semibold hover:border-[#0d9eff] hover:text-[#0d9eff] transition-colors"
                >
                  <Gamepad2 size={20} /> Coba Contoh Gamenya
                </a>
              </div>

              <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
                <Users size={16} /> {kelas.quota} — kuota sangat terbatas
              </p>
            </div>

            {/* Kartu detail */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-7 shadow-xl shadow-slate-900/5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Detail Kelas
              </p>
              <div className="mt-5 space-y-5">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-start gap-4">
                    <span className="w-11 h-11 rounded-2xl bg-[#eaf6ff] dark:bg-[#0d9eff]/10 text-[#0d9eff] flex items-center justify-center flex-shrink-0">
                      <f.icon size={20} />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        {f.label}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {f.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {kelas.locationNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo game */}
      <section
        id="coba-game"
        className="scroll-mt-24 bg-white dark:bg-[#0b1220] py-16"
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#0d9eff] bg-[#eaf6ff] dark:bg-[#0d9eff]/10 px-3 py-1 rounded-full">
              Contoh Karya
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Main Dulu, Baru Bikin Sendiri
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              {kelas.demoGame.description}
            </p>
          </div>

          <div className="mt-10">
            <GameDemo />
          </div>
        </div>
      </section>

      {/* Jadwal */}
      <section className="bg-slate-50 dark:bg-white/[0.02] py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#0d9eff] bg-[#eaf6ff] dark:bg-[#0d9eff]/10 px-3 py-1 rounded-full">
              Materi &amp; Jadwal
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {kelas.period}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Setiap pertemuan punya satu misi yang selesai di hari itu juga,
              sehingga anak selalu pulang dengan hasil karya.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kelas.schedule.map((s) => {
              const Icon = scheduleIcons[s.icon] || Puzzle;
              return (
                <div
                  key={s.week}
                  className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-6 hover:border-[#0d9eff]/60 hover:shadow-xl hover:shadow-[#0d9eff]/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-white bg-[#0d9eff] px-3 py-1 rounded-full">
                    {s.week}
                  </span>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white leading-none">
                      {s.date}
                    </span>
                    <span className="text-sm font-bold uppercase text-slate-400 mb-1">
                      {s.month}
                    </span>
                  </div>
                  <span className="mt-5 w-12 h-12 rounded-2xl bg-[#eaf6ff] dark:bg-[#0d9eff]/10 text-[#0d9eff] flex items-center justify-center">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefit */}
      <section className="bg-white dark:bg-[#0b1220] py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#0d9eff] bg-[#eaf6ff] dark:bg-[#0d9eff]/10 px-3 py-1 rounded-full">
              Yang Didapat Anak
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Bukan Sekadar Main Gadget
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Anak diajak berpindah peran: dari pengguna teknologi menjadi
              pembuat karya.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kelas.benefits.map((b) => {
              const Icon = benefitIcons[b.icon] || Star;
              return (
                <div
                  key={b.title}
                  className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-6 hover:border-[#0d9eff]/60 hover:shadow-xl hover:shadow-[#0d9eff]/10 transition-all duration-300"
                >
                  <span className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              );
            })}

            {/* Kartu penekanan gratis */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0d9eff] to-[#0a7dd1] p-6 text-white flex flex-col justify-between">
              <div>
                <span className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Gift size={22} />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold leading-tight">
                  {kelas.price}
                </h3>
                <p className="mt-2 text-white/90 text-sm leading-relaxed">
                  Tanpa biaya pendaftaran maupun biaya materi. {kelas.quota},
                  supaya setiap anak benar-benar terdampingi.
                </p>
              </div>
              <SeatButton
                size="sm"
                className="mt-6 self-start"
                label="Ambil Seat"
                position="kartu_gratis"
                onLead={handleLead}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cocok untuk siapa + FAQ */}
      <section className="bg-slate-50 dark:bg-white/[0.02] py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Kelas ini cocok kalau&hellip;
            </h2>
            <ul className="mt-7 space-y-4">
              {cocokUntuk.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <CheckCircle2
                    size={20}
                    className="text-[#0d9eff] flex-shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Pertanyaan Orang Tua
            </h2>
            <div className="mt-7 space-y-3">
              {kelas.faq.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-5 py-4"
                >
                  <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-white flex items-start justify-between gap-4">
                    {f.q}
                    <span className="text-[#0d9eff] text-xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform duration-300">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA akhir */}
      <section className="bg-white dark:bg-[#0b1220] py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d9eff] to-[#0a7dd1] p-8 md:p-12 text-white text-center">
            <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-white/10" />
            <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-white/10" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-300 px-3 py-1.5 rounded-full">
                <Users size={12} /> Hanya {kelas.quotaCount} anak tercepat
              </span>
              <h2 className="mt-5 text-3xl md:text-4xl font-extrabold leading-tight">
                Daftar Sekarang, Seat Terbatas
              </h2>
              <p className="mt-4 text-white/90 leading-relaxed max-w-xl mx-auto">
                Klik tombol di bawah untuk memesan seat lewat WhatsApp. Cukup
                kirim nama anak, usia, dan nama orang tua — kami akan konfirmasi
                ketersediaan seat beserta alamat lokasinya.
              </p>
              <div className="mt-8 flex justify-center">
                <SeatButton position="cta_penutup" onLead={handleLead} />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle size={14} /> {kelas.whatsapp.display}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe size={14} /> {kelas.host.website}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles size={14} /> {kelas.host.name} &mdash;{' '}
                  {kelas.host.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA melayang (mobile) */}
      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 px-4 py-3 bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 transition-all duration-300 ${
          ctaVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {kelas.price} &middot; {kelas.quotaCount} seat
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Offline Yogyakarta, Oktober 2026
            </p>
          </div>
          <SeatButton
            size="sm"
            className="flex-shrink-0"
            position="bar_mobile"
            onLead={handleLead}
          />
        </div>
      </div>
    </div>
  );
};

export default KelasFutureMakers;
