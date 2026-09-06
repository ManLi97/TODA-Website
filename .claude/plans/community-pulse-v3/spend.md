# Spend-Ledger — Community-Puls v3 (Mandat Tomek 06.09.2026: max 40 $ kumuliert, dann Stopp + Rückfrage)

Zählweise: alles ab dem Mandat (06.09. ~19:30) — DeepAPI-Debits (Delta `/v1/balance`) + Anthropic-Tokens × Preis
(Opus 5: 5 $/M in, 25 $/M out, Cache-Write 6,25 $/M, Cache-Read 0,50 $/M) + SerpApi-Suchen (Free-Plan, 0 $, Quota 250/Monat).
DeepAPI-Guthaben vor Aufladung: 8,93 $ (18:xx). Nach Aufladung + FB-Batch 1: ≈ 46,90 $ (Agent-Report).

| # | Zeitpunkt | Aktion | DeepAPI $ | Anthropic $ | kumuliert $ | Beleg |
|---|---|---|---|---|---|---|
| 1 | 06.09. ~20:00 | FB-Gruppen-Recherche Batch 1 (23 web-search + 12 groups à 5 Posts) | 1,22 | 0 | 1,22 | Agent-Report (0,345 + 0,875) |
| 2 | 06.09. ~20:10–20:35 | IG-Account-Recherche (36 web-search, 37 Profile, 18 posts, 2 comments) | ≈1,30 | 0 | — | Agent-Report (1,16 settled + ≤0,35 offen) |
| 3 | 06.09. ~20:25 | FB-Gruppen-Recherche Batch 2 (7 groups, 3 lesbar) | 0,26 | 0 | ≈2,80 | Agent-Report; Balance danach 45,83 $ |
| 4 | 06.09. 17:10 UTC | Build-Session Start: `GET /v1/balance` = 45,835293 $ | 0 | 0 | ≈2,80 | balance.sh |
| 5 | 06.09. 17:10–18:30 UTC | Kontrakt-Pins: capabilities (13), openapi.json, 1 dryRun, `--dry-cost` (Phase 1 = 9,815 $ Holds), Apple-RSS/Play-Fetches | 0 (alles frei) | 0 | ≈2,80 | dryRun-Envelopes `debitMicrousd 0` |
| 6 | 06.09. ~17:40 UTC | SerpApi-Shape-Pins: 2 Suchen (google_trends, google) | 0 | 0 | ≈2,80 | account.json: 248/250 übrig |

Regel: vor jedem bezahlten Lauf `--dry-cost`; nach jedem Lauf `pnpm mining:sync --balance` (frei) → Zeile hier.

Stand nach Build-Phase (06.09. ~18:30 UTC): DeepAPI-Balance 45,84 $ (unverändert); kumuliert ≈ 2,80 $ von 40 $ → Rest ≈ 37 $.
Erwartung Testlauf 1 (voll): DeepAPI ≤ 12,10 $ (Holds; Debits meist darunter) + Anthropic ≈ 6–10 $ → nach Lauf 1 ≈ 18–25 $ kumuliert.
