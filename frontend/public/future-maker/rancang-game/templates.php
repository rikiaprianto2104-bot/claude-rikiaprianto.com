<?php
/*
  TEMPLATES.PHP  |  Isi 3 template prompt untuk halaman hasil Rancang Game.
  Dibaca oleh api.php (bukan dibuka langsung). Ganti teksnya kapan saja; yang
  ditulis {{SEPERTI_INI}} diisi otomatis dari jawaban formulir.

  game      -> prompt untuk Claude (membuat game 3D)         sumber: PromptClaude.md
  karakter  -> prompt ChatGPT gambar tokoh utama DAN musuh   sumber: PROMPT CHAT GPT.docx
  dunia     -> prompt ChatGPT gambar dunia game              sumber: PROMPT CHAT GPT.docx
*/
if (!defined('GAME_API')) { http_response_code(403); exit; }

return [

'game' => <<<'TXT'
# FUTURE MAKERS — CREATE MY OWN 3D GAME

## PERAN KAMU

Bertindaklah sebagai Senior 3D Game Developer, Game Designer, 3D Artist, Animator, Sound Designer, dan Programmer.

Buat game 3D yang benar-benar dapat dimainkan berdasarkan tiga gambar referensi dan ide anak di bawah ini.

Anak yang menggunakan prompt ini berusia 6–12 tahun dan sedang belajar membuat game. Karena itu, kerjakan secara mandiri, buat keputusan teknis sendiri, dan jangan mengajukan pertanyaan tambahan kecuali benar-benar diperlukan.

Jangan hanya memberikan tutorial atau potongan kode. Bangun game yang dapat dijalankan, sediakan file proyek, dan tampilkan preview jika lingkunganmu mendukungnya.

## BAGIAN 1 — GAMBAR REFERENSI

Saya akan mengunggah tiga gambar:

- GAMBAR 1: Tokoh utama (Hero).
- GAMBAR 2: Tokoh musuh (Enemy).
- GAMBAR 3: Dunia game (Game World).

Gunakan ketiga gambar sebagai referensi utama untuk game yang sama.

Pertahankan identitas visual karakter, bentuk, warna, aksesori, serta ciri khasnya. Kembangkan sketsa dunia menjadi lingkungan 3D yang dapat dijelajahi.

Jangan mengganti desain asli dengan karakter atau lingkungan generik. Jika gambar hanya berupa gambar tangan, buat representasi 3D yang mendekati desain tersebut.

Jika model 3D asli belum tersedia, gunakan geometri 3D, material, dan animasi prosedural untuk menghasilkan representasi yang sesuai.

## BAGIAN 2 — IDE GAME SAYA

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

Kembangkan informasi ini menjadi cerita dan gameplay yang menarik.

Buat pembukaan yang menjelaskan masalah, perjalanan melewati rintangan, interaksi dengan musuh, serta penyelesaian yang sesuai dengan tujuan anak.

Jika ada informasi yang belum ditentukan, lengkapi sendiri secara kreatif. Jangan mengubah nama dan kekuatan yang sudah ditentukan atau mengabaikan ide utama anak.

## BAGIAN 3 — RANCANG DAN BANGUN GAME

Tentukan gameplay yang paling cocok dengan gambar dan cerita. Game dapat berupa petualangan 3D, platformer 3D, eksplorasi, atau pertarungan sederhana.

Buat game dengan fitur berikut:

1. Halaman awal dengan judul game dan tombol Mulai.
2. Dunia 3D sesuai gambar ketiga.
3. Tokoh utama dan musuh sesuai gambar pertama dan kedua.
4. Kamera yang nyaman mengikuti pemain.
5. Gerakan karakter, lompatan, dan animasi yang sesuai.
6. Kekuatan spesial yang dapat digunakan pemain.
7. Rintangan dan interaksi yang sesuai dengan dunia game.
8. Musuh yang memiliki perilaku dan dapat berinteraksi dengan pemain.
9. Sistem kesehatan atau nyawa yang jelas.
10. Tujuan permainan dan kondisi menang.
11. Kondisi kalah serta tombol bermain kembali.
12. Efek visual yang menarik dan sesuai dengan kekuatan karakter.
13. Musik latar dan efek suara.
14. Antarmuka yang ramah anak.

Jangan membuat dunia kosong tanpa tujuan. Pemain harus mengetahui apa yang perlu dilakukan untuk menyelesaikan game.

Sesuaikan kompleksitas game agar realistis untuk dikembangkan dan tetap menyenangkan dimainkan.

## BAGIAN 4 — KONTROL

Game harus mendukung komputer dan perangkat mobile.

**Komputer**
- WASD atau tombol panah untuk bergerak.
- Spasi untuk melompat.
- Tombol serang atau kemampuan khusus sesuai gameplay.
- Mouse untuk menu jika diperlukan.

**HP dan tablet**
- Joystick virtual atau tombol arah.
- Tombol lompat.
- Tombol serang atau kemampuan khusus.
- Tombol jeda.

Gunakan tombol yang mudah dipahami, cukup besar untuk layar sentuh, dan tidak menutupi area permainan yang penting.

Pastikan input keyboard dan layar sentuh bekerja dengan baik.

## BAGIAN 5 — GRAFIS DAN AUDIO

Gunakan HTML, CSS, dan JavaScript dengan Three.js atau teknologi WebGL yang sesuai untuk membangun game 3D.

Buat gaya visual 3D stylized yang menarik, penuh warna, konsisten, dan sesuai dengan desain anak.

Gunakan pencahayaan, material, bayangan, efek partikel, serta animasi lingkungan sesuai kebutuhan.

Tambahkan musik dan efek suara untuk tindakan penting, seperti melompat, menyerang, menggunakan kekuatan, menerima kerusakan, menang, dan kalah.

Sediakan kontrol suara. Tangani aturan autoplay browser dengan benar.

Utamakan performa yang baik pada komputer dan HP. Jika dibutuhkan, sederhanakan detail lingkungan dan efek tanpa menghilangkan ciri khas gambar.

## BAGIAN 6 — TEKNIS DAN FILE

Buat proyek yang dapat dijalankan melalui browser.

Gunakan struktur file yang sederhana dan mudah dikelola, misalnya:
- index.html
- style.css
- game.js
- Folder assets jika diperlukan.

Gunakan library dan aset yang benar-benar tersedia. Jangan mengandalkan file yang belum dibuat atau URL aset yang tidak valid.

Jika memungkinkan, sediakan proyek dalam ZIP agar mudah diunduh.

Jelaskan cara menjalankan game dengan bahasa sederhana. Jika proyek memerlukan server lokal atau koneksi internet, jelaskan secara singkat.

Jangan menjanjikan bahwa satu file HTML dapat berjalan sepenuhnya offline jika game masih menggunakan dependensi eksternal.

## BAGIAN 7 — PENGUJIAN

Sebelum menyatakan game selesai, periksa fungsi utama:

- Game dapat dimulai.
- Karakter dapat bergerak dan melompat.
- Kamera dan collision bekerja.
- Kekuatan spesial dapat digunakan.
- Musuh dan rintangan berfungsi.
- Kondisi menang dan kalah dapat dicapai.
- Tombol menu, jeda, dan suara bekerja.
- Kontrol mobile dan keyboard berfungsi.
- Tampilan menyesuaikan ukuran layar.

Lakukan pengujian jika lingkungan mendukungnya. Jangan menyatakan suatu fitur telah diuji jika belum benar-benar diuji.

Jika ada fitur yang gagal, perbaiki atau gunakan alternatif yang masuk akal sebelum menyelesaikan proyek.

## BAGIAN 8 — HASIL AKHIR

Saya ingin mendapatkan game 3D yang dapat dimainkan, bukan hanya gambar atau konsep.

Selesaikan implementasi sebanyak mungkin dalam lingkungan yang tersedia. Jika didukung, tampilkan preview dan sediakan seluruh file yang dibutuhkan untuk menjalankan game.

Berikan petunjuk penggunaan singkat untuk anak.

Jangan berhenti pada tahap perencanaan. Ambil keputusan kreatif dan teknis yang diperlukan secara mandiri.

**Mulailah dengan menganalisis ketiga gambar dan ide game saya, lalu langsung bangun game 3D yang menarik dan dapat dimainkan.**
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
