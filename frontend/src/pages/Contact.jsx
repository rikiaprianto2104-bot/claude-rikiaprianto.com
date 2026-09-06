import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { profile } from '../mock';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // Persist message locally as a mock
      const stored = JSON.parse(localStorage.getItem('riki-messages') || '[]');
      stored.unshift({ ...form, at: new Date().toISOString() });
      localStorage.setItem('riki-messages', JSON.stringify(stored));
      setLoading(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    }, 700);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Get in touch
        </h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          Have a project in mind or want to collaborate? I usually respond within 24 hours.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[
            { icon: Mail, label: 'Email', value: profile.email },
            { icon: Phone, label: 'Phone', value: profile.phone },
            { icon: MapPin, label: 'Location', value: profile.location },
          ].map((c) => (
            <div
              key={c.label}
              className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#eaf6ff] dark:bg-[#0d9eff]/10 flex items-center justify-center text-[#0d9eff] flex-shrink-0">
                <c.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  {c.label}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100 break-words">
                  {c.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={submit}
          className="lg:col-span-3 p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Name
              </label>
              <input
                required
                name="name"
                value={form.name}
                onChange={change}
                className="mt-2 w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1220] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#0d9eff] focus:outline-none focus:ring-2 focus:ring-[#0d9eff]/20 transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={change}
                className="mt-2 w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1220] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#0d9eff] focus:outline-none focus:ring-2 focus:ring-[#0d9eff]/20 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Subject
            </label>
            <input
              required
              name="subject"
              value={form.subject}
              onChange={change}
              className="mt-2 w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1220] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#0d9eff] focus:outline-none focus:ring-2 focus:ring-[#0d9eff]/20 transition-colors"
              placeholder="What is this about?"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Message
            </label>
            <textarea
              required
              name="message"
              rows={6}
              value={form.message}
              onChange={change}
              className="mt-2 w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1220] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#0d9eff] focus:outline-none focus:ring-2 focus:ring-[#0d9eff]/20 transition-colors resize-none"
              placeholder="Tell me a little about your project..."
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0d9eff] text-white font-medium shadow-lg shadow-[#0d9eff]/25 hover:bg-[#0a8de5] disabled:opacity-60 transition-colors duration-200"
            >
              {loading ? 'Sending...' : (<><Send size={16} /> Send Message</>)}
            </button>
            {sent && (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} /> Message sent
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
