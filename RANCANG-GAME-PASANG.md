# Formulir "Rancang Game Impianmu!" — cara pasang & pakai

Formulir internal untuk siswa Future Makers. Jawabannya otomatis menjadi 4 prompt siap salin
(tokoh utama, musuh, dunia game → ChatGPT; game 3D → Claude), lengkap dengan foto yang bisa
disalin tanpa diunduh. **Tidak ditautkan dari menu mana pun, tidak masuk sitemap, dan ditandai
`noindex`.**

## Alamat

| Untuk | Alamat | Kunci |
|---|---|---|
| Formulir (dibagikan ke anak / penginput) | `https://rikiaprianto.com/future-maker/rancang-game/?k=KUNCI_FORM` | `KUNCI_FORM` |
| Hasil + prompt (khusus Coach Riki) | `https://rikiaprianto.com/future-maker/rancang-game/hasil.html?k=KUNCI_HASIL` | `KUNCI_HASIL` |

Tanpa kunci yang benar, kedua halaman hanya menampilkan layar "Halaman ini khusus". Kunci
`KUNCI_FORM` hanya bisa **mengirim**; hanya `KUNCI_HASIL` yang bisa melihat isian dan foto anak.
Nilai kuncinya ada di berkas lokal `rancang-game-secret.php` (di-gitignore, tidak ikut ke GitHub).

## Pasang (sekali saja)

1. **Deploy seperti biasa** (push ke `main` / `bash deploy.sh`). Berkas yang ikut:
   `frontend/public/future-maker/rancang-game/` (`index.html`, `hasil.html`, `api.php`,
   `templates.php`, `.htaccess`) dan satu aturan baru di `frontend/public/.htaccess`.
2. **Unggah `rancang-game-secret.php`** lewat File Manager Hostinger ke folder HOME domain,
   **sejajar `public_html`, bukan di dalamnya** — tempat yang sama dengan `pixi-secret.php`:
   `/home/u295189530/domains/rikiaprianto.com/rancang-game-secret.php`
3. Buka link Hasil. Kalau muncul "belum disetel", berkas rahasia belum di tempat yang benar.

Data anak (isian + foto) otomatis disimpan di `…/rancang-game-data/` di folder HOME yang sama,
juga di luar `public_html`, jadi tidak bisa dibuka lewat alamat web biasa. Foto hanya keluar
lewat `api.php?aksi=foto` untuk pemegang `KUNCI_HASIL`. Lakukan backup folder itu bila perlu.

## Mengganti kunci (mis. link bocor)

Ganti nilai di `rancang-game-secret.php` **di server**, lalu bagikan link baru. Link lama langsung mati.

## Mengubah isi

- **Daftar peserta**: konstanta `PESERTA` di `api.php` (satu-satunya sumber; kolom pencarian nama
  di formulir mengambilnya dari sini).
- **Teks prompt**: `templates.php`. `{{SEPERTI_INI}}` diisi otomatis dari jawaban anak.
  Prompt game = `PromptClaude.md`; prompt tokoh & dunia = `PROMPT CHAT GPT.docx` yang sudah dirapikan.
- **Pilihan Waktu / Akhir cerita**: `PILIHAN_WAKTU` dan `PILIHAN_AKHIR` di `api.php`
  (tambahkan juga ikon di array `SOAL` pada `index.html`).

## Catatan perilaku

- Satu anak boleh mengirim lebih dari sekali. Halaman Hasil menampilkan yang **terbaru**, versi
  lama bisa dipilih lewat menu di atas kartu. Isian bisa dihapus dari halaman Hasil.
- Foto dikecilkan otomatis di perangkat anak (maks. 1800 px, JPEG) sebelum dikirim.
- Nama anak **tidak** dimasukkan ke dalam prompt yang ditempel ke ChatGPT/Claude.
- Tombol **Salin foto** memakai papan klip browser (butuh HTTPS; Chrome/Edge/Safari/Firefox terbaru).
  Kalau browser menolak, klik kanan / tekan lama fotonya → "Salin gambar", atau tombol ⬇ untuk unduh.
- Batas kiriman: 150 per hari per jaringan WiFi, 500 per hari total.
