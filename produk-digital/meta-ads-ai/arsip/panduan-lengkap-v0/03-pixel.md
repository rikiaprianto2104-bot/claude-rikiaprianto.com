## Bab 3 · Pixel dan peristiwa: "mata" iklan Anda

Pixel menentukan **apa yang bisa diukur** dan **apa yang bisa dioptimalkan Meta**. Bagian ini sering dilewati, lalu iklan terasa "tidak pintar".

### Langkah 1 · Buat pixel (sumber data)

1. Pengaturan Bisnis → **Sumber Data** → **Set data / Pixel** → **Tambahkan**.
2. Beri nama jelas, misalnya `Pixel Situs Utama`.
3. Hubungkan pixel ke **akun iklan** Anda (tab *Aset yang ditetapkan*). Tanpa ini, set iklan tidak bisa memilihnya.

### Langkah 2 · Pasang di situs

Ada tiga cara, urut dari termudah:

1. **Integrasi bawaan** bila situs Anda memakai platform seperti WordPress atau Shopify.
2. **Kode manual:** tempel kode dasar pixel di bagian `<head>` semua halaman.
3. **Google Tag Manager** bila Anda sudah memakainya.

### Langkah 3 · Kirim peristiwa yang berguna

Peristiwa standar yang paling berguna untuk usaha jasa dan kelas:

| Peristiwa | Kapan dikirim | Gunanya |
|---|---|---|
| `PageView` | Setiap halaman dibuka | Dasar semua pengukuran |
| `ViewContent` | Pengunjung membaca sebagian besar halaman atau memutar video | Penanda **pengunjung serius** |
| `InitiateCheckout` | Pengunjung membuka formulir pendaftaran | Niat tinggi |
| `Contact` | Pengunjung menekan tombol tanya via WhatsApp | Niat bertanya |
| `Lead` | Pengunjung mengirim formulir atau pesan pendaftaran | Hasil utama |

**Aturan penting: jangan pernah mengirim data pribadi** (nama, nomor telepon, email) sebagai parameter peristiwa. Kirim hanya nama konten dan posisi tombol.

### Langkah 4 · Uji sebelum beriklan

1. Pasang ekstensi **Meta Pixel Helper** di Chrome, buka situs Anda, dan pastikan `PageView` terbaca.
2. Di Sumber Data, buka tab **Uji peristiwa** dan lakukan tindakan di situs. Peristiwanya harus muncul dalam hitungan detik.
3. Periksa **Kualitas pencocokan peristiwa**. Nilai rendah di awal itu wajar; naik seiring data bertambah.

### Memilih peristiwa untuk dioptimalkan (inti Bab ini)

Meta belajar paling baik bila peristiwa yang dikejar **terjadi cukup sering**. Pedoman umumnya sekitar **50 peristiwa per minggu per set iklan**.

| Situasi | Pilihan yang masuk akal |
|---|---|
| Pixel baru, belum ada `Lead` | Mulai dari peristiwa yang sering terjadi dan menandai minat, misalnya `ViewContent` |
| Sudah banyak `Lead` | Optimalkan `Lead` |
| Hanya ingin kunjungan | `LANDING_PAGE_VIEWS`, tetapi lihat peringatan di bawah |

> **Pelajaran nyata (Bab 10):** mengoptimalkan *kunjungan halaman* membuat biaya per kunjungan turun 19 kali lipat, **tetapi** hampir semuanya pengunjung yang pergi seketika. Murah bukan berarti bagus. Ukur dengan peristiwa yang menandai minat.

### Cek sebelum lanjut

- [ ] Pixel terhubung ke akun iklan.
- [ ] `PageView` terbaca di Uji peristiwa.
- [ ] Setidaknya satu peristiwa minat (`ViewContent` atau `Contact`) berhasil diuji.
- [ ] Tidak ada data pribadi dikirim sebagai parameter.
