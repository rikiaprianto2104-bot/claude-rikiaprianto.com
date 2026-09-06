// Mock data for Riki MarkeThink's portfolio website

export const profile = {
  name: 'Riki MarkeThink',
  shortName: 'Riki MarkeThink',
  title: 'AI Marketing Strategist',
  shortBio: 'AI Marketing Strategist focused on data-driven strategies and measurable results.',
  greeting: "Hello, I'm",
  heroDescription:
    'Passionate about creating data-driven marketing strategies that deliver measurable results. Specializing in SEO and GEO, content marketing, and digital analytics.',
  about:
    "Experienced AI Marketing Strategist with a demonstrated history of working in the marketing and advertising industry. Skilled in SEO and GEO, content marketing, social media strategy, and data analytics. Strong marketing professional with a focus on ROI-driven campaigns.",
  email: 'riki.markethink@rikiaprianto.com',
  phone: '+62 888 0923 4347',
  location: 'Indonesia',
  // Personal portraits (served from /public/assets so they get bundled in the build)
  avatar: '/assets/riki-profile.jpg',
  heroPortrait: '/assets/home-portrait.jpg',
  researchPortrait: '/assets/research-portrait.jpg',
};

export const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Blog', path: '/blog' },
  { label: 'Profile', path: '/profile' },
  { label: 'Research', path: '/research' },
  { label: 'My Projects', path: '/projects' },
  { label: 'Contact', path: '/contact' },
];

export const skills = [
  { name: 'SEO & GEO Optimization', level: 95 },
  { name: 'Content Marketing', level: 90 },
  { name: 'Data Analytics', level: 88 },
  { name: 'Social Media Strategy', level: 85 },
  { name: 'AI Marketing Tools', level: 92 },
  { name: 'Marketing Automation', level: 80 },
];

export const experiences = [
  {
    role: 'IT Manager',
    badge: 'Current',
    period: 'Oct 2023 - Present',
    location: 'Yogyakarta',
    company: null,
    description:
      "I am responsible for overseeing the development process of the Warehouse System by a third-party vendor to ensure it meets business needs and company standards, coordinating with the warehouse team to gather system requirements while ensuring the vendor understands the operational flow correctly. In addition, I monitor project progress, from reviewing designs, features, and timelines to testing the vendor's work. I also compile requirements documentation, provide technical input, and ensure that the system is ready to be implemented and used by the operations team.",
  },
  {
    role: 'Graphic Designer',
    period: 'May 2023 - Oct 2023',
    location: 'Arcadia by Horison Mangga Dua Hotel, Jakarta',
    description:
      'I design various visual needs for hotels, such as flyers, posters, restaurant menus, digital banners, and promotional materials in accordance with hotel branding standards. I also manage and develop hotel social media content (Instagram, Facebook, TikTok), from content creation and scheduling to copywriting.',
  },
  {
    role: 'Graphic Designer Freelancer',
    period: 'Jan 2022 - Mar 2024',
    location: "Yayasan Kitabati Samudra Al-Qur'an, Jakarta",
    description:
      'I designed the layout of the Al-Quran manuscript, including the text layout, margins, surah headings, and aesthetic elements in accordance with the rules of Al-Quran writing, as well as creating and developing ornaments, motifs, and decorative illustrations.',
  },
  {
    role: 'President Director',
    period: 'Sep 2022 - May 2023',
    location: 'PT Arto Cipta Solusindo, Jakarta',
    description:
      'I lead and manage all company operations, from strategic planning and service development to creative team management, as well as overseeing the graphic design production process to ensure visual quality, timeliness, and suitability to client needs.',
  },
  {
    role: 'Operator Produksi',
    period: 'Aug 2018 - May 2022',
    location: 'RS Bordir Komputer',
    description:
      'I operate computerized embroidery machines accurately according to the design and specifications of the order, performing initial machine settings such as threading, needle selection, speed determination, and embroidery area settings.',
  },
];

export const education = [
  {
    degree: 'Master of Management (Cand M.M.)',
    badge: 'Current',
    period: '2025 - Present',
    school: 'UPN "Veteran" Yogyakarta',
    description:
      'Continuing higher education to deepen strategic management and business leadership skills.',
  },
  {
    degree: 'Bachelor of Management (S.M.)',
    period: '2019 - 2023',
    school: 'Universitas Dian Nusantara',
    description:
      'Focused on marketing management, organizational behavior, and business strategy.',
  },
];

export const organizations = [
  {
    role: 'Chairman of the Management Student Association (HMM)',
    period: '2020 - 2021',
    org: 'Universitas Dian Nusantara',
    description:
      'Led the student association, organized various academic and non-academic events, and represented the student body in university forums.',
  },
];

export const achievements = [
  {
    title: 'Best Graduate 2023',
    year: 2023,
    description:
      'Awarded as the best graduate for academic excellence and active involvement in campus activities.',
    link: 'https://undira.ac.id/read/115/',
    image:
      '/assets/best-graduate-2023.jpg',
  },
  {
    title: 'Runner Up LKTIN RWrC#10 UNY',
    year: 2023,
    description:
      'Achieved second place in a national scientific writing competition held by a prominent state university.',
    link: 'https://undira.ac.id/read/53/',
    image:
      '/assets/lktin-rwrc10-2nd-place-2023.jpg',
  },
  {
    title: 'P2MW Participant',
    year: 2022,
    description:
      'Selected as a participant in the Student Entrepreneurship Program (P2MW) by the Ministry of Education and Culture.',
    link: 'https://www.instagram.com/p/CmVvEVmBLCf/',
    image:
      '/assets/p2mw-ministry-of-education-2022.jpg',
  },
  {
    title: '3rd Place LKTIN ACCFEST IKOPIN',
    year: 2022,
    description:
      'Secured third place in a national scientific writing competition focused on accounting and finance.',
    link: 'https://www.instagram.com/p/CXi4kM3vnGM/',
    image:
      '/assets/lktin-accfest-ikopin-3rd-place-2022.jpg',
  },
  {
    title: 'Gold Medal TEC UNJ',
    year: 2021,
    description:
      'Awarded a gold medal in the Technology Entrepreneurship Competition (TEC) organized by a leading university.',
    link: 'https://www.instagram.com/p/CWfPcpnLsxv/',
    image:
      '/assets/gold-medal-unj.jpg',
  },
  {
    title: 'KIBM Participant',
    year: 2020,
    description:
      'Participated in the Indonesian Student Entrepreneurship Competition (KIBM) program.',
    link: 'https://www.instagram.com/tv/CGi4i5UASMh/',
    image:
      '/assets/kibm-ministry-of-education-2020.jpg',
  },
];

export const skillsCompetencies = [
  { name: 'SEO, GEO & SEM', level: 95 },
  { name: 'Google Analytics', level: 92 },
  { name: 'Content Marketing', level: 90 },
  { name: 'Data Analysis', level: 90 },
  { name: 'Social Media Marketing', level: 88 },
  { name: 'AI Digital Marketing', level: 87 },
  { name: 'Artificial Intelligence', level: 85 },
  { name: 'Marketing Automation', level: 83 },
];

