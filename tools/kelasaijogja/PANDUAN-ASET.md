# Panduan aset: membuat film scroll Kelas AI Jogja terasa seperti video

Beranda sekarang adalah film scroll 3D: kamera bergerak melewati dunia Pixi (`latar.webp`),
menembus pintu cahaya, lalu enam adegan mengikuti empat pertemuan kelas. Semuanya dirender
langsung di browser, jadi tetap tajam dan bisa diklik. Supaya terasa seperti video sinematik
atau motion graphic, ada dua cara menaikkan kualitasnya, dan keduanya memakai tool yang sudah Anda punya.

## Yang paling berpengaruh: klip video dari Google Flow

Video yang dibuat di Flow diubah menjadi urutan gambar, lalu diputar maju-mundur mengikuti scroll
(cara yang sama dengan contoh di rekaman layar Anda). Pixi 3D tetap tampil di depannya dan masih bisa diklik.

Spesifikasi video:
- Rasio **16:9**, resolusi 1080p, durasi **5 sampai 10 detik** per klip, tanpa teks di dalam video.
- Kamera bergerak satu arah (maju, naik, atau menembus), tanpa potongan adegan, supaya enak diputar maju dan mundur.
- Gaya mengikuti Pixi: dunia permen di langit, putih dan ungu, aksen kuning, halus dan bersih.

Klip yang disarankan (isi sesuai kotak, urutan terpenting di atas):

| Klip | Dipakai di | Isi |
|---|---|---|
| `langit` | adegan 0 sampai 2 | Kamera mengudara dari podium, naik melewati awan dan pulau melayang, lalu menuju pintu cahaya kuning. Pixi tidak perlu ada di video, karena Pixi 3D ditempel di atasnya. |
| `ruang` | adegan 2 sampai 5 | Di dalam pintu: ruang ungu bercahaya, panggung bundar, partikel bintang, kamera mengorbit pelan. |
| `demo` | adegan 5 | Kamera keluar dari pintu, mundur ke podium yang dihias lampu sorot dan konfeti. |

Cara membuat di Flow:
1. Buat **gambar awal** dulu di ChatGPT (lihat bagian berikut), lalu pakai sebagai frame pertama (image to video).
2. Prompt contoh untuk klip `langit`:
   `Cinematic camera move, 16:9. Start on a white and purple futuristic floating-island platform with a glowing round podium. The camera rises smoothly through soft white clouds, past floating islands with small trees and domed towers, then pushes forward into a large glowing yellow circular door. Candy-clay 3D animation style, soft light, no text, no characters, no cuts.`
3. Unduh MP4, lalu jalankan skrip di bawah.

Mengubah video menjadi frame (sekali per klip):

```
python tools/kelasaijogja/video-to-frames.py langit.mp4 --nama langit --dari 0 --sampai 2 --fps 16
```

`--dari` dan `--sampai` memilih rentang adegan tempat klip diputar. Skrip mengisi
`kelasaijogja/assets/film/manifest.json` otomatis, dan film langsung memakainya. Beban: sekitar 5 sampai 8 MB per klip
pada 16 fps. Beri tahu saya setelah file ada, saya yang menyetel dan mengunggahnya.

## Gambar dari ChatGPT

Dipakai sebagai frame awal video, latar tambahan, atau tekstur:
- Dunia Pixi dari sudut lain (podium dari dekat, ruang di dalam pintu, langit senja), **16:9, 2560 x 1440**.
- Karakter pendukung atau item ala permen: pengendali game, laptop, roket, piala, sertifikat.
- Gaya tetap seragam dengan `latar.webp`: 3D bersih, putih dan ungu, kuning menyala.
Simpan sebagai PNG atau WebP, beri nama jelas, taruh di satu folder.

## Model 3D dari Meshy

Dipakai sebagai properti yang berputar atau melayang di adegan 2 sampai 4 (menggantikan kartu datar):
- Pengendali game, laptop, roket, piala, bintang. Satu model satu file **GLB**, di bawah 3 MB.
- Di Meshy pilih tekstur PBR dan jumlah poligon sedang (sekitar 20.000 sampai 40.000).
- Pixi sendiri sudah ada (`pixi-v2.glb`) dan tidak perlu dibuat ulang.

## Yang saya kerjakan setelah aset ada

1. Mengubah video menjadi frame dan menyetel rentang adegannya.
2. Memasang model Meshy sebagai properti 3D di adegan yang sesuai.
3. Mengecilkan ukuran file (kompres WebP dan GLB) agar tetap ringan di ponsel.
4. Menguji di desktop dan ponsel, lalu mengunggah ke Hostinger.
