# Empfehlungsschreiben — `/blog-article` & `/podcast-article` am Marketing-Baukasten ausrichten

**Stand: 09.07.2026.** Analyse beider Content-Skills (`.claude/skills/blog-article`, `.claude/skills/podcast-article`) inklusive ihrer kompletten Wissensbasis (`docs/blog/`) gegen den Marketing-Baukasten (`../marketing/`, insbesondere die am 08.07. destillierten Definitionen `brand/positioning.md`, `strategy/claims.md`, `strategy/trust-distribution.md`, `strategy/content-inputs.md`). Ziel: Content, der unsere Positionierung genauer trifft und deutlich mehr Distribution und Outreach erzeugt — **ohne den Kern der Skills zu verlieren.**

Dieses Dokument ist eine Empfehlung, keine Änderung: Die Skills bleiben unangetastet, bis Tomek einzelne Punkte freigibt. Freigegebene Punkte werden dann über die skill-eigenen Eskalationswege eingearbeitet (Lauf 0: Struktur → SKILL.md / `toda-context.md` / `sources.md`), damit das selbstlernende System konsistent bleibt.

---

## Der Kern, der nicht verhandelbar ist

Diese Mechaniken sind die Stärke des Systems. **Keine** der folgenden Empfehlungen ändert sie; jede ist additiv an Themen-Auswahl, Schreib-Kontext oder Report:

- **Der Lern-Loop** (`originals/`-Snapshots → semantischer Diff gegen Tomeks veröffentlichte Fassung → R-Regeln). Er ist die einzige Maschine im Setup, die Tomeks tatsächlichen Geschmack misst statt ihn zu behaupten.
- **Die Quellen-Disziplin** (Tier 1/2 belegen Fakten, Tier 3 ist nur Stimmung, Verifikation im selben Lauf, Inline-Links auf öffentlich Lesbares).
- **Nie publizieren.** Draft + Review-Link, Tomek entscheidet im `/admin`.
- **90 % Mehrwert, genau eine TODA-Mention, zwinkernd** (R8) — der Blog ist Helfer, kein Werbeträger.
- **Outlier-Scoring statt Rohsummen** im Topic-Mining (schützt das Artist-Signal vor Consumer-Lärm).
- **Podcast: reframen statt transkribieren**, drei Validierungs-Gates, Lineup-/Showname-Regeln, Segment-Deeplink.

---

## Empfehlungen

### E1 — Strom C: SEO-Gap-Mining als dritter Themen-Strom *(größter Distribution-Hebel, reiner Doc-Edit)*

**Was:** Das Topic-Mining um einen dritten Strom erweitern: die kuratierte SEO-Gap-Liste aus der Wettbewerbsrecherche (10 Cluster, Stand 07/2026, `../marketing/research/2026-07-08-trust-distribution-playbook.html`).

**Warum:** Strom A (Reddit) misst US-lastiges Community-Signal, Strom B reagiert auf Rechts-News — beide messen, was *passiert*, nicht, was in DACH *unbesetzt gesucht* wird. Die Gap-Liste enthält leere deutsche SERPs direkt am Produkt-Wedge; Cluster 1 („Tattoo-Anfragen beantworten / Instagram-DM-Chaos organisieren") ist wortwörtlich unser Anfrage-Funnel-Frame und laut Recherche komplett unbesetzt. Auf unbesetzte Nachfrage ranken ist der direkteste Distribution-Hebel, den es gibt — kein Kampf um belegte Begriffe. (Baukasten: `strategy/content-inputs.md` → „SEO-Gap-Mining".)

**Wie:** In `topic-radar.md` unter „Methode" Strom C dokumentieren: statische, priorisierte Ziel-Liste (Cluster 1–3 zuerst: DM-Chaos, Anzahlung vs. Terminkaution, Tattoo-Software-Head-Term); pro Lauf höchstens ein C-Slot; Wochenmix z. B. 1×A + 1×C (+ B bei News) statt 2×A + 1×B. **Alle drei Gates (Dedup, Such-Validierung, Quellen-Check) gelten unverändert** — Strom C liefert Kandidaten, keine Freifahrt. Liste abgearbeitet → Strom C ruht bis zur nächsten Recherche.

