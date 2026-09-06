import React from 'react';
import {
  Download,
  Briefcase,
  GraduationCap,
  Users,
  Award,
  ExternalLink,
  Trophy,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  profile,
  experiences,
  education,
  organizations,
  achievements,
  skillsCompetencies,
} from '../mock';

const SectionHeading = ({ icon: Icon, title }) => (
  <div>
    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
      {Icon && <Icon size={28} className="text-[#0d9eff]" />}
      {title}
    </h2>
    <div className="mt-3 h-1 w-16 rounded-full bg-[#0d9eff]" />
  </div>
);

const TimelineItem = ({ children }) => (
  <div className="relative">
    <span className="absolute -left-[33px] md:-left-[37px] top-1.5 w-4 h-4 rounded-full bg-[#0d9eff] ring-4 ring-white dark:ring-[#0b1220]" />
    {children}
  </div>
);

const Profile = () => {
  return (
    <div>
      {/* 1. HERO */}
      <section className="bg-gradient-to-b from-[#f4faff] to-white dark:from-[#0b1220] dark:to-[#0b1220]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
            <div className="relative">
              <div className="w-64 h-80 md:w-72 md:h-96 rounded-[50%] overflow-hidden bg-slate-900 ring-4 ring-[#0d9eff]/60 shadow-2xl">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Riki Aprianto, S.M.
              </h1>
              <p className="mt-4 text-xl text-[#0d9eff] font-medium">
                {profile.title}
              </p>
              <div className="mt-8 flex justify-center md:justify-start">
                <a
                  href="/assets/CV_Riki_Aprianto.pdf"
                  download="CV_Riki_Aprianto.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0d9eff] text-white font-medium shadow-lg shadow-[#0d9eff]/25 hover:bg-[#0a8de5] transition-colors duration-200"
                >
                  <Download size={18} />
                  Download CV
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT ME */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <SectionHeading title="About Me" />
        <p className="mt-8 text-slate-500 dark:text-slate-400 text-base md:text-lg leading-loose max-w-3xl text-justify hyphens-auto">
          {profile.about}
        </p>
      </section>

      {/* 2. WORK EXPERIENCE */}
      <section className="bg-slate-50 dark:bg-white/[0.02] py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <SectionHeading icon={Briefcase} title="Work Experience" />

          <div className="mt-10 relative pl-6 md:pl-8 border-l-2 border-slate-200 dark:border-white/10 space-y-12">
            {experiences.map((e, i) => (
              <TimelineItem key={i}>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                    {e.role}
                  </h3>
                  {e.badge && (
                    <span className="text-xs font-semibold text-[#0d9eff] bg-[#eaf6ff] dark:bg-[#0d9eff]/10 px-2.5 py-1 rounded-full">
                      {e.badge}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2">
                  <span className="text-[#0d9eff] font-medium">{e.period}</span>
                  {e.location && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} /> {e.location}
                      </span>
                    </>
                  )}
                </p>
                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl text-justify hyphens-auto">
                  {e.description}
                </p>
              </TimelineItem>
            ))}
          </div>
        </div>
      </section>

      {/* 3. EDUCATION + ORGANIZATION */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-14">
          {/* Education */}
          <div>
            <SectionHeading icon={GraduationCap} title="Education" />
            <div className="mt-10 relative pl-6 border-l-2 border-slate-200 dark:border-white/10 space-y-10">
              {education.map((e, i) => (
                <TimelineItem key={i}>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {e.degree}
                    </h3>
                    {e.badge && (
                      <span className="text-xs font-semibold text-[#0d9eff] bg-[#eaf6ff] dark:bg-[#0d9eff]/10 px-2.5 py-1 rounded-full">
                        {e.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="text-[#0d9eff] font-medium">
                      {e.period}
                    </span>{' '}
                    · {e.school}
                  </p>
                  {e.description && (
                    <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed text-justify hyphens-auto">
                      {e.description}
                    </p>
                  )}
                </TimelineItem>
              ))}
            </div>
          </div>

          {/* Organization */}
          <div>
            <SectionHeading icon={Users} title="Organization" />
            <div className="mt-10 relative pl-6 border-l-2 border-slate-200 dark:border-white/10 space-y-10">
              {organizations.map((o, i) => (
                <TimelineItem key={i}>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {o.role}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="text-[#0d9eff] font-medium">
                      {o.period}
                    </span>{' '}
                    · {o.org}
                  </p>
                  <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed text-justify hyphens-auto">
                    {o.description}
                  </p>
                </TimelineItem>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACHIEVEMENTS */}
      <section className="bg-slate-50 dark:bg-white/[0.02] py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <SectionHeading icon={Trophy} title="Achievements" />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((a, i) => (
              <article
                key={i}
                className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:border-[#0d9eff]/60 hover:shadow-xl hover:shadow-[#0d9eff]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-[#0d9eff] px-3 py-1 rounded-full shadow-lg">
                    {a.year}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                    {a.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-justify hyphens-auto flex-1">
                    {a.description}
                  </p>
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#0d9eff] hover:underline"
                  >
                    <Award size={16} />
                    View Certificate
                    <ExternalLink
                      size={14}
                      className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300"
                    />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SKILLS & COMPETENCIES */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <SectionHeading icon={Sparkles} title="Skills & Competencies" />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {skillsCompetencies.map((s) => (
            <div key={s.name}>
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-slate-800 dark:text-slate-100">
                  {s.name}
                </span>
                <span className="text-[#0d9eff] font-semibold">{s.level}%</span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0d9eff] transition-all duration-700"
                  style={{ width: `${s.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Profile;
