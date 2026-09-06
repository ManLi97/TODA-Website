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
| 7 | 06.09. 18:04–18:12 UTC | Testlauf 1 (voll): Phase 1 + Phase 2, 77 Runs, 1251 neue Zeilen | 6,15 (45,835 → 39,686) | 0 | ≈8,95 | run1-battery.log, `--balance` |
| 8 | 06.09. 18:16 UTC | E4-Beweis `reviews/apple/1526690381/gb --fresh` + Heal `ig-hashtags/taetowierer` (Replay) | 0 | 0 | ≈8,95 | frei / idempotent |
| 9 | 06.09. 18:17 UTC | Enrich 50 Zeilen (v3.0, 2 Calls, 9,7k in / 8,1k out, Cache 3,4k) | 0 | 0,27 | ≈9,22 | enrich-50.log |
| 10 | 06.09. 18:19–18:27 UTC | Reclassify v3.0→v3.1, 1000 Zeilen (≈ 40 Calls) bis Anthropic-Guthaben leer | 0 | ≈5,5 (Schätzung) | ≈14,7 | enrich-full.log (400 credit balance too low) |
| 11 | 06.09. 18:21 UTC | Kette E2E lokal (Batterie + Comments als Replay) | 0 (39,686 unverändert) | 0 | ≈14,7 | pulse_jobs |
| 12 | 06.09. 20:24–20:40 UTC | Rest-Enrich 897 Zeilen v3.1 (Tomek, nach Top-up) | 0 | 4,82 | ≈19,5 | Task-Output (classified 897, remaining 0) |
| 13 | 06.09. 20:41–21:05 UTC | Digest: 2 Fehlversuche (Grammar-Limit / Truncation, ≈ 0,6 geschätzt) + Erfolg 1,14 | 0 | ≈1,7 | ≈21,3 | digest.log, digest2.log, pulse_digests.cost_usd |

Regel: vor jedem bezahlten Lauf `--dry-cost`; nach jedem Lauf `pnpm mining:sync --balance` (frei) → Zeile hier.

Stand 06.09. ~21:10 UTC: DeepAPI-Balance 39,69 $; kumuliert ≈ 21,3 $ von 40 $ → Rest ≈ 18,7 $. Lauf 2 (geänderte Slots: yt-search ×5 + tiktok-search ×2 mit neuem Body-Hash ≈ 4,5 $, Kommentare ≈ 1 $, Enrich neue Zeilen ≈ 1,5 $, Digest ≈ 1,2 $) ≈ 8 $ → erwartet ≈ 29 $.
