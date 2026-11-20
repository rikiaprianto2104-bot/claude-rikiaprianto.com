# Rencana produk: Sistem Iklan Meta + AI (revisi 2)

Untuk Anda (pemilik), bukan untuk pembeli.

## 1. Produknya (setelah revisi Anda)

Pembeli mendapat **satu paket (zip)** berisi dua hal:

| | Produk 1: **Panduan Pasang** | Produk 2: **Sistem Iklan (file `CLAUDE.md`)** |
|---|---|---|
| Fungsi | Mengajari **cara memasang**: akun Meta, pixel, Claude Code, konektor, file sistem | "Otak" otomatisasi: pembeli memasukkan file ini ke folder, membuka sesi **Claude Code**, mengetik `mulai`, lalu Claude memandu dan menyiapkan iklannya seperti yang kita lakukan |
| Bentuk | 1 berkas HTML (bisa dicetak jadi PDF), **4 langkah** (akun Meta, buka Claude Code, hubungkan konektor, pasang file sistem), 19 gambar layar, bahasa sederhana | 1 berkas `CLAUDE.md` + folder `materi/` |
| Berkas | `produk-1-panduan/panduan-pasang.html` | `produk-2-sistem-iklan/CLAUDE.md` |

Alur pembeli: baca Panduan (1–2 jam) → pasang → taruh `CLAUDE.md` di folder → Claude Code → `mulai`.

Paket jadi: jalankan `python bangun_paket.py` → `dist/Paket-Sistem-Iklan-Meta-AI.zip`.

### Isi sistem (`CLAUDE.md`)

Berisi pengalaman nyata kampanye Kelas Explorer, dalam bentuk instruksi untuk Claude:
- 11 aturan mutlak (semua JEDA, batas belanja wajib, persetujuan sebelum membuat dan sebelum menyalakan,
  tidak menyentuh token/kata sandi, tidak menjanjikan hasil, dll.)
- 5 tahap: periksa koneksi → tanya (maks 6 pertanyaan) → rencana → bangun (jeda) + periksa bersama →
  nyalakan dan pantau. Lampiran A–C (materi, membaca hasil, masalah) dibaca hanya saat dibutuhkan
- Panduan memilih peristiwa optimasi, audiens (Advantage+), anggaran, jadwal, materi per penempatan
- Tabel 12 masalah dan perbaikannya, dan apa yang **harus** dikerjakan pembeli sendiri
- `LOG-IKLAN.md`: Claude mencatat keputusan dan ID, jadi sesi berikutnya bisa dilanjutkan

## 2. Batasan jujur "otomatis"

Tidak bisa diotomatisasi (harus oleh pembeli, di situs Meta): membuat Portofolio Bisnis, memasukkan
kartu pembayaran, menerima persyaratan layanan, verifikasi identitas/bisnis, dan memberi izin
konektor. Itu sebabnya ada Panduan Pasang. **Sesudah itu**, Claude yang mengerjakan sisanya.

Sistem juga **bergantung** pada: (1) konektor Meta Ads tersedia di akun Claude pembeli, (2) paket Claude
berbayar yang mendukung Claude Code, (3) perilaku konektor Meta yang bisa berubah. Jangan menjualnya
sebagai "pasti jalan di semua akun".

## 3. Status dan yang BELUM terbukti

| Bagian | Status |
|---|---|
| `CLAUDE.md` | Selesai. **Belum diuji oleh orang selain Anda, di komputer lain, dari nol** |
| Panduan Pasang | Selesai, tapi **3 dari 5 gambar masih kosong** (lihat bagian 4) |
| Isi teknis (nama alat, parameter, pola `asset_feed_spec`, daftar masalah) | Diambil dari sesi nyata kita, jadi cukup tepercaya, tetapi konektor Meta berubah |
| Langkah Meta (Bab menu) dan Claude (tab Code, Pengaturan → Konektor) | Ditulis dari pengetahuan dan sesi kita; **cocokkan dengan tampilan hari ini** |

## 4. Yang perlu Anda kerjakan sebelum dijual

