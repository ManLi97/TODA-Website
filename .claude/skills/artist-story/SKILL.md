---
name: artist-story
description: Schreibt aus dem Input-Material eines echten Tattoo Artists (Podcast-Transkript, Research-Dossier, eigener Content, Sprachmemo) einen Blogartikel in Ich-Perspektive — als hätte der Artist ihn selbst geschrieben. Erstes Deliverable ist immer eine HTML-Standalone-Vorschau im exakten Website-Look, die als Freigabe-Medium an den Artist geht; DB-Insert erst nach seinem Go. Use when asked to write an artist story (/artist-story <material>). Teilt den Blog-Spine (Voice-Loop, CMS, Snapshot-Pflicht) mit /blog-article.
---

# /artist-story — Erfahrungsberichte echter Artists, in ihrer Stimme

**Schwester-Skill von `/blog-article`.** Gleicher Lern-Loop, gleiches CMS,
**publiziert nie selbst**. Der entscheidende Unterschied — in Lauf 1
(Markus „Skeet" Vossi, 2026-08-29) praxis-erprobt: Der Artikel ist **kein
Porträt über den Artist, sondern sein eigener Text**. Ich-Perspektive,
seine Sprache, seine Anekdoten; die Autor-Card der Website zeigt ihn als
Verfasser. TODA liefert Handwerk, Bühne und Reichweite — und bleibt im
Text unsichtbar.

**Das Angebot an den Artist (Win-Win, so ist das Format gebaut):** Er gibt
Input, wir schreiben den Artikel fertig, er liest ihn als fertige
Web-Vorschau, ändert, was er will, gibt sein Go — wir posten für ihn. Er
bekommt Content, den er für Social Media wiederverwenden kann; wir bekommen
authentische Artikel von echten Artists.

## Arbeitsteilung — hart

- **Menschenarbeit (Team/Tomek):** Artist ansprechen, Vertrauen, Interview/
  Dreh, die Vorschau an den Artist weiterleiten, das Go einholen. Der Skill
  akquiriert **niemals** selbst und schreibt niemanden an.
- **Skill-Arbeit:** Material → Artikel in der Stimme des Artists →
  HTML-Standalone-Vorschau → Freigabe-Paket → nach Go: Draft-Insert +
  Snapshot + Report.

## Lauf 0 — Lern-Schritt (Pflicht, identisch zu `/blog-article`)

Wie `/blog-article` Lauf 0 — der Voice-Loop ist geteilt. Zusätzlich
beobachten: Was ändert der **Artist** an seiner Story (via Tomek)? Diese
Korrekturen sind das wertvollste Signal des Formats — sie zeigen, wo die
Ich-Stimme danebenlag. Story-spezifische Muster hier ins SKILL.md
eskalieren, Stilregeln nach `voice-learnings.md`.

## Lauf 1 — Intake

Der Input kommt komplett von Tomek; typische Formen (alles verwerten, was
da ist):

1. **Gemeinsam gedrehter Content** — z. B. Toddcast-Transkript.
   **Caveat aus der Praxis:** Whisper-Transkripte irren bei der
   Sprecherzuordnung; nur bild-/abhörverifizierte Passagen (oder als
   gesichert markierte) als O-Ton des Artists verwenden. `(?)`-Sätze nie
   dem Artist zuschreiben.
2. **Research/Dossier über die Person** (z. B. Partner-Akte im Brain) —
   für Steckbrief-Fakten (Stadt, Stil, Studio, seit wann). Bei Widerspruch
   zwischen Dossier und O-Ton gewinnt der O-Ton — und der Punkt wandert in
   die Fakten-Checkliste der Freigabe-Nachricht.
3. **Eigener Content des Artists** (Reels, Posts, Captions).
4. **Optional: Sprachmemo** des Artists — transkribieren, wie Interview-
   Material behandeln.

Dazu von Tomek einholen, falls nicht mitgeliefert:

- **Verlink-Liste:** welche Accounts/Links der Artist verlinkt haben will
  (Instagram, Portfolio, Studio, Booking) — „wir verlinken dich überall"
  ist Teil des Angebots und wird großzügig eingelöst.
- **Bildmaterial-Quelle** für Cover + Avatar (siehe Lauf 3.1).

**Der Verwertungsumfang** (Blog + Social-Renderings + dauerhafte
Verlinkung) wird nicht vorab abgefragt, sondern **in der Freigabe-Nachricht
benannt und mit dem Go bestätigt** — vor dem Go verlässt ohnehin nichts
die Vorschau-Datei (Regel aus `language/testimonials.md`, Marketing-
Baukasten: voller Umfang muss benannt sein, bevor etwas live geht).

## Lauf 2 — Schreiben: Ich-Perspektive, seine Stimme

Kontext laden wie `/blog-article` 2.0 (`toda-context.md`,
`voice-learnings.md`, letzte veröffentlichte Artikel als Stil-Referenz).

- **Ich-Form durchgehend.** Der Text liest sich, als hätte der Artist ihn
  selbst geschrieben — Leseransprache per Du an Kolleg:innen. Seine
  Sprachfarbe aus dem O-Ton übernehmen (Füllwendungen, Bilder, Metaphern
  wie „Sahne und Kirsche auf dem Eis"), aber lesbar geglättet.
- **Story-Bogen:** Herkunft → Weg (Scheiternsmomente, Durchbeißen bis
  Vollzeit) → heute → sein Blick auf die Branche / was er anderen mitgibt.
  Ehrlichkeit trägt das Format: Zweifel und Schattenseiten drinlassen,
  wenn der O-Ton sie hergibt.
- **Nichts erfinden — härteste Regel des Formats.** Jede biografische
  Aussage stammt aus dem Material. **Nachweis-Pflicht:** Beim Schreiben
  eine Quellen-Liste führen (Aussage → Transkript-Timestamp/Quelle); sie
  gehört in den Draft-Begleittext und macht den Text ohne Nachhören
  prüfbar. Lücken werden nicht gedichtet, sondern landen als Rückfragen in
  der Fakten-Checkliste.
- **Terminologie gilt auch in seiner Stimme:** „Tattoo Artist(s)" im
  Fließtext, nie „Tätowierer" (Verb „tätowieren" frei; Suchsprache in
  slug/seo erlaubt — `toda-context.md` Regel 8). O-Ton-Superlative
  entschärfen („beste Lösung" → „fairste Lösung"), Claims-Leitplanken
  (Regel 7) gelten.
- **TODA ist keine Figur im Text.** Keine Produkt-Mention, keine
  Feature-Brücke. Stammt das Material aus dem Toddcast, ist der Verweis
  beiläufig und aus seiner Sicht („vor ein paar Wochen saß ich im
  Toddcast …"), verlinkt auf die Folge (bis sie live ist: Kanal-Link,
  im Report als Nachtrags-TODO markieren). **Kein YouTube-Embed** — das
  wäre TODA-Rahmung in seinem Text.
- **Niemand wird runtergemacht:** Schlechte Erfahrungen (Studios,
  Kollegen) anonymisiert und lessons-zentriert — nie identifizierbare
  Dritte in negativen Passagen. Positive Nennungen (eigenes Studio,
  Partner) nur, wenn der Artist sie selbst öffentlich macht — und in die
  Fakten-Checkliste.
- **Titel:** R1-Muster — gern ein echtes O-Ton-Zitat als Hook plus
  Transformation/Stakes (Lauf 1: *„Du musst noch üben" — mein Weg vom
  Dachdecker zum Tattoo Artist*). `seo_title` separat nüchtern
  keyword-optimiert.
- **Länge:** 650–900 Wörter.
- **Felder:** wie `/blog-article` 2.2; Autor = der Artist (Name,
  Künstlername, Kurz-Slogan mit Stadt/Studio, Social-Links aus der
  Verlink-Liste). **Kategorie:** „Artist Stories" existiert noch nicht in
  `blog_categories` (Stand 2026-08-29; vorher SELECT) — bis Tomek sie
  anlegt, passendste bestehende nutzen (bei Toddcast-Herkunft:
  `toda-podcast`) und die Wunsch-Kategorie im Report anfordern.

## Lauf 3 — Vorschau zuerst, Insert erst nach Go

### 3.1 HTML-Standalone-Vorschau (erstes Deliverable, immer)

Der Artist gibt sein Go auf etwas, das er **vor Augen hat**: eine einzelne
HTML-Datei, die exakt so aussieht wie der live geschaltete Artikel —
Header, Kategorie-Pill, Meta-Zeile, Cover, Prose, Autor-Card mit seinem
Bild, Footer, alles.

1. **Template:** `assets/preview-template.html` in diesem Skill-Ordner —
   1:1-Replik der Blog-Detailseite (extrahiert aus `globals.css` @theme +
   `components/` am 2026-08-29). Platzhalter: `{{LOGO}}`, `{{COVER}}`,
   `{{AVATAR}}` (data-URIs) sowie Titel/Datum/Tags/Content/Autor-Block im
   Markup ersetzen. **Drift-Check:** Bei sichtbaren Abweichungen zum
   Live-Blog Template gegen `app/[locale]/globals.css` (`.prose-blog`,
   Tokens) und `components/blog/*` aktualisieren.
2. **Echtbild-Pflicht:** Cover und Avatar aus realem Material — Stills aus
   dem gemeinsamen Dreh (Grade-Kette aus dem jeweiligen Dreh-Datenblatt)
   oder Bilder des Artists. Kein KI-Bild, kein Platzhalter. Cover 16:9
   (~1600×900 JPEG), Avatar quadratischer Kopf-Crop (~288×288); alles als
   data-URI einbetten — die Datei muss ohne Server funktionieren (einzige
   Netz-Abhängigkeit: Google-Fonts-Link mit System-Fallback).
3. **Verifizieren, nicht behaupten:** Datei headless rendern (Chrome
   `--headless --screenshot --window-size=1440,<hoch>`) und Screenshots
   selbst ansehen: Titel-Anführungszeichen typografisch („…"), Umlaute,
   Autor-Card, Footer. Falle: `min-height:100svh` streckt Sections auf die
   künstliche Fensterhöhe — für den Footer-Check eine Testkopie ohne
   `min-height` rendern; die echte Datei bleibt originalgetreu.
4. **Ablage:** auf Tomeks Desktop, sprechender Dateiname
   (`toda-blog-<slug>.html`). Tomek leitet sie an den Artist weiter.

### 3.2 Freigabe-Paket (mit der Vorschau an Tomek)

Fertige, per-Du **Freigabe-Nachricht an den Artist**: Vorschau-Datei als
Anhang gedacht, Verwertungsumfang klar benannt (Blog + Social + dauerhafte
Verlinkung), klare Frage nach dem Go, Hinweis „ohne dein Go geht nichts
raus, du änderst, was du willst" — plus **Fakten-Checkliste**: die
konkreten Punkte, die nur der Artist bestätigen kann (Zahlen/Jahre,
Anekdoten mit Dritten, Nennung von Studio/Partnern, Instagram-Handles,
Titel-Zitat). Volle Kontrolle über die Außenwirkung liegt beim Artist —
das ist Teil des Versprechens.

### 3.3 Nach dem Go: Insert, Snapshot, Report

1. Korrekturwünsche des Artists einarbeiten (→ Lern-Signal für Lauf 0),
   Vorschau aktualisieren, wenn nötig erneut zeigen.
2. **Insert** wie `/blog-article` 2.3 (CLI-Regime: Draft-JSON mit
   `author_slug` → Pre-Action-Report → `pnpm blog:draft-insert <draft.json>`;
   Draft, `published_at` NULL) +
   **Snapshot-Pflicht** `docs/blog/originals/<slug>.md` — Snapshot enthält
   den Artikel **plus die Quellen-Nachweis-Liste** aus Lauf 2;
   Registrierung im `voice-learnings.md`-Log. Cover in den
   `blog-covers`-Storage, Autor mit Avatar in die Autoren-Tabelle.
3. **Publish macht Tomek** (mit dem dokumentierten Go des Artists).
4. **Report:** Titel, Review-Link, eingelöste Verlink-Liste, offene
   Nachträge (z. B. Folgen-URL statt Kanal-Link), plus
   **Distribution-Ausweis**: 2–3 Social-Hook-Zeilen für TODA **und** ein
   Share-Paket für den Artist selbst (sein Share an seine Follower ist
   der stärkste Beat des Formats — ihm so leicht wie möglich machen).

## Lauf 4 — Instagram-Carousel-Paket (Pflicht, sobald publiziert)

Zu jeder publizierten Artist-Story entsteht das Social-Paket — Erstlauf
(Vossi, 2026-08-29) ist das Muster; die Kanal- und Format-Wahrheit
(Caption-/Link-/Collab-Regeln, Benchmarks, Recherche-Destillat) liegt im
Marketing-Repo: `/Users/harvestflow/Developer/toda/marketing/channels/instagram.md`
→ „Artist-Story-Carousel" — Pflichtlektüre vor dem Bauen.

1. **Bild-Regel (Tomek, festgenagelt):** Das Bild des Posts ist IMMER der
   Autor-Card-Avatar des Artikels (`blog_authors.avatar_path`) — auf Hook-
   und CTA-Slide. Kein anderes Bild, kein Stock, kein KI-Bild.
2. **7-Slide-Dramaturgie** (Abweichung nur mit Grund): 1 Hook (Portrait +
   O-Ton-Titelzitat + Goldzeile + „1/7 →") · 2 Backup-Hook (härtester
   Zahlen-/Kontrast-Moment — füttert den Re-Serve) · 3–4 Story-Beats ·
   5 Überraschung/Ehrlichkeits-Beat · 6 Save-Magnet (Mitgaben-Checkliste
   + Save-Zeile) · 7 CTA-Klammer (Portrait dunkler; „Link in den
   Kommentaren" + Artist-Handle + Save/Send-Zeile).
3. **Jeder Slide-Text stammt aus dem Artikel** — kondensieren ja,
   dazudichten nie (härteste Regel gilt auch hier). Eine Idee pro Slide,
   Support ≤ 25 Wörter, „n/7"-Nummerierung, EIN Gold-Akzent pro Slide.
4. **Technik:** Slide-HTMLs nach `assets/carousel-slides.html` (Archetypen
   + Tokens; 1080×1350) → headless Chrome je Slide (`--headless
   --screenshot --window-size=1080,1350 --hide-scrollbars`) → jeden PNG
   **selbst ansehen** (Sichtpflicht wie 3.1).
5. **Ablage — Desktop, nie Repo:** `~/Desktop/toda-post-<slug>/` mit den
   Slides + `posting-paket.md` (Caption 150–300 Zeichen ohne Link ·
   1. Kommentar mit Artikel-Link · Story-Baustein mit Link-Sticker ·
   Collab-Einladung an den Artist als Standard-Empfehlung ·
   Share-Nachricht an den Artist · Timing/Messung). Das Template ist die
   Referenz, nicht der Output — PNGs werden nicht versioniert.
6. **Lern-Rücklauf:** ~72 h nach dem Posten Insights erfragen (Saves,
   Reichweite, ggf. Swipe-Through) → Learnings hierher bzw. in die
   Format-Definition im Marketing-Repo zurückschreiben.

## Lauf 5 — Story-Baustein: die Podcast-Folge (nur wenn es eine gibt)

Gibt es zur Artist-Story eine **öffentliche Toddcast-Folge** — nicht immer
der Fall, bei Vossi (2026-08-29) schon —, entsteht zusätzlich zum Carousel
**ein Story-Bild, das auf die Folge zeigt**. Kein Ersatz für die
Artikel-Story aus Lauf 4, sondern ein zweiter Baustein. Die Kanal- und
Format-Wahrheit liegt wie bei Lauf 4 im Marketing-Repo:
`/Users/harvestflow/Developer/toda/marketing/channels/instagram.md`
→ „Podcast-Story" — Pflichtlektüre vor dem Bauen.

1. **Warum YouTube-Look, nicht TODA-Look.** Der Link-Sticker ist laut
   `channels/instagram.md` der einzige Ort, an dem ein externer Link
   wirklich klickbar ist. Die Story muss deshalb **vor dem Tap** zeigen,
   wohin er führt: ein laufender YouTube-Player. Rote Wortmarke, roter
   Play-Button, Fortschrittsbalken, Timecode, Kanalzeile mit
   „Abonnieren" — **Gold ist nur der Link-Cue**, der einzige Marken-Anker.
2. **Wahrheitspflicht (Verlängerung der Echtbild-Regel).** Thumbnail,
   Titel und Laufzeit stammen **aus der live geschalteten Folge**, nicht
   aus dem Entwurf: Kanal vorher scrapen (DeepAPI
   `POST /v1/scrape/youtube/channel`) und das Thumbnail gegen
   `i.ytimg.com/vi/<id>/hq720.jpg` prüfen. Was die Story zeigt, muss nach
   dem Tap identisch aussehen. Ist die Folge noch nicht live, entfällt
   Lauf 5 — **kein Mockup einer unveröffentlichten Folge**.
3. **Keine Zahlen im Design.** Weder Aufrufe noch Abonnenten — kleine
   Zahlen entwerten den Post. Die Kanalzeile trägt Name + ruhige Subline;
   die Meta-Zeile Laufzeit + „zu Gast: <Artist>" (macht die Klammer zur
   Story sichtbar).
4. **Technik:** `assets/story-podcast.html` (1080×1920, Platzhalter im
   Kopf der Datei dokumentiert) → Generator-Script im Scratchpad, das
   **zuerst den Doku-Kommentar entfernt** und dann ersetzt (sonst landen
   die base64-Blobs im Kommentar) → headless Chrome
   (`--window-size=1080,1920 --force-device-scale-factor=1`) → PNG
   **selbst ansehen** (Sichtpflicht wie 3.1 und Lauf 4).
5. **Safe-Area ist Layout-Gesetz, nicht Geschmack.** Instagram belegt oben
   und unten je 250 px; **y 1500–1670 bleibt leer**, dort setzt Tomek den
   Link-Sticker, und der Goldpfeil zeigt genau dorthin. Nachweis vor der
   Übergabe: Kontroll-Render mit IG-Chrome-Overlay und Mock-Sticker **im
   Scratchpad** (nie im Deliverable-Ordner) — er hat im Erstlauf die
   Action-Chip-Zeile gekippt, weil sie die Sticker-Zone gefressen hat.
6. **Ablage:** derselbe Desktop-Ordner wie Lauf 4 —
   `story-podcast.png` (das Asset für die Story) plus `story-podcast.html`
   zum Nachjustieren. Im `posting-paket.md` bekommt die Folge einen
   eigenen Story-Block: Bild, Sticker-Ziel (Folgen-URL), Sticker-Text.

## Harte Regeln

- Alle Spine-Regeln aus `/blog-article` gelten (nie publizieren, nie
  fremde Posts ändern/löschen, Slug-Kollision → neuer Slug, eine Sprache
  pro Lauf = `de`, Wissensdokumente sind Teil des Deliverables).
- **HTML-Vorschau vor allem anderen** — kein Insert, bevor der Artist die
  Vorschau gesehen und sein Go gegeben hat.
- **Nichts erfinden** — nur Material, jede Aussage mit Quellen-Nachweis;
  Lücken → Fakten-Checkliste, nie Dichtung.
- **Kein Publish ohne dokumentiertes Artist-Go** (Gate liegt bei Tomek).
- **TODA ist keine Figur im Text**; kein Embed, keine Produkt-Werbung.
- **Keine identifizierbaren Dritten in negativen Passagen.**
- Der Skill akquiriert keine Artists und schreibt niemanden an.

## Praxis-Referenz

Lauf 1 (2026-08-29): Markus „Skeet" Vossi, *„Du musst noch üben" — mein
Weg vom Dachdecker zum Tattoo Artist* — Quelle Toddcast Folge 01,
Vorschau `toda-blog-vom-dachdecker-zum-tattoo-artist.html`. Der Lauf hat
dieses SKILL.md geformt (Ich-Perspektive, Vorschau-zuerst, Echtbild,
Nachweis-Liste, Superlativ-Entschärfung). Publiziert 29.08.2026 in de/en/es
(Kategorie `artist-stories`); gleicher Tag: erstes Carousel-Paket
(`~/Desktop/toda-post-vom-dachdecker/`) → daraus Lauf 4 codifiziert. Ebenfalls
29.08.2026: erste Podcast-Story (`story-podcast.png`) zur live geschalteten
Folge *Vom Dachdecker zum Tattoo-Artist — mehr Geld, mehr Freizeit*
(`youtube.com/watch?v=_zy3a1RIaWE`) → daraus Lauf 5 codifiziert.
