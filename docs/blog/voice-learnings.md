# Voice-Learnings — gelernte Stil-Regeln aus Tomeks Korrekturen

Zweck: Dieses Dokument macht den Skill mit jedem veröffentlichten
Artikel besser. `toda-context.md` ist die **deklarierte** Brand Voice
(wer wir sein wollen); dieses Dokument ist die **gemessene** Voice —
abgeleitet aus dem Delta zwischen Claudes Originalfassung und Tomeks
korrigierter, veröffentlichter Fassung.

## Wie der Lern-Lauf funktioniert (Mechanik)

1. **Originale:** Bei jedem Draft-Insert wird die Claude-Fassung als
   Snapshot in `docs/blog/originals/<slug>.md` abgelegt (Pflichtschritt
   im Skill — der Admin-Editor überschreibt die DB-Fassung beim
   Korrigieren, ohne Snapshot ist das Delta verloren).
2. **Vergleich:** Sobald ein Artikel `status = 'published'` hat, wird
   die veröffentlichte Fassung aus der DB gegen den Snapshot gelesen —
   kein Byte-Diff, sondern semantischer Vergleich: Was hat Tomek
   umformuliert, gestrichen, ergänzt, umgestellt?
3. **Destillat:** Wiederkehrende Muster (≥2 Artikel oder eindeutige
   Einzelkorrektur) werden unten als Regel festgehalten — konkret,
   mit Beispiel Original → Korrektur.
4. **Eskalation:** Stilregeln landen hier. Strukturelle Erkenntnisse
   (Prozess, Quellen, Themenwahl) wandern in `SKILL.md` /
   `sources.md` / `toda-context.md`. Widerspricht eine Korrektur einer
   bestehenden Regel, wird die Regel aktualisiert — nicht ignoriert.
5. **Abgearbeitete Artikel** werden unten im Log vermerkt, damit kein
   Artikel doppelt ausgewertet wird.

**Stil-Referenz beim Schreiben:** Vor jedem neuen Artikel zusätzlich
die 1–2 zuletzt *veröffentlichten* Artikel aus der DB lesen (nur
solche, die durch Tomeks Korrektur gegangen sind — erkennbar daran,
dass ein Original-Snapshot existiert). Sie sind das beste Few-Shot-
Beispiel für Grammatik und Tonalität. Die früheren Seed-Posts zählen
NICHT als Stil-Referenz (Platzhalter, inzwischen gelöscht).

## Gelernte Regeln

*Erste Auswertung 16.06.2026 — abgeleitet aus Tomeks Korrektur der zwei
ersten veröffentlichten Artikel (`screenshot-roulette-…` und
`…laecheln-im-tattoo-studio…`). Beide DE-Originale (994 / 958 Wörter)
wurden von Tomek auf 607 / 636 Wörter gekürzt (−39 % / −34 %) und stark
umgebaut. Die EN/ES-Übersetzungen wurden **unverändert** veröffentlicht —
Korrektursignal liegt also komplett in den DE-Fassungen.*

### R1 — Titel: emotionaler Zitat-/Metapher-Hook + Kosten-Konsequenz (stärkstes Signal)
Tomek ersetzt nüchterne Themen-Titel durch eine **gesprochene Kund:innen-
Aussage in „…" oder eine bildhafte Metapher**, gefolgt von einer
„Wenn …"-Konsequenz mit konkretem Geldbetrag/Schmerz. Der `seo_title`
bleibt davon getrennt keyword-optimiert.
- *Original:* „Erwartungsmanagement Tattoo Kunden" (Themenlabel)
  → *Korrektur:* **„Eigentlich bin ich nicht ganz happy …" – Wenn das Lächeln im Studio teuer bezahlt werden muss**
- *Original:* „Copycat-Urteil / Urheberrecht bei Tattoo-Vorlagen"
  → *Korrektur:* **Screenshot-Roulette: Wenn das „Genau so" plötzlich 1.500 Euro kostet**
