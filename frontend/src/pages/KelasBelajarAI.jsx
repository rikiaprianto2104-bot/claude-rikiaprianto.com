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
  Gamepad2,
  Code2,
  Flag,
  Lightbulb,
  Brain,
  Star,
  Heart,
  Shield,
  CheckCircle2,
  Globe,
  Tag,
  Lightbulb as Idea,
} from 'lucide-react';
import WhatsAppCTA from '../components/WhatsAppCTA';
import GameDemo from '../components/GameDemo';
import { futureMakersPaidClass as kelas } from '../mock';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { trackPixel, trackPixelOnce } from '../lib/metaPixel';

// Parameter event Meta Pixel — hanya info konten, tanpa data pribadi pengunjung.
const PIXEL_CONTENT = {
  content_name: 'Kelas Belajar AI untuk Anak (Claude & ChatGPT)',
  content_category: 'Kelas Anak Berbayar',
};

const scheduleIcons = {
  sparkles: Sparkles,
  gamepad: Gamepad2,
  code: Code2,
  flag: Flag,
};

const benefitIcons = {
  lightbulb: Lightbulb,
  brain: Brain,
  users: Users,
  star: Star,
  shield: Shield,
  heart: Heart,
};

const rupiah = (n) => `Rp ${n.toLocaleString('id-ID')}`;

const waLink = `https://wa.me/${kelas.whatsapp.number}?text=${encodeURIComponent(
  kelas.whatsapp.message
)}`;

const hemat = kelas.price.normal - kelas.price.promo;
const hematPersen = Math.round((hemat / kelas.price.normal) * 100);

const DaftarButton = ({
  className = '',
  label = 'Daftar Sekarang',
  size = 'lg',
  position = 'hero',
  onLead,
}) => (
  <WhatsAppCTA
    href={waLink}
    label={label}
    size={size}
    className={className}
    onClick={() => onLead(position)}
  />
);

