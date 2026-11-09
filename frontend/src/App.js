import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import KelasFutureMakers from './pages/KelasFutureMakers';
import KelasBelajarAI from './pages/KelasBelajarAI';
import KelasExplorer from './pages/KelasExplorer';
import PendaftaranKelasExplorer from './pages/PendaftaranKelasExplorer';
import BuatInvoiceExplorer from './pages/BuatInvoiceExplorer';
import InvoiceExplorer from './pages/InvoiceExplorer';
import CekPendaftarExplorer from './pages/CekPendaftarExplorer';
import { varianLanding } from './data/varianLanding';
import PendaftaranKelasLanjutan from './pages/PendaftaranKelasLanjutan';
import KebijakanPrivasi from './pages/KebijakanPrivasi';
import BuatInvoice from './pages/BuatInvoice';
import Invoice from './pages/Invoice';
import VerifikasiPeserta from './pages/VerifikasiPeserta';
import FutureMakers from './pages/FutureMakers';
import Profile from './pages/Profile';
import Research from './pages/Research';
import Projects from './pages/Projects';
import Contact from './pages/Contact';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route
              path="/blog/kelas-future-makers"
              element={<KelasFutureMakers />}
            />
            <Route
              path="/blog/kelas-belajar-ai-anak"
              element={<KelasBelajarAI />}
            />
            {/* Landing kembar untuk kata kunci lain: komponen sama, hanya judul
                dan kalimat penawarannya yang berbeda (data/varianLanding.js). */}
            <Route
              path="/blog/les-ai-anak-jogja"
              element={<KelasBelajarAI varian={varianLanding.lesAiJogja} />}
            />
            {/* Kelas Explorer: kelas 4 pertemuan, harga promo dengan hitung mundur. */}
            <Route path="/blog/kelas-explorer" element={<KelasExplorer />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/research" element={<Research />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/future-maker" element={<FutureMakers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/kebijakan-privasi" element={<KebijakanPrivasi />} />
            {/* Invoice: /buat-invoice dipakai sendiri oleh pengelola, dua
                halaman lain membaca datanya dari parameter ?d= pada alamat. */}
            <Route path="/buat-invoice" element={<BuatInvoice />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/verifikasi" element={<VerifikasiPeserta />} />
            {/* Kelas Explorer: invoice berbasis database, tautan pendek, dan
                halaman tujuan QR. Terpisah dari invoice kelas lain di atas. */}
            <Route path="/buat-invoice-explorer" element={<BuatInvoiceExplorer />} />
            <Route path="/invoice/:kode" element={<InvoiceExplorer />} />
            <Route path="/cek/:kode" element={<CekPendaftarExplorer />} />
            {/* Tautan tersembunyi: tidak ditautkan dari menu mana pun dan
                halamannya memasang noindex. Dibagikan manual lewat WhatsApp. */}
            <Route
              path="/pendaftaran-kelas-lanjutan"
              element={<PendaftaranKelasLanjutan />}
            />
            {/* Satu formulir per kelas, kelasnya sudah terpilih dan pertanyaan
                alumni dilewati karena pendaftarnya dari iklan, bukan alumni. */}
            <Route
              path="/pendaftaran/kelas-explorer"
              element={<PendaftaranKelasExplorer />}
            />
            <Route
              path="/pendaftaran/kelas-creator"
              element={<PendaftaranKelasLanjutan kelasAwal="creator" tanpaAlumni />}
            />
            <Route
              path="/pendaftaran/kelas-champions"
              element={<PendaftaranKelasLanjutan kelasAwal="champions" tanpaAlumni />}
            />
            <Route
              path="/pendaftaran/kelas-private"
              element={<PendaftaranKelasLanjutan kelasAwal="private" tanpaAlumni />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
