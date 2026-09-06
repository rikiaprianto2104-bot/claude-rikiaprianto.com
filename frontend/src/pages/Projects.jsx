import React, { useState } from 'react';
import { FolderKanban, ArrowUpRight } from 'lucide-react';
import { projects, projectCategories } from '../mock';

const categories = projectCategories;

const Projects = () => {
  const [active, setActive] = useState('All');

  const filtered =
    active === 'All' ? projects : projects.filter((p) => p.category === active);

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

      <div className="mt-10 flex flex-wrap justify-center gap-2">
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

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noreferrer"
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
