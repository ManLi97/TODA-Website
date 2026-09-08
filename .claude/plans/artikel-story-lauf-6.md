# Artikel-Story → `/artist-story` Lauf 6 (Website-Repo)

## §0 Execution Brief

- **Zielpfad im Repo:** `TODA-Website/.claude/plans/artikel-story-lauf-6.md` (nach Freigabe wortgleich dorthin schreiben).
- **Repo / Branch:** `~/Developer/toda/TODA-Website`, Branch `staging` (Stand 08.09.2026: clean, HEAD `a577b98`). Arbeit direkt auf `staging`, Commit via `/commit`, **kein Push** (nicht beauftragt).
- **Zweites Repo, eine Zeile:** `~/Developer/toda/marketing/channels/instagram.md` (Branch `main`, das Repo committet direkt auf main) — Produktionsverweis nachziehen, eigener Commit.
- **Ausführung:** Auto Mode, in dieser Session (klein, Kontext mit Referenz-Render und Template ist geladen; Fresh-Session-Handoff bringt hier nichts).
- **Plan-Fidelity:** Evidence beats plan — widerspricht die Realität einer Annahme unten, Realität fixen und Abweichung im Report nennen. **Bindend:** Scope, Wahrheitspflicht (Werte nur von der publizierten Seite), Sticker-Zone y 1500–1670 leer, kein Renumbering der Läufe 4/5. **Richtwert:** CSS-Zahlen im Template, Regex-Details im Script. Jeden `file:line`-Anker vor Gebrauch gegenprüfen.

## Kontext

