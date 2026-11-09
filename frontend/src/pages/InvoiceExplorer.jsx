import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { kelasLanjutan as bersama } from '../data/kelasLanjutan';
import { kelasExplorer as kelas } from '../data/kelasExplorer';
import { rupiah, tanggalPanjang, PENERBIT } from '../lib/invoice';
import { ambilPendaftar, tautanCek } from '../lib/explorerApi';
import { buatPdf, namaBerkas } from '../lib/invoicePdf';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/**
 * Invoice Kelas Explorer yang dibuka lewat tautan pendek /invoice/<kode>.
 * Isinya dibaca dari database, jadi tautan tidak perlu memuat data apa pun.
 */
const InvoiceExplorer = () => {
  const { kode = '' } = useParams();
  const [data, setData] = useState({ status: 'muat', p: null, pesan: '' });
  const [pdf, setPdf] = useState('diam');

  useDocumentMeta({
    title: 'Invoice Kelas Explorer | Future Makers',
    description: 'Invoice pendaftaran Kelas Explorer Future Makers.',
  });

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

  useEffect(() => {
    let hidup = true;
    ambilPendaftar(kode).then((r) => {
      if (!hidup) return;
      if (r.ok) setData({ status: 'ok', p: r.pendaftar, pesan: '' });
      else setData({ status: r.status === 404 ? 'tidak-ada' : 'galat', p: null, pesan: r.pesan });
    });
    return () => {
      hidup = false;
    };
  }, [kode]);

  if (data.status === 'muat') {
    return (
      <p className="mx-auto max-w-xl px-6 py-24 text-center text-slate-500">
        <Loader2 size={20} className="mx-auto animate-spin" />
        <span className="mt-3 block">Memuat invoice…</span>
      </p>
    );
  }

  if (data.status !== 'ok') {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <AlertCircle size={40} className="mx-auto text-rose-500" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Invoice tidak ditemukan</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          {data.status === 'tidak-ada'
            ? 'Kode invoice ini tidak terdaftar. Periksa lagi tautan yang dikirimkan.'
            : data.pesan}
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Butuh bantuan? Hubungi WhatsApp {bersama.whatsapp.display}.
        </p>
      </div>
    );
  }

  const p = data.p;
  const sisa = Math.max(0, p.harga - p.dibayar);

  const unduh = async () => {
    setPdf('proses');
    try {
      const doc = await buatPdf(p, tautanCek(p.kode));
      doc.save(namaBerkas(p));
      setPdf('diam');
    } catch (_) {
      setPdf('gagal');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">Invoice ini bisa diunduh sebagai PDF.</p>
        <button
          type="button"
          onClick={unduh}
          disabled={pdf === 'proses'}
          className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60"
        >
          {pdf === 'proses' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {pdf === 'proses' ? 'Menyiapkan…' : 'Unduh PDF'}
        </button>
      </div>
      {pdf === 'gagal' && (
        <p className="mb-4 text-sm text-rose-700 dark:text-rose-400">PDF gagal dibuat. Coba lagi sebentar.</p>
      )}

      <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10 dark:border-white/10 dark:bg-white/[0.03]">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6 dark:border-white/10">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-[#2563eb]">{PENERBIT.brand}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">AI untuk Anak, Masa Depan Lebih Cerah</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {PENERBIT.kota} · WhatsApp {bersama.whatsapp.display}
              <br />
              {bersama.kontak.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">INVOICE</p>
            <p className="mt-1 font-mono text-sm text-slate-600 dark:text-slate-400">{p.nomor}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{tanggalPanjang(p.tanggal)}</p>
            <span className="mt-3 inline-block rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              LUNAS
            </span>
          </div>
        </header>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ditagihkan kepada</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{p.nama_ortu}</p>
          {p.wa && <p className="text-sm text-slate-600 dark:text-slate-400">{p.wa}</p>}
        </section>

        <section className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-y border-slate-200 dark:border-white/10">
              <tr>
                <th scope="col" className="py-3 font-semibold text-slate-700 dark:text-slate-200">Nama peserta</th>
                <th scope="col" className="py-3 font-semibold text-slate-700 dark:text-slate-200">Kelas</th>
                <th scope="col" className="py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Biaya</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-3 font-medium text-slate-900 dark:text-white">
                  {p.nama_anak}
                  <span className="block text-xs font-normal text-slate-500">Usia {p.usia_anak} tahun</span>
                </td>
                <td className="py-3 text-slate-700 dark:text-slate-300">
                  {kelas.nama}
                  <span className="block text-xs text-slate-500">{kelas.jumlahPertemuan} pertemuan</span>
                </td>
                <td className="py-3 text-right text-slate-900 dark:text-white">{rupiah(p.harga)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mt-5 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">Total biaya</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">{rupiah(p.harga)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">Sudah dibayar</dt>
              <dd className="font-semibold text-emerald-700 dark:text-emerald-400">{rupiah(p.dibayar)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-white/10">
              <dt className="font-bold text-slate-900 dark:text-white">Sisa pembayaran</dt>
              <dd className="text-lg font-extrabold text-[#2563eb]">{rupiah(sisa)}</dd>
            </div>
            <p className="pt-1 text-xs text-slate-500 dark:text-slate-400">Metode: Lunas</p>
          </dl>
        </section>

        <section className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm dark:bg-white/[0.04]">
          <p className="font-semibold text-slate-900 dark:text-white">Jadwal kelas</p>
          <p className="mt-1 text-slate-700 dark:text-slate-300">
            {kelas.jadwal.map((b) => `${b.tanggal.join(' & ')} ${b.bulan}`).join(' · ')}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Setiap {kelas.hari} pukul {kelas.jam} · {kelas.lokasi}
          </p>
          {p.catatan && <p className="mt-3 text-slate-600 dark:text-slate-400">Catatan: {p.catatan}</p>}
        </section>

        <footer className="mt-8 flex flex-wrap items-end justify-between gap-8 border-t border-slate-200 pt-6 dark:border-white/10">
          <div className="text-center">
            <div className="inline-block rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10">
              <QRCodeSVG value={tautanCek(p.kode)} size={110} level="M" />
            </div>
            <p className="mt-2 max-w-[12rem] text-xs leading-snug text-slate-500 dark:text-slate-400">
              Pindai untuk melihat data pendaftar yang tercatat di database
            </p>
            <p className="mt-1 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{p.kode}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {PENERBIT.kota}, {tanggalPanjang(p.tanggal)}
            </p>
            <p className="mt-10 font-bold text-slate-900 dark:text-white">{PENERBIT.nama}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{PENERBIT.peran}</p>
          </div>
        </footer>
      </article>

      <p className="mt-6 flex items-start justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
        <span>
          Keaslian pendaftaran bisa diperiksa lewat{' '}
          <Link to={`/cek/${p.kode}`} className="font-medium text-[#2563eb] hover:underline">
            halaman verifikasi
          </Link>
          .
        </span>
      </p>
    </div>
  );
};

export default InvoiceExplorer;
