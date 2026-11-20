# Bot Peluncur Iklan Meta

Membuat kampanye, set iklan, materi, dan iklan di akun Meta Ads Anda dari **satu berkas brief**.
Semua dibuat dalam keadaan **JEDA**. Uang baru keluar setelah Anda menyalakan sendiri.

> **Penting, baca jujur:** bot ini mengurus pekerjaan klik yang berulang. Bot **tidak** membuat
> Portofolio Bisnis, Halaman, akun iklan, atau pixel, tidak memasukkan kartu pembayaran, dan
> tidak menerima persyaratan atas nama Anda. Itu Bab 2–3 di panduan dan harus Anda kerjakan sendiri.
> "Sekali klik" berarti: setelah persiapan selesai, satu klik membuat seluruh kampanye (jeda).

## Yang dibutuhkan

1. Akun Meta yang sudah beres (Bab 2) dan pixel (Bab 3).
2. Token pengguna sistem (Bab 11). **Rahasia.**
3. Python 3.11 atau lebih baru (`python.org`). Tidak perlu memasang pustaka tambahan.
4. Materi iklan (gambar, atau video + gambar sampul) di folder `materi/`.

## Pemasangan (sekali saja)

1. Ekstrak folder ini ke komputer Anda.
2. Salin `.env.contoh` menjadi `.env`, isi `META_TOKEN`.
3. Salin `brief.contoh.json` menjadi `brief.json`, isi sesuai Brief Iklan Anda (Bab 5).
4. Taruh materi di folder `materi/` dan sesuaikan nama berkas di brief.

## Memakai (Windows)

Klik dua kali **`JALANKAN.bat`**, lalu pilih:

| Pilihan | Fungsi | Aman? |
|---|---|---|
| 1 Cek | Periksa token, akun, Halaman, Instagram, pixel, dan brief | Aman, hanya membaca |
| 2 Rencana | Tampilkan yang akan dibuat | Aman, tidak membuat apa pun |
| 3 Luncurkan | Buat semuanya, **jeda** | Tidak ada uang keluar |
| 4 Aktifkan | Nyalakan semua (harus mengetik `AKTIFKAN`) | **Uang mulai terpakai** |
| 5 Jeda | Jeda semua objek bot ini | Aman |
| 7 Sekali klik | Cek, lalu Luncurkan (tetap jeda) | Tidak ada uang keluar |

Untuk macOS/Linux: `python3 peluncur.py cek` (lalu `rencana`, `luncurkan`, `aktifkan`, `jeda`, `status`).

## Urutan yang disarankan

1. **Cek** sampai semua baris `[OK]`.
2. **Rencana**, baca baris demi baris.
3. **Luncurkan** (jeda).
4. Di Ads Manager, buka tiap iklan dengan **Pratinjau**. Periksa teks, tanggal, harga, link.
5. **Aktifkan** bila sudah yakin.
6. Cek status berkala, dan baca Bab 8 untuk membaca hasil.

## Pengaman bawaan

- Semua objek dibuat **jeda**.
- Wajib mengisi **batas belanja total**; bot menolak bila anggaran harian x hari melampauinya.
- Menolak kategori iklan khusus (perumahan, kredit, pekerjaan, isu sosial/politik).
- Menyalakan butuh mengetik `AKTIFKAN`.
- Token hanya dibaca dari `.env` dan hanya dikirim ke `graph.facebook.com`.

## Isi brief

| Kolom | Arti |
|---|---|
| `akun_iklan_id`, `page_id` | Wajib. ID akun iklan dan Halaman |
| `instagram_id`, `pixel_id` | Opsional, tetapi `pixel_id` wajib bila optimasi `OFFSITE_CONVERSIONS` |
| `satuan_terkecil` | Rupiah = `1`. Bila akun bermata uang lain (misalnya USD) isi `100` |
| `kampanye.tujuan` | `traffic` (lalu lintas) atau `leads` (prospek) |
| `kampanye.batas_belanja_total` | Pengaman belanja total, wajib |
| `set_iklan[].optimasi` | `LANDING_PAGE_VIEWS`, `LINK_CLICKS`, `OFFSITE_CONVERSIONS`, `IMPRESSIONS`, `REACH` |
| `set_iklan[].peristiwa` | Peristiwa pixel, misalnya `LEAD`, `CONTENT_VIEW`, `CONTACT` |
| `set_iklan[].usia_keras` | `true` bila orang di luar rentang usia **tidak boleh** melihat iklan |
| `iklan[].jenis` | `gambar` atau `video` (video wajib `gambar_sampul`) |
| `iklan[].tombol` | `LEARN_MORE`, `SIGN_UP`, `CONTACT_US`, `SHOP_NOW`, ... |

Setiap iklan di daftar `iklan` dipasang di **setiap** set iklan.

## Bila ada masalah

- Bot berhenti dengan pesan `[GAGAL]`. Baca pesannya; hampir selalu menjelaskan apa yang kurang.
- Cek **Bab 9 (Jebakan)** di panduan.
- Bot menyimpan ID yang sudah dibuat di `hasil-peluncuran.json`. **Jeda** memakai berkas ini.
- Hapus objek yang tidak diperlukan lewat Ads Manager.

## Batasan

- Tidak menjamin iklan disetujui atau berhasil.
- Menyesuaikan penempatan per ukuran (9:16 untuk Stories/Reels, 1:1 untuk Feed) belum didukung; Meta mengatur penempatan otomatis.
- Versi Marketing API (`META_API_VERSION`) perlu diperbarui bila Meta menghentikan versi lama.
- Ditulis sesuai dokumentasi Marketing API; uji lebih dulu di akun Anda dengan anggaran kecil dan tetap **jeda**.
- Bukan produk resmi Meta.
