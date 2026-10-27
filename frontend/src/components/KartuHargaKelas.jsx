import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  ArrowRight,
  CalendarDays,
  Star,
  MessageCircle,
  Users,
} from 'lucide-react';
import { kelasLanjutan, hargaPerAnak, rupiah } from '../data/kelasLanjutan';

/**
 * Kartu harga satu kelas: nama, harga, tombol daftar yang langsung menuju
 * formulir kelas itu, daftar isi kelas, dan jadwal yang terbuka saat diklik.
 *
 * `referral` berisi kode resmi yang sudah lolos pencocokan (atau null). Kode
 * itu dipakai dua kali: untuk memotong harga yang ditampilkan, dan untuk
 * dititipkan ke formulir lewat ?ref= supaya tidak perlu diketik ulang dan
 * tetap sampai ke pesan WhatsApp.
 */
const KartuHargaKelas = ({
  kelas,
  referral = null,
  unggulan = false,
  onDaftar,
  kursi = null, // {kuota, terisi, sisa} dari Drive; null = belum/ gagal dimuat
  onPenuh,
}) => {
  const [jadwalTerbuka, setJadwalTerbuka] = useState(false);

  const harga = hargaPerAnak(kelas.id, { referral: !!referral });
  const adaDiskon = harga < kelas.harga.normal;
  const hemat = kelas.harga.normal - harga;
  const jadwal = kelasLanjutan.jadwalKelas[kelas.id];
  const totalPertemuan = jadwal
    ? jadwal.reduce((n, b) => n + b.tanggal.length, 0)
    : null;
  const perBulan = Math.round(harga / kelasLanjutan.cicilan.jumlah);

  const penuh = !!kursi && kursi.sisa <= 0;
  const pesanPenuh = encodeURIComponent(
    `Halo Kak Riki, saya mau mendaftarkan anak ke ${kelas.nama} tapi kursinya sudah penuh. Boleh dimasukkan ke daftar tunggu atau diinfokan kalau ada batch berikutnya?${
      referral ? `

Kode referral: ${referral}` : ''
    }`
  );
  const tautanTunggu = `https://wa.me/${kelasLanjutan.whatsapp.number}?text=${pesanPenuh}`;

  const fitur = [
    kelas.ringkas.split(' · ')[0],
    kelas.ringkas.split(' · ')[1],
    kursi
      ? `${kursi.terisi} dari ${kursi.kuota} kursi sudah terisi`
      : `Maksimal ${kelas.kursi} anak per kelas`,
    'Akun AI berbayar, modul, dan sertifikat',
    `Bisa dicicil ${kelasLanjutan.cicilan.jumlah}x — ${rupiah(perBulan)}/bulan`,
  ];

  return (
    <div
      className={`relative flex flex-col rounded-3xl border-2 bg-white p-7 transition-shadow dark:bg-white/[0.03] ${
        penuh
          ? 'border-rose-200 bg-slate-50 dark:border-rose-500/30 dark:bg-white/[0.02]'
          : unggulan
            ? 'border-[#2563eb] shadow-2xl shadow-[#2563eb]/20 lg:-mt-4 lg:mb-4'
            : 'border-slate-200 hover:shadow-xl dark:border-white/10'
      }`}
    >
      {penuh ? (
        <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
          Kelas Penuh
        </span>
      ) : (
        unggulan && (
          <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#2563eb] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
            <Star size={12} className="fill-current" /> Paling Diminati
          </span>
        )
      )}

      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
        {kelas.nama}
      </h3>
      <p className="mt-1.5 min-h-[2.5rem] text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {kelas.hasilAkhir.split('.')[0]}.
      </p>

      <div className="mt-5">
        {adaDiskon && (
          <p className="flex items-center gap-2">
            <span className="text-base text-slate-400 line-through">
              {rupiah(kelas.harga.normal)}
            </span>
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
              Hemat {rupiah(hemat)}
            </span>
          </p>
        )}
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Rp
          </span>
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {harga.toLocaleString('id-ID')}
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {kelas.id === 'private' ? 'untuk 8 pertemuan' : 'untuk 12 pertemuan'}
        </p>
      </div>

      {penuh ? (
        <>
          <a
            href={tautanTunggu}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onPenuh && onPenuh(kelas.id)}
            className="group mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1eb455]"
          >
            <MessageCircle size={18} />
            Tanya Daftar Tunggu
          </a>
          <p className="mt-2 text-center text-xs text-rose-700 dark:text-rose-400">
            Kursi {kelas.nama} sudah habis. Hubungi kami untuk batch berikutnya.
          </p>
        </>
      ) : (
        <Link
          to={`/pendaftaran/${kelas.slugForm}${
            referral ? `?ref=${encodeURIComponent(referral)}` : ''
          }`}
          onClick={() => onDaftar && onDaftar(kelas.id)}
          className={`group mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold transition-all duration-300 hover:-translate-y-0.5 ${
            unggulan
              ? 'bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30 hover:bg-[#1d4ed8]'
              : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
          }`}
        >
          Daftar {kelas.nama}
          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </Link>
      )}

      {kursi && !penuh && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Users size={13} /> Sisa kursi
            </span>
            <span
              className={kursi.sisa <= 2 ? 'text-rose-600' : 'text-[#2563eb]'}
            >
              {kursi.sisa} dari {kursi.kuota}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${
                kursi.sisa <= 2 ? 'bg-rose-500' : 'bg-[#2563eb]'
              }`}
              style={{
                width: `${Math.min(100, (kursi.terisi / kursi.kuota) * 100)}%`,
              }}
            />
          </div>
        </div>
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

      {/* Jadwal: tersembunyi sampai diklik supaya kartunya tetap ringkas */}
      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-white/5">
        <button
          type="button"
          onClick={() => setJadwalTerbuka((v) => !v)}
          aria-expanded={jadwalTerbuka}
          className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-[#2563eb]"
        >
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={16} />
            {jadwal
              ? `Lihat jadwal ${totalPertemuan} pertemuan`
              : 'Lihat pengaturan jadwal'}
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${
              jadwalTerbuka ? 'rotate-180' : ''
            }`}
          />
        </button>

        {jadwalTerbuka && (
          <div className="mt-4">
            {jadwal ? (
              <>
                <ul className="space-y-2.5">
                  {jadwal.map((b) => (
                    <li key={b.bulan} className="text-sm">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {b.bulan}
                      </span>
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
                  {kelas.ringkas.split(' · ')[1]}, pukul 15.00 WIB. Ada jeda di
                  Februari dan Maret menyesuaikan libur.
                </p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Hari dan jam belajar ditentukan bersama orang tua setelah
                pendaftaran, menyesuaikan jadwal anak. Total 8 pertemuan.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KartuHargaKelas;
