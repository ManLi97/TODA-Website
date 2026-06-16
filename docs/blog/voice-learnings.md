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

### R2 — Radikal kürzen: Zielmarke ~600–650 Wörter (Struktur → SKILL.md)
Beide Artikel wurden um ~35–40 % gekürzt auf **~600–650 Wörter**. Das liegt
**unter** der bisherigen SKILL.md-Vorgabe „900–1500 Wörter". → In SKILL.md
eskaliert (Längen-Vorgabe ist explizit ein Struktur-Parameter). Schreib von
vornherein straffer: lieber 650 dichte Wörter als 1000 mit Hedging.

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

### R5 — Listen: Spiegelstriche mit kurzem fettem Substantiv-Label, ~4 Punkte
Lange nummerierte Prozesse (5–6 Punkte, je 2–3 Sätze) werden zu
Spiegelstrich-Listen mit knappem **Label:**-Einstieg, gedeckelt bei ~4.
- „1. **Briefing schriftlich, immer.** …" → „- **Alles schriftlich:** …"
- „Sag laut, dass Nein nichts kostet" → „- **Mut zur Lücke:** …"
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

### R8 — TODA: genau EINE Erwähnung, selbst-ironisch/zwinkernd
Tomek konsolidiert auf **eine** Stelle und rahmt sie augenzwinkernd.
- zwei Erwähnungen (AGB-PDF + Widget) → eine: „Kurze Schleichwerbung: Deine AGB schickt TODA immer automatisch für dich mit … 🤓"
- explizit „TODA-Anfrage-Widget" → softer „(wie das von uns entwickelte Widget)"
- → Im Zweifel **eine** Erwähnung, lieber zu dezent als zu werblich. (TODA-Mention-Dichte → auch SKILL.md-relevant.)

### R9 — Emojis: sparsam (0–2), nur an Aufheller-/Zwinker-Beats
Screenshot-Artikel: **✅** (positive Wendung „anders rum gilt das genauso ✅")
+ **🤓** (Schleichwerbung) = 2. Studio-Lächeln-Artikel (ernster/earnest Ton):
**0** Emojis. → Emoji nur, wo der Beat wirklich positiv/zwinkernd ist; nie auf
ernsten Rechts-/Schmerz-Passagen sprenkeln.

### R10 — Signatur-Schluss „… was wirklich zählt: Deine Kunst."
Beide Artikel enden (von Tomek beibehalten) auf die Wendung „So bleibt mehr
Zeit für das, was wirklich zählt: **Deine Kunst.**" → als wiederkehrende
Schluss-Signatur einsetzen.

## Sonstige Feedback-Signale

- **16.06.2026 — DE-Disclaimer entfernt, EN/ES behalten (KLÄREN):** Beide
  veröffentlichten **DE**-Fassungen haben den kursiven „keine
  Rechtsberatung"-Schluss **verloren**; die (unverändert übernommenen)
  EN/ES-Fassungen haben ihn. Das widerspricht harter Redaktionsregel #4
  (`toda-context.md`: Rechtsthemen *immer* mit Disclaimer). Zwei Lesarten:
  (a) bewusst — DE-Publikum braucht ihn nicht / wirkt als Klotz; (b)
  versehentlich beim Kürzen rausgefallen (in beiden DE). **Bis zur Klärung:
  Disclaimer in DE-Rechtsartikeln vorsichtshalber drinlassen** (harte Regel
  schlägt unklares Signal), aber kurz halten. Tomek fragen.
- **16.06.2026 — „Rubrik"-Tag + Tippfehler:** Screenshot-Artikel bekam einen
  4., kebab-case Serien-/Rubrik-Tag: `Rech-und-Kohle` (DE) / `law-and-money`
  (EN) / `derecho-y-dinero` (ES). Sieht nach einer Kolumnen-Rubrik aus →
  künftig bei Rechts-/Geld-Themen einen solchen Rubrik-Tag mitliefern. **DE
  hat einen Tippfehler: `Rech-und-Kohle` → soll `Recht-und-Kohle`.** Tomek
  beim Publish-Review nennen (Skill ändert keine bestehenden Posts).
- **11.06.2026 — Artikel gelöscht statt korrigiert:**
  `dsgvo-tattoo-studio-kundendaten` (DSGVO, Lauf 1) wurde zusammen mit
  den 3 Seed-Posts aus der DB gelöscht. Grund noch unbestätigt
  (Versehen beim Seeds-Aufräumen vs. bewusste Ablehnung). Beim
  nächsten Austausch mit Tomek klären — falls bewusst: Warum? Das
  wäre das stärkste Negativ-Signal, das wir bisher haben.

## Auswertungs-Log

| Artikel | Original-Snapshot | Ausgewertet am | Ergebnis |
|---|---|---|---|
| copycat-tattoo-urteil-urheberrecht (→ veröffentlicht als `screenshot-roulette-…`) | ✅ | 16.06.2026 | **ausgewertet** → R1–R10. DE 994→607 W (−39 %), retitelt, Tabelle + Miturheber-Sektion gestrichen, 1 TODA-Mention, ✅/🤓. |
| erwartungsmanagement-tattoo-kunden (→ veröffentlicht als `…laecheln-im-studio…`) | ✅ | 16.06.2026 | **ausgewertet** → R1–R10. DE 958→636 W (−34 %), retitelt, „Wenn es knallt"-Sektion gestrichen, TODA-Mention entschärft. |
| screenshot-roulette EN/ES + studio-lächeln EN/ES | ✅ | 16.06.2026 | **unverändert veröffentlicht** — kein Korrektursignal (Übersetzungen 1:1 übernommen). |
| tattoo-anzahlung-no-shows-recht | ✅ | — | Draft, wartet auf Publish |
| reach-taetowierfarben-erklaert | ✅ | — | Draft, wartet auf Publish |
| dsgvo-tattoo-studio-kundendaten | ✅ (rekonstruiert) | — | gelöscht, siehe oben |
