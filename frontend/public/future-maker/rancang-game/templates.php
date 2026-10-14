<?php
/*
  TEMPLATES.PHP  |  Isi 3 template prompt untuk halaman hasil Rancang Game.
  Dibaca oleh api.php (bukan dibuka langsung). Ganti teksnya kapan saja; yang
  ditulis {{SEPERTI_INI}} diisi otomatis dari jawaban formulir.

  game      -> prompt untuk Claude (membuat game 3D)         sumber: prompt-future-makers-v2.txt
  karakter  -> prompt ChatGPT gambar tokoh utama DAN musuh   sumber: PROMPT CHAT GPT.docx
  dunia     -> prompt ChatGPT gambar dunia game              sumber: PROMPT CHAT GPT.docx
*/
if (!defined('GAME_API')) { http_response_code(403); exit; }

return [

'game' => <<<'TXT'
# FUTURE MAKERS — BUAT GAME 3D-KU

## TUGAS
Kamu adalah developer game 3D sekaligus seniman visual. Buat SATU game 3D yang bisa dimainkan, berdasarkan 3 gambar referensi dan ide anak (usia 6–12 tahun) di bawah.
Putuskan semua hal teknis sendiri. Jangan bertanya kecuali gambar tidak bisa dibaca. Jangan menulis rencana panjang; langsung kerjakan.

## GAMBAR REFERENSI
- GAMBAR 1 = tokoh utama, GAMBAR 2 = musuh, GAMBAR 3 = dunia game.
Sebelum menulis kode, lakukan langkah singkat ini:
1. Lihat ketiga gambar. Catat maksimal 8 baris: bentuk kepala/badan, warna (kode hex), aksesori, dan proporsi tiap karakter.
2. Ambil palet dunia dari GAMBAR 3 (langit atas, langit horizon, matahari, daun, batang, tanah, air, kabut) sebagai kode hex. Pakai Python/PIL jika tersedia.
3. Buat LATAR PANORAMA dari GAMBAR 3: potong bagian atasnya saja (± 55% teratas: langit, gunung, hutan jauh; buang sungai dan tepi depan), kecilkan ke lebar ± 1600 px, simpan JPEG kualitas ± 80, lalu sematkan sebagai base64 di dalam HTML.
   Pasang pada silinder besar tanpa tutup yang mengelilingi dunia (BackSide, fog:false, mengikuti posisi kamera, MirroredRepeatWrapping agar tanpa sambungan terlihat). Di atasnya beri kubah langit gradasi. Warna kabut dunia = warna horizon gambar. Hasilnya: dari sudut mana pun, latar terlihat seperti lukisan Gambar 3.
4. Karakter dibuat dari geometri 3D yang mengikuti Gambar 1 dan 2 (bentuk, warna, aksesori, ciri khas). Wajah dari gambar boleh dipotong kecil untuk ikon di HUD.

## IDE GAME SAYA
**Judul game:** {{JUDUL_GAME}}

### Tokoh utama
- Nama: {{NAMA_HERO}}
- Kekuatan spesial: {{KEKUATAN_HERO}}

### Tokoh musuh
- Nama: {{NAMA_MUSUH}}
- Alasan menjadi musuh: {{ALASAN_MUSUH}}
- Kekuatan spesial: {{KEKUATAN_MUSUH}}

### Dunia permainan
- Tempat petualangan: {{DUNIA_GAME}}
- Waktu: {{WAKTU_GAME}}
- Rintangan: {{RINTANGAN}}

### Cerita dan tujuan
- Masalah utama: {{MASALAH}}
- Akhir yang diinginkan: {{AKHIR_CERITA}}

Lengkapi sendiri hal yang belum ditentukan secara kreatif. Jangan mengubah nama, kekuatan, atau ide utama anak.

## GAMEPLAY (wajib)
- Halaman awal: judul, cerita singkat 2–3 kalimat, tombol Mulai.
- Level lurus pendek dalam 3 zona: awal, zona rintangan, arena musuh utama. Panjang jalur ± 90–120 unit.
- Setiap rintangan yang disebut anak harus menjadi objek nyata yang berfungsi (sungai, jembatan, serangan hewan, dan sebagainya).
- Tiga tombol aksi: Serang dasar, Kekuatan 2, Kekuatan 3. Turunkan dari "Kekuatan spesial" anak. Jika kurang dari tiga, tambahkan yang cocok. Setiap aksi punya efek visual, suara, dan cooldown.
- Musuh kecil dan musuh utama punya perilaku (patroli, mengejar, menyerang dengan tanda peringatan). Musuh utama menampilkan kekuatan khasnya dan bar nyawa.
- Nyawa 5–6 hati, hati pemulih, checkpoint. Jatuh ke jurang/air = kembali ke checkpoint tanpa mengurangi nyawa.
- Tujuan selalu tampil di layar. Ada layar menang, layar kalah, tombol Main Lagi, jeda, dan tombol suara.
- Musik latar dan efek suara dibuat dengan WebAudio (tanpa file). Mulai setelah sentuhan/klik pertama.

## KAMERA 360° (wajib)
- Kamera orbit penuh 360° mengelilingi pemain: drag mouse, atau geser jari di sisi kanan layar. Batasi sudut atas-bawah. Scroll/pinch untuk zoom dekat-jauh.
- Gerak pemain mengikuti arah kamera (maju = menjauhi kamera). Kamera tidak boleh tembus tanah.
- Joystick di kiri bawah dan tombol aksi di kanan bawah tidak boleh mengganggu drag kamera. Dukung multi-touch dengan pointer id.

## KONTROL
- Komputer: WASD/panah, Spasi lompat, J/K/L untuk aksi, Esc jeda, mouse untuk kamera.
- HP/tablet: joystick virtual, tombol lompat, 3 tombol aksi, tombol jeda dan suara. Tombol besar, tidak menutupi area penting.

## KUALITAS VISUAL (bagian terpenting)
Targetnya: terlihat seperti game animasi berkualitas, bukan balok polos.
- Pencahayaan: matahari hangat bersudut rendah sesuai "Waktu" anak, cahaya hemisphere, bayangan lembut yang mengikuti pemain, fog warna horizon, ACESFilmic tone mapping.
- Pohon: batang meruncing dengan akar; 3–5 gumpalan daun icosahedron detail 2 dengan shading HALUS (jangan flatShading); warna per-vertex gradasi (bawah gelap, atas terang); ukuran dan warna bervariasi. Tinggi 6–10 unit saja dan jauh dari jalur (radius bebas ± 6 unit) supaya tidak menutupi pemain dan kamera. Pakai InstancedMesh.
- Tanah: bukan satu warna datar. Pakai variasi warna per-vertex, bukit landai di sisi jalur, jalan setapak, ratusan rumput/semak, bunga, batu bulat halus.
- Air: bergerak (gelombang), warna dari palet Gambar 3, ada busa di tepi, batu di dalamnya.
- Karakter: bentuk membulat (RoundedBox/Capsule), material toon atau standar dengan outline tipis (inverted hull), sedikit emissive pada bagian bercahaya. Tinggi sekitar 2 unit.
- Atmosfer: awan bergerak, partikel (kunang-kunang/debu/daun), efek cahaya additive pada kekuatan spesial, getar kamera pelan saat serangan keras.
- Hindari: warna rata tanpa variasi, bentuk kotak telanjang, objek raksasa yang menutupi layar, dunia kosong.
- Performa: pixelRatio maksimal 1.5 di HP, shadow map 1024 di HP, gunakan instancing, targetkan 60 fps.

## FILE KELUARAN
- Hasil akhir: SATU file `.html` mandiri (CSS, JS, gambar latar base64, three.js semuanya di dalamnya) supaya mudah diunggah ke website. Tanpa ZIP, tanpa file lain, tanpa README.
- Cara memasukkan three.js: paling baik pasang `three` dan `esbuild` lewat npm, bundle ke satu IIFE (minify), lalu sisipkan inline. Jika npm tidak tersedia, pakai `<script type="importmap">` ke `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` dan sebutkan di akhir bahwa game butuh internet.
- Kirim file tersebut sebagai file yang bisa diunduh.

## HEMAT TOKEN (wajib, kuota terbatas)
- Tulis kode lengkap SEKALI. Perbaikan kecil pakai edit, jangan menulis ulang seluruh file.
- Kode padat, target ≤ 1.400 baris, komentar seperlunya. Jangan menampilkan kode di chat.
- Jangan membuat file tambahan (README, ZIP, skrip uji besar).
- Pengujian ringkas saja: (1) cek sintaks/bundle lolos, (2) satu uji logika headless singkat (≤ 40 baris) untuk mulai → bergerak → serang → menang/kalah. Jika ada browser headless, ambil 1 screenshot tampilan awal. Jangan mengulang pengujian yang sudah lulus.
- Jangan menyatakan fitur sudah diuji jika tidak diuji; tulis jujur apa yang belum.
- Balasan akhir maksimal 10 baris: nama file, cara main (komputer dan HP), daftar kontrol, dan hal yang belum diuji.

**Mulai sekarang: analisis gambar → bangun → uji ringkas → kirim satu file .html.**
TXT,

'karakter' => <<<'TXT'
# TUGAS: MEMBUAT 3D GAME CHARACTER PRODUCTION SHEET

Bertindaklah sebagai **Senior 3D Character Artist, Character Designer, Game Asset Artist, dan Technical Artist** yang berpengalaman dalam pengembangan karakter untuk game 3D.

Saya akan mengunggah sebuah gambar referensi {{PERAN}} untuk game 3D saya. Tugasmu adalah mengembangkan gambar tersebut menjadi **3D Game Character Production Sheet** yang profesional, detail, konsisten, dan dapat digunakan sebagai acuan untuk proses pembuatan model 3D, rigging, animasi, serta implementasi karakter ke dalam game menggunakan Claude AI dan game engine.

## TENTANG TOKOH
{{TENTANG_TOKOH}}

## 1. ATURAN UTAMA DESAIN
- Gunakan gambar yang saya unggah sebagai referensi utama.
- Gambar referensi adalah foto gambar tangan di atas kertas. Abaikan warna kertas, latar, bayangan, dan pencahayaan foto. Warna karakter harus mengikuti keterangan "Warna" pada bagian TENTANG TOKOH; jika ada beberapa warna, ikuti pembagian warna pada gambar referensi.
- Pertahankan identitas visual karakter, termasuk bentuk kepala, wajah, warna, pakaian, aksesori, proporsi tubuh, dan ciri khasnya.
- Jangan mengubah desain asli secara berlebihan atau menciptakan karakter baru yang berbeda.
- Jika gambar referensi memiliki bagian yang tidak terlihat, lengkapi secara logis dan konsisten dengan desain aslinya.
- Gunakan gaya visual 3D yang berkualitas tinggi, dengan material, pencahayaan, tekstur, dan detail yang jelas.
- Pastikan semua tampilan menunjukkan karakter yang sama persis, bukan beberapa variasi desain.
- Tampilkan satu karakter saja ({{PERAN}}), tanpa karakter tambahan, kecuali jika saya meminta sebaliknya.

## 2. CHARACTER ORTHOGRAPHIC VIEWS
Buat tiga tampilan karakter dengan proporsi, ukuran, warna, pakaian, dan aksesori yang konsisten.
**VIEW A — FRONT VIEW**
- Tampak depan secara lurus, sudut kamera 0 derajat.
- Seluruh tubuh terlihat dari kepala hingga kaki.
- Posisi tubuh netral, simetris, dan mudah dianalisis.
- Kedua tangan sedikit menjauh dari badan.
- Kedua kaki sedikit terbuka agar bentuk anggota tubuh terlihat jelas.

**VIEW B — BACK VIEW**
- Tampak belakang secara lurus, sudut kamera 180 derajat.
- Tampilkan detail punggung, rambut bagian belakang, pakaian, aksesori, sepatu, serta bagian belakang senjata jika ada.
- Pastikan desainnya konsisten dengan tampak depan.

**VIEW C — THREE-QUARTER VIEW**
- Tampak tiga perempat dari arah depan dengan sudut sekitar 45 derajat.
- Tampilkan volume kepala, kedalaman tubuh, bentuk pakaian, material, dan dimensi senjata.
- Gunakan sudut yang memperlihatkan karakter dengan jelas tanpa menutupi ciri khasnya.

Gunakan tampilan ortografis atau perspektif yang sangat minimal untuk tampak depan dan belakang. Hindari distorsi lensa, perubahan proporsi akibat perspektif, pose ekstrem, dan bagian tubuh yang saling menutupi.

## 3. RIGGING-READY BODY DESIGN
Rancang karakter dengan mempertimbangkan kebutuhan animasi 3D.
- Buat bentuk tangan dan kaki yang jelas, terpisah secara visual dari badan, serta cukup tebal agar mudah dimodelkan dan di-rig.
- Untuk karakter bergaya imut, pertahankan bentuk yang lucu dan membulat tanpa menghilangkan struktur pergelangan tangan, siku, lutut, dan pergelangan kaki.
- Pastikan bahu, siku, pergelangan tangan, pinggul, lutut, dan pergelangan kaki mudah dikenali.
- Hindari tangan menempel pada badan, kaki menyatu, jari saling menyatu, serta aksesori yang menutupi area persendian.
- Gunakan pose netral menyerupai A-pose: lengan terbuka sekitar 30–45 derajat dari badan, telapak tangan terlihat, dan kaki sedikit terbuka.
- Jangan gunakan pose aksi untuk tampilan utama.
- Pertahankan desain pakaian yang dapat dimodelkan dan dianimasikan secara realistis.
- Jangan menambahkan pakaian atau aksesori yang tidak terdapat pada gambar referensi.

Gambar harus membantu proses pembuatan model humanoid atau stylized 3D character dengan skeleton biped, skin weights, dan facial rig.

## 4. FACIAL EXPRESSION SHEET
Buat empat ekspresi wajah yang berbeda, tetapi tetap mempertahankan identitas karakter.
**FACE 1 — HAPPY**
- Mata cerah dan ekspresif.
- Alis rileks.
- Senyum yang jelas dan natural.

**FACE 2 — SAD**
- Sudut alis mengarah ke atas pada bagian tengah.
- Mata tampak sedih.
- Mulut menunjukkan kesedihan.

**FACE 3 — ANXIOUS / NERVOUS**
- Alis tegang.
- Mata menunjukkan kegelisahan.
- Mulut sedikit tegang atau ragu.

**FACE 4 — AFRAID / SCARED**
- Mata terbuka lebar.
- Alis terangkat.
- Mulut menunjukkan keterkejutan dan ketakutan.

Tampilkan setiap ekspresi dalam close-up wajah yang menghadap ke depan. Pertahankan bentuk kepala, ukuran mata, warna kulit, rambut, dan fitur wajah yang sama.
Ekspresi harus cukup jelas untuk diterjemahkan menjadi blend shapes, morph targets, atau sistem facial animation.

## 5. WEAPON & SPECIAL ABILITY DESIGN
Jika karakter memiliki senjata, kekuatan khusus, atau aksesori penting, buat bagian khusus yang menjelaskan desainnya.
Tampilkan:
- Tampak depan, samping, dan perspektif tiga perempat senjata jika memungkinkan.
- Bentuk, ukuran relatif, warna, material, tekstur, dan detail mekanis.
- Bagian yang dapat bergerak atau berubah bentuk.
- Efek visual kekuatan khusus, seperti listrik, api, energi, cahaya, teleportasi, atau efek lainnya sesuai referensi.
- Efek saat kekuatan tidak aktif dan saat digunakan.
- Cara karakter memegang atau menggunakan senjata.
- Detail yang diperlukan agar senjata dapat dibuat sebagai game asset terpisah.

Kekuatan super yang ditulis di bagian TENTANG TOKOH wajib digambarkan secara visual. Jangan mengarang senjata atau kekuatan baru di luar gambar referensi dan bagian TENTANG TOKOH. Jika detailnya tidak terlihat, pertahankan desain yang masuk akal dan tandai sebagai interpretasi desain.

## 6. MATERIAL & VISUAL STYLE
Gunakan kualitas visual yang sesuai untuk karakter game 3D profesional.
- High-quality stylized 3D rendering.
- Material yang mudah dibedakan, seperti metal, kain, kulit, plastik, kayu, atau material fantasi sesuai desain.
- Pencahayaan studio yang lembut dan merata.
- Siluet karakter harus mudah dikenali.
- Warna konsisten di seluruh tampilan.
- Detail tajam, bersih, dan tidak berlebihan.
- Latar belakang polos berwarna netral agar karakter mudah dianalisis.
- Hindari motion blur, depth of field berlebihan, efek sinematik yang menutupi detail, teks dekoratif, watermark, serta objek tambahan yang tidak diperlukan.

Prioritaskan keterbacaan bentuk dan konsistensi desain daripada efek visual yang berlebihan.

## 7. LAYOUT GAMBAR
Susun gambar menjadi satu production sheet yang rapi dengan bagian berikut:
BARIS PERTAMA:
1. Front View — seluruh tubuh.
2. Back View — seluruh tubuh.
3. Three-Quarter Front View — seluruh tubuh.

BARIS KEDUA:
4. Happy Face.
5. Sad Face.
6. Anxious / Nervous Face.
7. Afraid / Scared Face.

BARIS KETIGA:
8. Weapon Design Sheet.
9. Special Ability / VFX Design jika karakter memilikinya.

Berikan jarak yang cukup di antara setiap tampilan. Pastikan tidak ada bagian karakter yang terpotong dan seluruh detail utama terlihat jelas.
Jika seluruh detail tidak dapat ditampilkan dengan baik dalam satu gambar, prioritaskan konsistensi dan keterbacaan. Buat production sheet tambahan untuk wajah, senjata, atau detail material daripada memadatkan semuanya secara berlebihan.

## 8. STANDAR OUTPUT
Hasil akhir harus berfungsi sebagai **visual blueprint untuk produksi aset game 3D**, bukan sekadar ilustrasi karakter.

Gambar harus membantu proses berikutnya:
1. Membuat model 3D berdasarkan referensi visual.
2. Menentukan proporsi dan siluet karakter.
3. Memisahkan mesh karakter, pakaian, aksesori, dan senjata.
4. Menyiapkan skeleton dan rigging.
5. Menyiapkan facial expressions.
6. Membuat animasi dasar seperti idle, walk, run, jump, attack, hurt, dan death sesuai kebutuhan game.
7. Menyiapkan aset agar dapat diekspor ke format seperti FBX atau GLB dan diintegrasikan ke game engine.

PENTING: Gambar referensi ini merupakan acuan desain, bukan model 3D yang sudah memiliki mesh, topology, skeleton, rig, atau animasi. Jangan mengklaim bahwa komponen teknis tersebut sudah tersedia hanya karena gambarnya terlihat seperti render 3D.

## 9. INSTRUKSI AKHIR
Analisis gambar yang saya unggah terlebih dahulu. Pertahankan desain asli dan buat production sheet yang paling jelas, konsisten, serta berguna untuk proses pengembangan game 3D.
**Prioritas utama:**
1. Kesetiaan terhadap desain karakter asli.
2. Konsistensi karakter pada seluruh tampilan.
3. Keterbacaan bentuk untuk pemodelan 3D.
4. Kemudahan proses rigging dan animasi.
5. Detail senjata, aksesori, serta kekuatan khusus.
6. Kualitas visual profesional.

Mulailah dengan menghasilkan gambar production sheet sesuai seluruh instruksi di atas.
TXT,

'dunia' => <<<'TXT'
# TUGAS: GAME WORLD DESIGN — FROM CHILD'S DRAWING TO 3D ENVIRONMENT

Bertindaklah sebagai Senior 3D Environment Artist, Game Level Designer, dan Technical Artist yang berpengalaman membuat dunia game 3D untuk anak-anak.

Saya akan mengunggah gambar sketsa dunia game yang dibuat oleh seorang anak. Tugasmu adalah mengembangkan sketsa tersebut menjadi **desain environment game 3D yang menarik, detail, konsisten, dan dapat dijadikan referensi untuk pembuatan level game menggunakan Claude AI**.

## TENTANG DUNIA GAME
- Nama game: {{JUDUL_GAME}}
- Tempat petualangan: {{DUNIA_GAME}}
- Waktu: {{WAKTU_GAMBAR}}
- Rintangan yang ingin ada: {{RINTANGAN}}

## 1. PERTAHANKAN IDE ASLI ANAK
Gunakan gambar yang saya unggah sebagai referensi utama.
- Pertahankan semua elemen penting yang digambar anak.
- Pertahankan susunan dan posisi relatif objek, seperti gunung, pohon, sungai, danau, jalan, jembatan, rumah, gua, atau objek lainnya.
- Jangan mengganti konsep dunia dengan ide yang berbeda.
- Jika bentuk gambar masih sederhana, kembangkan menjadi objek 3D yang lebih menarik tanpa menghilangkan ciri khas aslinya.
- Jika terdapat bagian yang tidak jelas, gunakan interpretasi kreatif yang masuk akal dan tetap sesuai dengan sketsa.
- Jangan menambahkan terlalu banyak objek baru yang mengubah ide utama anak.

Tujuannya adalah membuat gambar anak terlihat seperti dunia game sungguhan, tetapi anak tetap dapat mengenali hasil karyanya.

## 2. UBAH MENJADI ENVIRONMENT GAME 3D
Kembangkan sketsa menjadi lingkungan game 3D bergaya stylized, colorful, playful, dan family-friendly.
Gunakan:
- Objek 3D dengan bentuk yang jelas dan mudah dikenali.
- Pepohonan dengan volume dan dedaunan yang menarik.
- Gunung, bukit, bebatuan, dan tanah dengan kedalaman yang nyata.
- Air sungai atau danau dengan material yang sesuai jika terdapat air pada sketsa.
- Rumput, jalur tanah, jembatan, atau objek lingkungan lain sesuai referensi.
- Pencahayaan alami yang indah dan konsisten.
- Warna yang harmonis serta mudah dibedakan.
- Detail lingkungan yang cukup kaya, tetapi tidak berlebihan.

Gunakan gaya visual 3D yang cocok untuk game petualangan anak, bukan fotorealisme yang terlalu kompleks.

## 3. TAMPILAN DESAIN DUNIA GAME
Buat satu gambar utama yang memperlihatkan dunia game secara keseluruhan dari sudut pandang tiga perempat atau elevated isometric view.
Ketentuannya:
- Seluruh area utama terlihat jelas.
- Bentuk dan hubungan posisi antarobjek mudah dipahami.
- Gunung, pepohonan, sungai, jalur, dan objek utama tidak saling menutupi secara berlebihan.
- Tampilkan kedalaman foreground, middle ground, dan background.
- Gunakan pencahayaan yang membantu memperlihatkan bentuk lingkungan.
- Jangan menambahkan karakter, musuh, teks, atau antarmuka game kecuali saya memintanya.
- Jangan memotong objek utama di tepi gambar.

Gambar ini harus berfungsi sebagai environment concept art yang dapat dipakai untuk merencanakan level game 3D.

## 4. PERTIMBANGKAN KEBUTUHAN GAMEPLAY
Susun lingkungan agar berpotensi digunakan dalam game 3D.
Jika sesuai dengan sketsa, buat:
- Area yang dapat dilalui karakter.
- Jalur eksplorasi yang mudah dikenali.
- Area terbuka untuk bergerak dan berinteraksi.
- Rintangan alami seperti batu, batang pohon, jurang, atau sungai.
- Landmark yang membantu pemain mengenali lokasi.
- Rintangan yang disebutkan di bagian TENTANG DUNIA GAME, selama sesuai dengan sketsa.
- Area menarik yang berpotensi menjadi tempat tujuan atau checkpoint.

Jangan membuat semua permukaan hanya sebagai dekorasi. Bedakan secara visual antara area yang berpotensi dilalui pemain dan objek yang berfungsi sebagai latar belakang.

Namun, jangan mengarang mekanik permainan yang belum saya tentukan. Desain harus tetap berpusat pada sketsa anak.

## 5. KESIAPAN UNTUK PEMBUATAN ASET GAME
Rancang lingkungan dengan mempertimbangkan proses produksi aset 3D.
- Utamakan bentuk geometris yang dapat dimodelkan.
- Buat objek lingkungan dengan siluet yang jelas.
- Gunakan material yang mudah dibedakan.
- Pertimbangkan pemisahan aset seperti terrain, pohon, batu, air, jembatan, dan objek dekoratif.
- Hindari detail kecil yang tidak diperlukan untuk gameplay.
- Usahakan objek dapat dibuat sebagai aset modular jika sesuai.

Jangan mengklaim bahwa gambar yang dihasilkan sudah menjadi terrain mesh, model 3D, collision mesh, navigasi, atau level game yang dapat langsung dijalankan.

## 6. STANDAR VISUAL
Gunakan standar berikut:
- High-quality stylized 3D game environment.
- Colorful, imaginative, polished, dan ramah anak.
- Bentuk objek jelas dan proporsional.
- Pencahayaan alami dengan bayangan lembut.
- Material 3D yang terlihat nyata tetapi tetap bergaya kartun.
- Komposisi bersih dan mudah dipahami.
- Resolusi tinggi dan detail yang cukup untuk referensi produksi.
- Tanpa watermark, teks dekoratif, atau elemen yang tidak relevan.

Sesuaikan palet warna dengan ide gambar asli dan suasana dunia yang digambarkan anak.

## 7. OUTPUT YANG DIHARAPKAN
Hasilkan gambar environment concept art 3D yang:
1. Mempertahankan ide asli anak.
2. Mengubah sketsa sederhana menjadi dunia game 3D yang menarik.
3. Memperjelas bentuk, ukuran relatif, kedalaman, dan posisi objek.
4. Dapat digunakan sebagai referensi untuk membuat aset dan level game.
5. Tetap realistis untuk dikembangkan menjadi game oleh anak dengan bantuan AI.

Jika detail tertentu sulit diperlihatkan dalam satu sudut pandang, prioritaskan gambar utama yang jelas terlebih dahulu. Referensi tambahan dapat dibuat pada tahap berikutnya.

## 8. INSTRUKSI AKHIR
Analisis gambar yang saya unggah sebelum membuat desain. Identifikasi objek utama, posisi relatif, bentuk lingkungan, dan karakteristik dunia yang ingin dibuat anak.

Kemudian kembangkan sketsa tersebut menjadi dunia game 3D yang indah tanpa menghilangkan ide aslinya.

**Prioritas tertinggi: kesetiaan pada sketsa anak, keterbacaan lingkungan, kualitas visual, dan kemudahan pengembangan menjadi level game 3D.**

Mulailah dengan membuat gambar environment concept art 3D berdasarkan gambar yang saya unggah.
TXT,

];
