#!/usr/bin/env python3
"""Artikel-Story (Lauf 6) aus der PUBLIZIERTEN Artikel-URL bauen.

Aufruf:   python3 build-story-artikel.py <artikel-url> <ausgabe-ordner> [--sticker "Text"]
Ergebnis: <ordner>/story-artikel.png (1080×1920), story-artikel.html (gefüllt), cover.jpg
          + Kontroll-Render mit IG-Chrome und Mock-Sticker im Scratchpad (Pfad wird ausgegeben).

Wahrheitspflicht als Mechanismus: alle Werte (Titel, Kategorie, Datum + Lesezeit, Tags, Cover,
Sprache) stammen aus dem SSR-HTML der Live-Seite. Kein 200 → kein Bild. Nichts wird gekürzt.
Parsing-Anker sind die Klassen aus components/blog/article-header.tsx und breadcrumbs.tsx —
ändert sich dort das Markup, bricht das Script sichtbar ab (Meldung nennt das fehlende Feld).
Nur Standardbibliothek. Braucht Google Chrome und kurz Netz (Inter über Google Fonts).
"""
import argparse, base64, html, os, pathlib, re, subprocess, sys, urllib.error, urllib.parse, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
LOGO = HERE.parents[3] / "public" / "TODA-LOGO.svg"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CUE = {"de": "Link antippen — und der Artikel öffnet sich",
       "en": "Tap the link — the article opens",
       "es": "Toca el enlace — se abre el artículo"}
STICKER = {"de": "Den ganzen Artikel lesen", "en": "Read the full article", "es": "Leer el artículo completo"}


def die(msg):
    sys.exit(f"ABBRUCH: {msg}")


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (toda artikel-story builder)"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            if r.status != 200:
                die(f"{url} liefert HTTP {r.status}")
            data = r.read()
    except urllib.error.HTTPError as e:
        die(f"{url} liefert HTTP {e.code} — Artikel nicht publiziert oder falsche URL")
    return data if binary else data.decode("utf-8")


def first(pattern, text, what, flags=re.S):
    m = re.search(pattern, text, flags)
    if not m:
        die(f"Feld „{what}“ nicht im HTML gefunden — Markup der Seite geändert? (Anker in article-header.tsx prüfen)")
    return m.group(1)


def clean(s):
    return html.unescape(re.sub(r"<!--.*?-->", "", s)).strip()


def main():
    ap = argparse.ArgumentParser(description="Artikel-Story aus der publizierten Artikel-URL bauen")
    ap.add_argument("url", help="publizierte Artikel-URL (de/en/es)")
    ap.add_argument("ordner", help="Ausgabe-Ordner (Desktop-Deliverable-Ordner)")
    ap.add_argument("--sticker", help="Sticker-Text für den Kontroll-Render (Standard je Sprache)")
    a = ap.parse_args()
    url, out, sticker = a.url, pathlib.Path(a.ordner).expanduser(), a.sticker
    if not LOGO.exists():
        die(f"Logo fehlt: {LOGO}")
    out.mkdir(parents=True, exist_ok=True)

    page = fetch(url)
    lang = first(r'<html[^>]*\blang="([a-z]{2})', page, "Sprache")
    header = first(r'(<header class="mx-auto max-w-\[760px\]">.*?</header>)', page, "Artikel-Header")
    titel = clean(first(r'<h1 class="[^"]*type-article-title[^"]*"[^>]*>(.*?)</h1>', header, "Titel"))
    meta = clean(first(r'<span class="type-caption">(.*?)</span>', header, "Datum + Lesezeit"))
    kat = re.search(r'<span class="label label--gold">(.*?)</span>', header, re.S)
    kategorie = clean(kat.group(1)) if kat else ""
    tags = [clean(t) for t in re.findall(r'<span class="type-caption text-purple-400">(.*?)</span>', header, re.S)]
    cover_src = first(r'src="/_next/image\?url=(https%3A%2F%2F[^"&]*blog-covers[^"&]*)', header, "Cover")
    cover_url = urllib.parse.unquote(cover_src)

    cover = fetch(cover_url, binary=True)
    (out / "cover.jpg").write_bytes(cover)

    tpl = (HERE / "story-artikel.html").read_text()
    tpl = re.sub(r"<!--.*?-->", "", tpl, count=1, flags=re.S)  # Doku-Kommentar zuerst raus
    lang_html = '<span class="sep"></span>'.join(
        f'<span class="{"on" if l.lower() == lang else ""}">{l}</span>' for l in ("DE", "EN", "ES"))
    vals = {
        "LOGO_B64": base64.b64encode(LOGO.read_bytes()).decode(),
        "COVER_B64": base64.b64encode(cover).decode(),
        "KATEGORIE": html.escape(kategorie),
        "CRUMB_HTML": f'<span>›</span><span class="cur">{html.escape(kategorie)}</span>' if kategorie else "",
        "PILL_HTML": f'<div class="pill">{html.escape(kategorie)}</div>' if kategorie else "",
        "TITEL": html.escape(titel),
        "META": html.escape(meta),
        "TAGS_HTML": "".join(f'<span class="tag">{html.escape(t)}</span>' for t in tags),
        "LANG_HTML": lang_html,
        "CUE": CUE.get(lang, CUE["de"]),
        "TITLE_SIZE": "60px" if len(titel) > 90 else "68px",
    }
    for k, v in vals.items():
        tpl = tpl.replace("{{" + k + "}}", v)
    if "{{" in tpl:
        die("Platzhalter offen: " + ", ".join(sorted(set(re.findall(r"{{(\w+)}}", tpl)))))
    (out / "story-artikel.html").write_text(tpl)

    def render(src, png):
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                        "--force-device-scale-factor=1", "--window-size=1080,1920",
                        f"--screenshot={png}", f"file://{src}"], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if not png.exists():
            die(f"Chrome hat {png} nicht geschrieben")

    render(out / "story-artikel.html", out / "story-artikel.png")

    scratch = pathlib.Path(os.environ.get("SCRATCHPAD", "/tmp")) / "story-kontrolle"
    scratch.mkdir(parents=True, exist_ok=True)
    ov = (HERE / "story-kontrolle.html").read_text()
    ov = ov.replace("{{STORY_PNG}}", f"file://{out / 'story-artikel.png'}")
    ov = ov.replace("{{STICKER_TEXT}}", html.escape(sticker or STICKER.get(lang, STICKER["de"])))
    (scratch / "story-kontrolle.html").write_text(ov)
    render(scratch / "story-kontrolle.html", scratch / "story-kontrolle.png")

    print(f"Sprache {lang} · Kategorie „{kategorie or '—'}“ · Titel ({len(titel)} Zeichen, {vals['TITLE_SIZE']}): {titel}")
    print(f"Meta: {meta} · Tags: {' '.join(tags) or '—'}")
    print(f"Asset:     {out / 'story-artikel.png'}")
    print(f"Kontrolle: {scratch / 'story-kontrolle.png'}  (Sticker-Zone y 1500–1670 muss leer sein — ansehen!)")


if __name__ == "__main__":
    main()
