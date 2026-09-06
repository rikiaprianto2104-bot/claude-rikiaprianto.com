import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { navItems } from '../mock';

const Navbar = () => {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        scrolled
          ? 'bg-white/85 dark:bg-[#0b1220]/85 backdrop-blur-md border-b border-slate-200/70 dark:border-white/5'
          : 'bg-white dark:bg-[#0b1220] border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 font-bold text-2xl tracking-tight">
          <span className="text-[#0d9eff]">R</span>
          <span className="text-slate-900 dark:text-white">iki&nbsp;MarkeThink</span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `relative text-[15px] font-medium transition-colors duration-200 py-2 ${
                  isActive
                    ? 'text-[#0d9eff]'
                    : 'text-slate-700 dark:text-slate-200 hover:text-[#0d9eff] dark:hover:text-[#0d9eff]'
                }`
              }
            >
              {({ isActive }) => (
                <span className="inline-block">
                  {item.label}
                  <span
                    className={`absolute left-0 right-0 -bottom-0.5 mx-auto h-[2px] rounded-full bg-[#0d9eff] transition-all duration-300 ${
                      isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className="md:hidden p-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out border-t border-slate-200/70 dark:border-white/5 ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <nav className="px-6 py-4 flex flex-col gap-1 bg-white dark:bg-[#0b1220]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'text-[#0d9eff] bg-[#0d9eff]/10'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
