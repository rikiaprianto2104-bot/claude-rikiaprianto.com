# Formulir "Rancang Game Impianmu!" — cara pasang & pakai

Formulir internal untuk siswa Future Makers. Jawabannya otomatis menjadi 4 prompt siap salin
(tokoh utama, musuh, dunia game → ChatGPT; game 3D → Claude), lengkap dengan foto yang bisa
disalin tanpa diunduh. **Tidak ditautkan dari menu mana pun, tidak masuk sitemap, dan ditandai
`noindex`.**

## Alamat

| Untuk | Alamat | Kode |
|---|---|---|
| Formulir (dibagikan ke anak / penginput) | `https://rikiaprianto.com/future-maker/rancang-game/formulir` | `KUNCI_FORM` |
| Hasil + prompt (khusus Coach Riki) | `https://rikiaprianto.com/future-maker/rancang-game/hasil` | `KUNCI_HASIL` |

Alamatnya pendek dan tidak memuat kode. Saat halaman dibuka pertama kali, **kodenya diketik sekali**,
lalu browser mengingatnya di perangkat itu (di perangkat lain atau setelah data browser dihapus,
ketik lagi). Kode `KUNCI_FORM` hanya bisa **mengirim**; hanya `KUNCI_HASIL` yang bisa melihat isian
dan foto anak. Nilai kodenya ada di berkas lokal `rancang-game-secret.php` (di-gitignore, tidak ikut
ke GitHub). Link lama berformat `…/?k=KODE` masih berfungsi dan kodenya langsung dihapus dari alamat.

**Boleh mengganti `KUNCI_FORM` menjadi kata yang mudah diketik anak** (mis. `futuremaker2026`),
cukup edit berkas rahasia di server. Pakai minimal 12 karakter. Biarkan `KUNCI_HASIL` tetap panjang.
Tebakan kode salah dibatasi 60 kali per hari per jaringan.

## Pasang (sekali saja)

1. **Deploy seperti biasa** (push ke `main` / `bash deploy.sh`). Berkas yang ikut:
   `frontend/public/future-maker/rancang-game/` (`index.html`, `hasil.html`, `api.php`,
   `templates.php`, `.htaccess`) dan satu aturan baru di `frontend/public/.htaccess`.
2. **Unggah `rancang-game-secret.php`** lewat File Manager Hostinger ke folder HOME domain,
   **sejajar `public_html`, bukan di dalamnya** — tempat yang sama dengan `pixi-secret.php`:
   `/home/u295189530/domains/rikiaprianto.com/rancang-game-secret.php`
3. Buka link Hasil dan ketik `KUNCI_HASIL`. Kalau muncul "belum disetel", berkas rahasia belum di tempat yang benar.

Data anak (isian + foto) otomatis disimpan di `…/rancang-game-data/` di folder HOME yang sama,
juga di luar `public_html`, jadi tidak bisa dibuka lewat alamat web biasa. Foto hanya keluar
lewat `api.php?aksi=foto` untuk pemegang `KUNCI_HASIL`. Lakukan backup folder itu bila perlu.

## Mengganti kunci (mis. link bocor)

Ganti nilai di `rancang-game-secret.php` **di server**, lalu bagikan kode baru. Kode lama langsung mati, dan perangkat yang mengingat kode lama akan diminta mengetik ulang.

## Mengubah isi

- **Daftar peserta**: konstanta `PESERTA` di `api.php` (satu-satunya sumber; kolom pencarian nama
  di formulir mengambilnya dari sini).
- **Teks prompt**: `templates.php`. `{{SEPERTI_INI}}` diisi otomatis dari jawaban anak.
  Prompt game = `PromptClaude.md`; prompt tokoh & dunia = `PROMPT CHAT GPT.docx` yang sudah dirapikan.
- **Pilihan Waktu / Akhir cerita**: `PILIHAN_WAKTU` dan `PILIHAN_AKHIR` di `api.php`
  (tambahkan juga ikon di array `SOAL` pada `index.html`).

## Aturan isi, revisi, dan hapus

**Sekali isi, lalu terkunci.** Setiap peserta hanya boleh mengirim formulir satu kali. Kalau anak
memilih namanya lagi, formulir menampilkan "kamu sudah mengisi" dan tombol kirim mati.

**Revisi dibuka oleh Coach Riki, per anak.**
1. Di halaman **Hasil**, pilih anaknya, lalu tekan **✏️ Buka revisi**.
2. Minta anak membuka formulir dan memilih namanya lagi. Jawaban lamanya terisi otomatis; ia cukup
   mengubah bagian yang mau diganti. Foto lama tetap dipakai kalau ia tidak memilih foto baru.
3. Setelah ia menekan **Simpan Revisi**, formulir terkunci lagi. Satu izin = satu kali revisi.
4. Berubah pikiran? Tekan **🔒 Tutup revisi** sebelum anak mengirim.

Versi sebelumnya tidak hilang. Di halaman Hasil ada menu "Versi" di atas kartu, dan yang tampil
pertama selalu yang terbaru.

**Menghapus data** (mis. isian uji coba atau versi lama), di halaman **Hasil**:
pilih anaknya (dan versinya lewat menu "Versi"), lalu tekan **🗑 Hapus isian ini**. Yang terhapus
hanya versi yang sedang tampil, beserta fotonya. Kalau itu isian terakhir anak tersebut, anak itu
otomatis bisa mengisi formulir dari awal lagi. Penghapusan tidak bisa dibatalkan.

## Gambar hasil ChatGPT → Claude

Kartu **4 · Game 3D** (prompt untuk Claude) tidak lagi menampilkan foto asli anak, melainkan tiga kotak
untuk **mengunggah gambar hasil ChatGPT** (Tokoh Utama, Musuh, Dunia). Cara mengisinya: klik
**Unggah gambar**, atau seret file ke kotak, atau klik kotak lalu tekan **Ctrl+V**. Setelah terunggah,
tombol **Salin foto** menyalinnya untuk ditempel berurutan di Claude. Gambar disimpan di server per isian
(per versi, di luar `public_html`, hanya terbaca oleh `KUNCI_HASIL`), diperkecil otomatis (maks. 2600 px),
dan ikut terhapus bila isiannya dihapus. Versi revisi baru dimulai tanpa gambar hasil ChatGPT; yang lama
tetap ada di versi sebelumnya. Foto asli anak tetap tampil di kartu 1–3.

## Catatan perilaku

- Draf yang belum terkirim disimpan di perangkat **per anak** (muncul lagi saat anak itu memilih
  namanya), jadi tidak tercampur di perangkat yang dipakai bergantian.
- Foto dikecilkan otomatis di perangkat anak (maks. 1800 px, JPEG) sebelum dikirim.
- Nama anak **tidak** dimasukkan ke dalam prompt yang ditempel ke ChatGPT/Claude.
- Tombol **Salin foto** memakai papan klip browser (butuh HTTPS; Chrome/Edge/Safari/Firefox terbaru).
  Kalau browser menolak, klik kanan / tekan lama fotonya → "Salin gambar", atau tombol ⬇ untuk unduh.
- Batas kiriman: 150 per hari per jaringan WiFi, 500 per hari total.
