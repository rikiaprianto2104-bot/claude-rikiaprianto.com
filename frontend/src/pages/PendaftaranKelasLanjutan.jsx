import React, { useEffect, useMemo, useState } from 'react';
import {
  GraduationCap,
  Users,
  User,
  CreditCard,
  Wallet,
  Copy,
  Check,
  MessageCircle,
  ArrowUpRight,
  Sparkles,
  Info,
  AlertCircle,
} from 'lucide-react';
import {
  kelasLanjutan as data,
  hargaPerAnak,
  hargaNormalPerAnak,
  rupiah,
} from '../data/kelasLanjutan';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const anakKosong = () => ({ nama: '', kelas: 'creator' });

const PendaftaranKelasLanjutan = () => {
  const [lulusan, setLulusan] = useState(null); // null = belum memilih
  const [anak, setAnak] = useState([anakKosong()]);
  const [namaOrangTua, setNamaOrangTua] = useState('');
  const [metode, setMetode] = useState('lunas');
  const [tersalin, setTersalin] = useState(false);

  useDocumentMeta({
    title: `${data.title} | Riki MarkeThink`,
    description:
      'Formulir pendaftaran Kelas Lanjutan Future Makers: Creator, Champions, dan Private.',
  });

  // Halaman ini sengaja tidak ditautkan dari mana pun dan tidak boleh diindeks.
  useEffect(() => {
    let meta = document.head.querySelector('meta[name="robots"]');
    const dibuatDiSini = !meta;
    const nilaiAwal = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (dibuatDiSini) meta.remove();
      else meta.setAttribute('content', nilaiAwal);
    };
  }, []);

  const jumlahAnak = anak.length;
  const adaSaudara = jumlahAnak >= 2;

  const ubahJumlahAnak = (n) => {
    setAnak((lama) => {
      const baru = [...lama];
      while (baru.length < n) baru.push(anakKosong());
      return baru.slice(0, n);
    });
  };

  const ubahAnak = (i, patch) =>
    setAnak((lama) => lama.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  const rincian = useMemo(
    () =>
      anak.map((a) => {
        const kelas = data.kelas.find((k) => k.id === a.kelas);
        const harga = hargaPerAnak(a.kelas, lulusan === true, adaSaudara);
        const normal = hargaNormalPerAnak(a.kelas);
        return {
          nama: a.nama,
          kelas,
          harga,
          normal,
          hemat: normal - harga,
        };
      }),
    [anak, lulusan, adaSaudara]
  );

  const total = rincian.reduce((s, r) => s + r.harga, 0);
  const totalNormal = rincian.reduce((s, r) => s + r.normal, 0);
  const totalHemat = totalNormal - total;
  const perBulan = Math.round(total / data.cicilan.jumlah);

  const siapKirim =
    lulusan !== null &&
    namaOrangTua.trim() !== '' &&
    anak.every((a) => a.nama.trim() !== '');

  const pesanWa = useMemo(() => {
    const baris = [
      'Halo Kak Riki, saya mau mendaftar Kelas Lanjutan Future Makers.',
      '',
      `Status: ${
        lulusan ? 'Lulusan Kelas Future Makers' : 'Belum pernah ikut Kelas Future Makers'
      }`,
      `Nama orang tua: ${namaOrangTua || '-'}`,
      `Jumlah anak: ${jumlahAnak}`,
      '',
    ];
    rincian.forEach((r, i) => {
      baris.push(
        `${i + 1}. ${r.nama || '(nama anak)'} — ${r.kelas.nama} — ${rupiah(
          r.harga
        )}`
      );
    });
    baris.push('');
    if (adaSaudara) {
      baris.push(
        `Diskon kakak-adik ${data.diskonSaudaraPersen}% sudah termasuk (kecuali Kelas Private).`
      );
    }
    baris.push(`Total: ${rupiah(total)}`);
    if (metode === 'cicilan') {
      baris.push(
        `Metode pembayaran: Cicilan ${data.cicilan.jumlah}x — ${rupiah(
          perBulan
        )} per bulan`
      );
      baris.push(`Cicilan pertama: ${data.cicilan.bulan[0]}`);
    } else {
      baris.push('Metode pembayaran: Lunas');
    }
    baris.push('');
    baris.push(
      `Saya akan transfer ke ${data.rekening.bank} ${data.rekening.nomor} a.n. ${data.rekening.atasNama}, lalu mengirim bukti transfernya di sini.`
    );
    return baris.join('\n');
  }, [
    lulusan,
    namaOrangTua,
    jumlahAnak,
    rincian,
    adaSaudara,
    total,
    metode,
    perBulan,
  ]);

  const waLink = `https://wa.me/${data.whatsapp.number}?text=${encodeURIComponent(
    pesanWa
  )}`;

  const salinRekening = async () => {
    try {
      await navigator.clipboard.writeText(data.rekening.nomor);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch (_) {
      // Browser tanpa izin clipboard: nomornya tetap terbaca di layar.
    }
  };

  const labelKartu = (aktif) =>
    `cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
      aktif
        ? 'border-[#2563eb] bg-[#eef4ff] dark:bg-[#2563eb]/10'
        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[#2563eb]/50'
    }`;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-14">
      {/* Kop */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2563eb] px-3 py-1.5 rounded-full">
          <Sparkles size={12} /> Future Makers
        </span>
        <h1 className="mt-5 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {data.title}
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          {data.subtitle}
        </p>
      </div>

      {/* 1. Status lulusan */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <GraduationCap size={20} className="text-[#2563eb]" />
          1. Apakah anak lulusan Kelas Future Makers?
        </h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className={labelKartu(lulusan === true)}>
            <input
              type="radio"
              name="lulusan"
              className="sr-only"
              checked={lulusan === true}
              onChange={() => {
                setLulusan(true);
                setAnak((lama) => lama.map(() => anakKosong()));
              }}
            />
            <p className="font-bold text-slate-900 dark:text-white">
              Ya, alumni Future Makers
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Mendapat harga khusus alumni
            </p>
          </label>
          <label className={labelKartu(lulusan === false)}>
            <input
              type="radio"
              name="lulusan"
              className="sr-only"
              checked={lulusan === false}
              onChange={() => {
                setLulusan(false);
                setAnak((lama) => lama.map(() => anakKosong()));
              }}
            />
            <p className="font-bold text-slate-900 dark:text-white">
              Belum pernah ikut
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Berlaku harga normal
            </p>
          </label>
        </div>
      </section>

      {/* 2. Jumlah anak */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Users size={20} className="text-[#2563eb]" />
          2. Berapa anak yang didaftarkan?
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {Array.from({ length: data.maksAnak }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => ubahJumlahAnak(n)}
              className={`w-14 h-14 rounded-2xl border-2 font-bold text-lg transition-all duration-200 ${
                jumlahAnak === n
                  ? 'border-[#2563eb] bg-[#2563eb] text-white'
                  : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#2563eb]/50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {adaSaudara && (
          <p className="mt-3 inline-flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <Check size={16} className="mt-0.5 flex-shrink-0" />
            Diskon kakak-adik kandung {data.diskonSaudaraPersen}% per anak sudah
            diterapkan. Tidak berlaku untuk Kelas Private.
          </p>
        )}
      </section>

      {/* 3. Data anak */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <User size={20} className="text-[#2563eb]" />
          3. Data anak &amp; kelas yang dipilih
        </h2>
        {lulusan === null && (
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertCircle size={16} /> Pilih dulu status di langkah 1.
          </p>
        )}

        <div className="mt-4 space-y-5">
          {anak.map((a, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
                Anak ke-{i + 1}
              </p>

              <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nama anak
              </label>
              {lulusan === true ? (
                <select
                  value={a.nama}
                  onChange={(e) => ubahAnak(i, { nama: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0b1220] px-4 py-3 text-slate-900 dark:text-white focus:border-[#2563eb] focus:outline-none"
                >
                  <option value="">— Pilih nama anak —</option>
                  {data.alumni.map((nama) => (
                    <option key={nama} value={nama}>
                      {nama}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={a.nama}
                  onChange={(e) => ubahAnak(i, { nama: e.target.value })}
                  placeholder="Tulis nama lengkap anak"
                  disabled={lulusan === null}
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0b1220] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none disabled:opacity-50"
                />
              )}

              <p className="mt-5 text-sm font-medium text-slate-700 dark:text-slate-300">
                Kelas yang dipilih
              </p>
              <div className="mt-3 space-y-3">
                {data.kelas.map((k) => {
                  const harga = hargaPerAnak(k.id, lulusan === true, adaSaudara);
                  const normal = k.harga.normal;
                  const adaPotongan = harga < normal;
                  return (
                    <label
                      key={k.id}
                      className={`block cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                        a.kelas === k.id
                          ? 'border-[#2563eb] bg-[#eef4ff] dark:bg-[#2563eb]/10'
                          : 'border-slate-200 dark:border-white/10 hover:border-[#2563eb]/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`kelas-${i}`}
                        className="sr-only"
                        checked={a.kelas === k.id}
                        onChange={() => ubahAnak(i, { kelas: k.id })}
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {k.nama}
                        </span>
                        <span className="flex items-baseline gap-2">
                          {adaPotongan && (
                            <span className="text-sm text-slate-400 line-through">
                              {rupiah(normal)}
                            </span>
                          )}
                          <span className="text-lg font-extrabold text-[#2563eb]">
                            {rupiah(harga)}
                          </span>
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {k.ringkas}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {k.deskripsi}
                      </p>
                      {k.catatan && (
                        <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
                          {k.catatan}
                        </p>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Nama orang tua */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <User size={20} className="text-[#2563eb]" />
          4. Nama orang tua / wali
        </h2>
        <input
          type="text"
          value={namaOrangTua}
          onChange={(e) => setNamaOrangTua(e.target.value)}
          placeholder="Tulis nama lengkap orang tua"
          className="mt-4 w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0b1220] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none"
        />
      </section>

      {/* 5. Metode pembayaran */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <CreditCard size={20} className="text-[#2563eb]" />
          5. Metode pembayaran
        </h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className={labelKartu(metode === 'lunas')}>
            <input
              type="radio"
              name="metode"
              className="sr-only"
              checked={metode === 'lunas'}
              onChange={() => setMetode('lunas')}
            />
            <p className="font-bold text-slate-900 dark:text-white">Lunas</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Bayar sekali, kursi langsung terkunci
            </p>
            <p className="mt-3 text-xl font-extrabold text-[#2563eb]">
              {rupiah(total)}
            </p>
          </label>
          <label className={labelKartu(metode === 'cicilan')}>
            <input
              type="radio"
              name="metode"
              className="sr-only"
              checked={metode === 'cicilan'}
              onChange={() => setMetode('cicilan')}
            />
            <p className="font-bold text-slate-900 dark:text-white">
              Cicilan {data.cicilan.jumlah}x
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {data.cicilan.catatan}
            </p>
            <p className="mt-3 text-xl font-extrabold text-[#2563eb]">
              {rupiah(perBulan)}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {' '}
                / bulan
              </span>
            </p>
          </label>
        </div>

        {metode === 'cicilan' && (
          <div className="mt-4 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {data.cicilan.bulan.map((b, i) => (
                  <tr
                    key={b}
                    className={
                      i % 2 ? 'bg-slate-50 dark:bg-white/[0.02]' : undefined
                    }
                  >
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                      {b}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                      {rupiah(perBulan)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Ringkasan */}
      <section className="mt-10 rounded-3xl border-2 border-[#2563eb]/25 bg-[#eef4ff] dark:bg-[#2563eb]/[0.08] p-7">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Ringkasan Biaya
        </h2>
        <div className="mt-5 space-y-3">
          {rincian.map((r, i) => (
            <div
              key={i}
              className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#2563eb]/15"
            >
              <span className="text-slate-700 dark:text-slate-200">
                {r.nama || `Anak ke-${i + 1}`} — {r.kelas.nama}
              </span>
              <span className="flex items-baseline gap-2">
                {r.hemat > 0 && (
                  <span className="text-sm text-slate-400 line-through">
                    {rupiah(r.normal)}
                  </span>
                )}
                <span className="font-bold text-slate-900 dark:text-white">
                  {rupiah(r.harga)}
                </span>
              </span>
            </div>
          ))}
        </div>

        {totalHemat > 0 && (
          <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Total hemat {rupiah(totalHemat)} dari harga normal.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            Total
          </span>
          <span className="text-3xl font-extrabold text-[#2563eb]">
            {rupiah(total)}
          </span>
        </div>
        {metode === 'cicilan' && (
          <p className="mt-1 text-right text-sm text-slate-600 dark:text-slate-300">
            {rupiah(perBulan)} × {data.cicilan.jumlah} bulan
          </p>
        )}
      </section>

      {/* Rekening */}
      <section className="mt-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-7">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Wallet size={20} className="text-[#2563eb]" />
          Pembayaran
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
          {metode === 'cicilan'
            ? `Cicilan pertama (${data.cicilan.bulan[0]}) sebesar ${rupiah(
                perBulan
              )} bisa langsung ditransfer ke rekening berikut.`
            : `Pembayaran lunas sebesar ${rupiah(
                total
              )} bisa langsung ditransfer ke rekening berikut.`}
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {data.rekening.bank}
          </p>
          <p className="mt-1 text-2xl md:text-3xl font-extrabold tracking-wide text-slate-900 dark:text-white">
            {data.rekening.nomor}
          </p>
          <p className="mt-1 text-slate-700 dark:text-slate-300">
            a.n. {data.rekening.atasNama}
          </p>
          <button
            type="button"
            onClick={salinRekening}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/15 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
          >
            {tersalin ? <Check size={16} /> : <Copy size={16} />}
            {tersalin ? 'Nomor tersalin' : 'Salin nomor rekening'}
          </button>
        </div>

        <p className="mt-5 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <Info size={16} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
          Setelah transfer, <strong className="font-semibold">kirim bukti
          pembayaran lewat WhatsApp</strong> ke {data.whatsapp.display}. Kursi
          anak resmi terkunci setelah bukti pembayaran kami terima.
        </p>
      </section>

      {/* Kirim */}
      <section className="mt-8 text-center">
        {!siapKirim && (
          <p className="mb-4 inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertCircle size={16} /> Lengkapi status, nama anak, dan nama orang
            tua dulu.
          </p>
        )}
        <div>
          <a
            href={siapKirim ? waLink : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!siapKirim}
            onClick={(e) => {
              if (!siapKirim) e.preventDefault();
            }}
            className={`inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-lg font-bold text-white transition-all duration-300 ${
              siapKirim
                ? 'bg-[#25D366] shadow-lg shadow-[#25D366]/30 hover:bg-[#1eb455] hover:-translate-y-0.5'
                : 'bg-slate-300 dark:bg-white/10 cursor-not-allowed'
            }`}
          >
            <MessageCircle size={22} />
            Kirim Pendaftaran via WhatsApp
            <ArrowUpRight size={20} />
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Data di atas otomatis tersalin ke pesan WhatsApp, jadi Anda tidak perlu
          mengetik ulang.
        </p>
      </section>

      <p className="mt-10 text-xs text-slate-400 dark:text-slate-500 leading-relaxed text-center">
        Diskon kakak-adik {data.diskonSaudaraPersen}% berlaku untuk saudara
        kandung dan tidak berlaku pada Kelas Private. Boleh kombinasi kelas,
        misalnya kakak Champions dan adik Creator.
      </p>
    </div>
  );
};

export default PendaftaranKelasLanjutan;
