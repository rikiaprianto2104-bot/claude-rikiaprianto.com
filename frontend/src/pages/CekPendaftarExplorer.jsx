import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, AlertCircle, Loader2, Database } from 'lucide-react';
import { kelasLanjutan as bersama } from '../data/kelasLanjutan';
import { kelasExplorer as kelas } from '../data/kelasExplorer';
import { rupiah, tanggalPanjang, PENERBIT } from '../lib/invoice';
import { ambilPendaftar } from '../lib/explorerApi';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const waktuWib = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })} WIB`;
};

const Baris = ({ label, nilai, mono = false }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-3 last:border-0 dark:border-white/5">
    <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className={`text-right font-semibold text-slate-900 dark:text-white ${mono ? 'font-mono text-sm' : ''}`}>
      {nilai}
    </dd>
  </div>
);

/**
 * Halaman yang terbuka saat QR di invoice dipindai. Seluruh isinya dibaca
 * dari database saat itu juga: kalau halaman ini menampilkan datanya, berarti
 * pendaftar tersebut memang tercatat.
 */
const CekPendaftarExplorer = () => {
  const { kode = '' } = useParams();
  const [data, setData] = useState({ status: 'muat', p: null, pesan: '' });

  useDocumentMeta({
    title: 'Verifikasi Pendaftar | Future Makers',
    description: 'Verifikasi pendaftar Kelas Explorer Future Makers.',
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
      <p className="mx-auto max-w-md px-6 py-24 text-center text-slate-500">
        <Loader2 size={22} className="mx-auto animate-spin" />
        <span className="mt-3 block">Memeriksa database…</span>
      </p>
    );
  }

  if (data.status !== 'ok') {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-rose-500" />
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
          {data.status === 'tidak-ada' ? 'Tidak terdaftar' : 'Belum bisa diperiksa'}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          {data.status === 'tidak-ada'
            ? 'Kode ini tidak ditemukan di database pendaftar Kelas Explorer. Jangan anggap invoice ini sah sebelum dikonfirmasi.'
            : data.pesan}
        </p>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Konfirmasi lewat WhatsApp {bersama.whatsapp.display}.
        </p>
      </div>
    );
  }

  const p = data.p;

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <div className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-500/40 dark:bg-emerald-500/10">
        <BadgeCheck size={52} className="mx-auto text-emerald-600" />
        <h1 className="mt-3 text-2xl font-extrabold text-emerald-900 dark:text-emerald-200">Terverifikasi</h1>
        <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
          Pendaftar ini tercatat di database {PENERBIT.brand}.
        </p>
      </div>

      <dl className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-2 dark:border-white/10 dark:bg-white/[0.03]">
        <Baris label="Nama anak" nilai={p.nama_anak} />
        <Baris label="Usia" nilai={`${p.usia_anak} tahun`} />
        <Baris label="Kelas" nilai={kelas.nama} />
        <Baris label="Orang tua / wali" nilai={p.nama_ortu} />
        {p.wa && <Baris label="WhatsApp" nilai={p.wa} mono />}
        <Baris label="Pembayaran" nilai={`LUNAS · ${rupiah(p.dibayar)}`} />
        <Baris label="Nomor invoice" nilai={p.nomor} mono />
        <Baris label="Kode" nilai={p.kode} mono />
        <Baris label="Tanggal invoice" nilai={tanggalPanjang(p.tanggal)} />
      </dl>

      <p className="mt-5 flex items-start justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <Database size={14} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
        <span>Dicatat ke database pada {waktuWib(p.dibuat_pada)}. Nomor WhatsApp disamarkan.</span>
      </p>
    </div>
  );
};

export default CekPendaftarExplorer;
