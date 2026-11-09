import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Lock,
  Plus,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react';
import { kelasExplorer as kelas } from '../data/kelasExplorer';
import { rupiah, tanggalPanjang } from '../lib/invoice';
import {
  cekSesi,
  simpanPendaftar,
  daftarPendaftar,
  tautanInvoice,
  tautanCek,
} from '../lib/explorerApi';
import { buatPdf, namaBerkas } from '../lib/invoicePdf';
import { usePromoExplorer } from '../hooks/usePromoExplorer';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const hariIni = () => {
  const d = new Date();
  const wib = new Date(d.getTime() + (7 * 60 + d.getTimezoneOffset()) * 60000);
  return wib.toISOString().slice(0, 10);
};

// Penanda kiriman: klik ganda atau kirim ulang karena jaringan lambat tidak
// membuat pendaftar tercatat dua kali.
const idemBaru = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const DAFTAR_USIA = Array.from(
  { length: kelas.usia.max - kelas.usia.min + 1 },
  (_, i) => kelas.usia.min + i
);

const Label = ({ children }) => (
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{children}</label>
);

const kelasInput =
  'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none dark:border-white/15 dark:bg-[#0b1220] dark:text-white';

const kosong = () => ({ namaAnak: '', usia: '', namaOrtu: '', wa: '', catatan: '' });

