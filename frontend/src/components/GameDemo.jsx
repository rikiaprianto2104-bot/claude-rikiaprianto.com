import React, { useState } from 'react';
import { Play, ArrowUpRight } from 'lucide-react';

/**
 * Pemutar contoh game dengan pola klik-untuk-main: iframe baru dimuat setelah
 * pengunjung menekan tombol, supaya file game yang besar tidak ikut membebani
 * pemuatan halaman landing.
 */
const GameDemo = ({ title, description, url, image }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 shadow-2xl shadow-slate-900/20">
      <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-slate-900">
        {playing ? (
          <iframe
            src={url}
            title={title}
            className="absolute inset-0 w-full h-full border-0"
            allow="fullscreen; autoplay; gamepad"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 w-full h-full"
            aria-label={`Mainkan ${title}`}
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-[1.02] transition-all duration-500"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="w-20 h-20 rounded-full bg-white/95 text-[#0d9eff] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Play size={32} className="ml-1" fill="currentColor" />
              </span>
              <span className="text-white font-bold text-lg drop-shadow-lg">
                Klik untuk Main
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-white dark:bg-white/[0.04] border-t border-slate-200 dark:border-white/10">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description || 'Dibuat dengan bantuan AI'}
          </p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0d9eff] hover:underline flex-shrink-0"
        >
          Buka layar penuh <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  );
};

export default GameDemo;
