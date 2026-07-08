---
name: artist-story
description: Verwandelt Interview-Material eines echten Tattoo Artists (Transkript, Voice-Memo, Fragebogen-Antworten) in ein personenzentriertes „Artist Story"-Porträt als Draft im Supabase-Blog-CMS. Use when asked to write an artist portrait (/artist-story <material>) — Outreach und Interview bleiben Menschenarbeit, dieser Skill startet erst mit vorliegendem Material. Hartes Artist-Freigabe-Gate; TODA ist im Text keine Figur. Teilt den Blog-Spine (Voice, Lern-Loop, CMS) mit /blog-article.
---

# /artist-story — Porträts echter Artists („Artist Stories")

**Schwester-Skill von `/blog-article`.** Gleicher Lern-Loop, gleiches CMS,
**publiziert nie**. Der Unterschied: Die Quelle ist ein **Mensch** — sein
Interview-Material, seine Geschichte, seine Stimme. Der Text gehört dem
Artist; TODA liefert Handwerk, Bühne und Reichweite.

**Warum dieses Format** (Marketing-Baukasten als Quelle): personenzentriert
nach `language/testimonials.md` (der Mensch im Zentrum, TODA Nebenfigur);
gelebter Beweis des Kern-Narrativs „Branche als Familie"
(`brand/narrative.md`); skaliert, weil authentischer Content entsteht, ohne
dass wir ihn allein produzieren — und der stärkste Distribution-Beat ist
eingebaut: der Artist teilt seine eigene Story.

## Arbeitsteilung — hart

- **Menschenarbeit (Team/Tomek):** Artist ansprechen, Vertrauen, Interview
  führen (Leitfragen: Wie bist du zum Tätowieren gekommen? Was musstest du
  durchmachen, bis Vollzeit ging? Wie sieht es heute aus, was fällt dir in
  der Branche auf?). Der Skill akquiriert **niemals** selbst.
- **Skill-Arbeit:** vorliegendes Material → Draft in TODA-Voice →
  Freigabe-Paket für den Artist → Snapshot + Report.

## Lauf 0 — Lern-Schritt (Pflicht, identisch zu `/blog-article`)

Wie `/blog-article` Lauf 0 — der Voice-Loop ist geteilt, eine veröffentlichte
Artist Story ist Stil-Lernmaterial wie jeder andere Artikel. Zusätzlich
beobachten: Was ändert Tomek (oder der Artist über Tomek) an Stories im
Vergleich zu Ratgeber-Artikeln? Story-spezifische Muster hier ins SKILL.md
eskalieren, Stilregeln nach `voice-learnings.md`.

## Lauf 1 — Intake (ohne vollständigen Intake kein Draft)

Pflichtangaben, fehlt etwas → **stoppen und von Tomek einholen**:

1. **Material:** Interview-Transkript, bereinigtes Voice-Memo-Transkript
   oder schriftliche Antworten. Der Skill arbeitet nur mit dem, was da ist.
2. **Steckbrief:** Name/Künstlername, Stadt/Region, Stil, seit wann,
   Studio-/Arbeitskontext.
3. **Verlink-Liste:** was der Artist verlinkt haben will (Instagram,
   Portfolio, Studio, Booking) — „wir verlinken dich überall" ist Teil des
   Angebots und wird großzügig eingelöst.
4. **Bestätigter Verwertungsumfang:** alle Flächen vorab benannt und vom
   Artist bestätigt (Blog + Social-Renderings + dauerhafte Verlinkung).
   Regel aus `language/testimonials.md` (Marketing-Baukasten): ohne vollen
   Umfang vorab kippt das Dankeschön in gefühlte Ausschlachtung. Liegt die
   Bestätigung nicht vor → kein Insert.

## Lauf 2 — Schreiben: die Geschichte gehört dem Artist

Kontext laden wie `/blog-article` 2.0 (`toda-context.md`,
`voice-learnings.md`, Stil-Referenz-Artikel).

- **Story-Bogen:** Herkunft → Weg (inkl. Scheiternsmomente, Durchbeißen bis
  Vollzeit) → heute → sein Blick auf die Branche. Nostalgischer Touch, wo
  der O-Ton ihn hergibt — „alte Zeiten, man half sich aus"
  (`brand/narrative.md`) ist die Folie, wird aber **nie aufgezwungen**:
  Das Narrativ muss aus dem Material kommen, nicht über es gestülpt werden.
