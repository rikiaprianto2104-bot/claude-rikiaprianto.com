import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Tag,
  ChevronLeft,
  Linkedin,
  Twitter,
  Facebook,
  MessageCircle,
  Link2,
  Check,
  ArrowRight,
  ArrowUpRight,
  List as ListIcon,
  Terminal,
  Sparkles,
  Copy,
} from 'lucide-react';
import { blogPosts, blogContent, profile } from '../mock';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const PromptBlock = ({ title, text }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };
  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02]">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0d9eff]">
          <Terminal size={14} />
          {title || 'Template Prompt'}
        </span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-300 hover:text-[#0d9eff] transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <pre className="px-5 py-4 text-[14px] md:text-[15px] leading-[1.7] text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-mono">
        {text}
      </pre>
    </div>
  );
};

const ExampleBlock = ({ title, text }) => (
  <div className="my-6 rounded-2xl border border-[#0d9eff]/20 bg-[#eaf6ff]/60 dark:bg-[#0d9eff]/[0.08] p-5">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0d9eff]">
      <Sparkles size={14} />
      {title || 'Contoh Hasil'}
    </div>
    <div className="mt-3 text-[15px] md:text-base leading-[1.8] text-slate-800 dark:text-slate-100 whitespace-pre-line">
      {text}
    </div>
  </div>
);

