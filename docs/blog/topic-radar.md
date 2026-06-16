# Topic-Radar — Mining-Protokoll

Zweck: Jede Themenwahl für Blogartikel ist hier dokumentiert und
nachprüfbar — welche Daten gescrapt wurden, wie gescort wurde, warum
ein Topic gewonnen hat. **Append-only:** pro Mining-Lauf ein datierter
Eintrag, alte Einträge werden nie umgeschrieben.

## Methode (Stand Juni 2026)

Zwei Ströme:

- **Strom A — Community-Schmerzpunkte:** Subreddits aus
  `sources.md` Tier 3 scrapen (Top-Posts, letzte 30 Tage, inkl.
  Upvotes + Kommentarzahl). Posts thematisch clustern.
- **Strom B — DACH-Radar:** Tier-1/2-Quellen auf Neuigkeiten prüfen
  (neue Urteile, Verordnungs-Updates). Liefert Themen, die auf Reddit
  nie auftauchen, weil die Communities US-lastig sind.

Scoring pro Themen-Cluster (Strom A):

```
Engagement(Post)   = Upvotes + 2 × Kommentarzahl
Baseline(Quelle)   = Median(Engagement) über alle klassifizierten Posts
                     derselben Quelle im selben Scrape
Outlier(Post)      = Engagement(Post) / Baseline(Quelle)
Score(Cluster)     = Σ Outlier(Post) aller zugehörigen Posts
Trend-Kriterium    : ≥ 3 unabhängige Posts im Cluster (Gate, kein Bonus)
Cross-Source-Bonus : Cluster taucht in ≥ 2 Quellen auf → bevorzugen
```

Kommentare zählen doppelt, weil sie Diskussion (= Schmerz) anzeigen,
Upvotes nur Zustimmung.

**Warum Outlier statt Rohsumme (Σ Engagement).** Die rohe Summe ist durch
die Quellengröße konfundiert: r/tattooadvice schüttet rund **40× mehr**
absolutes Engagement pro Post aus als r/TattooArtists (Median 3 278 vs. 84
im 11.06-Datensatz). Unter `Σ Engagement` gewinnen damit rein mechanisch
die Consumer-Cluster, und das Artist-Signal — **unsere B2B-Zielgruppe** —
wird begraben (im 11.06-Datensatz lag der stärkste Artist-Cluster nur auf
Rang 5, hinter vier Endkunden-Clustern). `Outlier` misst stattdessen die
**Überperformance gegenüber dem Normalpost der eigenen Quelle**: ein Post
mit 19× dem Median seines Subs ist ein stärkeres Themensignal als einer mit
3× — egal, welcher Sub absolut mehr Upvotes ausschüttet. So werden Cluster
über Quellen hinweg **vergleichbar** (was Σ Engagement nicht leistet).
Median statt Mittelwert, weil Engagement rechtsschief ist und der
Mittelwert von genau den Ausreißern hochgezogen würde, die wir messen
wollen. Die Cluster-Zuordnung bleibt der einzige manuelle Schritt — deshalb
wird die vollständige Zuordnungstabelle (Post → Cluster, inkl. Ausschlüsse)
im Lauf-Eintrag mitdokumentiert, damit sie überprüfbar bleibt.

Danach, vor der finalen Wahl:

1. **Dedup-Check:** Query gegen `blog_post_translations`
   (Titel/Tags/Slugs aller Drafts + veröffentlichten Posts) — schon
   behandelte Themen scheiden aus oder brauchen einen neuen Winkel.
2. **Such-Validierung:** Top-Kandidaten per Websuche prüfen — wird das
   Thema im DACH-Raum auch gesucht? (SEO-Signal, kein K.-o.-Kriterium.)
3. **Quellen-Check:** Gibt es Tier-1/2-Quellen, die das Thema tragen?
   Ein Community-Thema ohne seriöse Faktenbasis wird kein eigener
   Artikel — höchstens Stimmungselement in einem anderen.

---

<!-- Lauf-Einträge ab hier, neueste unten anhängen -->

## Lauf 2026-06-11

