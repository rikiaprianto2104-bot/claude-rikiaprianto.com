import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Info,
  Save,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { kelasLanjutan as data, hargaPerAnak } from '../data/kelasLanjutan';
import { buatToken, rupiah, PENERBIT } from '../lib/invoice';
import { simpanInvoice, apiTersedia } from '../lib/kursiApi';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const hariIni = () => {
  const d = new Date();
  const wib = new Date(d.getTime() + (7 * 60 + d.getTimezoneOffset()) * 60000);
  return wib.toISOString().slice(0, 10);
};

const nomorOtomatis = () => {
  const d = new Date();
  const acak = String(Math.floor(Math.random() * 900) + 100);
  return `FM/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${acak}`;
};

const Label = ({ children }) => (
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
    {children}
  </label>
);

const kelasInput =
  'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none dark:border-white/15 dark:bg-[#0b1220] dark:text-white';

const BuatInvoice = () => {
  const [nomor, setNomor] = useState(nomorOtomatis);
  const [tanggal, setTanggal] = useState(hariIni);
  const [ortu, setOrtu] = useState('');
  const [wa, setWa] = useState('');
  const [jalur, setJalur] = useState('umum'); // 'umum' | 'alumni'
  const [anak, setAnak] = useState([{ n: '', k: 'creator' }]);
  const [metode, setMetode] = useState('lunas');
  const [status, setStatus] = useState('lunas');
  const [dibayar, setDibayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [tersalin, setTersalin] = useState(false);
  const [simpan, setSimpan] = useState({ status: 'diam', pesan: '' });

  useDocumentMeta({
    title: 'Buat Invoice | Future Makers',
    description: 'Halaman internal untuk membuat invoice peserta kelas.',
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

  const adaSaudara = anak.length >= 2;

  const rincian = useMemo(
    () =>
      anak.map((a) => {
        const k = data.kelas.find((x) => x.id === a.k);
        return {
          nama: a.n,
          kelas: k ? k.nama : '-',
          kelasId: a.k,
          harga: hargaPerAnak(a.k, {
            alumni: jalur === 'alumni',
            adaSaudara,
            promoAktif: jalur === 'umum' ? true : null,
          }),
        };
      }),
    [anak, jalur, adaSaudara]
  );

  const total = rincian.reduce((s, r) => s + r.harga, 0);
  const perCicilan = Math.round(total / data.cicilan.jumlah);
  // Kalau nominal dikosongkan, pakai saran yang masuk akal untuk metodenya:
  // lunas berarti seluruh total, cicilan berarti satu kali angsuran.
  const saranDibayar = metode === 'cicilan' ? perCicilan : total;
  const nominalDibayar = dibayar === '' ? saranDibayar : Number(dibayar);

  const payload = {
    no: nomor,
    tgl: tanggal,
    ortu,
    wa,
    jalur,
    anak: rincian.map((r) => ({
      n: r.nama,
      k: r.kelasId,
      kelasNama: r.kelas,
      h: r.harga,
    })),
    metode,
    status,
    total,
    dibayar: nominalDibayar,
    catatan,
  };

  const siap = ortu.trim() !== '' && anak.every((a) => a.n.trim() !== '');
  const token = siap ? buatToken(payload) : '';
  const asal = typeof window !== 'undefined' ? window.location.origin : '';
  const tautanInvoice = siap ? `${asal}/invoice?d=${token}` : '';

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(tautanInvoice);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch (_) {
      // Browser menolak akses clipboard: tautannya tetap terbaca di layar.
    }
  };

  const ubahAnak = (i, patch) =>
    setAnak((lama) => lama.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563eb] dark:bg-[#2563eb]/10">
        <FileText size={12} /> Halaman Internal
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Buat Invoice Peserta
      </h1>
      <p className="mt-3 text-slate-500 dark:text-slate-400">
        Isi datanya, lalu salin tautan invoice di bagian bawah dan kirimkan ke
        orang tua peserta.
      </p>

      {/* Identitas invoice */}
      <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>Nomor invoice</Label>
          <input
            className={kelasInput}
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
          />
        </div>
        <div>
          <Label>Tanggal invoice</Label>
          <input
            type="date"
            className={kelasInput}
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
        </div>
        <div>
          <Label>Nama orang tua / wali</Label>
          <input
            className={kelasInput}
            placeholder="Nama penerima invoice"
            value={ortu}
            onChange={(e) => setOrtu(e.target.value)}
          />
        </div>
        <div>
          <Label>Nomor WhatsApp (opsional)</Label>
          <input
            className={kelasInput}
            placeholder="08xx xxxx xxxx"
            value={wa}
            onChange={(e) => setWa(e.target.value)}
          />
        </div>
      </section>

      {/* Jalur harga */}
      <section className="mt-8">
        <Label>Jalur harga</Label>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { id: 'umum', judul: 'Pendaftar umum', ket: 'Harga normal dengan potongan 20%' },
            { id: 'alumni', judul: 'Alumni Future Makers', ket: 'Harga khusus alumni' },
          ].map((j) => (
            <label
              key={j.id}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-colors ${
                jalur === j.id
                  ? 'border-[#2563eb] bg-[#eef4ff] dark:bg-[#2563eb]/10'
                  : 'border-slate-200 hover:border-[#2563eb]/50 dark:border-white/10'
              }`}
            >
              <input
                type="radio"
                name="jalur"
                className="sr-only"
                checked={jalur === j.id}
                onChange={() => setJalur(j.id)}
              />
              <p className="font-bold text-slate-900 dark:text-white">{j.judul}</p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {j.ket}
              </p>
            </label>
          ))}
        </div>
      </section>

      {/* Peserta */}
      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <Label>Peserta</Label>
          <button
            type="button"
            onClick={() => setAnak((l) => [...l, { n: '', k: 'creator' }])}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2563eb] hover:underline"
          >
            <Plus size={15} /> Tambah anak
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {anak.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1fr_200px_auto] sm:items-end dark:border-white/10"
            >
              <div>
                <Label>Nama anak</Label>
                <input
                  className={kelasInput}
                  placeholder="Nama lengkap anak"
                  value={a.n}
                  onChange={(e) => ubahAnak(i, { n: e.target.value })}
                />
              </div>
              <div>
                <Label>Kelas</Label>
                <select
                  className={kelasInput}
                  value={a.k}
                  onChange={(e) => ubahAnak(i, { k: e.target.value })}
                >
                  {data.kelas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>
              {anak.length > 1 && (
                <button
                  type="button"
                  onClick={() => setAnak((l) => l.filter((_, idx) => idx !== i))}
                  aria-label={`Hapus anak ke-${i + 1}`}
                  className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-rose-400 hover:text-rose-600 dark:border-white/10"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pembayaran */}
      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>Metode pembayaran</Label>
          <select
            className={kelasInput}
            value={metode}
            onChange={(e) => {
              const baru = e.target.value;
              setMetode(baru);
              setStatus(baru === 'cicilan' ? 'cicilan-1' : 'lunas');
            }}
          >
            <option value="lunas">Lunas</option>
            <option value="cicilan">Cicilan 5x</option>
          </select>
          {metode === 'cicilan' && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {rupiah(perCicilan)} per bulan selama {data.cicilan.jumlah} bulan.
            </p>
          )}
        </div>
        <div>
          <Label>Status pembayaran</Label>
          <select
            className={kelasInput}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="lunas">Sudah dibayar lunas</option>
            <option value="dp">Baru bayar sebagian (DP)</option>
            <option value="cicilan-1">Cicilan ke-1 diterima</option>
            <option value="cicilan-2">Cicilan ke-2 diterima</option>
            <option value="cicilan-3">Cicilan ke-3 diterima</option>
            <option value="cicilan-4">Cicilan ke-4 diterima</option>
            <option value="cicilan-5">Cicilan ke-5 diterima</option>
            <option value="belum">Belum dibayar</option>
          </select>
        </div>
        <div>
          <Label>Nominal yang sudah dibayar</Label>
          <input
            type="number"
            className={kelasInput}
            placeholder={String(saranDibayar)}
            value={dibayar}
            onChange={(e) => setDibayar(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Kosongkan untuk memakai {rupiah(saranDibayar)}
            {metode === 'cicilan' ? ' (satu kali cicilan).' : ' (bayar penuh).'}
          </p>
        </div>
        <div>
          <Label>Catatan (opsional)</Label>
          <input
            className={kelasInput}
            placeholder="mis. kursi dikunci sampai 5 November"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>
      </section>

      {/* Ringkasan */}
      <section className="mt-8 rounded-2xl border-2 border-[#2563eb]/25 bg-[#eef4ff] p-6 dark:bg-[#2563eb]/[0.08]">
        <h2 className="font-bold text-slate-900 dark:text-white">Ringkasan</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {rincian.map((r, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="text-slate-700 dark:text-slate-200">
                {r.nama || `Anak ke-${i + 1}`} — {r.kelas}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {rupiah(r.harga)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-[#2563eb]/20 pt-3">
          <span className="font-bold text-slate-900 dark:text-white">Total</span>
          <span className="text-xl font-extrabold text-[#2563eb]">
            {rupiah(total)}
          </span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-300">Sudah dibayar</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {rupiah(nominalDibayar)}
          </span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-300">Sisa</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {rupiah(Math.max(0, total - nominalDibayar))}
          </span>
        </div>
      </section>

      {/* Tautan hasil */}
      <section className="mt-8">
        <h2 className="font-bold text-slate-900 dark:text-white">
          Tautan invoice
        </h2>
        {siap ? (
          <>
            <p className="mt-2 break-all rounded-xl bg-slate-100 p-4 font-mono text-xs text-slate-700 dark:bg-white/5 dark:text-slate-300">
              {tautanInvoice}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {apiTersedia() && (
                <button
                  type="button"
                  disabled={simpan.status === 'kirim'}
                  onClick={async () => {
                    setSimpan({ status: 'kirim', pesan: '' });
                    const hasil = await simpanInvoice(payload, token);
                    if (hasil.ok) {
                      setSimpan({
                        status: 'sukses',
                        pesan: `Tercatat di Drive. ${hasil.dicatat} kursi terpakai.`,
                      });
                    } else {
                      setSimpan({
                        status: 'gagal',
                        pesan: hasil.pesan || 'Gagal menyimpan.',
                      });
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                >
                  {simpan.status === 'kirim' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {simpan.status === 'kirim' ? 'Menyimpan…' : 'Simpan ke Drive'}
                </button>
              )}
              <button
                type="button"
                onClick={salin}
                className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 font-bold text-white transition-colors hover:bg-[#1d4ed8]"
              >
                {tersalin ? <Check size={18} /> : <Copy size={18} />}
                {tersalin ? 'Tautan tersalin' : 'Salin tautan invoice'}
              </button>
              <Link
                to={`/invoice?d=${token}`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-6 py-3 font-semibold text-slate-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] dark:border-white/15 dark:text-slate-200"
              >
                <ExternalLink size={18} /> Buka invoice
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            Isi nama orang tua dan nama semua anak dulu.
          </p>
        )}

        {simpan.status === 'sukses' && (
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <Check size={16} /> {simpan.pesan}
          </p>
        )}
        {simpan.status === 'gagal' && (
          <p className="mt-4 inline-flex items-start gap-2 text-sm text-rose-700 dark:text-rose-400">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            {simpan.pesan}
          </p>
        )}
        {!apiTersedia() && (
          <p className="mt-4 inline-flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            Penyimpanan ke Drive belum disetel, jadi invoice ini belum
            mengurangi sisa kursi di landing page.
          </p>
        )}

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <Info size={14} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
          Seluruh isi invoice tersimpan di dalam tautannya sendiri, bukan di
          server. Siapa pun yang memegang tautan ini bisa membukanya, jadi
          kirimkan hanya kepada orang tua peserta yang bersangkutan.
        </p>
      </section>
    </div>
  );
};

export default BuatInvoice;
