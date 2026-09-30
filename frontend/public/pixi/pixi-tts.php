<?php
/*
  PIXI-TTS.PHP  |  Perantara antara halaman Pixi dan Gemini TTS (Google AI Studio).

  KENAPA ADA FILE INI
  Sebelumnya Pixi memakai speechSynthesis bawaan browser. Suaranya dipinjam dari
  perangkat, jadi berbeda-beda: di Windows terdengar dewasa, di Android lebih
  ringan, di iPhone lain lagi, dan di perangkat tanpa suara Indonesia bisa
  beraksen Inggris. File ini membuat suaranya satu dan sama di semua perangkat.

  CARA PASANG
  1. Upload ke  public_html/pixi/pixi-tts.php
  2. Tambahkan baris kunci Gemini ke file rahasia yang SUDAH ADA di
     /home/u295189530/domains/rikiaprianto.com/pixi-secret.php  sehingga isinya:
         <?php
         define('ANTHROPIC_KEY', 'sk-ant-...');
         define('GEMINI_KEY',    'AIza...');
  3. Di index.html, isi  TTS_URL: '/pixi/pixi-tts.php'
  4. Atur batas pengeluaran di Google AI Studio.

  Kalau kunci Gemini belum ada atau Google sedang bermasalah, file ini membalas
  error dan halaman Pixi otomatis kembali memakai suara bawaan browser. Jadi
  Pixi tidak pernah bisu.
*/

// ---------------- PENGATURAN ----------------
// MESIN: dua jalur suara, tinggal ganti satu kata di bawah.
//
//   'cloud'  Google Cloud Text-to-Speech, suara Chirp 3 HD. Jauh lebih cepat
//            menjawab. Nama suaranya kebetulan sama persis dengan Gemini
//            (Leda, Puck, Kore), jadi karakternya mirip.
//            Catatan: Chirp 3 HD tidak menerima arahan gaya, pitch, maupun
//            kecepatan, jadi GAYA di bawah diabaikan pada jalur ini.
//
//   'gemini' Gemini TTS. Lebih ekspresif karena bisa diarahkan lewat GAYA,
//            tetapi tiap permintaan memakan waktu tetap sekitar 7 detik,
//            berapa pun panjang kalimatnya (sudah diukur).
//
// Ganti nilainya lalu deploy. Suara tersimpan tidak tercampur karena nama mesin
// ikut menentukan sidik jari penyimpanannya.
const MESIN = 'cloud';

const MODEL = 'gemini-3.8-flash-lite-tts';  // dipakai hanya kalau MESIN = 'gemini'

// SUARA: Google memberi tiap suara satu kata sifat. 'Leda' disebut "Youthful",
// paling dekat dengan suara anak. Kalau mau dicoba yang lain:
//   'Puck'      - Upbeat, lebih bersemangat dan jenaka
//   'Sadachbia' - Lively, lebih lincah
//   'Achird'    - Friendly, lebih kalem dan bersahabat
// Ganti satu kata di bawah, lalu deploy. Suara lama yang tersimpan tidak
// terpakai lagi karena nama suara ikut menentukan sidik jari cache.
const SUARA = 'Leda';                       // dipakai hanya kalau MESIN = 'gemini'
const SUARA_CLOUD = 'id-ID-Chirp3-HD-Autonoe'; // dipakai hanya kalau MESIN = 'cloud'
// GAYA: inilah yang membuat suaranya terdengar seperti anak Indonesia, bukan
// seperti pembaca berita. Model mengikuti arahan ini saat membacakan kalimat,
// jadi tulis sedetail mungkin: umur, perasaan, tempo, dan logatnya.
// Bagian ini boleh diubah sesuka hati tanpa menyentuh kode lain.
const GAYA = 'Suara anak Indonesia umur sekitar delapan tahun yang ceria dan lucu. '
           . 'Nadanya tinggi dan ringan, penuh rasa ingin tahu, dan terdengar seperti sedang tersenyum saat bicara. '
           . 'Temponya agak cepat dan bersemangat, tetapi tiap kata tetap jelas supaya mudah ditangkap anak lain. '
           . 'Logatnya Indonesia sehari-hari yang santai dan akrab, seperti sedang mengobrol seru dengan teman sebangku, '
           . 'bukan gaya pembaca berita dan bukan gaya orang dewasa yang sedang menirukan anak kecil. '
           . 'Kalau kalimatnya lucu, bawakan dengan geli dan jenaka. '
           . 'Kalau kalimatnya memuji atau menyemangati, bawakan dengan hangat dan gembira.';
