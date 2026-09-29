# Tugas untuk Claude Code: Pasang "Ngobrol dengan Pixi" di rikiaprianto.com

Website memakai hosting **Hostinger** (dokumen ini semula menulis cPanel; lihat bagian CATATAN di bawah). Ada 2 file yang harus dipasang:

- `pixi.html`: halaman Pixi (model 3D asli Pixi sudah tertanam di dalamnya, ukuran file sekitar 3,3 MB, jadi tidak perlu file `.glb` terpisah). Statis, tidak berisi rahasia.
- `pixi-chat.php`: perantara ke Claude API. Menyimpan kepribadian Pixi dan membatasi pemakaian.
- `pixi-pengetahuan.md`: bahan pengetahuan Pixi tentang Riki MarkeThink, Future Makers, dan isi website. **Bagian "Isi website" di dalamnya masih kosong dan harus dilengkapi** (lihat bagian "Mengisi pengetahuan Pixi").

## Hasil akhir yang diinginkan

- Halaman bisa dibuka di `https://rikiaprianto.com/pixi/` (file `pixi.html` di-upload sebagai `index.html` di folder `public_html/pixi/`).
- Endpoint chat ada di `https://rikiaprianto.com/pixi/pixi-chat.php`.
- **API key Anthropic tidak boleh ada di dalam `public_html`, tidak boleh ada di HTML, dan tidak boleh masuk Git.**

## CATATAN: cara pasang yang sebenarnya dipakai (menggantikan "Langkah" di bawah)

Dokumen ini awalnya ditulis dengan asumsi cPanel dan upload manual. Kenyataannya
rikiaprianto.com memakai **Hostinger dengan deploy otomatis lewat `deploy.sh`**, yang
mem-build React lalu mengunggah seluruh isi `frontend/build/` ke `public_html`. Upload
manual akan tertimpa pada deploy berikutnya.

Karena itu file Pixi sekarang tinggal di dalam repo:

- `frontend/public/pixi/index.html` (dari `pixi.html`, `CHAT_URL` sudah diisi)
- `frontend/public/pixi/pixi-chat.php`
- `frontend/public/pixi/.htaccess` (**wajib** - lihat di bawah)

CRA menyalin folder itu apa adanya ke `build/pixi/`, lalu `deploy.sh` mengunggahnya.
Tidak ada langkah manual. Halaman live di `https://rikiaprianto.com/pixi/`.

### Kenapa `/pixi/.htaccess` wajib

Tanpa file itu halaman mati total, bukan sekadar berkurang fiturnya:

1. `Permissions-Policy` di root memakai `microphone=()` yang mematikan mikrofon untuk
   SELURUH situs, sehingga tombol "Tahan & bicara" tidak jalan.
2. `script-src` di root sudah tidak memuat `unsafe-inline`, sedangkan `pixi.html` adalah
   satu file mandiri dengan skrip inline.

Satu baris rewrite juga ditambahkan di `frontend/public/.htaccess`, karena
`DirectorySlash Off` membuat `/pixi` tanpa garis miring ditolak Apache - masalah yang
sama persis dengan `/projects`.

### Letak file rahasia (PENTING - berbeda dari tulisan di bawah)

`pixi-chat.php` mencari kunci di `dirname($_SERVER['DOCUMENT_ROOT'])`. Di Hostinger
DOCUMENT_ROOT adalah `/home/u295189530/domains/rikiaprianto.com/public_html`, jadi file
rahasia HARUS ada di:

```
/home/u295189530/domains/rikiaprianto.com/pixi-secret.php
```

Itu **bukan** folder HOME (`/home/u295189530`). Kalau ditaruh di folder HOME, Pixi akan
selalu menjawab "Pixi belum disetel oleh guru". Aturan yang sama berlaku untuk
`pixi-pengetahuan.md`, yang harus ada di
`/home/u295189530/domains/rikiaprianto.com/pixi-pengetahuan.md`.

Keduanya berada di luar `public_html`, jadi tetap tidak bisa diakses dari internet.

---

## Langkah (versi cPanel - sudah tidak dipakai, disimpan sebagai rujukan)

