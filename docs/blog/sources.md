# Quellen-Library für den TODA-Blog

Zweck: Dauerhafte, kuratierte Wissensbasis für `/blog-article`. Jede
Faktenrecherche startet hier — nicht bei Google. **Extrem selektiv:**
Eine Quelle kommt erst rein, nachdem sie in einem echten Artikel-Lauf
verwendet und verifiziert wurde. Einträge, die sich als unzuverlässig
herausstellen, fliegen raus (mit Notiz warum).

## Regeln

1. **Tier 1–2 stützen Fakten.** Jede Rechts-/Zahlen-/Faktenaussage im
   Artikel braucht eine Tier-1- oder Tier-2-Quelle, per DeepAPI
   (`POST /v1/scrape/website`, PDFs `/v1/scrape/pdf`; `skill:deepapi`) im
   selben Lauf verifiziert — nie aus dem Gedächtnis, nie aus Tier 3.
   WebFetch nur als Fallback bei DeepAPI-Ausfall, mit benannter
   Abdeckungslücke. **Lesehilfe für die Tabellen:** „WebFetch ✅/❌" in der
   Spalte *Zugriff* ist der historische Befund (vor 08/2026); heute gilt
   der Zugriffsweg DeepAPI, ❌-Quellen (403/CAPTCHA) mit DeepAPI erneut
   probieren und den Befund datiert aktualisieren.
