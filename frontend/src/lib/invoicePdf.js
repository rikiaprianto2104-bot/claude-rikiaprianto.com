/**
 * Membuat PDF invoice Kelas Explorer (A4) langsung di peramban.
 *
 * jsPDF dan qrcode dimuat dinamis, jadi hanya terunduh saat PDF benar-benar
 * dibuat dan tidak memberatkan halaman lain.
 *
 * QR di PDF berisi alamat /cek/<kode>. Halaman itu membaca data pendaftar
 * dari database (bukan dari isi QR), jadi memindainya sekaligus membuktikan
 * bahwa pendaftar tersebut memang tercatat di database.
 */
import { kelasLanjutan as bersama } from '../data/kelasLanjutan';
import { kelasExplorer as kelas } from '../data/kelasExplorer';
import { rupiah, tanggalPanjang, PENERBIT } from './invoice';

const BIRU = [37, 99, 235];
const NAVY = [15, 27, 77];
const ABU = [71, 85, 105];
const ABU_MUDA = [148, 163, 184];
const LATAR = [238, 244, 255];
const HIJAU = [22, 163, 74];

const jadwalTeks = () =>
  kelas.jadwal.map((b) => `${b.tanggal.join(' & ')} ${b.bulan}`).join('  ·  ');

export const namaBerkas = (p) => `Invoice-${p.nomor.replace(/\//g, '-')}.pdf`;

/**
 * @param {object} p       pendaftar dari API ({kode, nomor, tanggal, nama_anak, ...})
 * @param {string} urlCek  alamat yang dimasukkan ke QR
 * @returns {Promise<import('jspdf').jsPDF>}
 */
