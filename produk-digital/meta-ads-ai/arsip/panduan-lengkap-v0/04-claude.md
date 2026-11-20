## Bab 4 · Menghubungkan Claude ke Meta Ads

Inilah bagian yang membuat pekerjaan beberapa jam menjadi percakapan beberapa menit. Claude terhubung ke akun iklan Anda lewat **konektor Meta Ads** (protokol MCP, server resmi di `mcp.facebook.com`). Anda masuk dengan akun Facebook Anda sendiri dan memberi izin; **kata sandi Anda tidak pernah dilihat Claude**.

### Yang bisa dan tidak bisa dilakukan konektor

| Bisa | Tidak bisa |
|---|---|
| Membaca akun, kampanye, set iklan, iklan, dan metrik | Membuat Portofolio Bisnis, Halaman, atau akun iklan baru (Bab 2 tetap Anda kerjakan sendiri) |
| Membuat kampanye, set iklan, materi, dan iklan (dalam keadaan jeda) | Memasukkan kartu pembayaran |
| Mengubah anggaran, jadwal, dan status | Menerima Persyaratan Layanan atas nama Anda (misalnya audiens khusus) |
| Menyalakan dan menjeda iklan | Melewati verifikasi atau meninjau kebijakan |
| Menjelaskan error dan menyarankan perbaikan | Menjamin iklan disetujui atau berhasil |

### Langkah 1 · Siapkan Claude

1. Buka Claude (aplikasi desktop atau situs claude.ai) dengan paket yang mendukung **konektor**.
2. Buka bagian **Konektor** atau **Connectors** di pengaturan. Namanya dapat berubah; cari kata kunci itu.

### Langkah 2 · Tambahkan konektor Meta Ads

1. Di daftar konektor, cari **Meta Ads** lalu tambahkan. (Di direktori konektor, alamat servernya `mcp.facebook.com`.)
2. Anda akan diarahkan ke halaman Facebook. **Pastikan alamatnya benar-benar milik Facebook/Meta** sebelum memasukkan apa pun.
3. Masuk dengan akun Facebook yang menjadi admin Portofolio Bisnis dari Bab 2.
4. Di halaman izin, **pilih Portofolio Bisnis dan akun iklan yang benar**. Beri hanya izin yang diminta.
5. Setelah kembali ke Claude, status konektor harus **terhubung**.

> **Jebakan umum:** Anda punya lebih dari satu akun iklan, dan konektor menunjuk ke akun yang salah (misalnya akun lama yang kosong). Kalau Claude bilang akun Anda "tidak punya Halaman, Instagram, atau pixel", hampir pasti ini penyebabnya: akun iklannya tidak berada di Portofolio Bisnis yang sama dengan Halaman. Kembali ke Bab 2, Langkah 5.

### Langkah 3 · Tes pertama (aman, hanya membaca)

Ketik ke Claude:

```
Tampilkan semua akun iklan yang bisa Anda akses.
Untuk akun iklan saya, tunjukkan: nama, mata uang, zona waktu,
Halaman Facebook, akun Instagram, dan pixel yang terhubung.
Jangan membuat atau mengubah apa pun.
```

Hasil yang benar: nama akun iklan Anda muncul, dan **Halaman, Instagram, serta pixel terlihat**. Kalau ada yang kosong, selesaikan dulu sebelum lanjut.

### Aturan keselamatan bekerja dengan AI

1. **Mulai dengan perintah baca saja.** Biasakan Claude menunjukkan dulu, baru mengubah.
2. **Minta rencana tertulis sebelum membuat.** Setujui rencananya, baru jalankan.
3. **Semua objek baru dibuat jeda.** Menyalakan adalah langkah terpisah yang Anda setujui.
4. **Jangan bagikan token, kata sandi, atau kode verifikasi di chat.**
5. **Periksa kembali di Ads Manager** untuk hal yang melibatkan uang: anggaran, jadwal, dan batas belanja.
6. **Anda yang bertanggung jawab atas isi iklan.** Claude membantu menulis, bukan menjamin kepatuhan terhadap kebijakan iklan.

### Cek sebelum lanjut

- [ ] Konektor Meta Ads berstatus terhubung.
- [ ] Tes baca menampilkan Halaman, Instagram, dan pixel yang benar.
- [ ] Saya paham bahwa menyalakan iklan adalah keputusan saya, bukan otomatis.
