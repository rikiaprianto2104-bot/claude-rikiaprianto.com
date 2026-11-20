## Bab 11 · Lanjutan: aplikasi Developer, token, dan Bot Peluncur

> Bab ini **hanya** diperlukan bila Anda memakai **Bot Peluncur** (produk pendamping panduan ini), yang berbicara langsung ke Marketing API Meta. Bila Anda hanya memakai Claude lewat konektor (Bab 4–7), Anda boleh melewatinya.

### Mengapa perlu aplikasi Developer

Konektor Claude mengurus izin untuk Anda. Bot Peluncur berjalan di komputer Anda sendiri, jadi ia butuh **token akses** miliknya. Token dibuat lewat aplikasi Developer di akun Anda. Aplikasi ini cukup dibiarkan dalam **mode Development** (tidak perlu ditinjau Meta) karena Anda hanya mengelola aset milik sendiri.

### Langkah 1 · Daftar sebagai developer dan buat aplikasi

1. Buka `developers.facebook.com`, masuk dengan akun Facebook admin Portofolio Bisnis.
2. Daftar sebagai developer (verifikasi nomor atau email bila diminta).
3. **Buat aplikasi** dengan tipe **Business**. Hubungkan ke **Portofolio Bisnis** Anda.
4. Tambahkan produk **Marketing API** bila ditawarkan.

### Langkah 2 · Pengguna sistem dan token

Token paling aman dibuat lewat **pengguna sistem** (bukan akun pribadi), karena tidak terikat kata sandi dan bisa dicabut kapan saja.

1. Di Pengaturan Bisnis: **Pengguna → Pengguna sistem → Tambahkan**. Beri nama, misalnya `Bot Iklan`, dan peran **Admin**.
2. Pilih **Tetapkan aset** untuk pengguna sistem itu: beri akses penuh ke **akun iklan**, **Halaman**, dan **pixel** yang akan dipakai.
3. Pilih **Buat token baru**, pilih aplikasi Anda, dan centang izin yang dibutuhkan untuk beriklan, umumnya `ads_management`, `ads_read`, dan `business_management` (**periksa daftar terbaru di dokumentasi resmi**: `developers.facebook.com/docs/marketing-apis`).
4. **Salin token sekali**, simpan ke berkas `.env` di folder Bot Peluncur (Langkah 3). Token tidak bisa dilihat lagi setelah jendela ditutup.

> **Meta sering mengubah tampilan dan nama izin.** Bila ada perbedaan, ikuti dokumentasi resmi di atas.

### Langkah 3 · Menyimpan token dengan aman

- Simpan hanya di `.env` pada komputer Anda. **Jangan** di chat, grup, tangkapan layar, atau repositori kode.
- Jangan mengirim berkas `.env` ke siapa pun, termasuk penjual panduan ini.
- Bila token bocor: di Pengaturan Bisnis, **cabut token** (atau hapus pengguna sistem), lalu buat yang baru.
- Beri pengguna sistem **hanya aset yang perlu**.

### Langkah 4 · Pasang dan uji Bot Peluncur

Ikuti `BACA-DULU.md` di folder bot. Ringkasnya:

1. Pasang Python 3.11 atau lebih baru (`python.org`).
2. Salin `.env.contoh` menjadi `.env`, isi token dan ID aset.
3. Salin `brief.contoh.json` menjadi `brief.json`, isi sesuai Brief Iklan (Bab 5).
4. Jalankan **Cek** dulu. Semua baris harus hijau.
5. Jalankan **Rencana** (tanpa membuat apa pun), baca hasilnya.
6. Jalankan **Luncurkan**: semua objek dibuat **jeda**.
7. Periksa di Ads Manager, lalu **Aktifkan** dari bot atau dari Ads Manager.

### Bila bot membuat sesuatu yang salah

- Perintah **Jeda** menjeda semua objek yang dibuat bot.
- Objek tetap bisa dihapus manual di Ads Manager.
- Batas belanja kampanye tetap berlaku.

### Cek sebelum memakai bot

- [ ] Token disimpan hanya di `.env`.
- [ ] Pengguna sistem hanya punya aset yang perlu.
- [ ] Perintah **Cek** semua hijau.
- [ ] Saya sudah menjalankan **Rencana** dan memahami isinya.
