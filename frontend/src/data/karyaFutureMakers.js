/*
 * Karya siswa batch 1 Kelas Future Makers.
 *
 * Tiap anak punya:
 *   cover - gambar sampul game (sudah memuat nama anak), taruh di
 *           public/future-maker/karya/fm-b1-XXX/cover.webp
 *   href  - tujuan tombol Mulai, yaitu halaman game-nya.
 *
 * Anak yang cover/href-nya masih null DISEMBUNYIKAN dari halaman (lihat
 * KARYA_TAMPIL). Begitu keduanya diisi, kartunya muncul sendiri.
 *
 * Dipakai bersama oleh halaman Future Makers dan halaman Kelas Lanjutan.
 */
export const KARYA_SISWA = [
  { nomor: 'FM.B1-001', nama: 'Gardala Sangjalu GA', cover: null, href: null },
  { nomor: 'FM.B1-002', nama: 'Al Farras King S.B', cover: '/future-maker/karya/fm-b1-002/cover.webp', href: '/future-maker/karya/fm-b1-002/' },
  { nomor: 'FM.B1-003', nama: 'Farjana', cover: '/future-maker/karya/fm-b1-003/cover.webp', href: '/future-maker/karya/fm-b1-003/' },
  { nomor: 'FM.B1-004', nama: 'Muhammad Umar', cover: '/future-maker/karya/fm-b1-004/cover.webp', href: '/future-maker/karya/fm-b1-004/' },
  { nomor: 'FM.B1-005', nama: 'M. Arsene Putra Kurniawan', cover: '/future-maker/karya/fm-b1-005/cover.webp', href: '/future-maker/karya/fm-b1-005/' },
  { nomor: 'FM.B1-006', nama: 'Arshad Alvaronizam Arrafif', cover: null, href: null },
  { nomor: 'FM.B1-007', nama: 'Dzaky Almair', cover: '/future-maker/karya/fm-b1-007/cover.webp', href: '/future-maker/karya/fm-b1-007/' },
  { nomor: 'FM.B1-008', nama: 'M. Althaf Arrayhan', cover: '/future-maker/karya/fm-b1-008/cover.webp', href: '/future-maker/karya/fm-b1-008/' },
  { nomor: 'FM.B1-009', nama: 'M. Ahnaf Syauqi', cover: '/future-maker/karya/fm-b1-009/cover.webp', href: '/future-maker/karya/fm-b1-009/' },
  { nomor: 'FM.B1-010', nama: 'Muhammad Aksa', cover: '/future-maker/karya/fm-b1-010/cover.webp', href: '/future-maker/karya/fm-b1-010/' },
];

// Hanya yang sudah punya sampul dan game.
export const KARYA_TAMPIL = KARYA_SISWA.filter((k) => k.href && k.cover);
