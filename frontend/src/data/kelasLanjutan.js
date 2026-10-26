/**
 * Data pendaftaran Kelas Lanjutan Future Makers 2027.
 * Seluruh angka diambil dari "Proposal Penawaran Kelas Lanjutan Future Makers".
 *
 * Aturan harga:
 *  - Lulusan Kelas Future Makers  -> harga promo
 *  - Bukan lulusan                -> harga normal
 *  - Mendaftarkan 2 anak atau lebih (kakak-adik kandung) -> diskon 20% per anak
 *  - Kelas Private tidak ikut promo maupun diskon saudara
 */

export const kelasLanjutan = {
  slug: 'pendaftaran-kelas-lanjutan',
  slugLanding: 'kelas-belajar-ai-anak',
  // Ubah ke true kalau halaman landing-nya mau disembunyikan lagi dari Blog.
  landingHidden: false,
  title: 'Pendaftaran Kelas Lanjutan Future Makers',
  subtitle: 'Creator · Champions · Private — kelas mulai Januari 2027',
  brand: 'Future Makers',
  tagline: 'AI untuk Anak, Masa Depan Lebih Cerah',
  headline: 'Jangan Berhenti di Langkah Pertama',
  intro:
    'Anak Ayah/Bunda sudah mengenal AI. Sekarang saatnya mereka berkarya, berprestasi, dan punya portofolio nyata — sebelum teman-temannya.',
  kutipan: {
    teks: 'Manusia yang pakai AI akan menggantikan yang tidak.',
    sumber: 'Sam Altman, CEO OpenAI',
  },
  jadwalBelajar: 'Kalender belajar Januari – Mei 2027',
  lokasi: 'Offline Yogyakarta',
  coach: {
    nama: 'Riki Aprianto (Riki MarkeThink)',
    peran: 'AI Marketing Strategist',
    bio: 'Lulusan terbaik Cumlaude (IPK 3,89), mahasiswa S2 Manajemen UPN “Veteran” Yogyakarta, peraih Gold Medal TEC UNJ dan juara lomba karya tulis ilmiah nasional. Pengalaman lomba inilah yang kami tularkan ke anak-anak.',
  },
  caraDaftar: [
    'Pilih kelas: Creator, Champions, atau Private.',
    'Isi formulir pendaftaran, cukup 5 menit.',
    'Pilih bayar lunas atau cicilan 5x.',
    'Transfer, lalu kirim buktinya lewat WhatsApp — kursi anak resmi terkunci.',
  ],
  whatsapp: {
    display: '0888-0923-4347',
    number: '6288809234347',
  },
  rekening: {
    bank: 'Bank BCA',
    atasNama: 'RIKI APRIYANTO',
    nomor: '4330452027',
  },
  // Nama peserta yang sudah lulus Kelas Future Makers. Dipakai sebagai pilihan
  // siap pakai supaya orang tua tidak perlu mengetik ulang.
  alumni: [
    'Al Farras King Shaquille Bayanaka',
    'Farjana',
    'Muhammad Umar',
    'Muhammad Arsene Putra Kurniawan',
    'Dzaky Almair',
    'M. Althaf Arrayhan',
    'M. Ahnaf Syauqi',
    'Muhammad Aksa',
  ],
  diskonSaudaraPersen: 20,
  maksAnak: 4,
  kelas: [
    {
      id: 'creator',
      hasilAkhir: 'Anak punya portofolio digital nyata atas namanya sendiri — bekal berharga untuk sekolah lanjutan dan masa depan.',
      nama: 'Kelas Creator',
      ringkas: '12 pertemuan · setiap Sabtu · maks 8 anak',
      deskripsi:
        'Memakai berbagai AI untuk membuat gambar, cerita, video, musik, dan mini project. Setiap karya dipublikasikan, sehingga anak punya portofolio digital atas namanya sendiri.',
      kursi: 8,
      harga: {
        normal: 3600000,
        promo: 2499000,
        // Diskon 20% kakak-adik, mengikuti angka yang tercetak di proposal.
        saudaraPromo: 2000000,
        saudaraNormal: 2880000,
      },
    },
    {
      id: 'champions',
      hasilAkhir: 'Anak mengoleksi prestasi, berpeluang meraih hadiah uang dari lomba, dan sertifikat prestasi yang memperkuat jalur masuk perguruan tinggi negeri.',
      nama: 'Kelas Champions',
      ringkas: '12 pertemuan · setiap Minggu · maks 6 anak',
      deskripsi:
        'Dilatih khusus untuk kompetisi AI dan teknologi tingkat nasional maupun internasional, dengan bimbingan lebih intensif dan proyek yang menantang.',
      kursi: 6,
      harga: {
        normal: 6000000,
        promo: 4999000,
        saudaraPromo: 4000000,
        saudaraNormal: 4800000,
      },
    },
    {
      id: 'private',
      hasilAkhir: 'Perhatian penuh dari coach, progres lebih cepat, dan hari serta jam belajar bisa dipilih sendiri.',
      nama: 'Kelas Private',
      ringkas: '8 pertemuan · 1-on-1 · jadwal by request · hanya 3 kursi',
      deskripsi:
        'Metode belajar disesuaikan dengan minat dan bakat anak. Orang tua bebas menentukan arah belajar: karya, kompetisi, coding, atau tujuan lain.',
      kursi: 3,
      tanpaPromo: true,
      catatan:
        'Kursinya hanya untuk 3 anak karena coach mendampingi penuh dan personal, jadi kelas ini tidak ikut promo maupun diskon kakak-adik.',
      harga: {
        normal: 5250000,
        promo: 5250000,
        saudaraPromo: 5250000,
        saudaraNormal: 5250000,
      },
    },
  ],
  cicilan: {
    jumlah: 5,
    bulan: [
      'November 2026',
      'Desember 2026',
      'Januari 2027',
      'Februari 2027',
      'Maret 2027',
    ],
    catatan: 'Lima kali cicilan tanpa bunga, November 2026 sampai Maret 2027.',
  },
};

/** Harga satu anak, sesudah memperhitungkan status lulusan dan jumlah saudara. */
export const hargaPerAnak = (kelasId, lulusan, adaSaudara) => {
  const k = kelasLanjutan.kelas.find((x) => x.id === kelasId);
  if (!k) return 0;
  if (k.tanpaPromo) return k.harga.normal;
  if (adaSaudara) return lulusan ? k.harga.saudaraPromo : k.harga.saudaraNormal;
  return lulusan ? k.harga.promo : k.harga.normal;
};

/** Harga tanpa diskon apa pun, dipakai untuk menampilkan angka coretan. */
export const hargaNormalPerAnak = (kelasId) => {
  const k = kelasLanjutan.kelas.find((x) => x.id === kelasId);
  return k ? k.harga.normal : 0;
};

export const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