export const blogPosts = [
  {
    id: 4,
    slug: 'prompt-hacks-ai-template-promosi-customer-service',
    title:
      'Prompt Hacks AI: Template Prompt untuk Membuat Konten Bisnis Lebih Cepat dan Menarik',
    metaTitle:
      'Prompt Hacks AI: Template Prompt untuk Deskripsi Produk, Video Promosi, dan Customer Service',
    excerpt:
      'Pelajari prompt hacks AI yang bisa digunakan untuk membuat deskripsi produk, skrip video promosi, dan balasan customer service secara cepat, menarik, dan profesional.',
    date: 'Jun 18, 2026',
    dateISO: '2026-06-18',
    readTime: '10 min read',
    tag: 'AI untuk Bisnis',
    image: '/assets/blog-prompt-hacks-ai.jpg',
    keywords: [
      'prompt hacks AI',
      'template prompt AI',
      'prompt untuk deskripsi produk',
      'prompt AI untuk promosi',
      'prompt customer service AI',
      'cara menggunakan AI untuk bisnis',
      'AI marketing',
      'digital marketing',
    ],
    author: {
      name: 'Riki MarkeThink',
      role: 'AI Marketing Strategist',
    },
  },
  {
    id: 1,
    slug: 'manipulasi-review-rating-google-maps-etika-bisnis',
    title:
      'Manipulasi Review dan Rating di Google Maps: Persoalan Etika Bisnis dalam Kepercayaan Digital',
    excerpt:
      'Artikel ini membahas praktik manipulasi review dan rating di Google Maps sebagai persoalan etika bisnis yang memengaruhi kepercayaan konsumen, reputasi digital, dan persaingan usaha yang sehat.',
    date: 'Jun 17, 2026',
    dateISO: '2026-06-17',
    readTime: '7 min read',
    tag: 'Etika Bisnis',
    image:
      '/assets/blog-featured-google-maps.jpg',
    keywords: [
      'etika bisnis',
      'manipulasi review',
      'fake review',
      'google maps',
      'rating google',
      'reputasi digital',
      'kepercayaan konsumen',
      'etika pemasaran',
      'ulasan palsu',
      'bisnis digital',
    ],
    author: {
      name: 'Riki MarkeThink',
      role: 'AI Marketing Strategist',
    },
  },
  {
    id: 2,
    slug: 'geo-reshaping-search-2026',
    title: 'How GEO is Reshaping Search in 2026',
    excerpt:
      'Generative Engine Optimization (GEO) menjadi frontier baru dalam dunia pencarian digital. Seiring berkembangnya AI seperti ChatGPT, Gemini, Claude, dan Perplexity, cara pengguna menemukan informasi mengalami perubahan besar.',
    date: 'May 02, 2026',
    dateISO: '2026-05-02',
    readTime: '6 min read',
    tag: 'GEO',
    image:
      '/assets/blog-geo-search.jpg',
    keywords: [
      'GEO',
      'Generative Engine Optimization',
      'AI search',
      'SEO',
      'ChatGPT',
      'Gemini',
      'Perplexity',
      'digital marketing',
      'search engine',
      'answer engine',
    ],
    author: {
      name: 'Riki MarkeThink',
      role: 'AI Marketing Strategist',
    },
  },
  {
    id: 3,
    slug: 'ai-content-workflows',
    title: 'A Practical Framework for AI-Assisted Content Workflows',
    excerpt:
      'Panduan praktis mengintegrasikan AI ke dalam workflow konten. Pelajari delapan tahap kolaborasi manusia dan AI agar produksi konten menjadi lebih cepat, relevan, dan tetap berkualitas tinggi.',
    date: 'Apr 18, 2026',
    dateISO: '2026-04-18',
    readTime: '8 min read',
    tag: 'AI Marketing',
    image:
      '/assets/blog-ai-workflows.jpg',
    keywords: [
      'AI marketing',
      'content workflow',
      'LLM',
      'ChatGPT',
      'content strategy',
      'editorial pipeline',
      'SEO',
      'GEO',
      'AI content',
      'workflow framework',
    ],
    author: {
      name: 'Riki MarkeThink',
      role: 'AI Marketing Strategist',
    },
  },
];

