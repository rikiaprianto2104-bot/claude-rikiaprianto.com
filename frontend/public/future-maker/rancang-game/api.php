<?php
/*
  API.PHP  |  Otak formulir "Rancang Game Impianmu!" (Future Makers).

  Satu berkas melayani lima aksi:
    GET  ?aksi=peserta   daftar nama + status (sudah mengisi / revisi dibuka)   (kunci formulir)
    POST ?aksi=kirim     simpan isian + tiga foto dari formulir                 (kunci formulir)
    GET  ?aksi=ambil     isian terakhir, HANYA bila revisi anak itu dibuka       (kunci formulir)
    GET  ?aksi=daftar    semua isian + prompt yang sudah terisi                 (kunci hasil)
    GET  ?aksi=foto      satu foto (id, jenis)                                  (kunci hasil)
    POST ?aksi=hapus     hapus satu isian beserta fotonya                       (kunci hasil)
    POST ?aksi=unggah    simpan gambar HASIL ChatGPT (hero|musuh|dunia) utk satu isian (kunci hasil)
    POST ?aksi=hapusgpt  hapus satu gambar hasil ChatGPT                        (kunci hasil)
    POST ?aksi=izinkan   buka / tutup izin revisi untuk satu peserta            (kunci hasil)

  ATURAN ISI: tiap peserta hanya boleh mengisi SEKALI. Setelah itu formulir menolaknya (409)
  sampai Coach Riki menekan "Buka revisi" di halaman hasil. Satu kali kirim revisi memakai
  izin itu, lalu terkunci lagi. Menghapus semua isian seorang anak otomatis membukanya lagi.

  KUNCI dikirim lewat header  X-Kunci  (bukan lewat alamat gambar), dan ada dua:
    KUNCI_FORM   dibagikan ke anak / orang yang menginput. Hanya bisa mengirim.
    KUNCI_HASIL  khusus Coach Riki. Bisa melihat semua, juga bisa mengirim.

  DATA anak (nama, jawaban, foto gambar mereka) disimpan di folder
  ~/rancang-game-data/ di luar public_html, jadi tidak bisa dibuka lewat alamat web
  biasa. Foto hanya keluar lewat aksi=foto dan hanya untuk pemegang kunci hasil.

  CARA PASANG: lihat RANCANG-GAME-PASANG.md di root proyek.
*/

define('GAME_API', 1);

// ---------------- PENGATURAN ----------------
const MAX_FOTO_BYTE   = 6 * 1024 * 1024;   // per foto. Formulir sudah mengecilkan jadi < 1 MB.
const MAX_GPT_BYTE    = 10 * 1024 * 1024;  // per gambar hasil ChatGPT (diunggah Coach Riki)
const LIMIT_IP_HARI   = 150;               // satu WiFi kelas = satu IP, jadi dibuat longgar
const LIMIT_TOTAL_HARI = 500;              // rem darurat
const LIMIT_SALAH_HARI = 60;               // salah ketik kode per IP per hari, setelah itu ditolak sampai besok

date_default_timezone_set('Asia/Jakarta');

// Folder HOME (sejajar public_html). Untuk uji coba lokal boleh dialihkan lewat variabel
// lingkungan RANCANG_GAME_HOME.
$home = getenv('RANCANG_GAME_HOME') ?: dirname($_SERVER['DOCUMENT_ROOT']);
$data = $home . '/rancang-game-data';

// ---------------- DAFTAR PESERTA ----------------
// Satu-satunya sumber daftar nama. Menambah peserta: tambah baris, lalu unggah ulang.
const PESERTA = [
    'FM.B1-001' => 'Gardala Sangjalu GA',
    'FM.B1-002' => 'Al Farras King Shaquille Bayanaka',
    'FM.B1-003' => 'Farjana',
    'FM.B1-004' => 'Muhammad Umar',
    'FM.B1-005' => 'Muhammad Arsene Putra Kurniawan',
    'FM.B1-006' => 'Arshad Alvaronizam Arrafif',
    'FM.B1-007' => 'Dzaky Almair',
    'FM.B1-008' => 'M. Althaf Arrayhan',
    'FM.B1-009' => 'M. Ahnaf Syauqi',
    'FM.B1-010' => 'Muhammad Aksa',
];