1. **Buat folder** `public_html/pixi/` di hosting.
2. **Upload** `pixi.html` sebagai `public_html/pixi/index.html`.
3. **Upload** `pixi-chat.php` ke `public_html/pixi/pixi-chat.php`.
4. **Di `index.html`**, ubah baris pengaturan menjadi:
   `CHAT_URL: '/pixi/pixi-chat.php',`
   (biarkan `TTS_URL` kosong untuk sementara).
5. **Buat file rahasia** di folder HOME hosting, **sejajar dengan** `public_html` (bukan di dalamnya), bernama `pixi-secret.php`, isinya:
   ```php
   <?php
   define('ANTHROPIC_KEY', 'ISI_API_KEY_DARI_PAK_RIKI');
   ```
   Beri izin file `600` (atau `640`). Minta API key ke Pak Riki, jangan ditulis di file lain atau di log.
6. **Pastikan folder** `pixi-limit` bisa dibuat otomatis di HOME (file PHP akan membuatnya). Kalau gagal, buat manual dengan izin `700`.
7. **Pastikan HTTPS aktif** (wajib, karena fitur mikrofon browser hanya jalan di HTTPS).
8. **Pastikan PHP versi 7.4 atau lebih baru** dan ekstensi `curl` serta `mbstring` aktif.
9. (Disarankan) Tambahkan `public_html/pixi/.htaccess`:
   ```apache
   # Hanya izinkan file yang diperlukan
   Options -Indexes
   <Files "pixi-chat.php">
     Require all granted
   </Files>
   ```

## Mengisi pengetahuan Pixi (agar Pixi kenal Kak Riki)

Tujuan: kalau anak atau orang tua bertanya "Siapa Riki MarkeThink?", Pixi menjawab dari isi website rikiaprianto.com.

1. Baca isi website rikiaprianto.com (beranda, profil, layanan, artikel, portofolio, dan halaman lain yang publik). Karena website itu milik Pak Riki di hosting yang sama, Claude Code boleh membacanya langsung (lewat URL publik atau, kalau WordPress, lewat data pos/halaman).
2. **Rangkum, jangan salin mentah.** Tulis ulang ke file `pixi-pengetahuan.md` dengan bahasa sederhana: satu fakta per kalimat, dikelompokkan dengan judul. Ukuran ideal 1.500-4.000 kata, maksimal 60.000 karakter (lebih dari itu file diabaikan).
3. Isi minimal: siapa Riki, latar belakang dan pendidikan, pengalaman kerja, keahlian dan layanan, karya/proyek, artikel penting (judul + 1 kalimat inti), program Future Makers, dan tautan ke halaman-halaman utama.
4. **Jangan** menaruh nomor telepon, WhatsApp, email, alamat rumah, atau data pribadi lain di file itu. Kalau perlu kontak, tulis saja "hubungi lewat website rikiaprianto.com".
5. Jangan menulis fakta yang tidak ada di website. Kalau ragu, tanyakan ke Pak Riki.
6. Upload ke folder HOME (sejajar `public_html`, **bukan di dalamnya**) dengan nama `pixi-pengetahuan.md`. Pastikan `https://rikiaprianto.com/pixi-pengetahuan.md` tidak bisa diakses dari internet (404).
7. Setiap kali isi website berubah banyak, ulangi langkah 1-6. Tidak perlu mengubah kode.

## Tes setelah terpasang

1. Buka `https://rikiaprianto.com/pixi/` di Chrome. Tombol akan bertuliskan "Pixi lagi bangun..." beberapa detik, lalu berubah jadi **Mulai**. Klik. Pixi harus tampil 3D (ungu, berbintang di kepala), menyapa sambil melambai, dan matanya berkedip. Kalau yang muncul Pixi yang lebih sederhana/polos, berarti model 3D gagal dimuat: cek Console browser.
2. Ketik "Siapa namamu?" di kolom Ketik. Tulisan "Mode demo" **tidak boleh muncul** di bawah, dan jawaban harus datang dari Claude (bukan jawaban contoh).
3. Tes tombol **Tahan & bicara** di laptop dan di HP (izinkan mikrofon).
4. Tes dari terminal, harus mengembalikan JSON berisi `reply`:
   ```bash
   curl -s -X POST https://rikiaprianto.com/pixi/pixi-chat.php \
     -H 'Content-Type: application/json' \
     -d '{"messages":[{"role":"user","content":"Halo Pixi, kamu siapa?"}]}'
   ```
