/**
 * Membuat PDF invoice Kelas Lanjutan (A4) langsung di peramban.
 *
 * Tata letaknya sengaja dibuat sama dengan invoice Kelas Explorer
 * (lib/invoicePdf.js) supaya orang tua menerima dokumen yang terasa dari
 * penerbit yang sama. Bedanya satu invoice di sini bisa memuat sampai empat
 * anak dengan kelas dan harga masing-masing, serta bisa dibayar bertahap —
 * jadi tabel pesertanya berulang dan cap statusnya tidak selalu "LUNAS".
 *
 * jsPDF dan qrcode dimuat dinamis, jadi hanya terunduh saat PDF benar-benar
 * dibuat dan tidak memberatkan halaman lain.
 *
 * QR di PDF berisi alamat /cek/<kode>. Halaman itu membaca data dari database
 * (bukan dari isi QR), jadi memindainya sekaligus membuktikan bahwa peserta
 * tersebut memang tercatat.
 */
import { kelasLanjutan as data } from '../data/kelasLanjutan';
import { rupiah, tanggalPanjang, PENERBIT } from './invoice';

const BIRU = [37, 99, 235];
const NAVY = [15, 27, 77];
const ABU = [71, 85, 105];
const ABU_MUDA = [148, 163, 184];
const LATAR = [238, 244, 255];
const HIJAU = [22, 163, 74];
const AMBER = [180, 83, 9];
const MERAH = [190, 18, 60];

const kelasObjek = (id) => data.kelas.find((k) => k.id === id) || null;
const namaKelas = (id) => (kelasObjek(id) ? kelasObjek(id).nama : id);

/** Cap besar di kiri blok total: teksnya pendek, warnanya mengikuti status. */
const cap = (status) => {
  if (status === 'lunas') return { teks: 'LUNAS', warna: HIJAU };
  if (status === 'belum') return { teks: 'BELUM BAYAR', warna: MERAH };
  if (status === 'batal') return { teks: 'BATAL', warna: MERAH };
  if (status === 'dp') return { teks: 'DP DITERIMA', warna: AMBER };
  const ke = String(status).split('-')[1] || '';
  return { teks: `CICILAN ${ke}`, warna: AMBER };
};

export const namaBerkas = (inv) => `Invoice-${inv.nomor.replace(/\//g, '-')}.pdf`;

/**
 * @param {object} inv     invoice dari API ({kode, nomor, tanggal, peserta, ...})
 * @param {string} urlCek  alamat yang dimasukkan ke QR
 * @returns {Promise<import('jspdf').jsPDF>}
 */
