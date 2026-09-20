# Catatan Keamanan — rikiaprianto.com

Ringkasan audit keamanan dan perbaikan yang sudah diterapkan, plus hal-hal yang
masih perlu dikerjakan manual.

## Cara kerja situs ini (penting untuk menilai risiko)

Situs live adalah **file statis** (HTML/JS/CSS hasil `npm run build`) di shared
hosting Hostinger (LiteSpeed + `.htaccess`). Tidak ada PHP, tidak ada database
yang terhubung ke publik, dan backend FastAPI di `backend/` **tidak** dipakai
oleh situs live.

Konsekuensinya: serangan klasik seperti SQL injection atau RCE lewat form tidak
relevan di sini. Yang relevan adalah:

1. penyusupan lewat **skrip pihak ketiga** (CDN yang diretas),
2. **pembajakan tampilan** (clickjacking, MITM di jaringan publik),
3. **pencurian kredensial deploy** (jalur SFTP/GitHub Actions) — ini yang paling
   berbahaya, karena siapa pun yang memegangnya bisa mengganti seluruh isi situs.

---

## Yang sudah diperbaiki

### 1. Tidak ada satu pun header keamanan di situs live — **Tinggi**

Respons dari `rikiaprianto.com` hanya membawa `Content-Security-Policy: upgrade-insecure-requests`
bawaan Hostinger. Tidak ada CSP sungguhan, HSTS, `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, maupun `Permissions-Policy`.

Artinya: halaman bisa di-`iframe` situs mana pun (clickjacking — misal membungkus
halaman pendaftaran Kelas Future Makers dengan tombol palsu), skrip dari domain
mana pun bisa berjalan kalau ada celah injeksi, dan pengunjung di WiFi publik
bisa dibelokkan ke versi HTTP palsu.

**Perbaikan** — [frontend/public/.htaccess](frontend/public/.htaccess): CSP dengan
daftar putih domain, HSTS 1 tahun, `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
`Permissions-Policy`, dan COOP/CORP.

### 2. Kredensial deploy dikirim ke server yang identitasnya tidak diverifikasi — **Tinggi**

`.github/workflows/deploy.yml` memakai `StrictHostKeyChecking=no` **dan**
`UserKnownHostsFile=/dev/null`. Kombinasi itu berarti: runner menerima server
mana pun yang menjawab di alamat tersebut, lalu mengirimkan password SFTP ke
sana. Siapa pun yang bisa membelokkan DNS/rute mendapat akses tulis penuh ke
`public_html` — yaitu kemampuan mengganti seluruh situs.

**Perbaikan** — [.github/workflows/deploy.yml](.github/workflows/deploy.yml):
identitas server diverifikasi lewat `known_hosts`.

> **Perlu tindakan Anda** — lihat bagian "Yang masih perlu dikerjakan" di bawah.

### 3. CORS `*` digabung dengan `allow_credentials=True` — **Tinggi** (backend)

`backend/server.py` mengizinkan semua origin sambil mengizinkan pengiriman
cookie. Spesifikasi CORS melarang kombinasi ini justru karena maksudnya: situs
mana pun boleh memanggil API sambil membawa sesi pengguna.

**Perbaikan** — [backend/server.py](backend/server.py): origin harus didaftarkan
eksplisit lewat `CORS_ORIGINS`; wildcard ditolak saat `ENVIRONMENT=production`.

### 4. Endpoint tulis tanpa autentikasi dan tanpa batas — **Sedang** (backend)

`POST /api/status` bisa dipanggil siapa saja, berapa kali pun, dengan
`client_name` sepanjang apa pun — cukup untuk memenuhi database.

**Perbaikan** — batas panjang input (`max_length=120`), `extra="forbid"`, dan
rate limit per IP. Selain itu `/docs`, `/redoc`, `/openapi.json` ditutup di
produksi, dan pesan error internal tidak lagi dikirim ke klien.

### 5. Skrip CDN tanpa Subresource Integrity — **Sedang**

Empat halaman di `/projects/` memuat library dari cdnjs/jsDelivr/unpkg tanpa
`integrity`. Kalau salah satu CDN itu diretas, kode apa pun yang mereka sajikan
akan langsung berjalan di halaman rikiaprianto.com.

**Perbaikan**: semua skrip CDN dipatok hash SHA-384. Sudah diuji — file dengan
hash yang tidak cocok benar-benar ditolak browser.

| Halaman | Library |
|---|---|
| `ai-content-planner.html` | ExcelJS 4.4.0 |
| `petualangan-pixi-moko.html` | three.js r128 |
| `distribusi-app.html` | SheetJS 0.20.3 |
| `labirin-harta-karun.html` | PeerJS 1.5.4, Firebase 10.12.2 |