2. **Tier 3 ist nur Stimmung.** Community-Quellen liefern Themen und
   Stimmungsbilder. Im Artikel erscheinen sie ausschließlich als lose
   Community-Voice („Man hört gerade oft von Artists, dass …") — nie
   als Faktenbeleg, nie als wörtliches Zitat. **Endkunden-Strang:** für
   Endkunden-Fragen gilt dieselbe Tier-Hierarchie; PAA-Fragen (Serp) sind
   Themen-, nie Faktenbeleg.
3. **Tier 2 gegen Tier 1 prüfen.** Kommerzielle Blogs/Fachseiten können
   Fehler oder Eigeninteresse haben — zentrale Behauptungen gegen eine
   Tier-1-Quelle gegenchecken, wo möglich.
4. **Neue Quelle = neuer Eintrag im selben Lauf**, inkl. Zugriffsweg und
   wofür sie taugt. Nicht verwendete Fundstellen kommen NICHT rein.
5. **Tier-1-Kompass für Nicht-Rechtsthemen.** Der Puls schiebt Business-,
   Einstiegs- und Handwerksthemen nach vorn (`pricing`, `career-entry`,
   `business-studio`, `technique-equipment`), für die die Library keine
   Anker hat. Was dort als Tier 1 zählt: amtliche Statistik (Destatis,
   Bundesagentur für Arbeit), Gesetzestexte (gesetze-im-internet: GewO,
   UStG § 19, HwO, IfSG § 36), Bundes-/Landesbehörden (BfR, RKI-Hygiene-
   empfehlungen, Gesundheitsämter, Hygieneverordnungen der Länder),
   Kammern (IHK, Handwerkskammer), Berufsverbände (DOT, Bundesverband
   Tattoo). Tier 2: Fachmagazine (feelfarbig), Steuerberater-/Kanzlei-
   Fachbeiträge, Hersteller-Leitfäden. Gibt es für eine Kernaussage keinen
   Anker dieser Art, ist es eine Stimmung, kein Fakt — dann trägt sie den
   Artikel nicht (SKILL.md, Lauf 1, Schritt 7). Keine Vorbefüllung: Einträge
   entstehen weiter nur aus echten Läufen (Regel 4).
6. **Verifizierte Quellen werden im Artikel inline verlinkt.** Jede
   namentlich verwendete Tier-1/2-Faktenquelle bekommt einen Inline-Link
   `[Text](URL)` auf genau die hier hinterlegte, im selben Lauf geprüfte
   URL. Linkziel muss **öffentlich lesbar** sein (kein Login/CAPTCHA) —
   z. B. dejure/NRWE statt openJur; Lesbarkeit im selben Lauf per DeepAPI
   belegt. Tier 3 wird nie verlinkt. (Pipeline öffnet externe Links
   automatisch in neuem Tab.)

## Tier 1 — Primär- & Behördenquellen (Fakten-Anker)

| Quelle | Themengebiet | Zugriff | Notizen |
|---|---|---|---|
| EUR-Lex, VO (EU) 2020/2081 (`eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32020R2081`) | REACH / Tätowierfarben (Anhang XVII Nr. 75) | WebFetch ✅ · DeepAPI ✅ (08.09.2026) | Volltext der Verordnung; Grenzwerte, Kennzeichnungspflichten, Fristen. Verifiziert Juni 2026. |
| EUR-Lex, Richtlinie (EU) 2023/2673 (`eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32023L2673`) | Widerrufsfunktion („Widerrufsbutton") bei Fernabsatzverträgen — Grundlage von § 356a BGB | DeepAPI ✅ (08.09.2026; **`/TXT/HTML/` mit `maxChars ≥ 100000`** — die `/TXT/` -Variante liefert nur die Such-Shell, und bei 60 000 Zeichen fehlt Art. 2) | Art. 2: Mitgliedstaaten wenden die Vorschriften **ab dem 19. Juni 2026** an; Erwägungsgründe + neuer Art. 11a RL 2011/83/EU (Funktion „ständig verfügbar, gut sichtbar"). Verwendet 08.09.2026 (Anzahlung/Widerruf). |
| gesetze-im-internet.de | BGB (§§ 312 ff. Fernabsatz, Widerruf), DSGVO-Begleitrecht, **PAngV** (Preisangaben gegenüber Verbrauchern), UStG | WebFetch ✅ · DeepAPI ✅ (08.09.2026, Einzelnorm-URL `/bgb/__<nr>.html`) | Amtliche Gesetzestexte; immer Originalparagraf zitieren. Verwendet & verifiziert 08.09.2026 (Anzahlung/Widerruf): § 312c (Fernabsatzvertrag), § 312g (Widerrufsrecht), § 355 (14 Tage, formlos), § 356 Abs. 3/4 (Frist läuft erst nach Belehrung; erlischt spätestens 12 Monate + 14 Tage), **§ 356a (Widerrufsfunktion „Vertrag widerrufen" auf der Online-Benutzeroberfläche, Eingangsbestätigung)**, § 648 (Kündigung Werkvertrag, 5 %-Vermutung — nicht verwendet, R4). **09.09.2026 (Vollzeit-Artikel, DeepAPI-Website-Scrape an dem Tag 500 → direkter `curl`, Volltext-Einzelnormen gelesen):** GewO § 14 (Anzeigepflicht), UStG § 19 (Kleinunternehmer 25.000 € Vorjahr / 100.000 € laufend) + § 12 (19 %), EStG § 37 (Vorauszahlungen 10.3./10.6./10.9./10.12.), AO § 147 (Buchungsbelege 8 Jahre, Bücher 10), IfSG § 36 Abs. 2 (Gesundheitsamt darf blutübertragende Gewerbe überwachen), TätoV (`/t_tov/BJNR221500008.html`). **10.09.2026 (Preisfrage-Artikel, DeepAPI `/v1/scrape/website`, alle 5 URLs `returned`):** PAngV `/pangv_2022/__1.html` (Anwendungsbereich: Preise von Unternehmern gegenüber Verbrauchern; Ausnahme nur für *mündliche* Angebote ohne Preisangabe; Grundsatz „Preisklarheit und Preiswahrheit"), `__2.html` (Nr. 3: Gesamtpreis = „einschließlich der Umsatzsteuer und sonstiger Preisbestandteile"), `__3.html` (Abs. 1: wer Verbrauchern Leistungen anbietet oder mit Preisen wirbt, „hat die Gesamtpreise anzugeben"; Abs. 2: Hinweis auf Verhandlungsbereitschaft erlaubt), `__9.html` (individuelle Preisermäßigungen ohne neue Gesamtpreis-Pflicht — nicht verwendet, R4). UStG § 12 Abs. 1 („19 Prozent der Bemessungsgrundlage") und § 19 Abs. 1 erneut gelesen. |
| BMUV — Safer Tattoo (`bundesumweltministerium.de`) | Tattoo-Sicherheit, Farben | WebFetch ✅ | Eher Einstiegs-/Verbraucherseite, wenig harte Fakten — für Zahlen auf EUR-Lex/BfR ausweichen. |
| ECHA — Tattoo inks (`echa.europa.eu`) | REACH-Hintergrund | WebFetch ❌ (403, Juni 2026) | Blockt Fetcher. Inhalte stattdessen über EUR-Lex oder BfR beziehen. |
| NRWE — Rechtsprechungsdatenbank NRW (`nrwe.justiz.nrw.de`) | Amtliche Urteilsvolltexte (NRW-Gerichte) | WebFetch ✅ · DeepAPI ✅ (08.09.2026, Volltext 137 C 162/25 vollständig) | Goldstandard für Urteile: Tenor, Begründung, zitierte Paragrafen im Original. Verwendet für AG Köln 137 C 162/25 (Copycat-Tattoo). URL-Schema: `/ag_koeln/j<jahr>/<az>_Urteil_<datum>.html`. **Auch Finanzgerichte:** `/fgs/duesseldorf/j2025/4_K_1875_23_G_AO_Urteil_20250218.html` = FG Düsseldorf, Urteil 18.02.2025, 4 K 1875/23 G,AO (Tätowierer mit eigenen Motiven = künstlerisch, kein Gewerbesteuermessbetrag; Revision zugelassen, nicht rechtskräftig) — per `curl` 09.09.2026 gelesen, Tenor + Tatbestand vollständig. Verwendet im Vollzeit-Artikel. |
| dejure.org (`dejure.org/dienste/vernetzung/rechtsprechung?Gericht=…&Datum=…&Aktenzeichen=…`) | Rechtsprechung: Aktenzeichen-Nachweis, Fundstellen (NJW-RR, MDR …), Volltext-Verweise (DACH) | WebFetch ✅ · DeepAPI ✅ (08.09.2026) | **Öffentlich lesbar — kein CAPTCHA** (anders als openJur, das Fetcher/Leser per CAPTCHA blockt). Standard-**Linkziel** für Urteils-Zitate. Verwendet & verifiziert 16.06.2026 für OLG Hamm, Beschluss 05.03.2014, Az. 12 U 151/13 (mangelhaftes Tattoo). |
| Ärztekammer Nordrhein — Rheinisches Ärzteblatt (`aekno.de/aerzte/rheinisches-aerzteblatt/…`) | Tattoo-Gesundheit: Wundheilung, Risiken, Nebenwirkungen (DACH) | WebFetch ✅ · DeepAPI ✅ (08.09.2026) | Amtliche Ärztekammer-Publikation (Tier 1, zitiert BfR-Experten). Verwendet & verifiziert 16.06.2026 für Aftercare-Artikel: Wundheilung **~6 Wochen** oberflächlich (tiefere Schichten Monate), allergische Reaktionen häufigste Nebenwirkung (rote Pigmente), 1–6 % Komplikationen. Ausgabe 4/2026, 24.03.2026 (Autorin J. Naujoks). |

## Tier 2 — Fachquellen (geprüft, mit Vorsicht)

| Quelle | Themengebiet | Zugriff | Notizen |
|---|---|---|---|
| tattoo-recht.de | Tattoo-spezifische Urteile & Rechtsfragen (DACH) | WebFetch ✅ (06/2026) · **08.09.2026: nur Startseite lesbar (DeepAPI + curl), alle Unterseiten 404** — Urteilslisten, `/feed/`, `/wp-json/` | Anwaltsbetriebene Fachseite (Rieck & Partner); Quelle für AG Dresden Az. 116 C 5571/25 (Anzahlung/Widerruf) und AG Köln 137 C 162/25 (Copycat). Doppelrolle: **Strom-B-Radar** — aktuell degradiert, Pfade je Lauf erneut probieren (SKILL.md, Lauf 1, Schritt 3). Fakten laufen unabhängig davon über NRWE/dejure. **Offen seit 08.09.2026:** AG Dresden 116 C 5571/25 (April 2026, 310 €) ist nur hier dokumentiert und aktuell nirgends lesbar (dejure kein Treffer, lawthek nicht lieferbar) → Az./Betrag erst wieder zitieren, wenn eine lesbare Fundstelle da ist. |
| feelfarbig.com | Deutsches Tattoo-Magazin: Branche, Business, Recht (DACH) | DeepAPI ✅ + **RSS `https://feelfarbig.com/feed/`** (datiert, `pubDate`; geprüft 08.09.2026, jüngster Beitrag 15.08.2026) | Etabliertes Online-Magazin, aktiv, redaktionelles Profil. Zweite **Strom-B-Radar**-Quelle — der Feed ist der Radar-Weg (nur Beiträge seit dem letzten Radar-Eintrag = neu). Offene Themen dort notiert: Befähigungsnachweis-Debatte (Jan 2026), Instagram-Musik-Abmahnungen. Fakten trotzdem gegen Tier 1 checken. |
| mystudioflow.io/blog | DSGVO/Studio-Organisation | WebFetch ✅ | Kommerzieller SaaS-Blog (Wettbewerbsumfeld!) — nur als Sekundärquelle, Kernfakten gegen Tier 1 gegenchecken. |
| **@recht_bunt** (Instagram, `instagram.com/recht_bunt/`) — RA Urban Slamal (@urbanslamal), Fachanwalt für Tattoo-Recht | Tattoo-Recht aus Anwaltspraxis (DACH): Widerruf/Fernabsatz bei Online-Buchung, AGB als Vertragsinhalt, No-Shows, Nachbesserung/Mangel, Einwilligung, Minderjährige, Betäubungscremes, Cover-up-Aufklärung, Urheberrecht, Wettbewerbs-/Strafrecht, Haftung freier Mitarbeiter | DeepAPI `POST /v1/scrape/instagram/posts` `{ "usernames": ["recht_bunt"] }` (Caption + Datum + Permalink; verifiziert 08.09.2026: 34 Posts seit 04/2026, ~2.400 Follower) | **Von Tomek als vertrauenswürdig benannt (08.09.2026).** Tier 2: ein Reel ist **verlinkbar** und belegt „Anwalt X sagt …" (Permalink `instagram.com/p/<id>/`); Zahlen/§§/Aktenzeichen weiter gegen Tier 1. Zitierbar ist die **Caption** (gescrapt); gesprochene Reel-Inhalte nur, wenn sie im selben Lauf transkribiert wurden. Doppelrolle **Strom-B-Radar**: neue Posts seit dem letzten Radar-Eintrag = Themen-Trigger. Kein Kanal der Wochen-Batterie (Radar-, nicht Volumenquelle). |
| kkp.law (`kkp.law/news/tattoorecht-anzahlung-oder-terminkaution/`) | Tattoo-Recht: Anzahlung vs. Terminkaution, AGB-Klauseln (DACH) | DeepAPI ✅ (08.09.2026) | Kanzlei-Fachbeitrag (undatiert): Anzahlung wird auf den Lohn angerechnet, Terminkaution sichert nur den Termin und kann bei Nichterscheinen verfallen; **Vorabbetrag individuell aushandeln, nie in AGB** (Klauseln meist unwirksam). Verwendet 08.09.2026 für einen Listenpunkt; Terminkaution-Winkel = Folgeartikel-Kandidat. |
| academy.7erink.com (`academy.7erink.com/journal-widerrufsrecht-tattoo-2026.html`, Tom Irschina, 04.06.2026) | Bericht über das AG-Dresden-Urteil (Fernabsatz/Widerruf bei Messenger-Buchung), Belehrungs-Checkliste | DeepAPI ✅ (08.09.2026) | Kommerzielle Tattoo-Akademie (Tier 2 mit Vorsicht): **nennt kein Aktenzeichen und keinen Betrag** — als Beleg nur für „AG Dresden hat 2026 so entschieden"; Mechanik gegen Tier 1 (§§ 312c/356) geprüft. Verwendet 08.09.2026, weil tattoo-recht.de (Az.-Quelle) nicht erreichbar war. |
| juraexamen.info | Urteilsbesprechungen (juristische Ausbildungsseite) | WebFetch ✅ | Fundierte, paragrafengenaue Fallbesprechungen. Verwendet für OLG Hamm 12 U 151/13 (mangelhaftes Tattoo: Werkvertrag § 631 BGB, Unzumutbarkeit der Nachbesserung, Schmerzensgeld). |
| DRACO / Dr. Ausbüttel (`draco.de/tattoo-wunden`) | Wundversorgung frischer Tattoos: Heilungsphasen, Infektions-Warnsignale (DACH) | WebFetch ✅ | Professioneller Apotheken-/Wundversorgungs-Leitfaden (Hersteller Dr. Ausbüttel GmbH & Co. KG). Verwendet & verifiziert 16.06.2026: Phasen-Timeline (Tag 1–3 / Woche 2–3 / Woche 3–6, tiefere Schichten Monate), Infektionszeichen (Rötung, Bläschen, Eiter, Fieber → Arzt). Deckt sich mit Ärztekammer-Tier-1 bei ~6 Wochen (Tier-2-gegen-Tier-1-Check bestanden). |

## Neue Kanäle aufnehmen (Aufnahme-Protokoll)

Jeder Kandidat (Subreddit, YouTube-Kanal, TikTok-Hashtag, Forum …)
durchläuft vor Aufnahme genau einen **Test-Scrape** und wird entlang
dreier Fragen bewertet:

1. **Diskussionsanteil:** Wie viele der Top-Posts/Kommentare sind echte
   Diskussion (Schmerzpunkte, Fragen, Debatten) statt Showcase/Lob?
   Richtwert: < 20 % Diskussion → raus.
2. **Zielgruppen-Fit:** Sprechen dort Solo Artists im ICP-Profil (oder
   deren Endkund:innen)? Maßstab ist ICP/Anti-ICP in `toda-context.md`
   („Für wen wir schreiben") — Anti-ICP-Nischen (Studio-Management,
   Walk-in, Hobby) → raus, egal wie aktiv.
3. **Scoring-Tauglichkeit:** Tragen Engagement-Zahlen (Votes,
   Kommentare)? Wenn ja → quantitativ (fließt in Cluster-Scores);
   wenn nein, aber inhaltlich wertvoll → **nur qualitativ** (Stimmung,
   kein Scoring).

4. **Nur-Neues-Fähigkeit (seit v3):** Liefert der Kanal Woche zu Woche
   neue Zeilen — per API-Zeitfilter (`since`) oder weil der Ingest-Dedupe
   auf `(platform, external_id)` genug Neues übrig lässt? Richtwert ≥ 70 %
   neue Zeilen je Lauf (außer Snapshot-Slots). Ein Kanal, der nach zwei
   Läufen nur Bekanntes wiederholt, ist Re-Scrape, kein Signal → raus.

Verdikt (aufgenommen quantitativ / aufgenommen qualitativ / raus) wird
hier in der Tabelle bzw. unter „Bewusst ausgeschlossen" dokumentiert,
der Test-Lauf im `topic-radar.md`. Wackelkandidaten fliegen nach zwei
ertraglosen Läufen wieder raus.

**Scraper-Verdikt (verifiziert 2026-07-12 — historisch, Apify-Strecke bis
08/2026 ersetzt durch die DeepAPI-Batterie):** `harshmaur/reddit-scraper`
**aufgenommen — quantitativ**. Volumentest über beide Kern-Subs: Coverage
**100 %**, per-Source-Zahlen median-tauglich (broad/week **128** =
tattooadvice 100 + TattooArtists 28; broad/month **200** = 100 + 100).
Ersetzt `trudax/reddit-scraper-lite` (**retired** — seit 16.06. tot, zwei
Ausfälle in Folge durch residential-gedrosselte Detail-Extraktion) und
`clearpath/reddit-post-comments-bulk-scraper`. Test-Details im
`topic-radar.md`-Eintrag 2026-07-12.

## Tier 3 — Community-Signal (nur Themenfindung & Stimmung)

Erhebung: zentrale Wochen-Batterie (Pipeline v3 seit 09/2026, `lib/mining/config.ts` =
Quelle der Wahrheit; Kette Mo 06:00 UTC → `mining_runs`/`topic_signals` →
LLM-Verdichtung `topic_classifications` → Wochen-Digest `pulse_digests`; Methode in
`topic-radar.md`). Skills lesen den Digest zuerst und Zeilen zum Belegen — sie scrapen
nicht ad hoc. Seit v3 tragen alle Plattform-Zeilen `engagement` (Formel je Plattform)
und sind scorebar; Web/SERP/Reviews bleiben qualitativ (`engagement NULL`).

| Quelle | Was sie liefert | Zugriff | Notizen |
|---|---|---|---|
| r/TattooArtists | Schmerzpunkte arbeitender Artists (EN, US-lastig) | Batterie `reddit-broad` (DeepAPI `/v1/scrape/reddit/posts`, top/**week**) | Quantitative Diskussions-Baseline, Label **Hypothese** (EN→DACH-Übertragung). Seit v3 ergänzt durch `reddit-comments/*` (Top-3-Threads der Woche). |
| Reddit-Suche DE/EN | Deutsche Artist-Signale außerhalb der Artist-Subs + EN-Anker | Batterie `reddit-search/de` („Tätowierer", „Tattoo Studio", „tätowieren lernen") und `reddit-search/en` (DeepAPI `/v1/scrape/reddit/search`, `since: week`, `sort: new`) | Neu in v3 (06.09.2026). Wert im Testlauf-Loop messen. |
| YouTube-Suche DE | Klick-Nachfrage DE, Kandidaten für Kommentar-Scrapes | Batterie `yt-search/*` (5 feste Queries, `since: week`, `sort: relevance` — seit Lauf 2 am 06.09.2026; `date` lieferte Rausch) | Seit v3 mit `engagement = views` scorebar (Peer-Group = Query). |
| YouTube-Referenzkanäle | x-Ratio-Basis (Kanalmedian) | Batterie `yt-channels` (@inkarea, @honesttattooerpodcast, `since: month`) | Snapshot-Slot (Wiederholung Absicht). |
| YouTube-Kommentare | Insider-Stimmung arbeitender Artists (DACH) | Batterie `yt-comments/*` (YouTube Data API v3 `commentThreads`, `order=relevance`, kostenlos; **Ziele dynamisch:** Top 5 DE-Videos der Woche nach Kommentaren, Referenzkanäle raus) + on demand via `lib/mining/youtube.ts` | Nie die Data-API-`search` benutzen (100 Einheiten/Call) — Video-IDs kommen aus `yt-search`. `engagement = likes + 2·replies`. |
| TikTok-Suche + Kommentare | Trend-Früherkennung (Endkunden-lastig) + echte DACH-Stimmen | Batterie `tiktok-search/*` (2 DE-Queries, `since: week`, `sort: relevance` — seit 06.09.2026) + `tiktok-comments/*` (**dynamisch:** Top 5 DE-Videos der Woche nach Kommentaren; feste Video-Liste seit v3 entfallen) | Gemessen 29.08.: Kommentare bestes DACH-Signal. Seit v3 scorebar. |
| Instagram-Hashtags + kuratierte Accounts | Angebotsseite, Szene-Optik; Verbands-/Kampagnen-/Podcast-Posts | Batterie `ig-hashtags/*` (3 DACH-Hashtags, Frische ≤ 14 Tage client-seitig) + `ig-accounts` (12 kuratierte DACH-Accounts, `since: week`; Liste in `config.ts`) + `ig-comments/*` (Top 5 DE-Posts der Woche, Lead-Magnet-Captions ausgeschlossen) | IG-Accounts neu in v3 (Recherche 06.09.: 37 geprüft, 18 gescrapt, ~5 liefern Diskussion). Kommentare: nur erste Seite (≈ 9) erreichbar — kleiner Slot. |
| Öffentliche Facebook-Gruppen | Job-/Guest-Spot-/Marktplatz-Posts + vereinzelte Meinungsposts (DE/EN) | Batterie `fb-groups/*` (5 öffentliche Gruppen, DeepAPI `/v1/scrape/facebook/groups`, Text-Hash-Dedupe, Posts ohne Text verworfen) | Neu in v3 (Recherche 06.09.: 19 Gruppen geprüft, 13 lesbar; alle deutschen „nur für Tätowierer"-Gruppen privat). Wert im Loop messen, Slots ohne Nutzen streichen; zwei Läufe `no_results` = privat geworden. |
| Mitbewerber-Reviews | Schmerzpunkte mit Booking-/Kalender-/Payment-Software (Feature-Ebene) | Batterie `reviews/apple/{appId}/{sf}` (Apple-RSS, frei, de/at/ch/gb/us), `reviews/play/{pkg}` (`google-play-scraper`, frei), `reviews/trustpilot/tattoodo` (DeepAPI extract) — nur inckd, Tattoodo, Taddoo, STYNG (MyInkConnect: keine App) | Neu in v3. **Nur unattribuiert verwenden** (`toda-context.md` Regel 9): `source` = Mitbewerber-Slug bleibt in der DB, der Digest aggregiert je `feature` ohne Namen. Wochen-Delta klein (Nischen-Apps). |
| Google-Suchnachfrage DE | Rising/Top-Queries um „Tattoo"/„Tätowierer"/„Tattoo Studio" + People-also-ask-Fragen | Batterie `serp/trends/*` (SerpApi `google_trends`, geo DE, 7 Tage, Wochen-Snapshot) + `serp/paa/*` (SerpApi `google`, google.de, 5 DE-Queries, Fragetext-Hash-Dedupe) | Neu in v3 (~8 Suchen/Woche, Free-Plan 250/Monat). Validierung + Fragen-Signal, kein Diskussions-Signal. SerpApi weiter für Suchvolumen in Skill-Läufen; DeepAPI `seo.keyword` ist für DE tot (29.08.). |
| Web-Snippets (Foren, Fachpresse) | Was Plattform-Endpoints nicht sehen | Batterie `web/*` (DeepAPI `/v1/search/web`, 5 feste Query-Varianten, URL-Hash-Dedupe) | **Nur qualitativ.** Survivorship-Bias einkalkulieren (Suche zeigt Gewinner). |

### Bewusst ausgeschlossen

- **r/tattoos** — Bilder-Showcase, kein Themen-Signal (Lauf Juni 2026).
- **r/sticknpokes** — reines Showcase (getestet 11.06.2026).
- **r/TattooApprentice** — fast nur Portfolio-Kritik; Azubi-Nische ist
  nicht die Solo-Artist-Zielgruppe (getestet 11.06.2026).
- **r/tattooadvice** — Endkunden-Perspektive; seit v2 nicht mehr in der
  Batterie (DACH-Endkunden-Signal liefert TikTok-Suche direkter).
  Historische Zeilen bleiben in der DB.
- **Instagram-Kommentare** — gemessen: fast nur Emojis/Lob, und die
  API deckelt bei ~11 Kommentaren pro Post — kein Schmerzpunkt-Signal.
  (IG-**Hashtags** sind dagegen Batterie-Quelle: Angebotsseite, Szene-Optik.)
- **Private Facebook-Gruppen** — bestes Signal, aber privat und
  scraping-rechtlich heikel. Öffentliche Gruppen sind OK (siehe Tier-3).
- **tattooscout.de** — Consumer-lastig und träge; höchstens
  Validierungs-Kontext, keine Mining-Quelle.
- **Apify (historisch, bis 08/2026):** die gesamte Apify-Strecke ist
  ersetzt durch die DeepAPI-Batterie + YouTube Data API. Historische
  Actor-Verdikte (`harshmaur/reddit-scraper` aufgenommen 07/2026;
  `trudax/reddit-scraper-lite`, `clearpath/…`, `khadinakbar/…`,
  `apify/rag-web-browser` raus) bleiben in `topic-radar.md` dokumentiert;
  DB-Zeilen mit `provider='apify'` bleiben gültige Historie.
