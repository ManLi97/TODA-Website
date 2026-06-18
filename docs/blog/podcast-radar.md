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
- **Kommentar-Mining:** Top-Kommentare der Kandidaten-Folge scrapen (Apify,
  vgl. den YouTube-Kommentar-Test in `topic-radar.md`, Lauf 11.06.) → welche
  These / welches Segment zündet, welche Fragen sich wiederholen. Das legt den
  artikel-fähigen **Kern** einer 60–90-Minuten-Folge frei.
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

*Noch keine Läufe — der erste Eintrag folgt mit dem ersten Toddcast-Artikel.*
