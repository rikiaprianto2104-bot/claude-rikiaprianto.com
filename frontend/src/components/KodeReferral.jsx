import React from 'react';
import { Ticket, Check, AlertCircle } from 'lucide-react';
import { kelasLanjutan, rupiah } from '../data/kelasLanjutan';

/**
 * Kolom kode referral.
 *
 * Kodenya dipegang tim sales dan dibagikan ke orang tua. Begitu kodenya cocok,
 * harga Kelas Creator dan Champions langsung turun di kartu harga, dan kode
 * yang sama ikut terbawa ke formulir serta pesan WhatsApp — itulah yang jadi
 * dasar perhitungan komisi sales.
 *
 * Induknya yang memegang state, supaya kartu harga di halaman yang sama bisa
 * ikut berubah tanpa perlu mengangkat ulang nilainya.
 *
 * @param {string}      nilai   isi kolom apa adanya (termasuk yang salah ketik)
 * @param {function}    onUbah  dipanggil tiap ketikan
 * @param {string|null} berlaku kode resmi hasil pencocokan, null kalau tidak cocok
 */
const KodeReferral = ({ nilai, onUbah, berlaku }) => {
  const diisi = nilai.trim() !== '';
  const salah = diisi && !berlaku;

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-colors ${
        berlaku
          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
          : 'border-dashed border-slate-300 bg-white dark:border-white/15 dark:bg-white/[0.03]'
      }`}
    >
      <label
        htmlFor="kode-referral"
        className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"
      >
        <Ticket size={17} className="text-[#2563eb]" />
        Punya kode referral?
      </label>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Masukkan kode dari tim kami untuk potongan{' '}
        <strong className="text-slate-900 dark:text-white">
          {rupiah(kelasLanjutan.referral.potongan)}
        </strong>{' '}
        per anak, berlaku untuk Kelas Creator dan Kelas Champions.
      </p>

      <input
        id="kode-referral"
        type="text"
        value={nilai}
        onChange={(e) => onUbah(e.target.value)}
        placeholder="Contoh: Future-SPx"
        autoComplete="off"
        spellCheck="false"
        aria-describedby="kode-referral-status"
        className={`mt-3 w-full rounded-xl border-2 bg-white px-4 py-3 font-mono text-sm tracking-wide text-slate-900 outline-none transition-colors placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 dark:bg-white/5 dark:text-white ${
          berlaku
            ? 'border-emerald-400 dark:border-emerald-500/60'
            : salah
              ? 'border-amber-400 dark:border-amber-500/60'
              : 'border-slate-200 focus:border-[#2563eb] dark:border-white/10'
        }`}
      />

      <p
        id="kode-referral-status"
        aria-live="polite"
        className="mt-2 flex items-start gap-1.5 text-sm"
      >
        {berlaku ? (
          <>
            <Check
              size={16}
              className="mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
            />
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              Kode {berlaku} berlaku. Harga Creator dan Champions di bawah sudah
              dipotong {rupiah(kelasLanjutan.referral.potongan)}.
            </span>
          </>
        ) : salah ? (
          <>
            <AlertCircle
              size={16}
              className="mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400"
            />
            <span className="text-amber-700 dark:text-amber-300">
              Kode ini belum dikenali. Periksa lagi ejaannya, atau tanyakan ke
              tim yang memberikan kodenya.
            </span>
          </>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">
            Belum punya kode? Harga di bawah tetap berlaku, tidak ada biaya
            tambahan.
          </span>
        )}
      </p>
    </div>
  );
};

export default KodeReferral;