const PILIHAN_WAKTU = ['Siang', 'Malam', 'Matahari terbenam', 'Bebaskan Claude memilih'];
const PILIHAN_AKHIR = ['Mengalahkan musuh', 'Menyelamatkan teman', 'Menemukan harta', 'Mencapai tujuan', 'Bebaskan Claude memilih'];

// Kolom teks: nama => [label, panjang maksimum]
const KOLOM = [
    'judul'          => ['Judul game', 120],
    'nama_hero'      => ['Nama tokoh utama', 80],
    'kekuatan_hero'  => ['Kekuatan spesial tokoh utama', 300],
    'warna_hero'     => ['Warna tokoh utama', 150],
    'nama_musuh'     => ['Nama musuh', 80],
    'alasan_musuh'   => ['Alasan menjadi musuh', 400],
    'kekuatan_musuh' => ['Kekuatan spesial musuh', 300],
    'warna_musuh'    => ['Warna tokoh musuh', 150],
    'dunia'          => ['Tempat petualangan', 300],
    'rintangan'      => ['Rintangan', 300],
    'masalah'        => ['Masalah yang harus diselesaikan', 400],
];
const JENIS_FOTO = ['hero', 'musuh', 'dunia'];

// ---------------- UTILITAS ----------------
function keluar(int $kode, array $isi): void {
    http_response_code($kode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($isi, JSON_UNESCAPED_UNICODE);
    exit;
}

function bersihkan(string $s, int $maks): string {
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s) ?? '';   // baris baru & karakter kontrol -> spasi
    $s = trim(preg_replace('/\s{2,}/u', ' ', $s) ?? '');
    return mb_substr($s, 0, $maks);
}

function kunciCocok(string $diberi, string $asli): bool {
    return $asli !== '' && $diberi !== '' && hash_equals($asli, $diberi);
}

function idValid(string $id): bool {
    return (bool)preg_match('/^\d{8}-\d{6}-[A-Z0-9]+-[0-9a-f]{4}$/', $id);
}

// Kode peserta tanpa titik/strip, dipakai di nama berkas (FM.B1-005 -> FMB1005).
function kodeBerkas(string $no): string {
    return preg_replace('/[^A-Z0-9]/', '', strtoupper($no));
}

// Berkas isian seorang peserta, yang terbaru di urutan pertama.
function berkasEntri(string $data, string $no): array {
    $f = glob($data . '/entri/*-' . kodeBerkas($no) . '-????.json') ?: [];
    rsort($f);
    return $f;
}

function izinRevisi(string $data, string $no): bool {
    return is_file($data . '/izin/' . kodeBerkas($no));
}

function pastikanFolder(string $dir): void {
    if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
        keluar(500, ['error' => 'Server tidak bisa menyimpan data. Hubungi Coach Riki.']);
    }
}

// ---------------- KEAMANAN ----------------
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Referrer-Policy: no-referrer');

$rahasia = $home . '/rancang-game-secret.php';
if (!is_file($rahasia)) keluar(503, ['error' => 'belum_disetel']);
require $rahasia;
if (!defined('KUNCI_FORM') || !defined('KUNCI_HASIL')) keluar(503, ['error' => 'belum_disetel']);

$kunci   = (string)($_SERVER['HTTP_X_KUNCI'] ?? '');
$bolehHasil = kunciCocok($kunci, KUNCI_HASIL);
$bolehForm  = $bolehHasil || kunciCocok($kunci, KUNCI_FORM);
$aksi    = (string)($_GET['aksi'] ?? '');
$metode  = $_SERVER['REQUEST_METHOD'] ?? '';

