#!/usr/bin/env python3
"""Ubah video (mis. dari Google Flow) menjadi urutan gambar untuk film scroll Kelas AI Jogja.

Pemakaian:
    python tools/kelasaijogja/video-to-frames.py video.mp4 --nama hero --dari 0 --sampai 2

  --nama     nama klip (folder keluaran: kelasaijogja/assets/film/<nama>/)
  --dari     adegan awal tempat klip mulai diputar (0 = awal film)
  --sampai   adegan akhir klip. Klip diputar maju-mundur mengikuti scroll di antara dua angka ini.
             Peta adegan: 0 podium, 1 langit dan menembus pintu, 2 pertemuan 1, 3 pertemuan 2,
             4 pertemuan 3, 5 Demo Day (keluar ke podium), 6 = akhir film.
  --fps      jumlah frame per detik video yang diambil (bawaan 24). Makin tinggi makin halus dan berat.
  --lebar    lebar frame (bawaan 1280). Rasio harus 16:9.
  --mutu     mutu WebP 1-100 (bawaan 78)

Contoh: video 8 detik, 24 fps = 192 frame, sekitar 8 MB. Untuk situs yang ringan, 12 sampai 20 fps sudah cukup
karena gerak antar frame dihaluskan oleh scroll.

Skrip memakai ffmpeg. Kalau ffmpeg belum ada: pip install imageio-ffmpeg
"""
import argparse, json, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "kelasaijogja"


def cari_ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        sys.exit("ffmpeg tidak ditemukan. Jalankan: pip install imageio-ffmpeg")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--nama", required=True)
    ap.add_argument("--dari", type=float, default=0)
    ap.add_argument("--sampai", type=float, default=2)
    ap.add_argument("--fps", type=float, default=24)
    ap.add_argument("--lebar", type=int, default=1280)
    ap.add_argument("--mutu", type=int, default=78)
    a = ap.parse_args()

    out = SITE / "assets" / "film" / a.nama
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    ff = cari_ffmpeg()
    cmd = [ff, "-hide_banner", "-loglevel", "error", "-y", "-i", a.video,
           "-vf", f"fps={a.fps},scale={a.lebar}:-2:flags=lanczos", "-c:v", "libwebp", "-quality", str(a.mutu),
           str(out / "%04d.webp")]
    subprocess.run(cmd, check=True)
    frames = sorted(out.glob("*.webp"))
    if not frames:
        sys.exit("Tidak ada frame yang dihasilkan.")
    total = sum(f.stat().st_size for f in frames)

    man_path = SITE / "assets" / "film" / "manifest.json"
    man = json.loads(man_path.read_text(encoding="utf-8")) if man_path.exists() else {"clips": []}
    man["clips"] = [c for c in man["clips"] if c.get("name") != a.nama]
    man["clips"].append({"name": a.nama, "dir": f"assets/film/{a.nama}/", "count": len(frames), "digits": 4, "ext": "webp",
                         "from": a.dari, "to": a.sampai})
    man_path.write_text(json.dumps(man, indent=2), encoding="utf-8")
    print(f"{len(frames)} frame, {total/1e6:.1f} MB -> {out}")
    print(f"Terdaftar di {man_path} (adegan {a.dari} sampai {a.sampai}).")


if __name__ == "__main__":
    main()
