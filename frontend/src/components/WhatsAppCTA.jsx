import React from 'react';
import { MessageCircle, ArrowUpRight } from 'lucide-react';

/**
 * Tombol CTA hijau WhatsApp yang dipakai halaman landing kelas.
 * onClick dipakai untuk mengirim event Meta Pixel sebelum tab WhatsApp dibuka;
 * link tetap target="_blank" supaya halaman tidak ditinggalkan.
 */
const WhatsAppCTA = ({
  href,
  label = 'Pesan Seat',
  size = 'lg',
  className = '',
  onClick,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] font-bold text-white shadow-lg shadow-[#25D366]/30 hover:bg-[#1eb455] hover:shadow-xl hover:shadow-[#25D366]/40 hover:-translate-y-0.5 transition-all duration-300 ${
      size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base'
    } ${className}`}
  >
    <MessageCircle size={size === 'lg' ? 22 : 18} />
    {label}
    <ArrowUpRight
      size={size === 'lg' ? 20 : 16}
      className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300"
    />
  </a>
);

export default WhatsAppCTA;