- **Nichts erfinden — härteste Regel des Formats.** Jede biografische
  Aussage und jedes Zitat stammt aus dem Material. Lücken werden nicht
  gedichtet, sondern als **Rückfragen-Liste** in den Report geschrieben.
- **Zitate:** kurz und treu, der O-Ton des Artists trägt den Text. Kein
  Caption-/Gedächtnis-Zitat — nur aus dem Material.
- **TODA ist keine Figur im Text.** Keine Produkt-Mention, keine
  Feature-Brücke. Erwähnt der Artist TODA von sich aus, darf das als sein
  O-Ton bleiben — dezent, ohne Ausbau. (Die Plattform ist die Bühne, nicht
  der Held. Claims-Regeln aus `toda-context.md` Regel 7 gelten trotzdem.)
- **Niemand wird runtergemacht:** Erzählt der Artist von schlechten
  Erfahrungen (Studios, Kollegen), wird anonymisiert und lessons-zentriert
  erzählt — nie identifizierbare Dritte (Lehre statt Pranger,
  `strategy/content-inputs.md`).
- **Voice:** TODA-Voice, aber wärmer und ruhiger als der
  Ratgeber-Ton — das Porträt lebt von Nähe, nicht von Frechheit. R1 gilt
  (narrativer Titel gern als O-Ton-Zitat des Artists + Stakes), R5–R7 wo
  passend; **R10-Signatur optional** — der Schluss gehört dem Artist
  (Zitat oder Ausblick), nicht unserer Formel.
- **Länge:** Richtwert 650–900 Wörter (Porträts dürfen atmen); der
  Voice-Loop kalibriert.
- **Felder:** wie `/blog-article` 2.2. `seo_title` mit Künstlername +
  Stadt/Stil; Suchsprache-Regel (`toda-context.md` Regel 8) gilt.
- **Kategorie:** „Artist Stories". Existiert sie nicht in
  `blog_categories` (vorher SELECT), im Report anfordern — Kategorien sind
  admin-managed, der Skill legt keine an; bis dahin passendste bestehende
  Kategorie + Hinweis.

## Lauf 3 — Insert, Freigabe-Paket, Report

1. **Insert** wie `/blog-article` 2.3 (Draft, `published_at` NULL,
   Cover leer) + **Snapshot-Pflicht** (`docs/blog/originals/<slug>.md`,
   Registrierung im `voice-learnings.md`-Log).
2. **Artist-Freigabe-Gate (zusätzlich zum „nie publizieren"):** Der Report
   enthält eine fertige, per-Du **Freigabe-Nachricht an den Artist** —
   Story-Text (oder Review-Weg), Verwertungsumfang noch einmal benannt,
   klare Frage nach dem Go, Hinweis „ohne dein Go geht nichts raus, du
   änderst, was du willst". Publish erst, nachdem Tomek das dokumentierte
   Go hat; ohne Go bleibt die Story für immer Draft. Volle Kontrolle über
   die Außenwirkung liegt beim Artist — das ist Teil des Versprechens.
3. **Report an Tomek:** Titel, Review-Link, Rückfragen-Liste (fehlende
   Fakten), die Freigabe-Nachricht, Verlink-Liste (eingelöst?), plus
   **Distribution-Ausweis**: 2–3 Social-Hook-Zeilen **und** ein
   Share-Paket-Vorschlag für den Artist selbst (sein Share an seine
   Follower ist der stärkste Beat des Formats — ihm so leicht wie möglich
   machen).

## Harte Regeln

- Alle Spine-Regeln aus `/blog-article` gelten (nie publizieren, nie fremde
  Posts ändern/löschen, Slug-Kollision → neuer Slug, eine Sprache pro Lauf
  = `de`, Wissensdokumente sind Teil des Deliverables).
- **Nichts erfinden** — nur Material; Lücken → Rückfragen, nie Dichtung.
- **Kein Insert ohne bestätigten Verwertungsumfang.**
- **Kein Publish ohne dokumentiertes Artist-Go** (Gate liegt bei Tomek).
- **Keine Produkt-Werbung im Text**; keine identifizierbaren Dritten in
  negativen Passagen.
- Der Skill akquiriert keine Artists und schreibt niemanden an.
