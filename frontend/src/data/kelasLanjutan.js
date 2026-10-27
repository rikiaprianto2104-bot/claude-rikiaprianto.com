/**
 * Data pendaftaran Kelas Lanjutan Future Makers 2027.
 * Seluruh angka diambil dari "Proposal Penawaran Kelas Lanjutan Future Makers".
 *
 * Ada DUA jalur harga yang berdiri sendiri:
 *
 * 1. ALUMNI Kelas Future Makers -> harga alumni, berlaku selamanya tanpa
 *    batas waktu: Creator 2.499.000, Champions 4.999.000. Kalau mendaftarkan
 *    kakak-adik sekaligus, memakai harga alumniSaudara.
 *    Jalur ini hanya dipakai formulir /pendaftaran-kelas-lanjutan.
 *
 * 2. PENDAFTAR UMUM (dari landing page & iklan) -> harga normal sebagai dasar,
 *    dengan dua kemungkinan potongan:
 *      - kode referral dari tim sales: potong Rp 600.000 per anak;
 *      - mendaftarkan 2 anak atau lebih: potong 20% per anak.
 *    Keduanya TIDAK ditumpuk. Yang dipakai adalah yang paling murah bagi
 *    pendaftar, supaya harga yang dilihat orang tua tidak pernah lebih mahal
 *    dari yang dijanjikan di salah satu jalur.
 *
 * Kelas Private di luar semua potongan, baik untuk alumni maupun umum.
 *
 * Harga alumni sudah lebih murah daripada harga normal dikurangi potongan
 * referral, jadi kode referral tidak menambah potongan lagi di jalur alumni.
 */

