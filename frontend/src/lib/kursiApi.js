/**
 * Penghubung ke Google Apps Script yang menyimpan invoice di Drive dan
 * melaporkan sisa kursi tiap kelas.
 *
 * Alamat skripnya diatur lewat REACT_APP_KURSI_API di frontend/.env. Alamat
 * ini memang ikut terbaca di berkas JavaScript situs, dan itu tidak apa-apa:
 * jalur bacanya hanya mengembalikan angka kursi.
 *
 * KUNCI RAHASIA SENGAJA TIDAK DISIMPAN DI SINI. Variabel REACT_APP_* ikut
 * tertanam di berkas JavaScript yang diunduh setiap pengunjung, sehingga kunci
 * yang ditaruh di sana sama saja dengan diumumkan. Kuncinya diketik sekali
 * oleh pengelola di halaman /buat-invoice dan disimpan di localStorage
 * peramban miliknya sendiri, lalu dikirim sebagai argumen ke simpanInvoice.
 *
 * Selama alamat belum diisi, seluruh fungsi di sini diam saja dan situs tetap
 * berjalan memakai kuota statis — landing page tidak boleh rusak hanya karena
 * backend-nya belum terpasang atau sedang bermasalah.
 */

const ALAMAT = (process.env.REACT_APP_KURSI_API || '').trim();

export const apiTersedia = () => ALAMAT !== '';

/**
 * Ambil sisa kursi tiap kelas.
 * @returns {Promise<object|null>} {creator:{kuota,terisi,sisa}, ...} atau null
 *   bila belum disetel, gagal, atau terlalu lama menjawab.
 */
export const ambilKursi = async () => {
  if (!apiTersedia()) return null;
  try {
    const batal = new AbortController();
    const waktu = setTimeout(() => batal.abort(), 6000);
    const res = await fetch(`${ALAMAT}?action=kursi`, {
      signal: batal.signal,
      redirect: 'follow',
    });
    clearTimeout(waktu);
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.ok ? data.kursi : null;
  } catch (_) {
    // Jaringan putus, skrip mati, atau CORS ditolak: diam dan pakai kuota statis.
    return null;
  }
};

/**
 * Catat invoice ke spreadsheet.
 * Memakai Content-Type text/plain supaya tidak memicu preflight CORS yang
 * tidak dilayani Apps Script.
 */
export const simpanInvoice = async (invoice, token, kunci) => {
  if (!apiTersedia()) {
    return { ok: false, pesan: 'Alamat penyimpanan belum disetel di .env.' };
  }
  if (!kunci) {
    return { ok: false, pesan: 'Kunci penyimpanan belum diisi.' };
  }
  try {
    const res = await fetch(ALAMAT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ kunci, invoice, token }),
      redirect: 'follow',
    });
    if (!res.ok) return { ok: false, pesan: `Server menjawab ${res.status}.` };
    return await res.json();
  } catch (err) {
    return { ok: false, pesan: 'Tidak bisa menghubungi penyimpanan Drive.' };
  }
};