- → Beim Schreiben **zwei** Titel liefern: den narrativen `title` (Hook +
  „Wenn …"-Stakes, gern ein echtes Zitat) und separat den nüchternen
  keyword-`seo_title`.

### R2 — Straff schreiben: Zielmarke 550–700 Wörter (Struktur → SKILL.md)
Die ersten beiden Artikel wurden um ~35–40 % auf **~600–650 Wörter** gekürzt
(unter der alten SKILL.md-Vorgabe „900–1500"; eskaliert). **Relativiert
08.09.2026:** die drei Artikel vom 04.09. wurden mit −7 % / ±0 / −6 %
publiziert (562 / 697 / 537 W) — Kürzung ist nicht mehr das Hauptsignal,
sobald der Draft schon straff ist. Zielkorridor **550–700 Wörter**, lieber
650 dichte Wörter als 1000 mit Hedging.

### R3 — Sektions-Überschriften: Label + Witz/Klammer-Aside + Metapher
Nüchterne Überschriften werden zu griffigen Labels mit Klammer-Aside,
Spoiler-Witz, Frageform oder „-Falle"-Rahmung.
- „Was passiert ist" → **„Was ist passiert? (Spoiler: Es wurde teuer)"**
- „Tattoo-Vorlagen sind geschützt. Punkt." → **„Jura-Quickie: Warum „Nachstechen" kein Kompliment ist"**
- „Deine Schutz-Routine" → **„Deine „Anti-Abmahn-Routine" (Dauert 5 Minuten)"**
- „Der Fünf-Punkte-Prozess, der dich schützt" → **„Dein Fahrplan für ein entspanntes Arbeiten"** (warm statt „Prozess")
- „Warum dich das mehr angeht, als dir lieb ist" → **„Der ernste Teil: Warum „gut gemeint" rechtlich nicht reicht"** (Funktion signposten)

### R4 — Auf EINEN zentralen Fall/Fakt fokussieren; Neben-Jura raus
Tomek streicht sekundäre Rechts-Stränge und Detail-Tabellen ersatzlos.
- Gestrichen: ganze Sektion „Wann dein Kunde plötzlich Miturheber ist" (LG Köln 14 O 5/23) und „Wenn es trotzdem knallt" (Kulanz/Anspruch).
- Gestrichen: die Schadens-**Tabelle** (175 €/h × 5 Std., § 13 UrhG, 185,10 € Abmahnkosten) → ersetzt durch eine Prosa-Zeile + Merkformel **„Kein Credit = doppelter Schaden."**
- → Eine Leitentscheidung, eine Kernzahl. Keine zweite Aktenzeichen-Zitierung, keine Cent-genauen Kostenaufstellungen.

### R5 — Listen: Spiegelstriche mit kurzem fettem Label, ~4 Punkte
Lange nummerierte Prozesse (5–6 Punkte, je 2–3 Sätze) werden zu
Spiegelstrich-Listen mit knappem **Label:**-Einstieg, gedeckelt bei ~4.
Label = Substantiv **oder** Imperativ — nie ein Meta-Abstraktum (08.09.2026).
- „1. **Briefing schriftlich, immer.** …" → „- **Alles schriftlich:** …"
- „Sag laut, dass Nein nichts kostet" → „- **Mut zur Lücke:** …"
- „**Die Klammer:** Beides ist …" → „**Stark bleiben:** Wenn Rabatt, dann …" (Rabatte-Artikel)
- 6-Punkte-Schutzroutine → 4 Spiegelstriche.

### R6 — Emphase: ALL-CAPS-Einzelwörter + gefettete Ein-Zeilen-Formeln
Tomek hebt mit GROSSBUCHSTABEN (nicht nur Fett/Kursiv) hervor und fettet die
quotierbarste Zeile je Abschnitt — gern als Gleichung.
- „dein Risiko. Immer." → „dein Risiko. **IMMER.**"; „Fast immer" → „fast **IMMER**"
- gefettete Formeln: **„Kein Credit = doppelter Schaden."**, **„Dieses eine Nicken hat einen Kollegen 1.500 Euro gekostet …"**
- Einzelne Colloquialismen gefettet: „bleibt ein **Klacks**".

### R7 — Lede mit Sinnlichkeit, Suspense & Insider-Vergleich; Punchline fetten
Der erste Absatz wird dramatisiert: Spannungsaufbau, relatable Geld-Aside,
bildhafter Brancheninsider-Vergleich.
- ergänzt: „… und sagt den Satz, bei dem eigentlich alle Alarmglocken schrillen sollten"
- ergänzt: „die Miete zahlt sich nicht von selbst"
- ergänzt: **gefettete** Konsequenz + „Autsch. Das ist fast so schmerzhaft wie ein Blackout-Piece auf dem Kehlkopf, nur ohne das coole Ergebnis."
- Auch eingeschoben: earthy Asides wie „Ja ich weiß, PAPIERKRAM — … kann dir echt den Arsch retten." Register: eine Stufe lockerer/derber als Claudes Default.
- **Präzisiert 09.09.2026 (Anzahlung/Widerruf):** Tomeks Asides sind **Einzelstücke,
  keine Vorlage.** Die nachgebaute Variante seiner Juni-Zeile („Autsch. Das tut mehr
  weh als eine Rippen-Session, nur ohne das schöne Ergebnis.") war die **einzige
  Streichung** des Artikels. Sinnlichkeit und Suspense im Lede bleiben (der Freitag-
  22:10-Einstieg und die DM-Szene wurden unverändert publiziert); ein wiedererkennbar
  recyceltes Witz-Schema („Autsch. … nur ohne das … Ergebnis") fliegt. Neue Bilder
  oder gar keins — nie ein Tomek-Zitat aus einem früheren Artikel umlackieren.

### R8 — TODA: genau EINE Erwähnung, selbst-ironisch/zwinkernd
Tomek konsolidiert auf **eine** Stelle und rahmt sie augenzwinkernd.
- zwei Erwähnungen (AGB-PDF + Widget) → eine: „Kurze Schleichwerbung: Deine AGB schickt TODA immer automatisch für dich mit … 🤓"
- **Wortwahl korrigiert (Tomek, 2026-08-29): „Kurze Eigenwerbung", nicht
  „Schleichwerbung".** Die Formel bleibt, das Wort geht — „Schleichwerbung" ist der
  deutsche Rechtsbegriff für *unzulässige* Werbung (Kennzeichnungspflicht), und ihn
  über die eigene Produkterwähnung auf einer gewerblichen Seite zu schreiben, ist
  unnötig angreifbar. Der Zwinker trägt genauso. Erstanwendung: Rabatte-Artikel.
- explizit „TODA-Anfrage-Widget" → softer „(wie das von uns entwickelte Widget)"
- **Präzisiert 08.09.2026 (drei Artikel):** 0 / 1 / 1 Mentions publiziert. Die
  Mention bekommt einen **eigenen Absatz** („**Kurzer Hint: TODA hat dabei
  geholfen 🤓**" + drei Sätze Produktfluss), der Name steht vorn statt als
  Coy-Reveal („Heißt zufällig TODA" raus). Nur mit echtem Feature (R11) —
  sonst fliegt die Zeile ersatzlos.
- → Im Zweifel **höchstens eine** Erwähnung, lieber zu dezent als zu werblich. (TODA-Mention-Dichte → auch SKILL.md-relevant.)

### R9 — Emojis: sparsam (0–2), nur an Aufheller-/Zwinker-Beats
Screenshot-Artikel: **✅** (positive Wendung „anders rum gilt das genauso ✅")
+ **🤓** (Schleichwerbung) = 2. Studio-Lächeln-Artikel (ernster/earnest Ton):
**0** Emojis. → Emoji nur, wo der Beat wirklich positiv/zwinkernd ist; nie auf
ernsten Rechts-/Schmerz-Passagen sprenkeln.

### R10 — Signatur-Schluss „… was wirklich zählt: Deine Kunst."
Beide Artikel enden (von Tomek beibehalten) auf die Wendung „So bleibt mehr
Zeit für das, was wirklich zählt: **Deine Kunst.**" → als wiederkehrende
Schluss-Signatur einsetzen. Bestätigt 08.09.2026 (3/3), immer mit großem
„**Deine**". Tomek schreibt „Du/Dein" in Überschriften groß („Deine Kunst,
Dein Preis"), im Fließtext klein.

*Zweite Auswertung 08.09.2026 — drei Artikel vom 04.09. (Nachsorge, Rabatte/
Toddcast #2, Burnout/Toddcast #1). R1, R3, R4, R6, R7, R9, R10 bestätigt;
R2, R5, R8 präzisiert; drei neue Regeln:*

### R11 — TODA nur entlang des echten Produktflusses; keine erfundenen Features
Anfrage-Formular (Körperstelle, Größe, Referenzen) → Angebot aus der App →
Termin aus dem Kalender. Ein Feature, das so nicht existiert, wird gestrichen,
nicht umformuliert — das stärkste Negativ-Signal dieser Auswertung.
- *Original:* „Genau dafür gibt's bei TODA Vorlagen und automatische
  Erinnerungen … 🤓" (Nachsorge) → *Korrektur:* **Zeile ersatzlos raus**, 0 Mentions.
- *Original:* „Stil, Größe, Körperstelle und Budget … Heißt zufällig TODA."
  → *Korrektur:* „Kurzer Hint: TODA hat dabei geholfen 🤓" + Anfrage → Angebot →
  Buchung in drei Sätzen, eigener Absatz.
- → Vor jeder Mention den Baustein in `toda-context.md` gegenlesen; nur
  beschreiben, was dort steht.

### R12 — Klartext schlägt Cleverness: Branchenwort statt Metapher/Wortspiel
Tomek ersetzt bildhafte Nomen und Wortspiele durch das schlichte Wort.
Colloquialismen (R7: „Fuffi", „fertig macht") bleiben — Literarisches geht.
- „Die besten Heiler" → „Die besten Tattoo Artists"; „Publikumsproblem" →
  „Kundenproblem"; „den niemand auf der Rechnung hat" → „den niemand
  erwartet"; „Die Heilung stichst nicht du" → „Die Heilung kannst du nicht
  mit tätowieren"; „derweil" → gestrichen.
- Claude-eigene Klammer-Asides fliegen („(ja, auch Powernaps — …)"); die
  Eskalation wird realistisch („gleich hundert runter" → „fünfzig aus Angst runter").
- **Kein Gender-Doppelpunkt:** „Kund:innen" → „Kunden"; „Leute/Kundschaft" →
  „Kunden/Community".

### R13 — Podcast-Meta-Erzählung raus, Aussage direkt setzen (`/podcast-article`)
Keine Erzähler-Brücken über die Folge; Zitat oder These direkt. Der Podcast
heißt einmal „Toddcast" als Link auf den YouTube-Kanal, nie „erste Folge".
- „Danach rechnet er die Spirale vor, und sie läuft immer gleich." → „Es läuft
  bei jedem gleich:"
- „Ein Detail aus dem Gespräch, das leicht untergeht:" → eigene H2 „Deine
  Kunst, Dein Preis" mit direkter These; Zitat-H2 + erstes H3 im Bestand.
- „im Toddcast" → „im [Toddcast](https://www.youtube.com/@TODATattooSolutions)";
  „In unserer ersten Toddcast-Folge" → „In unserem Podcast".

*Dritte Auswertung 09.09.2026 — ein Artikel (Anzahlung/Widerruf, erster Draft nach
R11–R13). Genau EIN Edit: 25 Wörter Nachklapp im Lede raus (558→533 W); Titel, Slug,
Excerpt, Tags, SEO-Felder, alle fünf H2, alle 10 Links, TODA-Absatz, Emoji und
Schluss-Signatur unverändert. R1, R2, R3, R5, R6, R8, R9, R10, R11, R12 bestätigt —
erstmals ein Zitat-Titel und ein TODA-Absatz ohne jede Korrektur; R7 präzisiert;
eine neue Regel:*

### R14 — Lede endet auf der gefetteten Punchline; die Stakes stehen einmal
Nach dem gefetteten Kernsatz kommt **kein Nachklapp** — keine Worst-Case-Steigerung,
kein „Autsch", kein Schmerz-Vergleich. Der Titel trägt die Stakes („… ein Jahr später
zurückwandert"), der Fach-Abschnitt trägt die Zahl (**„Keine Belehrung = ein Jahr
Rückgaberecht"**); der Lede darf sie nicht ein drittes Mal ansagen.
- *Original:* „**Blöd nur: Wenn der Termin komplett im Chat entstanden ist, hat der
  Kunde ziemlich sicher recht.** Und im schlimmsten Fall kommt er damit noch ein Jahr
  später an. Autsch. Das tut mehr weh als eine Rippen-Session, nur ohne das schöne
  Ergebnis." → *Korrektur:* Absatz endet nach „… **ziemlich sicher recht.**"
- → Beim Schreiben den Lede-Absatz nach dem Fettsatz beenden; jede Zahl/Konsequenz,
  die schon im Titel oder in einer Formel (R6) steht, im Lede nicht wiederholen.
  Einzelkorrektur, aber eindeutig (einzige Änderung des Artikels; deckt sich mit R4
  „eine Kernzahl" und R12 „Claude-eigene Asides fliegen").

## Sonstige Feedback-Signale

- **16.06.2026 — DE-Disclaimer entfernt, EN/ES behalten → GEKLÄRT
  08.09.2026: kein Disclaimer.** Beide veröffentlichten **DE**-Fassungen
  hatten den kursiven „keine Rechtsberatung"-Schluss verloren; Tomek hat am
  08.09.2026 bestätigt, dass das Absicht ist. Regel 4 in `toda-context.md`
  und SKILL.md 2.2 entsprechend geändert; die Korrektheit trägt seitdem der
  Fakten-Audit im Report.
- **16.06.2026 — „Rubrik"-Tag:** Screenshot-Artikel bekam einen 4.,
  kebab-case Serien-/Rubrik-Tag: `Recht-und-Kohle` (DE) / `law-and-money`
  (EN) / `derecho-y-dinero` (ES). Sieht nach einer Kolumnen-Rubrik aus →
  künftig bei Rechts-/Geld-Themen einen solchen Rubrik-Tag mitliefern.
  (Der ursprüngliche Tippfehler `Rech-und-Kohle` ist in der DB korrigiert,
  geprüft 08.09.2026.)
- **06.09.2026 — Artist-Stimme = GESPROCHENE Stimme (`/artist-story` Lauf 2,
  Rita „CATO“):** Fassung 1 war sauber belegt, aber in „unserer" Schreibstimme
  (Ø 13,3 W/Satz, Nebensatzketten) und begann mit einer Kindheits-Anekdote
  (Heft). Tomeks Korrektur: die Stimme des Artists ist die aus seinen
  Videos — bei ihr warm, kurz, selbstironisch, fehlerbehaftet — und die
  starke Geschichte (Krieg → Neuanfang) gehört nach vorn, nicht in eine
  „lange Zeit gar nichts"-Sektion. Fassung 2: Ø 9,5 W/Satz, Fragen, die sie
  sich selbst beantwortet, drei nahezu wörtliche Reel-Zeilen (inkl. ihr
  eigener Witz „Ja, manchmal sind wir alle so dumm."), das Wort „scheiße"
  aus ihrem O-Ton als Überschrift. Muster: **O-Ton-Zeilen unverändert
  einbauen schlägt jede Umformulierung; Reels/Voice-Memos vor dem Schreiben
  transkribieren, Satzlänge am Sprechrhythmus messen; das Ereignis mit den
  höchsten Stakes trägt den Lede.** Die Artistin hat Fassung 2 ohne
  Änderungswunsch freigegeben.
- **08.09.2026 — Artist-Story, Lauf 0 über beide publizierten Stories:** Vossi
  (29.08.) wurde byte-identisch publiziert (5030→5065 Zeichen = nur CRLF des
  Admin-Editors — bei Zeichen-Deltas künftig erst Zeilenenden normalisieren).
  CATO (06.09.) hat exakt drei Edits, alle in Richtung „mehr Stakes, mehr
  O-Ton": (1) H2 „Vorher habe ich Musik gemacht" → „Musik, Krieg und endlich
  kam die Kunst" + Slug/SEO-Title `von-krieg-und-musik-…` — das Ereignis mit
  den höchsten Stakes gehört nicht nur in den Lede, sondern auch in die erste
  Zwischenüberschrift und die URL (H1 blieb bei ihrem Zitat); (2) Lede:
  Aussprache-Erklärung („gesprochen „Kato"") gestrichen, Artist-Name im ersten
  Satz direkt auf sein Profil verlinkt — Erklärungen für Leser, die der Artist
  selbst nie sagen würde, raus; (3) Reel-Zeile „entschuldige mich ganz
  herzlich" → „ganz viel" — bei Nicht-Muttersprachlern die eigene Wortwahl
  NICHT glätten; leicht schiefes Deutsch ist Voice, kein Fehler. Muster:
  **Überschriften/Slug tragen die Stakes, der Name trägt den Link, der O-Ton
  bleibt ungeglättet.** (Format-Label Artist-Story — keine R-Regel.)
- **08.09.2026 — Disclaimer-Differenzierung:** Der *medizinische* Hinweis im
  Nachsorge-Artikel blieb stehen, der *Rechts*-Disclaimer wurde in allen
  Rechtsartikeln gestrichen. „Kein Disclaimer" gilt für Rechtsthemen; bei
  Gesundheitsthemen bleibt der kurze Arzt-Hinweis.
- **29.08.2026 — Artist-Korrektur (`/artist-story` Lauf 1):** Einzige
  Korrektur von Markus Vossi an seiner Story: Der Text hatte „nach der
  Ausbildung sofort weg" verdichtet — real hat er noch ~1 Jahr als
  Dachdecker gearbeitet und dabei mehrfach den Betrieb gewechselt (erst
  das erklärt die Winter-Arbeitslosigkeit). Muster: **Zeitachsen aus dem
  O-Ton nicht dramaturgisch verdichten** — die unglatte Realität ist das
  Authentizitätssignal des Formats, nicht der Feind der Story.
- **Gelöschte Drafts sind kein Themen-Feedback (Tomek, 08.09.2026):**
  `dsgvo-tattoo-studio-kundendaten` (11.06.), `tattoo-anzahlung-no-shows-recht`
  und `reach-taetowierfarben-erklaert` (beide vor dem 08.09.) wurden gelöscht,
  weil sie mit einem veralteten Stand von Skill und Community-Puls entstanden
  waren — aus keinem anderen Grund. Die Themen bleiben offen (DSGVO, Anzahlung
  → C2, REACH) und dürfen mit dem neuen Setup neu angegangen werden. Muster:
  eine Löschung ohne genannten Grund wird nachgefragt, nie gedeutet (SKILL.md,
  Lauf 0, Punkt 6).

- **10.09.2026 — Partner-Kooperation (Vollzeit/VYVE):** Tomeks drei Edits betrafen
  ausschließlich den Partner: Name in der **Schreibweise des Partners** („VYVE",
  nicht „vyve"), und die Sortiments-Beschreibung durch die Formulierung ersetzt, die
  der Partner selbst verwendet („Equipment für jeden Stil" statt Claudes Deutung
  „sortiert nach dem Ablauf einer Session"). Muster: **Partnername und Partner-
  Produktbeschreibung kommen wörtlich aus dem Partner-Material, nie aus eigener
  Interpretation der Partner-Website.** Dritter Edit = R3 in Reinform: das flache
  Wortspiel „darf klingeln" wurde zum konkreten Bild „kommt nicht für Café & Kuchen".
  Nachweis, dass die Vollzeit-Sonderregel (R2-Ausnahme ~1.000 W) trug: 0 Kürzungen.

## Auswertungs-Log

**Stand 10.09.2026:** Vollzeit/VYVE (publiziert 09.09.) am 10.09. ausgewertet → R3 bestätigt,
Partner-Signal notiert, keine neue R-Regel. Drafts in der DB:
`tattoo-preisanfrage-beantworten-vorlage` (10.09., inzwischen publiziert) und
`zwischen-tattoo-nadel-knochen-und-algorithmus` (Artist-Story Joelle, 12.09., inzwischen publiziert, Diff offen).


| Artikel | Original-Snapshot | Ausgewertet am | Ergebnis |
|---|---|---|---|
| copycat-tattoo-urteil-urheberrecht (→ veröffentlicht als `screenshot-roulette-…`) | ✅ | 16.06.2026 | **ausgewertet** → R1–R10. DE 994→607 W (−39 %), retitelt, Tabelle + Miturheber-Sektion gestrichen, 1 TODA-Mention, ✅/🤓. |
| erwartungsmanagement-tattoo-kunden (→ veröffentlicht als `…laecheln-im-studio…`) | ✅ | 16.06.2026 | **ausgewertet** → R1–R10. DE 958→636 W (−34 %), retitelt, „Wenn es knallt"-Sektion gestrichen, TODA-Mention entschärft. |
| screenshot-roulette EN/ES + studio-lächeln EN/ES | ✅ | 16.06.2026 | **unverändert veröffentlicht** — kein Korrektursignal (Übersetzungen 1:1 übernommen). |
| tattoo-nachsorge-heilphase-kommunizieren | ✅ | 08.09.2026 | **ausgewertet** → R11, R12. Publiziert 04.09.2026, 603→562 W: TODA-Zeile (erfundenes Feature) ersatzlos raus, „Kund:innen" → „Kunden", Wortspiele → Klartext, medizinischer Hinweis behalten. |
| tattoo-anzahlung-no-shows-recht | ✅ | 08.09.2026 | **gelöscht** (veralteter Skill-/Puls-Stand, kein Themen-Feedback) — Snapshot bleibt, Thema offen (C2) |
| reach-taetowierfarben-erklaert | ✅ | 08.09.2026 | **gelöscht** (veralteter Stand, kein Themen-Feedback) — Snapshot bleibt, Thema offen |
| dsgvo-tattoo-studio-kundendaten | ✅ (rekonstruiert) | 08.09.2026 | **gelöscht** (veralteter Stand, kein Themen-Feedback) — Thema offen |
| taetowierer-burnout-kundenkommunikation (Toddcast #1 Recycling) | ✅ | 08.09.2026 | **ausgewertet** → R8, R11, R12, R13. Publiziert 18.06., Update 04.09.2026, 571→537 W: TODA-Absatz auf echten Produktfluss umgebaut („Kurzer Hint"), Metaphern/Asides gestrichen, „erste Toddcast-Folge" → „unser Podcast". |
| vom-dachdecker-zum-tattoo-artist (Artist-Story, Toddcast #1) | ✅ | 08.09.2026 | **ausgewertet — kein Korrektursignal:** byte-identisch publiziert (5030→5065 Zeichen = 35× CRLF des Admin-Editors). Erster `/artist-story`-Insert nach dokumentiertem Artist-Go (Markus Vossi); Artist-Korrektur eingearbeitet (s. Feedback-Signale). |
| from-roofer-to-tattoo-artist EN + de-techador-a-tatuador ES | ✅ | — | **29.08.2026 direkt published** (explizite Anweisung Tomek) — 1:1-Übersetzungen der freigegebenen DE-Fassung, Ton unverändert; ES-Terminologie „tatuador" analog Bestand. |
| tattoo-preise-rabatte-unter-wert-verkaufen (→ publiziert als `du-erziehst-dir-deine-kunden-wenn-der-rabatt-teurer-wird-als-die-absage`) | ✅ | 08.09.2026 | **ausgewertet** → R1 (Retitel), R5, R12, R13. Publiziert 04.09.2026, 687→697 W: Zitat-Titel nach R1, Podcast-Meta-Sätze → direkte Thesen, „Fuffi"/ENTWEDER, Zitat-H2 + erstes H3, Toddcast verlinkt, „Kurze Eigenwerbung" wörtlich behalten. |
| tattoo-anzahlung-widerrufsrecht-online-buchung (Fall & Recht, Anzahlung/Widerruf/§ 356a) | ✅ | 09.09.2026 | **ausgewertet** → R7 präzisiert, R14 neu; R1, R2, R3, R5, R6, R8–R12 bestätigt. Publiziert 08.09.2026 07:03 UTC (23 min nach Insert, zunächst unverändert), Lede-Edit 07:39 UTC. 558→533 W (−4,5 %): **genau ein Edit** — der Lede-Nachklapp nach dem Fettsatz („Und im schlimmsten Fall … ein Jahr später an. Autsch. … Rippen-Session, nur ohne das schöne Ergebnis.") ersatzlos raus. Titel/Slug/Excerpt/Tags/SEO-Felder, 5 H2, 10 Links (1 intern, 9 Quellen), TODA-Absatz („Kurzer Hint 🤓", AGB-PDF + TODA Pay), 1 Emoji, Schluss-Signatur und Rubrik-Tag `Recht-und-Kohle` unverändert (Rest byte-identisch bis auf CRLF). Erster Artikel, dessen Zitat-Titel (R1) und TODA-Absatz (R8/R11) ohne Korrektur durchgingen. Autor „Dein TODA Team" beim Publish gesetzt. |
| von-der-musik-zum-tattoo-artist (→ publiziert als `von-krieg-und-musik-zum-tattoo-artist`; Artist-Story, Rita „CATO“) | ✅ | 08.09.2026 | **ausgewertet** (Artist-Story-Signal, s. Feedback-Signale 08.09.2026). Publiziert 06.09.2026 20 min nach Insert, 793→793 W, genau drei Edits: Krieg in H2 + Slug/SEO-Title, Aussprache-Erklärung raus + Name verlinkt, O-Ton „herzlich" → „viel" ungeglättet. |
| vollzeit-taetowierer-werden-10-dinge (Ratgeber-Listicle, Kooperation VYVE) | ✅ | 10.09.2026 | **ausgewertet** → R3 bestätigt, Partner-Signal (s. Feedback-Signale 10.09.2026). Insert 09.09. 11:12 UTC, publiziert 12:19 UTC, 1.007→1.010 W: **genau drei Edits** — (1) Partnername „vyve" → „VYVE" (2×, Schreibweise des Partners), (2) Sortiments-Beschreibung „sortiert nach dem Ablauf einer Session" → „Equipment für jeden Stil", (3) H2 „Das Gesundheitsamt darf klingeln" → „Das Gesundheitsamt kommt nicht für Café & Kuchen". Lede, R14-Punchline, alle 10 Punkte, TODA-Absatz (inkl. „Stunden und Richtpreis"), 12 Links, Fazit + Signatur unverändert. Erster Artikel, dessen Lede ohne jede Kürzung durchging. |
| tattoo-preisanfrage-beantworten-vorlage (Vorlagen-Format, Preisfrage-DM; Strom A `pricing` + C1) | ✅ | — | **neuer Draft 10.09.2026** — post_id `c7751e6a-7d30-422d-a3d7-5256f79d8608`, Kategorie `studio-management` (Tomek). **Erster Artikel im Vorlagen-Format:** drei kopierbare DM-Antworten als Blockquotes (Erstantwort / Angebot / Budget-Antwort), TODA-Absatz als Feature-Brücke (Auto-Antwort = Handlung des Artists, Widget-Felder + „geschätzte Arbeitszeit und ca.-Preis" + Buchungslink + Schnellantworten — alles gegen `toda-v2` verifiziert, kein Größen-/Budgetfeld behauptet). 658 W, 1 Emoji, 0 Ausrufezeichen, 1 ALL-CAPS (IMMER), Zitat-Titel nach R1, Lede endet auf der Fett-Punchline (R14), 3 interne + 3 Quell-Links (PAngV §§ 2/3, UStG § 12). Wartet auf Review. |
| zwischen-tattoo-nadel-knochen-und-algorithmus (Artist-Story, Joelle „MaggotboneArt“; Einstieg B, ihr eigener Text) | ✅ | — | **neuer Draft 12.09.2026** — post_id `bd3a7d5e-cc2b-4e1a-8bc9-e728965298a1`, Kategorie `artist-stories`, Autor `joelle-maggotboneart` (Avatar = Reel-Standbild, winkend), Cover 1600×900 JPEG bereits gesetzt (Tomeks Anweisung 12.09.: Draft komplett vorbereiten, er liest und klickt Publizieren). 1.214 W, bewusst über dem Korridor: selbstgeschriebener Text, minimal-invasiv redigiert (1.240→1.214). **Publiziert 12.09.2026 08:09 UTC** (48 min nach Insert), 8.338→8.404 Zeichen — Diff gegen den Snapshot noch nicht ausgewertet (Lauf 0 der nächsten Session; erwartetes Signal: Joelles eigene Korrekturen an unserer Redaktion, Fakten-Checkliste in `~/Desktop/toda/TODA-blog/maggotboneart/freigabe.md`). Artikel-Story (Lauf 6) am 12.09. aus der Live-URL gebaut. |