export const kelasLanjutan = {
  slug: 'pendaftaran-kelas-lanjutan',
  slugLanding: 'kelas-belajar-ai-anak',
  // Ubah ke true kalau halaman landing-nya mau disembunyikan lagi dari Blog.
  landingHidden: false,
  // KODE REFERRAL
  // Dipegang tim sales. Pendaftar yang membawa salah satu kode ini mendapat
  // potongan tetap untuk Kelas Creator dan Champions, dan kodenya ikut
  // terbawa ke pesan WhatsApp supaya komisi salesnya bisa ditelusuri.
  //
  // Menambah atau mencabut kode cukup di daftar ini. Kode dicocokkan tanpa
  // membedakan huruf besar/kecil.
  //
  // Catatan jujur: daftar kode ini ikut terbaca di berkas JavaScript situs,
  // jadi secara teknis bisa ditemukan orang yang membuka kode halaman.
  // Pengamannya ada di langkah terakhir — invoice tetap diterbitkan manual,
  // jadi kode yang dipakai bisa dicocokkan dulu dengan catatan sales.
  referral: {
    aktif: true,
    potongan: 600000,
    label: 'Potongan Rp 600.000 dengan kode referral',
    kode: [
      'Future-SP1',
      'Future-SP2',
      'Future-SP3',
      'Future-SP4',
      'Future-SP5',
    ],
  },
  // Potongan kakak-adik dari proposal: berlaku sendiri, tanpa kode apa pun.
  diskonSaudara: {
    persen: 20,
  },
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
    'Klik tombol daftar di kartu kelasnya, formulirnya sudah menyesuaikan.',
    'Pilih bayar lunas atau cicilan 5x.',
    'Transfer, lalu kirim buktinya lewat WhatsApp — kursi anak resmi terkunci.',
  ],
  // Foto kegiatan kelas. Sudah dikecilkan ke lebar 1200px dan dikonversi ke
  // WebP (total ~530 KB untuk enam foto) supaya halaman tetap ringan.
  foto: [
    { src: '/future-maker/kelas/kelas-01-praktik-bersama.webp', w: 1200, h: 800,
      alt: 'Anak-anak peserta kelas Artificial Intelligence di Yogyakarta mencoba game buatan mereka sendiri di layar proyektor' },
    { src: '/future-maker/kelas/kelas-02-sesi-materi.webp', w: 1200, h: 900,
      alt: 'Mentor Future Makers menjelaskan materi AI kepada anak-anak di ruang kelas Yogyakarta' },
    { src: '/future-maker/kelas/kelas-03-membuat-karakter-ai.webp', w: 1200, h: 900,
      alt: 'Anak membuat karakter maskot dengan ChatGPT di kelas AI untuk anak' },
    { src: '/future-maker/kelas/kelas-04-pendampingan-mentor.webp', w: 1200, h: 900,
      alt: 'Dua mentor mendampingi peserta kelas AI anak saat mengerjakan proyek di laptop' },
    { src: '/future-maker/kelas/kelas-05-belajar-prompt.webp', w: 1200, h: 900,
      alt: 'Mentor mengajari anak menyusun prompt AI untuk membuat gambar pemandangan' },
    { src: '/future-maker/kelas/kelas-06-coach-dan-anak.webp', w: 1200, h: 900,
      alt: 'Coach Riki Aprianto mendampingi satu anak belajar AI secara personal' },
    { src: '/future-maker/kelas/kelas-07-foto-bersama.webp', w: 1200, h: 900,
      alt: 'Foto bersama peserta dan mentor kelas Artificial Intelligence anak Future Makers Yogyakarta' },
  ],
  kalender: {
    judul: 'Kalender Akademik Januari – Mei 2027',
    ringkas:
      'Creator dan Champions sama-sama 12 pertemuan, dijalankan sepanjang Januari sampai Mei 2027 dengan jeda saat libur sekolah dan hari besar. Kelas Private 8 pertemuan dengan jadwal menyesuaikan permintaan.',
    baris: [
      { kelas: 'Kelas Creator', hari: 'Setiap Sabtu', jam: '15.00 WIB', jumlah: '12 pertemuan' },
      { kelas: 'Kelas Champions', hari: 'Setiap Minggu', jam: '15.00 WIB', jumlah: '12 pertemuan' },
      { kelas: 'Kelas Private', hari: 'Hari & jam by request', jam: 'Menyesuaikan', jumlah: '8 pertemuan' },
    ],
    catatan:
      'Tanggal lengkap tiap pertemuan dikirimkan lewat WhatsApp setelah pendaftaran dikonfirmasi.',
  },
  // Tanggal pertemuan 2027. Creator jatuh di hari Sabtu, Champions di hari
  // Minggu. Ada jeda Februari-Maret menyesuaikan libur.
  jadwalKelas: {
    creator: [
      { bulan: 'Januari 2027', tanggal: [9, 16, 23, 30] },
      { bulan: 'Februari 2027', tanggal: [6] },
      { bulan: 'Maret 2027', tanggal: [20, 27] },
      { bulan: 'April 2027', tanggal: [3, 10, 17, 24] },
      { bulan: 'Mei 2027', tanggal: [8] },
    ],
    champions: [
      { bulan: 'Januari 2027', tanggal: [10, 17, 24, 31] },
      { bulan: 'Februari 2027', tanggal: [7] },
      { bulan: 'Maret 2027', tanggal: [21, 28] },
      { bulan: 'April 2027', tanggal: [4, 11, 18, 25] },
      { bulan: 'Mei 2027', tanggal: [9] },
    ],
    private: null, // jadwal menyesuaikan permintaan orang tua
  },
  kontak: {
    kota: 'Yogyakarta',
    wilayah: 'Daerah Istimewa Yogyakarta',
    negara: 'Indonesia',
    email: 'riki.markethink@rikiaprianto.com',
    catatanAlamat:
      'Kelas diadakan offline di Yogyakarta. Alamat lengkap dan titik lokasi dikirimkan lewat WhatsApp setelah pendaftaran dikonfirmasi.',
  },
  faq: [
    {
      q: 'Kelas Artificial Intelligence untuk anak ini diadakan di mana?',
      a: 'Kelas diadakan secara offline di Yogyakarta. Alamat lengkapnya dikirimkan lewat WhatsApp setelah pendaftaran dikonfirmasi, supaya lokasi tetap terjaga untuk peserta terdaftar.',
    },
    {
      q: 'Berapa usia anak yang bisa ikut?',
      a: 'Kelas Lanjutan ditujukan untuk anak usia 6 sampai 15 tahun. Materinya disesuaikan dengan usia masing-masing karena kelasnya kecil: Creator maksimal 8 anak, Champions maksimal 6 anak, dan Private satu anak.',
    },
    {
      q: 'Apakah anak harus sudah bisa coding?',
      a: 'Tidak. Anak belajar memakai AI seperti ChatGPT dan Claude untuk membuat karya, jadi tidak perlu menguasai bahasa pemrograman lebih dulu. Semua langkah dipandu mentor.',
    },
    {
      q: 'Apa bedanya Kelas Creator, Champions, dan Private?',
      a: 'Creator fokus membuat karya dan portofolio digital. Champions fokus persiapan kompetisi AI tingkat nasional dan internasional. Private satu anak satu coach dengan arah belajar dan jadwal yang bisa diatur sendiri.',
    },
    {
      q: 'Berapa biaya kelasnya dan bisakah dicicil?',
      a: 'Kelas Creator Rp 3.600.000 untuk 12 pertemuan, Kelas Champions Rp 6.000.000 untuk 12 pertemuan, dan Kelas Private Rp 5.250.000 untuk 8 pertemuan. Semuanya bisa dibayar lunas atau dicicil 5 kali tanpa bunga.',
    },
    {
      q: 'Apakah anak perlu membawa laptop sendiri?',
      a: 'Ya, setiap anak praktik di layarnya sendiri sepanjang kelas. Kalau belum punya, sampaikan saat mendaftar supaya kami bantu siapkan unit sewa.',
    },
  ],
  seo: {
    judul:
      'Kelas Artificial Intelligence Anak Yogyakarta | Future Makers',
    deskripsi:
      'Kelas Artificial Intelligence untuk anak usia 6–15 tahun di Yogyakarta. Tiga pilihan: Creator, Champions, dan Private. 12 pertemuan, kelas kecil, bisa dicicil 5x. Daftar sekarang.',
    kataKunci: [
      'kelas artificial intelligence Yogyakarta',
      'kelas AI untuk anak Yogyakarta',
      'les AI anak Jogja',
      'kursus AI anak Yogyakarta',
      'kelas coding anak Yogyakarta',
      'kelas ChatGPT untuk anak',
      'kursus teknologi anak Jogja',
      'Future Makers Yogyakarta',
    ],
    ogImage: '/future-maker/kelas/og-kelas-ai-anak-yogyakarta.jpg',
    canonical: 'https://rikiaprianto.com/blog/kelas-belajar-ai-anak',
  },
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
  maksAnak: 4,
  kelas: [
    {
      id: 'creator',
      slugForm: 'kelas-creator',
      hasilAkhir: 'Anak punya portofolio digital nyata atas namanya sendiri — bekal berharga untuk sekolah lanjutan dan masa depan.',
      nama: 'Kelas Creator',
      ringkas: '12 pertemuan · setiap Sabtu · maks 8 anak',
      deskripsi:
        'Memakai berbagai AI untuk membuat gambar, cerita, video, musik, dan mini project. Setiap karya dipublikasikan, sehingga anak punya portofolio digital atas namanya sendiri.',
      kursi: 8,
      harga: { normal: 3600000, alumni: 2499000, alumniSaudara: 2000000 },
    },
    {
      id: 'champions',
      slugForm: 'kelas-champions',
      hasilAkhir: 'Anak mengoleksi prestasi, berpeluang meraih hadiah uang dari lomba, dan sertifikat prestasi yang memperkuat jalur masuk perguruan tinggi negeri.',
      nama: 'Kelas Champions',
      ringkas: '12 pertemuan · setiap Minggu · maks 6 anak',
      deskripsi:
        'Dilatih khusus untuk kompetisi AI dan teknologi tingkat nasional maupun internasional, dengan bimbingan lebih intensif dan proyek yang menantang.',
      kursi: 6,
      harga: { normal: 6000000, alumni: 4999000, alumniSaudara: 4000000 },
    },
    {
      id: 'private',
      slugForm: 'kelas-private',
      hasilAkhir: 'Perhatian penuh dari coach, progres lebih cepat, dan hari serta jam belajar bisa dipilih sendiri.',
      nama: 'Kelas Private',
      ringkas: '8 pertemuan · 1-on-1 · jadwal by request · hanya 3 kursi',
      deskripsi:
        'Metode belajar disesuaikan dengan minat dan bakat anak. Orang tua bebas menentukan arah belajar: karya, kompetisi, coding, atau tujuan lain.',
      kursi: 3,
      tanpaPromo: true,
      catatan:
        'Kursinya hanya untuk 3 anak karena coach mendampingi penuh dan personal, jadi kelas ini tidak ikut potongan referral maupun diskon kakak-adik.',
      harga: { normal: 5250000, alumni: 5250000, alumniSaudara: 5250000 },
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

/**
 * Cocokkan kode referral yang diketik pendaftar.
 *
 * Huruf besar/kecil dan spasi di awal-akhir diabaikan, karena kode ini
 * disalin dari pesan atau diketik ulang dari selebaran. Yang dikembalikan
 * adalah kode dengan ejaan resminya, supaya yang masuk ke pesan WhatsApp
 * selalu seragam dan mudah dicocokkan dengan catatan komisi.
 *
 * @returns {string|null} kode resmi, atau null kalau tidak dikenali.
 */
export const cekReferral = (kode) => {
  if (!kelasLanjutan.referral.aktif) return null;
  const bersih = String(kode || '').trim().toLowerCase();
  if (!bersih) return null;
  return (
    kelasLanjutan.referral.kode.find((k) => k.toLowerCase() === bersih) || null
  );
};

/** Kelas yang boleh mendapat diskon — Private selalu harga normal. */
const bolehDiskon = (kelasId) => {
  const k = kelasLanjutan.kelas.find((x) => x.id === kelasId);
  return !!k && !k.tanpaPromo;
};

/**
 * Harga satu anak.
 *
 * @param {string} kelasId
 * @param {object} opsi
 * @param {boolean} opsi.alumni      peserta alumni Kelas Future Makers
 * @param {boolean} opsi.adaSaudara  mendaftarkan 2 anak atau lebih
 * @param {boolean} opsi.referral    membawa kode referral yang cocok
 */
export const hargaPerAnak = (
  kelasId,
  { alumni = false, adaSaudara = false, referral = false } = {}
) => {
  const k = kelasLanjutan.kelas.find((x) => x.id === kelasId);
  if (!k) return 0;

  // Kelas Private di luar semua potongan.
  if (!bolehDiskon(kelasId)) return k.harga.normal;

  // Jalur alumni: harga tetap, sudah lebih murah daripada potongan referral.
  if (alumni) return adaSaudara ? k.harga.alumniSaudara : k.harga.alumni;

  // Jalur umum. Potongan tidak ditumpuk: dihitung semua kemungkinannya, lalu
  // diambil yang paling menguntungkan pendaftar.
  const pilihan = [k.harga.normal];
  if (adaSaudara) {
    pilihan.push(
      Math.round(
        (k.harga.normal * (100 - kelasLanjutan.diskonSaudara.persen)) / 100
      )
    );
  }
  if (referral) {
    pilihan.push(Math.max(0, k.harga.normal - kelasLanjutan.referral.potongan));
  }
  return Math.min(...pilihan);
};

/** Harga tanpa diskon apa pun, dipakai untuk menampilkan angka coretan. */
export const hargaNormalPerAnak = (kelasId) => {
  const k = kelasLanjutan.kelas.find((x) => x.id === kelasId);
  return k ? k.harga.normal : 0;
};

export const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