export const buatPdfLanjutan = async (inv, urlCek) => {
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
    title: `Invoice ${inv.nomor}`,
    subject: 'Invoice pendaftaran Kelas Lanjutan Future Makers',
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

  const peserta = inv.peserta || [];

  // ---- Kop ----------------------------------------------------------------
  doc.setFillColor(...BIRU);
  doc.rect(0, 0, 210, 38, 'F');
  warna([255, 255, 255]);
  font('bold', 22);
  teks('FUTURE MAKERS', L, 17);
  font('normal', 9.5);
  teks('AI untuk Anak, Masa Depan Lebih Cerah', L, 24);
  font('normal', 8.5);
  teks(`${PENERBIT.kota}  ·  WhatsApp ${data.whatsapp.display}`, L, 30);

  font('bold', 22);
  teks('INVOICE', R, 17, { align: 'right' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  teks(inv.nomor, R, 25, { align: 'right' });
  font('normal', 9);
  teks(tanggalPanjang(inv.tanggal), R, 31, { align: 'right' });

  // ---- Ditagihkan kepada + kode -------------------------------------------
  let y = 52;
  warna(ABU_MUDA);
  font('bold', 8);
  teks('DITAGIHKAN KEPADA', L, y);
  teks('KODE PENDAFTARAN', R, y, { align: 'right' });
  warna(NAVY);
  font('bold', 14);
  teks(inv.nama_ortu, L, y + 7);
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  teks(inv.kode, R, y + 7, { align: 'right' });
  if (inv.wa) {
    warna(ABU);
    font('normal', 9.5);
    teks(`WhatsApp ${inv.wa}`, L, y + 13);
  }

  // ---- Rincian peserta -----------------------------------------------------
  y = 76;
  doc.setFillColor(...LATAR);
  doc.rect(L - 2, y, R - L + 4, 9, 'F');
  warna(NAVY);
  font('bold', 9);
  teks('Nama peserta', L, y + 6);
  teks('Kelas', 100, y + 6);
  teks('Biaya', R, y + 6, { align: 'right' });

  y += 16;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  peserta.forEach((p, i) => {
    const k = kelasObjek(p.kelas);
    warna(NAVY);
    font('bold', 11);
    teks(p.nama, L, y);
    warna(ABU);
    font('normal', 9);
    teks(`Peserta ke-${i + 1}`, L, y + 5.5);

    warna(NAVY);
    font('bold', 11);
    teks(namaKelas(p.kelas), 100, y);
    warna(ABU);
    font('normal', 9);
    teks(
      k ? `${k.jumlahPertemuan} pertemuan · maks ${k.kursi} anak` : '',
      100,
      y + 5.5
    );

    warna(NAVY);
    font('bold', 11);
    teks(rupiah(p.harga), R, y, { align: 'right' });

    y += 9;
    doc.line(L - 2, y, R + 2, y);
    y += 7;
  });

  // ---- Total ---------------------------------------------------------------
  y += 3;
  const sisa = Math.max(0, (inv.total || 0) - (inv.dibayar || 0));
  const baris = (label, nilai, tebal = false, w = null) => {
    warna(ABU);
    font('normal', 10);
    teks(label, 120, y);
    warna(w || NAVY);
    font(tebal ? 'bold' : 'normal', tebal ? 12 : 10);
    teks(nilai, R, y, { align: 'right' });
    y += 7;
  };
  const yAwalTotal = y;
  baris('Total biaya', rupiah(inv.total));
  baris('Sudah dibayar', rupiah(inv.dibayar), false, HIJAU);
  doc.line(120, y - 3.5, R, y - 3.5);
  baris('Sisa pembayaran', rupiah(sisa), true, BIRU);

  warna(ABU);
  font('normal', 9);
  const perCicilan = Math.round((inv.total || 0) / data.cicilan.jumlah);
  teks(
    inv.metode === 'cicilan'
      ? `Metode pembayaran: Cicilan ${data.cicilan.jumlah}x · ${rupiah(perCicilan)} per bulan`
      : 'Metode pembayaran: Lunas',
    120,
    y
  );
  if (inv.referral) {
    teks(`Kode referral: ${inv.referral}`, 120, y + 5);
  }

  // Cap status, sejajar dengan blok total di sebelah kanannya.
  const c = cap(inv.status);
  doc.setDrawColor(...c.warna);
  doc.setLineWidth(0.9);
  doc.roundedRect(L, yAwalTotal - 5, 62, 15, 2, 2, 'S');
  warna(c.warna);
  font('bold', c.teks.length > 7 ? 14 : 20);
  teks(c.teks, L + 31, yAwalTotal + 5.5, { align: 'center' });
  doc.setLineWidth(0.3);

  // ---- Jadwal & rekening ---------------------------------------------------
  y += 14;
  // Hanya kelas yang benar-benar dipesan di invoice ini yang ditampilkan.
  const kelasDipakai = [...new Set(peserta.map((p) => p.kelas))];
  const tinggi = 20 + kelasDipakai.length * 5.5;
  doc.setFillColor(...LATAR);
  doc.roundedRect(L - 2, y, R - L + 4, tinggi, 3, 3, 'F');
  warna(BIRU);
  font('bold', 9);
  teks('JADWAL KELAS', L + 3, y + 7);
  warna(NAVY);
  font('bold', 10);
  teks(`Satu semester · ${data.semester.rentang}`, L + 3, y + 13.5);
  warna(ABU);
  font('normal', 9);
  let yJadwal = y + 19.5;
  kelasDipakai.forEach((id) => {
    const k = kelasObjek(id);
    if (!k) return;
    teks(
      `${k.nama}: ${k.jumlahPertemuan} pertemuan, ${k.hari}${
        k.jam === 'menyesuaikan' ? '' : ` pukul ${k.jam}`
      }  ·  ${data.lokasi}`,
      L + 3,
      yJadwal
    );
    yJadwal += 5.5;
  });
  y += tinggi;

  // Rekening pembayaran: tanpa ini orang tua harus bertanya lagi lewat WhatsApp.
  y += 8;
  warna(ABU);
  font('normal', 9);
  teks(
    `Pembayaran ditransfer ke ${data.rekening.bank} ${data.rekening.nomor} a.n. ${data.rekening.atasNama}`,
    L,
    y
  );
  y += 5;

  if (inv.catatan) {
    y += 4;
    const barisCatatan = doc.splitTextToSize(`Catatan: ${inv.catatan}`, R - L);
    teks(barisCatatan, L, y);
    y += barisCatatan.length * 4.5;
  }

  // ---- QR + tanda tangan ---------------------------------------------------
  // Invoice empat anak jauh lebih panjang daripada satu anak. Kalau blok QR
  // tidak lagi muat di atas kaki halaman, ia pindah ke halaman kedua utuh —
  // lebih baik daripada tercetak menimpa kaki halaman atau terpotong.
  let yQr = Math.max(y + 12, 222);
  if (yQr + 42 > 282) {
    doc.addPage();
    yQr = 40;
  }
  doc.setDrawColor(226, 232, 240);
  doc.line(L - 2, yQr - 6, R + 2, yQr - 6);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(L - 2, yQr - 2, 44, 44, 2, 2, 'S');
  doc.addImage(qr, 'PNG', L, yQr, 40, 40);

  warna(NAVY);
  font('bold', 9.5);
  teks('Pindai untuk memeriksa status pendaftaran', L + 48, yQr + 8);
  warna(ABU);
  font('normal', 8.5);
  teks(
    doc.splitTextToSize(
      'QR ini membuka halaman yang membaca data langsung dari database Future Makers, sehingga peserta yang tampil sudah pasti tercatat.',
      68
    ),
    L + 48,
    yQr + 14
  );
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  warna(NAVY);
  teks(inv.kode, L + 48, yQr + 38);

  warna(ABU);
  font('normal', 9);
  teks(`${PENERBIT.kota}, ${tanggalPanjang(inv.tanggal)}`, R, yQr + 6, { align: 'right' });
  warna(NAVY);
  font('bold', 10.5);
  teks(PENERBIT.nama, R, yQr + 32, { align: 'right' });
  warna(ABU);
  font('normal', 9);
  teks(PENERBIT.peran, R, yQr + 37, { align: 'right' });

  // ---- Kaki halaman --------------------------------------------------------
  const jumlahHalaman = doc.getNumberOfPages();
  for (let h = 1; h <= jumlahHalaman; h += 1) {
    doc.setPage(h);
    doc.setFillColor(...BIRU);
    doc.rect(0, 288, 210, 9, 'F');
    warna([255, 255, 255]);
    font('normal', 8);
    teks(
      `${data.kontak.email}  ·  rikiaprianto.com  ·  WhatsApp ${data.whatsapp.display}`,
      105,
      293.5,
      { align: 'center' }
    );
    if (jumlahHalaman > 1) {
      teks(`${h}/${jumlahHalaman}`, R, 293.5, { align: 'right' });
    }
  }

  return doc;
};