const KelasBelajarAI = () => {
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
      trackPixelOnce('viewcontent_kelas_belajar_ai', 'ViewContent', {
        ...PIXEL_CONTENT,
        content_type: 'landing_page',
        value: kelas.price.promo,
        currency: kelas.price.currency,
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

  // Meta Pixel: Lead dikirim lebih dulu, baru tab WhatsApp terbuka.
  const handleLead = useCallback((position) => {
    trackPixel('Lead', {
      ...PIXEL_CONTENT,
      content_type: 'whatsapp_click',
      // Hanya posisi tombol, bukan data pengunjung.
      button_position: position,
      value: kelas.price.promo,
      currency: kelas.price.currency,
    });
  }, []);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `${kelas.title} (${kelas.subtitle})`,
      description: kelas.excerpt,
      startDate: '2026-11-08T15:00:00+07:00',
      endDate: '2026-11-29T17:00:00+07:00',
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
        price: String(kelas.price.promo),
        priceCurrency: kelas.price.currency,
        availability: 'https://schema.org/LimitedAvailability',
        validThrough: kelas.price.promoDeadlineISO,
        url: `https://rikiaprianto.com/blog/${kelas.slug}`,
      },
      organizer: {
        '@type': 'Person',
        name: kelas.host.name,
        url: 'https://rikiaprianto.com',
      },
      typicalAgeRange: '6-15',
    }),
    []
  );

  useDocumentMeta({
    title: `${kelas.title} (Claude & ChatGPT) — Kelas Anak 6–15 Tahun di Yogyakarta | Riki MarkeThink`,
    description: kelas.excerpt,
    keywords: [
      'kelas AI untuk anak',
      'belajar ChatGPT untuk anak',
      'belajar Claude untuk anak',
      'kelas coding anak Yogyakarta',
      'kursus AI anak',
      'Future Makers',
      'kelas offline Yogyakarta',
    ],
    image: kelas.image,
    url:
      typeof window !== 'undefined'
        ? window.location.href
        : `https://rikiaprianto.com/blog/${kelas.slug}`,
    type: 'article',
    jsonLd,
  });

  const facts = [
    { icon: Users, label: 'Usia', value: kelas.age },
    { icon: MapPin, label: 'Lokasi', value: kelas.location },
    { icon: Clock, label: 'Waktu', value: '15.00 WIB — Selesai' },
    { icon: CalendarDays, label: 'Jadwal', value: '4x Pertemuan, November 2026' },
  ];

  const cocokUntuk = [
    'Anak berusia 6–15 tahun dan penasaran dengan cara kerja AI.',
    'Orang tua ingin waktu layar anak berubah jadi keterampilan yang terpakai.',
    'Anak belum pernah coding sama sekali — kelas ini memang untuk pemula.',
    'Berdomisili di Yogyakarta atau bisa hadir offline setiap Minggu di bulan November 2026.',
    'Orang tua mencari kelas kecil dengan pendampingan, bukan kelas massal.',
  ];

  return (
    <div className="pb-24 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef4ff] to-white dark:from-[#101a2e] dark:to-[#0b1220]">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#2563eb]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-amber-300/20 dark:bg-amber-400/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-10 pb-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0d9eff] transition-colors"
          >
            <ChevronLeft size={16} /> Kembali ke Blog
          </Link>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2563eb] px-3 py-1.5 rounded-full">
                  <Sparkles size={12} /> {kelas.brand}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-300 px-3 py-1.5 rounded-full">
                  <Users size={12} /> {kelas.quota}
                </span>
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl lg:text-[3.3rem] font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Belajar{' '}
                <span className="text-[#2563eb]">Artificial Intelligence</span>
              </h1>
              <p className="mt-3 inline-block text-xl md:text-2xl font-bold text-slate-900 dark:text-white bg-amber-300 dark:bg-amber-400/90 dark:text-slate-900 px-4 py-1.5 rounded-xl">
                Claude &amp; ChatGPT
              </p>
              <p className="mt-5 inline-flex items-center px-5 py-2 rounded-full border-2 border-slate-300 dark:border-white/20 text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100">
                {kelas.audience}
              </p>
              <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Empat pertemuan di bulan November 2026. Anak belajar memakai AI
                untuk membuat ide, game, dan website sendiri — lalu
                memamerkannya di Demo Day di depan orang tua.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {kelas.pillars.map((p) => (
                  <span
                    key={p}
                    className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  >
                    {p}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <DaftarButton position="hero" onLead={handleLead} />
                <a
                  href="#coba-game"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full border-2 border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 font-semibold hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
                >
                  <Gamepad2 size={20} /> Coba Contoh Gamenya
                </a>
              </div>
            </div>

            {/* Kartu harga */}
            <div className="rounded-3xl border-2 border-[#2563eb]/25 dark:border-white/10 bg-white dark:bg-white/[0.04] p-7 shadow-xl shadow-slate-900/5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-rose-500 px-3 py-1.5 rounded-full">
                <Tag size={12} /> {kelas.price.label}
              </span>

              <div className="mt-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {kelas.price.normalLabel}
                </p>
                <p className="text-xl font-semibold text-slate-400 line-through decoration-rose-500 decoration-2">
                  {rupiah(kelas.price.normal)}
                </p>
                <p className="mt-2 text-4xl md:text-5xl font-extrabold text-[#2563eb] leading-none">
                  {rupiah(kelas.price.promo)}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {kelas.price.unit} · hemat {rupiah(hemat)} ({hematPersen}%)
                </p>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-rose-600 dark:text-rose-400 font-medium">
                {kelas.price.promoNote}
              </p>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 space-y-4">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-start gap-4">
                    <span className="w-10 h-10 rounded-xl bg-[#eef4ff] dark:bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center flex-shrink-0">
                      <f.icon size={18} />
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

              <DaftarButton
                className="mt-6 w-full"
                position="kartu_harga"
                onLead={handleLead}
              />
              <p className="mt-3 text-xs text-center text-slate-500 dark:text-slate-400">
                {kelas.locationNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Jadwal */}
      <section className="bg-slate-50 dark:bg-white/[0.02] py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2563eb] bg-[#eef4ff] dark:bg-[#2563eb]/10 px-3 py-1 rounded-full">
              Materi &amp; Jadwal
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {kelas.period}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Setiap hari Minggu, pukul 15.00 WIB. Satu pertemuan satu misi yang
              selesai hari itu juga, sehingga anak selalu pulang membawa hasil.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kelas.schedule.map((s) => {
              const Icon = scheduleIcons[s.icon] || Sparkles;
              return (
                <div
                  key={s.week}
                  className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-6 hover:border-[#2563eb]/60 hover:shadow-xl hover:shadow-[#2563eb]/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-white bg-[#2563eb] px-3 py-1 rounded-full">
                    {s.week}
                  </span>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white leading-none">
                      {s.date}
                    </span>
                    <span className="text-sm font-bold uppercase text-slate-400 mb-1">
                      {s.month} 2026
                    </span>
                  </div>
                  <span className="mt-5 w-12 h-12 rounded-2xl bg-[#eef4ff] dark:bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center">
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

      {/* Demo game */}
      <section
        id="coba-game"
        className="scroll-mt-24 bg-white dark:bg-[#0b1220] py-16"
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2563eb] bg-[#eef4ff] dark:bg-[#2563eb]/10 px-3 py-1 rounded-full">
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
            <GameDemo
              title={kelas.demoGame.title}
              description="Dibuat dengan bantuan AI &middot; Bisa dimainkan langsung di halaman ini"
              url={kelas.demoGame.url}
              image={kelas.demoGame.image}
            />
          </div>
        </div>
      </section>

      {/* Yang didapat + isi paket */}
      <section className="bg-slate-50 dark:bg-white/[0.02] py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2563eb] bg-[#eef4ff] dark:bg-[#2563eb]/10 px-3 py-1 rounded-full">
              Yang Didapat Anak
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {kelas.motto}
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
                  className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-6 hover:border-[#2563eb]/60 hover:shadow-xl hover:shadow-[#2563eb]/10 transition-all duration-300"
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
          </div>

          {/* Isi paket */}
          <div className="mt-10 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-7 md:p-9">
            <h3 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              <Idea size={22} className="text-[#2563eb]" />
              Yang termasuk dalam biaya {rupiah(kelas.price.promo)}
            </h3>
            <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {kelas.includes.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <CheckCircle2
                    size={20}
                    className="text-[#2563eb] flex-shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Cocok untuk siapa + FAQ */}
      <section className="bg-white dark:bg-[#0b1220] py-16">
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
                    className="text-[#2563eb] flex-shrink-0 mt-0.5"
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
                    <span className="text-[#2563eb] text-xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform duration-300">
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
      <section className="bg-slate-50 dark:bg-white/[0.02] py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] p-8 md:p-12 text-white text-center">
            <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-white/10" />
            <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-white/10" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-300 px-3 py-1.5 rounded-full">
                <Users size={12} /> Hanya {kelas.quotaCount} seat
              </span>
              <h2 className="mt-5 text-3xl md:text-4xl font-extrabold leading-tight">
                {kelas.heroNote}
              </h2>
              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="text-xl text-white/60 line-through">
                  {rupiah(kelas.price.normal)}
                </span>
                <span className="text-3xl md:text-4xl font-extrabold">
                  {rupiah(kelas.price.promo)}
                </span>
              </div>
              <p className="mt-3 text-white/90 leading-relaxed max-w-xl mx-auto">
                {kelas.price.promoNote} Klik tombol di bawah, kirim nama anak,
                usia, dan nama orang tua — kami balas dengan ketersediaan seat
                dan detail pembayarannya.
              </p>
              <div className="mt-8 flex justify-center">
                <DaftarButton position="cta_penutup" onLead={handleLead} />
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
              <span className="text-slate-400 line-through font-medium">
                {rupiah(kelas.price.normal)}
              </span>{' '}
              {rupiah(kelas.price.promo)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {kelas.quotaCount} seat &middot; mulai 8 November 2026
            </p>
          </div>
          <DaftarButton
            size="sm"
            className="flex-shrink-0"
            label="Daftar"
            position="bar_mobile"
            onLead={handleLead}
          />
        </div>
      </div>
    </div>
  );
};

export default KelasBelajarAI;
