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

*(noch leer — füllt sich mit dem ersten veröffentlichten Artikel)*

## Sonstige Feedback-Signale

- **11.06.2026 — Artikel gelöscht statt korrigiert:**
  `dsgvo-tattoo-studio-kundendaten` (DSGVO, Lauf 1) wurde zusammen mit
  den 3 Seed-Posts aus der DB gelöscht. Grund noch unbestätigt
  (Versehen beim Seeds-Aufräumen vs. bewusste Ablehnung). Beim
  nächsten Austausch mit Tomek klären — falls bewusst: Warum? Das
  wäre das stärkste Negativ-Signal, das wir bisher haben.

## Auswertungs-Log

| Artikel | Original-Snapshot | Ausgewertet am | Ergebnis |
|---|---|---|---|
| tattoo-anzahlung-no-shows-recht | ✅ | — | wartet auf Publish |
| reach-taetowierfarben-erklaert | ✅ | — | wartet auf Publish |
| dsgvo-tattoo-studio-kundendaten | ✅ (rekonstruiert) | — | gelöscht, siehe oben |
| copycat-tattoo-urteil-urheberrecht | ✅ | — | wartet auf Publish |
| erwartungsmanagement-tattoo-kunden | ✅ | — | wartet auf Publish |
