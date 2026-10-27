/**
 * Encode & decode data invoice ke dalam URL.
 *
 * Situs ini tidak punya basis data, jadi seluruh isi invoice dititipkan di
 * alamatnya sendiri: halaman invoice dan halaman verifikasi membaca data yang
 * sama dari parameter ?d=. Konsekuensinya, tautan invoice bersifat rahasia —
 * siapa pun yang memegang tautannya bisa membukanya.
 *
 * Sidik (checksum) di belakang token hanya menangkap tautan yang terpotong atau
 * berubah tidak sengaja. Ini BUKAN tanda tangan kriptografis: orang yang paham
 * teknis tetap bisa menyusun tautan sendiri. Untuk invoice kelas, perlindungan
 * sebesar ini memadai; kalau nanti perlu bukti yang tidak bisa dipalsukan,
 * datanya harus disimpan di server.
 */

const SALT = 'future-makers-invoice-v1';

const keBase64Url = (teks) => {
  const byte = new TextEncoder().encode(teks);
  let biner = '';
  byte.forEach((b) => {
    biner += String.fromCharCode(b);
  });
  return btoa(biner).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const dariBase64Url = (teks) => {
  const dasar = teks.replace(/-/g, '+').replace(/_/g, '/');
  const biner = atob(dasar.padEnd(Math.ceil(dasar.length / 4) * 4, '='));
  const byte = Uint8Array.from(biner, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(byte);
};

const sidik = (teks) => {
  let h = 5381;
  const isi = teks + SALT;
  for (let i = 0; i < isi.length; i += 1) {
    h = ((h * 33) ^ isi.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
};

/** Ubah objek invoice menjadi token untuk dipasang di ?d= */
export const buatToken = (data) => {
  const json = JSON.stringify(data);
  return `${keBase64Url(json)}.${sidik(json)}`;
};

/**
 * Baca token kembali menjadi objek invoice.
 * @returns {{ok: boolean, data: object|null, alasan: string|null}}
 */
export const bacaToken = (token) => {
  if (!token) return { ok: false, data: null, alasan: 'Tautan tidak memuat data invoice.' };
  const pisah = token.split('.');
  if (pisah.length !== 2) {
    return { ok: false, data: null, alasan: 'Format tautan tidak dikenali.' };
  }
  try {
    const json = dariBase64Url(pisah[0]);
    if (sidik(json) !== pisah[1]) {
      return {
        ok: false,
        data: null,
        alasan: 'Tautan tidak cocok dengan isinya. Kemungkinan terpotong saat disalin.',
      };
    }
    return { ok: true, data: JSON.parse(json), alasan: null };
  } catch (_) {
    return { ok: false, data: null, alasan: 'Tautan rusak atau tidak lengkap.' };
  }
};

export const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

export const tanggalPanjang = (iso) => {
  if (!iso) return '-';
  const d = new Date(`${iso}T00:00:00+07:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
};

export const PENERBIT = {
  nama: 'Riki Aprianto, S.M.',
  peran: 'Pengelola Future Makers',
  brand: 'Future Makers',
  kota: 'Yogyakarta',
};