const SAMPEL     = 24000;
const MAX_HURUF  = 600;
const LIMIT_IP_HARI    = 300;   // tiap jawaban Pixi = 1 permintaan suara, jadi lebih longgar dari chat
const LIMIT_TOTAL_HARI = 1500;
const MAX_CACHE  = 400;         // jumlah berkas suara tersimpan sebelum yang terlama dibuang

$home = dirname($_SERVER['DOCUMENT_ROOT']);

function keluar(int $kode, array $isi): void {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($kode);
    echo json_encode($isi, JSON_UNESCAPED_UNICODE);
    exit;
}

// MP3, bukan WAV. WAV 24 kHz mentah berukuran sekitar 48 KB per detik audio,
// jadi satu jawaban lima detik menjadi 250 KB dan pengunduhannya di jaringan HP
// memakan beberapa detik sendiri - itulah jeda yang terasa, bukan pembuatannya.
// MP3 dengan isi yang sama sekitar 33 KB, tujuh kali lebih ringan.
//
// Nada suara TIDAK lagi dinaikkan di sini. Dulu caranya menyunting angka sample
// rate di header WAV, dan MP3 tidak punya header semacam itu. Sekarang halaman
// yang menaikkannya saat memutar, lewat CONFIG.IMUT.
function kirimAudio(string $audio): void {
    header('Content-Type: audio/mpeg');
    header('Content-Length: ' . strlen($audio));
    header('Cache-Control: private, max-age=86400');
    echo $audio;
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') keluar(405, ['error' => 'Metode tidak diizinkan']);

$masuk = json_decode(file_get_contents('php://input'), true);
$teks = trim((string)($masuk['text'] ?? ''));
if ($teks === '') keluar(400, ['error' => 'Teks kosong']);
$teks = mb_substr($teks, 0, MAX_HURUF);
// ---------------- Suara yang sudah pernah dibuat dipakai ulang ----------------
// Sapaan pembuka Pixi sama persis di setiap kunjungan. Tanpa ini, tiap pengunjung
// membuat tagihan untuk kalimat yang bunyinya sama.
$dirCache = $home . '/pixi-tts-cache';
if (!is_dir($dirCache)) @mkdir($dirCache, 0700, true);
$kunciCache = $dirCache . '/' . sha1(MESIN . '|' . MODEL . '|' . SUARA . '|' . SUARA_CLOUD . '|' . GAYA . '|' . $teks) . '.mp3';
if (is_file($kunciCache) && filesize($kunciCache) > 44) {
    @touch($kunciCache);
    kirimAudio((string)file_get_contents($kunciCache));
}

// ---------------- Kunci ----------------
$rahasia = $home . '/pixi-secret.php';
if (!is_file($rahasia)) keluar(500, ['error' => 'Suara Pixi belum disetel']);
require_once $rahasia;
// Dua layanan, dua kunci. Kunci Gemini ditolak Cloud TTS dengan 401, jadi jalur
// cloud memakai kuncinya sendiri: GOOGLE_TTS_KEY. Kalau baris itu belum ada di
// pixi-secret.php, jalur cloud akan memakai kunci Gemini sebagai cadangan, yang
// biasanya gagal - dan halaman otomatis kembali ke suara bawaan browser.
if (MESIN === 'cloud') {
    $KUNCI = defined('GOOGLE_TTS_KEY') && GOOGLE_TTS_KEY ? GOOGLE_TTS_KEY
           : (defined('GEMINI_KEY') ? GEMINI_KEY : '');
} else {
    $KUNCI = defined('GEMINI_KEY') ? GEMINI_KEY : '';
}
if (!$KUNCI) keluar(500, ['error' => 'Suara Pixi belum disetel']);

// ---------------- Batas pemakaian harian ----------------
$dirLimit = $home . '/pixi-limit';
if (!is_dir($dirLimit)) @mkdir($dirLimit, 0700, true);
function boleh(string $file, int $batas): bool {
    $fp = fopen($file, 'c+');
    if (!$fp) return true;
    flock($fp, LOCK_EX);
    $n = (int)stream_get_contents($fp);
    if ($n >= $batas) { flock($fp, LOCK_UN); fclose($fp); return false; }
    ftruncate($fp, 0); rewind($fp); fwrite($fp, (string)($n + 1));
    flock($fp, LOCK_UN); fclose($fp);
    return true;
}
$hari = date('Ymd');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'x';
if (!boleh("$dirLimit/$hari-tts-total", LIMIT_TOTAL_HARI) || !boleh("$dirLimit/$hari-tts-" . md5($ip), LIMIT_IP_HARI)) {
    keluar(429, ['error' => 'Suara Pixi istirahat dulu']);
}

// ---------------- Panggil Google ----------------
if (MESIN === 'cloud') {
    // Cloud TTS menolak kunci yang dikirim lewat header x-goog-api-key (401).
    // Layanan ini menerimanya sebagai parameter alamat, sesuai contoh resminya.
    // Kuncinya tetap aman: panggilan ini server ke server lewat HTTPS, tidak
    // pernah menyentuh browser anak.
    $alamat = 'https://texttospeech.googleapis.com/v1/text:synthesize?key=' . urlencode($KUNCI);
    // LINEAR16 dikembalikan lengkap dengan header WAV, jadi langsung bisa diputar.
    $payload = json_encode([
        'input' => ['text' => $teks],
        'voice' => ['languageCode' => 'id-ID', 'name' => SUARA_CLOUD],
        'audioConfig' => ['audioEncoding' => 'MP3', 'sampleRateHertz' => SAMPEL],
    ], JSON_UNESCAPED_UNICODE);
} else {
$alamat = 'https://generativelanguage.googleapis.com/v1beta/interactions';
$payload = json_encode([
    'model' => MODEL,
    'input' => [[
        'type' => 'user_input',
        'content' => [[
            'type' => 'text',
            'text' => $teks,
            'annotations' => [['type' => 'speech_metadata', 'style' => GAYA]],
        ]],
    ]],
    'response_format' => ['type' => 'audio', 'mime_type' => 'audio/wav', 'sample_rate' => SAMPEL],
    'generation_config' => ['speech_config' => [['voice' => SUARA]]],
], JSON_UNESCAPED_UNICODE);
}

// Google sesekali menolak permintaan yang sah, terutama saat beberapa
// permintaan datang beruntun. Sekali gagal berarti anak mendengar suara bawaan
// perangkat di tengah percakapan, jadi dicoba ulang beberapa kali dengan jeda
// yang makin panjang sebelum benar-benar menyerah. Jedanya pendek supaya tidak
// terasa oleh anak.
$res = false; $kode = 0;
foreach ([0, 400000, 1200000] as $i => $tunda) {
    if ($tunda) usleep($tunda);
    $ch = curl_init($alamat);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_HTTPHEADER => [
            'content-type: application/json',
            'x-goog-api-key: ' . $KUNCI,
        ],
        CURLOPT_POSTFIELDS => $payload,
    ]);
    $res = curl_exec($ch);
    $kode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($res !== false && $kode === 200) break;
    // 400 dan 401 tidak akan berubah kalau diulang: itu salah permintaan atau
    // salah kunci, bukan gangguan sesaat.
    if ($kode === 400 || $kode === 401 || $kode === 403) break;
}