**Strom A — Scrape:** `trudax/reddit-scraper-lite`, Run `K3kRbgy7nP9b7un8A`
(Dataset `rjxz3bptzNgfzNTK9`). Input: r/TattooArtists + r/tattooadvice,
jeweils `top/?t=month`, `includeMediaLinks: true`, Residential-Proxy.
Ergebnis: **77 Posts** (56 TA / 21 ADV), 0 fehlgeschlagene Post-Requests.

**Klassifikation:** 42 von 77 Posts als Diskussions-Posts geclustert.
Ausgeschlossen: 31 reine Showcase-Posts (Regel: „done by me / by X at Y" /
IG-Handle ohne Frage) und 4 Unklare ohne auswertbaren Body („An artist
needing advice", „Zoom in on the flowers", „ferret tat", „3rd year").
Scores per Skript berechnet (`Engagement = Upvotes + 2×Kommentare`):

| Cluster | Posts | Score | Trend (≥3)? |
|---|---|---|---|
| K1 Erwartung vs. Ergebnis (Briefing/Abnahme) — ADV | 6 | 35 946 | ✅ |
| K3 Cover-up / Korrektur / Removal — ADV | 7 | 26 049 | ✅ |
| K2 Aftercare-/Healing-Verwirrung — ADV | 5 | 24 551 | ✅ |
| K4 Motiv-Bedeutung / kulturell — ADV | 2 | 12 840 | ❌ |
| C1 Kundenkonflikte & Kommunikationsgrenzen — TA | 5 | 2 285 | ✅ |
| C2 Urheberrecht / Design-Eigentum / Referenzen — TA | 3 | 1 580 | ✅ |
| C4 Technik / Equipment / Pricing — TA | 5 | 758 | ✅ |
| C5 Farben / Reaktionen — TA | 1 | 391 | ❌ (zudem durch REACH-Artikel abgedeckt) |
| C3 Business / Selbstständigkeit / Studio — TA | 5 | 328 | ✅ |
| C6/C7/C8 (Fehler, Scammer, Burnout) — TA | je 1 | < 320 | ❌ |

Methodischer Hinweis: Scores sind nur **innerhalb** einer Quelle
vergleichbar (Subreddit-Größen unterscheiden sich um eine
Größenordnung). ADV = Endkunden-Sicht, TA = Artist-Sicht.

**Strom B — DACH-Radar (tattoo-recht.de, 11.06.2026):** Drei neue
Beiträge, alle im selben Themenfeld Urheberrecht: (1) Copycat-Urteil
AG Köln, Az. 137 C 162/25 v. 22.12.2025 — 1.500 € Schadensersatz für
nachgestochenes Instagram-Motiv; (2) Kat Von D / Sedlik (Foto als
Tattoo); (3) Miturheberschaft durch Briefing (LG Köln 14 O 5/23).

**Dedup-Check (DB):** Abgedeckt sind No-Shows/Anzahlung, Social Media,
Studio-Organisation, REACH, DSGVO. Urheberrecht: nicht abgedeckt.
K1/C1-Themenfeld (Erwartungsmanagement/Kundenkommunikation): nicht
abgedeckt.

**Such-Validierung:** „Tattoo nachstechen Urheberrecht" liefert breite
DACH-Berichterstattung (kpw.law, Kanzlei Plutte, Dr. Bahr, wortfilter,
feelfarbig) **plus amtlichen Urteilsvolltext** auf nrwe.justiz.nrw.de
→ Suchinteresse und Tier-1-Quellenlage bestätigt.

**Entscheidung — 1 Artikel (Strom-B-Slot):** „Copycat-Urteil /
Urheberrecht bei Tattoo-Vorlagen". Begründung: (a) frisches,
zeitkritisches DACH-Urteil — Newsjacking-Wert verfällt; (b) Community-
Rückendeckung durch C2 (zweithöchster TA-Trend-Cluster: virale
Trend-Motive, Referenz-Unsicherheit, Design-Eigentum) — Strom A und
Strom B konvergieren auf dasselbe Thema; (c) Dedup frei; (d) Tier-1-
Quelle (amtlicher Volltext) verfügbar. → Draft
`copycat-tattoo-urteil-urheberrecht` (post_id `a826dcd5-839c-412d-a2be-b9ab271af118`).

