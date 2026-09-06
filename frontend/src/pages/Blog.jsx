import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { blogPosts } from '../mock';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const Blog = () => {
  useDocumentMeta({
    title: 'Blog — Riki MarkeThink',
    description:
      'Tulisan dan analisis Riki MarkeThink seputar etika bisnis, digital marketing, SEO, GEO, dan transformasi digital.',
    keywords: ['blog', 'digital marketing', 'etika bisnis', 'SEO', 'GEO'],
  });

  const [featured, ...rest] = blogPosts;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
      <div className="max-w-2xl">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#0d9eff] bg-[#eaf6ff] dark:bg-[#0d9eff]/10 px-3 py-1 rounded-full">
          Blog
        </span>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Insight tentang Digital Marketing &amp; Etika Bisnis
        </h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          Catatan, analisis, dan playbook seputar AI marketing, SEO, GEO,
          consumer behavior, dan transformasi digital.
        </p>
      </div>

      {/* Featured */}
      {featured && (
        <Link
          to={`/blog/${featured.slug}`}
          className="group mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:border-[#0d9eff]/60 hover:shadow-xl hover:shadow-[#0d9eff]/10 transition-all duration-300"
        >
          <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
            <span className="absolute top-4 left-4 text-xs font-semibold uppercase tracking-wider text-white bg-[#0d9eff] px-3 py-1 rounded-full">
              {featured.tag}
            </span>
          </div>
          <div className="p-6 lg:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} /> {featured.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} /> {featured.readTime}
              </span>
            </div>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#0d9eff] transition-colors">
              {featured.title}
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed">
              {featured.excerpt}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-[#0d9eff] font-medium">
              Baca artikel
              <ArrowUpRight
                size={18}
                className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </span>
          </div>
        </Link>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:border-[#0d9eff]/60 hover:shadow-xl hover:shadow-[#0d9eff]/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#0d9eff] px-3 py-1 rounded-full">
                  {post.tag}
                </span>
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-[#0d9eff] transition-colors">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-white/5 flex items-center gap-4 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} /> {post.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} /> {post.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;
