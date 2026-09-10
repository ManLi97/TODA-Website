# Plan — Blogartikel „Was kostet ein Tattoo bei dir?" (Preisfrage-DM, Vorlagen-Format) + Karussell

> Repo-Zielpfad (beim Start der Umsetzung verbatim dorthin kopieren):
> `.claude/plans/blog-preisfrage-dm-vorlagen.md`

## Execution Brief

- **Preconditions:** Branch `staging`, clean (Stand 10.09.2026: ✓). `.env.local` mit
  `SUPABASE_SERVICE_ROLE_KEY`, `SERPAPI_API_KEY`; DeepAPI via `source ~/.deepapi/env`;
  kie.ai-Key in `toda-motion-graphics/.env` (Script lädt ihn selbst). Supabase-MCP read-only
  für alle Lesezugriffe; **Schreibpfad ausschließlich `pnpm blog:draft-insert <draft.json>`**.
- **Execution:** Auto Mode, in DIESER Session (Tomeks Vorgabe 10.09.2026: „danach kannst du ihn
  autonom in auto mode abarbeiten"). Kein Fresh-Session-Handoff nötig.
- **Sub-Agenten:** max. 2 gleichzeitig (Quellen-Verifikation / Karussell-Render), kein Fan-out-Gate nötig.

### §0 Plan-Fidelity

- **Evidence beats plan.** Widerspricht die Realität (DB-Stand, Quelle nicht lesbar, Feature
  existiert nicht) einer Annahme hier: Realität gewinnt, Abweichung im Report dokumentieren.
- **Bindend:** Thema/Winkel, Format (Vorlagen), Wortkorridor 550–700, genau EINE TODA-Mention
  (R8/R11), keine Feature-Erfindung, Fakten nur mit im Lauf per DeepAPI gelesener Tier-1/2-Quelle,
  niemals `status = 'published'`, Schreibpfad nur `blog:draft-insert`, Snapshot-Pflicht,
  Wissensdokumente nachziehen, Karussell nach dem Desktop-System (nicht ad hoc).
- **Richtwert:** Titelvarianten, H2-Wortlaut, Slide-Texte, Cover-Prompts, Farb-/Pixelwerte
  (aus den Referenzdateien übernehmen, nicht aus diesem Plan raten).
- Jeden zitierten Pfad/Anker vor Nutzung gegenprüfen.

## Context

**Warum dieser Artikel.** Puls-Analyse 10.09.2026 (Chat): `pricing` ist der einzige Cluster, der in
W36 (Rang 1, 102 Signale / 17 Quellen / Score 2945) UND W37 (Score-Spitze 41, dünne Woche) oben
steht. Drei Konvergenzen: Strom C1 (Instagram-DM-Chaos = Produkt-Wedge, höchste Prio, SERP leer),
Erstanbieter-Signal (IG-Post „Keine ‚Was kostet ein Tattoo?'-Nachrichten mehr", 2.678 Reach,
90 Likes, 19 Shares, 9 Saves — bestes Engagement-Verhältnis der Woche, `pulse_digests` W37
`first_party`), und SERP-PAA-Fragen zu „Tattoo Preise" (W36+W37, `topic_signals` platform
`serp`, source „Tattoo Preise"): „Was für ein Tattoo bekommt man für 100 / 200 / 300 €?", „Wie groß
ist ein Tattoo für 150 €?", „Wie groß ist ein 500 € Tattoo?". Endkunden fragen in **Budget**, Artists
rechnen in **Stunden** — genau diese Einheiten-Lücke ist die DM „Was kostet ein Tattoo bei dir?".
Zielgruppen-Gate: Cluster endkundenlastig, aber der Schmerzpunkt ist ICP-Kern
(`positioning.md`: „unseriöse Anfragen", „schreibfaul", „Was kostet ein Tattoo?" als Value-Prop-
Beispiel) → bestanden, gleiche Logik wie beim Anzahlungsartikel 08.09.

**Dedup.** Rabatte-Artikel (04.09., law-money) = Rabatt-Spirale + „aus einer Stunde werden sechs";
Anzahlung/Widerruf (08.09.) = Fernabsatz; Vollzeit (09.09.) = Gewerbe/Steuer. **Neuer Winkel:** die
Preis-DM selbst — Antwort-Vorlagen + „Preis an Privatkunden ist immer Gesamtpreis". Nicht
wiederholen: Rabatt-Spirale, Sechs-Stunden-Rechnung, Kleinunternehmer-Schwellen (nur verlinken).

**Format: Vorlagen (Lead-Magnet-Format)** — erster Artikel dieses Formats (`toda-context.md`,
„Artikel-Formate" Nr. 3): Kern = kopierbare DM-Antworten als Blockquotes, TODA-Mention = Feature-
Brücke. Strom-C-Slot C1 wird damit „in Arbeit"; C9 (Preisaufbau/Rechner) bleibt offen.

**Stil-Ground-Truth (gelesen 10.09.):** Rabatte-Artikel + Anzahlung-Artikel (beide published,
Snapshots vorhanden) — Lede mit Uhrzeit/Szene, Fett-Punchline am Lede-Ende (R14), H2 mit
Klammer-Aside (R3), 4er-Spiegelstrichliste mit **Label:** (R5), „Kurzer Hint 🤓"-Absatz (R8),
Schluss „So bleibt mehr Zeit für das, was wirklich zählt: **Deine Kunst.**" (R10), 1 Emoji.

## Schritt 1 — Lauf 0 (Lern-Schritt, Pflicht)

1. `docs/blog/voice-learnings.md` lesen (R1–R14 + Log).
2. **Offenes Delta:** `vollzeit-taetowierer-werden-10-dinge` wurde 09.09. 12:19 UTC publiziert
   (Insert 11:12) und ist im Log noch „wartet auf Review" → veröffentlichte Fassung
   (`blog_post_translations`, locale de) gegen `docs/blog/originals/vollzeit-taetowierer-werden-10-dinge.md`
   semantisch vergleichen (Zeilenenden normalisieren: CRLF des Admin-Editors). Muster → Regel
   in `voice-learnings.md` (nur Blog-Stimme; Partner-Link-Handling ist Prozess → SKILL.md). Log-Zeile
   aktualisieren. **Kein Text, solange dieses Delta unausgewertet ist** (SKILL.md Lauf 0, Punkt 5).
3. Log gegen DB abgleichen (Slugs, Status, gelöschte Drafts): `select slug, status, published_at
   from blog_post_translations where locale='de' order by published_at desc nulls first`.

## Schritt 2 — Mining-Nachweis (kurz, Thema steht)

Kein neuer Mining-Lauf — Thema per Puls-Analyse gesetzt. Für den Radar-Eintrag belegen:
- `pulse_cluster_weekly` W36/W37 für `pricing`, `booking-flow`, `communication-overload`.
- Belegzeilen (schon identifiziert): W37 `first_party.top_posts` Permalink
  `instagram.com/p/DcvhZ_UjLLN/`; SERP-PAA-Zeilen source „Tattoo Preise" (ingested 06./07.09.);
  DE-Stimmung W36 `quotes`: „Viele vergessen ganz gerne welche Fixkosten man als selbstständiger
  hat" (YT, praise), „man nicht nur die Zeit zum Stechen bezahlt" (YT, praise), Schweizer FB-Gruppe
  „hauptsächlich nach dem günstigsten Preis gesucht … unzuverlässige Kunden" (complaint), YT-Video
  „Wie rechnet sich der Preis? Wie stelle ich eine Anfrage" (35.638 Engagement, 02.09.).
  → im Artikel nur als lose Stimmung, nie wörtlich (Regel 2).
- **Such-Validierung (SEO, Schritt 4):** SerpApi google.de für 3 Queries (siehe SEO) — Ergebnis
  (wer rankt, Volumen) in den Radar-Eintrag.

## Schritt 3 — Quellen (Tier 1/2, im Lauf per DeepAPI lesen; `skill:deepapi` zuerst laden)

Fakten-Kern (R4: EIN Leitfakt, EINE Kernzahl):

| Behauptung | Quelle | Status |
|---|---|---|
| Wer Verbrauchern gewerblich Leistungen anbietet oder mit Preisen wirbt, muss den **Gesamtpreis** (inkl. USt und sonstiger Preisbestandteile) angeben | PAngV § 3 Abs. 1 — `gesetze-im-internet.de/pangv_2022/__3.html` (Tier 1) | **neu, verifizieren**; nur wörtlich Belegtes behaupten; Anwendungsbereich § 1 PAngV mitlesen |
| Regelsteuersatz 19 % | UStG § 12 — `/ustg_1980/__12.html` (Tier 1) | verifiziert 09.09. (Vollzeit-Lauf), im Lauf erneut lesen |
| Kleinunternehmer weisen keine USt aus | UStG § 19 — `/ustg_1980/__19.html` (Tier 1) | verifiziert 09.09., erneut lesen; Schwellen NICHT wiederholen → Link auf Vollzeit-Artikel |
| Fernabsatz/Widerruf bei Chat-Termin | eigener Artikel (intern) | kein neuer Beleg nötig |

Fallback, falls PAngV-Text den Gesamtpreis-Punkt nicht so hergibt: Kernfakt auf UStG § 12/§ 19
reduzieren („19 % sind im Preis, nicht obendrauf") — Behauptung ohne Belegpassage fliegt.
Optionaler Tier-1-Anker für „Preiskalkulation" (nur wenn lesbar + tragfähig, sonst weglassen):
BMWK Existenzgründungsportal „Preiskalkulation/Stundensatz" oder IHK-Leitfaden. **Keine
Marktpreise, keine Stundensatz-Zahlen behaupten** (kein Tier-1-Anker vorhanden).

Alle genutzten Quellen → `sources.md`-Eintrag (nur tatsächlich verwendete).

## Schritt 4 — SEO

- **Suchintention-Split:** „was kostet ein tattoo" = Endkunden-Head-Term (Studio-/Preisguides,
  nicht gewinnbar, nur als Titel-Hook). Artikel zielt auf **Artist-Intent**:
  Primär `tattoo preisanfrage beantworten` / `tattoo anfrage was kostet antworten`,
  sekundär `tattoo preis erklären kunden`, `tätowierer antwort vorlage instagram anfrage`.
  Validierung: SerpApi google.de (3 Calls) + DeepAPI Web-Suche „tattoo preisanfrage antworten
  vorlage" → wer rankt; Ergebnis in Radar. Erwartung: dünne SERP (C1-Befund „SERP leer").
- `slug`: `tattoo-preisanfrage-beantworten-vorlage` (Suchsprache erlaubt; unique per SELECT prüfen).
- `seo_title` ≤ 60: „Tattoo-Preisanfrage beantworten: Vorlagen für Tätowierer" (54).
- `seo_description` ≤ 155: „‚Was kostet ein Tattoo?' Drei DM-Vorlagen für Instagram & WhatsApp,
  warum dein Preis immer brutto ist und wie aus der Preisfrage eine echte Anfrage wird." (Länge im
  Lauf zählen, ggf. kürzen).
