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
import PendaftaranKelasLanjutan from './pages/PendaftaranKelasLanjutan';
import KebijakanPrivasi from './pages/KebijakanPrivasi';
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
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/research" element={<Research />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/future-maker" element={<FutureMakers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/kebijakan-privasi" element={<KebijakanPrivasi />} />
            {/* Tautan tersembunyi: tidak ditautkan dari menu mana pun dan
                halamannya memasang noindex. Dibagikan manual lewat WhatsApp. */}
            <Route
              path="/pendaftaran-kelas-lanjutan"
              element={<PendaftaranKelasLanjutan />}
            />
            {/* Satu formulir per kelas, kelasnya sudah terpilih dan pertanyaan
                alumni dilewati karena pendaftarnya dari iklan, bukan alumni. */}
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
