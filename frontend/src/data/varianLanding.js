import { kelasLanjutan } from './kelasLanjutan';

/**
 * Varian teks landing kelas AI anak.
 *
 * Semua varian dirender oleh komponen yang sama (pages/KelasBelajarAI.jsx),
 * jadi tampilan, harga, kartu kelas, foto, FAQ, dan formulirnya identik. Yang
 * berbeda hanya teks yang ada di sini: judul, kalimat penawaran, dan
 * metadata SEO. Tiap varian punya canonical sendiri (menunjuk dirinya sendiri)
 * dan kata kunci utama yang berbeda supaya tidak saling bersaing.
 *
 * Menambah varian baru: salin satu blok, ganti `slug` dan teksnya, lalu
 * daftarkan rutenya di App.js, sitemap.xml, dan llms.txt.
 */

const URL_SITUS = 'https://rikiaprianto.com';

// Landing asli: /blog/kelas-belajar-ai-anak (kata kunci: kelas AI anak Yogyakarta).
const asli = {
  slug: kelasLanjutan.slugLanding,
  seo: kelasLanjutan.seo,
  namaKonten: 'Kelas Artificial Intelligence Anak Yogyakarta',
  namaKursus: 'Kelas Artificial Intelligence untuk Anak di Yogyakarta',
  namaBreadcrumb: 'Kelas Artificial Intelligence Anak Yogyakarta',
  namaMobile: 'Kelas AI Anak Yogyakarta',
  judul: 'Kelas Artificial Intelligence untuk Anak di Yogyakarta',
  pembuka:
    'Anak usia 6–15 tahun belajar memakai AI untuk membuat game, gambar, video, dan website sendiri — lalu mengubahnya jadi portofolio dan prestasi. Tiga pilihan kelas: Creator, Champions, dan Private.',
  ctaJudul: 'Amankan Kursi Anak Sekarang',
  ctaIsi:
    'Creator 8 kursi, Champions 6 kursi, Private hanya 3 kursi. Isi formulir pendaftaran, pilih kelas dan cara bayar, lalu kursinya langsung kami kunci.',
};

// Landing kedua: /blog/les-ai-anak-jogja (kata kunci: les / kursus AI anak Jogja).
const lesAiJogja = {
  slug: 'les-ai-anak-jogja',
  seo: {
    judul: 'Les AI Anak Jogja: Buat Game & Karya Sendiri | Future Makers',
    deskripsi:
      'Les AI anak di Jogja untuk usia 6–15 tahun. Anak membuat game, gambar, dan video dengan AI di kelas kecil maks 8 anak, 12 pertemuan, cicilan 5x. Mulai Januari 2027.',
    kataKunci: [
      'les AI anak Jogja',
      'kursus AI anak Jogja',
      'les AI anak Yogyakarta',
      'kursus artificial intelligence anak Jogja',
      'les membuat game anak Jogja',
      'les coding anak Jogja',
      'kelas ChatGPT untuk anak Jogja',
      'Future Makers Jogja',
    ],
    ogImage: kelasLanjutan.seo.ogImage,
    canonical: `${URL_SITUS}/blog/les-ai-anak-jogja`,
  },
  namaKonten: 'Les AI Anak Jogja',
  namaKursus: 'Les AI untuk Anak di Jogja',
  namaBreadcrumb: 'Les AI Anak Jogja',
  namaMobile: 'Les AI Anak Jogja',
  judul: 'Les AI Anak di Jogja: Anak Buat Game & Karya Sendiri dengan AI',
  pembuka:
    'Bukan les yang cuma mendengarkan. Anak usia 6–15 tahun di Jogja langsung praktik memakai AI untuk membuat game, gambar, video, dan website buatannya sendiri, lalu pulang membawa portofolio, bukan sekadar catatan. Pilih Creator, Champions, atau Private.',
  ctaJudul: 'Daftarkan Anak di Les AI Jogja Sekarang',
  ctaIsi:
    'Kursi les AI tiap kelas sangat terbatas: Creator 8 kursi, Champions 6 kursi, Private hanya 3 kursi. Isi formulir pendaftaran, pilih kelas dan cara bayar, lalu kursinya langsung kami kunci.',
};

export const varianLanding = { asli, lesAiJogja };
