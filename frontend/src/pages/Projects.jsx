import React, { useState } from 'react';
import { FolderKanban, ArrowUpRight, Search, X } from 'lucide-react';
import { projects, projectCategories } from '../mock';

const categories = projectCategories;

const Projects = () => {
  const [active, setActive] = useState('All');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    if (active !== 'All' && p.category !== active) return false;
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#eaf6ff] dark:bg-[#0d9eff]/10 flex items-center justify-center text-[#0d9eff]">
          <FolderKanban size={28} />
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Projects
        </h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          Aplikasi web dan game interaktif yang saya bangun bersama AI. Klik salah
          satu untuk mencobanya langsung di tab baru.
        </p>
      </div>

      <div className="mt-10 max-w-md mx-auto relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari berdasarkan judul atau tag..."
          aria-label="Cari proyek berdasarkan judul atau tag"
          className="w-full pl-11 pr-11 py-3 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0d9eff] focus:ring-2 focus:ring-[#0d9eff]/20 transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Hapus pencarian"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-[#0d9eff] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border ${
              active === c
                ? 'bg-[#0d9eff] text-white border-[#0d9eff]'
                : 'bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#0d9eff] hover:text-[#0d9eff]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {q && (
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} proyek ditemukan untuk &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      {filtered.length === 0 && (
        <div className="mt-12 text-center text-slate-500 dark:text-slate-400">
          <p className="font-medium text-slate-700 dark:text-slate-200">
            Tidak ada proyek yang cocok.
          </p>
          <p className="mt-1 text-sm">
            Coba kata kunci lain, atau pilih kategori &ldquo;All&rdquo;.
          </p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:border-[#0d9eff]/60 hover:shadow-xl hover:shadow-[#0d9eff]/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-white/5">
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#0d9eff] px-3 py-1 rounded-full">
                {p.category}
              </span>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-[#0d9eff] transition-colors">
                  {p.title}
                </h2>
                <ArrowUpRight
                  size={18}
                  className="text-slate-400 group-hover:text-[#0d9eff] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0 mt-1"
                />
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {p.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Projects;
