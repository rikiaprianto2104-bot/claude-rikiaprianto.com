<?php
/*
  API.PHP  |  Otak formulir "Rancang Game Impianmu!" (Future Makers).

  Satu berkas melayani lima aksi:
    GET  ?aksi=peserta   daftar nama peserta untuk kolom pencarian   (kunci formulir)
    POST ?aksi=kirim     simpan isian + tiga foto dari formulir      (kunci formulir)
    GET  ?aksi=daftar    semua isian + prompt yang sudah terisi      (kunci hasil)
    GET  ?aksi=foto      satu foto (id, jenis)                       (kunci hasil)
    POST ?aksi=hapus     hapus satu isian beserta fotonya            (kunci hasil)

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
const LIMIT_IP_HARI   = 150;               // satu WiFi kelas = satu IP, jadi dibuat longgar
const LIMIT_TOTAL_HARI = 500;              // rem darurat

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
    'nama_musuh'     => ['Nama musuh', 80],
    'alasan_musuh'   => ['Alasan menjadi musuh', 400],
    'kekuatan_musuh' => ['Kekuatan spesial musuh', 300],
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

if (!$bolehForm) {
    usleep(400000);   // menyulitkan tebak-tebakan kunci
    keluar(403, ['error' => 'kunci_salah']);
}

// ---------------- AKSI: peserta ----------------
if ($aksi === 'peserta' && $metode === 'GET') {
    $daftar = [];
    foreach (PESERTA as $no => $nama) $daftar[] = ['no' => $no, 'nama' => $nama];
    keluar(200, ['peserta' => $daftar, 'pilihan' => ['waktu' => PILIHAN_WAKTU, 'akhir' => PILIHAN_AKHIR]]);
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

    $id = date('Ymd-His') . '-' . preg_replace('/[^A-Z0-9]/', '', strtoupper($no)) . '-' . bin2hex(random_bytes(2));
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
    keluar(200, ['ok' => true, 'id' => $id]);
}

// Tiga aksi di bawah ini khusus pemegang kunci hasil.
if (in_array($aksi, ['foto', 'hapus', 'daftar'], true) && !$bolehHasil) keluar(403, ['error' => 'kunci_salah']);

// ---------------- AKSI: foto ----------------
if ($aksi === 'foto' && $metode === 'GET') {
    $id = (string)($_GET['id'] ?? '');
    $j  = (string)($_GET['jenis'] ?? '');
    if (!idValid($id) || !in_array($j, JENIS_FOTO, true)) keluar(400, ['error' => 'Permintaan tidak valid.']);
    $berkas = $data . '/entri/' . $id . '.json';
    $entri  = is_file($berkas) ? json_decode((string)file_get_contents($berkas), true) : null;
    $nama   = $entri['foto'][$j] ?? null;
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
    foreach (($entri['foto'] ?? []) as $nama) {
        if ($nama && preg_match('/^[0-9A-Za-z-]+\.(jpg|png|webp)$/', $nama)) @unlink($data . '/foto/' . $nama);
    }
    @unlink($berkas);
    keluar(200, ['ok' => true]);
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
            $tentangHero = "- Peran dalam game: Tokoh utama (pahlawan) dalam game \"{$a['judul']}\"\n"
                . "- Nama: {$a['nama_hero']}\n"
                . "- Bentuk dan warna: ikuti persis gambar referensi yang saya unggah.\n"
                . "- Kekuatan super: {$a['kekuatan_hero']}";
            $tentangMusuh = "- Peran dalam game: Tokoh musuh (lawan) dalam game \"{$a['judul']}\"\n"
                . "- Nama: {$a['nama_musuh']}\n"
                . "- Alasan menjadi musuh: {$a['alasan_musuh']}\n"
                . "- Bentuk dan warna: ikuti persis gambar referensi yang saya unggah.\n"
                . "- Kekuatan super: {$a['kekuatan_musuh']}";

            $entriOut[] = [
                'id'      => $e['id'],
                'waktu'   => $e['waktu'] ?? '',
                'jawaban' => $a,
                'foto'    => array_map(fn($f) => $f !== null, $e['foto'] ?? []),
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
        $hasil[] = ['no' => $no, 'nama' => $nama, 'entri' => $entriOut];
    }
    keluar(200, ['peserta' => $hasil]);
}

keluar(404, ['error' => 'Aksi tidak dikenal.']);