// Full article content keyed by slug.
// Each section has id (used for TOC and anchor), heading, and a list of blocks.
// Block types: 'p' (paragraph), 'list', 'ol', 'quote', 'highlight', 'image', 'h3'.
export const blogContent = {
  'prompt-hacks-ai-template-promosi-customer-service': {
    intro:
      'Di era digital saat ini, penggunaan Artificial Intelligence (AI) semakin banyak membantu pelaku bisnis dalam membuat konten. Mulai dari menulis deskripsi produk, membuat skrip video promosi, menyusun caption media sosial, hingga membalas pesan pelanggan — semuanya bisa dilakukan dengan lebih cepat menggunakan AI. Namun, hasil dari AI sangat bergantung pada cara kita memberikan perintah atau yang biasa disebut prompt. Semakin jelas dan spesifik prompt yang diberikan, semakin baik pula hasil yang akan dihasilkan oleh AI. Artikel ini membahas berbagai prompt hacks AI dan template prompt yang bisa digunakan untuk kebutuhan bisnis, terutama untuk membuat deskripsi produk, skrip video promosi, dan balasan customer service.',
    sections: [
      {
        id: 'apa-itu-prompt',
        title: 'Apa Itu Prompt dalam AI?',
        blocks: [
          {
            type: 'p',
            text: 'Prompt adalah instruksi atau perintah yang kita berikan kepada AI agar AI memahami apa yang ingin kita hasilkan. Prompt yang umum digunakan biasanya masih sangat sederhana, padahal hasil AI akan jauh lebih baik jika prompt-nya lebih detail.',
          },
          {
            type: 'example',
            title: 'Contoh Prompt yang Lebih Baik',
            text: '"Buatkan deskripsi produk untuk blouse wanita berbahan katun premium, warna putih, cocok untuk kerja dan acara santai. Gunakan gaya bahasa elegan, persuasif, dan maksimal 100 kata."',
          },
          {
            type: 'p',
            text: 'Dengan prompt yang lebih detail, AI akan lebih mudah memahami konteks, target audiens, gaya bahasa, manfaat produk, dan tujuan konten.',
          },
        ],
      },
      {
        id: 'mengapa-penting',
        title: 'Mengapa Prompt Hacks Penting untuk Bisnis?',
        blocks: [
          {
            type: 'p',
            text: 'Banyak pelaku bisnis sudah menggunakan AI, tetapi belum semua mendapatkan hasil yang maksimal. Salah satu penyebabnya adalah prompt yang digunakan masih terlalu singkat dan kurang jelas. Padahal dengan prompt hacks yang tepat, AI dapat memberikan banyak manfaat bagi bisnis.',
          },
          {
            type: 'list',
            items: [
              'Menghemat waktu pembuatan konten karena AI membantu membuat draft dalam hitungan detik.',
              'Meningkatkan kualitas komunikasi bisnis melalui teks yang lebih rapi, persuasif, dan sesuai karakter brand.',
              'Membantu meningkatkan penjualan karena deskripsi, caption, dan skrip promosi menjadi lebih menarik.',
              'Mempercepat respon customer service dengan balasan yang sopan, profesional, dan tetap ramah.',
              'Menjaga konsistensi gaya bahasa brand di berbagai platform digital.',
            ],
          },
        ],
      },
      {
        id: 'struktur-prompt',
        title: 'Struktur Prompt yang Efektif',
        blocks: [
          {
            type: 'p',
            text: 'Agar hasil AI lebih sesuai dengan kebutuhan, gunakan struktur prompt berikut sebagai panduan.',
          },
          { type: 'h3', text: '1. Jelaskan Peran AI' },
          {
            type: 'p',
            text: 'Berikan peran tertentu kepada AI agar jawaban yang dihasilkan lebih terarah, misalnya: "Bertindaklah sebagai copywriter profesional untuk brand fashion wanita."',
          },
          { type: 'h3', text: '2. Jelaskan Tujuan Konten' },
          {
            type: 'p',
            text: 'Tentukan tujuan utama dari konten yang ingin dibuat, misalnya meningkatkan minat beli pelanggan atau memperkuat brand awareness.',
          },
          { type: 'h3', text: '3. Jelaskan Produk atau Layanan' },
          {
            type: 'p',
            text: 'Masukkan informasi detail mengenai produk, layanan, keunggulan, harga, bahan, ukuran, target pasar, atau manfaat utama.',
          },
          { type: 'h3', text: '4. Tentukan Target Audiens' },
          {
            type: 'p',
            text: 'AI perlu mengetahui siapa target pembaca atau calon pelanggan agar bahasa dan pesan yang digunakan lebih tepat.',
          },
          { type: 'h3', text: '5. Tentukan Gaya Bahasa' },
          {
            type: 'p',
            text: 'Gaya bahasa sangat penting agar konten sesuai dengan karakter brand, misalnya profesional, elegan, friendly, santai, atau premium.',
          },
          { type: 'h3', text: '6. Tentukan Format Output' },
          {
            type: 'p',
            text: 'Agar hasilnya rapi, tentukan format yang diinginkan, seperti 3 paragraf pendek, bullet point, tabel, headline, atau caption.',
          },
        ],
      },
      {
        id: 'template-deskripsi-produk',
        title: 'Template Prompt AI untuk Membuat Deskripsi Produk',
        blocks: [
          {
            type: 'p',
            text: 'Deskripsi produk yang baik tidak hanya menjelaskan fitur, tetapi juga menunjukkan manfaat dan alasan mengapa pelanggan perlu membelinya.',
          },
          {
            type: 'prompt',
            title: 'Template Prompt — Deskripsi Produk',
            text: `Bertindaklah sebagai copywriter e-commerce profesional. Buatkan deskripsi produk untuk [nama produk].

Detail produk:
- Jenis produk: [isi jenis produk]
- Bahan: [isi bahan produk]
- Warna: [isi warna produk]
- Keunggulan utama: [isi keunggulan]
- Target pembeli: [isi target audiens]
- Kesan yang ingin ditampilkan: [elegan/lucu/premium/minimalis/profesional]

Buat deskripsi produk yang menarik, persuasif, mudah dipahami, dan mendorong pembaca untuk membeli. Gunakan maksimal 150 kata. Tambahkan juga 3 bullet point keunggulan produk.`,
          },
          {
            type: 'example',
            title: 'Contoh Hasil Deskripsi Produk',
            text: `Luna Blouse hadir untuk Anda yang ingin tampil elegan tanpa mengorbankan kenyamanan. Dibuat dari bahan katun premium yang lembut dan adem, blouse ini cocok digunakan untuk aktivitas kerja, meeting, hingga acara santai bersama teman.

Dengan desain minimalis dan pilihan warna netral seperti putih, hitam, dan beige, Luna Blouse mudah dipadukan dengan berbagai outfit favorit Anda.

• Bahan katun premium yang nyaman dan tidak panas.
• Desain elegan untuk tampilan profesional.
• Cocok digunakan untuk kerja maupun acara santai.`,
          },
        ],
      },
      {
        id: 'template-skrip-video',
        title: 'Template Prompt AI untuk Membuat Skrip Video Promosi',
        blocks: [
          {
            type: 'p',
            text: 'Video promosi sangat efektif untuk menarik perhatian calon pelanggan, terutama di platform seperti TikTok, Instagram Reels, YouTube Shorts, dan Facebook. Skrip video yang baik biasanya memiliki hook, isi utama, dan call to action.',
          },
          {
            type: 'prompt',
            title: 'Template Prompt — Skrip Video Promosi',
            text: `Bertindaklah sebagai content strategist dan scriptwriter video pendek. Buatkan skrip video promosi untuk [nama produk/layanan].

Detail produk/layanan:
- Produk/layanan: [isi produk]
- Target audiens: [isi target audiens]
- Masalah audiens: [isi masalah]
- Solusi dari produk: [isi solusi]
- Keunggulan utama: [isi keunggulan]
- Platform: [TikTok/Instagram Reels/YouTube Shorts]
- Durasi video: [15/30/60 detik]

Buat skrip dengan struktur:
1. Hook pembuka yang menarik
2. Isi video yang menjelaskan masalah dan solusi
3. Call to Action di akhir

Gunakan bahasa yang natural, singkat, dan mudah dipahami.`,
          },
          {
            type: 'example',
            title: 'Contoh Hasil Skrip Video Promosi',
            text: `Hook: Kulit wajah terlihat kusam walaupun sudah pakai skincare setiap hari?

Isi: Mungkin kulit Anda butuh serum yang ringan, mudah menyerap, dan bisa membantu wajah terlihat lebih cerah. Glow Bright Serum hadir untuk membantu menjaga kelembapan kulit sekaligus membuat tampilan wajah lebih fresh dan sehat.

Call to Action: Coba Glow Bright Serum sekarang dan rasakan kulit yang tampak lebih cerah setiap hari. Klik link di bio untuk order.`,
          },
        ],
      },
      {
        id: 'template-customer-service',
        title: 'Template Prompt AI untuk Membuat Balasan Customer Service',
        blocks: [
          {
            type: 'p',
            text: 'Customer service adalah bagian penting dalam menjaga kepuasan pelanggan. AI dapat membantu membuat balasan yang sopan, ramah, dan sesuai konteks.',
          },
          {
            type: 'prompt',
            title: 'Template Prompt — Balasan Customer Service',
            text: `Bertindaklah sebagai customer service profesional untuk brand [nama brand]. Buatkan balasan untuk pelanggan dengan situasi berikut:

Situasi pelanggan: [jelaskan masalah pelanggan]

Tujuan balasan:
- Menjawab pertanyaan pelanggan dengan jelas
- Menunjukkan empati
- Memberikan solusi
- Menjaga pelanggan tetap merasa dihargai

Gunakan bahasa yang sopan, ramah, profesional, dan tidak terlalu kaku. Buat maksimal 2 paragraf.`,
          },
          {
            type: 'example',
            title: 'Contoh Hasil Balasan Customer Service',
            text: `Halo Kak, mohon maaf atas ketidaknyamanan yang Kakak alami. Kami memahami bahwa ukuran produk yang tidak sesuai tentu membuat pengalaman belanja menjadi kurang nyaman.

Kakak bisa mengajukan penukaran produk dengan mengirimkan foto produk, label ukuran, dan nomor pesanan melalui chat ini. Setelah data kami terima, tim kami akan membantu proses pengecekan dan memberikan instruksi penukaran selanjutnya.`,
          },
        ],
      },
      {
        id: 'prompt-caption',
        title: 'Prompt Hacks untuk Membuat Caption Media Sosial',
        blocks: [
          {
            type: 'prompt',
            title: 'Template Prompt — Caption Instagram',
            text: `Bertindaklah sebagai social media specialist. Buatkan caption Instagram untuk [nama produk/layanan].

Detail konten:
- Tujuan caption: [awareness/promosi/edukasi/soft selling/hard selling]
- Target audiens: [isi target audiens]
- Keunggulan produk: [isi keunggulan]
- Gaya bahasa: [friendly/profesional/elegan/santai]
- Call to Action: [isi CTA]

Buat caption yang menarik, tidak terlalu panjang, dan tambahkan 5 hashtag relevan.`,
          },
          {
            type: 'example',
            title: 'Contoh Hasil Caption',
            text: 'Tampil profesional bukan berarti harus ribet. Tas kerja ini hadir dengan desain elegan, ruang penyimpanan luas, dan cukup untuk membawa laptop, dokumen, serta kebutuhan harian Anda. Cocok untuk menemani aktivitas kerja, meeting, hingga perjalanan bisnis. Klik link di bio untuk lihat koleksi lengkapnya.',
          },
        ],
      },
      {
        id: 'prompt-ide-konten',
        title: 'Prompt Hacks untuk Membuat Ide Konten Harian',
        blocks: [
          {
            type: 'prompt',
            title: 'Template Prompt — Ide Konten Harian',
            text: `Bertindaklah sebagai content planner untuk brand [jenis bisnis]. Buatkan 30 ide konten Instagram untuk target audiens [target audiens].

Kategori konten harus mencakup:
- Edukasi
- Promosi
- Testimoni
- Behind the scene
- Tips praktis
- Soft selling

Buat dalam bentuk tabel dengan kolom: Hari, Tema Konten, Judul Konten, Format Konten, dan Tujuan Konten.`,
          },
        ],
      },
      {
        id: 'kesalahan-umum',
        title: 'Kesalahan Umum Saat Membuat Prompt AI',
        blocks: [
          {
            type: 'list',
            items: [
              'Prompt terlalu umum, misalnya hanya menulis: "Buatkan caption jualan."',
              'Tidak memberikan target audiens sehingga hasil tulisan kurang tepat sasaran.',
              'Tidak menentukan gaya bahasa sehingga output AI bisa terlalu formal atau terlalu santai.',
              'Tidak memberikan informasi produk yang cukup, seperti bahan, manfaat, harga, ukuran, dan keunggulan.',
              'Tidak meminta variasi hasil, padahal AI bisa membuat beberapa alternatif headline, caption, atau CTA.',
            ],
          },
        ],
      },
      {
        id: 'formula-prompt',
        title: 'Formula Prompt AI yang Bisa Digunakan untuk Banyak Kebutuhan',
        blocks: [
          {
            type: 'p',
            text: 'Gunakan formula universal ini sebagai kerangka untuk hampir semua kebutuhan konten bisnis.',
          },
          {
            type: 'prompt',
            title: 'Formula Universal Prompt AI',
            text: `Bertindaklah sebagai [peran]. Saya ingin membuat [jenis konten]. Tujuan konten ini adalah [tujuan]. Target audiensnya adalah [target audiens]. Produk/layanan yang dipromosikan adalah [detail produk/layanan]. Keunggulan utamanya adalah [keunggulan]. Gunakan gaya bahasa [gaya bahasa]. Buat dalam format [format output]. Tambahkan CTA [ajakan tindakan].`,
          },
        ],
      },
      {
        id: 'tips-hasil-bagus',
        title: 'Tips Agar Hasil AI Lebih Bagus',
        blocks: [
          {
            type: 'list',
            items: [
              'Gunakan instruksi yang jelas dan spesifik.',
              'Masukkan detail produk atau layanan selengkap mungkin.',
              'Tentukan gaya bahasa brand agar hasil lebih konsisten.',
              'Minta beberapa alternatif hasil agar memiliki lebih banyak pilihan.',
              'Edit ulang hasil AI sebelum dipublikasikan agar tetap sesuai fakta dan karakter brand.',
              'Gunakan AI sebagai asisten, bukan pengganti strategi bisnis.',
            ],
          },
        ],
      },
      {
        id: 'paket-prompt',
        title: 'Contoh Paket Prompt Siap Pakai untuk Bisnis',
        blocks: [
          { type: 'h3', text: 'Prompt untuk Headline Promosi' },
          {
            type: 'prompt',
            title: 'Headline Promosi',
            text: 'Buatkan 10 headline promosi untuk produk [nama produk]. Target audiensnya adalah [target audiens]. Gunakan gaya bahasa persuasif, singkat, dan menarik perhatian. Fokuskan pada manfaat utama produk yaitu [manfaat utama].',
          },
          { type: 'h3', text: 'Prompt untuk Soft Selling' },
          {
            type: 'prompt',
            title: 'Soft Selling',
            text: 'Buatkan konten soft selling untuk produk [nama produk]. Mulailah dengan masalah yang sering dialami target audiens, lalu jelaskan solusi secara natural tanpa terlihat terlalu menjual. Gunakan gaya bahasa edukatif dan ramah.',
          },
          { type: 'h3', text: 'Prompt untuk Hard Selling' },
          {
            type: 'prompt',
            title: 'Hard Selling',
            text: 'Buatkan copywriting hard selling untuk produk [nama produk]. Tekankan manfaat utama, promo terbatas, urgensi, dan ajakan membeli sekarang. Gunakan gaya bahasa persuasif tetapi tetap profesional.',
          },
          { type: 'h3', text: 'Prompt untuk Testimoni' },
          {
            type: 'prompt',
            title: 'Testimoni',
            text: 'Ubah testimoni pelanggan berikut menjadi konten promosi yang menarik: [masukkan testimoni]. Buat dalam gaya bahasa natural, meyakinkan, dan cocok untuk caption Instagram.',
          },
          { type: 'h3', text: 'Prompt untuk FAQ Produk' },
          {
            type: 'prompt',
            title: 'FAQ Produk',
            text: 'Buatkan daftar FAQ untuk produk [nama produk]. Sertakan pertanyaan yang sering ditanyakan pelanggan mengenai harga, ukuran, bahan, cara pemakaian, pengiriman, garansi, dan proses pemesanan. Berikan jawaban yang jelas dan ramah.',
          },
        ],
      },
      {
        id: 'faq',
        title: 'FAQ Seputar Prompt Hacks AI',
        blocks: [
          { type: 'h3', text: '1. Apakah AI bisa menggantikan copywriter?' },
          {
            type: 'p',
            text: 'AI dapat membantu mempercepat pekerjaan copywriter, tetapi tidak sepenuhnya menggantikan peran manusia. Copywriter tetap dibutuhkan untuk memahami strategi, emosi pelanggan, positioning brand, dan memastikan konten sesuai tujuan bisnis.',
          },
          { type: 'h3', text: '2. Apakah prompt AI harus panjang?' },
          {
            type: 'p',
            text: 'Tidak selalu. Prompt tidak harus panjang, tetapi harus jelas. Prompt yang singkat namun spesifik biasanya lebih efektif daripada prompt panjang tetapi tidak terarah.',
          },
          { type: 'h3', text: '3. Apakah hasil AI bisa langsung dipublikasikan?' },
          {
            type: 'p',
            text: 'Sebaiknya hasil AI tetap diperiksa dan diedit sebelum dipublikasikan. Pastikan informasi produk benar, tidak berlebihan, tidak menyesatkan, dan sesuai karakter brand.',
          },
          { type: 'h3', text: '4. Bisnis apa saja yang bisa menggunakan prompt AI?' },
          {
            type: 'p',
            text: 'Hampir semua bisnis bisa menggunakan prompt AI, seperti fashion, makanan, skincare, jasa digital, pendidikan, properti, hospitality, retail, dan UMKM.',
          },
          { type: 'h3', text: '5. Apa prompt terbaik untuk membuat konten promosi?' },
          {
            type: 'p',
            text: 'Prompt terbaik adalah prompt yang menjelaskan produk, target audiens, tujuan konten, manfaat utama, gaya bahasa, dan format output yang diinginkan.',
          },
        ],
      },
    ],
    conclusion:
      'Prompt hacks AI dapat membantu bisnis membuat konten dengan lebih cepat, rapi, dan efektif. Dengan prompt yang tepat, AI bisa digunakan untuk membuat deskripsi produk, skrip video promosi, caption media sosial, ide konten, hingga balasan customer service. Kunci utama dalam menggunakan AI adalah memberikan instruksi yang jelas, spesifik, dan sesuai dengan tujuan bisnis. Semakin lengkap informasi yang diberikan, semakin baik pula hasil yang dihasilkan oleh AI. Namun, AI tetap perlu digunakan secara bijak. Jadikan AI sebagai asisten untuk mempercepat proses kreatif, sementara strategi, validasi, dan keputusan akhir tetap berada di tangan manusia.',
    cta:
      'Ingin membuat konten bisnis lebih cepat dan profesional dengan bantuan AI? Mulailah gunakan template prompt di atas untuk membuat deskripsi produk, skrip video promosi, caption media sosial, dan balasan customer service yang lebih menarik. Gunakan AI bukan hanya untuk membuat konten lebih cepat, tetapi juga untuk membantu bisnis Anda tampil lebih konsisten, relevan, dan dipercaya oleh pelanggan.',
  },

  'manipulasi-review-rating-google-maps-etika-bisnis': {
    intro:
      'Di era digital, reputasi bisnis tidak hanya dibangun dari kualitas produk atau pelayanan secara langsung, tetapi juga dari jejak digital yang terlihat oleh calon konsumen. Salah satu bentuk jejak digital yang sangat berpengaruh adalah review dan rating di Google Maps. Sebelum seseorang memilih restoran, hotel, bengkel, klinik, toko, atau jasa tertentu, banyak dari mereka melihat rating bintang, membaca komentar pelanggan, lalu menjadikannya sebagai dasar keputusan.',
    inlineImage: {
      src: '/assets/blog-featured-google-maps.jpg',
      caption:
        'Ilustrasi tampilan ulasan bisnis di Google Maps yang menjadi dasar keputusan konsumen.',
    },
    sections: [
      {
        id: 'fenomena',
        title: 'Fenomena Manipulasi Review di Google Maps',
        blocks: [
          {
            type: 'p',
            text: 'Manipulasi review menjadi praktik yang semakin umum dilakukan oleh pelaku usaha tertentu demi mendongkrak reputasi digital mereka. Bentuk-bentuk manipulasinya antara lain:',
          },
          {
            type: 'list',
            items: [
              'Membeli review bintang lima dari penyedia jasa ulasan.',
              'Meminta karyawan atau keluarga menulis ulasan positif tanpa pengalaman nyata.',
              'Memberi imbalan agar pelanggan menulis review dengan narasi tertentu.',
              'Menekan pelanggan agar menghapus ulasan negatif.',
              'Membuat review negatif palsu untuk menjatuhkan kompetitor.',
            ],
          },
          {
            type: 'p',
            text: 'Google secara tegas melarang fake engagement dan mewajibkan review mencerminkan pengalaman nyata pengguna. Pelanggaran terhadap kebijakan ini dapat berakibat penghapusan ulasan hingga pembatasan profil bisnis.',
          },
        ],
      },
      {
        id: 'etika-bisnis',
        title: 'Mengapa Termasuk Pelanggaran Etika Bisnis?',
        blocks: [
          {
            type: 'p',
            text: 'Praktik manipulasi review melanggar prinsip dasar etika bisnis, khususnya kejujuran (honesty) dan transparansi (transparency). Ada tiga alasan mendasar mengapa praktik ini tergolong tidak etis:',
          },
          {
            type: 'ol',
            items: [
              'Mengganggu hak konsumen untuk memperoleh informasi yang benar dan akurat sebelum mengambil keputusan.',
              'Menciptakan persaingan usaha yang tidak sehat antara bisnis jujur dan bisnis yang merekayasa reputasi.',
              'Merusak integritas ekosistem informasi digital secara keseluruhan.',
            ],
          },
          {
            type: 'quote',
            text: 'Reputasi yang dibangun dari informasi palsu merupakan bentuk ketidakjujuran digital yang berpotensi menyesatkan publik.',
          },
        ],
      },
      {
        id: 'dampak',
        title: 'Dampak bagi Konsumen dan Bisnis',
        blocks: [
          {
            type: 'p',
            text: 'Dampak manipulasi review terjadi dua arah dan menimbulkan kerugian yang signifikan:',
          },
          {
            type: 'h3',
            text: 'Bagi Konsumen',
          },
          {
            type: 'p',
            text: 'Konsumen dapat mengambil keputusan yang salah karena mempercayai rating yang tidak autentik. Pengalaman aktual sering kali jauh berbeda dengan ekspektasi yang dibangun dari ulasan palsu, sehingga menimbulkan kekecewaan, kerugian materi, bahkan hilangnya kepercayaan terhadap platform digital secara umum.',
          },
          {
            type: 'h3',
            text: 'Bagi Pelaku Usaha',
          },
          {
            type: 'p',
            text: 'Pelaku usaha yang membangun reputasi secara jujur dapat dirugikan karena kalah bersaing dengan bisnis yang memanipulasi persepsi digital. Hal ini menciptakan disinsentif bagi pelaku usaha yang berinvestasi pada kualitas produk dan pelayanan sesungguhnya.',
          },
        ],
      },
      {
        id: 'regulasi',
        title: 'Perspektif Regulasi',
        blocks: [
          {
            type: 'p',
            text: 'Manipulasi review tidak hanya melanggar etika, tetapi juga menyentuh aspek regulasi. Beberapa langkah penegakan yang telah dilakukan antara lain:',
          },
          {
            type: 'list',
            items: [
              'Google dapat menghapus review palsu dan memberikan pembatasan terhadap profil bisnis yang melanggar kebijakan.',
              'Federal Trade Commission (FTC) di Amerika Serikat telah mengeluarkan aturan yang melarang fake reviews dan testimonial palsu, dengan sanksi denda yang signifikan.',
              'Di Indonesia, Undang-Undang Nomor 8 Tahun 1999 tentang Perlindungan Konsumen melindungi hak konsumen atas informasi yang benar, jelas, dan jujur.',
            ],
          },
          {
            type: 'highlight',
            text: 'Regulasi yang ketat menjadi sinyal bahwa kepercayaan digital adalah aset publik yang perlu dilindungi.',
          },
        ],
      },
      {
        id: 'argumen',
        title: 'Argumen dari Perspektif Akademik',
        blocks: [
          {
            type: 'p',
            text: 'Sebagai mahasiswa Magister Manajemen Pemasaran sekaligus praktisi digital marketing, saya melihat manipulasi review dan rating sebagai bentuk ketidakjujuran digital yang harus dilawan secara struktural maupun kultural.',
          },
          {
            type: 'p',
            text: 'Review seharusnya menjadi representasi pengalaman nyata konsumen, bukan alat promosi yang direkayasa. Kepercayaan digital merupakan aset jangka panjang yang sangat berharga dan tidak dapat dibangun melalui manipulasi informasi.',
          },
          {
            type: 'quote',
            text: 'Bisnis yang berfokus pada manipulasi reputasi sedang membangun fondasi rapuh, yang sewaktu-waktu dapat runtuh ketika ekspektasi konsumen tidak terpenuhi.',
          },
        ],
      },
      {
        id: 'rekomendasi',
        title: 'Rekomendasi Etis bagi Pelaku Usaha',
        blocks: [
          {
            type: 'p',
            text: 'Untuk membangun reputasi digital yang sehat dan berkelanjutan, pelaku usaha dapat menerapkan beberapa prinsip etis berikut:',
          },
          {
            type: 'ol',
            items: [
              'Meminta review secara netral tanpa menggiring opini pelanggan.',
              'Tidak memberikan insentif yang mengikat untuk ulasan positif.',
              'Menanggapi kritik secara profesional, terbuka, dan tidak defensif.',
              'Menjadikan review sebagai bahan evaluasi nyata untuk peningkatan kualitas layanan.',
              'Mengedukasi tim internal mengenai pentingnya kepercayaan digital.',
            ],
          },
          {
            type: 'p',
            text: 'Reputasi yang kuat harus dibangun dari kualitas layanan yang nyata, bukan dari rekayasa persepsi.',
          },
        ],
      },
    ],
    conclusion:
      'Manipulasi review dan rating di Google Maps merupakan persoalan etika bisnis yang berdampak pada kepercayaan konsumen, keadilan persaingan usaha, dan integritas informasi digital. Pada akhirnya, kepercayaan konsumen tidak bisa dibeli dengan review palsu. Kepercayaan hanya dapat dibangun melalui kualitas, transparansi, dan kejujuran yang konsisten.',
    references: [
      'Google Maps User Generated Content Policy.',
      'Google Business Profile Help.',
      'Google Blog tentang fake reviews dan fake business profiles.',
      'Federal Trade Commission (FTC) Fake Reviews Rule.',
      'Undang-Undang Nomor 8 Tahun 1999 tentang Perlindungan Konsumen.',
      'Gryka & Janicki (2023), Applied Sciences.',
    ],
  },

  'geo-reshaping-search-2026': {
    intro:
      'Generative Engine Optimization (GEO) menjadi frontier baru dalam dunia pencarian digital. Seiring berkembangnya AI seperti ChatGPT, Gemini, Claude, dan Perplexity, cara pengguna menemukan informasi mengalami perubahan besar — dari mengetik kata kunci, kini menjadi bertanya layaknya berbicara dengan asisten cerdas.',
    sections: [
      {
        id: 'search-to-answer',
        title: 'Perubahan Besar dari Search Engine ke Answer Engine',
        blocks: [
          {
            type: 'p',
            text: 'Selama lebih dari dua dekade, SEO berfokus pada bagaimana sebuah halaman muncul di hasil pencarian. Pengguna mengetik kata kunci, lalu memilih satu di antara puluhan link biru yang tampil.',
          },
          {
            type: 'p',
            text: 'Kini pengguna semakin sering bertanya langsung kepada AI dan menerima jawaban instan yang merangkum berbagai sumber sekaligus. Search engine perlahan berubah wujud menjadi answer engine.',
          },
          {
            type: 'quote',
            text: 'Pertanyaannya bukan lagi “bagaimana muncul di halaman pertama Google”, tapi “bagaimana dikutip oleh AI ketika menjawab pengguna”.',
          },
        ],
      },
      {
        id: 'apa-itu-geo',
        title: 'Apa Itu GEO?',
        blocks: [
          {
            type: 'p',
            text: 'Generative Engine Optimization (GEO) adalah praktik mengoptimalkan konten agar lebih mudah dipahami, dikutip, dan direkomendasikan oleh sistem AI generatif. Berbeda dengan SEO klasik yang menargetkan crawler dan algoritma ranking, GEO menargetkan model bahasa besar (LLM) yang menyusun jawaban dari berbagai sumber.',
          },
          {
            type: 'highlight',
            text: 'GEO bukan tentang menipu AI. GEO adalah tentang membuat konten yang memang layak dikutip karena jelas, akurat, dan terstruktur dengan baik.',
          },
        ],
      },
      {
        id: 'mengapa-penting',
        title: 'Mengapa GEO Penting di Tahun 2026?',
        blocks: [
          {
            type: 'p',
            text: 'Ada tiga alasan utama mengapa GEO menjadi salah satu prioritas strategi konten di tahun 2026:',
          },
          {
            type: 'ol',
            items: [
              'Pengguna semakin mengandalkan AI sebagai pintu masuk utama informasi, terutama untuk pertanyaan kompleks.',
              'Traffic organik mengalami perubahan karena sebagian klik “habis” di level jawaban AI sebelum sampai ke website.',
              'Kredibilitas menjadi faktor utama. AI cenderung memilih sumber yang otoritatif dan konsisten.',
            ],
          },
        ],
      },
      {
        id: 'cara-ai-memilih',
        title: 'Bagaimana AI Memilih Sumber Informasi?',
        blocks: [
          {
            type: 'p',
            text: 'AI generatif tidak memilih sumber secara acak. Ada pola yang konsisten ketika sebuah konten dianggap layak dikutip:',
          },
          {
            type: 'list',
            items: [
              'Relevan dengan intent pertanyaan, bukan sekadar mengandung kata kunci.',
              'Memiliki struktur yang jelas — heading, list, dan paragraf yang ringkas.',
              'Didukung otoritas, baik dari penulis maupun domain.',
              'Didasarkan pada data dan referensi yang dapat diverifikasi.',
            ],
          },
        ],
      },
      {
        id: 'strategi-geo',
        title: 'Strategi GEO yang Harus Diterapkan',
        blocks: [
          {
            type: 'p',
            text: 'Berikut adalah pendekatan praktis yang dapat segera diterapkan oleh tim konten dan SEO:',
          },
          {
            type: 'ol',
            items: [
              'Buat konten yang menjawab pertanyaan pengguna secara langsung dan tuntas.',
              'Fokus pada topical authority — bahas satu topik secara mendalam, bukan dangkal di banyak topik.',
              'Gunakan FAQ untuk menangkap intent berbentuk pertanyaan.',
              'Bangun entity yang jelas: siapa penulisnya, siapa brand-nya, dan apa keahliannya.',
              'Sertakan data, statistik, dan sumber primer agar konten lebih mudah dirujuk AI.',
            ],
          },
        ],
      },
      {
        id: 'apakah-seo-mati',
        title: 'Apakah SEO Akan Mati?',
        blocks: [
          {
            type: 'p',
            text: 'Pertanyaan ini sering muncul setiap kali ada teknologi baru. Jawabannya tetap sama: tidak. GEO bukan pengganti SEO, melainkan evolusi dari SEO di era AI.',
          },
          {
            type: 'p',
            text: 'SEO tetap menjadi fondasi — tanpa fondasi teknis dan konten yang baik, AI pun sulit menemukan dan memahami halaman Anda. GEO membangun lapisan baru di atas fondasi tersebut.',
          },
        ],
      },
      {
        id: 'masa-depan',
        title: 'Masa Depan Pencarian Ada pada Kepercayaan',
        blocks: [
          {
            type: 'p',
            text: 'Di tengah membanjirnya konten yang diproduksi secara otomatis, faktor pembeda utama bukan lagi kuantitas, melainkan kepercayaan. Konten terbaik adalah konten yang membantu pengguna, kredibel, dan dapat dipercaya.',
          },
          {
            type: 'quote',
            text: 'Algoritma boleh berubah, model AI boleh berkembang, tapi kepercayaan tetap menjadi mata uang utama dalam dunia pencarian.',
          },
        ],
      },
    ],
    conclusion:
      'GEO menjadi salah satu perkembangan paling penting dalam digital marketing tahun 2026. Website perlu membangun konten yang terstruktur, berbasis otoritas, dan mudah dipahami AI. Brand yang berhasil bukanlah yang paling banyak memproduksi konten, melainkan yang paling layak dipercaya dan dirujuk — baik oleh manusia maupun oleh mesin.',
  },

  'ai-content-workflows': {
    intro:
      'Perkembangan Artificial Intelligence (AI) telah mengubah cara organisasi membuat dan mengelola konten. Kehadiran Large Language Models (LLMs) seperti ChatGPT, Gemini, Claude, dan berbagai AI generatif lainnya memungkinkan proses produksi konten menjadi lebih cepat, efisien, dan terukur. Namun, tanpa framework yang jelas, AI justru dapat menghasilkan konten yang dangkal dan kehilangan suara manusia.',
    sections: [
      {
        id: 'mengapa-berubah',
        title: 'Mengapa Workflow Konten Perlu Berubah?',
        blocks: [
          {
            type: 'p',
            text: 'Proses produksi konten tradisional membutuhkan banyak tahapan mulai dari riset, brainstorming, outline, drafting, editing, hingga distribusi. Setiap tahap menuntut waktu, tenaga, dan koordinasi yang tidak sedikit.',
          },
          {
            type: 'p',
            text: 'AI mampu mempercepat sebagian besar aktivitas tersebut, tetapi tetap membutuhkan strategi dan pengawasan manusia agar hasilnya konsisten dengan identitas merek dan kebutuhan audiens.',
          },
        ],
      },
      {
        id: 'tahap-1',
        title: 'Tahap 1: Content Strategy (Human-Led)',
        blocks: [
          {
            type: 'p',
            text: 'Strategi tetap harus dipimpin oleh manusia. AI hanya alat — ia tidak memahami konteks bisnis Anda kecuali Anda yang merumuskannya.',
          },
          {
            type: 'list',
            items: [
              'Tentukan target audiens dan persona yang spesifik.',
              'Tetapkan tujuan konten — awareness, consideration, atau conversion.',
              'Petakan customer journey dan touchpoint yang ingin dioptimalkan.',
              'Tetapkan KPI yang ingin dicapai, baik kuantitatif maupun kualitatif.',
            ],
          },
        ],
      },
      {
        id: 'tahap-2',
        title: 'Tahap 2: Research & Ideation (AI-Assisted)',
        blocks: [
          {
            type: 'p',
            text: 'AI dapat membantu brainstorming ide artikel, mengidentifikasi tren, menyusun content calendar, dan menemukan pertanyaan yang sering diajukan pengguna. Tugas manusia adalah memvalidasi mana ide yang sejalan dengan strategi.',
          },
        ],
      },
      {
        id: 'tahap-3',
        title: 'Tahap 3: Outline Development (Human + AI)',
        blocks: [
          {
            type: 'p',
            text: 'Gunakan AI untuk membantu menyusun struktur artikel seperti H1, H2, H3, dan FAQ. Editor memastikan struktur sesuai kebutuhan audiens dan tidak generik.',
          },
          {
            type: 'highlight',
            text: 'Outline yang baik = artikel yang baik. Investasikan waktu pada tahap ini, dan tahap berikutnya akan jauh lebih cepat.',
          },
        ],
      },
      {
        id: 'tahap-4',
        title: 'Tahap 4: Draft Generation (AI-Led)',
        blocks: [
          {
            type: 'p',
            text: 'AI menghasilkan draft awal yang mempercepat proses penulisan. Namun draft tetap harus dianggap sebagai bahan mentah yang perlu disempurnakan, bukan output final.',
          },
        ],
      },
      {
        id: 'tahap-5',
        title: 'Tahap 5: Human Review & Fact Checking',
        blocks: [
          {
            type: 'p',
            text: 'Verifikasi fakta, validasi sumber, dan sesuaikan gaya bahasa dengan identitas merek. Tahap ini sangat penting untuk menjaga kualitas dan kredibilitas konten.',
          },
          {
            type: 'list',
            items: [
              'Cross-check semua angka, statistik, dan klaim.',
              'Tambahkan insight personal, contoh kasus, atau pengalaman nyata.',
              'Hapus kalimat-kalimat generik yang khas AI.',
              'Sesuaikan tone of voice dengan brand guidelines.',
            ],
          },
        ],
      },
      {
        id: 'tahap-6',
        title: 'Tahap 6: SEO dan GEO Optimization',
        blocks: [
          {
            type: 'p',
            text: 'Konten harus dioptimalkan untuk Search Engine Optimization (SEO) dan Generative Engine Optimization (GEO) agar mudah ditemukan oleh mesin pencari sekaligus mudah dikutip oleh AI generatif.',
          },
        ],
      },
      {
        id: 'tahap-7',
        title: 'Tahap 7: Publishing & Distribution',
        blocks: [
          {
            type: 'p',
            text: 'Satu artikel dapat diubah menjadi berbagai format agar nilai distribusinya maksimal:',
          },
          {
            type: 'list',
            items: [
              'Posting LinkedIn dalam format storytelling.',
              'Carousel Instagram dengan poin-poin kunci.',
              'Newsletter mingguan untuk audiens email.',
              'Script video pendek untuk YouTube Shorts atau TikTok.',
            ],
          },
        ],
      },
      {
        id: 'tahap-8',
        title: 'Tahap 8: Performance Analysis',
        blocks: [
          {
            type: 'p',
            text: 'Evaluasi traffic, engagement, conversion, dan AI visibility untuk memahami efektivitas strategi konten. Gunakan data ini untuk menyempurnakan workflow di siklus berikutnya.',
          },
        ],
      },
      {
        id: 'kesalahan',
        title: 'Kesalahan yang Harus Dihindari',
        blocks: [
          {
            type: 'ol',
            items: [
              'Mengandalkan AI sepenuhnya tanpa pengawasan manusia.',
              'Melewatkan fact-checking sehingga konten berisi informasi yang tidak akurat.',
              'Hanya fokus pada kuantitas konten dan mengabaikan kualitas.',
              'Tidak menyesuaikan output AI dengan brand voice yang unik.',
            ],
          },
        ],
      },
      {
        id: 'framework-singkat',
        title: 'Framework Singkat',
        blocks: [
          {
            type: 'p',
            text: 'Ringkasan alur kerja yang dapat segera diadopsi tim konten Anda:',
          },
          {
            type: 'highlight',
            text: 'Human → AI → Human → AI → Human: Strategy, Research, Outline, Draft, Review, SEO/GEO, Distribution, Analysis.',
          },
          {
            type: 'p',
            text: 'Pola bergantian ini memastikan kecepatan AI dimanfaatkan secara maksimal tanpa mengorbankan kualitas, kreativitas, dan strategi yang hanya bisa dihadirkan manusia.',
          },
        ],
      },
      {
        id: 'faq',
        title: 'FAQ',
        blocks: [
          { type: 'h3', text: 'Apakah AI dapat menggantikan content writer?' },
          {
            type: 'p',
            text: 'Tidak. AI membantu proses produksi, tetapi kreativitas, empati, dan strategi tetap membutuhkan manusia. Content writer berevolusi menjadi content strategist dan editor.',
          },
          { type: 'h3', text: 'Apa manfaat utama AI dalam workflow konten?' },
          {
            type: 'p',
            text: 'Meningkatkan produktivitas, mempercepat riset, brainstorming ide, dan pembuatan draft awal sehingga tim dapat fokus pada pekerjaan bernilai tinggi.',
          },
          { type: 'h3', text: 'Apakah konten AI aman untuk SEO?' },
          {
            type: 'p',
            text: 'Ya, selama berkualitas tinggi dan telah melalui review manusia. Mesin pencari menilai kualitas dan helpfulness, bukan asal-usul konten.',
          },
        ],
      },
    ],
    conclusion:
      'AI bukan pengganti manusia, melainkan alat yang membantu menghasilkan konten yang lebih cepat, lebih relevan, dan lebih bernilai. Framework yang baik memastikan AI dan manusia bekerja saling melengkapi — bukan saling menggantikan. Tim yang berhasil di era ini adalah tim yang berani memadukan disiplin manusia dengan skala yang dimungkinkan oleh AI.',
  },
};