**Gambar layar:** sudah lengkap (19 gambar; 18 dari folder `E:\PANDUAN` milik Anda, nama dan ID sudah diburamkan oleh skrip `sensor_panduan.py`). Bila Meta atau Claude mengubah tampilan, ambil ulang dan jalankan `bangun_paket.py`. **Jangan** memakai tangkapan layar yang memuat email, ID akun, token, atau wajah anak.

**Uji dari nol (wajib):** minta 1–2 orang awam (tanpa bantuan Anda) mengikuti Panduan di komputer
mereka. Catat di mana mereka tersangkut, dan perbaiki langkahnya. Ini satu-satunya cara tahu
produk benar-benar jalan.

**Putuskan:** nama produk dan merek, harga, cara pembayaran dan pengiriman zip.

## 5. Harga (hipotesis, bukan fakta pasar)

| Paket | Isi | Usulan |
|---|---|---|
| **Paket Sistem Iklan** | Panduan + `CLAUDE.md` | Rp299.000–Rp499.000 |
| **+ Setup Dibantu** | Paket + sesi daring 60–90 menit menyiapkan akun | Rp1.000.000–Rp1.500.000 |
| Pembaruan | Versi baru `CLAUDE.md` bila konektor/menu Meta berubah | Termasuk 6 bulan |

Nilai jual utamanya bukan ebook, melainkan **sistem yang sudah dipakai di kampanye nyata**. Gunakan
cerita Anda dengan jujur: sistem ini dipakai untuk iklan Kelas Explorer (angka akhirnya Anda yang
memutuskan seberapa jauh dibuka).

## 6. Risiko

| Risiko | Penanganan |
|---|---|
| Menjanjikan hasil iklan | Jangan. Jual **cara menyiapkan dengan benar dan aman** |
| Mengaku "resmi dari Meta/Anthropic" | Jangan. Pernyataan "bukan produk resmi" sudah ada di panduan |
| Konektor/menu berubah | Batasi dukungan dan pembaruan; simpan versi `CLAUDE.md` |
| **Ads MCP dibuka bertahap oleh Meta per akun iklan** (terbukti di uji: dari 3 akun iklan satu pengguna, hanya 1 yang aktif; alasannya "gradually being rolled out") | Syarat utama produk. Tulis jelas di halaman penjualan: "hanya untuk akun iklan yang sudah mendapat akses Ads MCP", dan sediakan cara cek (Claude akan menampilkan `is_ads_mcp_enabled` di Tahap 1). Pertimbangkan kebijakan pengembalian dana untuk pembeli yang akunnya belum aktif |
| Pembeli tidak punya konektor Meta Ads atau Claude Code | Tulis syaratnya di halaman penjualan; sediakan pengembalian dana sesuai kebijakan Anda |
| Claude mengubah uang pembeli | Pengaman di `CLAUDE.md` (jeda, batas belanja, persetujuan tertulis); tetap **bukan jaminan**. Beri tahu pembeli bahwa mereka bertanggung jawab atas isi dan anggaran iklannya |
| Data pribadi bocor lewat tangkapan layar | Aturan di bagian 4 |
| Beban dukungan | Tentukan batas (email, jawaban 2 hari kerja, hanya soal produk) |

## 7. Arsip (opsional, tidak dalam paket)

`arsip/` berisi hasil putaran sebelumnya: panduan 13 bab (referensi mendalam yang bisa dijadikan bonus
"Referensi Lanjutan"), Bot Peluncur versi Python (lulus 23 uji terhadap server tiruan, belum diuji ke
akun nyata), dan prompt master awal. Tidak dipakai di paket baru, karena produknya kini **file MD + Claude Code**.

## 8. Langkah berikutnya

1. Anda mengambil 3 tangkapan layar (bagian 4).
2. Saya bangun ulang paket dan kita cek hasilnya.
3. Uji dari nol oleh 1–2 orang.
4. Saya buatkan halaman penjualan di situs Anda (setelah harga dan nama diputuskan).
