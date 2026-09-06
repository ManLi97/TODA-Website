# Qualitäts-Rubrik Community-Puls v3 (Testlauf-Loop, Entwurf 06.09.2026)

Zweck: nach jedem Testlauf objektiv messen, ob die Datenlage „breit, aktuell, DACH, artist-nah und
nutzbar" ist — nicht nur „Cron grün". Bericht erzeugt `pnpm mining:sync --quality [--week]`
(SQL über mining_runs / topic_signals / topic_classifications), Ergebnis als Tabelle + JSON.

## Ebene 1 — je Slot (source_key-Präfix)

| Metrik | Definition | Schwelle (Richtwert) |
|---|---|---|
| n_raw | item_count des Runs | > 0 (0 zwei Wochen in Folge → Slot prüfen) |
| n_new | topic_signals-Zeilen des Runs (nach Dedupe) | — |
| %new | n_new / n_raw | ≥ 70 % (Snapshot-Slots yt-channels ausgenommen) |
| %DE | Anteil `language='de'` (LLM) — Fallback Regex-Heuristik | DACH-Slots ≥ 60 %; reddit-en/EN-Slots: kein Ziel |
| Ø Text | Ø Zeichen (title + body) | Kommentar-/Post-Slots ≥ 80; Reviews ≥ 60 |
| %artist | audience ∈ {artist, mixed} | ≥ 50 % (Konsumenten-Slots wie tiktok-search: ≥ 30 %) |
| %useful | signal_type ∉ {promo, other} UND audience ≠ off_topic | ≥ 50 % |
| %spam | signal_type = promo | ≤ 15 % |
| Aktualität | Anteil posted_at ≤ 14 Tage | ≥ 60 % (Reviews/FB: ≥ 30 %) |
| $/useful | Slot-Kosten (Stückpreis × n_raw) / (n_new × %useful) | ≤ 0,05 $ |

## Ebene 2 — gesamt je Woche

| Metrik | Schwelle |
|---|---|
| Nützliche DACH-Zeilen (de + useful) | ≥ 300 |
| Cluster mit Trend-Gate (n ≥ 3) über ≥ 2 Quellen | ≥ 5 |
| Fragen (signal_type=question, de) | ≥ 40 |
| Beschwerden + Wünsche (de) | ≥ 40 |
| Review-Zeilen neu (alle Mitbewerber) | ≥ 3 (niedrig: Nischen-Apps) — Trend beobachten |
| Erstanbieter-Block im Digest gefüllt (IG-Kommentare, Top-Posts, GSC) | ja |
| Zitate anonym (Stichprobe 20: keine Namen/Handles/Studios) | 20/20 |
| Identitätsfelder in metrics | 0 |
| LLM-Handprüfung (15 Zeilen: language, audience, cluster, signal_type, quote) | ≥ 13/15 |
| Digest: lesbar, keine Mitbewerber-Namen neben Beschwerden, evidence_ids auflösbar | ja |
| Kosten Wochenlauf gesamt | Bericht (kein Gate; Tomek: Qualität vor Kosten) |

## Ebene 3 — Delta-Fähigkeit (ab Lauf 2)

- Anteil neuer external_ids je Slot gegenüber Vorlauf ≥ 70 % (außer yt-channels).
- Cluster-Delta berechenbar (pulse_cluster_weekly liefert ≥ 2 Wochen).

## Loop-Protokoll

1. `--dry-cost` → Summe der Holds notieren (Spend-Ledger).
2. Lauf (voll oder `--source`), dann `--enrich`, `--digest`.
3. `--quality` → Tabelle in den Loop-Bericht; jede rote Zelle bekommt eine Ursache + Maßnahme
   (Query, Cap, Filter, Prompt, Slot streichen).
4. Änderung in `lib/mining/config.ts` / Prompt (prompt_version bump) → Lauf 2 nur geänderte Slots.
5. Spend-Ledger fortschreiben; bei 40 $: Stopp, Bericht, Empfehlung.