Di `labirin-harta-karun.html` entri `peerjs@1` (versi mengambang) dihapus: isinya
bisa berubah sewaktu-waktu sehingga tidak mungkin dipatok hash.

### 6. xlsx 0.18.5 (CVE-2023-30533) — **Rendah di sini**

`distribusi-app.html` memakai xlsx 0.18.5 dari cdnjs, yang kena prototype
pollution. Jalur rentannya ada di sisi **membaca** file `.xlsx`; halaman ini
hanya **menulis** file, jadi tidak terpanggil. Tetap dinaikkan ke SheetJS 0.20.3
(sudah diverifikasi memuat dengan benar di browser).

### 7. `backend/.env` ikut ter-commit ke git — **Sedang (pencegahan)**

Isinya saat ini belum rahasia (`mongodb://localhost`), tapi begitu pindah ke
server sungguhan `MONGO_URL` akan berisi username/password — dan file itu sudah
terlanjur dalam kebiasaan "ikut di-commit".

**Perbaikan**: `backend/.env` di-untrack (file tetap ada di disk),
`backend/.env.example` dibuat sebagai template, `.gitignore` diperluas
(`*.key`, `*.p12`, `id_rsa*`, `.npmrc`).

`frontend/.env` **sengaja tetap di-commit** karena isinya memang nilai publik
(Meta Pixel ID) yang toh ikut ter-bundle ke JavaScript. Peringatan sudah
ditambahkan di file itu agar tidak ada yang menaruh rahasia di sana.

**Riwayat git sudah diperiksa: tidak ada kredensial yang pernah bocor.**

### 8. Perbaikan lain

- `permissions: contents: read` + `persist-credentials: false` di workflow —
  membatasi hak `GITHUB_TOKEN` yang secara default bisa menulis ke repo.
- `npm ci` menggantikan `npm install` — memasang persis versi di lockfile dan
  memverifikasi hash tiap paket, jadi dependensi tidak bisa naik versi
  diam-diam ke rilis yang baru disusupi.
- Langkah verifikasi otomatis: deploy **gagal** kalau `.htaccess` tidak ikut
  ter-upload atau header keamanan hilang di situs live.
- `Options -Indexes` — mematikan daftar isi folder.
- Blokir akses ke dotfile (`.env`, `.git/`, `.htaccess`) dan file konfigurasi.
- `axios` dan `lodash` dihapus (tidak dipakai sama sekali), `react-router-dom`
  dinaikkan 7.5.1 → 7.18.4 (menutup beberapa CVE open-redirect/XSS).
- `rel="noreferrer"` → `rel="noopener noreferrer"` pada semua link `target="_blank"`
  (tabnabbing di browser lama).
- PostHog: `recordCrossOriginIframes` dimatikan dan `maskAllInputs` dinyalakan —
  isi form di `/contact` tidak ikut terekam.

---

## Yang masih perlu dikerjakan (manual)

### A. Pin kunci host SSH — menutup sisa celah MITM

Selama secret `SSH_KNOWN_HOSTS` belum di-set, workflow masih memakai
`accept-new` (percaya pada koneksi pertama). Jalankan ini **dari jaringan yang
Anda percaya** (bukan WiFi publik):

```bash
ssh-keyscan -p 65002 145.79.14.207
```

Salin seluruh keluarannya, lalu di GitHub: **Settings → Secrets and variables →
Actions → New repository secret**, nama `SSH_KNOWN_HOSTS`. Workflow otomatis
beralih ke verifikasi ketat.

### B. Ganti ke SSH key, hentikan autentikasi password

Password SFTP di GitHub Secrets adalah satu-satunya kunci ke `public_html`.
Lebih aman: buat SSH key khusus deploy, daftarkan public key-nya di hPanel
Hostinger, simpan private key sebagai secret, lalu matikan login password.

### C. Aktifkan 2FA

Di akun GitHub **dan** hPanel Hostinger. Keduanya bisa mengganti isi situs.

### D. Kalau backend FastAPI nanti benar-benar di-deploy

- Isi `ENVIRONMENT=production` dan `CORS_ORIGINS` dengan domain eksplisit.
- Isi `ALLOWED_HOSTS`.
- Jalankan di belakang reverse proxy dengan rate limit sungguhan — yang di
  `server.py` hanya penahan dasar (hitungan in-memory, hilang saat restart,
  tidak dibagi antar worker).
- Pakai user MongoDB dengan hak minimum, bukan user admin.
- Beri autentikasi pada `POST /api/status`, atau hapus kalau tidak dipakai.

### ~~E. Perkuat CSP lebih jauh~~ — SUDAH DIKERJAKAN