export const buatPdf = async (p, urlCek) => {
  const [{ jsPDF }, QRCode] = await Promise.all([
    import('jspdf'),
    import('qrcode').then((m) => m.default || m),
  ]);

  const qr = await QRCode.toDataURL(urlCek, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 480,
    color: { dark: '#0f172a', light: '#ffffff' },
  });

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({
    title: `Invoice ${p.nomor}`,
    subject: 'Invoice pendaftaran Kelas Explorer',
    author: PENERBIT.brand,
  });

  const L = 18; // margin kiri
  const R = 192; // tepi kanan isi
  // Daftar baris (hasil splitTextToSize) harus tetap daftar, bukan di-String().
  const teks = (s, x, y, o = {}) => doc.text(Array.isArray(s) ? s : String(s), x, y, o);
  const warna = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const font = (gaya, ukuran) => {
    doc.setFont('helvetica', gaya);
    doc.setFontSize(ukuran);
  };

  // ---- Kop ----------------------------------------------------------------
  doc.setFillColor(...BIRU);
  doc.rect(0, 0, 210, 38, 'F');
  warna([255, 255, 255]);
  font('bold', 22);
  teks('FUTURE MAKERS', L, 17);
  font('normal', 9.5);
  teks('AI untuk Anak, Masa Depan Lebih Cerah', L, 24);
  font('normal', 8.5);
  teks(`${PENERBIT.kota}  ·  WhatsApp ${bersama.whatsapp.display}`, L, 30);

  font('bold', 22);
  teks('INVOICE', R, 17, { align: 'right' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  teks(p.nomor, R, 25, { align: 'right' });
  font('normal', 9);
  teks(tanggalPanjang(p.tanggal), R, 31, { align: 'right' });

  // ---- Ditagihkan kepada + kode --------------------------------------------
  let y = 52;
  warna(ABU_MUDA);
  font('bold', 8);
  teks('DITAGIHKAN KEPADA', L, y);
  teks('KODE PENDAFTARAN', R, y, { align: 'right' });
  warna(NAVY);
  font('bold', 14);
  teks(p.nama_ortu, L, y + 7);
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  teks(p.kode, R, y + 7, { align: 'right' });
  if (p.wa) {
    warna(ABU);
    font('normal', 9.5);
    teks(`WhatsApp ${p.wa}`, L, y + 13);
  }

  // ---- Rincian -------------------------------------------------------------
  y = 76;
  doc.setFillColor(...LATAR);
  doc.rect(L - 2, y, R - L + 4, 9, 'F');
  warna(NAVY);
  font('bold', 9);
  teks('Nama peserta', L, y + 6);
  teks('Kelas', 100, y + 6);
  teks('Biaya', R, y + 6, { align: 'right' });

  y += 17;
  warna(NAVY);
  font('bold', 11);
  teks(p.nama_anak, L, y);
  warna(ABU);
  font('normal', 9);
  teks(`Usia ${p.usia_anak} tahun`, L, y + 5.5);
  warna(NAVY);
  font('bold', 11);
  teks(kelas.nama, 100, y);
  warna(ABU);
  font('normal', 9);
  teks(`${kelas.jumlahPertemuan} pertemuan · maks ${kelas.kuota} anak`, 100, y + 5.5);
  warna(NAVY);
  font('bold', 11);
  teks(rupiah(p.harga), R, y, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(L - 2, y + 10, R + 2, y + 10);

  // ---- Total ---------------------------------------------------------------
  y += 20;
  const sisa = Math.max(0, p.harga - p.dibayar);
  const baris = (label, nilai, tebal = false, w = null) => {
    warna(ABU);
    font('normal', 10);
    teks(label, 120, y);
    warna(w || NAVY);
    font(tebal ? 'bold' : 'normal', tebal ? 12 : 10);
    teks(nilai, R, y, { align: 'right' });
    y += 7;
  };
  baris('Total biaya', rupiah(p.harga));
  baris('Sudah dibayar', rupiah(p.dibayar), false, HIJAU);
  doc.line(120, y - 3.5, R, y - 3.5);
  baris('Sisa pembayaran', rupiah(sisa), true, BIRU);
  warna(ABU);
  font('normal', 9);
  teks('Metode pembayaran: Lunas', 120, y);

  // Cap LUNAS
  doc.setDrawColor(...HIJAU);
  doc.setLineWidth(0.9);
  doc.roundedRect(L, y - 25, 44, 15, 2, 2, 'S');
  warna(HIJAU);
  font('bold', 20);
  teks('LUNAS', L + 22, y - 14.5, { align: 'center' });
  doc.setLineWidth(0.3);

  // ---- Jadwal --------------------------------------------------------------
  y += 14;
  doc.setFillColor(...LATAR);
  doc.roundedRect(L - 2, y, R - L + 4, 27, 3, 3, 'F');
  warna(BIRU);
  font('bold', 9);
  teks('JADWAL KELAS', L + 3, y + 7);
  warna(NAVY);
  font('bold', 10);
  teks(jadwalTeks(), L + 3, y + 14);
  warna(ABU);
  font('normal', 9);
  teks(
    `Setiap ${kelas.hari} pukul ${kelas.jam}  ·  ${kelas.lokasi}`,
    L + 3,
    y + 20
  );
  y += 27;

  if (p.catatan) {
    y += 8;
    warna(ABU);
    font('normal', 9);
    const barisCatatan = doc.splitTextToSize(`Catatan: ${p.catatan}`, R - L);
    teks(barisCatatan, L, y);
    y += barisCatatan.length * 4.5;
  }

  // ---- QR + tanda tangan ---------------------------------------------------
  const yQr = Math.max(y + 12, 222);
  doc.setDrawColor(226, 232, 240);
  doc.line(L - 2, yQr - 6, R + 2, yQr - 6);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(L - 2, yQr - 2, 44, 44, 2, 2, 'S');
  doc.addImage(qr, 'PNG', L, yQr, 40, 40);

  warna(NAVY);
  font('bold', 9.5);
  teks('Pindai untuk melihat data pendaftar', L + 48, yQr + 8);
  warna(ABU);
  font('normal', 8.5);
  teks(
    doc.splitTextToSize(
      'QR ini membuka halaman yang membaca data langsung dari database Future Makers, sehingga pendaftar yang tampil sudah pasti tercatat.',
      68
    ),
    L + 48,
    yQr + 14
  );
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  warna(NAVY);
  teks(p.kode, L + 48, yQr + 38);

  warna(ABU);
  font('normal', 9);
  teks(`${PENERBIT.kota}, ${tanggalPanjang(p.tanggal)}`, R, yQr + 6, { align: 'right' });
  warna(NAVY);
  font('bold', 10.5);
  teks(PENERBIT.nama, R, yQr + 32, { align: 'right' });
  warna(ABU);
  font('normal', 9);
  teks(PENERBIT.peran, R, yQr + 37, { align: 'right' });

  // ---- Kaki halaman --------------------------------------------------------
  doc.setFillColor(...BIRU);
  doc.rect(0, 288, 210, 9, 'F');
  warna([255, 255, 255]);
  font('normal', 8);
  teks(
    `${bersama.kontak.email}  ·  rikiaprianto.com  ·  WhatsApp ${bersama.whatsapp.display}`,
    105,
    293.5,
    { align: 'center' }
  );

  return doc;
};
