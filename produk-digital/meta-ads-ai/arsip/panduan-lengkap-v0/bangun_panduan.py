#!/usr/bin/env python3
"""Membangun panduan menjadi SATU berkas HTML siap cetak (Simpan sebagai PDF dari peramban).

Pakai:  python bangun_panduan.py
Hasil:  panduan-meta-ads-ai.html (di folder yang sama)

Tanpa pustaka tambahan. Konverternya hanya mengerti bagian Markdown yang dipakai
panduan ini: judul, paragraf, daftar, kotak centang, tabel, kode, kutipan, garis.
"""
import html
import re
from pathlib import Path

DIR = Path(__file__).resolve().parent
KELUAR = DIR / "panduan-meta-ads-ai.html"


def inline(t: str) -> str:
    t = html.escape(t, quote=False)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", t)
    return t


def slug(t: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
    return s or "bab"


def md_ke_html(md: str, judul_bab: list) -> str:
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
        if b.startswith("## "):
            teks = b[3:].strip()
            sid = slug(teks)
            judul_bab.append((sid, teks))
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
            while i < len(baris) and baris[i].strip() and not re.match(r"^(#|>|\||- |\d+\. |```|---)", baris[i]):
                para.append(baris[i].strip())
                i += 1
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            continue
        i += 1
    return "\n".join(out)


GAYA = """
:root{--biru:#2563eb;--navy:#0f1b4d;--abu:#475569;--muda:#eef4ff;--garis:#e2e8f0}
*{box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,Arial,sans-serif;color:#0f172a;line-height:1.65;margin:0;background:#f8fafc}
main{max-width:820px;margin:0 auto;padding:24px 24px 80px;background:#fff}
.sampul{min-height:92vh;display:flex;flex-direction:column;justify-content:center;padding:60px 8px;
 background:linear-gradient(160deg,#0f1b4d,#2563eb);color:#fff;border-radius:20px;margin:16px 0 40px}
.sampul h1{font-size:46px;line-height:1.1;margin:0 0 12px}
.sampul h2{font-size:24px;font-weight:600;margin:0 0 28px;color:#fff;border:0;padding:0}
.sampul blockquote{background:rgba(255,255,255,.14);color:#fff;border:0;border-radius:14px;max-width:560px}
.sampul .kecil{margin-top:48px;font-size:13px;opacity:.8}
h2{font-size:30px;color:var(--navy);margin:0 0 10px;padding-top:6px;border-bottom:3px solid var(--biru);padding-bottom:8px}
h3{font-size:19px;color:var(--navy);margin:28px 0 6px}
p{margin:10px 0}
blockquote{margin:16px 0;padding:12px 16px;background:var(--muda);border-left:5px solid var(--biru);border-radius:8px;color:#1e293b}
code{background:#f1f5f9;padding:1px 6px;border-radius:5px;font-family:Consolas,monospace;font-size:.92em}
pre{background:#0f172a;color:#e2e8f0;padding:14px 16px;border-radius:10px;overflow-x:auto;white-space:pre-wrap;font-size:13.5px;line-height:1.5}
pre code{background:none;color:inherit;padding:0}
table{border-collapse:collapse;width:100%;margin:14px 0;font-size:14.5px}
th{background:var(--navy);color:#fff;text-align:left}
th,td{border:1px solid var(--garis);padding:8px 10px;vertical-align:top}
tbody tr:nth-child(even){background:#f8fafc}
ul,ol{margin:10px 0 10px 22px;padding:0}
li{margin:4px 0}
ul.cek{list-style:none;margin-left:0}
li.cek{display:flex;gap:10px;align-items:flex-start}
.kotak{flex:0 0 16px;height:16px;border:2px solid var(--biru);border-radius:4px;margin-top:5px}
hr{border:0;border-top:1px solid var(--garis);margin:22px 0}
.bab{padding-top:8px}
.daftar-isi{padding:8px 0 28px}
.daftar-isi h2{border:0}
.daftar-isi ol{font-size:17px;line-height:2}
.daftar-isi a{color:var(--biru);text-decoration:none}
@media print{
 body{background:#fff}main{max-width:none;padding:0}
 .bab{page-break-before:always}
 .sampul{border-radius:0;min-height:96vh;page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}
 pre,table,blockquote{page-break-inside:avoid}
 th,pre{-webkit-print-color-adjust:exact;print-color-adjust:exact}
 a{color:inherit}
}
@page{size:A4;margin:16mm}
"""


def main() -> None:
    berkas = sorted(p for p in DIR.glob("[0-9][0-9]-*.md"))
    awal = berkas[0].read_text(encoding="utf-8")
    kepala, _, sisa = awal.partition("\n---\n")
    bab_md = [sisa] + [p.read_text(encoding="utf-8") for p in berkas[1:]]

    daftar = []
    bagian = []
    for md in bab_md:
        bagian.append(f'<section class="bab">{md_ke_html(md, daftar)}</section>')

    sampul_html = md_ke_html(kepala, [])
    sampul_html = sampul_html.replace("</blockquote>", "</blockquote>", 1)
    toc = "".join(f'<li><a href="#{sid}">{inline(t)}</a></li>' for sid, t in daftar)

    dokumen = f"""<!doctype html>
<html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Meta Ads Resmi + AI: Panduan dari Akun Kosong sampai Iklan Tayang</title>
<style>{GAYA}</style></head><body><main>
<section class="sampul">{sampul_html}
<p class="kecil">Bukan produk resmi Meta atau Anthropic. Tidak ada jaminan hasil iklan. Tampilan menu pihak ketiga dapat berubah.</p></section>
<section class="daftar-isi"><h2>Daftar isi</h2><ol>{toc}</ol></section>
{chr(10).join(bagian)}
</main></body></html>"""
    KELUAR.write_text(dokumen, encoding="utf-8")
    print(f"OK: {KELUAR.name} ({len(dokumen) // 1024} KB), {len(daftar)} bab")


if __name__ == "__main__":
    main()
