import React from 'react';
import { Quote } from 'lucide-react';
import { profile, research } from '../mock';

const Research = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        <div className="w-44 h-56 rounded-[50%] overflow-hidden bg-slate-900 ring-4 ring-[#0d9eff]/60 shadow-xl flex-shrink-0">
          <img
            src={profile.researchPortrait}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {profile.name}
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            {research.affiliation}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Verified email at{' '}
            <span className="text-[#0d9eff] font-medium">
              {research.verifiedEmail}
            </span>{' '}
            -{' '}
            <a href="/" className="text-[#0d9eff] hover:underline">
              Home
            </a>
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            {research.interests.map((i) => (
              <span
                key={i}
                className="text-sm text-[#0d9eff] hover:underline cursor-pointer"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Publications and metrics */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-200 dark:border-white/5">
            <span>Title</span>
            <div className="flex gap-12">
              <span>Cited by</span>
              <span>Year</span>
            </div>
          </div>
          <ul>
            {research.publications.map((p, i) => (
              <li
                key={i}
                className="py-6 border-b border-slate-100 dark:border-white/5 flex items-start justify-between gap-6"
              >
                <div className="flex-1">
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-base md:text-lg font-semibold text-slate-900 dark:text-white hover:text-[#0d9eff] cursor-pointer leading-snug transition-colors duration-200"
                  >
                    {p.title}
                  </a>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {p.authors}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 italic">
                    {p.venue}
                  </p>
                </div>
                <div className="flex items-start gap-12 pt-1 text-sm">
                  <span className={`w-10 text-center ${p.citedBy ? 'text-[#0d9eff] font-medium hover:underline cursor-pointer' : 'text-slate-400'}`}>
                    {p.citedBy ?? '-'}
                  </span>
                  <span className="w-12 text-slate-500 dark:text-slate-400">
                    {p.year}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-8">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03]">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Quote size={18} className="text-[#0d9eff]" />
              Cited by
            </h3>
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="text-slate-400">
                  <th></th>
                  <th className="font-medium text-right pb-2">All</th>
                  <th className="font-medium text-right pb-2">Since 2020</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-200">
                <tr className="border-t border-slate-100 dark:border-white/5">
                  <td className="py-3">Citations</td>
                  <td className="text-right">{research.metrics.citations.all}</td>
                  <td className="text-right">{research.metrics.citations.since2020}</td>
                </tr>
                <tr className="border-t border-slate-100 dark:border-white/5">
                  <td className="py-3">h-index</td>
                  <td className="text-right">{research.metrics.hIndex.all}</td>
                  <td className="text-right">{research.metrics.hIndex.since2020}</td>
                </tr>
                <tr className="border-t border-slate-100 dark:border-white/5">
                  <td className="py-3">i10-index</td>
                  <td className="text-right">{research.metrics.i10Index.all}</td>
                  <td className="text-right">{research.metrics.i10Index.since2020}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Co-authors
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>NER Wuryandari</li>
              <li>R Ilahi</li>
              <li>C Rudyyanto</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Research;