// Rem tebak-tebakan kode: hitung kode salah per IP per hari. Setelah melewati batas, IP itu
// ditolak lebih dulu SEBELUM kodenya diperiksa, jadi tebakan yang kebetulan benar pun tidak
// bisa dipastikan. Catatan disimpan di rancang-game-data/ (di luar public_html).
$ipSalah = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . 'salah'), 0, 16);
$berkasSalah = $data . '/salah-' . date('Ymd') . '.json';
$hitSalah = is_file($berkasSalah) ? (json_decode((string)file_get_contents($berkasSalah), true) ?: []) : [];
if (($hitSalah[$ipSalah] ?? 0) >= LIMIT_SALAH_HARI) keluar(429, ['error' => 'terlalu_banyak']);

if (!$bolehForm) {
    if ($kunci !== '') {
        pastikanFolder($data);
        $fs = fopen($berkasSalah, 'c+');
        if ($fs && flock($fs, LOCK_EX)) {
            $cat = json_decode((string)stream_get_contents($fs), true) ?: [];
            $cat[$ipSalah] = ($cat[$ipSalah] ?? 0) + 1;
            ftruncate($fs, 0); rewind($fs); fwrite($fs, json_encode($cat));
            flock($fs, LOCK_UN);
        }
        if ($fs) fclose($fs);
        foreach (glob($data . '/salah-*.json') ?: [] as $lama) {
            if ($lama !== $berkasSalah && filemtime($lama) < time() - 3 * 86400) @unlink($lama);
        }
    }
    usleep(400000);   // memperlambat tebak-tebakan
    keluar(403, ['error' => 'kunci_salah']);
}

// ---------------- AKSI: peserta ----------------
if ($aksi === 'peserta' && $metode === 'GET') {
    $daftar = [];
    foreach (PESERTA as $no => $nama) {
        $sudah = (bool)berkasEntri($data, $no);
        $daftar[] = ['no' => $no, 'nama' => $nama, 'sudah' => $sudah, 'revisi' => $sudah && izinRevisi($data, $no)];
    }
    keluar(200, ['peserta' => $daftar, 'pilihan' => ['waktu' => PILIHAN_WAKTU, 'akhir' => PILIHAN_AKHIR]]);
}

// ---------------- AKSI: ambil (isian lama untuk direvisi) ----------------
if ($aksi === 'ambil' && $metode === 'GET') {
    $no = (string)($_GET['no'] ?? '');
    if (!isset(PESERTA[$no])) keluar(400, ['error' => 'Peserta tidak dikenal.']);
    $berkas = berkasEntri($data, $no);
    if (!$berkas || !izinRevisi($data, $no)) keluar(403, ['error' => 'Revisi belum dibuka oleh Coach Riki.']);
    $e = json_decode((string)file_get_contents($berkas[0]), true) ?: [];
    keluar(200, ['jawaban' => $e['jawaban'] ?? [], 'foto' => array_map(fn($f) => $f !== null, $e['foto'] ?? [])]);
}

