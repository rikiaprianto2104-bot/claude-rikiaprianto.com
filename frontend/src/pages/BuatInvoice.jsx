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
  Lock,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import {
  kelasLanjutan as data,
  cekReferral,
  hargaPerAnak,
} from '../data/kelasLanjutan';
import { rupiah, PENERBIT } from '../lib/invoice';
import {
  masuk,
  keluar,
  cekSesi,
  simpanInvoice,
  tautanInvoice as buatTautanInvoice,
  tautanCek,
} from '../lib/lanjutanApi';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const hariIni = () => {
  const d = new Date();
  const wib = new Date(d.getTime() + (7 * 60 + d.getTimezoneOffset()) * 60000);
  return wib.toISOString().slice(0, 10);
};

const Label = ({ children }) => (
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
    {children}
  </label>
);

const kelasInput =
  'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none dark:border-white/15 dark:bg-[#0b1220] dark:text-white';

const BuatInvoice = () => {
  // Nomor invoice tidak lagi diketik di sini: server yang menerbitkannya saat
  // invoice disimpan, supaya nomornya dijamin urut dan tidak pernah kembar.
  const [tanggal, setTanggal] = useState(hariIni);
  const [ortu, setOrtu] = useState('');
  const [wa, setWa] = useState('');
  const [jalur, setJalur] = useState('umum'); // 'umum' | 'alumni'
  const [referral, setReferral] = useState('');
  const [anak, setAnak] = useState([{ n: '', k: 'creator' }]);
  const [metode, setMetode] = useState('lunas');
  const [status, setStatus] = useState('lunas');
  const [dibayar, setDibayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [tersalin, setTersalin] = useState(false);
  const [simpan, setSimpan] = useState({ status: 'diam', pesan: '' });
  // Invoice yang sudah tersimpan di server: {kode, nomor, ...}. Selama masih
  // null, berarti belum ada yang diterbitkan pada sesi pengisian ini.
  const [hasil, setHasil] = useState(null);

  // Login admin menggantikan "kunci penyimpanan" yang dulu diketik di halaman
  // ini dan disimpan di localStorage. Sekarang server yang menerbitkan cookie
  // sesi HttpOnly, jadi tidak ada rahasia apa pun yang tersimpan di peramban
  // maupun ikut terbawa ke berkas JavaScript situs.
  const [sesi, setSesi] = useState({ status: 'memeriksa', pesan: '' });
  const [login, setLogin] = useState({
    pengguna: '',
    sandi: '',
    tampil: false,
    status: 'diam',
    pesan: '',
  });

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

  // Cek sekali saat halaman dibuka: kalau cookie sesi masih berlaku, formulir
  // langsung terbuka tanpa perlu login lagi.
  useEffect(() => {
    let hidup = true;
    cekSesi().then((r) => {
      if (!hidup) return;
      if (r.ok) return setSesi({ status: 'siap', pesan: '' });
      if (r.status === 0 || r.status >= 500) {
        return setSesi({ status: 'galat', pesan: r.pesan });
      }
      // 401 saat halaman baru dibuka hanya berarti "belum login".
      setSesi({ status: 'login', pesan: r.status === 429 ? r.pesan : '' });
    });
    return () => {
      hidup = false;
    };
  }, []);

  const kirimLogin = async (e) => {
    e.preventDefault();
    if (login.status === 'kirim') return;
    setLogin((l) => ({ ...l, status: 'kirim', pesan: '' }));
    const r = await masuk(login.pengguna.trim(), login.sandi);
    if (r.ok) {
      setLogin({ pengguna: login.pengguna, sandi: '', tampil: false, status: 'diam', pesan: '' });
      setSesi({ status: 'siap', pesan: '' });
    } else {
      setLogin((l) => ({ ...l, sandi: '', status: 'gagal', pesan: r.pesan || 'Gagal masuk.' }));
    }
  };

  const kirimKeluar = async () => {
    await keluar();
    setSesi({ status: 'login', pesan: '' });
    setHasil(null);
  };

  const adaSaudara = anak.length >= 2;
  const referralBerlaku = cekReferral(referral);
  const referralSalah = referral.trim() !== '' && !referralBerlaku;
  // Sama seperti di formulir pendaftaran: harga alumni sudah lebih murah,
  // jadi kodenya tidak memotong lagi di jalur itu.
  const referralMemotong = !!referralBerlaku && jalur !== 'alumni';

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
            referral: referralMemotong,
          }),
        };
      }),
    [anak, jalur, adaSaudara, referralMemotong]
  );

  const total = rincian.reduce((s, r) => s + r.harga, 0);
  const perCicilan = Math.round(total / data.cicilan.jumlah);
  // Kalau nominal dikosongkan, pakai saran yang masuk akal untuk metodenya:
  // lunas berarti seluruh total, cicilan berarti satu kali angsuran.
  const saranDibayar = metode === 'cicilan' ? perCicilan : total;
  const nominalDibayar = dibayar === '' ? saranDibayar : Number(dibayar);

  // Bentuk kiriman ke API. Nomor invoice sengaja tidak ikut: server yang
  // menerbitkannya. `idem` menandai satu pengisian formulir, jadi klik ganda
  // pada tombol simpan tidak pernah menghasilkan dua invoice.
  const payload = {
    tanggal,
    nama_ortu: ortu,
    wa,
    jalur,
    referral: referralBerlaku || '',
    metode,
    status,
    total,
    dibayar: nominalDibayar,
    catatan,
    peserta: rincian.map((r) => ({
      nama: r.nama,
      kelas: r.kelasId,
      harga: r.harga,
    })),
  };

  const siap = ortu.trim() !== '' && anak.every((a) => a.n.trim() !== '');
  const tautanInvoice = hasil ? buatTautanInvoice(hasil.kode) : '';
  const tautanVerifikasi = hasil ? tautanCek(hasil.kode) : '';

  const kirimInvoice = async () => {
    if (simpan.status === 'kirim' || !siap) return;
    setSimpan({ status: 'kirim', pesan: '' });
    const idem = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const r = await simpanInvoice({ ...payload, idem });
    if (r.ok && r.invoice) {
      setHasil(r.invoice);
      setSimpan({
        status: 'sukses',
        pesan: r.baru
          ? `Invoice ${r.invoice.nomor} tersimpan di server.`
          : `Invoice ${r.invoice.nomor} sudah pernah tersimpan, tidak digandakan.`,
      });
    } else {
      if (r.kode === 'perlu_login') setSesi({ status: 'login', pesan: '' });
      setSimpan({ status: 'gagal', pesan: r.pesan || 'Gagal menyimpan.' });
    }
  };

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
        Isi datanya, lalu simpan. Server menerbitkan nomor invoice dan tautan
        pendek yang bisa Anda kirimkan ke orang tua peserta.
      </p>

      {sesi.status === 'memeriksa' && (
        <p className="mt-10 inline-flex items-center gap-2 text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Memeriksa login…
        </p>
      )}

      {sesi.status === 'galat' && (
        <div className="mt-10 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="inline-flex items-start gap-2 font-semibold">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            Layanan invoice tidak bisa dihubungi.
          </p>
          <p className="mt-2 text-sm leading-relaxed">{sesi.pesan}</p>
        </div>
      )}

      {/* Gerbang login. Tampilannya sengaja sama dengan halaman invoice
          Kelas Explorer supaya pengelola tidak perlu belajar dua pola. */}
      {sesi.status === 'login' && (
        <form
          onSubmit={kirimLogin}
          className="mx-auto mt-10 max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2563eb] dark:bg-[#2563eb]/10">
            <Lock size={22} />
          </span>
          <h2 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
            Masuk sebagai admin
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Halaman ini hanya untuk pengelola Future Makers.
          </p>

          <div className="mt-6">
            <Label>Nama pengguna</Label>
            <input
              className={kelasInput}
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              value={login.pengguna}
              onChange={(e) => setLogin({ ...login, pengguna: e.target.value })}
              autoFocus
            />
          </div>
          <div className="mt-4">
            <Label>Kata sandi</Label>
            <div className="relative">
              <input
                className={`${kelasInput} pr-12`}
                name="password"
                type={login.tampil ? 'text' : 'password'}
                autoComplete="current-password"
                value={login.sandi}
                onChange={(e) => setLogin({ ...login, sandi: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setLogin({ ...login, tampil: !login.tampil })}
                aria-label={login.tampil ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-[#2563eb]"
              >
                {login.tampil ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {(login.pesan || sesi.pesan) && (
            <p
              role="alert"
              className="mt-4 inline-flex items-start gap-2 text-sm text-rose-700 dark:text-rose-400"
            >
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              {login.pesan || sesi.pesan}
            </p>
          )}

          <button
            type="submit"
            disabled={login.status === 'kirim' || !login.pengguna.trim() || !login.sandi}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 py-3.5 font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {login.status === 'kirim' ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Lock size={18} />
            )}
            {login.status === 'kirim' ? 'Memeriksa…' : 'Masuk'}
          </button>
        </form>
      )}

      {sesi.status === 'siap' && (
      <>
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={kirimKeluar}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400"
        >
          <LogOut size={15} /> Keluar
        </button>
      </div>

      {/* Identitas invoice */}
      <section className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
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
            { id: 'umum', judul: 'Pendaftar umum', ket: 'Harga normal; potongan hanya dari kode referral atau kakak-adik' },
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

        <div className="mt-5">
          <Label>Kode referral (kosongkan kalau tidak ada)</Label>
          <input
            type="text"
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
            placeholder="Contoh: Future-SPx"
            autoComplete="off"
            spellCheck="false"
            className={`${kelasInput} font-mono tracking-wide`}
          />
          <p className="mt-2 text-sm">
            {referralBerlaku ? (
              <span className="text-emerald-700 dark:text-emerald-400">
                Kode {referralBerlaku} berlaku.{' '}
                {referralMemotong
                  ? `Potongan ${rupiah(
                      data.referral.potongan
                    )} per anak sudah masuk ke harga di bawah.`
                  : 'Jalur alumni memakai harga khususnya, jadi harga tidak berubah — kodenya tetap tercatat di invoice.'}
              </span>
            ) : referralSalah ? (
              <span className="text-amber-700 dark:text-amber-400">
                Kode tidak dikenali, jadi tidak ada potongan yang diterapkan.
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                Kode ini yang dipakai menghitung komisi sales dan ikut tercetak
                di invoice.
              </span>
            )}
          </p>
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

      {/* Simpan & tautan hasil */}
      <section className="mt-8">
        <h2 className="font-bold text-slate-900 dark:text-white">
          Terbitkan invoice
        </h2>

        {!siap && (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            Isi nama orang tua dan nama semua anak dulu.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!siap || simpan.status === 'kirim'}
            onClick={kirimInvoice}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {simpan.status === 'kirim' ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {simpan.status === 'kirim' ? 'Menyimpan…' : 'Simpan & terbitkan invoice'}
          </button>
        </div>

        {simpan.status === 'gagal' && (
          <p className="mt-4 inline-flex items-start gap-2 text-sm text-rose-700 dark:text-rose-400">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            {simpan.pesan}
          </p>
        )}

        {hasil && (
          <div className="mt-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 dark:border-emerald-500/40 dark:bg-emerald-500/10">
            <p className="inline-flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
              <Check size={18} /> {simpan.pesan}
            </p>

            <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Nomor invoice</dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-white">
                  {hasil.nomor}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Kode peserta</dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-white">
                  {hasil.kode}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tautan invoice untuk orang tua
            </p>
            <p className="mt-1 break-all rounded-xl bg-white p-3 font-mono text-xs text-slate-700 dark:bg-white/5 dark:text-slate-300">
              {tautanInvoice}
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tautan verifikasi (tujuan QR di invoice)
            </p>
            <p className="mt-1 break-all rounded-xl bg-white p-3 font-mono text-xs text-slate-700 dark:bg-white/5 dark:text-slate-300">
              {tautanVerifikasi}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={salin}
                className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 font-bold text-white transition-colors hover:bg-[#1d4ed8]"
              >
                {tersalin ? <Check size={18} /> : <Copy size={18} />}
                {tersalin ? 'Tautan tersalin' : 'Salin tautan invoice'}
              </button>
              <Link
                to={`/invoice/${hasil.kode}`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] dark:border-white/15 dark:bg-transparent dark:text-slate-200"
              >
                <ExternalLink size={18} /> Buka invoice
              </Link>
            </div>
          </div>
        )}

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
          Isi invoice tersimpan di server Anda sendiri, bukan di dalam tautannya
          dan bukan di Google Drive. Kode peserta di atas yang jadi kuncinya,
          jadi kirimkan tautannya hanya kepada orang tua yang bersangkutan.
          Invoice ini langsung mengurangi sisa kursi di landing page.
        </p>
      </section>
      </>
      )}
    </div>
  );
};

export default BuatInvoice;
