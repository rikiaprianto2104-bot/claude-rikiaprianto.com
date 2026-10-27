import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, AlertCircle, CalendarDays, User, Wallet } from 'lucide-react';
import { kelasLanjutan as data } from '../data/kelasLanjutan';
import { bacaToken, rupiah, tanggalPanjang, PENERBIT } from '../lib/invoice';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const namaKelas = (id) => {
  const k = data.kelas.find((x) => x.id === id);
  return k ? k.nama : id;
};

const ketStatus = (s) => {
  if (s === 'lunas') return 'Pembayaran lunas';
  if (s === 'dp') return 'Pembayaran sebagian (DP) diterima';
  if (s === 'belum') return 'Pembayaran belum diterima';
  const ke = String(s).split('-')[1];
  return `Cicilan ke-${ke} diterima`;
};

const VerifikasiPeserta = () => {
  const [params] = useSearchParams();
  const token = params.get('d');
  const { ok, data: inv, alasan } = bacaToken(token);

  useDocumentMeta({
    title: 'Verifikasi Pendaftaran | Future Makers',
    description: 'Halaman verifikasi status pendaftaran peserta kelas Future Makers.',
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
        <AlertCircle size={44} className="mx-auto text-rose-500" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Pendaftaran tidak dapat diverifikasi
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{alasan}</p>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Silakan hubungi {PENERBIT.brand} di WhatsApp {data.whatsapp.display}{' '}
          untuk memastikan status pendaftaran.
        </p>
      </div>
    );
  }

  const belumBayar = inv.status === 'belum';

  return (
    <div className="mx-auto max-w-xl px-6 py-14 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        {/* Kepala status */}
        <div
          className={`px-8 py-8 text-center text-white ${
            belumBayar
              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : 'bg-gradient-to-br from-emerald-500 to-emerald-700'
          }`}
        >
          <BadgeCheck size={52} className="mx-auto" />
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
            {belumBayar ? 'Terdaftar, Menunggu Pembayaran' : 'Peserta Terdaftar'}
          </h1>
          <p className="mt-2 text-sm text-white/90">
            Data ini diterbitkan oleh {PENERBIT.brand}
          </p>
        </div>

        <div className="p-8">
          {/* Peserta */}
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Peserta
          </p>
          <ul className="mt-3 space-y-3">
            {(inv.anak || []).map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2563eb] dark:bg-[#2563eb]/10">
                  <User size={18} />
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{a.n}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {namaKelas(a.k)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Keterangan */}
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <User size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <div>
                <dt className="text-slate-500 dark:text-slate-400">
                  Orang tua / wali
                </dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {inv.ortu}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <div>
                <dt className="text-slate-500 dark:text-slate-400">
                  Tanggal pendaftaran
                </dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {tanggalPanjang(inv.tgl)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Wallet size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <div>
                <dt className="text-slate-500 dark:text-slate-400">
                  Status pembayaran
                </dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {ketStatus(inv.status)} — {rupiah(inv.dibayar)} dari{' '}
                  {rupiah(inv.total)}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nomor invoice
            </p>
            <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
              {inv.no}
            </p>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Diterbitkan oleh{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">
                {PENERBIT.nama}
              </strong>
              , {PENERBIT.peran}.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Ada yang tidak sesuai? Hubungi {PENERBIT.brand} di WhatsApp{' '}
        {data.whatsapp.display}.
      </p>
    </div>
  );
};

export default VerifikasiPeserta;