if ($res === false || $kode !== 200) keluar(502, ['error' => 'Suara Pixi lagi gangguan']);

$data = json_decode($res, true);
$b64 = '';
if (MESIN === 'cloud') {
    $b64 = (string)($data['audioContent'] ?? '');
} else {
    // Audio base64 ada di steps[].content[].data
    foreach (($data['steps'] ?? []) as $langkah) {
        foreach (($langkah['content'] ?? []) as $bagian) {
            if (!empty($bagian['data'])) { $b64 = $bagian['data']; break 2; }
        }
    }
}
if ($b64 === '') keluar(502, ['error' => 'Suara Pixi tidak terdengar']);

$wav = base64_decode($b64, true);
if ($wav === false || strlen($wav) < 45) keluar(502, ['error' => 'Suara Pixi rusak']);

// Simpan untuk dipakai lagi, lalu buang yang paling lama kalau sudah terlalu banyak.
@file_put_contents($kunciCache, $wav, LOCK_EX);
$berkas = glob($dirCache . '/*.mp3') ?: [];
if (count($berkas) > MAX_CACHE) {
    usort($berkas, fn($a, $b) => filemtime($a) <=> filemtime($b));
    foreach (array_slice($berkas, 0, count($berkas) - MAX_CACHE) as $tua) @unlink($tua);
}

kirimAudio($wav);
