# Podcast-Radar — Recycling-Protokoll

Zweck: Jede Folge→Artikel-Entscheidung des `/podcast-article`-Skills ist hier
dokumentiert und nachprüfbar — welche **Toddcast**-Folge (bzw. welches Segment)
recycelt wurde, wie sie gewonnen hat, welche Demand- und Quellen-Validierung sie
bestanden hat, welche Embed-Felder gesetzt wurden. **Append-only:** pro
Recycling-Lauf ein datierter Eintrag, alte Einträge werden nie umgeschrieben.

Dieses Dokument ist das Podcast-Pendant zu `topic-radar.md` und teilt dessen
Spine (`toda-context.md`, `voice-learnings.md`, `sources.md`, dasselbe
Supabase-CMS + `originals/`-Lern-Loop). Der Unterschied liegt allein in der
**Themenherkunft**.

## Methode (Stand Juni 2026)

**Ausgangslage — supply-getrieben statt demand-getrieben.** `topic-radar`
startet bei der Nachfrage (was sucht/schmerzt die Zielgruppe) und sucht dann
Quellen. `podcast-radar` startet beim **Angebot**: Mit **Toddcast** (TODAs
eigenem Longform-Podcast auf YouTube) liegt bereits reicher O-Ton vor. Die
Aufgabe ist nicht „ein Thema finden", sondern: *welche Folge / welches Segment
wird ein rank-worthy Artikel — und wie, ohne ein 1:1-Transkript zu sein.*

Genau deshalb darf der Skill nicht supply-blind recyceln. Damit ein
Podcast-Artikel rankt und Mehrwert trägt, wird die Folge **demand-geformt und
fakten-belegt** — über dieselben Validierungs-Gates wie ein Blog-Topic. Drei
Schritte: **Auswahl → Validierung → Recycling.**

### A — Folgen-/Segment-Auswahl (Hybrid: Skill schlägt vor, Tomek bestätigt)

Eigener Kanal = eigene Analytics. Signale:

- **Folgen-Engagement:** Views, Likes, Kommentarzahl — **relativ zum
  Kanal-Median** (gleiche Outlier-Logik wie topic-radar: eine überdurch-
  schnittliche Folge ist ein stärkeres Themensignal als eine durchschnittliche,
  unabhängig von der absoluten Kanalgröße).
- **Kommentar-Mining:** Top-Kommentare der Kandidaten-Folge über den
  Data-API-Helper `lib/mining/youtube.ts` (`commentThreads`, `order=relevance`)
  bzw. `pnpm mining:sync --source yt-comments` → welche These / welches Segment
  zündet, welche Fragen sich wiederholen. Das legt den artikel-fähigen **Kern**
  einer 60–90-Minuten-Folge frei. *(Korrektur 2026-08-29: Hier stand Apify —
  die Strecke ist seit 08/2026 komplett ersetzt, siehe SKILL.md 1.1. Der
  Lauf-Eintrag vom 18.06. nennt Apify historisch korrekt und bleibt unverändert.)*
- **Clips als Ersatz, solange der Kanal klein ist:** Gebaute Clips im
  `toda-video-tool` sind eine fertige Segment-Bewertung durch zwei unabhängige
  Verfahren (OpusClip-Viralitätsscore, Community-Puls) — bei einem Kanal ohne
  nennenswerte Kommentare tragen sie die Auswahl (belegt Lauf 2).
- **Selbst-Contained-Check:** Trägt das Segment eine in sich geschlossene
  These / Story / Anleitung, die als 600–650-Wörter-Artikel steht?

Output: Top-Kandidaten (Folge + Segment + Timestamp) → **Tomek bestätigt** die
Wahl, bevor geschrieben wird.

### B — Validierung (dieselben drei Gates wie topic-radar)

1. **Dedup-Check:** Query gegen `blog_post_translations` (Titel/Tags/Slugs aller
   Drafts + veröffentlichten Posts) — schon behandelte Themen scheiden aus oder
   brauchen einen neuen Winkel.
2. **Such-Validierung:** Wird das Folgen-Thema im DACH-Raum gesucht? Bei
   supply-getriebener Auswahl ist dieses Gate **besonders scharf** — sonst
   recyceln wir an der Nachfrage vorbei. Kein Suchinteresse → Folge wartet oder
   der Winkel wird auf einen gesuchten Teilaspekt gedreht.
3. **Quellen-Check:** Lässt sich die Kern-These der Folge mit einer Tier-1/2-
   Quelle aus `sources.md` belegen? Die Hosts liefern **O-Ton, keinen
   Faktenbeweis.**

### C — Recycling-Regeln (das „kein 1:1-Transkript"-Prinzip)

