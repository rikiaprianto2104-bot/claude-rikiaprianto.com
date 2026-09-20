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
 * Kirim standard event Meta Pixel.
 * @param {string} event - nama standard event, mis. 'Lead' atau 'ViewContent'.
 * @param {object} [params] - parameter non-personal, mis. content_name.
 */
export const trackPixel = (event, params = {}) => {
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
