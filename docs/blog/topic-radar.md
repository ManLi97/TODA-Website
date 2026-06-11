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
Engagement(Post)  = Upvotes + 2 × Kommentarzahl
Score(Cluster)    = Σ Engagement aller zugehörigen Posts
Trend-Kriterium   : ≥ 3 unabhängige Posts im Cluster
Cross-Source-Bonus: Cluster taucht in ≥ 2 Quellen auf → im Ranking bevorzugen
```

Kommentare zählen doppelt, weil sie Diskussion (= Schmerz) anzeigen,
Upvotes nur Zustimmung. Die Cluster-Zuordnung ist der einzige manuelle
Schritt — deshalb wird die vollständige Zuordnungstabelle (Post →
Cluster) im Lauf-Eintrag mitdokumentiert, damit sie überprüfbar bleibt.

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
