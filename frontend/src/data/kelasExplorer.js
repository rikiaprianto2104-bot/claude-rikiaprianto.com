import { kelasLanjutan } from './kelasLanjutan';

/**
 * Data landing & pendaftaran Kelas Explorer (batch Desember 2026).
 *
 * Kelas Explorer berdiri sendiri: satu kelas, 4 pertemuan, pembayaran hanya
 * lunas (tanpa cicilan, tanpa kode referral, tanpa pendaftaran banyak anak).
 * Rekening, nomor WhatsApp, foto, dan profil coach dipakai bersama dengan
 * Kelas Lanjutan (data/kelasLanjutan.js) supaya cukup diubah di satu tempat.
 *
 * HARGA: ada harga normal dan harga promo. Promo berjalan sampai akhir hari
 * `promoSampai`; sesudahnya harga otomatis kembali normal dan hitung mundur
 * di halaman disembunyikan (lihat hooks/usePromoExplorer.js).
 */

const URL_SITUS = 'https://rikiaprianto.com';

export const kelasExplorer = {
  slug: 'kelas-explorer',
  nama: 'Kelas Explorer',
  brand: 'Future Makers',
  usia: { min: 7, max: 15 },
  kuota: 10,
  jumlahPertemuan: 4,
  hari: 'Sabtu dan Minggu',
  jam: '15.00 WIB',
  // Hari pertama kelas, dipakai di judul, pesan WhatsApp, dan data terstruktur.
  mulai: '2026-12-12',
  mulaiLabel: '12 Desember 2026',
  selesai: '2026-12-20',
  lokasi: 'Offline Yogyakarta',
  harga: { normal: 750000, promo: 599000 },
  // Akhir hari Jumat 11 Desember 2026, waktu Yogyakarta (WIB), sehari sebelum kelas mulai.
  promoSampai: '2026-12-11T23:59:59+07:00',
  promoSampaiLabel: '11 Desember 2026',
  jadwal: [
    { bulan: 'Desember 2026', tanggal: [12, 13, 19, 20] },
  ],
  pertemuan: [
    {
      nomor: 1,
      judul: 'Puzzle Prompt Ajaib',
      alat: 'ChatGPT',
      isi: 'Anak belajar memakai ChatGPT: menyusun prompt untuk membuat gambar dan karakter game, yang akan dipakai untuk praktikum di pertemuan 3.',
      pembimbing: '1 Coach + 1 Miss',
    },
    {
      nomor: 2,
      judul: 'Labirin Digital',
      alat: 'Claude AI',
      isi: 'Anak belajar memakai Claude AI untuk membuat game sederhana, lalu merancang alur cerita untuk game buatannya sendiri.',
      pembimbing: '1 Coach + 1 Miss',
    },
    {
      nomor: 3,
      judul: 'Bangun Portofolio',
      alat: 'Praktikum',
      isi: 'Kelas praktikum: anak membuat gamenya satu per satu, lalu berlatih presentasi untuk Demo Day di pertemuan terakhir.',
      pembimbing: '1 Coach + 2 Miss',
    },
    {
      nomor: 4,
      judul: 'Demo Day',
      alat: 'Presentasi',
      isi: 'Hari anak menampilkan karyanya di depan orang tua dan teman-teman. Setiap anak mempresentasikan game buatannya sendiri.',
      pembimbing: '1 Coach + 1 Miss',
    },
  ],
  // Testimoni orang tua dipakai bersama dengan landing Kelas Lanjutan, jadi
  // daftarnya hanya ada di satu tempat: data/kelasLanjutan.js.
  testimoni: kelasLanjutan.testimoni,
  faq: [
    {
      q: 'Kelas Explorer cocok untuk anak usia berapa?',
      a: 'Kelas Explorer untuk anak usia 7 sampai 15 tahun. Anak tidak perlu bisa coding sama sekali, semua langkah dipandu Coach dan Miss.',
    },
    {
      q: 'Berapa biaya Kelas Explorer?',
      a: 'Harga normal Rp 750.000 untuk 4 pertemuan. Selama masa promo sampai 11 Desember 2026, harganya Rp 599.000. Pembayaran hanya bisa lunas, tidak ada cicilan.',
    },
    {
      q: 'Kapan jadwal kelasnya?',
      a: 'Empat pertemuan dalam dua akhir pekan: 12, 13, 19, dan 20 Desember 2026 (Sabtu dan Minggu). Semua pertemuan pukul 15.00 WIB. Alamat lengkap dikirimkan lewat WhatsApp setelah pendaftaran dikonfirmasi.',
    },
    {
      q: 'Berapa jumlah anak dalam satu kelas?',
      a: 'Maksimal 10 anak per kelas. Tiap pertemuan dibimbing 1 Coach dan 1 Miss, dan di pertemuan 3 (praktikum) ditambah satu Miss sehingga menjadi 1 Coach dan 2 Miss.',
    },
    {
      q: 'Apa yang dibawa anak pulang?',
      a: 'Anak membawa pulang game sederhana buatannya sendiri, dan sudah pernah mempresentasikannya di depan orang tua dan teman-teman pada Demo Day.',
    },
    {
      q: 'Apakah anak perlu membawa laptop sendiri?',
      a: 'Ya, setiap anak praktik di layarnya sendiri sepanjang kelas. Kalau belum punya, sampaikan saat mendaftar supaya kami bantu carikan solusinya.',
    },
    {
      q: 'Bagaimana cara mendaftar dan membayar?',
      a: 'Klik tombol daftar, isi nama anak, usia, dan nama orang tua, lalu kirim formulirnya lewat WhatsApp. Transfer pembayaran lunas ke rekening yang tertera dan kirim buktinya, kursi anak langsung terkunci.',
    },
  ],
  seo: {
    judul: 'Kelas Explorer: Anak Belajar AI & Buat Game, 4 Pertemuan | Future Makers',
    deskripsi:
      'Kelas Explorer untuk anak usia 7–15 tahun di Yogyakarta: belajar ChatGPT dan Claude AI, membuat game sendiri, dan Demo Day. 4 pertemuan, maks 10 anak. Promo Rp 599.000 sampai 11 Desember 2026.',
    kataKunci: [
      'kelas AI anak Yogyakarta',
      'kelas Explorer Future Makers',
      'belajar membuat game dengan AI anak',
      'kelas ChatGPT untuk anak',
      'kelas Claude AI anak',
      'kursus AI anak Jogja',
      'Future Makers Yogyakarta',
    ],
    ogImage: kelasLanjutan.seo.ogImage,
    canonical: `${URL_SITUS}/blog/kelas-explorer`,
  },
};

/** Jadwal dalam kalimat, mis. "12, 13, 19, dan 20 Desember 2026". */
export const teksJadwal = () =>
  kelasExplorer.jadwal
    .map((b) => {
      const t = b.tanggal;
      const daftar = t.length > 1 ? `${t.slice(0, -1).join(', ')}, dan ${t[t.length - 1]}` : `${t[0]}`;
      return `${daftar} ${b.bulan}`;
    })
    .join(' dan ');

/** Waktu (ms) berakhirnya promo. */
export const promoBerakhirMs = () => new Date(kelasExplorer.promoSampai).getTime();
