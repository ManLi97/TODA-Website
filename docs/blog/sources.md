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

## Tier 2 — Fachquellen (geprüft, mit Vorsicht)

| Quelle | Themengebiet | Zugriff | Notizen |
|---|---|---|---|
| tattoo-recht.de | Tattoo-spezifische Urteile & Rechtsfragen (DACH) | WebFetch ✅ | Anwaltsbetriebene Fachseite; Quelle für AG Dresden Az. 116 C 5571/25 (Anzahlung/Widerruf) und AG Köln 137 C 162/25 (Copycat). Doppelrolle: auch **Strom-B-Radar** — neue Beiträge = Themen-Trigger. |
| feelfarbig.com | Deutsches Tattoo-Magazin: Branche, Business, Recht (DACH) | WebFetch ✅ | Etabliertes Online-Magazin, aktiv (Stand Juni 2026), redaktionelles Profil. Zweite **Strom-B-Radar**-Quelle. Offene Themen dort notiert: Befähigungsnachweis-Debatte (Jan 2026), Instagram-Musik-Abmahnungen. Fakten trotzdem gegen Tier 1 checken. |
| mystudioflow.io/blog | DSGVO/Studio-Organisation | WebFetch ✅ | Kommerzieller SaaS-Blog (Wettbewerbsumfeld!) — nur als Sekundärquelle, Kernfakten gegen Tier 1 gegenchecken. |
| juraexamen.info | Urteilsbesprechungen (juristische Ausbildungsseite) | WebFetch ✅ | Fundierte, paragrafengenaue Fallbesprechungen. Verwendet für OLG Hamm 12 U 151/13 (mangelhaftes Tattoo: Werkvertrag § 631 BGB, Unzumutbarkeit der Nachbesserung, Schmerzensgeld). |

## Neue Kanäle aufnehmen (Aufnahme-Protokoll)

Jeder Kandidat (Subreddit, YouTube-Kanal, TikTok-Hashtag, Forum …)
durchläuft vor Aufnahme genau einen **Test-Scrape** und wird entlang
dreier Fragen bewertet:

1. **Diskussionsanteil:** Wie viele der Top-Posts/Kommentare sind echte
   Diskussion (Schmerzpunkte, Fragen, Debatten) statt Showcase/Lob?
   Richtwert: < 20 % Diskussion → raus.
2. **Zielgruppen-Fit:** Sprechen dort Solo Artists (oder deren
   Endkund:innen)? Nischen außerhalb der Zielgruppe → raus, egal wie
   aktiv.
3. **Scoring-Tauglichkeit:** Tragen Engagement-Zahlen (Votes,
   Kommentare)? Wenn ja → quantitativ (fließt in Cluster-Scores);
   wenn nein, aber inhaltlich wertvoll → **nur qualitativ** (Stimmung,
   kein Scoring).

Verdikt (aufgenommen quantitativ / aufgenommen qualitativ / raus) wird
hier in der Tabelle bzw. unter „Bewusst ausgeschlossen" dokumentiert,
der Test-Lauf im `topic-radar.md`. Wackelkandidaten fliegen nach zwei
ertraglosen Läufen wieder raus.

## Tier 3 — Community-Signal (nur Themenfindung & Stimmung)

| Quelle | Was sie liefert | Zugriff | Notizen |
|---|---|---|---|
| r/TattooArtists | Schmerzpunkte arbeitender Artists (international, US-lastig) | Apify `trudax/reddit-scraper-lite` (Posts, `includeMediaLinks: true` für Upvotes/Kommentarzahl) + `clearpath/reddit-post-comments-bulk-scraper` (Kommentare einzelner Threads) | Kernquelle Strom A. |
| r/tattooadvice | Endkunden-Perspektive (was Kunden verwirrt = Content-Chance) | wie oben | Strom A, Zweitquelle. |
| Google-Suchvalidierung | Wird das Thema auch *gesucht*? (SEO-Check) | Brave Search MCP | Validierung der Top-Themen, kein eigenes Signal. |
| YouTube-Kommentare — „Honest Tattooer Podcast" (+ „The Business of Tattooing" als Reserve) | Insider-Stimmung arbeitender Artists (Shop-Ökonomie, Splits/Booth-Rent, No-Show-Frust, Fake-Experten, Übersättigung) | Apify `streamers/youtube-comments-scraper` (`startUrls` = Video-URLs, `sortCommentsBy: "TOP_COMMENTS"`, ~$0.002/Kommentar, schnell & stabil) | Getestet 11.06.2026 (115 Kommentare / 4 Business-Episoden): **nur qualitativ** verwenden — Vote-Zahlen zu klein fürs Scoring. Liefert O-Ton-Stimmung als Würze, fließt nicht in die Cluster-Tabelle ein. |

### Bewusst ausgeschlossen

- **r/tattoos** — Bilder-Showcase, kein Themen-Signal (Lauf Juni 2026).
- **r/sticknpokes** — reines Showcase (getestet 11.06.2026).
- **r/TattooApprentice** — fast nur Portfolio-Kritik; Azubi-Nische ist
  nicht die Solo-Artist-Zielgruppe (getestet 11.06.2026).
- **Instagram-Kommentare** — 90 % Emojis/Lob, kaum Schmerzpunkt-Signal,
  hoher Aufwand. Für Stil-Trends später evtl. relevant.
- **Facebook-Gruppen (DACH)** — bestes Signal, aber privat und
  scraping-rechtlich heikel.
- **Apify-Actors, die nicht funktionieren:** `khadinakbar/reddit-posts-comments-scraper`
  (403s), `apify/rag-web-browser` auf reddit.com (geblockt).