Snippet Meta Pixel, PostHog, dan peredam `DataCloneError` sudah dipindah dari
`public/index.html` ke [frontend/public/analytics.js](frontend/public/analytics.js),
sehingga `index.html` kini **nol skrip inline** dan `script-src` di root tidak
lagi memuat `'unsafe-inline'`. Skrip yang disuntikkan ke HTML sekarang ditolak
browser, bukan dijalankan — inilah yang membuat CSP benar-benar berfungsi
sebagai pertahanan XSS, bukan sekadar hiasan.

Meta Pixel ID tetap diatur dari satu tempat (`frontend/.env`); nilainya
diteruskan lewat atribut `data-pixel-id` pada tag script, karena file di
`public/` disalin apa adanya tanpa substitusi variabel.

**Pengecualian yang disengaja: folder `/projects/`.** Ke-22 halaman aplikasi
dan game di sana ditulis sebagai HTML mandiri dengan total 36 blok skrip inline
dan sejumlah atribut `onclick`. Memberlakukan aturan ketat di sana akan membuat
semuanya berhenti jalan, jadi folder itu punya
[.htaccess sendiri](frontend/public/projects/.htaccess) dengan `script-src`
yang masih mengizinkan `'unsafe-inline'`. Seluruh perlindungan lain (anti-iframe,
`object-src 'none'`, batasan `connect-src`/`form-action`) tetap sama dengan root.

Kompromi ini terbatas dan sadar: halaman di folder itu tidak memegang sesi,
tidak punya backend, dan tidak menampilkan data pengguna lain. **Kalau suatu
saat ada halaman di sana yang menangani data sensitif atau menerima kiriman
dari orang lain, halaman itu harus dipindah keluar dari `/projects/` atau skrip
inline-nya dipindah ke file `.js` tersendiri.**

Dua pengaman dipasang di pipeline supaya ini tidak rusak diam-diam — keduanya
sudah diuji benar-benar menolak:

- deploy **gagal** kalau `build/index.html` memuat skrip inline lagi;
- deploy **gagal** kalau `build/projects/.htaccess` hilang (tanpa file itu,
  semua game mewarisi CSP ketat dan berhenti jalan — kegagalan yang tidak
  terlihat dari halaman depan).

Catatan: `style-src` **tetap** memuat `'unsafe-inline'` dan memang harus begitu.
React, Tailwind, dan framer-motion menulis style lewat atribut `style` secara
langsung; menghapusnya akan merusak tampilan seluruh situs.

### F. Opsional: HSTS untuk subdomain

Saat ini `max-age=31536000` tanpa `includeSubDomains`, supaya subdomain yang
mungkin belum ber-HTTPS tidak ikut terkunci. Kalau sudah dipastikan semua
subdomain ber-HTTPS, ubah di `.htaccess` menjadi
`"max-age=31536000; includeSubDomains"`.

---

## Temuan yang diperiksa dan dinyatakan aman

- **Tidak ada kredensial di riwayat git** — dicek dengan `git log -S`.
- **Tidak ada API key ter-hardcode.** Config Firebase di `labirin-harta-karun.html`
  bernilai `null` (hanya template dalam komentar).
- **Tidak ada directory listing**, dan `/.env`, `/.git/config`, `/backend/.env`
  sudah dibalas 403 di server live.
- **Redirect HTTP → HTTPS sudah aktif** (301 dari Hostinger).
- **Sisa peringatan `npm audit`** (27 high, 2 critical) semuanya berasal dari
  `react-scripts` — perkakas **build**, berjalan di mesin build, tidak ikut
  dikirim ke browser pengunjung. Semua paket yang benar-benar ter-bundle sudah
  bersih. Memaksa `npm audit fix --force` akan merusak build tanpa menambah
  keamanan situs live; solusi sebenarnya adalah migrasi dari CRA ke Vite.
- **`innerHTML` di halaman `/projects/`**: input berasal dari pengguna itu
  sendiri dan tidak pernah dibagikan ke pengunjung lain, jadi paling jauh hanya
  "self-XSS" (seseorang menyerang browsernya sendiri). Tidak ada backend dan
  tidak ada sesi yang bisa dicuri. Parameter URL `?kode=` di
  `labirin-harta-karun.html` sudah divalidasi ketat (`[A-Za-z]{4}`).

---

## Cara memverifikasi setelah deploy

```bash
curl -sSI https://rikiaprianto.com/ | grep -iE "content-security|strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy"
```

Harus muncul enam header. Kalau kosong, kemungkinan besar hosting menolak salah
satu direktif `.htaccess` — cek error log di hPanel, dan lihat komentar di
`.htaccess` tentang `ServerSignature Off`.
