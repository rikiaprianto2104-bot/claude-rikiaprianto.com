## Bab 9 · Jebakan dan perbaikan (semuanya terjadi sungguhan)

Setiap butir di bawah ini pernah menghentikan atau membingungkan kampanye nyata. Menyimpan daftar ini bisa menghemat berjam-jam.

### 1. Akun iklan "kosong": tidak ada Halaman, Instagram, atau pixel

**Gejala:** Claude atau Ads Manager tidak melihat aset Anda.
**Penyebab:** akun iklan tidak berada di Portofolio Bisnis yang sama dengan Halaman, atau konektor menunjuk ke akun iklan yang salah.
**Perbaikan:** Bab 2, Langkah 5. Tambahkan akun iklan ke portofolio yang benar, hubungkan ulang konektor, pilih akun yang tepat.

### 2. Kampanye yang dibuat "tidak ada" di Ads Manager

**Gejala:** Claude melapor kampanye sudah dibuat, tetapi Anda tidak melihatnya.
**Penyebab:** Anda melihat akun iklan atau portofolio yang berbeda, atau filter tanggal tidak mencakup hari pembuatan.
**Perbaikan:** periksa pemilih akun iklan di kiri atas, lalu perluas rentang tanggal.

### 3. Audiens khusus dari situs gagal dibuat

**Gejala:** error saat membuat audiens berbasis pengunjung situs.
**Penyebab:** **Persyaratan Layanan Audiens Khusus belum diterima.** Hanya Anda yang bisa menerimanya.
**Perbaikan:** terima persyaratannya di Ads Manager (bagian Audiens), lalu ulangi.

### 4. "Update your location targeting" / kesalahan lokasi

**Gejala:** set iklan tidak bisa diterbitkan karena lokasi.
**Penyebab:** jenis lokasi yang dipilih tidak diterima untuk titik radius tersebut.
**Perbaikan:** ubah ke jenis lokasi **tinggal di sana dan baru-baru ini di sana**, lalu terbitkan ulang.

### 5. Set iklan dijadwalkan, bukan tayang, padahal hari ini

**Gejala:** set iklan berstatus *terjadwal* dan tidak mulai.
**Penyebab:** waktu mulai di masa depan atau zona waktu keliru.
**Perbaikan:** waktu mulai **tidak bisa diubah** setelah set iklan berjalan. Buat set iklan baru dengan waktu yang benar dan pindahkan iklannya, lalu jeda yang lama.

### 6. Jadwal di tingkat iklan ditolak

**Gejala:** iklan tidak bisa diberi jadwal sendiri.
**Penyebab:** jenis kampanye tertentu hanya mengizinkan jadwal di tingkat set iklan.
**Perbaikan:** atur jadwal di set iklan, atau jeda iklan secara manual pada tanggalnya.

### 7. Penyesuaian per penempatan (PAC) tidak aktif

**Gejala:** error "tidak diaktifkan untuk akun ini" saat membuat materi dengan ukuran berbeda per penempatan.
**Penyebab:** fitur ini belum tersedia untuk akun Anda lewat jalur itu.
**Perbaikan:** pakai definisi materi dinamis dengan aturan penyesuaian per penempatan (minta Claude melakukan ini), atau satu ukuran serbaguna 1:1.

### 8. Mengedit objek aktif ikut menjedanya

**Gejala:** setelah mengubah batas belanja atau jadwal, kampanye berhenti.
**Penyebab:** edit "non-trivial" pada objek aktif menjeda objek itu sebagai pengaman.
**Perbaikan:** **selalu periksa status setelah mengubah**, lalu nyalakan kembali.

### 9. Jadwal anggaran periode tertentu ditolak

**Gejala:** error "daftar anggaran harus memiliki anggaran harian", atau "waktu harus kelipatan 15 menit".
**Perbaikan:** sertakan anggaran harian dalam perubahan yang sama, dan pakai waktu kelipatan 15 menit (00, 15, 30, 45). Karena itu akhir periode sering berhenti di menit ke-45.

### 10. Mengganti set iklan lama ke yang baru: jangan putus tayang

**Gejala:** iklan berhenti total setelah menjeda yang lama.
**Penyebab:** iklan di set iklan baru masih dalam tinjauan.
**Perbaikan:** **jangan menjeda yang lama** sebelum iklan pengganti lolos tinjauan, kecuali yang lama memang merugikan.

### 11. Set iklan audiens hangat hampir tidak tayang

**Gejala:** hanya ratusan tayangan dalam seminggu.
**Penyebab:** audiens (pengunjung situs, penonton, pengikut) terlalu kecil karena pixel baru.
**Perbaikan:** tunggu sampai audiens cukup besar, atau gabungkan ke set iklan utama.

### 12. Meta tidak belajar dari iklan Anda

**Gejala:** tayangan diatur acak, hasil tidak membaik.
**Penyebab:** peristiwa yang dioptimalkan terlalu jarang terjadi (misalnya 1 `Lead` dalam seminggu).
**Perbaikan:** Bab 3, bagian "Memilih peristiwa untuk dioptimalkan".

### 13. Klik murah, tetapi tidak ada yang bertindak

**Gejala:** biaya per kunjungan sangat rendah, tidak ada pendaftar.
**Penyebab:** optimasi pada kunjungan menarik klik tidak sengaja dan usia yang tidak sesuai.
**Perbaikan:** Bab 8, tabel gejala; optimasi ke peristiwa minat.

### 14. Spanduk verifikasi pengiklan

**Gejala:** spanduk "verifikasi siapa di balik iklan Anda".
**Perbaikan:** selesaikan di Ads Manager. Hanya pemilik akun yang bisa mengerjakannya.

### 15. Materi di tautan sementara

**Gejala:** Meta gagal mengambil gambar atau video dari URL.
**Penyebab:** tautan butuh login, mengarah ke halaman perantara, atau berukuran terlalu besar.
**Perbaikan:** gunakan tautan langsung yang publik; hapus setelah diunggah.

### Kalau semua gagal

1. Salin pesan error lengkapnya ke Claude dan tanyakan penyebabnya.
2. Lihat **Pusat Bantuan Bisnis Meta** (`facebook.com/business/help`) dan cari pesan error yang sama.
3. Bila iklan ditolak, gunakan tombol **Minta tinjauan** di Ads Manager dengan penjelasan singkat dan sopan.
