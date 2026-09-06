import React from 'react';
import { Linkedin, Instagram, Youtube, Mail } from 'lucide-react';
import { profile, socials } from '../mock';

const iconMap = {
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  mail: Mail,
};

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b1220]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {profile.name}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">
              {profile.shortBio}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Contact Information
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>Email: {profile.email}</li>
              <li>Phone: {profile.phone}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Connect
            </h3>
            <div className="mt-4 flex items-center gap-3">
              {socials.map((s) => {
                const Icon = iconMap[s.icon] || Mail;
                return (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    className="w-10 h-10 rounded-lg bg-[#eaf6ff] dark:bg-white/5 flex items-center justify-center text-[#0d9eff] hover:bg-[#0d9eff] hover:text-white transition-colors duration-200"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/5 text-center text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
