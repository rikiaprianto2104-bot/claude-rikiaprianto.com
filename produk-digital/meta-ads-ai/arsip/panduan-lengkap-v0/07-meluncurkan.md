## Bab 7 · Meluncurkan dengan Claude, langkah demi langkah

Kerjakan urutan ini. Tiap langkah punya **prompt siap salin**. Ganti isi dalam kurung siku `[ ]` dengan data Anda dari Brief Iklan (Bab 5).

> **Pola yang dipakai di setiap langkah:** minta rencana → periksa → setujui → baru dibuat → periksa hasilnya. Jangan melewati bagian "periksa".

### Langkah 1 · Minta rencana tertulis

```
Saya ingin membuat kampanye Meta Ads. Ini brief saya:
[tempel Brief Iklan yang sudah diisi]

Sebelum membuat apa pun, tulis RENCANA: struktur kampanye, set iklan,
daftar iklan, anggaran harian x jumlah hari = total, dan peristiwa pixel
yang dioptimalkan. Tunjukkan juga risiko atau hal yang perlu saya putuskan.
Jangan membuat apa pun sampai saya setuju.
```

**Periksa:** apakah total anggaran sesuai batas belanja Anda? Apakah peristiwa yang dioptimalkan masuk akal (Bab 3)?

### Langkah 2 · Buat kampanye (jeda) dengan batas belanja

```
Rencana disetujui. Buat KAMPANYE dengan tujuan [lalu lintas/prospek],
dalam keadaan JEDA. Pasang batas belanja total Rp [angka] di tingkat
kampanye. Setelah dibuat, tampilkan ID, status, dan batas belanjanya.
```

**Periksa di Ads Manager:** kampanye muncul, status nonaktif, batas belanja terlihat.

### Langkah 3 · Buat set iklan (jeda)

```
Buat SET IKLAN di kampanye itu, dalam keadaan JEDA:
- Anggaran harian Rp [angka]
- Jadwal [mulai] sampai [selesai], zona waktu [WIB]
- Lokasi [kota, radius km]
- Saran usia [min]-[maks] (biarkan Advantage+ audience aktif)
- Peristiwa yang dioptimalkan: [peristiwa], pixel [nama pixel]
- Penempatan otomatis
Tampilkan hasilnya dan beri tahu bila ada error.
```

**Periksa:** anggaran harian benar (satuan rupiah, bukan sen), jadwal benar, pixel terpilih.

### Langkah 4 · Unggah materi

Claude membutuhkan **alamat publik** (URL) untuk mengambil gambar atau video, atau Anda mengunggah lewat jendela unggah bila tersedia.

```
Unggah materi ini ke akun iklan: [daftar URL atau file].
Setelah selesai, tunjukkan ID/hash tiap materi dan ukurannya.
Untuk video, tunggu sampai statusnya siap sebelum dipakai.
```

> **Keamanan:** kalau Anda menaruh materi sementara di situs sendiri, **hapus setelah diunggah** ke Meta.

### Langkah 5 · Buat iklan (jeda)

```
Buat IKLAN dalam set iklan itu, semuanya JEDA:
Iklan 1: [nama], materi [file], teks utama "[teks]", judul "[judul]",
         deskripsi "[deskripsi]", tombol [Daftar/Selengkapnya],
         link [URL dengan penanda UTM].
Iklan 2: ...
Gunakan penyesuaian per penempatan: 9:16 untuk Stories/Reels, 1:1 atau 4:5 untuk Feed.
```

**Periksa:** buka tiap iklan di Ads Manager lewat **Pratinjau**: lihat tampilan di Feed, Stories, dan Reels. Cek ejaan, tanggal, harga, dan link.

### Langkah 6 · Periksa error sebelum menyalakan

```
Periksa semua error pemblokir pada kampanye, set iklan, dan iklan.
Jelaskan tiap error dalam bahasa sederhana dan sarankan perbaikan.
Jangan menyalakan apa pun.
```

### Langkah 7 · Nyalakan (keputusan Anda)

Nyalakan dari atas ke bawah: kampanye, lalu set iklan, lalu iklan.

```
Saya setuju menyalakan. Nyalakan kampanye, lalu set iklan, lalu iklan,
satu per satu. Setelah itu tunjukkan status tiap objek.
```

Status awal yang normal: **Dalam proses / Menunggu tinjauan.** Peninjauan iklan bisa memakan waktu dari menit sampai beberapa jam. Iklan baru tayang setelah disetujui.

### Langkah 8 · Verifikasi dalam 24 jam

- Iklan berstatus **Aktif**, bukan *Ditolak* atau *Terbatas*.
- Biaya mulai terpakai sesuai anggaran harian, tidak jauh melampaui.
- Pixel menerima peristiwa dari kunjungan yang datang dari iklan.
- Tidak ada pesan error di Ads Manager.

### Cek sebelum lanjut

- [ ] Semua objek dibuat dalam keadaan jeda dan saya memeriksanya di Ads Manager.
- [ ] Batas belanja kampanye terpasang.
- [ ] Saya menyalakan sendiri, dan mengecek status setelahnya.
