/**
 * Penghubung ke API invoice & kursi Kelas Lanjutan (backend/lanjutan_api.py).
 *
 * Menggantikan lib/kursiApi.js yang dulu menembak Google Apps Script. Bedanya
 * bukan cuma alamat:
 *
 *  - Alamatnya relatif (/api/lanjutan), jadi dilayani nginx di server yang sama
 *    dengan situsnya. Tidak ada lagi alamat skrip Google yang ikut tertanam di
 *    berkas JavaScript situs.
 *  - Tidak ada lagi "kunci penyimpanan" yang harus diketik pengelola dan
 *    disimpan di peramban. Admin login sekali, server menerbitkan cookie sesi
 *    HttpOnly — kata sandinya tidak pernah ada di kode situs maupun di
 *    localStorage.
 *
 * `kursi()` dipanggil landing page yang terbuka untuk umum, jadi jawabannya
 * sengaja hanya berisi angka: kuota, terisi, sisa. Tidak ada nama anak maupun
 * nomor telepon yang bisa terbaca dari sana.
 */

const AWAL = '/api/lanjutan';

const panggil = async (jalur, opsi = {}) => {
  try {
    const res = await fetch(`${AWAL}${jalur}`, {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(opsi.body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...opsi,
    });
    let isi = null;
    try {
      isi = await res.json();
    } catch (_) {
      // Jawaban bukan JSON (mis. halaman galat nginx): ditangani di bawah.
    }
    if (res.ok && isi) return { ok: true, status: res.status, ...isi };
    return {
      ok: false,
      status: res.status,
      kode: (isi && isi.kode) || 'galat',
      pesan:
        (isi && isi.pesan) ||
        (res.status === 404
          ? 'Layanan invoice belum aktif di server ini.'
          : `Server menjawab ${res.status}.`),
    };
  } catch (_) {
    return {
      ok: false,
      status: 0,
      kode: 'jaringan',
      pesan: 'Tidak bisa menghubungi server. Periksa koneksi internet.',
    };
  }
};

/** Login admin: server membalas dengan cookie sesi (HttpOnly), bukan kotak login peramban. */
export const masuk = (pengguna, sandi) =>
  panggil('/admin/masuk', { method: 'POST', body: JSON.stringify({ pengguna, sandi }) });

export const keluar = () => panggil('/admin/keluar', { method: 'POST', body: '{}' });

/** Cek apakah cookie sesi masih berlaku. 401 = belum login, bukan kesalahan. */
export const cekSesi = () => panggil('/admin/sesi');

/**
 * Sisa kursi tiap kelas untuk landing page.
 *
 * Mengembalikan {creator:{kuota,terisi,sisa}, ...} atau null kalau layanannya
 * belum aktif atau sedang bermasalah. Sengaja null, bukan melempar galat:
 * halaman iklan tidak boleh rusak hanya karena backend-nya sedang mati — ia
 * tinggal menampilkan kuota statis seperti sebelum ada API.
 */
export const ambilKursi = async () => {
  const r = await panggil('/kursi');
  return r.ok && r.kursi ? r.kursi : null;
};

/** Terbitkan invoice baru (perlu login admin). */
export const simpanInvoice = (data, izinkanLebih = false) =>
  panggil('/admin/invoice', {
    method: 'POST',
    body: JSON.stringify({ ...data, izinkan_lebih: izinkanLebih }),
  });

/** Daftar invoice yang sudah terbit, terbaru dulu (perlu login admin). */
export const daftarInvoice = () => panggil('/admin/invoice');

/** Isi satu invoice berdasarkan kodenya. Publik: siapa pun yang punya kodenya. */
export const ambilInvoice = (kode) =>
  panggil(`/invoice/${encodeURIComponent(kode)}`);

export const tautanInvoice = (kode) => `${window.location.origin}/invoice/${kode}`;
export const tautanCek = (kode) => `${window.location.origin}/cek/${kode}`;
