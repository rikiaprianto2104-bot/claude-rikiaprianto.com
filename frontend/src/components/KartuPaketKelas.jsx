import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ArrowRight, CalendarDays, Star, Users, Timer } from 'lucide-react';
import HitungMundur from './HitungMundur';
import { rupiah } from '../data/kelasLanjutan';

/**
 * Kartu harga satu kelas untuk daftar harga dua kelas di landing Explorer.
 * Bentuknya mengikuti kartu Kelas Creator di /blog/kelas-belajar-ai-anak
 * (nama, harga coret + hemat, harga besar, tombol daftar, sisa kursi, daftar
 * isi, tanggal yang terbuka saat diklik), ditambah dua hal khusus halaman ini:
 *
 * - `ciri`: label tebal di puncak kartu yang menegaskan kelas ini untuk siapa
 *   ("Pemula, hanya 4 pertemuan" / "Jago AI selama 1 semester").
 * - `promo`: hitung mundur milik kelas itu sendiri. Setiap kelas membawa
 *   tenggat promonya masing-masing, jadi dua hitung mundur tidak saling campur.
 *
 * Komponen ini hanya menampilkan; harga, tenggat, dan jadwal datang dari data
 * masing-masing kelas.
 */
const KartuPaketKelas = ({
  ciri, // {ikon: Komponen, teks: string, warna: 'hijau' | 'ungu'}
  nama,
  hasil,
  promo = null, // {aktif, sisa, label} atau null
  hargaNormal,
  harga,
  durasi,
  rincian,
  tombol, // {label, to, onKlik}
  tautanDetail = null, // {label, to}
  kursi = null, // {kuota, terisi, sisa}; null = tidak ditampilkan
  catatanKuota = null,
  fitur,
  jadwal, // [{bulan, tanggal: []}]
  catatanJadwal,
  jadwalAwalTerbuka = false,
  unggulan = false,
  lencana = null,
}) => {
  const [jadwalTerbuka, setJadwalTerbuka] = useState(jadwalAwalTerbuka);
  const adaDiskon = harga < hargaNormal;
  const totalPertemuan = jadwal.reduce((n, b) => n + b.tanggal.length, 0);
  const Ikon = ciri.ikon;
  const warnaCiri =
    ciri.warna === 'ungu'
      ? 'bg-violet-100 text-violet-800 ring-violet-300 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-400/30'
      : 'bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/30';

  return (
    <div
      className={`relative flex flex-col rounded-3xl border-2 bg-white p-7 dark:bg-white/[0.03] ${
        unggulan
          ? 'border-[#2563eb] shadow-2xl shadow-[#2563eb]/20'
          : 'border-slate-200 hover:shadow-xl dark:border-white/10'
      }`}
    >
      {lencana && (
        <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#2563eb] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
          <Star size={12} className="fill-current" /> {lencana}
        </span>
      )}

      <p
        className={`inline-flex w-fit items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-extrabold uppercase tracking-wide ring-1 ${warnaCiri}`}
      >
        <Ikon size={17} className="flex-shrink-0" />
        {ciri.teks}
      </p>

      <h3 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">{nama}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{hasil}</p>

      {promo && promo.aktif && (
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] p-4 text-white">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Timer size={14} /> Promo berakhir dalam
          </p>
          <p className="mt-0.5 text-xs text-white/80">{promo.label}</p>
          <div className="mt-3 flex justify-center">
            <HitungMundur sisa={promo.sisa} terang kecil />
          </div>
        </div>
      )}

      <div className="mt-5">
        {adaDiskon ? (
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-base text-slate-400 line-through decoration-2">
              {rupiah(hargaNormal)}
            </span>
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
              Hemat {rupiah(hargaNormal - harga)}
            </span>
          </p>
        ) : (
          <p className="h-6" aria-hidden="true" />
        )}
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Rp</span>
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {harga.toLocaleString('id-ID')}
          </span>
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{durasi}</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{rincian}</p>
      </div>

      <Link
        to={tombol.to}
        onClick={tombol.onKlik}
        className={`group mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold transition-all duration-300 hover:-translate-y-0.5 ${
          unggulan
            ? 'bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30 hover:bg-[#1d4ed8]'
            : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
        }`}
      >
        {tombol.label}
        <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>

      {tautanDetail && (
        <Link
          to={tautanDetail.to}
          className="mt-3 text-center text-sm font-semibold text-[#2563eb] hover:underline"
        >
          {tautanDetail.label}
        </Link>
      )}

      {kursi ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Users size={13} /> Sisa kursi
            </span>
            <span className={kursi.sisa <= 2 ? 'text-rose-600' : 'text-[#2563eb]'}>
              {kursi.sisa} dari {kursi.kuota}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${kursi.sisa <= 2 ? 'bg-rose-500' : 'bg-[#2563eb]'}`}
              style={{ width: `${Math.min(100, (kursi.terisi / kursi.kuota) * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        catatanKuota && (
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Users size={13} /> {catatanKuota}
          </p>
        )
      )}

      <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 dark:border-white/5">
        {fitur.map((f) => (
          <li
            key={f}
            className="flex gap-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300"
          >
            <Check size={17} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
            {f}
          </li>
        ))}
      </ul>

      {/* Jadwal: sama dengan kartu Kelas Creator, terbuka saat diklik */}
      <div className="mt-auto border-t border-slate-100 pt-4 dark:border-white/5">
        <div className="mt-1">
          <button
            type="button"
            onClick={() => setJadwalTerbuka((v) => !v)}
            aria-expanded={jadwalTerbuka}
            className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-[#2563eb]"
          >
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={16} />
              Lihat tanggal {totalPertemuan} pertemuan
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${jadwalTerbuka ? 'rotate-180' : ''}`}
            />
          </button>

          {jadwalTerbuka && (
            <div className="mt-4">
              <ul className="space-y-2.5">
                {jadwal.map((b) => (
                  <li key={b.bulan} className="text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">{b.bulan}</span>
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {b.tanggal.map((t) => (
                        <span
                          key={t}
                          className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-lg bg-[#eef4ff] px-1.5 text-xs font-bold text-[#2563eb] dark:bg-[#2563eb]/10"
                        >
                          {t}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {catatanJadwal}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KartuPaketKelas;