- Fließtext/Titel: „Tattoo Artist", nie „Tätowierer" (Regel 8); Suchsprache nur in slug/seo_*.
- **Interne Links (3, alle published de):** `/de/blog/du-erziehst-dir-deine-kunden-wenn-der-rabatt-teurer-wird-als-die-absage`
  (Rabatt-Spirale), `/de/blog/tattoo-anzahlung-widerrufsrecht-online-buchung` (Anzahlung/Widerruf),
  `/de/blog/vollzeit-taetowierer-werden-10-dinge` (Kleinunternehmer/Steuer). Vorher per SELECT
  `status='published'` bestätigen.
- Externe Quellen-Links inline (Regel 6). JSON-LD/hreflang/x-default macht die Seite selbst.
- Tags (2–4, Title-Case): `Preisgestaltung`, `Kundenkommunikation`, `Vorlagen`, Rubrik-Tag
  `Recht-und-Kohle` nur bei Kategorie law-money.

## Schritt 5 — Artikel schreiben (550–700 W, de)

**Titel (R1 — Zitat-Hook + „wenn"-Stakes), zwei Kandidaten, Empfehlung = A:**
- A: „Was kostet ein Tattoo bei dir?" – die DM, die dich mehr kostet als den Kunden
- B: „Was bekomme ich für 200 Euro?" – wenn die Preisfrage dein Feierabend wird
`title` ≤ ~70 Zeichen prüfen; `seo_title` getrennt (oben).

**Struktur (Richtwert, H2 nach R3):**
1. **Lede** (kein H1): Szene — 23:40, Insta-DM „Hey, was kostet ein Tattoo bei dir?", kein Motiv,
   keine Größe, keine Stelle. Der Kunde denkt in Budget (er googelt wörtlich „Was bekomme ich für
   200 €"), du rechnest in Stunden. **Fett-Punchline, dann Schluss des Absatzes (R14)** — keine
   Steigerung, kein recyceltes „Autsch"-Schema (R7).
2. `## Warum die Frage nicht dumm ist (nur in der falschen Einheit)` — Einheiten-Lücke: Budget vs.
   Stunden × Satz + Material. Stimmung aus dem Puls lose („man hört von Artists …"). Was der Kunde
   dir geben muss, damit du überhaupt rechnen kannst: Motiv, Größe in cm, Stelle, Farbe/Schwarz,
   Referenz → **„Fünf Angaben, dann ein Preis. Vorher nur eine Schätzung ins Blaue."** (R6-Formel).
3. `## Jura-Quickie: Dein Preis ist immer brutto` — PAngV § 3 Gesamtpreis + UStG § 12/§ 19, eine
   Kernzahl (19 %), Link auf Vollzeit-Artikel für Kleinunternehmer-Details. Fett-Formel:
   **„Preis an Privatkunden = Gesamtpreis. IMMER."**
4. `## Die Vorlage: drei Antworten, die du nie wieder tippen musst` — Kern des Formats, drei
   Blockquotes (je ≤ 60 W, per Du, kopierbar, Platzhalter in `[eckigen Klammern]`):
   - **Erstantwort** auf „Was kostet?": freundlich, fordert die fünf Angaben an, nennt Mindestpreis-
     Logik nur als Platzhalter `[ab X €]`.
   - **Richtpreis-Antwort:** Zeitaufwand-Range + Preis-Range (Gesamtpreis), Anzahlung + Gültigkeit
     des Angebots, Hinweis dass der Preis im Angebot steht (Link Anzahlung-Artikel).
   - **Budget-Antwort** („Ich hab nur 150 €"): was für das Budget geht (kleiner/einfacher), was
     nicht — ohne Rabatt (Link Rabatte-Artikel).
   Vor jeder Vorlage 1 Satz, wann sie greift (R5-Stil: **Label:**).
5. **TODA-Absatz (genau einer, R8/R11):** „Kurzer Hint 🤓: …" — Feature-Brücke des Vorlagen-Formats:
   der Artist hinterlegt in Insta/WhatsApp selbst eine Auto-Antwort mit seinem Widget-Link; das
   Widget holt Körperstelle, zwei Fotos mit eingezeichneter Platzierung, Farbe/Schwarz-Grau,
   Beschreibung + Referenzen ab; Antwort = Angebot mit geschätzter Arbeitszeit + ca.-Preis und
   Buchungslink; die Vorlage passt in eine Quick-Action-Vorlage. **Wortlaut nur aus der
   Fakten-Tabelle in 5a — kein „Richtpreis", keine Spanne, keine Größenabfrage.**
6. `## Fazit` — die Preisfrage ist eine Anfrage ohne Angaben; Vorlage schickt den Kunden in den
   Prozess statt in den Chat. Schluss-Signatur R10.

**Voice-Checkliste vor dem Insert:** Ø Satzlänge nah an den Referenzartikeln; ≤ 2 Emojis (Ziel 1,
im TODA-Absatz); ALL-CAPS-Einzelwort 1–2× (R6); keine Gender-Doppelpunkte, keine Metaphern statt
Branchenwort (R12); keine Claude-Klammer-Asides; keine Disclaimer; „Kunden", nicht „Kund:innen";
Du/Dein in Überschriften groß, im Fließtext klein; kein Podcast-Bezug; Partner-Links keine.

### 5a — Produkt-Check (vor dem TODA-Absatz)

Verifiziert im App-Repo `toda-v2` (read-only Sub-Agent, 10.09.2026). **Der TODA-Absatz darf nur
diese Fakten nutzen:**

| Fakt | Stand | Beleg |
|---|---|---|
| Widget-Wizard, 6 Schritte: Körperstelle (Vorder-/Rückseite, Zonen) · **genau 2 Fotos der Stelle, Pflicht**, Platzierung wird **auf dem Foto** eingezeichnet · Stil (nur wenn der Artist Kategorien hinterlegt hat) · Farbe / Schwarz-Grau · Beschreibung ≥ 20 Zeichen + bis zu 3 Referenzbilder · Kontakt mit Geburtsdatum (18+ hart geprüft) | existiert | `apps/widget/src/components/wizard/wizard.tsx`, `drawing-dialog.tsx`, `packages/shared/src/inquiry.ts` |
| **Größenfeld: NEIN** (nur Hinweis im Freitext-Placeholder) · **Budget-/Preisfeld: NEIN** | existiert nicht | `step-details.tsx:89,95`, `inquirySchema` |
| Auto-Antwort-/DM-Textvorlagen für Instagram/WhatsApp in der App: **NEIN** — nur „Anfrage-Link kopieren" + Hinweis „Instagram → Profil → Website" | existiert nicht | `apps/studio/.../onboarding/steps/step-share.tsx`, `mein-toda/profile-header.tsx` |
| Antwort auf eine Anfrage = Composer mit Modi Nachricht / **Buchungslink** / Beratungstermin. Buchungslink: **Stunden pro Session (0,5–12)** + **ca.-Preis als EIN Euro-Wert** (keine Range, kein „Richtpreis"-Feld). Kunde bekommt E-Mail „Geschätzte Arbeitszeit: X Std. · ca. Y €" + „Termin aussuchen" | existiert | `apps/studio/src/components/chats/composer.tsx`, `packages/shared/src/communication.ts`, `packages/emails/src/artist-reply.tsx` |
| Anzahlung: **fester Euro-Betrag pro Artist** (TODA Pay/Stripe), pro Angebot abwählbar; kein Prozentsatz | existiert (partial) | `packages/db/migrations/0007_toda_pay.sql`, `zahlungen/deposit-form.tsx` |
| Stundensatz / Mindestpreis / Preisliste in der App: **NEIN** | existiert nicht | repo-weiter Grep leer |
| Quick-Action-Vorlagen: bis zu 3 (Slot 1 gratis, 2–3 Add-on), Variablen nur `{{vorname}}` / `{{nachname}}`; Inhalt frei → eine „Preisantwort"-Vorlage ist möglich, füllt nur das Textfeld | existiert | `mein-toda/templates-form.tsx`, `TEMPLATE_VARIABLES` |

**Konsequenz für den Text:** „Auto-Antwort mit Link" ist die Handlung des Artists in Instagram/
WhatsApp (so in `toda-context.md`), kein App-Feature — so formulieren. Kein „Richtpreis", keine
„Preisspanne", kein „Größe abfragen" im TODA-Absatz. Erlaubt: „Das Widget holt Körperstelle, zwei
Fotos mit eingezeichneter Platzierung, Farbe oder Schwarz-Grau, Beschreibung und Referenzen ab;
deine Antwort geht als Angebot mit geschätzter Arbeitszeit und ca.-Preis raus, Buchungslink inklusive;
die Vorlage aus diesem Artikel passt in eine Quick-Action-Vorlage." Die Artikel-Vorlagen selbst
dürfen Größe in cm abfragen (das ist der Artist-Chat, nicht das Widget).

## Schritt 6 — Draft-Insert + Snapshot + Wissensdokumente

1. Draft-JSON ins Scratchpad (`category_slug` → Entscheidung Tomek, `locale: de`, slug, title,
   excerpt 1–2 Sätze, content_md, tags, seo_title, seo_description). Kein Cover-Feld (Cover-Upload
   macht Tomek/Admin; Cover-Datei liefert Schritt 8).
2. Pre-Action-Report (Ziel prod `znocynswpsfckyfumema`, Kategorie, Slug, Wortzahl) → im Auto Mode
   ausführen: `pnpm blog:draft-insert <draft.json>` → `post_id`, `id`, `slug`, `content_length`.
3. Read-back per MCP: `select post_id, slug, status, length(content_md) from blog_post_translations
   where slug = '<slug>'`.
4. Snapshot `docs/blog/originals/<slug>.md` (Kopf: Insert-Datum + post_id, dann exaktes content_md).
5. `voice-learnings.md`: Log-Zeile für den neuen Draft + Ergebnis Lauf 0 (Vollzeit).
6. `sources.md`: PAngV-Eintrag (+ ggf. BMWK/IHK) mit Zugriffsweg/Datum.
7. `topic-radar.md`: Eintrag „2026-09-10 — Preisfrage-DM (Strom A pricing + C1)": Belege, Scores,
   Dedup, SEO-Validierung, Formatwahl, Kosten; Strom-C-Tabelle C1 → „in Arbeit — Draft `<slug>`".
8. `/commit` (Docs + Snapshot; kein Push).

## Schritt 7 — Karussell (Instagram, aus dem Artikel)

**System (aus dem Desktop-Bestand + Marketing-Repo, gelesen 10.09.2026 — bindend):**
- Pflichtlektüre vor dem Bauen: `/Users/harvestflow/Developer/toda/marketing/channels/instagram.md`
  (Safe-Area + Bauregel), `brand/todd.md`, `brand/colors.md`, `language/writing-rules.md`.
- **Templates:** Struktur/Prozess = `~/Desktop/toda/TODA-Karussell-Story-CATO/` (`slides.md`,
  `render-quelle.html`, `build-vorschau.py` — einziges Karussell, das aus einem publizierten
  Artikel gebaut wurde: Hook + Backup-Hook + Beats + Save-Magnet + CTA-Klammer, Logo statt Avatar-
  Signatur, Link im 1. Kommentar). **Bühne = Typo-Stage** (kein Artist-Foto) aus
  `~/Desktop/toda/TODA-Karussell-Was-kann-TODA/render-quelle.html` (`.qbig` 132 px, `.big` gold,
  `.todd.cover` klein rechts unten Slide 1, `.todd.reveal` Slide 7). Social-Paket-Vorlage:
  `~/Desktop/toda/toda-post-vom-dachdecker/posting-paket.md`. Hinweis: „Zweitverwertung regulärer
  Artikel" ist laut `TODA-Postformate-Workflow.html` ein offener Format-Gap → das ist der Erstlauf;
  im Report ausweisen.
- **Canvas:** 1080 × 1350 px, 7 Slides, Bühne `#000`, **Inter** (Google Fonts, Render braucht Netz).
  Safe-Area: untere 330 px Sperrzone, 330–380 nur Hintergrund, oben rechts 150 × 130 px frei,
  Textband y 130–1020, Seitenrand 86 px. Logo `TODA-LOGO.svg` (Kopie in CATO-Ordner; Original
  `TODA-Website/public/`) `top:64px; left:110px; height:40px`. „SWIPE ›"-Cue 36 px gold unten rechts
  (`right:86px; bottom:351px`).
- **Farben:** Gold `#C8941A` auf **genau einem Wort oder einer Zahl je Slide**, nie als Fläche;
  Text `#cfccc5`, gedämpft `#8f8c85`, Karte `#1c1c1c`, Linie `#2f2f2f`, Weiß, Lavendel `#BBA6E8` nur
  als Prop-Akzent.
- **Todd:** Akzent, nie Fläche; Posen ausschließlich aus
  `/Users/harvestflow/Developer/toda/marketing/brand/todd/motive/` (kein Ad-hoc-Todd); Inkongruenz
  von Slide 1 löst sich auf Slide 7 **visuell** auf, nie erklärt; kein Blush; nie als KI dargestellt.
- **Sprache:** Wir-Du, **kein Imperativ (auch im CTA nicht)**, keine Ausrufezeichen, keine Superlative,
  „Tattoo Artist" absolut; ≤ 25 Wörter Support-Text je Slide, eine Idee je Slide; Zitat-Anführungen
  als HTML-Entities (`&bdquo; &ldquo;`).
- **Caption:** 150–300 Zeichen, teasert den Swipe, fasst nicht zusammen, **kein Link**, kein Imperativ,
  ≤ 3 Emojis (erstes am Ende der Hook-Zeile, 🖤 Haus-Emoji); danach eigener Block mit **genau fünf**
  fokussierten Hashtags (aus `channels/instagram.md`, nie aus dem Puls). Artikel-URL im
  **1. Kommentar** (`Link in den Kommentaren`, nicht „Link in der Bio").
- **Claims:** keine Zahlen außerhalb der Artikelfakten; keine Mitbewerber; „19 %"-Slide nur, wenn der
  Fakten-Audit die PAngV/UStG-Zeilen bestätigt hat.

**Slide-Plan (Richtwert; Ausrichtung: Artists):**
| # | Rolle | Inhalt | Gold-Wort |
|---|---|---|---|
| 1 | Hook | Kicker „23:40 · Insta-DM", eingehende Chat-Bubble „Hey, was kostet ein Tattoo bei dir?", Todd klein rechts unten mit Handy (`profil-handy`-Pose) | „kostet" |
| 2 | Beat | „Der Kunde denkt in Euro. Du rechnest in Stunden." — die Einheiten-Lücke | „Stunden" |
| 3 | Save-Magnet | Liste „Fünf Angaben, dann ein Preis": Motiv · Größe in cm · Stelle · Farbe oder Schwarz-Grau · Referenz | „Fünf" |
| 4 | Substanz | „Dein Preis an Privatkunden ist immer der Gesamtpreis." + `.big` „19 %" (nur nach Audit) | „19 %" |
| 5 | Vorlage | Ausgehende Chat-Bubble = gekürzte Erstantwort-Vorlage (≤ 25 W) | „Vorlage" |
| 6 | Beat | „Der Preis gehört ins Angebot, nicht in den Chat." (Brücke zu Rabatte/Anzahlung) | „Angebot" |
| 7 | Klammer/CTA | „Drei Vorlagen zum Kopieren stehen im Artikel. Link in den Kommentaren." + Todd-Reveal (entspannte Pose, z. B. Liegestuhl aus `Was-kann-TODA/todd-liegestuhl.png` → Auflösung von Slide 1) | „Artikel" |

**Pipeline:** Zielordner `~/Desktop/toda/TODA-Karussell-Preisfrage/` → `slides.md` (Kopf: Format ·
Ausrichtung · Status · Verweise; Caption; Hashtag-Block; „## Die Slides" mit Layout-Notiz + Text;
„## Posting-Paket": 1. Kommentar mit Artikel-URL + UTM, Story-Hinweis, Timing Di–Do vormittags,
Messung nach 72 h) → `render-quelle.html` (7 `.slide`-Divs à 1080×1350, aus den Templates
zusammengesetzt) → Render:
```
cd ~/Desktop/toda/TODA-Karussell-Preisfrage
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=12000 \
  --window-size=1080,9450 --screenshot=full.png "file://$PWD/render-quelle.html"
magick full.png -crop 1080x1350 +repage slide-%d.png   # liefert slide-0…6 → auf slide-1…7 umbenennen
python3 build-vorschau.py                               # Kopie aus dem CATO-Ordner, Pfade anpassen → vorschau.html
```
Sichtcheck jeder PNG (Zeilenumbrüche, Sperrzone, Gold-Wort). Der Artikel-Link im Posting-Paket
zeigt auf die **künftige** URL `https://www.todasolutions.com/de/blog/<slug>` — Posten erst nach
Publish (Wahrheitspflicht).

## Schritt 8 — Cover (kie.ai, wie die letzten beiden Läufe)

`python3 ~/Developer/toda/toda-motion-graphics/scripts/kie-image.py gen --prompt-file <v>.txt
--aspect 16:9 --resolution 2K --out ~/Desktop/toda/blog-preisfrage-cover --name cover-<v>` — 3
Varianten (≈ 0,09 $ je Bild), Referenz-Stil aus `~/Desktop/toda/vyve-blog-cover/prompt.md`
(fast schwarz, Tungsten-Licht, Person rechts, linkes Drittel Headline, Weiß + Gold #D9A93A).
Headline-Vorschlag: Zeile 1 „WAS KOSTET" (weiß), Zeile 2 „EIN TATTOO?" (gold); Szene: Artist mit
Handy, Chat-Bubble „Hey, was kostet ein Tattoo bei dir?". Provenienz `*.gen.md` liegt bei.
Empfehlung im Report; Upload macht Tomek im Admin.

## Schritt 9 — Report + Distribution-Ausweis

Titel, Review-Link `https://www.todasolutions.com/admin/posts/<post_id>`, Format-Begründung,
**Fakten-Audit-Tabelle** (Behauptung | Quelle Tier+URL | wörtliche Belegpassage aus dem DeepAPI-
Scrape), vollständige Quellenliste, Sitz der TODA-Mention, Daten-Trail, 2–3 Social-Hook-Zeilen,
Earned-Media-Flag (feelfarbig: ja, Vorlagen-Stück), **Lead-Magnet-Flag: ja** (erste Vorlage im
Blog), Artikel-Story: `/artist-story` Lauf 6 erst NACH Publish aus der Live-URL (Wahrheitspflicht:
kein Mockup unpublizierter Artikel) → als Folge-Schritt für Tomek ausweisen. Karussell-Vorschau
+ Cover-Pfade. Kosten (DeepAPI/SerpApi/kie).

## Verification

- **Lauf 0:** Log-Zeile Vollzeit im `voice-learnings.md` trägt Datum + Delta-Ergebnis; DB-Status
  stimmt mit Log überein.
- **Fakten:** jede Zahl/§ im Artikel hat eine Zeile in der Audit-Tabelle mit wörtlicher
  Belegpassage aus einem Scrape DIESES Laufs (Datei im Scratchpad); PAngV-Text lokal gespeichert.
- **Draft:** Read-back-SELECT (post_id, status `draft`, `published_at` NULL, `length(content_md)`),
  Wortzahl 550–700 per `wc -w` auf dem content_md; Slug unique; genau 1 TODA-Mention (grep
  `TODA` = 1 Treffer außer ggf. „TODA Pay" im selben Absatz); interne Links per SELECT published;
  externe Links per `curl -sI` 200.
- **Admin-Preview:** Draft im `/admin`-Editor öffnen (Browser via cmux, Screenshot) — Markdown
  rendert, Blockquotes sichtbar, Links korrekt.
- **Karussell:** PNGs gerendert, `vorschau.html` Sichtcheck (Screenshot), Textlängen je Slide innerhalb
  des Templates, keine Zahlen/Claims außerhalb der Artikelfakten, Todd-Regeln eingehalten.
- **Cover:** 3 PNGs + `.gen.md` vorhanden, Headline korrekt geschrieben (Sichtcheck).
- **Docs:** `sources.md`, `topic-radar.md`, `voice-learnings.md`, `originals/<slug>.md` geändert;
  `git status` zeigt genau diese + Plan-Kopie; `/commit` ausgeführt.

## Entscheidungen (Tomek, 10.09.2026 — bindend)

1. Kategorie: **`studio-management`** (kein Rubrik-Tag `Recht-und-Kohle`; Tags: Preisgestaltung,
   Kundenkommunikation, Vorlagen).
2. Titel: **A** — „Was kostet ein Tattoo bei dir?" – die DM, die dich mehr kostet als den Kunden.
3. Karussell: **Typo-Stage + Chat-Bubbles + Todd** (Slide 1 Handy-Pose, Slide 7 Auflösung).
4. Cover: 3 kie.ai-Varianten im Lauf erzeugen (Default, ≈ 0,27 $) — Upload bleibt bei Tomek.