// ---------------- AKSI: kirim ----------------
if ($aksi === 'kirim' && $metode === 'POST') {
    // Kiriman lebih besar dari post_max_size dibuang PHP secara diam-diam ($_POST jadi kosong).
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0 && !$_POST && !$_FILES) {
        keluar(413, ['error' => 'Fotonya terlalu besar untuk dikirim. Coba pilih foto yang lebih kecil.']);
    }
    $no = (string)($_POST['peserta'] ?? '');
    if (!isset(PESERTA[$no])) keluar(400, ['error' => 'Pilih nama peserta dari daftar.']);

    $jawaban = [];
    foreach (KOLOM as $k => [$label, $maks]) {
        $v = bersihkan((string)($_POST[$k] ?? ''), $maks);
        if ($v === '') keluar(400, ['error' => "Kolom \"$label\" belum diisi."]);
        $jawaban[$k] = $v;
    }
    $waktu = (string)($_POST['waktu_game'] ?? '');
    $akhir = (string)($_POST['akhir'] ?? '');
    if (!in_array($waktu, PILIHAN_WAKTU, true)) keluar(400, ['error' => 'Pilih waktu petualangan.']);
    if (!in_array($akhir, PILIHAN_AKHIR, true)) keluar(400, ['error' => 'Pilih akhir cerita.']);
    $jawaban['waktu_game'] = $waktu;
    $jawaban['akhir']      = $akhir;

    // Foto: opsional, tetapi kalau ada harus gambar sungguhan.
    $foto = ['hero' => null, 'musuh' => null, 'dunia' => null];
    $isiFoto = [];
    foreach (JENIS_FOTO as $j) {
        $f = $_FILES['foto_' . $j] ?? null;
        if (!$f || ($f['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) continue;
        if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) {
            keluar(400, ['error' => "Foto $j gagal diunggah. Coba pilih ulang fotonya."]);
        }
        if ($f['size'] > MAX_FOTO_BYTE) keluar(400, ['error' => "Foto $j terlalu besar (maksimal 6 MB)."]);
        $biner = (string)file_get_contents($f['tmp_name']);
        $info  = @getimagesizefromstring($biner);
        $ext   = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$info['mime'] ?? ''] ?? null;
        if (!$info || !$ext) keluar(400, ['error' => "Foto $j harus berupa gambar JPG, PNG, atau WebP."]);
        $isiFoto[$j] = [$biner, $ext];
    }

    pastikanFolder($data . '/entri');
    pastikanFolder($data . '/foto');

    // Satu peserta, satu kali isi. Pemeriksaan dan penulisan dilindungi kunci berkas supaya dua
    // kiriman bersamaan dari anak yang sama tidak lolos keduanya. Kunci dilepas otomatis saat skrip selesai.
    $fk = fopen($data . '/kirim.lock', 'c');
    if ($fk) flock($fk, LOCK_EX);
    $entriLama = berkasEntri($data, $no);
    $revisi    = $entriLama && izinRevisi($data, $no);
    if ($entriLama && !$revisi) {
        keluar(409, ['error' => 'Kamu sudah mengisi formulir ini. Kalau mau merevisi, minta Coach Riki membukanya dulu ya.', 'kode' => 'sudah_mengisi']);
    }

    // Rem harian per IP dan total.
    $berkasLimit = $data . '/limit-' . date('Ymd') . '.json';
    $fh = fopen($berkasLimit, 'c+');
    if ($fh && flock($fh, LOCK_EX)) {
        $hit = json_decode((string)stream_get_contents($fh), true) ?: ['total' => 0, 'ip' => []];
        $ipKey = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . KUNCI_FORM), 0, 16);
        if (($hit['total'] ?? 0) >= LIMIT_TOTAL_HARI || ($hit['ip'][$ipKey] ?? 0) >= LIMIT_IP_HARI) {
            flock($fh, LOCK_UN); fclose($fh);
            keluar(429, ['error' => 'Terlalu banyak kiriman hari ini. Coba lagi besok ya.']);
        }
        $hit['total'] = ($hit['total'] ?? 0) + 1;
        $hit['ip'][$ipKey] = ($hit['ip'][$ipKey] ?? 0) + 1;
        ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($hit));
        flock($fh, LOCK_UN);
    }
    if ($fh) fclose($fh);
    foreach (glob($data . '/limit-*.json') ?: [] as $lama) {          // buang catatan hari-hari lalu
        if ($lama !== $berkasLimit && filemtime($lama) < time() - 3 * 86400) @unlink($lama);
    }

    $id = date('Ymd-His') . '-' . kodeBerkas($no) . '-' . bin2hex(random_bytes(2));
    // Revisi: foto yang tidak diganti disalin dari versi sebelumnya (disalin, bukan dibagi,
    // supaya menghapus satu versi tidak merusak versi lain).
    if ($revisi) {
        $lama = json_decode((string)file_get_contents($entriLama[0]), true) ?: [];
        foreach (JENIS_FOTO as $j) {
            $nm = $lama['foto'][$j] ?? null;
            if (isset($isiFoto[$j]) || !$nm || !preg_match('/^[0-9A-Za-z-]+\.(jpg|png|webp)$/', $nm) || !is_file($data . '/foto/' . $nm)) continue;
            $ext  = pathinfo($nm, PATHINFO_EXTENSION);
            $baru = "$id-$j.$ext";
            if (@copy($data . '/foto/' . $nm, $data . '/foto/' . $baru)) $foto[$j] = $baru;
        }
    }
    foreach ($isiFoto as $j => [$biner, $ext]) {
        $nama = "$id-$j.$ext";
        if (file_put_contents($data . '/foto/' . $nama, $biner) === false) {
            keluar(500, ['error' => 'Foto gagal disimpan. Coba kirim ulang.']);
        }
        $foto[$j] = $nama;
    }
    $entri = ['id' => $id, 'no' => $no, 'nama' => PESERTA[$no], 'waktu' => date('c'), 'jawaban' => $jawaban, 'foto' => $foto];
    if (file_put_contents($data . '/entri/' . $id . '.json', json_encode($entri, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) === false) {
        keluar(500, ['error' => 'Isian gagal disimpan. Coba kirim ulang.']);
    }
    if ($revisi) @unlink($data . '/izin/' . kodeBerkas($no));   // satu izin = satu kali revisi
    keluar(200, ['ok' => true, 'id' => $id, 'revisi' => (bool)$revisi]);
}

