import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ShieldCheck, AlertCircle } from 'lucide-react';
import { kelasLanjutan as data } from '../data/kelasLanjutan';
import { bacaToken, rupiah, tanggalPanjang, PENERBIT } from '../lib/invoice';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const LABEL_STATUS = {
  lunas: { teks: 'LUNAS', warna: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  dp: { teks: 'DP DITERIMA', warna: 'bg-amber-100 text-amber-800 border-amber-300' },
  belum: { teks: 'BELUM DIBAYAR', warna: 'bg-rose-100 text-rose-800 border-rose-300' },
};
const labelStatus = (s) =>
  LABEL_STATUS[s] || {
    teks: `CICILAN KE-${String(s).split('-')[1] || ''} DITERIMA`,
    warna: 'bg-sky-100 text-sky-800 border-sky-300',
  };

const namaKelas = (id) => {
  const k = data.kelas.find((x) => x.id === id);
  return k ? k.nama : id;
};

const Invoice = () => {
  const [params] = useSearchParams();
  const token = params.get('d');
  const { ok, data: inv, alasan } = bacaToken(token);

  useDocumentMeta({
    title: ok ? `Invoice ${inv.no} | Future Makers` : 'Invoice | Future Makers',
    description: 'Invoice pendaftaran kelas Future Makers.',
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

  if (!ok) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <AlertCircle size={40} className="mx-auto text-rose-500" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Invoice tidak bisa dibuka
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{alasan}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Coba buka ulang tautan lengkap yang dikirimkan, atau hubungi{' '}
          {data.whatsapp.display}.
        </p>
      </div>
    );
  }

  const status = labelStatus(inv.status);
  const sisa = Math.max(0, (inv.total || 0) - (inv.dibayar || 0));
  const asal = typeof window !== 'undefined' ? window.location.origin : '';
  const tautanVerifikasi = `${asal}/verifikasi?d=${token}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
      {/*
        Saat dicetak, navigasi situs dan tombol tidak ikut terbawa.

        Aturan pertama sengaja dibatasi ke kerangka situs saja. Kop dan kaki
        lembar invoice ini juga memakai <header> dan <footer>, jadi tanpa
        aturan kedua keduanya ikut hilang saat dicetak — termasuk QR-nya.
      */}
      <style>{`
        @media print {
          header, footer, nav, .tanpa-cetak { display: none !important; }
          .lembar-invoice header, .lembar-invoice footer { display: flex !important; }
          body { background: #fff !important; }
          .lembar-invoice { border: none !important; box-shadow: none !important; padding: 0 !important; }
          /* Lencana status dan kotak rekening ikut berwarna di hasil cetak. */
          .lembar-invoice, .lembar-invoice * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Satu invoice satu halaman: jangan terpotong di tengah bagian. */
          .lembar-invoice section, .lembar-invoice footer { break-inside: avoid; }
        }
      `}</style>

      <div className="tanpa-cetak mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Invoice ini bisa dicetak atau disimpan sebagai PDF.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          <Printer size={16} /> Cetak / Simpan PDF
        </button>
      </div>

      <article className="lembar-invoice rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10 dark:border-white/10 dark:bg-white/[0.03]">
        {/* Kop */}
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6 dark:border-white/10">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-[#2563eb]">
              {PENERBIT.brand}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              AI untuk Anak, Masa Depan Lebih Cerah
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {PENERBIT.kota} · WhatsApp {data.whatsapp.display}
              <br />
              {data.kontak.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              INVOICE
            </p>
            <p className="mt-1 font-mono text-sm text-slate-600 dark:text-slate-400">
              {inv.no}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {tanggalPanjang(inv.tgl)}
            </p>
            <span
              className={`mt-3 inline-block rounded-lg border px-3 py-1 text-xs font-bold ${status.warna}`}
            >
              {status.teks}
            </span>
          </div>
        </header>

        {/* Ditagihkan kepada */}
        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ditagihkan kepada
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {inv.ortu}
          </p>
          {inv.wa && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{inv.wa}</p>
          )}
        </section>

        {/* Rincian */}
        <section className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead className="border-y border-slate-200 dark:border-white/10">
              <tr>
                <th scope="col" className="py-3 font-semibold text-slate-700 dark:text-slate-200">
                  Nama peserta
                </th>
                <th scope="col" className="py-3 font-semibold text-slate-700 dark:text-slate-200">
                  Kelas
                </th>
                <th scope="col" className="py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                  Biaya
                </th>
              </tr>
            </thead>
            <tbody>
              {(inv.anak || []).map((a, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-white/5">
                  <td className="py-3 font-medium text-slate-900 dark:text-white">
                    {a.n}
                  </td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">
                    {namaKelas(a.k)}
                  </td>
                  <td className="py-3 text-right text-slate-900 dark:text-white">
                    {rupiah(a.h)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Total */}
        <section className="mt-5 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">Total biaya</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {rupiah(inv.total)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">Sudah dibayar</dt>
              <dd className="font-semibold text-emerald-700 dark:text-emerald-400">
                {rupiah(inv.dibayar)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-white/10">
              <dt className="font-bold text-slate-900 dark:text-white">
                {sisa > 0 ? 'Sisa pembayaran' : 'Sisa'}
              </dt>
              <dd className="text-lg font-extrabold text-[#2563eb]">
                {rupiah(sisa)}
              </dd>
            </div>
            <p className="pt-1 text-xs text-slate-500 dark:text-slate-400">
              Metode: {inv.metode === 'cicilan' ? 'Cicilan 5x' : 'Lunas'}
            </p>
          </dl>
        </section>

        {/* Rekening & catatan */}
        <section className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm dark:bg-white/[0.04]">
          <p className="font-semibold text-slate-900 dark:text-white">
            Pembayaran ditransfer ke
          </p>
          <p className="mt-1 text-slate-700 dark:text-slate-300">
            {data.rekening.bank} · {data.rekening.nomor} · a.n.{' '}
            {data.rekening.atasNama}
          </p>
          {inv.ref && (
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Kode referral: <span className="font-mono">{inv.ref}</span>
            </p>
          )}
          {inv.catatan && (
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Catatan: {inv.catatan}
            </p>
          )}
        </section>

        {/* QR + tanda tangan */}
        <footer className="mt-8 flex flex-wrap items-end justify-between gap-8 border-t border-slate-200 pt-6 dark:border-white/10">
          <div className="text-center">
            <div className="inline-block rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10">
              <QRCodeSVG value={tautanVerifikasi} size={110} level="M" />
            </div>
            <p className="mt-2 max-w-[11rem] text-xs leading-snug text-slate-500 dark:text-slate-400">
              Pindai untuk memeriksa status pendaftaran peserta
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {PENERBIT.kota}, {tanggalPanjang(inv.tgl)}
            </p>
            <p className="mt-10 font-bold text-slate-900 dark:text-white">
              {PENERBIT.nama}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {PENERBIT.peran}
            </p>
          </div>
        </footer>
      </article>

      <p className="tanpa-cetak mt-6 flex items-start justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
        <span>
          Status pendaftaran bisa diperiksa kapan saja lewat{' '}
          <Link
            to={`/verifikasi?d=${token}`}
            className="font-medium text-[#2563eb] hover:underline"
          >
            halaman verifikasi
          </Link>
          .
        </span>
      </p>
    </div>
  );
};

export default Invoice;