**Backlog für die nächsten Läufe (datengestützt):**
1. **K1 + C1 — Erwartungsmanagement & Kundenkommunikation** (Top-Cluster
   beider Quellen zusammen gedacht: „Kunde unglücklich mit dem Ergebnis"
   ← Briefing, Stencil-Abnahme, schwierige Gespräche). Stärkster
   Strom-A-Kandidat.
2. **K2 — Aftercare-Verwirrung** (Artist-Winkel: standardisierte
   Nachsorge-Kommunikation, die Panik-DMs verhindert).
3. **K3 — Cover-ups/Scars** (hohes Volumen, eher Craft- als
   Business-Thema — Winkel prüfen).
4. YouTube-Kommentar-Quelle testen (steht aus, siehe `sources.md`).

## Lauf 2026-06-11 (nachmittags) — erweiterter Quellenmix + Wochen-Fenster

**Scrapes:**
- Kern-Subs `top/?t=week`: Run `FyC3zdMGXimONIozL` — nach 23 Items
  manuell abgebrochen (Crawler degradierte, Top-Posts waren bereits
  erfasst da nach Engagement sortiert gecrawlt; Daten valide).
- Neue-Quellen-Test `top/?t=month`: Run `PS69uBarExfnW7yaR` —
  r/TattooApprentice + r/sticknpokes, 18 Items.
- YouTube-Test: Run `huemfLEXCcbH4V3OQ` — 115 Top-Kommentare aus 4
  Business-Episoden „Honest Tattooer Podcast", 54 s, fehlerfrei.

**Quellen-Verdikte (in `sources.md` übernommen):**
- r/sticknpokes → **raus** (reines Showcase).
- r/TattooApprentice → **schwach** (Portfolio-CC, Azubi-Nische ≠
  Solo-Artist-Zielgruppe). Nicht aufgenommen.
