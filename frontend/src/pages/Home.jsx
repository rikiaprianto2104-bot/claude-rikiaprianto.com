import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, BarChart3, Sparkles, Target } from 'lucide-react';
import { profile, skills } from '../mock';

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f4faff] to-white dark:from-[#0b1220] dark:to-[#0b1220] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#0d9eff] font-semibold text-lg mb-6 tracking-wide">
                {profile.greeting}
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                {profile.name}
              </h1>
              <p className="mt-6 text-xl text-slate-600 dark:text-slate-300 font-medium">
                {profile.title}
              </p>
              <p className="mt-8 text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                {profile.heroDescription}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0d9eff] text-white font-medium shadow-lg shadow-[#0d9eff]/25 hover:bg-[#0a8de5] transition-colors duration-200"
                >
                  Contact Me <ArrowRight size={18} />
                </Link>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 font-medium border border-slate-200 dark:border-white/10 hover:border-[#0d9eff] hover:text-[#0d9eff] transition-colors duration-200"
                >
                  View My Work
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-3xl bg-[#0d9eff]/15 hidden lg:block" />
              <div className="absolute -bottom-4 -right-4 w-32 h-24 rounded-3xl bg-[#0d9eff]/15 hidden lg:block" />
              <div className="relative w-[280px] sm:w-[340px] h-[480px] sm:h-[560px] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/20">
                <img
                  src={profile.heroPortrait}
                  alt="Portrait"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            What I do
          </h2>
          <div className="mt-3 h-1 w-16 rounded-full bg-[#0d9eff]" />
          <p className="mt-6 text-slate-500 dark:text-slate-400">
            A blend of AI-powered tools and classic digital marketing fundamentals
            to deliver compounding growth.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Search,
              title: 'SEO & GEO',
              desc: 'Rank in Google and stay visible in AI search engines like ChatGPT and Perplexity.',
            },
            {
              icon: Sparkles,
              title: 'AI Marketing',
              desc: 'LLM-powered content workflows and automation that scale without losing quality.',
            },
            {
              icon: BarChart3,
              title: 'Analytics',
              desc: 'Attribution, dashboards, and decisions that turn raw data into revenue.',
            },
            {
              icon: Target,
              title: 'Strategy',
              desc: 'Full-funnel strategies aligned with measurable business outcomes.',
            },
          ].map((s) => (
            <div
              key={s.title}
              className="group p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 hover:border-[#0d9eff]/60 hover:shadow-xl hover:shadow-[#0d9eff]/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#eaf6ff] dark:bg-[#0d9eff]/10 flex items-center justify-center text-[#0d9eff] group-hover:bg-[#0d9eff] group-hover:text-white transition-colors duration-300">
                <s.icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="bg-slate-50 dark:bg-white/[0.02] py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Skills
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-[#0d9eff]" />
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {skills.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-slate-800 dark:text-slate-100">{s.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{s.level}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0d9eff] transition-all duration-700"
                    style={{ width: `${s.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-gradient-to-br from-[#0d9eff] to-[#0a7dd1] px-8 py-14 md:px-16 md:py-20 text-white relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -left-10 -bottom-16 w-56 h-56 rounded-full bg-white/10" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold">
              Let’s build something measurable.
            </h2>
            <p className="mt-4 text-white/90">
              From SEO foundations to AI-driven growth, I help teams turn marketing
              into a measurable engine for revenue.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#0d9eff] font-semibold hover:bg-slate-100 transition-colors duration-200"
            >
              Get in touch <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
