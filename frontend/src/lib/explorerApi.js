/**
 * Penghubung ke API pendaftar Kelas Explorer (backend/explorer_api.py).
 *
 * Alamatnya relatif (/api/explorer), jadi di server dilayani nginx dan saat
 * pengembangan diteruskan ke localhost:8787 lewat "proxy" di package.json.
 *
 * Login admin memakai HTTP Basic bawaan peramban: saat jawaban 401 datang,
 * peramban sendiri memunculkan kotak login dan mengingatnya selama sesi.
 * Tidak ada kunci atau kata sandi yang ditulis di sini atau di formulir.
 */

const AWAL = '/api/explorer';

const panggil = async (jalur, opsi = {}) => {
  try {
    const res = await fetch(`${AWAL}${jalur}`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(opsi.body ? { 'Content-Type': 'application/json' } : {}) },
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
          ? 'Layanan pendaftaran belum aktif di server ini.'
          : `Server menjawab ${res.status}.`),
    };
  } catch (_) {
    return { ok: false, status: 0, kode: 'jaringan', pesan: 'Tidak bisa menghubungi server. Periksa koneksi internet.' };
  }
};

/** Cek login admin + jumlah kursi terisi. */
export const cekSesi = () => panggil('/admin/sesi');

/** Simpan pendaftar baru. `izinkanLebih` hanya dikirim setelah pengelola menyetujui kuota terlampaui. */
export const simpanPendaftar = (data, izinkanLebih = false) =>
  panggil('/admin/pendaftar', {
    method: 'POST',
    body: JSON.stringify({ ...data, ...(izinkanLebih ? { izinkan_lebih: true } : {}) }),
  });

/** Daftar pendaftar tersimpan (admin), terbaru dulu. */
export const daftarPendaftar = () => panggil('/admin/pendaftar');

/** Ambil satu pendaftar lewat kode (publik, nomor WhatsApp sudah disamarkan). */
export const ambilPendaftar = (kode) => panggil(`/pendaftar/${encodeURIComponent(kode)}`);

export const tautanInvoice = (kode) => `${window.location.origin}/invoice/${kode}`;
export const tautanCek = (kode) => `${window.location.origin}/cek/${kode}`;