export const research = {
  affiliation: 'AI Marketing Strategist',
  verifiedEmail: 'rikiaprianto.com',
  interests: ['Digital Marketing', 'Consumer Behavior', 'SEO', 'AI Marketing'],
  metrics: {
    citations: { all: 2, since2020: 2 },
    hIndex: { all: 1, since2020: 1 },
    i10Index: { all: 0, since2020: 0 },
  },
  publications: [
    {
      title:
        "The UTAUT2 to Explains How Tiktok Shop Application Affects Consumers' Behavior",
      authors: 'R Aprianto, NER Wuryandari, R Ilahi',
      venue: 'KnE Social Sciences, 493-508-493-508',
      citedBy: 1,
      year: 2023,
      link: 'https://scholar.google.com/citations?view_op=view_citation&hl=id&user=RrjYYOoAAAAJ&citation_for_view=RrjYYOoAAAAJ:u5HHmVD_uO8C',
    },
    {
      title: 'How To Drive Satisfaction Of Simulator Software Users?',
      authors: 'NER Wuryandari, C Rudyyanto, R Aprianto, R Ilahi',
      venue: 'DEAL: International Journal of Economics and Business 1 (01), 1-8',
      citedBy: null,
      year: 2023,
      link: 'https://scholar.google.com/citations?view_op=view_citation&hl=id&user=RrjYYOoAAAAJ&citation_for_view=RrjYYOoAAAAJ:9yKSN-GCB0IC',
    },
    {
      title:
        'Encouraging the Entrepreneurial Transformation of Honey Beekeepers Through Entrepreneurial Characteristics',
      authors: 'R Aprianto, NER Wuryandari',
      venue: 'Journal of Business Research, 12 (03), 22-35',
      citedBy: 1,
      year: 2023,
      link: 'https://scholar.google.com/citations?view_op=view_citation&hl=id&user=RrjYYOoAAAAJ&citation_for_view=RrjYYOoAAAAJ:u-x6o8ySG0sC',
    },
    {
      title:
        'The Effectiveness of The Use of Technology Information in Micro, Small and Medium Enterprises',
      authors: 'R Aprianto, R Ilahi',
      venue: 'Indonesian Journal of Management, 5 (2), 88-101',
      citedBy: null,
      year: 2022,
      link: 'https://scholar.google.com/citations?view_op=view_citation&hl=id&user=RrjYYOoAAAAJ&citation_for_view=RrjYYOoAAAAJ:d1gkVwhDpl0C',
    },
  ],
};