const BuatInvoiceExplorer = () => {
  const promo = usePromoExplorer();
  const [sesi, setSesi] = useState({ status: 'memeriksa', pesan: '', terisi: 0 });
  const [isi, setIsi] = useState(kosong);
  const [tanggal, setTanggal] = useState(hariIni);
  const [harga, setHarga] = useState(() => String(promo.harga));
  const [hargaDiubah, setHargaDiubah] = useState(false);
  const [idem, setIdem] = useState(idemBaru);
  const [kirim, setKirim] = useState({ status: 'diam', pesan: '' });
  const [hasil, setHasil] = useState(null); // {pendaftar, pdf:{status, doc}}
  const [tersalin, setTersalin] = useState('');
  const [daftar, setDaftar] = useState([]);

  useDocumentMeta({
    title: 'Buat Invoice Kelas Explorer | Future Makers',
    description: 'Halaman internal untuk mencatat pendaftar dan membuat invoice Kelas Explorer.',
  });

  // Halaman internal: tidak boleh diindeks mesin pencari.
  useEffect(() => {
    let meta = document.head.querySelector('meta[name="robots"]');
    const dibuatDiSini = !meta;
    const awal = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (dibuatDiSini) meta.remove();
      else meta.setAttribute('content', awal);
    };
  }, []);

  // Harga mengikuti promo selama pengelola belum mengubahnya sendiri.
  useEffect(() => {
    if (!hargaDiubah) setHarga(String(promo.harga));
  }, [promo.harga, hargaDiubah]);

  const muatDaftar = useCallback(async () => {
    const r = await daftarPendaftar();
    if (r.ok) {
      setDaftar(r.daftar);
      setSesi((s) => ({ ...s, terisi: r.terisi }));
    }
  }, []);

  const periksaSesi = useCallback(async () => {
    setSesi((s) => ({ ...s, status: 'memeriksa', pesan: '' }));
    const r = await cekSesi();
    if (r.ok) {
      setSesi({ status: 'siap', pesan: '', terisi: r.terisi });
      muatDaftar();
    } else if (r.status === 401 || r.status === 429) {
      setSesi({ status: 'login', pesan: r.pesan, terisi: 0 });
    } else {
      setSesi({ status: 'galat', pesan: r.pesan, terisi: 0 });
    }
  }, [muatDaftar]);

  useEffect(() => {
    periksaSesi();
  }, [periksaSesi]);

  const hargaAngka = Number(harga);
  const siap =
    isi.namaAnak.trim().length >= 2 &&
    isi.namaOrtu.trim().length >= 2 &&
    isi.usia !== '' &&
    Number.isFinite(hargaAngka) &&
    hargaAngka >= 1000;

  // PDF dibuat segera setelah data tersimpan, jadi tinggal diunduh.
  const siapkanPdf = async (p) => {
    setHasil({ pendaftar: p, pdf: { status: 'proses', doc: null } });
    try {
      const doc = await buatPdf(p, tautanCek(p.kode));
      setHasil({ pendaftar: p, pdf: { status: 'siap', doc } });
    } catch (_) {
      setHasil({ pendaftar: p, pdf: { status: 'gagal', doc: null } });
    }
  };

  const kirimData = async (izinkanLebih = false) => {
    setKirim({ status: 'kirim', pesan: '' });
    const r = await simpanPendaftar(
      {
        nama_anak: isi.namaAnak,
        usia_anak: Number(isi.usia),
        nama_ortu: isi.namaOrtu,
        wa: isi.wa,
        harga: hargaAngka,
        tanggal,
        catatan: isi.catatan,
        idem,
      },
      izinkanLebih
    );
    if (r.ok) {
      setKirim({ status: 'diam', pesan: '' });
      setSesi((s) => ({ ...s, terisi: r.terisi }));
      siapkanPdf(r.pendaftar);
      muatDaftar();
      return;
    }
    if (r.kode === 'kuota_penuh') {
      setKirim({ status: 'diam', pesan: '' });
      if (
        window.confirm(
          `Kuota ${kelas.kuota} anak sudah terisi. Tetap tambahkan pendaftar ini (melebihi kuota)?`
        )
      ) {
        kirimData(true);
      }
      return;
    }
    if (r.status === 401) {
      setSesi((s) => ({ ...s, status: 'login' }));
    }
    setKirim({ status: 'gagal', pesan: r.pesan || 'Gagal menyimpan.' });
  };

  const unduh = (doc, p) => doc.save(namaBerkas(p));

  const unduhDariDaftar = async (p) => {
    const doc = await buatPdf(p, tautanCek(p.kode));
    unduh(doc, p);
  };

  const salin = async (kode, nama) => {
    try {
      await navigator.clipboard.writeText(tautanInvoice(kode));
      setTersalin(nama);
      setTimeout(() => setTersalin(''), 2000);
    } catch (_) {
      // Peramban menolak clipboard: tautannya tetap terbaca di layar.
    }
  };

  const buatBaru = () => {
    setHasil(null);
    setIsi(kosong());
    setIdem(idemBaru());
    setKirim({ status: 'diam', pesan: '' });
  };

  const ringkas = useMemo(
    () => ({
      terisi: sesi.terisi,
      penuh: sesi.terisi >= kelas.kuota,
    }),
    [sesi.terisi]
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563eb] dark:bg-[#2563eb]/10">
        <FileText size={12} /> Halaman Internal
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Buat Invoice Kelas Explorer
      </h1>
      <p className="mt-3 text-slate-500 dark:text-slate-400">
        Isi data pendaftar. Setelah tersimpan ke database, PDF invoice (lengkap dengan QR) langsung
        siap diunduh.
      </p>

      {sesi.status === 'memeriksa' && (
        <p className="mt-10 inline-flex items-center gap-2 text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Memeriksa login…
        </p>
      )}

      {(sesi.status === 'login' || sesi.status === 'galat') && (
        <div className="mt-10 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="flex items-center gap-2 font-bold">
            {sesi.status === 'login' ? <Lock size={18} /> : <AlertTriangle size={18} />}
            {sesi.status === 'login' ? 'Perlu login admin' : 'Layanan belum bisa dipakai'}
          </p>
          <p className="mt-2 text-sm">
            {sesi.pesan ||
              'Masukkan nama pengguna dan kata sandi admin pada kotak login peramban, lalu coba lagi.'}
          </p>
          <button
            type="button"
            onClick={periksaSesi}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
          >
            <RefreshCw size={15} /> Coba lagi
          </button>
        </div>
      )}

      {sesi.status === 'siap' && !hasil && (
        <>
          <p
            className={`mt-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
              ringkas.penuh
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
            }`}
          >
            Kursi terisi {ringkas.terisi} dari {kelas.kuota}
          </p>

          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (siap && kirim.status !== 'kirim') kirimData(false);
            }}
          >
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>Nama anak</Label>
                <input
                  className={kelasInput}
                  placeholder="Nama lengkap anak"
                  value={isi.namaAnak}
                  onChange={(e) => setIsi({ ...isi, namaAnak: e.target.value })}
                  maxLength={80}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label>Usia anak</Label>
                <select
                  className={kelasInput}
                  value={isi.usia}
                  onChange={(e) => setIsi({ ...isi, usia: e.target.value })}
                >
                  <option value="">— Pilih usia —</option>
                  {DAFTAR_USIA.map((u) => (
                    <option key={u} value={u}>
                      {u} tahun
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Nama orang tua / wali</Label>
                <input
                  className={kelasInput}
                  placeholder="Nama penerima invoice"
                  value={isi.namaOrtu}
                  onChange={(e) => setIsi({ ...isi, namaOrtu: e.target.value })}
                  maxLength={80}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label>Nomor WhatsApp (opsional)</Label>
                <input
                  className={kelasInput}
                  placeholder="08xx xxxx xxxx"
                  value={isi.wa}
                  onChange={(e) => setIsi({ ...isi, wa: e.target.value })}
                  inputMode="tel"
                  maxLength={24}
                  autoComplete="off"
                />
              </div>
            </section>

            <section className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>Kelas</Label>
                <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-semibold text-slate-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
                  {kelas.nama} · {kelas.jumlahPertemuan} pertemuan
                </p>
              </div>
              <div>
                <Label>Metode pembayaran</Label>
                <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-semibold text-slate-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
                  Lunas
                </p>
              </div>
              <div>
                <Label>Harga (Rp)</Label>
                <input
                  type="number"
                  inputMode="numeric"
                  className={kelasInput}
                  value={harga}
                  onChange={(e) => {
                    setHarga(e.target.value);
                    setHargaDiubah(true);
                  }}
                />
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {promo.aktif
                    ? `Harga promo ${rupiah(kelas.harga.promo)} (normal ${rupiah(kelas.harga.normal)}).`
                    : `Harga normal ${rupiah(kelas.harga.normal)}.`}{' '}
                  Boleh diubah.
                </p>
              </div>
              <div>
                <Label>Tanggal invoice</Label>
                <input
                  type="date"
                  className={kelasInput}
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  Nomor invoice dibuat otomatis, formatnya FM-EX/{tanggal.slice(0, 4) || 'TTTT'}/
                  {tanggal.slice(5, 7) || 'BB'}/001.
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label>Catatan (opsional)</Label>
                <input
                  className={kelasInput}
                  placeholder="mis. membawa laptop sendiri"
                  value={isi.catatan}
                  onChange={(e) => setIsi({ ...isi, catatan: e.target.value })}
                  maxLength={200}
                />
              </div>
            </section>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={!siap || kirim.status === 'kirim'}
                className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-7 py-3.5 font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {kirim.status === 'kirim' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <FileText size={18} />
                )}
                {kirim.status === 'kirim' ? 'Menyimpan…' : 'Simpan & buat invoice PDF'}
              </button>
              {!siap && (
                <span className="text-sm text-amber-700 dark:text-amber-400">
                  Lengkapi nama anak, usia, nama orang tua, dan harga.
                </span>
              )}
            </div>
            {kirim.status === 'gagal' && (
              <p className="mt-4 inline-flex items-start gap-2 text-sm text-rose-700 dark:text-rose-400">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                {kirim.pesan}
              </p>
            )}
          </form>
        </>
      )}

      {/* Hasil: data sudah di database, PDF siap diunduh */}
      {sesi.status === 'siap' && hasil && (
        <section className="mt-10 rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-7 dark:border-emerald-500/40 dark:bg-emerald-500/10">
          <p className="inline-flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
            <BadgeCheck size={20} /> Tersimpan di database
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Nomor invoice</dt>
              <dd className="font-mono font-bold text-slate-900 dark:text-white">{hasil.pendaftar.nomor}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Kode pendaftaran</dt>
              <dd className="font-mono font-bold text-slate-900 dark:text-white">{hasil.pendaftar.kode}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Peserta</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {hasil.pendaftar.nama_anak} ({hasil.pendaftar.usia_anak} th)
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Orang tua / wali</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">{hasil.pendaftar.nama_ortu}</dd>
            </div>
          </dl>

          <p className="mt-5 break-all rounded-xl bg-white p-3 font-mono text-xs text-slate-700 dark:bg-white/5 dark:text-slate-300">
            {tautanInvoice(hasil.pendaftar.kode)}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={hasil.pdf.status !== 'siap'}
              onClick={() => unduh(hasil.pdf.doc, hasil.pendaftar)}
              className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {hasil.pdf.status === 'proses' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {hasil.pdf.status === 'proses' ? 'Menyiapkan PDF…' : 'Unduh PDF Invoice'}
            </button>
            <button
              type="button"
              onClick={() => salin(hasil.pendaftar.kode, 'hasil')}
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb] dark:border-white/15 dark:bg-transparent dark:text-slate-200"
            >
              {tersalin === 'hasil' ? <Check size={18} /> : <Copy size={18} />}
              {tersalin === 'hasil' ? 'Tautan tersalin' : 'Salin tautan invoice'}
            </button>
            <a
              href={`/invoice/${hasil.pendaftar.kode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb] dark:border-white/15 dark:bg-transparent dark:text-slate-200"
            >
              <ExternalLink size={18} /> Buka invoice
            </a>
          </div>
          {hasil.pdf.status === 'gagal' && (
            <p className="mt-4 text-sm text-rose-700 dark:text-rose-400">
              Data sudah tersimpan, tetapi PDF gagal dibuat. Buka invoice lewat tautan di atas lalu unduh dari
              sana.
            </p>
          )}
          <button
            type="button"
            onClick={buatBaru}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:underline"
          >
            <Plus size={15} /> Buat invoice baru
          </button>
        </section>
      )}

      {/* Daftar pendaftar tersimpan */}
      {sesi.status === 'siap' && (
        <section className="mt-14">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Pendaftar tersimpan ({daftar.length})
            </h2>
            <button
              type="button"
              onClick={muatDaftar}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2563eb] hover:underline"
            >
              <RefreshCw size={14} /> Muat ulang
            </button>
          </div>
          {daftar.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Belum ada pendaftar.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
              {daftar.map((p) => (
                <li key={p.kode} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {p.nama_anak} <span className="font-normal text-slate-500">· {p.nama_ortu}</span>
                    </p>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {p.nomor} · {p.kode} · {tanggalPanjang(p.tanggal)} · {rupiah(p.harga)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => unduhDariDaftar(p)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb] dark:border-white/15 dark:text-slate-200"
                    >
                      <Download size={13} /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => salin(p.kode, p.kode)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb] dark:border-white/15 dark:text-slate-200"
                    >
                      {tersalin === p.kode ? <Check size={13} /> : <Copy size={13} />} Tautan
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default BuatInvoiceExplorer;
