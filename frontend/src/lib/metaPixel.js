/**
 * Helper tipis untuk Meta Pixel.
 *
 * Base code (fbq init + PageView) dipasang sekali di public/index.html,
 * dengan ID tunggal dari REACT_APP_META_PIXEL_ID (frontend/.env).
 * File ini hanya mengirim event tambahan dari sisi React.
 *
 * PENTING: jangan pernah mengirim data pribadi (nama, nomor HP, email,
 * alamat) sebagai parameter event.
 */

const isEnabled = () =>
  typeof window !== 'undefined' && typeof window.fbq === 'function';

/**
 * Teruskan event yang sama ke dataLayer Google tag (Google Ads), supaya satu
 * titik pemanggilan melapor ke dua platform. Hanya event konversi yang
 * diteruskan; tanpa data pribadi (parameter hanya nama konten & posisi tombol).
 * Nama event: meta_<event huruf kecil>, mis. meta_lead, meta_contact.
 */
const GOOGLE_EVENTS = ['Lead', 'Contact', 'InitiateCheckout'];

// Conversion action Google Ads (akun Kelas AI Jogja). ID & label bersifat publik.
const GOOGLE_CONVERSIONS = {
  InitiateCheckout: 'AW-18569154570/yJV5CNP4srYdEIqgu5ZF', // Klik Daftar
  Contact: 'AW-18569154570/aJRaCNb4srYdEIqgu5ZF', // WhatsApp Daftar Tunggu
};

const pushGoogleEvent = (event, params) => {
  if (typeof window === 'undefined' || !GOOGLE_EVENTS.includes(event)) return;
  try {
    if (GOOGLE_CONVERSIONS[event] && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: GOOGLE_CONVERSIONS[event],
      });
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: `meta_${event.toLowerCase()}`,
      content_name: params.content_name,
      content_type: params.content_type,
      button_position: params.button_position,
    });
  } catch (_) {
    // abaikan: pelacakan tidak boleh mengganggu halaman
  }
};

/**
 * Kirim standard event Meta Pixel.
 * @param {string} event - nama standard event, mis. 'Lead' atau 'ViewContent'.
 * @param {object} [params] - parameter non-personal, mis. content_name.
 */
export const trackPixel = (event, params = {}) => {
  pushGoogleEvent(event, params);
  if (!isEnabled()) return false;
  try {
    window.fbq('track', event, params);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Kirim event maksimal sekali per kunjungan (per tab, bertahan saat reload).
 * Dipakai untuk ViewContent supaya tidak dobel walau halaman di-scroll
 * naik-turun atau dibuka ulang dari cache.
 * @param {string} key - penanda unik event di sessionStorage.
 */
export const trackPixelOnce = (key, event, params = {}) => {
  if (typeof window === 'undefined') return false;

  const storageKey = `mp_sent_${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return false;
  } catch (_) {
    // Private mode / storage diblokir: lanjut saja, guard di komponen
    // sudah mencegah pengiriman berulang dalam satu pemuatan halaman.
  }

  const sent = trackPixel(event, params);
  if (!sent) return false;

  try {
    window.sessionStorage.setItem(storageKey, '1');
  } catch (_) {
    // abaikan
  }
  return true;
};