### E2 — Positionierungs-Frames und ICP in den Schreib-Kontext *(macht die eine TODA-Mention präzise)*

**Was:** `toda-context.md` mit `../marketing/brand/positioning.md` synchronisieren — zwei Ergänzungen: (a) die **unbesetzten Frames** als bevorzugte Sprache der TODA-Mention („vom Instagram-DM-Chaos zum geführten Funnel auf eigener Subdomain"; „Deine Kunden installieren nichts, du verlierst keinen Thread"); (b) **ICP/Anti-ICP** als explizite Definition, für wen geschrieben wird — und für wen nicht.

**Warum:** Die eine erlaubte TODA-Mention ist die knappste Ressource jedes Artikels. Wird sie ad hoc formuliert, verschenkt sie die Chance, die laut Wettbewerbsanalyse weltweit unbesetzten Frames durch Wiederholung zu besetzen — Positionierung entsteht genau so. Der ICP schärft zudem die Themenwahl über das grobe „Solo Artists" hinaus: Seine Schmerzpunkte (No-Shows, unseriöse Anfragen, vergessene Anzahlungen, Termindopplungen, Kommunikations-Überforderung) sind eine fertige Themen-Checkliste; Anti-ICP-Cluster (Studio-Management, Walk-in, Hobby-Nische) fliegen im Mining früher raus.

**Wie:** Kurzer Abschnitt in `toda-context.md` („Positionierungs-Frames für die TODA-Mention" + „Für wen wir schreiben / für wen nicht"), mit dem Baukasten als Quelle der Wahrheit (verweisen, nicht duplizieren — sonst driften die Kopien). Im Aufnahme-Protokoll von `sources.md` die Zielgruppen-Fit-Frage (Frage 2) auf ICP/Anti-ICP präzisieren.

### E3 — Lead-Magnet-Prinzip: Vorlagen doppelt spielen *(baut den fehlenden Owned-Kanal)*

**Was:** Vorlagen-taugliche Artikel konsequent doppelt spielen: Download gegen E-Mail-Adresse **plus** Feature-Brücke „oder direkt digital in TODA". (Baukasten: `strategy/content-inputs.md` → „Lead-Magnet-Prinzip".)

**Warum:** Der Blog hat heute keinerlei Capture — jeder Leser ist nach dem Lesen weg, jede Wiederansprache hängt an Algorithmen. Eine E-Mail-Liste ist der fehlende Owned-Distribution-Kanal und laut `strategy/trust-distribution.md` die harte Voraussetzung für den einen Product-Hunt-Slot (40–60 % der Votes müssen aus eigener Audience kommen). Die Nachfrage nach Vorlagen ist belegt — Fachmedien bedienen sie bereits, haben aber kein Produkt dahinter.

**Wie:** Zwei Stufen. **Sofort (Skill):** Der Report weist aus, wenn ein Artikel Lead-Magnet-Potenzial hat — der wartende Nachsorge-Draft (`tattoo-nachsorge-heilphase-kommunizieren`) ist Kandidat Nr. 1 (Aftercare-PDF = Gap-Cluster 7); weitere: AGB-Baustein, Anzahlungs-/No-Show-Textvorlagen. **Mittelfristig (Infra, eigenes Projekt):** Download-Komponente + E-Mail-Capture im Blog; Versand-Infrastruktur (Resend) ist in Tomeks Tooling bereits angebunden.

### E4 — Recycling zu Ende denken: Beats im Report ausweisen *(eine Investition, mehrere Beats)*

**Was:** Jeder Lauf endet mit einem kurzen **Recycling-Ausweis** im Report: 2–3 Social-Rendering-Vorschläge (die R1-Hooks und gefetteten R6-Formeln sind bereits fertige Social-Zeilen), und beim Mining zusätzlich: welche Top-Cluster **Toddcast-Folgen-Kandidaten** wären.

