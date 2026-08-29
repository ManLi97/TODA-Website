# Quellen-Library für den TODA-Blog

Zweck: Dauerhafte, kuratierte Wissensbasis für `/blog-article`. Jede
Faktenrecherche startet hier — nicht bei Google. **Extrem selektiv:**
Eine Quelle kommt erst rein, nachdem sie in einem echten Artikel-Lauf
verwendet und verifiziert wurde. Einträge, die sich als unzuverlässig
herausstellen, fliegen raus (mit Notiz warum).

## Regeln

1. **Tier 1–2 stützen Fakten.** Jede Rechts-/Zahlen-/Faktenaussage im
   Artikel braucht eine Tier-1- oder Tier-2-Quelle, per WebFetch im
   selben Lauf verifiziert — nie aus dem Gedächtnis, nie aus Tier 3.
2. **Tier 3 ist nur Stimmung.** Community-Quellen liefern Themen und
   Stimmungsbilder. Im Artikel erscheinen sie ausschließlich als lose
   Community-Voice („Man hört gerade oft von Artists, dass …") — nie
   als Faktenbeleg, nie als wörtliches Zitat.
3. **Tier 2 gegen Tier 1 prüfen.** Kommerzielle Blogs/Fachseiten können
   Fehler oder Eigeninteresse haben — zentrale Behauptungen gegen eine
   Tier-1-Quelle gegenchecken, wo möglich.
4. **Neue Quelle = neuer Eintrag im selben Lauf**, inkl. Zugriffsweg und
   wofür sie taugt. Nicht verwendete Fundstellen kommen NICHT rein.
5. **Verifizierte Quellen werden im Artikel inline verlinkt.** Jede
   namentlich verwendete Tier-1/2-Faktenquelle bekommt einen Inline-Link
   `[Text](URL)` auf genau die hier hinterlegte, im selben Lauf geprüfte
   URL. Linkziel muss **öffentlich lesbar** sein (kein Login/CAPTCHA) —
   z. B. dejure/NRWE statt openJur. Tier 3 wird nie verlinkt. (Pipeline
   öffnet externe Links automatisch in neuem Tab.)

## Tier 1 — Primär- & Behördenquellen (Fakten-Anker)

| Quelle | Themengebiet | Zugriff | Notizen |
|---|---|---|---|
| EUR-Lex, VO (EU) 2020/2081 (`eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32020R2081`) | REACH / Tätowierfarben (Anhang XVII Nr. 75) | WebFetch ✅ | Volltext der Verordnung; Grenzwerte, Kennzeichnungspflichten, Fristen. Verifiziert Juni 2026. |
| gesetze-im-internet.de | BGB (§§ 312 ff. Fernabsatz, Widerruf), DSGVO-Begleitrecht | WebFetch ✅ | Amtliche Gesetzestexte; immer Originalparagraf zitieren. |
| BMUV — Safer Tattoo (`bundesumweltministerium.de`) | Tattoo-Sicherheit, Farben | WebFetch ✅ | Eher Einstiegs-/Verbraucherseite, wenig harte Fakten — für Zahlen auf EUR-Lex/BfR ausweichen. |
| ECHA — Tattoo inks (`echa.europa.eu`) | REACH-Hintergrund | WebFetch ❌ (403, Juni 2026) | Blockt Fetcher. Inhalte stattdessen über EUR-Lex oder BfR beziehen. |
| NRWE — Rechtsprechungsdatenbank NRW (`nrwe.justiz.nrw.de`) | Amtliche Urteilsvolltexte (NRW-Gerichte) | WebFetch ✅ | Goldstandard für Urteile: Tenor, Begründung, zitierte Paragrafen im Original. Verwendet für AG Köln 137 C 162/25 (Copycat-Tattoo). URL-Schema: `/ag_koeln/j<jahr>/<az>_Urteil_<datum>.html`. |
| dejure.org (`dejure.org/dienste/vernetzung/rechtsprechung?Gericht=…&Datum=…&Aktenzeichen=…`) | Rechtsprechung: Aktenzeichen-Nachweis, Fundstellen (NJW-RR, MDR …), Volltext-Verweise (DACH) | WebFetch ✅ | **Öffentlich lesbar — kein CAPTCHA** (anders als openJur, das Fetcher/Leser per CAPTCHA blockt). Standard-**Linkziel** für Urteils-Zitate. Verwendet & verifiziert 16.06.2026 für OLG Hamm, Beschluss 05.03.2014, Az. 12 U 151/13 (mangelhaftes Tattoo). |
| Ärztekammer Nordrhein — Rheinisches Ärzteblatt (`aekno.de/aerzte/rheinisches-aerzteblatt/…`) | Tattoo-Gesundheit: Wundheilung, Risiken, Nebenwirkungen (DACH) | WebFetch ✅ | Amtliche Ärztekammer-Publikation (Tier 1, zitiert BfR-Experten). Verwendet & verifiziert 16.06.2026 für Aftercare-Artikel: Wundheilung **~6 Wochen** oberflächlich (tiefere Schichten Monate), allergische Reaktionen häufigste Nebenwirkung (rote Pigmente), 1–6 % Komplikationen. Ausgabe 4/2026, 24.03.2026 (Autorin J. Naujoks). |

## Tier 2 — Fachquellen (geprüft, mit Vorsicht)

| Quelle | Themengebiet | Zugriff | Notizen |
|---|---|---|---|
| tattoo-recht.de | Tattoo-spezifische Urteile & Rechtsfragen (DACH) | WebFetch ✅ | Anwaltsbetriebene Fachseite; Quelle für AG Dresden Az. 116 C 5571/25 (Anzahlung/Widerruf) und AG Köln 137 C 162/25 (Copycat). Doppelrolle: auch **Strom-B-Radar** — neue Beiträge = Themen-Trigger. |
| feelfarbig.com | Deutsches Tattoo-Magazin: Branche, Business, Recht (DACH) | WebFetch ✅ | Etabliertes Online-Magazin, aktiv (Stand Juni 2026), redaktionelles Profil. Zweite **Strom-B-Radar**-Quelle. Offene Themen dort notiert: Befähigungsnachweis-Debatte (Jan 2026), Instagram-Musik-Abmahnungen. Fakten trotzdem gegen Tier 1 checken. |
| mystudioflow.io/blog | DSGVO/Studio-Organisation | WebFetch ✅ | Kommerzieller SaaS-Blog (Wettbewerbsumfeld!) — nur als Sekundärquelle, Kernfakten gegen Tier 1 gegenchecken. |
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

Erhebung: zentrale Wochen-Batterie (Pipeline v2, `lib/mining/config.ts` =
Quelle der Wahrheit; Cron Mo 06:00 UTC → `mining_runs`/`topic_signals`).
Skills lesen die DB, sie scrapen nicht ad hoc.

| Quelle | Was sie liefert | Zugriff | Notizen |
|---|---|---|---|
| r/TattooArtists | Schmerzpunkte arbeitender Artists (EN, US-lastig) | Batterie `reddit-broad` (DeepAPI `/v1/scrape/reddit/posts`, top/month) | Quantitative Diskussions-Baseline, Label **Hypothese** (EN→DACH-Übertragung). Einzige scorebare Reddit-Quelle seit v2. |
| TikTok-Kommentare unter DE-Artist-Education-Content | Echte DACH-Stimmen (Fragen, Einwände, Schmerzpunkte) | Batterie `tiktok-comments` (feste Video-Liste `TIKTOK_COMMENT_VIDEOS` in `lib/mining/config.ts`) | Gemessen 29.08.: bestes DACH-Signal. **Nur qualitativ** (engagement NULL) — Kontext-Zeilen, nie gescored. |
| YouTube-Kommentare DACH-Kanäle | Insider-Stimmung arbeitender Artists (DACH) | Batterie `yt-comments` (YouTube Data API v3 `commentThreads`, `order=relevance`, kostenlos; Ziel-Videos aus der yt-search-Phase) + on demand via `lib/mining/youtube.ts` | **Nur qualitativ.** Nie die Data-API-`search` benutzen (100 Einheiten/Call) — Video-IDs kommen aus DeepAPI-yt-search. |
| Öffentliche Facebook-Gruppen | DACH-Artist-Diskussionen | Qualitativ; DACH-Artist-Gruppen sind überwiegend privat → FB-Stimmen kommen v. a. als Websuche-Snippets herein und werden so gelabelt | Kuratierte Gruppenliste = separater Discovery-Lauf (offen). |
| Web-Snippets (Foren, Fachpresse) | Was Plattform-Endpoints nicht sehen | Batterie `web` (DeepAPI `/v1/search/web`, 5 feste Query-Varianten) | **Nur qualitativ.** Survivorship-Bias einkalkulieren (Suche zeigt Gewinner). |
| Google-Suchvalidierung | Wird das Thema auch *gesucht*? (SEO-Check) | SerpApi (google.de, `SERP_API_KEY`) + DeepAPI `seo.rank`/`seo.audit` als SERP-Read — in Skill-Läufen, nicht im Cron | Validierung der Top-Themen, kein eigenes Signal. DeepAPI `seo.keyword` ist für DE tot (gemessen 29.08.). |

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