const Block = ({ block }) => {
  switch (block.type) {
    case 'p':
      return (
        <p className="text-slate-700 dark:text-slate-300 leading-[1.85] text-[17px] text-justify hyphens-auto">
          {block.text}
        </p>
      );
    case 'h3':
      return (
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3">
          {block.text}
        </h3>
      );
    case 'prompt':
      return <PromptBlock title={block.title} text={block.text} />;
    case 'example':
      return <ExampleBlock title={block.title} text={block.text} />;
    case 'list':
      return (
        <ul className="space-y-3 my-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300 leading-[1.8]">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#0d9eff] flex-shrink-0" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="space-y-3 my-2 list-none counter-reset-list">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-4 text-slate-700 dark:text-slate-300 leading-[1.8]">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#eaf6ff] dark:bg-[#0d9eff]/10 text-[#0d9eff] font-semibold text-sm flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      );
    case 'quote':
      return (
        <blockquote className="my-6 pl-6 border-l-4 border-[#0d9eff] py-2">
          <p className="text-lg md:text-xl italic text-slate-800 dark:text-slate-100 leading-relaxed">
            “{block.text}”
          </p>
        </blockquote>
      );
    case 'highlight':
      return (
        <div className="my-6 p-5 rounded-2xl bg-[#eaf6ff] dark:bg-[#0d9eff]/10 border border-[#0d9eff]/20">
          <p className="text-[15px] md:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
            {block.text}
          </p>
        </div>
      );
    default:
      return null;
  }
};

const ShareButtons = ({ url, title }) => {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${enc(`${title} ${url}`)}`,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // noop
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share to ${l.name}`}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-[#0d9eff] hover:text-white flex items-center justify-center transition-colors"
        >
          <l.icon size={16} />
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="Copy link"
        className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-[#0d9eff] hover:text-white text-sm font-medium transition-colors"
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
        {copied ? 'Tertaut!' : 'Salin link'}
      </button>
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.slug === slug);
  const content = blogContent[slug];
  const [activeId, setActiveId] = useState('');

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Build JSON-LD Article schema
  const jsonLd = useMemo(() => {
    if (!post) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: [post.image],
      datePublished: post.dateISO,
      dateModified: post.dateISO,
      author: {
        '@type': 'Person',
        name: post.author.name,
        jobTitle: post.author.role,
      },
      publisher: {
        '@type': 'Person',
        name: 'Riki MarkeThink',
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
      keywords: post.keywords?.join(', '),
      articleSection: post.tag,
    };
  }, [post, shareUrl]);

  useDocumentMeta({
    title: post ? `${post.title} | Riki MarkeThink` : 'Article',
    description: post?.excerpt,
    keywords: post?.keywords,
    image: post?.image,
    url: shareUrl,
    type: 'article',
    jsonLd,
  });

  // Active section highlight on scroll
  useEffect(() => {
    if (!content) return;
    const ids = content.sections.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [content]);

  if (!post || !content) {
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Artikel tidak ditemukan
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Artikel yang Anda cari mungkin telah dipindahkan.
        </p>
        <button
          onClick={() => navigate('/blog')}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0d9eff] text-white font-medium hover:bg-[#0a8de5] transition-colors"
        >
          <ChevronLeft size={18} /> Kembali ke Blog
        </button>
      </div>
    );
  }

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <article className="bg-white dark:bg-[#0b1220]">
      {/* Hero */}
      <header className="relative bg-gradient-to-b from-[#f4faff] to-white dark:from-[#0b1220] dark:to-[#0b1220]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-12 pb-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0d9eff] transition-colors"
          >
            <ChevronLeft size={16} /> Kembali ke Blog
          </Link>
          <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0d9eff] bg-[#eaf6ff] dark:bg-[#0d9eff]/10 px-3 py-1 rounded-full">
            <Tag size={12} /> {post.tag}
          </span>
          <h1 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-900 ring-2 ring-[#0d9eff]/40 flex-shrink-0">
                <img
                  src={profile.researchPortrait}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {post.author.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {post.author.role}
                </p>
              </div>
            </div>
            <span className="hidden md:inline-block w-px h-8 bg-slate-200 dark:bg-white/10" />
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar size={14} /> {post.date}
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock size={14} /> {post.readTime}
            </span>
          </div>
        </div>

        {/* Featured image */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-12">
          <div className="rounded-3xl overflow-hidden aspect-[16/9] bg-slate-100 dark:bg-white/5 shadow-2xl shadow-slate-900/10">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                <ListIcon size={14} /> Daftar Isi
              </p>
              <nav className="space-y-1">
                {content.sections.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`block text-sm leading-snug py-2 pl-4 border-l-2 transition-colors duration-200 ${
                      activeId === s.id
                        ? 'border-[#0d9eff] text-[#0d9eff] font-semibold'
                        : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-[#0d9eff] hover:border-[#0d9eff]'
                    }`}
                  >
                    <span className="text-xs mr-2 text-slate-400">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.title}
                  </a>
                ))}
                <a
                  href="#kesimpulan"
                  className={`block text-sm leading-snug py-2 pl-4 border-l-2 transition-colors duration-200 ${
                    activeId === 'kesimpulan'
                      ? 'border-[#0d9eff] text-[#0d9eff] font-semibold'
                      : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-[#0d9eff] hover:border-[#0d9eff]'
                  }`}
                >
                  <span className="text-xs mr-2 text-slate-400">
                    {String(content.sections.length + 1).padStart(2, '0')}
                  </span>
                  Kesimpulan
                </a>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="max-w-2xl">
            {/* Mobile TOC */}
            <details className="lg:hidden mb-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
              <summary className="cursor-pointer p-4 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ListIcon size={16} /> Daftar Isi
              </summary>
              <ul className="px-4 pb-4 space-y-2">
                {content.sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-slate-600 dark:text-slate-300 hover:text-[#0d9eff]"
                    >
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>

            {/* Intro */}
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 leading-[1.8] font-medium text-justify hyphens-auto first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-[#0d9eff]">
              {content.intro}
            </p>

            {/* Inline image */}
            {content.inlineImage && (
              <figure className="my-10">
                <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-white/5">
                  <img
                    src={content.inlineImage.src}
                    alt={content.inlineImage.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
                {content.inlineImage.caption && (
                  <figcaption className="mt-3 text-center text-sm italic text-slate-500 dark:text-slate-400">
                    {content.inlineImage.caption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Sections */}
            {content.sections.map((section) => (
              <section key={section.id} id={section.id} className="mt-12 scroll-mt-28">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {section.title}
                </h2>
                <div className="mt-2 h-1 w-12 rounded-full bg-[#0d9eff]" />
                <div className="mt-6 space-y-5">
                  {section.blocks.map((b, i) => (
                    <Block key={i} block={b} />
                  ))}
                </div>
              </section>
            ))}

            {/* Conclusion */}
            <section id="kesimpulan" className="mt-14 scroll-mt-28">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Kesimpulan
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-[#0d9eff]" />
              <p className="mt-6 text-slate-700 dark:text-slate-300 leading-[1.85] text-[17px] text-justify hyphens-auto">
                {content.conclusion}
              </p>
            </section>

            {/* References */}
            {content.references && content.references.length > 0 && (
              <section className="mt-14">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Referensi Utama
                </h2>
                <ol className="mt-6 space-y-3">
                  {content.references.map((r, i) => (
                    <li
                      key={i}
                      className="flex gap-4 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed"
                    >
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 text-xs font-semibold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Share */}
            <section className="mt-14 pt-8 border-t border-slate-200 dark:border-white/5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Bagikan artikel ini
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Jika tulisan ini bermanfaat, bantu sebarkan ke teman atau rekan
                kerja Anda.
              </p>
              <div className="mt-5">
                <ShareButtons url={shareUrl} title={post.title} />
              </div>
            </section>

            {/* Author card */}
            <section className="mt-12 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03]">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-900 ring-4 ring-[#0d9eff]/40 flex-shrink-0">
                  <img
                    src={profile.researchPortrait}
                    alt={post.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Ditulis oleh
                  </p>
                  <h4 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                    {post.author.name}
                  </h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {post.author.role}
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="mt-10 rounded-3xl overflow-hidden bg-gradient-to-br from-[#0d9eff] to-[#0a7dd1] p-8 md:p-10 text-white relative">
              <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/10" />
              <div className="relative">
                <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                  Mari berdiskusi lebih lanjut
                </h3>
                <p className="mt-3 text-white/90 leading-relaxed max-w-xl">
                  {content.cta ||
                    'Tertarik berdiskusi tentang etika bisnis, digital marketing, atau transformasi digital? Hubungi saya melalui halaman Contact.'}
                </p>
                <Link
                  to="/contact"
                  className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#0d9eff] font-semibold hover:bg-slate-100 transition-colors"
                >
                  Hubungi Saya <ArrowRight size={18} />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-slate-50 dark:bg-white/[0.02] py-16">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Artikel Terkait
                </h2>
                <div className="mt-2 h-1 w-12 rounded-full bg-[#0d9eff]" />
              </div>
              <Link
                to="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[#0d9eff] font-medium hover:underline"
              >
                Lihat semua <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/blog/${r.slug}`}
                  className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:border-[#0d9eff]/60 hover:shadow-xl hover:shadow-[#0d9eff]/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#0d9eff] px-3 py-1 rounded-full">
                      {r.tag}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-[#0d9eff] transition-colors line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {r.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} /> {r.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {r.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
};

export default BlogPost;
