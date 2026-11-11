import React from 'react';
import { useParams } from 'react-router-dom';
import InvoiceExplorer from './InvoiceExplorer';
import CekPendaftarExplorer from './CekPendaftarExplorer';
import Invoice from './Invoice';
import VerifikasiPeserta from './VerifikasiPeserta';

/**
 * Pemilah tautan pendek.
 *
 * Dua kelas memakai bentuk alamat yang sama — /invoice/<kode> dan /cek/<kode> —
 * supaya orang tua tidak perlu tahu halaman mana yang melayaninya. Yang
 * membedakan adalah awalan kodenya, dan awalan itu diterbitkan oleh server
 * masing-masing: EXP- dari API Kelas Explorer, LJT- dari API Kelas Lanjutan.
 *
 * Kode yang tidak dikenali diserahkan ke halaman Explorer, yang sudah punya
 * tampilan "tidak ditemukan" sendiri.
 */
const lanjutan = (kode) => String(kode || '').toUpperCase().startsWith('LJT-');

export const InvoiceKode = () => {
  const { kode = '' } = useParams();
  return lanjutan(kode) ? <Invoice /> : <InvoiceExplorer />;
};

export const CekKode = () => {
  const { kode = '' } = useParams();
  return lanjutan(kode) ? <VerifikasiPeserta /> : <CekPendaftarExplorer />;
};
