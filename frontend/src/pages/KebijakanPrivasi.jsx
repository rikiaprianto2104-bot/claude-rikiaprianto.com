import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, MessageCircle } from 'lucide-react';
import { kelasLanjutan as kelas } from '../data/kelasLanjutan';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const TANGGAL_BERLAKU = '26 Oktober 2026';

const Pasal = ({ judul, children }) => (
  <section className="mt-10">
    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
      {judul}
    </h2>
    <div className="mt-3 space-y-3 leading-[1.8] text-slate-700 dark:text-slate-300">
      {children}
    </div>
  </section>
);

const Daftar = ({ items }) => (
  <ul className="space-y-2">
    {items.map((t) => (
      <li key={t} className="flex gap-3">
        <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2563eb]" />
        <span>{t}</span>
      </li>
    ))}
  </ul>
);

const KebijakanPrivasi = () => {
  useDocumentMeta({
    title: 'Kebijakan Privasi | Riki MarkeThink',
    description:
      'Kebijakan privasi rikiaprianto.com: data apa yang dikumpulkan dari formulir pendaftaran kelas, bagaimana digunakan, berapa lama disimpan, dan cara menghapusnya.',
    url: 'https://rikiaprianto.com/kebijakan-privasi',
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563eb] dark:bg-[#2563eb]/10">
        <ShieldCheck size={12} /> Kebijakan Privasi
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
        Kebijakan Privasi
      </h1>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Berlaku sejak {TANGGAL_BERLAKU}
      </p>
      <p className="mt-6 leading-[1.8] text-slate-700 dark:text-slate-300">
        Halaman ini menjelaskan data apa yang kami kumpulkan lewat situs
        rikiaprianto.com, untuk apa data itu dipakai, berapa lama disimpan, dan
        bagaimana Anda bisa memintanya dihapus. Situs ini dikelola oleh Riki
        Aprianto (Riki MarkeThink) yang menyelenggarakan kelas Future Makers di
        Yogyakarta.
      </p>

      <Pasal judul="1. Data yang kami kumpulkan">
        <p>
          Kami hanya mengumpulkan data yang Anda isikan sendiri pada formulir
          pendaftaran kelas, yaitu:
        </p>
        <Daftar
          items={[
            'Nama anak dan kelas yang dipilih',
            'Jumlah anak yang didaftarkan',
            'Nama orang tua atau wali',
            'Nomor WhatsApp, karena formulir dikirim melalui WhatsApp',
          ]}
        />
        <p>
          Formulir pendaftaran tidak mengirim data ke server kami. Isian Anda
          dirangkum menjadi pesan WhatsApp, dan baru terkirim setelah Anda
          sendiri menekan tombol kirim di aplikasi WhatsApp.
        </p>
      </Pasal>

      <Pasal judul="2. Untuk apa data itu dipakai">
        <Daftar
          items={[
            'Memproses pendaftaran dan mengunci kursi anak di kelas yang dipilih.',
            'Menghubungi orang tua terkait jadwal, lokasi, pembayaran, dan pengumuman kelas.',
            'Menyiapkan sertifikat serta portofolio atas nama anak.',
          ]}
        />
        <p>
          Kami tidak menjual, menyewakan, atau menukarkan data Anda kepada pihak
          lain, dan tidak memakainya untuk tujuan di luar penyelenggaraan kelas.
        </p>
      </Pasal>

      <Pasal judul="3. Cookie dan pengukuran kunjungan">
        <p>
          Situs ini memakai Meta Pixel dan PostHog untuk mengukur berapa banyak
          orang membuka halaman, seberapa jauh halaman dibaca, dan tombol mana
          yang diklik. Pengukuran ini memakai cookie dan dipakai untuk menilai
          efektivitas iklan serta memperbaiki isi halaman.
        </p>
        <p>
          Yang dikirim ke layanan pengukuran tersebut hanya data penggunaan
          halaman, seperti nama peristiwa dan posisi tombol.{' '}
          <strong className="font-semibold">
            Nama anak, nama orang tua, dan nomor telepon tidak pernah
            disertakan.
          </strong>{' '}
          Anda bisa menonaktifkan cookie lewat pengaturan browser tanpa
          kehilangan akses ke isi situs.
        </p>
      </Pasal>

      <Pasal judul="4. Data anak">
        <p>
          Pendaftaran selalu dilakukan oleh orang tua atau wali, bukan oleh anak.
          Data anak yang kami simpan terbatas pada nama, usia, dan kelas yang
          diikuti.
        </p>
        <p>
          Foto dan video kegiatan kelas hanya kami gunakan untuk dokumentasi dan
          publikasi kegiatan setelah mendapat izin orang tua. Jika Anda tidak
          ingin wajah anak ditampilkan, sampaikan kepada kami dan kami akan
          mengeluarkannya dari seluruh materi publikasi.
        </p>
      </Pasal>

      <Pasal judul="5. Berapa lama data disimpan">
        <p>
          Data pendaftaran disimpan selama anak masih menjadi peserta dan paling
          lama 12 bulan setelah kelas berakhir, untuk keperluan arsip sertifikat
          dan portofolio. Setelah itu data dihapus.
        </p>
      </Pasal>

      <Pasal judul="6. Hak Anda">
        <Daftar
          items={[
            'Meminta salinan data yang kami simpan tentang Anda dan anak Anda.',
            'Meminta perbaikan jika ada data yang keliru.',
            'Meminta penghapusan data kapan saja.',
            'Menarik persetujuan penggunaan foto atau video anak.',
          ]}
        />
        <p>
          Permintaan tersebut kami proses paling lama 7 hari kerja sejak
          diterima.
        </p>
      </Pasal>

      <Pasal judul="7. Keamanan">
        <p>
          Situs ini dilayani sepenuhnya melalui HTTPS. Percakapan pendaftaran
          berlangsung di WhatsApp yang terenkripsi end-to-end. Akses ke data
          pendaftaran dibatasi hanya untuk penyelenggara kelas.
        </p>
      </Pasal>

      <Pasal judul="8. Perubahan kebijakan">
        <p>
          Kebijakan ini dapat diperbarui sewaktu-waktu. Tanggal berlaku di bagian
          atas halaman selalu menunjukkan versi terbaru.
        </p>
      </Pasal>

      <Pasal judul="9. Menghubungi kami">
        <p>
          Untuk pertanyaan atau permintaan terkait data pribadi, hubungi:
        </p>
        <p className="flex items-center gap-2">
          <MessageCircle size={18} className="text-[#2563eb]" />
          WhatsApp{' '}
          <a
            href={`https://wa.me/${kelas.whatsapp.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#2563eb] hover:underline"
          >
            {kelas.whatsapp.display}
          </a>
        </p>
        <p className="flex items-center gap-2">
          <Mail size={18} className="text-[#2563eb]" />
          <a
            href={`mailto:${kelas.kontak.email}`}
            className="font-semibold text-[#2563eb] hover:underline"
          >
            {kelas.kontak.email}
          </a>
        </p>
        <p>
          Riki Aprianto (Riki MarkeThink), {kelas.kontak.kota},{' '}
          {kelas.kontak.wilayah}, {kelas.kontak.negara}.
        </p>
      </Pasal>

      <div className="mt-12 border-t border-slate-200 pt-6 dark:border-white/10">
        <Link
          to="/"
          className="text-sm font-medium text-[#2563eb] hover:underline"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
};

export default KebijakanPrivasi;