- YouTube-Kommentare → **aufgenommen, nur qualitativ** (Vote-Zahlen zu
  klein fürs Scoring; liefert O-Ton-Stimmung: Shop-Splits/Booth-Rent,
  No-Show-„Flakiness", Fake-Experten/Tattoo-Schulen, Übersättigung).
- feelfarbig.com → **aufgenommen als zweite Strom-B-Quelle** (DACH-
  Magazin; offene Themen: Befähigungsnachweis-Debatte, Insta-Musik-
  Abmahnungen).

**Wochen-Cluster (19 von 23 Posts klassifiziert, 4 Showcase raus):**

| Cluster | Posts | Score | Trend (≥3)? |
|---|---|---|---|
| K5 Motiv-/Stil-Entscheidung — ADV | 5 | 8 486 | ✅ |
| K1 Erwartung vs. Ergebnis — ADV | 4 | 7 612 | ✅ |
| K6 Artist-Auswahl/Qualität — ADV | 1 | 3 313 | ❌ |
| K2 Aftercare/Healing — ADV | 1 | 2 540 | ❌ |
| C1 Kundenkonflikte & Kommunikation — TA | 4 | 2 004 | ✅ |
| C4 Technik/Equipment — TA | 3 | 54 | ✅ |
| C5 Farben/Reaktionen — TA | 1 | 20 | ❌ |

**Entscheidung — 1 Artikel (Strom-A-Slot):** „Erwartungsmanagement &
Kundenkommunikation" (K1 + C1). Begründung: (a) K1 und C1 sind in
**beiden Fenstern** (Woche + Monat, siehe Lauf vormittags) und **beiden
Quellen** Trend — das robusteste Signal im Datensatz; (b) die frischen
Artist-Posts der Woche (6.–9.6.) liegen exakt im Schnittpunkt
(Abnahme-Drama, Gratis-Touchup-Forderungen, Reschedule-Policies);
(c) K5 führt zwar kundenseitig, ist aber „Was soll ich stechen
lassen"-Content — der Artist-Winkel davon (Design-Beratung) fließt in
den K1/C1-Artikel ein; (d) Dedup frei; (e) Tier-1/2-Quellenlage
verifiziert: OLG Hamm 12 U 151/13 (Werkvertrag, Unzumutbarkeit der
Nachbesserung, Schmerzensgeld + Laserkosten, Körperverletzungs-
Argument) via juraexamen.info. → Draft `erwartungsmanagement-tattoo-kunden`
(post_id `11a7fcf2-3ac6-4b7f-a4f9-927e86968c70`).

## Lauf 2026-06-13 — Methodik-Update: Outlier-Normalisierung (A/B-validiert)

**Änderung:** Scoring von `Score(Cluster) = Σ Engagement` auf
`Score(Cluster) = Σ (Engagement / Median-Engagement der Quelle)` umgestellt
(neue Formel siehe Methode oben). Grund: Die Rohsumme ist durch die
Subreddit-Größe konfundiert — r/tattooadvice (ADV, Endkunden) schüttet pro
Post rund 40–75× mehr absolutes Engagement aus als r/TattooArtists (TA,
Artists = unsere B2B-Zielgruppe). Unter Σ Engagement gewinnen Consumer-Cluster
mechanisch, das Artist-Signal wird begraben.

**Test-Design (kontrolliert):** beide Formeln auf *identischem* Post-Set und
*identischer* Cluster-Zuordnung gerechnet — einzige Variable ist die Formel.
Reproduzierbar via `/tmp/toda-radar/ab.py` (historisch) + `ab_fresh.py` (live).
Kein neues Mining-Topic gewählt — reiner Methodik-Lauf.

### A/B 1 — historischer Datensatz `rjxz3bptzNgfzNTK9` (77 Posts, top/month; die Daten hinter den 06-11-Entscheidungen)
47 Posts klassifiziert (30 Showcase/unklar raus; Cluster reproduzieren die
06-11-Zuordnung — K4/C2/C5-Summen identisch). Baseline-Median: ADV 3 278 / TA 84 (**39×**).

| Cluster | Quelle | n | OLD Σeng | oldR | NEW Σoutlier | newR |
|---|---|---|---|---|---|---|
| C1 Kundenkonflikt/Komm | TA | 6 | 2 446 | 5 | 29.12 | **1** |
| C2 Urheberrecht/Design | TA | 3 | 1 580 | 6 | 18.81 | **2** |
| K1 Erwartung/Ergebnis | ADV | 6 | 36 746 | 1 | 11.21 | 3 |
| C4 Technik/Equipment | TA | 6 | 788 | 7 | 9.38 | 4 |
| K2 Aftercare/Healing | ADV | 6 | 26 754 | 2 | 8.16 | 5 |
| K3 Coverup/Removal | ADV | 6 | 23 046 | 3 | 7.03 | 6 |
| C678 Fehler/Scam/Burnout | TA | 3 | 463 | 8 | 5.51 | 7 |
| C3 Business/Studio | TA | 8 | 419 | 9 | 4.99 | 8 |
| C5 Farben/Reaktionen | TA | 1 | 391 | 10 | 4.65 | 9 |
| K4 Motiv/Kultur | ADV | 2 | 12 840 | 4 | 3.92 | 10 |

Befund: OLD ranked die Top-4 **alle** Consumer (ADV); der stärkste Artist-Cluster
landet auf Rang 5. NEW stellt die **zwei** Artist-Cluster C1 + C2 auf Rang 1+2 —
exakt die Themen, die zu den Drafts *Erwartungsmanagement* (K1+C1) und
*Copycat/Urheberrecht* (C2) wurden. Die neue Formel hätte beide Sieger allein aus
Strom A oben ausgespielt. Robust: unter Mittelwert- statt Median-Baseline bleibt
C1 #1 und C2 #3 (vs. OLD #5/#6) — die Schlussfolgerung kippt nicht.

### A/B 2 — frischer Live-Scrape `Bz8d9f7obzljNuETX` (23 Posts, top/week, 13.06.)
Crawler degradierte bei ~23 Items (bekanntes Verhalten, vgl. 06-11 nachmittags) —
Snapshot valide. Baseline-Median: ADV 1 416 / TA 19 (**74.5×** — Konfundierung
repliziert noch stärker). Post→Cluster: K1{1tzf96s,1u0r0rg,1u290p9},
K5{1tytgzm,1u0nrhu,1u0ijrz,1tzpmc3}, K2{1u2e81d}, C1{1tzt7p4,1u1ak97},
C3{1u3e608,1u1kpfv}, C4{1u1ousp,1u2aqbg}, C5{1u2cq8i}; Rest Showcase/unklar raus.

| Cluster | Quelle | n | OLD Σeng | oldR | NEW Σoutlier | newR | Gate ≥3 |
|---|---|---|---|---|---|---|---|
| C1 Kundenkonflikt/Komm | TA | 2 | 188 | 4 | 9.89 | 1 | nein |
| K5 Motiv/Stil-Entscheidung | ADV | 4 | 9 659 | 1 | 6.82 | 2 | **ja** |
| K1 Erwartung/Ergebnis | ADV | 3 | 4 040 | 2 | 2.85 | 3 | **ja** |
| C5 / C4 / C3 (TA), K2 (ADV) | — | ≤2 | … | 3–7 | ≤1.7 | 4–7 | nein |

Befund: NEW hebt wieder das Artist-Thema C1 auf den höchsten Normwert (9.89) —
aber C1 hat in dieser dünnen Wochen-Scheibe nur 2 Posts und fällt durchs
**≥3-Trend-Gate**. Gegateter Sieger bleibt damit korrekt K5 (Consumer-Design-
Entscheidungen, n4). Heißt: Normalisierung **und** Trend-Gate arbeiten zusammen —
die Formel pusht Artists nicht blind und fabriziert keinen Trend aus 2 Posts; sie
surfaced das Artist-Signal nur, wenn genug Volumen einen echten Cluster trägt
(historischer Monats-Lauf: C1 n6, C2 n3 → Sieg).

**Verdikt: ÜBERNOMMEN.** Datenbasiert besser — löst die objektive Größen-
Konfundierung (39–75× Quellen-Asymmetrie), holt die B2B-Artist-Themen aus der
Versenkung und bleibt durchs Trend-Gate diszipliniert. Nächster regulärer
Mining-Lauf nutzt die neue Formel.

## Lauf 2026-06-16 — Aftercare-Kommunikation (Strom-A-Scrape ausgefallen, Strom-B-Radar + dokumentiertes Signal)

**Strom A — Scrape heute ausgefallen (transparent dokumentiert):** Zwei
Versuche mit `trudax/reddit-scraper-lite` (r/TattooArtists + r/tattooadvice,
top/week+month, `includeMediaLinks: true` für Vote-/Kommentarzahlen):
- Run `aM8c32jFu9Gkqju9z` (4 startUrls): nach ~8 min abgebrochen, **0 Items** —
  Reddit blockte die Per-Post-Detailextraktion (zuletzt 8 failed requests/10 s).
- Run `l52rKQe0e8uIyfanD` (2 startUrls, schlanker): nach ~7 min nur **1 Item**
  (2/8 Seiten, 6 von 8 Requests failed). Ebenfalls abgebrochen.
Befund: Die fürs Scoring nötige Detailextraktion (upVotes + numberOfComments)
wird derzeit residential-seitig hart gedrosselt — kein verwertbarer Frisch-
Datensatz. **Fallback (wie bei früheren Crawler-Degradationen, vgl. 11.06.
nachmittags):** dokumentiertes Strom-A-Signal vom 11.06. (77 Posts, A/B-validierte
Cluster) statt Frisch-Scrape.

**Dokumentiertes Strom-A-Signal (Basis 11.06., weiter gültig):** Top-Artist-Cluster
nach Outlier-Formel waren C1 (Kundenkommunikation) und C2 (Urheberrecht) — **beide
inzwischen veröffentlicht** (studio-smile / screenshot-roulette). Nächster
data-backed Backlog-Eintrag nach C1/C2-Abschluss: **K2 Aftercare/Healing** (Top-
Consumer-Cluster + der dort explizit notierte Artist-Winkel „standardisierte
Nachsorge-Kommunikation, die Panik-DMs verhindert").

**Strom B — DACH-Radar (16.06., per WebFetch geprüft):**
- tattoo-recht.de: FG Düsseldorf 4 K 1875/23 G (Tätowierer steuerlich als Künstler,
  Feb 2025); LAG SH 2 Sa 278/24 (keine Lohnfortzahlung bei Tattoo-Entzündung —
  Arbeitnehmer-Thema, off-target für Solo-Artists); „Studionamen schützen"
  (Markenrecht, Mai 2025).
- feelfarbig.com: Befähigungsnachweis-Debatte (Jan 2026); Instagram-Musik-
  Abmahnung (Nov 2025); KI-Kunst-Kritik (Dez 2025); Tattoo-Etiquette (März 2026 —
  überschneidet sich mit erwartungsmanagement → Dedup-Vorsicht).

**Kandidaten + Abwägung:**

| Kandidat | Quelle | Pro | Contra |
|---|---|---|---|
| **K2 Aftercare-Kommunikation** | Strom A (Backlog #2) | Top undone Cluster; **non-legal → diversifiziert** den bislang rein rechts-/regulatorischen Blog (4 Legal-Artikel); stärkster TODA-Fit (Communication Center, Erinnerungen); sauber sourcebar | kein News-Peg |
| FG Düsseldorf Steuer/Künstler | Strom B | frisches Tier-1-Urteil; echtes Business-Pain | trocken; 5. Legal-Artikel in Folge; schwacher TODA-Fit |
| Instagram-Musik-Abmahnung | Strom B | hoch relatable (jeder postet Reels) | schwacher TODA-Fit; erneut Legal |

**Dedup (DB-Slugs, Stand 16.06.):** published/draft decken Werkvertrag-Erwartung,
Urheberrecht, REACH, Anzahlung ab. Nachsorge/Heilung **nicht** abgedeckt → frei.

**Such-Validierung:** „Tattoo Nachsorge" / „Tattoo Heilung Phasen" = breites
DACH-Suchinteresse (Hersteller-, Apotheken-, Magazin- und Ärzteblatt-Treffer) →
Suchinteresse bestätigt.

**Quellen-Check (bestanden):** Tier-1 **Ärztekammer Nordrhein**, Rheinisches
Ärzteblatt 4/2026 (24.03.2026) — Heilung ~6 Wochen, Allergien häufigste
Nebenwirkung (rote Pigmente), 1–6 % Komplikationen. Tier-2 **DRACO / Dr. Ausbüttel**
(Apotheken-Wundversorgung) — Phasen-Timeline + Infektions-Warnsignale, deckt sich
mit Tier-1 bei ~6 Wochen (Tier-2-gegen-Tier-1-Check bestanden). Beide per WebFetch
verifiziert, öffentlich lesbar → in `sources.md` aufgenommen.

**Entscheidung — 1 Artikel (Strom-A-Backlog-Slot K2):** „Aftercare-Kommunikation /
Heilphase steuern". Begründung: (a) data-backed Top-Backlog nach C1/C2-Abschluss;
(b) diversifiziert den bisher rein rechts-/regulatorischen Blog; (c) bester
TODA-Produkt-Fit (Erinnerungen/Vorlagen); (d) Tier-1+2 verifiziert; (e) interner
Link auf published Geschwister (studio-smile/Werkvertrag) gesetzt. → Draft
`tattoo-nachsorge-heilphase-kommunizieren` (post_id
`a86b0ff3-68ee-484c-92ec-d96ad9b53bd0`), Kategorie Handwerk & Studio.

**Backlog für die nächsten Läufe:**
1. **FG Düsseldorf 4 K 1875/23 G** — Tätowierer steuerlich als Künstler
   (freiberuflich vs. gewerblich, Gewerbesteuer/KSK). Frisches Tier-1-Urteil,
   echtes Solo-Artist-Business-Pain. Bei nächstem Legal-Slot bevorzugt.
2. **Instagram-Musik-Abmahnung** — Reels mit lizenzpflichtiger Musik =
   Abmahnrisiko; sehr relatable. Tier-1-Anker (GEMA/§ UrhG) noch zu verifizieren.
3. **K3 Cover-ups/Scars** (Strom-A-Backlog, Craft-Winkel) und **Studioname/
   Markenschutz** (Strom B).
4. **Reddit-Scraper-Reliabilität:** zwei Ausfälle in Folge — vor dem nächsten
   Mining-Lauf alternative Actor-Config prüfen (z. B. ohne Per-Post-Detail, Vote-
   Zahlen über andere Felder) oder Backup-Actor evaluieren.