- **Die Folge ist O-Ton-Primärquelle.** Host-Aussagen werden **namentlich**
  zugeordnet (kurzes wörtliches Zitat oder Paraphrase) und die Folge per
  Struktur-Embed eingebettet (Click-to-Play-Facade + VideoObject-JSON-LD, siehe
  Podcast-Embed-Infra). Namens-Attribution-Regel: `toda-context.md`, Abschnitt
  „Der Podcast — Toddcast".
- **Der Artikel reframed, er transkribiert nicht.** Die Kern-These der Folge
  wird in einen straffen, suchbaren TODA-Voice-Text übersetzt — voll unter
  R1–R10 (`voice-learnings.md`): Dual-Title, ~600–650 Wörter, **eine**
  TODA-Mention, Signatur-Schluss. **Kein** Transkript, **keine**
  Folgen-Zusammenfassung: eine These, ein Kernfakt (R4), wie bei `/blog-article`.
- **Fakten vs. Haltung.** Fakten kommen aus `sources.md` Tier-1/2; die Folge
  liefert Haltung, Anekdote, O-Ton. Exakt die Hierarchie wie bei
  Community-Material (Stimmung ≠ Beleg).
- **Embed-Wiring** (Felder auf `blog_post_translations`):
  - `youtube_id` ← Folgen-URL (vom Skill via `parseYouTubeInput` in
    `lib/blog/youtube.ts` zur 11-Zeichen-ID normalisiert).
  - `video_start_seconds` ← Timestamp des recycelten **Segments** (Deeplink
    direkt an die Stelle, um die der Artikel kreist).
  - `video_published_at` ← Veröffentlichungsdatum der Folge.

Append-only: pro Recycling-Lauf ein datierter Eintrag unten. Format analog
`topic-radar.md` — Folge (Titel/URL/id), Segment + Timestamp,
Engagement-Snapshot, die drei Gate-Ergebnisse, genutzte Tier-1/2-Quellen,
gesetzte Embed-Felder, resultierender Draft-Slug + post_id, Begründung.

---

<!-- Lauf-Einträge ab hier, neueste unten anhängen -->

## Lauf 2026-06-18 — Folge 1: Burnout & Kundenkommunikation (Sandra, Nacht und Nebel)

**Folge:** Toddcast #1 „Schockierende Geschichten aus dem Tattoostudio" —
`youtube.com/watch?v=rdOlY1-Bp5E` (id `rdOlY1-Bp5E`), Kanal @TODATattooSolutions.
Lineup: Sandra (TODA, Gastgeberin), Meike (Moderatorin), **Sandra (Nacht und Nebel,
Gast)** — die O-Ton-Geberin.

**Intake:** Apify-Captions (bewährt) → 45-Sek-Fenster (`build.py`-Logik) →
`ep1_windows.txt` (783 Zeilen, ~54 Min). Auto-Captions fehlerhaft (Namen verrutscht,
„Stichstunde" statt „Toddcast") → Lineup von Tomek bezogen, Showname auf „Toddcast"
normalisiert. (Validiert die Skill-Regeln „kein caption-geratener Name" + „immer Toddcast".)

**Segment (gewählt):** ~20:35–31:00, Start `video_start_seconds = 1236`. Sandras
Burnout aus der 60–70-Std-Woche + ihre Diagnose, dass die **Kundenkommunikation**
(nicht das Stechen) der Kern-Zeitfresser ist, plus der organische TODA-Wendepunkt
(Erstkommunikation abgefangen). Engagement nicht quantitativ gescort (Einzel-Folge,
Kanal neu) — Segment-Wahl qualitativ aus Transkript + TODA-Fit.