// Tiga aksi di bawah ini khusus pemegang kunci hasil.
if (in_array($aksi, ['foto', 'hapus', 'daftar', 'izinkan', 'unggah', 'hapusgpt'], true) && !$bolehHasil) keluar(403, ['error' => 'kunci_salah']);

// ---------------- AKSI: foto ----------------
if ($aksi === 'foto' && $metode === 'GET') {
    $id = (string)($_GET['id'] ?? '');
    $j  = (string)($_GET['jenis'] ?? '');
    if (!idValid($id) || !in_array($j, JENIS_FOTO, true)) keluar(400, ['error' => 'Permintaan tidak valid.']);
    $berkas = $data . '/entri/' . $id . '.json';
    $entri  = is_file($berkas) ? json_decode((string)file_get_contents($berkas), true) : null;
    $sumber = ($_GET['sumber'] ?? '') === 'gpt' ? 'gpt' : 'foto';   // gambar asli anak, atau hasil ChatGPT
    $nama   = $entri[$sumber][$j] ?? null;
    if (!$nama || !preg_match('/^[0-9A-Za-z-]+\.(jpg|png|webp)$/', $nama) || !is_file($data . '/foto/' . $nama)) {
        keluar(404, ['error' => 'Foto tidak ada.']);
    }
    $tipe = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'][pathinfo($nama, PATHINFO_EXTENSION)];
    header('Content-Type: ' . $tipe);
    header('Content-Length: ' . filesize($data . '/foto/' . $nama));
    readfile($data . '/foto/' . $nama);
    exit;
}

// ---------------- AKSI: hapus ----------------
if ($aksi === 'hapus' && $metode === 'POST') {
    $id = (string)($_POST['id'] ?? '');
    if (!idValid($id)) keluar(400, ['error' => 'Permintaan tidak valid.']);
    $berkas = $data . '/entri/' . $id . '.json';
    if (!is_file($berkas)) keluar(404, ['error' => 'Isian tidak ditemukan.']);
    $entri = json_decode((string)file_get_contents($berkas), true) ?: [];
    foreach (array_merge(array_values($entri['foto'] ?? []), array_values($entri['gpt'] ?? [])) as $nama) {
        if ($nama && preg_match('/^[0-9A-Za-z-]+\.(jpg|png|webp)$/', $nama)) @unlink($data . '/foto/' . $nama);
    }
    @unlink($berkas);
    if (!empty($entri['no']) && !berkasEntri($data, $entri['no'])) {   // tidak ada isian tersisa: anak itu boleh mengisi lagi
        @unlink($data . '/izin/' . kodeBerkas($entri['no']));
    }
    keluar(200, ['ok' => true]);
}