// Kategori filter di halaman My Projects
export const projectCategories = ['All', 'AI Marketing', 'Interactive Game', 'Arcade Game'];

// Semua proyek adalah aplikasi web/game HTML yang dibuat bersama Claude AI.
// File-nya di-host sendiri di /public/projects/ dan dibuka di tab baru.
export const projects = [
  // ---------- AI Marketing ----------
  {
    id: 1,
    title: 'Facebook Ads Performance Analyzer',
    category: 'AI Marketing',
    description:
      'Masukkan data Facebook & Instagram Ads secara manual, lalu dapatkan skor performa, diagnosis masalah, dan rekomendasi optimasi — tanpa login dan tanpa menghubungkan akun iklan.',
    tags: ['Meta Ads', 'Analytics', 'Rule-based'],
    url: '/projects/facebook-ads-performance-analyzer.html',
    image: '/projects/thumbs/facebook-ads-performance-analyzer.png',
  },
  {
    id: 2,
    title: 'AI Content Planner',
    category: 'AI Marketing',
    description:
      'Ubah satu brief bisnis menjadi strategi konten lengkap: ide konten, caption, strategi platform, dan kalender publikasi yang siap dipakai.',
    tags: ['Content Strategy', 'Kalender Konten', 'Copywriting'],
    url: '/projects/ai-content-planner.html',
    image: '/projects/thumbs/ai-content-planner.png',
  },
  {
    id: 3,
    title: 'Customer Persona Builder',
    category: 'AI Marketing',
    description:
      'Bangun profil pelanggan ideal dari informasi bisnismu untuk menyusun konten, iklan, dan strategi pemasaran yang lebih tepat sasaran.',
    tags: ['Persona', 'Segmentasi', 'Riset Pasar'],
    url: '/projects/customer-persona-builder.html',
    image: '/projects/thumbs/customer-persona-builder.png',
  },
  {
    id: 4,
    title: 'AdPilot AI Campaign Generator',
    category: 'AI Marketing',
    description:
      'Dari brief bisnis menjadi rancangan campaign iklan multichannel: struktur campaign, targeting, copy iklan, media plan, dan kalender optimasi.',
    tags: ['Campaign', 'Multichannel', 'Media Plan'],
    url: '/projects/adpilot-ai-campaign-generator.html',
    image: '/projects/thumbs/adpilot-ai-campaign-generator.png',
  },
  {
    id: 5,
    title: 'Competitor Positioning Analyzer',
    category: 'AI Marketing',
    description:
      'Analisis kompetitor, temukan posisi brand di peta positioning, lalu rancang pembeda yang lebih kuat. MVP untuk analisis brand B2C.',
    tags: ['Positioning', 'Kompetitor', 'Strategi Brand'],
    url: '/projects/competitor-positioning-analyzer.html',
    image: '/projects/thumbs/competitor-positioning-analyzer.png',
  },

  // ---------- Interactive Game ----------
  {
    id: 6,
    title: "Dino's Lost World Adventure",
    category: 'Interactive Game',
    description:
      'Cerita interaktif bercabang: bantu Dino si dinosaurus kecil mengambil keputusan yang tepat untuk pulang ke rumah, dengan 6 ending dan pesan moral berbeda. Usia 6–8 tahun.',
    tags: ['Cerita Interaktif', 'Anak', 'Pilihan Bercabang'],
    url: '/projects/dinos-lost-world-adventure.html',
    image: '/projects/thumbs/dinos-lost-world-adventure.png',
  },
  {
    id: 7,
    title: 'Robot Chef and the Magic Kitchen',
    category: 'Interactive Game',
    description:
      'Cerita interaktif: bantu ROBI si robot koki memilih bahan, menambah keajaiban, dan memasak sebelum tamu pesta datang — 27 resep, 3 resep utama, 1 resep rahasia. Usia 6–8 tahun.',
    tags: ['Cerita Interaktif', 'Anak', 'Kombinasi'],
    url: '/projects/robot-chef-magic-kitchen.html',
    image: '/projects/thumbs/robot-chef-magic-kitchen.png',
  },
  {
    id: 8,
    title: 'Save the Rainbow Forest',
    category: 'Interactive Game',
    description:
      'Petualangan interaktif menyelamatkan Hutan Pelangi bersama LUMI si peri: 4 misi tentang memilah sampah, menghemat air, dan menjaga lingkungan. Usia 6–8 tahun.',
    tags: ['Lingkungan', 'Anak', 'Misi'],
    url: '/projects/save-the-rainbow-forest.html',
    image: '/projects/thumbs/save-the-rainbow-forest.png',
  },
  {
    id: 9,
    title: 'Space Explorer Challenge',
    category: 'Interactive Game',
    description:
      'Kuis interaktif tata surya: jawab 12 soal tiga level (Bumi, Bulan, Mars) untuk menerbangkan pesawat ke Mars — fakta diverifikasi dari NASA & ESA. Usia 9–11 tahun.',
    tags: ['Kuis', 'Sains', 'Tata Surya'],
    url: '/projects/space-explorer-challenge.html',
    image: '/projects/thumbs/space-explorer-challenge.png',
  },
  {
    id: 10,
    title: 'Jelajah Indonesia Quiz',
    category: 'Interactive Game',
    description:
      'Kuis budaya & geografi Indonesia: jelajahi 6 wilayah dari Sumatra sampai Papua, jawab soal rumah adat, alat musik, satwa, dan sejarah rempah — setiap fakta diverifikasi dari sumber resmi.',
    tags: ['Kuis', 'Budaya', 'Indonesia'],
    url: '/projects/jelajah-indonesia-quiz.html',
    image: '/projects/thumbs/jelajah-indonesia-quiz.png',
  },
  {
    id: 11,
    title: 'Eco Detective Mission',
    category: 'Interactive Game',
    description:
      'Game investigasi lingkungan: selidiki 9 kasus di sekolah dan rumah, pilih solusi terbaik, kumpulkan Eco Energy, dan naik pangkat jadi Eco Master Detective. Usia 9–11 tahun.',
    tags: ['Lingkungan', 'Investigasi', 'Edukasi'],
    url: '/projects/eco-detective-mission.html',
    image: '/projects/thumbs/eco-detective-mission.png',
  },
  {
    id: 12,
    title: 'StudyBuddy AI',
    category: 'Interactive Game',
    description:
      'Teman belajar (simulasi AI) untuk siswa SMP: pilih pelajaran dan topik, dapatkan penjelasan singkat/lengkap/analogi plus latihan soal — Matematika, IPA, Bahasa Inggris, IPS.',
    tags: ['Edukasi', 'Simulasi AI', 'SMP'],
    url: '/projects/studybuddy-ai.html',
    image: '/projects/thumbs/studybuddy-ai.png',
  },
  {
    id: 13,
    title: 'English Speaking Partner',
    category: 'Interactive Game',
    description:
      'Teman latihan berbicara bahasa Inggris (simulasi): pilih level dan skenario — perkenalan, memesan makanan, bertanya arah, presentasi kelas — dengan koreksi tata bahasa dan mode suara.',
    tags: ['Bahasa Inggris', 'Simulasi AI', 'Percakapan'],
    url: '/projects/english-speaking-partner.html',
    image: '/projects/thumbs/english-speaking-partner.png',
  },
  {
    id: 14,
    title: 'Smart School Project Planner',
    category: 'Interactive Game',
    description:
      'Perencana tugas sekolah (simulasi AI): masukkan tugas dan tenggat, dapatkan jadwal harian langkah demi langkah dengan estimasi waktu, prioritas, dan progress tracker. Usia 12+.',
    tags: ['Produktivitas', 'Simulasi AI', 'Pelajar'],
    url: '/projects/smart-school-project-planner.html',
    image: '/projects/thumbs/smart-school-project-planner.png',
  },

  // ---------- Arcade Game ----------
  {
    id: 15,
    title: 'Serbuan Galaksi',
    category: 'Arcade Game',
    description:
      'Game arcade bergaya Space Invaders: pertahankan Bumi dari 5 gelombang armada asing, geser kapal dan tembak formasi alien sebelum mereka menembus garis pertahanan.',
    tags: ['Arcade', 'Shooter', 'Canvas'],
    url: '/projects/serbuan-galaksi.html',
    image: '/projects/thumbs/serbuan-galaksi.png',
  },
  {
    id: 16,
    title: 'Neon Breakout',
    category: 'Arcade Game',
    description:
      'Game arcade Breakout bergaya neon: pantulkan bola dengan paddle, hancurkan semua blok di 5 level, dan tangkap power-up seperti paddle lebar, bola ganda, dan bola lambat.',
    tags: ['Arcade', 'Breakout', 'Power-up'],
    url: '/projects/neon-breakout.html',
    image: '/projects/thumbs/neon-breakout.png',
  },
  {
    id: 17,
    title: "Bloop's Adventure",
    category: 'Arcade Game',
    description:
      'Game platformer 2D: pandu Bloop si gumpalan ceria melompati jurang, menginjak musuh, dan mengumpulkan bintang sampai gerbang pelangi — dengan lompat ganda, checkpoint, dan platform bergerak.',
    tags: ['Platformer', 'Arcade', 'Canvas'],
    url: '/projects/bloops-adventure.html',
    image: '/projects/thumbs/bloops-adventure.png',
  },
  {
    id: 18,
    title: 'Snake Klasik',
    category: 'Arcade Game',
    description:
      'Game arcade Snake klasik: kumpulkan makanan agar ular makin panjang, hindari dinding dan badan sendiri. Kecepatan naik tiap level, lengkap dengan kontrol keyboard dan swipe.',
    tags: ['Arcade', 'Snake', 'Canvas'],
    url: '/projects/snake-klasik.html',
    image: '/projects/thumbs/snake-klasik.png',
  },
  {
    id: 19,
    title: 'Sky Hopper',
    category: 'Arcade Game',
    description:
      'Game arcade bergaya Flappy Bird: ketuk layar atau tekan Spasi untuk membuat si burung kuning terbang melewati celah pipa. Kecepatan bertambah tiap 10 poin, dengan sistem medali.',
    tags: ['Arcade', 'Flappy Bird', 'Canvas'],
    url: '/projects/sky-hopper.html',
    image: '/projects/thumbs/sky-hopper.png',
  },
];

export const socials = [
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
  { name: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
  { name: 'YouTube', url: 'https://youtube.com', icon: 'youtube' },
  { name: 'Email', url: 'mailto:riki.markethink@rikiaprianto.com', icon: 'mail' },
];