Heute (08.09.2026) ist im Marketing-Repo das Format **Artikel-Story** definiert worden (`channels/instagram.md`, Abschnitt „Artikel-Story (Story) — 🧪 in Erprobung seit 08.09.2026", Commit `f5b7c70`): ein 1080×1920-Story-Bild im Website-Look, das den echten Seitenkopf des publizierten Artikels zeigt (Nav, Breadcrumb, Kategorie-Pill, Titel, Datum + Lesezeit, Tags, Cover) plus Gold-Cue auf die freie Sticker-Zone. Analog zur Podcast-Story (YouTube-Look, Lauf 5): Plattform-Mimikry, damit vor dem Tap klar ist, wohin der Link führt. Erstlauf Rita „CATO"; Template, Build-Script und Referenz-Render liegen im Desktop-Ordner `~/Desktop/toda/TODA-Karussell-Story-CATO/` (`story-artikel-template.html`, `build-story-artikel.py`, `story-artikel.png`, `story-artikel.html`).

Die Definition sagt: „Übernahme in die `/artist-story`-Skill-Assets steht aus." Tomek hat dafür Green Light gegeben. Ziel: Der Skill kann die Artikel-Story zu **jedem** publizierten Artikel reproduzierbar bauen — nicht nur zu Artist-Stories — und die Format-Wahrheit bleibt im Marketing-Repo.

## Entscheidungen (getroffen, nicht offen)

1. **Neuer Lauf 6, kein Renumbering.** Lauf 5 (Podcast-Story) wird in `channels/instagram.md` und `strategy/content-pipeline.md` des Marketing-Repos als „Lauf 5" referenziert. Artikel-Story wird **Lauf 6 — Story-Baustein: der Artikel (immer)**, direkt nach Lauf 5.
2. **Builder liest die Live-Seite, nicht Platzhalter von Hand.** Die Wahrheitspflicht („Werte von der publizierten Seite") wird zum Mechanismus: ein Script holt die URL, parst H1, Kategorie, Datum + Lesezeit, Tags, Cover-URL und Sprache aus dem SSR-HTML und rendert. Belegt am 08.09.2026 gegen `https://www.todasolutions.com/de/blog/von-krieg-und-musik-zum-tattoo-artist`: alle Felder sind mit stabilen Klassen im HTML vorhanden (siehe Parsing unten). Das Script lebt als Skill-Asset, weil das Markup im selben Repo liegt — driftet es, ist es hier sichtbar.
3. **Kontroll-Overlay wird Asset.** Lauf 5 verlangt den Kontroll-Render mit IG-Chrome und Mock-Sticker im Scratchpad; das Overlay-HTML wird wiederverwendbar abgelegt, der Render selbst bleibt im Scratchpad.
4. **`/blog-article` bekommt nur einen Verweis**, keinen eigenen Lauf: Distribution-Ausweis → „Artikel-Story: `/artist-story` Lauf 6, gilt für jeden publizierten Artikel."

## Änderungen

### 1 · `TODA-Website/.claude/skills/artist-story/assets/story-artikel.html` (neu)

Inhalt = `~/Desktop/toda/TODA-Karussell-Story-CATO/story-artikel-template.html` (Stand nach dem Fade-Fix: `.fade{top:1290px;bottom:0; …84px … 120px}`, `.cue{top:1396px}`, `--title-size:68px`). Doku-Kommentar im Kopf angleichen an `assets/story-podcast.html`:

- Platzhalter: `{{LOGO_B64}}`, `{{COVER_B64}}`, `{{KATEGORIE}}`, `{{TITEL}}`, `{{META}}`, `{{TAGS_HTML}}`, `{{LANG_HTML}}`, `{{CUE}}` — **alle werden vom Script gefüllt**, manuelles Füllen ist der Fallback.
- Layout-Gesetze: IG-Chrome oben/unten je 250 px, Nav ab y 252; **y 1500–1670 leer**; Cover darf vom Viewport-Fade angeschnitten werden; Titel nie kürzen — bei vier Zeilen `--title-size:60px` (Script setzt das automatisch, siehe 2).
- Render-Zeile wie bei Lauf 5 (`--headless=new --window-size=1080,1920 --force-device-scale-factor=1`).
- Referenz-Implementierung: CATO 08.09.2026.

### 2 · `TODA-Website/.claude/skills/artist-story/assets/build-story-artikel.py` (neu)

`python3 build-story-artikel.py <artikel-url> <ausgabe-ordner>` — nur Standardbibliothek (`urllib`, `re`, `html`, `base64`, `subprocess`, `pathlib`, `sys`). Ablauf:

1. **Fetch** der URL (User-Agent setzen; HTTP ≠ 200 → Abbruch mit Meldung: „nicht publiziert oder falsche URL" — das ist die Wahrheitspflicht als Gate).
2. **Parsen** (Regex auf dem SSR-HTML, Anker sind die Klassen aus `components/blog/article-header.tsx` und `components/blog/breadcrumbs.tsx`; jeweils **erster** Treffer, weil Related-Posts dieselben Klassen weiter unten wiederholen):
   - Titel: `<h1 class="…type-article-title…">…</h1>` → `html.unescape`.
   - Kategorie: `<span class="label label--gold">…</span>`; fehlt sie → Pill und Breadcrumb-Segment weglassen (Artikel ohne Kategorie).
   - Meta: erster `<span class="type-caption">…</span>` **innerhalb des `<header>`** (der Breadcrumb-`<ol>` trägt ebenfalls `type-caption`, liegt aber außerhalb des `<header>`; darum erst den `<header class="mx-auto max-w-[760px]">…</header>`-Block ausschneiden, darin parsen).
   - Tags: alle `<span class="type-caption text-purple-400">…</span>` im Header; React-Kommentar `<!-- -->` entfernen (Beleg: `#<!-- -->Quereinstieg`).
   - Cover: erstes `src="/_next/image?url=<urlencoded>…blog-covers…"` → URL-decode → Original-JPEG aus dem Supabase-Bucket laden. Kein Cover → Abbruch mit Meldung (die Story braucht das Bild; Fallback ist eine bewusste Entscheidung, keine stille Variante).
   - Sprache: `<html lang="de|en|es">` → aktives Segment in `LANG_HTML`; Breadcrumb-Wurzel „Blog" ist in allen drei Sprachen „Blog".
   - Cue-Text je Sprache: de „Link antippen — und der Artikel öffnet sich", en „Tap the link — the article opens", es „Toca el enlace — se abre el artículo".
3. **Logo:** `public/TODA-LOGO.svg` des Repos (Pfad relativ zum Script: `../../../../public/TODA-LOGO.svg`; existiert, geprüft 08.09.2026).
4. **Template füllen:** Doku-Kommentar **zuerst** entfernen (`re.sub(r"<!--.*?-->", "", tpl, count=1, flags=re.S)`), dann Platzhalter ersetzen, `assert "{{" not in out`.
5. **Titel-Zeilen:** nach dem ersten Render die Zeilenzahl nicht raten — Chrome-Screenshot einmal mit 68 px rendern, Höhe der `h1` per zweitem headless-Aufruf `--dump-dom` ist umständlich; **einfacher und ausreichend:** Zeichenlänge als Proxy (CATO 82 Zeichen = 3 Zeilen; Test-Titel 97 Zeichen bei 68 px = 4 Zeilen, bei 60 px = 3 Zeilen). Regel im Script: `len(titel) > 90` → `--title-size:60px`. Richtwert, im Report nennen, wenn ein Titel dennoch vier Zeilen wird (dann ist der Sichtcheck die Instanz).
6. **Rendern:** headless Chrome → `<ausgabe-ordner>/story-artikel.png`, daneben `story-artikel.html` (gefüllt) und `cover.jpg`. Abschließend `story-kontrolle.png` ins **Scratchpad** rendern (Asset 3), Pfad ausgeben.

### 3 · `TODA-Website/.claude/skills/artist-story/assets/story-kontrolle.html` (neu)

Overlay-Wrapper aus dem heutigen Kontroll-Render (`kontrolle-overlay.html` im Scratchpad dieser Session): IG-Progressbar + Avatar-Zeile oben, Antwortfeld unten, gestrichelte Linien bei y 250 / 1500 / 1670, Mock-Link-Sticker in der Zone. Platzhalter `{{STORY_PNG}}` (Pfad) und `{{STICKER_TEXT}}`. Das Script aus 2 füllt und rendert ihn.

### 4 · `TODA-Website/.claude/skills/artist-story/SKILL.md`

- **Lauf 4, Punkt 5** (Zeile ~203, „Story-Baustein mit Link-Sticker"): ersetzen durch „Story-Bausteine (→ Lauf 5/6)".
- **Lauf 5, Absatz 1** (Zeile ~215/216, „Kein Ersatz für die Artikel-Story aus Lauf 4, sondern ein zweiter Baustein"): → „Kein Ersatz für die Artikel-Story (Lauf 6), sondern ein zweiter Baustein; beide nie direkt hintereinander in dieselbe Kette."
- **Neu nach Lauf 5, vor „Harte Regeln":** `## Lauf 6 — Story-Baustein: der Artikel (immer)` — Struktur wie Lauf 5, sechs Punkte:
  1. **Warum Website-Look.** Gleiche Logik wie Lauf 5, Ziel ist die eigene Seite; die Story zeigt den echten Seitenkopf. Gold nur am Cue; kein Zitat, kein Teaser, kein Todd. Verweis auf die Format-Wahrheit: `/Users/harvestflow/Developer/toda/marketing/channels/instagram.md` → „Artikel-Story" — Pflichtlektüre.
  2. **Wahrheitspflicht als Mechanismus.** Werte kommen ausschließlich aus der publizierten URL; das Script bricht ab, wenn die Seite nicht 200 liefert. Kein Mockup eines unpublizierten Artikels. Titel wird nie gekürzt.
  3. **Gilt für jeden Artikel**, nicht nur Artist-Stories (Kategorie kommt von der Seite). Bei Artist-Stories zusätzlich: @-Mention des Artists in der Story.
  4. **Technik:** `assets/story-artikel.html` + `python3 assets/build-story-artikel.py <url> <ordner>` → PNG **selbst ansehen** (Sichtpflicht) → Kontroll-Render aus `assets/story-kontrolle.html` im Scratchpad ansehen (Sticker-Zone frei?).
  5. **Safe-Area:** wie Lauf 5 — y 1500–1670 leer; Cover darf unten angeschnitten werden.
  6. **Ablage:** derselbe Desktop-Ordner wie Lauf 4 — `story-artikel.png` + `story-artikel.html`; im `posting-paket.md` ein eigener Story-Block: Bild, Sticker-Ziel mit `utm_source=instagram&utm_medium=story&utm_campaign=<slug>`, Sticker-Text kurz und personenbezogen („Ritas ganze Story lesen"), Reihenfolge (erst Post in die Story ziehen, Artikel-Story ein paar Stunden später; Podcast-Story nie direkt davor oder danach).
- **Praxis-Referenz** (Ende der Datei): Absatz ergänzen — „Lauf 2 (2026-09-06/08): Rita „CATO", *„Meine Tattoos reden für sich selbst" — mein Weg von der Musik zum Tattoo Artist* (nur de). 08.09.2026: erste Artikel-Story (`story-artikel.png`, Ordner `~/Desktop/toda/TODA-Karussell-Story-CATO/`) → daraus Lauf 6 codifiziert."

### 5 · `TODA-Website/.claude/skills/blog-article/SKILL.md`

Im **Distribution-Ausweis** (Zeile ~333 ff., Unterpunkte Recycling / Earned-Media-Flag / Lead-Magnet-Flag) einen vierten Unterpunkt: „**Artikel-Story:** Story-Bild im Website-Look zum Link-Sticker — `/artist-story` Lauf 6 baut es aus der publizierten URL, gilt für jeden Artikel." Nur Ausweis, keine Umsetzung im Skill (Konvention des Abschnitts).

### 6 · Marketing-Repo `channels/instagram.md`

Im Abschnitt „Artikel-Story (Story)", erster Absatz: „(Template und Referenz-Render im Deliverable-Ordner der Story; Übernahme in die `/artist-story`-Skill-Assets steht aus)" → „Produktion: `/artist-story` Lauf 6 im toda-website-Repo (Template, Builder und Kontroll-Overlay dort in den Skill-Assets; der Builder liest alle Werte von der publizierten Seite)". Eigener Commit im Marketing-Repo (`docs(instagram): artikel-story — produktion via /artist-story lauf 6`).

## Verifikation (E2E, vor dem Report)

1. **CATO, de:** `python3 build-story-artikel.py https://www.todasolutions.com/de/blog/von-krieg-und-musik-zum-tattoo-artist <scratch>/cato` → PNG 1080×1920 (`magick identify`), Sichtcheck gegen den heutigen Referenz-Render (`~/Desktop/toda/TODA-Karussell-Story-CATO/story-artikel.png`): gleicher Aufbau, Titel 3 Zeilen, Cover vollständig sichtbar bis zum Fade. Pixelvergleich als Beleg: `magick compare -metric AE` beider PNGs → nahe 0 (gleiche Quelle, gleiche Werte; Abweichung nur, wenn das Script andere Werte parst — dann Ursache nennen).
2. **Vossi, en:** `…/en/blog/vom-dachdecker-zum-tattoo-artist` (Slug vorher aus dem SSR-HTML der de-Seite bzw. `hreflang`-Links lesen; existiert laut Skill in de/en/es) → EN im Nav aktiv, englische Meta-Zeile („min read"), englischer Cue. Sichtcheck. Damit ist die Sprachlogik und ein zweiter Artikel belegt.
3. **Kontroll-Overlay:** für beide Läufe `story-kontrolle.png` ansehen: nichts in y 1500–1670, Nav unterhalb y 250, Cue oberhalb der Zone.
4. **Gate-Test:** Script mit einer nicht existierenden Slug-URL aufrufen → sauberer Abbruch mit Meldung, kein PNG.
5. **Repo-Checks Website:** keine App-Dateien berührt (nur `.claude/skills/**`) → `git status` zeigt ausschließlich die vier Skill-Dateien; kein Lint/Build nötig, im Report so benennen.
6. **Commits:** Website-Repo auf `staging` via `/commit` (`feat(artist-story): lauf 6 — artikel-story aus der publizierten url`), Marketing-Repo via `/commit`. Kein Push.

## Report-Inhalt

Beide PNGs (CATO de, Vossi en) plus ein Kontroll-Render an Tomek senden; Abweichungen vom Plan; die eine offene Frage, falls sie auftritt: Titel-Längen-Schwelle (90 Zeichen) als Richtwert.
