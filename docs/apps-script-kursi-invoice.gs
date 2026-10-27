/**
 * ============================================================================
 *  Backend ringan Future Makers — Google Apps Script
 * ============================================================================
 *
 *  Situs rikiaprianto.com adalah situs statis tanpa server, jadi skrip inilah
 *  yang menjadi jembatannya ke Google Drive:
 *
 *   - MENYIMPAN  : halaman /buat-invoice mengirim data invoice ke sini, lalu
 *                  dicatat satu baris per anak di spreadsheet.
 *   - MEMBACA    : landing page menanyakan sisa kursi tiap kelas ke sini.
 *                  Jawabannya hanya berisi angka kuota, terisi, dan sisa —
 *                  TIDAK ADA nama anak maupun nomor telepon, supaya data
 *                  pribadi tidak pernah keluar ke halaman publik.
 *
 * ----------------------------------------------------------------------------
 *  CARA MEMASANG (sekali saja, sekitar 3 menit)
 * ----------------------------------------------------------------------------
 *  1. Buka spreadsheet "Data Invoice & Kursi Kelas Future Makers".
 *  2. Menu Ekstensi > Apps Script.
 *  3. Hapus isi Code.gs, tempel SELURUH isi berkas ini.
 *  4. Ganti nilai KUNCI_RAHASIA di bawah dengan kata sandi karangan Anda
 *     sendiri (bebas, misal "futuremakers-2027-xYz"). Catat, nanti dipakai.
 *  5. Klik Simpan, lalu Deploy > New deployment.
 *       - Select type  : Web app
 *       - Execute as   : Me (rikiaprianto2104@gmail.com)
 *       - Who has access: Anyone
 *  6. Klik Deploy. Google akan meminta izin — itu izin untuk skrip Anda
 *     sendiri, setujui. Kalau muncul layar "Google hasn't verified this app",
 *     klik Advanced > Go to ... (unsafe); ini wajar untuk skrip pribadi.
 *  7. Salin "Web app URL" yang muncul, bentuknya:
 *       https://script.google.com/macros/s/AKfycb..../exec
 *     Kirimkan URL itu dan KUNCI_RAHASIA-nya untuk dipasang di situs.
 *
 *  Kalau nanti skrip ini diubah, deploy ulang lewat Deploy > Manage
 *  deployments > ikon pensil > Version: New version > Deploy, supaya URL-nya
 *  tidak berubah.
 * ============================================================================
 */

var ID_SPREADSHEET = '1beVsat1z9EoOyVQ8Yu3fSXSdVtruzBcz7lG7NoA5Wpw';
var NAMA_TAB = 'Invoice';

/** Ganti dengan kata sandi karangan Anda sendiri. */
var KUNCI_RAHASIA = 'GANTI-KUNCI-INI';

/** Kuota kursi tiap kelas. Samakan dengan yang tertulis di situs. */
var KUOTA = { creator: 8, champions: 6, private: 3 };

/** Baris dengan status ini tidak dihitung memakai kursi. */
var STATUS_BATAL = ['batal', 'dibatalkan', 'cancel'];

// ---------------------------------------------------------------------------

function sheetInvoice_() {
  var buku = SpreadsheetApp.openById(ID_SPREADSHEET);
  var tab = buku.getSheetByName(NAMA_TAB);
  if (!tab) {
    // Berkas dibuat dari CSV sehingga tab pertamanya bisa bernama lain.
    tab = buku.getSheets()[0];
    tab.setName(NAMA_TAB);
  }
  return tab;
}

function idKelas_(teks) {
  var t = String(teks || '').toLowerCase();
  if (t.indexOf('champion') >= 0) return 'champions';
  if (t.indexOf('private') >= 0) return 'private';
  if (t.indexOf('creator') >= 0) return 'creator';
  return '';
}

function jawab_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Hitung kursi terpakai per kelas dari seluruh baris yang tercatat. */
function hitungKursi_() {
  var tab = sheetInvoice_();
  var nilai = tab.getDataRange().getValues();
  var hasil = {};
  Object.keys(KUOTA).forEach(function (id) {
    hasil[id] = { kuota: KUOTA[id], terisi: 0, sisa: KUOTA[id] };
  });

  for (var i = 1; i < nilai.length; i++) {
    var baris = nilai[i];
    var kelas = idKelas_(baris[7]); // kolom H: Kelas
    if (!kelas || !hasil[kelas]) continue;
    var status = String(baris[10] || '').toLowerCase(); // kolom K: Status
    var batal = STATUS_BATAL.some(function (s) {
      return status.indexOf(s) >= 0;
    });
    if (batal) continue;
    hasil[kelas].terisi += 1;
  }

  Object.keys(hasil).forEach(function (id) {
    hasil[id].sisa = Math.max(0, hasil[id].kuota - hasil[id].terisi);
  });
  return hasil;
}

/** Dipanggil landing page. Hanya mengembalikan angka kursi. */
function doGet(e) {
  var aksi = (e && e.parameter && e.parameter.action) || 'kursi';
  if (aksi !== 'kursi') {
    return jawab_({ ok: false, pesan: 'Aksi tidak dikenali.' });
  }
  try {
    return jawab_({ ok: true, kursi: hitungKursi_(), waktu: new Date().toISOString() });
  } catch (err) {
    return jawab_({ ok: false, pesan: String(err) });
  }
}

/** Dipanggil halaman /buat-invoice untuk mencatat invoice baru. */
function doPost(e) {
  try {
    var isi = JSON.parse(e.postData.contents);
    if (isi.kunci !== KUNCI_RAHASIA) {
      return jawab_({ ok: false, pesan: 'Kunci tidak cocok.' });
    }

    var inv = isi.invoice || {};
    var anak = inv.anak || [];
    if (!anak.length) {
      return jawab_({ ok: false, pesan: 'Tidak ada data peserta.' });
    }

    var tab = sheetInvoice_();

    // Nomor invoice yang sama tidak dicatat dua kali.
    var nilai = tab.getDataRange().getValues();
    for (var i = 1; i < nilai.length; i++) {
      if (String(nilai[i][1]) === String(inv.no)) {
        return jawab_({
          ok: false,
          sudahAda: true,
          pesan: 'Nomor invoice ini sudah pernah dicatat.',
          kursi: hitungKursi_(),
        });
      }
    }

    var sekarang = new Date();
    var sisa = Math.max(0, (inv.total || 0) - (inv.dibayar || 0));
    var barisBaru = anak.map(function (a) {
      return [
        sekarang,
        inv.no || '',
        inv.tgl || '',
        inv.ortu || '',
        inv.wa || '',
        inv.jalur === 'alumni' ? 'Alumni' : 'Umum',
        a.n || '',
        a.kelasNama || a.k || '',
        a.h || 0,
        inv.metode === 'cicilan' ? 'Cicilan 5x' : 'Lunas',
        inv.status || '',
        inv.total || 0,
        inv.dibayar || 0,
        sisa,
        inv.catatan || '',
        isi.token || '',
      ];
    });

    tab
      .getRange(tab.getLastRow() + 1, 1, barisBaru.length, barisBaru[0].length)
      .setValues(barisBaru);

    return jawab_({ ok: true, dicatat: barisBaru.length, kursi: hitungKursi_() });
  } catch (err) {
    return jawab_({ ok: false, pesan: String(err) });
  }
}