**Warum:** `strategy/recycling-engine.md`: Eine Investition, die nur einen Beat füttert, ist für ein kleines Team zu teuer. `channels/inventory.md` definiert Blogartikel ausdrücklich als Hero-Asset-Quelle für Podcast und Social — aktuell existiert aber nur die Richtung Podcast→Artikel; Artikel→Social und Artikel→Podcast-Idee verpuffen. Dazu Beats orchestrieren: Podcast-Artikel-Publish zeitlich an den Folgen-Push legen (das Embed schiebt die Folge, die Folge schiebt den Artikel — kostet nur Timing-Disziplin).

**Wie:** Je ein Absatz in Schritt 2.4 (Report) beider SKILL.md. Bewusst **nur Ausweis** — die Renderings selbst bleiben außerhalb dieser Skills (kein Scope-Creep in den Schreibkern).

### E5 — Claims-Leitplanken in die Redaktionsregeln *(Rechtsschutz für die Fläche mit dem höchsten Output)*

**Was:** Ein kurzer Block in `toda-context.md`: „Wenn der Artikel über TODA selbst spricht, gilt `../marketing/strategy/claims.md`" — keine Spitzenstellungs-Claims („Nr. 1", „am schnellsten wachsend" — dauerhaft gesperrt), eigene Zahlen nur absolut + datiert + selbstbezogen, keine Werbung mit Selbstverständlichkeiten (DSGVO/SSL neutral belegen, nie als Werbevorteil), Rankings/Sterne nur mit benanntem Dritt-Ranking + Wortlaut + Datum.

**Warum:** Der Blog ist die Fläche mit dem höchsten Veröffentlichungsvolumen — ohne Leitplanke entsteht der erste abmahnbare Claim statistisch genau dort (§ 5 UWG: Beweislast bei uns, Abmahnung ab ~350 € plus Vertragsstrafen). Die Regeln existieren seit 08.07. zentral im Baukasten; die Skills kennen sie noch nicht.

**Wie:** Verweis-Block in `toda-context.md` (Redaktionsregeln), nicht duplizieren. Kostet drei Zeilen, schließt ein echtes Risiko.

### E6 — Vergleichs-Content im Respekt-Format *(neue Bottom-of-Funnel-Fläche — aber als eigenes Format)*