// ---------------- AKSI: unggah / hapusgpt (gambar hasil ChatGPT) ----------------
// Gambar ini dipakai sebagai lampiran di Claude. Disimpan per isian (per versi), di samping foto asli anak.
if (($aksi === 'unggah' || $aksi === 'hapusgpt') && $metode === 'POST') {
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0 && !$_POST && !$_FILES) {
        keluar(413, ['error' => 'Gambarnya terlalu besar untuk dikirim.']);
    }
    $id = (string)($_POST['id'] ?? '');
    $j  = (string)($_POST['jenis'] ?? '');
    if (!idValid($id) || !in_array($j, JENIS_FOTO, true)) keluar(400, ['error' => 'Permintaan tidak valid.']);
    $baru = null; $biner = null; $ext = null;
    if ($aksi === 'unggah') {
        $f = $_FILES['gambar'] ?? null;
        if (!$f || ($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) {
            keluar(400, ['error' => 'Gambar gagal diunggah. Coba pilih ulang.']);
        }
        if ($f['size'] > MAX_GPT_BYTE) keluar(400, ['error' => 'Gambar terlalu besar (maksimal 10 MB).']);
        $biner = (string)file_get_contents($f['tmp_name']);
        $info  = @getimagesizefromstring($biner);
        $ext   = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$info['mime'] ?? ''] ?? null;
        if (!$info || !$ext) keluar(400, ['error' => 'File harus berupa gambar JPG, PNG, atau WebP.']);
        $baru = "$id-gpt-$j.$ext";
    }
    pastikanFolder($data . '/foto');
    $fk = fopen($data . '/kirim.lock', 'c');
    if ($fk) flock($fk, LOCK_EX);
    $berkas = $data . '/entri/' . $id . '.json';
    $entri  = is_file($berkas) ? json_decode((string)file_get_contents($berkas), true) : null;
    if (!is_array($entri)) keluar(404, ['error' => 'Isian tidak ditemukan.']);
    $lama = $entri['gpt'][$j] ?? null;
    if ($baru !== null && file_put_contents($data . '/foto/' . $baru, $biner) === false) {
        keluar(500, ['error' => 'Gambar gagal disimpan.']);
    }
    if ($lama && $lama !== $baru && preg_match('/^[0-9A-Za-z-]+\.(jpg|png|webp)$/', $lama)) @unlink($data . '/foto/' . $lama);
    $entri['gpt'] = ($entri['gpt'] ?? []) + ['hero' => null, 'musuh' => null, 'dunia' => null];
    $entri['gpt'][$j] = $baru;
    if (file_put_contents($berkas, json_encode($entri, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) === false) {
        keluar(500, ['error' => 'Perubahan gagal disimpan.']);
    }
    keluar(200, ['ok' => true]);
}

// ---------------- AKSI: izinkan (buka / tutup revisi) ----------------
if ($aksi === 'izinkan' && $metode === 'POST') {
    $no   = (string)($_POST['no'] ?? '');
    $buka = ($_POST['buka'] ?? '') === '1';
    if (!isset(PESERTA[$no])) keluar(400, ['error' => 'Peserta tidak dikenal.']);
    if ($buka && !berkasEntri($data, $no)) keluar(400, ['error' => 'Anak ini belum mengisi, jadi tidak perlu dibuka.']);
    $berkasIzin = $data . '/izin/' . kodeBerkas($no);
    if ($buka) { pastikanFolder($data . '/izin'); file_put_contents($berkasIzin, date('c')); }
    else @unlink($berkasIzin);
    keluar(200, ['ok' => true, 'revisi' => $buka]);
}