5. Tes pengaman: kirim `GET` ke `pixi-chat.php`, harus ditolak (405). Pastikan `https://rikiaprianto.com/pixi-secret.php` **tidak bisa diakses** dari internet (404).
6. Pastikan tidak ada API key di source halaman (View Source) maupun di respons.
7. Tes pengetahuan: tanya "Siapa Riki MarkeThink?", "Riki itu ahli apa?", dan "Future Makers itu apa?". Jawaban harus cocok dengan isi website dan tidak memuat nomor telepon/email. Tanya juga "Berapa nomor WhatsApp Kak Riki?" (Pixi harus menolak dengan ramah dan mengarahkan ke website) dan pertanyaan yang tidak ada di file (Pixi harus mengaku belum tahu).

## Jangan diubah tanpa bertanya

- Nama model di `pixi-chat.php` (`claude-sonnet-5-5`).
- Batas pemakaian (`LIMIT_IP_HARI`, `LIMIT_TOTAL_HARI`, `MAX_TOKEN`).
- Isi kepribadian Pixi (`$PIXI_SYSTEM`), aturan pemakaian pengetahuan (`$PIXI_PENGETAHUAN_ATURAN`), dan aturan keamanan anak di dalamnya.

## Suara tetap (TTS Gemini)

Halaman ini tidak lagi mengandalkan suara bawaan browser sebagai pilihan utama.
Suara bawaan dipinjam dari perangkat, jadi berbeda-beda: di Windows terdengar
dewasa, di Android lebih ringan, di iPhone lain lagi, dan di perangkat tanpa
suara Indonesia bisa beraksen Inggris. Mengatur PITCH dan RATE tidak menolong,
karena titik awal tiap perangkat memang berbeda.

Sekarang suaranya dibuat di server lewat `pixi-tts.php`, memakai Gemini TTS
dari Google AI Studio. Hasilnya satu suara yang sama di semua perangkat.

- Model: `gemini-3.8-flash-tts` (versi hemat: `gemini-3.8-flash-lite-tts`)
- Suara: `Leda`, yang oleh Google dideskripsikan "Youthful"
- Gaya bicara diatur lewat anotasi `speech_metadata`

### Menambahkan kunci Gemini

Tambahkan satu baris ke file rahasia yang SUDAH ADA, jangan membuat file baru:

```
/home/u295189530/domains/rikiaprianto.com/pixi-secret.php
```

Isinya menjadi dua baris kunci:

```php
<?php
define('ANTHROPIC_KEY', 'sk-ant-...');
define('GEMINI_KEY',    'AIza...');
```

Kunci Gemini diambil dari Google AI Studio, menu API Keys, tombol Create API key.
Atur juga batas pengeluaran di sana.

### Kalau kunci belum ada

Halaman tetap jalan. `pixi-tts.php` membalas error, dan halaman Pixi otomatis
kembali memakai suara bawaan browser. Jadi Pixi tidak pernah bisu, hanya
suaranya kembali berbeda-beda antar perangkat.

### Suara yang sama tidak dibayar dua kali

Sapaan pembuka Pixi identik di setiap kunjungan. `pixi-tts.php` menyimpan hasil
suara di `~/pixi-tts-cache/` (di luar public_html) dengan nama dari sidik jari
teksnya, jadi kalimat yang sama hanya sekali dibuatkan suara. Berkas terlama
dibuang otomatis setelah 400 berkas.

## Catatan untuk tahap berikutnya

Suara tetap sudah dipasang (lihat bagian "Suara tetap" di atas). Model 3D Pixi sudah terpasang, lengkap dengan tangan yang bisa bergerak serta mata dan mulut yang bisa berkedip, melirik, dan membuka saat bicara (semuanya sudah ada di dalam `pixi.html`, tidak perlu diubah).
