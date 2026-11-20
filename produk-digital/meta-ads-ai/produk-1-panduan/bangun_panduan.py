#!/usr/bin/env python3
"""Membangun Panduan Pasang menjadi SATU berkas HTML siap cetak (Simpan sebagai PDF dari peramban).

Pakai:  python bangun_panduan.py
Hasil:  panduan-pasang.html (folder yang sama). Gambar di folder gambar/ disematkan ke dalam
        berkas, jadi hasilnya bisa dikirim satu berkas saja.

Gambar yang belum ada tampil sebagai kotak putus-putus berisi nama berkas yang harus
Anda simpan di folder gambar/. Jalankan ulang skrip setelah menaruh gambarnya.

Tanpa pustaka tambahan. Konverternya hanya mengerti bagian Markdown yang dipakai panduan ini.
"""
import base64
import html
import mimetypes
import re
from pathlib import Path

DIR = Path(__file__).resolve().parent
SUMBER = DIR / "panduan-pasang.md"
KELUAR = DIR / "panduan-pasang.html"


def inline(t: str) -> str:
    t = html.escape(t, quote=False)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", t)
    return t


def slug(t: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-") or "bagian"


def gambar_html(alt: str, jalur: str) -> str:
    berkas = DIR / jalur
    if berkas.exists():
        tipe = mimetypes.guess_type(berkas.name)[0] or "image/png"
        b64 = base64.b64encode(berkas.read_bytes()).decode()
        return f'<figure><img src="data:{tipe};base64,{b64}" alt="{html.escape(alt)}"><figcaption>{inline(alt)}</figcaption></figure>'
    return (
        f'<figure class="kosong"><div class="isi-kosong">TANGKAPAN LAYAR BELUM ADA<br>'
        f"Simpan gambarnya sebagai <code>{html.escape(jalur)}</code>, lalu jalankan ulang skrip.</div>"
        f"<figcaption>{inline(alt)}</figcaption></figure>"
    )


def md_ke_html(md: str, judul: list) -> str:
    baris = md.split("\n")
    out, i = [], 0
    while i < len(baris):
        b = baris[i]
        if b.startswith("```"):
            kode = []
            i += 1
            while i < len(baris) and not baris[i].startswith("```"):
                kode.append(baris[i])
                i += 1
            out.append("<pre><code>" + html.escape("\n".join(kode)) + "</code></pre>")
            i += 1
            continue
        m_img = re.match(r"^!\[(.*)\]\((.*)\)\s*$", b)
        if m_img:
            out.append(gambar_html(m_img.group(1), m_img.group(2)))
        elif b.startswith("<"):
            out.append(b)
        elif b.startswith("## "):
            teks = b[3:].strip()
            sid = slug(teks)
            judul.append((sid, teks))
            out.append(f'<h2 id="{sid}">{inline(teks)}</h2>')
        elif b.startswith("### "):
            out.append(f"<h3>{inline(b[4:].strip())}</h3>")
        elif b.startswith("# "):
            out.append(f"<h1>{inline(b[2:].strip())}</h1>")
        elif b.strip() == "---":
            out.append("<hr>")
        elif b.startswith(">"):
            isi = []
            while i < len(baris) and baris[i].startswith(">"):
                isi.append(baris[i].lstrip("> ").rstrip())
                i += 1
            out.append("<blockquote>" + inline(" ".join(isi)) + "</blockquote>")
            continue
        elif b.startswith("|"):
            tabel = []
            while i < len(baris) and baris[i].startswith("|"):
                tabel.append(baris[i])
                i += 1
            sel = lambda r: [c.strip() for c in r.strip().strip("|").split("|")]
            kepala = sel(tabel[0])
            isi = [sel(r) for r in tabel[2:]]
            h = "<table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in kepala) + "</tr></thead><tbody>"
            for r in isi:
                h += "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>"
            out.append(h + "</tbody></table>")
            continue
        elif re.match(r"^- \[[ x]\] ", b):
            item = []
            while i < len(baris) and re.match(r"^- \[[ x]\] ", baris[i]):
                item.append(f'<li class="cek"><span class="kotak"></span>{inline(baris[i][6:])}</li>')
                i += 1
            out.append('<ul class="cek">' + "".join(item) + "</ul>")
            continue
        elif b.startswith("- "):
            item = []
            while i < len(baris) and baris[i].startswith("- "):
                item.append(f"<li>{inline(baris[i][2:])}</li>")
                i += 1
            out.append("<ul>" + "".join(item) + "</ul>")
            continue
        elif re.match(r"^\d+\. ", b):
            item = []
            while i < len(baris) and re.match(r"^\d+\. ", baris[i]):
                item.append(f"<li>{inline(re.sub(r'^\d+\. ', '', baris[i]))}</li>")
                i += 1
            out.append("<ol>" + "".join(item) + "</ol>")
            continue
        elif b.strip():
            para = [b.strip()]
            i += 1
            while i < len(baris) and baris[i].strip() and not re.match(r"^(#|>|\||- |\d+\. |```|---|<|!\[)", baris[i]):
                para.append(baris[i].strip())
                i += 1
            sudah_selesai = "**Selesai kalau:**" in para[0]
            kelas = ' class="selesai"' if sudah_selesai else ""
            out.append(f"<p{kelas}>" + inline(" ".join(para)) + "</p>")
            continue
        i += 1
    return "\n".join(out)


GAYA = """
:root{--biru:#2563eb;--navy:#0f1b4d;--muda:#eef4ff;--garis:#e2e8f0;--hijau:#16a34a}
*{box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,Arial,sans-serif;color:#0f172a;line-height:1.65;margin:0;background:#f8fafc;font-size:17px}
main{max-width:800px;margin:0 auto;padding:24px 24px 80px;background:#fff}
.sampul{min-height:70vh;display:flex;flex-direction:column;justify-content:center;padding:56px 28px;
 background:linear-gradient(160deg,#0f1b4d,#2563eb);color:#fff;border-radius:20px;margin:16px 0 32px}
.sampul h1{font-size:44px;line-height:1.1;margin:0 0 12px}
.sampul h2{font-size:22px;font-weight:600;margin:0 0 24px;color:#fff;border:0;padding:0}
.sampul blockquote{background:rgba(255,255,255,.14);color:#fff;border:0;border-radius:14px;max-width:560px}
h2{font-size:28px;color:var(--navy);margin:44px 0 10px;padding-bottom:8px;border-bottom:3px solid var(--biru)}
h3{font-size:19px;color:var(--navy);margin:24px 0 6px}
p{margin:10px 0}
p.selesai{background:#ecfdf3;border-left:5px solid var(--hijau);padding:10px 14px;border-radius:8px}
blockquote{margin:16px 0;padding:12px 16px;background:var(--muda);border-left:5px solid var(--biru);border-radius:8px;color:#1e293b}
code{background:#f1f5f9;padding:1px 6px;border-radius:5px;font-family:Consolas,monospace;font-size:.92em}
pre{background:#0f172a;color:#e2e8f0;padding:14px 16px;border-radius:10px;white-space:pre-wrap;font-size:14px}
pre code{background:none;color:inherit;padding:0}
table{border-collapse:collapse;width:100%;margin:14px 0;font-size:15.5px}
th{background:var(--navy);color:#fff;text-align:left}
th,td{border:1px solid var(--garis);padding:8px 10px;vertical-align:top}
tbody tr:nth-child(even){background:#f8fafc}
ul,ol{margin:10px 0 10px 24px;padding:0}li{margin:5px 0}
ul.cek{list-style:none;margin-left:0}
li.cek{display:flex;gap:10px;align-items:flex-start}
.kotak{flex:0 0 17px;height:17px;border:2px solid var(--biru);border-radius:4px;margin-top:5px}
hr{border:0;border-top:1px solid var(--garis);margin:26px 0}
figure{margin:18px 0;text-align:center}
figure img{max-width:100%;border:1px solid var(--garis);border-radius:10px;box-shadow:0 4px 18px rgba(15,23,42,.08)}
figcaption{font-size:14px;color:#475569;margin-top:8px}
figure.kosong .isi-kosong{border:3px dashed #f59e0b;background:#fffbeb;color:#92400e;border-radius:12px;padding:44px 16px;font-weight:600}
.peta{display:flex;gap:6px;margin:14px 0 22px}
.peta div{flex:1;text-align:center;background:var(--muda);border:2px solid var(--biru);border-radius:12px;padding:8px 2px;font-weight:800;color:var(--navy);font-size:20px}
.peta small{font-size:11px;font-weight:600;color:#334155}
.daftar-isi ol{font-size:17px;line-height:2}
.daftar-isi a{color:var(--biru);text-decoration:none}
@media print{
 body{background:#fff}main{max-width:none;padding:0}
 .sampul{border-radius:0;min-height:90vh;page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}
 h2{page-break-after:avoid}figure,pre,table,blockquote{page-break-inside:avoid}
 th,.peta div,p.selesai{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
@page{size:A4;margin:16mm}
"""


def main() -> None:
    teks = SUMBER.read_text(encoding="utf-8")
    kepala, _, isi = teks.partition("\n---\n")
    judul: list = []
    badan = md_ke_html(isi, judul)
    sampul = md_ke_html(kepala, [])
    langkah = [(s, t) for s, t in judul if t.lower().startswith("langkah")]
    toc = "".join(f'<li><a href="#{s}">{inline(t)}</a></li>' for s, t in langkah)
    dokumen = f"""<!doctype html>
<html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pasang Sistem Iklan Meta + AI: Panduan 4 Langkah</title>
<style>{GAYA}</style></head><body><main>
<section class="sampul">{sampul}</section>
<section class="daftar-isi"><h3>Isi panduan</h3><ol>{toc}</ol></section>
{badan}
</main></body></html>"""
    KELUAR.write_text(dokumen, encoding="utf-8")
    kosong = dokumen.count("TANGKAPAN LAYAR BELUM ADA")
    print(f"OK: {KELUAR.name} ({len(dokumen) // 1024} KB), {len(langkah)} langkah, {kosong} gambar belum ada")


if __name__ == "__main__":
    main()