// ---------------- AKSI: daftar (isian + prompt jadi) ----------------
if ($aksi === 'daftar' && $metode === 'GET') {
    $templat = require __DIR__ . '/templates.php';

    $isi = static function (string $tpl, array $v): string {
        $pasang = [];
        foreach ($v as $k => $nilai) $pasang['{{' . $k . '}}'] = $nilai;
        return strtr($tpl, $pasang);
    };

    $semua = [];
    foreach (glob($data . '/entri/*.json') ?: [] as $berkas) {
        $e = json_decode((string)file_get_contents($berkas), true);
        if (!is_array($e) || empty($e['id']) || empty($e['no'])) continue;
        $semua[$e['no']][] = $e;
    }

    $hasil = [];
    foreach (PESERTA as $no => $nama) {
        $versi = $semua[$no] ?? [];
        usort($versi, fn($a, $b) => strcmp($b['id'], $a['id']));   // terbaru di atas
        $entriOut = [];
        foreach ($versi as $e) {
            $a = $e['jawaban'];
            $bebas = 'Bebas, pilih sendiri yang paling cocok dengan cerita dan dunianya.';
            $waktuGame   = $a['waktu_game'] === 'Bebaskan Claude memilih' ? 'Bebas, Claude boleh memilih waktu yang paling cocok dengan cerita dan dunia game.' : $a['waktu_game'];
            $waktuGambar = $a['waktu_game'] === 'Bebaskan Claude memilih' ? $bebas : $a['waktu_game'];
            $akhir       = $a['akhir'] === 'Bebaskan Claude memilih' ? 'Bebas, Claude boleh memilih akhir cerita yang paling cocok.' : $a['akhir'];

            $umum = ['JUDUL_GAME' => $a['judul'], 'DUNIA_GAME' => $a['dunia'], 'RINTANGAN' => $a['rintangan']];
            // Warna disebut tegas: gambar anak difoto di atas kertas, dan tanpa keterangan ini
            // pembuat gambar sering meniru warna kertas (abu-abu/putih). Isian lama (sebelum ada
            // kolom warna) memakai kalimat cadangan.
            $barisWarna = function (string $w): string {
                return $w !== ''
                    ? "- Warna: $w"
                    : '- Warna: sesuai warna yang digambar anak pada gambar referensi (abaikan warna kertas dan latar foto).';
            };
            $tentangHero = "- Peran dalam game: Tokoh utama (pahlawan) dalam game \"{$a['judul']}\"\n"
                . "- Nama: {$a['nama_hero']}\n"
                . "- Bentuk: ikuti persis gambar referensi yang saya unggah.\n"
                . $barisWarna($a['warna_hero'] ?? '') . "\n"
                . "- Kekuatan super: {$a['kekuatan_hero']}";
            $tentangMusuh = "- Peran dalam game: Tokoh musuh (lawan) dalam game \"{$a['judul']}\"\n"
                . "- Nama: {$a['nama_musuh']}\n"
                . "- Alasan menjadi musuh: {$a['alasan_musuh']}\n"
                . "- Bentuk: ikuti persis gambar referensi yang saya unggah.\n"
                . $barisWarna($a['warna_musuh'] ?? '') . "\n"
                . "- Kekuatan super: {$a['kekuatan_musuh']}";

            $entriOut[] = [
                'id'      => $e['id'],
                'waktu'   => $e['waktu'] ?? '',
                'jawaban' => $a,
                'foto'    => array_map(fn($f) => $f !== null, $e['foto'] ?? []),
                'gpt'     => array_map(fn($f) => $f !== null, ($e['gpt'] ?? []) + ['hero' => null, 'musuh' => null, 'dunia' => null]),
                'prompt'  => [
                    'game' => $isi($templat['game'], $umum + [
                        'NAMA_HERO' => $a['nama_hero'], 'KEKUATAN_HERO' => $a['kekuatan_hero'],
                        'NAMA_MUSUH' => $a['nama_musuh'], 'ALASAN_MUSUH' => $a['alasan_musuh'],
                        'KEKUATAN_MUSUH' => $a['kekuatan_musuh'], 'WAKTU_GAME' => $waktuGame,
                        'MASALAH' => $a['masalah'], 'AKHIR_CERITA' => $akhir,
                    ]),
                    'hero'  => $isi($templat['karakter'], ['PERAN' => 'tokoh utama', 'TENTANG_TOKOH' => $tentangHero]),
                    'musuh' => $isi($templat['karakter'], ['PERAN' => 'tokoh musuh', 'TENTANG_TOKOH' => $tentangMusuh]),
                    'dunia' => $isi($templat['dunia'], $umum + ['WAKTU_GAMBAR' => $waktuGambar]),
                ],
            ];
        }
        $hasil[] = ['no' => $no, 'nama' => $nama, 'revisi' => (bool)$versi && izinRevisi($data, $no), 'entri' => $entriOut];
    }
    keluar(200, ['peserta' => $hasil]);
}

keluar(404, ['error' => 'Aksi tidak dikenal.']);
