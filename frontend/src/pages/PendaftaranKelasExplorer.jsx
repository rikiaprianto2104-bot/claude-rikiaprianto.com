import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  UserRound,
  Cake,
  GraduationCap,
  CreditCard,
  Wallet,
  Copy,
  Check,
  MessageCircle,
  ArrowUpRight,
  Sparkles,
  Info,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';
import { kelasLanjutan as bersama, rupiah } from '../data/kelasLanjutan';
import { kelasExplorer as kelas } from '../data/kelasExplorer';
import { usePromoExplorer } from '../hooks/usePromoExplorer';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { trackPixel } from '../lib/metaPixel';

const DAFTAR_USIA = Array.from(
  { length: kelas.usia.max - kelas.usia.min + 1 },
  (_, i) => kelas.usia.min + i
);

const inputClass =
  'mt-4 w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0b1220] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none';

/**
 * Formulir pendaftaran Kelas Explorer.
 * Kelasnya sudah terpilih, pembayaran hanya lunas, dan tidak ada kode
 * referral maupun jumlah anak: satu formulir untuk satu anak. Orang tua yang
 * mendaftarkan dua anak cukup mengisi formulir ini dua kali.
 */
const PendaftaranKelasExplorer = () => {
  const promo = usePromoExplorer();
  const [namaAnak, setNamaAnak] = useState('');
  const [usia, setUsia] = useState('');
  const [namaOrangTua, setNamaOrangTua] = useState('');
  const [tersalin, setTersalin] = useState(false);

  useDocumentMeta({
    title: 'Pendaftaran Kelas Explorer | Riki MarkeThink',
    description: 'Formulir pendaftaran Kelas Explorer Future Makers.',
  });

  // Halaman formulir tidak perlu muncul di hasil pencarian.
  useEffect(() => {
    let meta = document.head.querySelector('meta[name="robots"]');
    const dibuatDiSini = !meta;
    const nilaiAwal = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (dibuatDiSini) meta.remove();
      else meta.setAttribute('content', nilaiAwal);
    };
  }, []);

  const siapKirim = namaAnak.trim() !== '' && usia !== '' && namaOrangTua.trim() !== '';

  const jadwalTeks = kelas.jadwal.map((b) => `${b.tanggal.join(', ')} ${b.bulan}`).join(' dan ');

  const pesanWa = useMemo(() => {
    const baris = [
      `Halo Kak Riki, saya mau mendaftar ${kelas.nama} Future Makers.`,
      '',
      `Nama anak: ${namaAnak.trim() || '-'}`,
      `Usia anak: ${usia ? `${usia} tahun` : '-'}`,
      `Kelas yang dipilih: ${kelas.nama}`,
      `Nama orang tua/wali: ${namaOrangTua.trim() || '-'}`,
      '',
      `Jadwal: ${jadwalTeks}, pukul ${kelas.jam}`,
      promo.aktif
        ? `Biaya: ${rupiah(promo.harga)} (harga promo, normal ${rupiah(kelas.harga.normal)})`
        : `Biaya: ${rupiah(promo.harga)}`,
      'Metode pembayaran: Lunas',
      '',
      `Saya akan transfer ke ${bersama.rekening.bank} ${bersama.rekening.nomor} a.n. ${bersama.rekening.atasNama}, lalu mengirim bukti transfernya di sini.`,
    ];
    return baris.join('\n');
  }, [namaAnak, usia, namaOrangTua, jadwalTeks, promo.aktif, promo.harga]);

  const waLink = `https://wa.me/${bersama.whatsapp.number}?text=${encodeURIComponent(pesanWa)}`;

  const salinRekening = async () => {
    try {
      await navigator.clipboard.writeText(bersama.rekening.nomor);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch (_) {
      // Browser tanpa izin clipboard: nomornya tetap terbaca di layar.
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-14">
      {/* Kop */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2563eb] px-3 py-1.5 rounded-full">
          <Sparkles size={12} /> Future Makers
        </span>
        <h1 className="mt-5 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pendaftaran {kelas.nama}
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          {kelas.jumlahPertemuan} pertemuan · setiap {kelas.hari} pukul {kelas.jam} · mulai 22 November 2026
        </p>
      </div>

      {/* 1. Nama anak */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <User size={20} className="text-[#2563eb]" />
          1. Nama anak
        </h2>
        <input
          type="text"
          value={namaAnak}
          onChange={(e) => setNamaAnak(e.target.value)}
          placeholder="Tulis nama lengkap anak"
          autoComplete="off"
          className={inputClass}
        />
      </section>

      {/* 2. Usia anak */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Cake size={20} className="text-[#2563eb]" />
          2. Usia anak
        </h2>
        <div className="mt-4 flex flex-wrap gap-3" role="radiogroup" aria-label="Usia anak">
          {DAFTAR_USIA.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={usia === n}
              onClick={() => setUsia(n)}
              className={`w-14 h-14 rounded-2xl border-2 font-bold text-lg transition-all duration-200 ${
                usia === n
                  ? 'border-[#2563eb] bg-[#2563eb] text-white'
                  : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#2563eb]/50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Kelas Explorer untuk anak usia {kelas.usia.min} sampai {kelas.usia.max} tahun.
        </p>
      </section>

      {/* 3. Kelas (otomatis) */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <GraduationCap size={20} className="text-[#2563eb]" />
          3. Kelas yang dipilih
        </h2>
        <div className="mt-4 rounded-2xl border-2 border-[#2563eb] bg-[#eef4ff] dark:bg-[#2563eb]/10 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{kelas.nama}</span>
            <span className="flex items-baseline gap-2">
              {promo.aktif && (
                <span className="text-sm text-slate-400 line-through">{rupiah(kelas.harga.normal)}</span>
              )}
              <span className="text-lg font-extrabold text-[#2563eb]">{rupiah(promo.harga)}</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {kelas.jumlahPertemuan} pertemuan · setiap {kelas.hari} · {kelas.jam} · maks {kelas.kuota} anak
          </p>
          <p className="mt-3 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <CalendarDays size={16} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
            {jadwalTeks}
          </p>
          <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
            Kelasnya sudah terpilih otomatis.
            {promo.aktif && ` Harga promo berlaku sampai ${kelas.promoSampaiLabel}.`}
          </p>
        </div>
      </section>

      {/* 4. Nama orang tua */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <UserRound size={20} className="text-[#2563eb]" />
          4. Nama orang tua / wali
        </h2>
        <input
          type="text"
          value={namaOrangTua}
          onChange={(e) => setNamaOrangTua(e.target.value)}
          placeholder="Tulis nama lengkap orang tua atau wali"
          autoComplete="off"
          className={inputClass}
        />
      </section>

      {/* 5. Metode pembayaran: hanya lunas */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <CreditCard size={20} className="text-[#2563eb]" />
          5. Metode pembayaran
        </h2>
        <div className="mt-4 rounded-2xl border-2 border-[#2563eb] bg-[#eef4ff] dark:bg-[#2563eb]/10 p-5">
          <p className="font-bold text-slate-900 dark:text-white">Lunas</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Bayar sekali, kursi langsung terkunci. Kelas Explorer tidak tersedia dengan cicilan.
          </p>
          <p className="mt-3 text-xl font-extrabold text-[#2563eb]">{rupiah(promo.harga)}</p>
        </div>
      </section>

      {/* Ringkasan */}
      <section className="mt-10 rounded-3xl border-2 border-[#2563eb]/25 bg-[#eef4ff] dark:bg-[#2563eb]/[0.08] p-7">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ringkasan Biaya</h2>
        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#2563eb]/15">
          <span className="text-slate-700 dark:text-slate-200">
            {namaAnak.trim() || 'Nama anak'} — {kelas.nama}
          </span>
          <span className="flex items-baseline gap-2">
            {promo.aktif && (
              <span className="text-sm text-slate-400 line-through">{rupiah(kelas.harga.normal)}</span>
            )}
            <span className="font-bold text-slate-900 dark:text-white">{rupiah(promo.harga)}</span>
          </span>
        </div>
        {promo.aktif && (
          <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Hemat {rupiah(promo.hemat)} dengan harga promo.
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
          <span className="text-3xl font-extrabold text-[#2563eb]">{rupiah(promo.harga)}</span>
        </div>
      </section>

      {/* Rekening */}
      <section className="mt-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-7">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Wallet size={20} className="text-[#2563eb]" />
          Pembayaran
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
          Pembayaran lunas sebesar {rupiah(promo.harga)} bisa langsung ditransfer ke rekening berikut.
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">{bersama.rekening.bank}</p>
          <p className="mt-1 text-2xl md:text-3xl font-extrabold tracking-wide text-slate-900 dark:text-white">
            {bersama.rekening.nomor}
          </p>
          <p className="mt-1 text-slate-700 dark:text-slate-300">a.n. {bersama.rekening.atasNama}</p>
          <button
            type="button"
            onClick={salinRekening}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/15 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
          >
            {tersalin ? <Check size={16} /> : <Copy size={16} />}
            {tersalin ? 'Nomor tersalin' : 'Salin nomor rekening'}
          </button>
        </div>

        <p className="mt-5 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <Info size={16} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
          <span>
            Setelah transfer, <strong className="font-semibold">kirim bukti pembayaran lewat WhatsApp</strong>{' '}
            ke {bersama.whatsapp.display}. Kursi anak resmi terkunci setelah bukti pembayaran kami terima.
          </span>
        </p>
      </section>

      {/* Kirim */}
      <section className="mt-8 text-center">
        {!siapKirim && (
          <p className="mb-4 inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertCircle size={16} /> Lengkapi nama anak, usia anak, dan nama orang tua dulu.
          </p>
        )}
        <div>
          <a
            href={siapKirim ? waLink : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!siapKirim}
            onClick={(e) => {
              if (!siapKirim) {
                e.preventDefault();
                return;
              }
              trackPixel('Lead', {
                content_name: 'Kelas Explorer Future Makers',
                content_category: 'Kelas Anak Berbayar',
                value: promo.harga,
                currency: 'IDR',
              });
            }}
            className={`inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-lg font-bold text-white transition-all duration-300 ${
              siapKirim
                ? 'bg-[#25D366] shadow-lg shadow-[#25D366]/30 hover:bg-[#1eb455] hover:-translate-y-0.5'
                : 'bg-slate-300 dark:bg-white/10 cursor-not-allowed'
            }`}
          >
            <MessageCircle size={22} />
            Kirim Pendaftaran via WhatsApp
            <ArrowUpRight size={20} />
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Data di atas otomatis tersalin ke pesan WhatsApp, jadi Anda tidak perlu mengetik ulang.
        </p>
        <p className="mt-6 text-sm">
          <Link to="/blog/kelas-explorer" className="text-[#2563eb] hover:underline">
            Kembali ke halaman Kelas Explorer
          </Link>
        </p>
      </section>

      <p className="mt-10 text-xs text-slate-400 dark:text-slate-500 leading-relaxed text-center">
        Satu formulir untuk satu anak. Untuk mendaftarkan lebih dari satu anak, isi formulir ini sekali lagi untuk
        setiap anak.
      </p>
    </div>
  );
};

export default PendaftaranKelasExplorer;