**Gates:** (1) Dedup ✅ — „Kundenkommunikation" zwar Tag bei studio-lächeln
(Erwartungsmgmt) + Nachsorge, aber Burnout/Work-Life-Balance/Erstkommunikations-Last
ist frischer Winkel. (2) Such-Validierung ✅ — Tätowierer-Burnout/WLB breit belegt
(EN-Quellen nennen „constant client communication" als Treiber); DACH artist-facing
Lücke; consumer-Term „was kostet ein Tattoo" bewusst gemieden. (3) Quellen-Check —
keine Tier-1/2 nötig (kein Rechts-/Zahlenanspruch; Erfahrungs-/Beratungsebene).

**Embed-Felder:** `youtube_id=rdOlY1-Bp5E`, `video_start_seconds=1236`,
`video_published_at=NULL` (Folgen-Datum offen — Tomek setzt es im A3-Editor / nennt es).

**Interner Link:** publiziertes Cluster-Geschwister
`eigentlich-bin-ich-…-laecheln…` (Kundenkommunikation-Cluster).

**Ergebnis:** Draft `taetowierer-burnout-kundenkommunikation` (post_id
`359e6fe0-7824-4857-9a00-3ba8538358a0`), Kategorie Handwerk & Studio, ~610 Wörter,
R1–R10, 1 TODA-Mention (zwinkernd), Signatur-Schluss. Erster `/podcast-article`-Lauf
(zugleich B2-Akzeptanztest).

---

## Lauf 2026-08-29 — Folge „Vom Dachdecker zum Tattoo-Artist": Rabatte & Preisspirale

**Folge:** Toddcast, `youtube.com/watch?v=_zy3a1RIaWE`, live 29.08.2026.
Lineup: Tomek (TODA, Host), Markus „Skeet" Vossi (Gast).

**Intake — Abweichung von Lauf 1 (bewusst):** KEINE YouTube-Auto-Captions.
Stattdessen das Transkript aus `toda-video-tool`
(`podcast/toda-toddcast/vossi-tomek-toddcast1/reference/transkript.json`, 998 Sätze)
plus die `szenen.md` der gebauten Clips als **bild-verifizierte** Sprecherquelle.
Daraus ist die Vorrang-Regel in SKILL.md 1.1 entstanden.

**Segment-Auswahl — ebenfalls abweichend:** Der Kanal ist zu jung für
Kommentar-Mining (31 Abos beim Erstlauf). Als Engagement-Ersatz dienten die 13
gebauten Clips — zwei unabhängige Verfahren haben die Folge bereits nach
tragfähigen Stellen abgesucht (Route A = OpusClip-Viralitätsscore, Route B =
Community-Puls). Drei Clips tragen dieselbe These und wurden zu einem Artikel
verdichtet: `vossi-rabatte-falle` (01:04:10–01:06:22, Kern),
`vossi-unter-wert-verkaufen` (01:09:03–01:10:40, Mechanik),
`vossi-400-euro-illusion` (00:14:54–00:16:32, Gegenrechnung).
`video_start_seconds = 3899` zeigt auf das Kernsegment.

**Gates:**
1. **Dedup ✅** — Preis/Rabatt ist in `blog_post_translations` unbesetzt.
   Nachbarn: `tattoo-anzahlung-no-shows-recht` (draft, Anzahlung ≠ Rabatt) und
   `eigentlich-bin-ich-…-laecheln…` (Erwartungsmanagement) — Letzterer als
   interner Link genutzt.
2. **Such-Validierung ✅** — 6 DeepAPI-Web-Suchen (29.08.2026). Artist-facing
   DE-Demand belegt: „Stundensatz für Tätowierer kalkulieren", „Tattoo Preise
   berechnen: Stundensatz & Kalkulation" (nennt Vorbereitungszeit als unbezahlte
   Arbeitszeit), „Viele Tattoo Künstler verkaufen sich unter Wert!" (2 Monate alt),
   „Tattoo Talk #28 – Preismodelle im Tattoostudio" (12/2025).
   **Der Befund, der den Winkel setzt:** Die Rabattfallen-These ist im deutschen
   Handwerk vollständig durchdekliniert (handwerk.com, dhz.net, Handwerksblatt,
   handwerk magazin), in der Tattoo-Nische DE praktisch nicht. Der DE-SERP zu
   „Tattoo Preis" ist konsumentenseitig besetzt (Preisguides, Rechner) —
   artist-facing ist die Lücke. Deckt sich mit dem Puls-Befund
   „DE-Artist-Business-Stimmen fehlen strukturell".
3. **Quellen-Check — keine Tier-1/2 verwendet.** Wie in Lauf 1: kein Rechts- oder
   Zahlenanspruch, reine Erfahrungs-/Beratungsebene. Die Handwerks-Fachartikel aus
   der Suche wurden **nicht** zitiert — Snippets sind kein Beleg und ein
   Verifikations-Scrape schlug fehl (geratene URL). `sources.md` führt für
   Preis-/Business-Psychologie ohnehin keine Tier-1/2-Quelle.

**Sprecher-Absicherung:** Jedes Zitat gegen die `szenen.md` des zugehörigen Clips
geprüft; verwendet wurden nur als VOSSI bild-bestätigte Sätze. **Nicht
attribuiert** wurde die 400-Euro-Zeile (#201–#202) — `transkript.json` sagt VOSSI,
die `szenen.md` von `vossi-400-euro-illusion` weist sie per Bildbeweis TOMEK zu.
Sie steht im Artikel als Außenstimme ohne Sprecher.

**Ergebnis:** Draft `tattoo-preise-rabatte-unter-wert-verkaufen`
(post_id `80df85d2-a328-450f-a342-9fe29da8b265`), Kategorie `law-money`, 634 Wörter, R1–R10,
1 TODA-Mention, 2 interne Links.

**Entscheidungen Tomeks zu diesem Lauf (2026-08-29):**
- Das Zitat „Ach, du bist Tätowierer …" bleibt stehen — fremde Rede, und genau
  das ist die Pointe; `terminology.md` gilt für TODAs eigene Sprache.
- „Kurze Eigenwerbung" statt „Kurze Schleichwerbung" (R8 entsprechend nachgezogen).
- Kategorie `law-money` statt `toda-podcast` — Themen-Cluster schlägt Format-Label.