**Was:** Seit Tomeks Grundsatzentscheidung vom 08.07. sind „TODA vs X"-Inhalte erlaubt — ausschließlich im Respekt-Format: faire, faktenbasierte Tabellen mit ehrlichem „Für wen ist X die bessere Wahl?"-Abschnitt (`strategy/claims.md` → „Vergleiche mit Wettbewerbern", § 6 UWG).

**Warum:** US-Wettbewerber fahren Vergleichsseiten aggressiv, die deutschen SERPs sind frei — das ist Bottom-of-Funnel-Distribution, die der Blog heute gar nicht bedient.

**Empfehlung — und Schutz des Kerns:** Vergleichs-Content **nicht** in diese beiden Skills mischen. Der Blog lebt von der 90-%-Mehrwert-Regel; Vergleichsseiten sind per Definition Produkt-Content. Eigenes Format (statische Seiten oder eigene Kategorie), eigener Lauf, jede Seite einzeln durch Tomek freigegeben. Als separates `/ship`-Projekt oder eigener Mini-Skill.

### E7 — Earned-Media-Ausweis im Report *(branchen-native Kanäle schlagen Portale)*

**Was:** Der Report markiert Artikel mit Pitch-Potenzial für Fachmedien — Urteils-Explainer, Daten-Stücke, Branchen-Einordnungen, die feelfarbig oder Tattoo Spirit redaktionell aufgreifen könnten.

**Warum:** `strategy/trust-distribution.md`: Artists lesen kein G2 — Fachmedien tragen bei der Zielgruppe mehr Trust als jedes Portal-Badge; earned schlägt paid (`strategy/partnerships.md`). feelfarbig ist bereits Tier-2-Quelle der Library — die bestehende Zitier-Beziehung ist der natürliche Pitch-Anlass. Voraussetzung fürs Pitchen ist das Presse-Kit aus dem Website-Maßnahmenpaket des Reports.

**Wie:** Eine Zeile im Report-Format beider Skills. Das Pitchen selbst bleibt bei Tomek.

### Ausblick — Daten-Content, sobald Produktmetriken existieren

`strategy/claims.md` definiert die Metrik-Instrumentierung ab Tag 1 (No-Show-Rate mit Onboarding-Baseline als Outcome-Währung der Vertikale). Sobald diese Zahlen existieren, wird eigener Daten-Content („State of …"-Stücke, No-Show-Zahlen — absolut, datiert, selbstbezogen) der stärkste Earned-Media-Magnet im Arsenal. Kein Skill-Change heute; als künftiger Strom D vormerken.

---

## Zwei Konflikte, die nur Tomek entscheiden kann

Beide betreffen Widersprüche zwischen Baukasten und gelebter Blog-Praxis. Nicht eigenmächtig auflösen — nach Entscheidung via `/inbox` → `/destillieren` im Marketing-Repo festschreiben und hier über die Skill-Eskalation nachziehen.

**K1 — „Tattoo Artist" absolut vs. Suchbegriff „Tätowierer".** `language/terminology.md` setzt „Tattoo Artist(s)" absolut („Tätowierer" nie). Aber: Deutsche suchen „Tätowierer" — die Gap-Liste zielt auf diese Begriffe, und der Burnout-Draft nutzt den Slug `taetowierer-burnout-…` bereits. Vorschlag zur Entscheidung: Meta-Felder (`slug`, `seo_title`, `seo_description`) dürfen die Suchsprache tragen, Fließtext und Ansprache bleiben strikt „Tattoo Artist". Ohne diese Ausnahme verliert Strom C (E1) einen erheblichen Teil seiner Wirkung.

**K2 — Schreibregeln vs. gemessene Blog-Voice.** `language/writing-rules.md` gilt „auf jeder Fläche": keine Emojis, keine Ausrufezeichen, kein Imperativ. Die gemessene Blog-Voice (R7/R9) enthält aber 0–2 Emojis und ein derberes Register — **von Tomek selbst hineinkorrigiert**, der Lern-Loop misst ja genau seine Edits. Die Praxis ist also offenbar gewollt. Vorschlag zur Entscheidung: dokumentierte Blog-Ausnahme im Baukasten (der Blog spricht als Insider-Kolumne, eine Stufe lockerer) statt den Blog zu verbiegen — oder der Blog folgt künftig den Regeln, dann muss der Voice-Loop das als neues Korrektursignal lernen.

---

## Priorisierung

| Reihenfolge | Punkt | Aufwand | Wirkung |
|---|---|---|---|
| 1 | K1 + K2 entscheiden | Gespräch | entsperrt E1, klärt Voice-Grundlage |
| 2 | E1 Strom C | Doc-Edit (`topic-radar.md`) | größter SEO-/Distribution-Hebel |
| 3 | E2 + E5 Kontext-Sync | Doc-Edit (`toda-context.md`, `sources.md`) | präzisere Mention, Rechtsschutz |
| 4 | E4 + E7 Report-Ausweise | Doc-Edit (beide SKILL.md, 2.4) | Recycling + Outreach ohne neuen Workflow |
| 5 | E3 Lead-Magnets | Skill: sofort · Infra: eigenes Projekt | Owned-Kanal, Product-Hunt-Voraussetzung |
| 6 | E6 Vergleichs-Format | eigenes Projekt | neue Fläche, Kern bleibt sauber |

*Quellen dieser Analyse: beide SKILL.md, `docs/blog/toda-context.md` · `voice-learnings.md` · `sources.md` · `topic-radar.md` · `podcast-radar.md`, Marketing-Baukasten Stand 09.07.2026 (inkl. Destillat vom 08.07.: Positionierung, Claims, Trust-Distribution, Content-Inputs) sowie `research/2026-07-08-trust-distribution-playbook.html`.*
