# Plan: Google-SEO-Infrastruktur + Endkunden-Strang im Blog-Skill

Pfad: `.claude/plans/seo-google-infra-endkunden-strang.md` — freigegeben von Tomek am 2026-09-12 (Session 01WSLHJrjAt3bLarc3EAyngq).
Kickoff-Zeile für die Implementierungs-Session: siehe §8 (wird als Datei + `pbcopy` übergeben).

---

## §0 Execution Brief

- **Repo:** `/Users/harvestflow/Developer/toda/TODA-Website` (Next.js 15, pnpm). Branch `staging` (ist `origin/staging` um 3 Commits voraus; Arbeitsbaum sauber am 12.09.2026).
- **Session-Form: Begleitsession.** Tomek ist anwesend. Der Plan wechselt zwischen **Agent-Schritten** (Scripts, Code, Belege) und **Tomek-Schritten** (Klicks in Oberflächen, die keine API haben). Jeder Tomek-Schritt ist als „🙋 Tomek" markiert, trägt den exakten Klickpfad, sagt, welchen Screenshot/Wert Tomek zurückgibt, und der Agent **prüft das Ergebnis mit einem eigenen Beleg**, bevor er weitermacht. Nie „done" ohne Beleg.
- **Preconditions (Session-Start prüfen):** `git status -sb` sauber auf `staging`; `gcloud auth list` zeigt `toda.tattoo.solutions@gmail.com` (aktiv) und `symantzyktom@gmail.com`; `vercel whoami` = `tomeksy`, Team `toda-solutions`; `~/.toda-secrets/gsc-sa-toda-gsc-snap.json` existiert; `.env.local` enthält `SERPAPI_API_KEY` (gesetzt seit 12.09.).
- **Ausführung:** Auto Mode. Teil A (Infra) vor Teil B (Code). Zwischen A und B ist ein Checkpoint: wird der Kontext knapp, schreibt der Agent eine Handoff-Zeile für eine frische Session (§8) statt zu komprimieren.

### Plan-Fidelity (bindend)
- **Evidence beats plan.** Widerspricht die Realität einer Plan-Annahme (Datei-Anker, UI-Label, API-Antwort, DNS-Stand), wird die Realität dokumentiert und der Schritt angepasst — nie blind durchgearbeitet, nie stillschweigend uminterpretiert.
- **Bindend:** Scope (§2–§6), Reihenfolge der Sicherheits-Schritte in A2/A3 (Records vor Nameserver-Wechsel; neuer Schlüssel in Prod verifiziert, bevor der alte Service-Account entfernt wird), 🔴-Gates, Stop-Regeln. **Richtwert:** Formulierungen der Doku-Texte, Namen der neuen Kategorie-Übersetzungen (en/es), Sort-Order.
- Jeden zitierten `file:line`-Anker vor Gebrauch gegenprüfen (`sed -n`).
- **Hard rules gelten:** nie `.env.local` oder Schlüsseldateien anzeigen; Secrets nur in-process aus Dateien; kein `git push` außer `git push origin staging` (grün); Merge nach `main`, Push `main`, `vercel deploy --prod` und jede Vercel-Env-Änderung sind **🔴 Einzel-Gates** mit Tomeks Go.
- Ende jedes verifizierten Blocks: `/commit` (Conventional Commit mit NOTE-Block).

---

## §1 Kontext (warum)

**Ausgangslage (Belege vom 08.–12.09.2026, Session 01WSLHJrjAt3bLarc3EAyngq):**

1. **Der deutsche Blog war für Google unsichtbar.** URL-Inspection 08.09.: 0 von 8 DE-Artikeln indexiert (6 „URL is unknown to Google"), EN/ES-Zwillinge alle indexiert. Am 12.09.: 7 von 11 DE-Artikeln indexiert (Google folgt seit dem 06.09. den 308-Redirects des URL-Vertrags), 2 noch unbekannt (`/de/blog/tattoo-anzahlung-widerrufsrecht-online-buchung`, `/de/blog/zwischen-tattoo-nadel-knochen-und-algorithmus`), 1 „Crawled – currently not indexed" (`…/screenshot-roulette-…`). **Die Sitemap wurde von Google zuletzt am 08.07.2026 geladen (30 URLs; live sind 37).** Technisch ist die Seite sauber (Lighthouse mobil: Performance 95, SEO 100; Canonical/hreflang/robots grün).
2. **GSC-Infrastruktur hängt an Tomeks Privatkonto.** Service-Account `gsc-snapshot@toda-gsc-snap.iam.gserviceaccount.com`, Projekt `toda-gsc-snap` (Nummer 13234811121, angelegt 12.07.2026, ohne Organisation) gehört `symantzyktom@gmail.com`. Der SA ist auf `sc-domain:todasolutions.com` **siteFullUser**. Das TODA-Konto `toda.tattoo.solutions@gmail.com` hat **keinen** Zugriff auf die Property (Screenshot 12.09.: „Keine passende Property"). Zwei `google-site-verification`-TXT liegen im DNS (zwei verifizierte Inhaber, vermutlich `tom@harvestflow.ai` + Privatkonto).
3. **DNS liegt bei Netlify, Netlify ist nicht mehr Stack.** Registrar Name.com; NS `dns1–4.p05.nsone.net` (Netlify DNS); Web läuft bereits auf Vercel (Projekt `toda-website`, Team `toda-solutions`, Domain im Projekt verifiziert; `server: Vercel`); Mail über Zoho EU (MX ×3, SPF, `zmail._domainkey` DKIM, `zoho-verification`), **fünf aktiv genutzte Postfächer** (tom, manuel, sandra, lucas, agent@todasolutions.com). DMARC fehlt.
4. **Community-Puls zeigt Endkunden-Nachfrage auf Google.** Serp-Zeilen W36: 98 von 129 `endkunde`; W37: 62 von 75. Cluster W36 endkundenlastig: pricing 65:8, expectation-vs-result 61:3, aftercare 11:1, booking-flow 22:15, cancellations 7:1, deposits 4:2. Google Trends (DE, 12 Monate): „tattoo preise" 55,7 / „was kostet ein tattoo" 54,4 gegen ≤ 1,2 für alle Artist-Begriffe. Der Skill schließt Endkunden-Signale heute als Discovery-Beleg aus (`SKILL.md:104`, Zielgruppen-Gate `:142`, `toda-context.md:158`).

**Tomeks Entscheidungen (12.09.2026):**
- Endkunden-Artikel sind eine **Sonderregel für Google-SEO**, keine Positionierungsänderung. `marketing/brand/positioning.md` bleibt **unverändert** („kein zweiter ICP" gilt weiter).
- **Gate statt Default:** Endkunden-Version nur, wenn der Puls einen endkundenlastigen, blog-beantwortbaren Cluster zeigt. **Nie** als Zwilling eines Artist-Artikels — das Endkunden-Thema kommt **zu 100 % aus dem Community-Puls** (eigene Shortlist), nicht aus bestehenden Artist-Artikeln.
- Neue Blog-Kategorie für Endkunden-Artikel.
- Pilot vor Regeln: Skill minimal erweitern, ersten Endkunden-Artikel schreiben, Regeln aus Tomeks Korrekturen lernen (eigener Regelraum, nie in R1–R14).
- Keine neuen SEO-Tools (Semrush/Mangools/DataForSEO) — Re-Evaluations-Auslöser: DE-Artikel durchgängig indexiert + 4 Wochen GSC-Suchanfragen + 3 Endkunden-Artikel.
- Google-Identität: alles TODA-seitige unter `toda.tattoo.solutions@gmail.com`, **ohne** Google-Cloud-Organisation. DNS von Netlify nach Vercel.

**Intended outcome:** Google findet jeden neuen Artikel per Sitemap-Submit nach Publish; GSC/Cloud/DNS hängen an TODA-Konten; der Blog-Skill kann einen Endkunden-Strang aus dem Puls bedienen; erster Endkunden-Pilot als Kickoff.

---

## §2 Teil A1 — Sitemap-Submit per API + Indexierung beantragen

**Warum zuerst:** billigster Hebel, wirkt sofort, und der bestehende SA ist bereits Vollnutzer.

### A1.1 Agent — Scope + `submitSitemap()` im GSC-Client
- `lib/gsc/client.ts:17` — `const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";` → auf `https://www.googleapis.com/auth/webmasters` (Vollscope; Lese-Endpunkte funktionieren damit weiter). Kommentar über `inspectUrl` (`:64-66`, „readonly scope is sufficient") anpassen.
- Neue exportierte Funktion nach `listSitemaps` (`:81-87`), gleiche Bauart:
  ```ts
  // Submit (or re-submit) a sitemap for a property. Needs the full webmasters
  // scope and the SA as Full user/Owner of the property. Idempotent.
  export function sitemapSubmitUrl(siteUrl: string, feedpath: string): string {
    return `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`;
  }
  export async function submitSitemap(siteUrl: string, feedpath: string): Promise<void> {
    await getClient().request({ url: sitemapSubmitUrl(siteUrl, feedpath), method: "PUT" });
  }
  ```
  (PUT ohne Body, leere Antwort, Pfadparameter per `encodeURIComponent` — §7 Item 1 verifiziert. `request()` wirft bei Nicht-2xx, das reicht als Fehlerpfad.)
- `lib/gsc/types.ts` unverändert.
- **Bindend:** `sitemapSubmitUrl()` lebt in einem neuen, `server-only`-freien Modul `lib/gsc/urls.ts` (`client.ts` importiert `server-only` und ist damit im Node-Test-Runner nicht ladbar); `client.ts` importiert die Funktion von dort.
- Test `tests/gsc-submit.test.ts` (Muster: `tests/alternates.test.ts` — `node:test` + `node:assert/strict`, **relative Imports** wie `../lib/gsc/urls`; Runner `pnpm test` = `tsx --test tests/*.test.ts`): `sitemapSubmitUrl("sc-domain:todasolutions.com", "https://www.todasolutions.com/sitemap.xml")` ergibt genau `https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Atodasolutions.com/sitemaps/https%3A%2F%2Fwww.todasolutions.com%2Fsitemap.xml`.

### A1.2 Agent — Script `pnpm gsc:submit`
- Neu `scripts/gsc-submit-sitemap.ts` nach dem Muster von `scripts/gsc-inspect.ts` (Kopf-Kommentar, `process.loadEnvFile(".env.local")` in try/catch, Env `GSC_SITE_URL` + `GSC_SA_KEY`/`GSC_SA_KEY_FILE`, nichts Geheimes ausgeben): ruft `submitSitemap(GSC_SITE_URL, `${SITE_URL}/sitemap.xml`)` (`SITE_URL` aus `@/lib/site`), danach `listSitemaps` und druckt `path, lastSubmitted, lastDownloaded, isPending, errors, warnings` vorher/nachher.
- `package.json:16` daneben: `"gsc:submit": "tsx --conditions=react-server scripts/gsc-submit-sitemap.ts"`.
- **Ausführen (Beleg):** `GSC_SITE_URL=sc-domain:todasolutions.com GSC_SA_KEY_FILE="$HOME/.toda-secrets/gsc-sa-toda-gsc-snap.json" pnpm gsc:submit` → `lastSubmitted` springt auf heute. Ausgabe in den Report.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm format:check` grün → `/commit` (`feat(gsc): sitemap submit via API + pnpm gsc:submit`).

### A1.3 🙋 Tomek — Indexierung für 2 URLs beantragen (nur Oberfläche; Google nennt ein Tageslimit ohne Zahl, §7 Item 5)
- Search Console, Property `todasolutions.com` (Domain), oben die **URL-Prüfung**-Leiste: URL einfügen → Enter → Ergebnis abwarten → **„Indexierung beantragen"**. Nacheinander für
  1. `https://www.todasolutions.com/de/blog/tattoo-anzahlung-widerrufsrecht-online-buchung`
  2. `https://www.todasolutions.com/de/blog/zwischen-tattoo-nadel-knochen-und-algorithmus`
- Zurück an den Agenten: Screenshot der Bestätigung („Indexierung beantragt").
- Agent-Beleg: `pnpm gsc:inspect` erneut (Ergebnis wird erst nach Tagen sichtbar — der Beleg hier ist der Screenshot; der Inspection-Lauf gehört in den Abschlussreport von Teil B).

---

## §3 Teil A2 — DNS von Netlify nach Vercel (Mail-sicher)

**Stop-Regel:** Der Nameserver-Wechsel (A2.5) passiert erst, wenn **jeder** Netlify-Record bei Vercel angelegt und per `dig @ns1.vercel-dns.com` bestätigt ist. Bei Zweifel: nicht wechseln, Tomek fragen.

### A2.1 🙋 Tomek — Netlify-Export lesbar machen
Die Datei `~/Downloads/todasolutions.com (DNS Records).csv` ist für den Agenten nicht lesbar (macOS-Sandbox auf `~/Downloads`). Tomek tippt im Prompt:
```
! cp ~/Downloads/todasolutions.com\ \(DNS\ Records\).csv ~/Developer/toda/TODA-Website/reports/dns-netlify-export.csv
```
(`reports/` ist gitignored.) Agent liest die Datei, baut eine Inventar-Tabelle **Name | Typ | Wert | TTL | Prio** und gleicht sie mit dem öffentlichen DNS-Stand vom 12.09. ab (Erwartung mindestens: apex A → Vercel; `www` CNAME `c4603b983e27b057.vercel-dns-017.com`; MX `mx.zoho.eu` 10, `mx2.zoho.eu` 20, `mx3.zoho.eu` 50; TXT apex: `v=spf1 include:zohomail.eu ~all`, `zoho-verification=zb55097599.zmverify.zoho.eu`, 2× `google-site-verification=…`; TXT `zmail._domainkey` DKIM). **Netlify-eigene Records** (NETLIFY/NETLIFYv6-Typen für die alte Site) werden **nicht** übernommen. Unbekannte Records → Tomek fragen, nie raten.

### A2.2 Agent — Domain auf Team-Ebene bei Vercel + Records anlegen
- Heute: Domain ist dem Projekt `toda-website` zugewiesen (API `GET /v9/projects/…/domains`: `todasolutions.com` + `www` verified), aber `vercel dns ls todasolutions.com` antwortet „You don't have permission to list the domain record" und `vercel domains ls` listet sie nicht → sie ist nicht unter dem Team-Scope registriert (§7 Item 4).
- Schritt 1: `vercel domains add todasolutions.com toda-website` (Team `toda-solutions`). Danach `vercel domains inspect todasolutions.com` → „Intended Nameservers" `ns1.vercel-dns.com` / `ns2.vercel-dns.com` (Belegquelle: `toda.ink` zeigt genau diese) und `vercel dns ls todasolutions.com` antwortet (ggf. leer).
- **Fallback 🙋 Tomek**, falls `dns ls` weiter verweigert: Vercel-Dashboard → Team `TODA` → **Domains** → `todasolutions.com` → **DNS Records** → „Enable Vercel DNS" (§7 Item 4). Screenshot zurück.
- Schritt 2: Script `scripts/dns-vercel-migrate.sh` (idempotent, im Repo unter `scripts/`, keine Secrets — der Vercel-CLI-Login ist die Auth): liest `reports/dns-netlify-export.csv`, überspringt Netlify-eigene Record-Typen und die Web-Records (Apex/`www` legt Vercel automatisch an — nur nachlegen, wenn `dns ls` sie nach Schritt 1 nicht zeigt), legt je verbleibendem Record an — **exakte Syntax (§7 Item 4):**
  ```
  vercel dns add todasolutions.com '@' MX mx.zoho.eu 10        # analog mx2 20, mx3 50 — Werte aus dem Export
  vercel dns add todasolutions.com '@' TXT 'v=spf1 include:zohomail.eu ~all'
  vercel dns add todasolutions.com '@' TXT 'zoho-verification=…'
  vercel dns add todasolutions.com '@' TXT 'google-site-verification=…'   # beide Tokens
  vercel dns add todasolutions.com zmail._domainkey TXT '<DKIM-Wert aus dem Export>'
  vercel dns add todasolutions.com _dmarc TXT 'v=DMARC1; p=none; rua=mailto:tom@todasolutions.com'
  ```
  TXT-Werte immer als **ein** quoted Argument. Vor jedem `add`: `vercel dns ls todasolutions.com` lesen und Vorhandenes überspringen. DMARC ist neu (Monitoring-only, `p=none`, ändert die Zustellung nicht).
- **Beleg:** `vercel dns ls todasolutions.com` (vollständige Liste) und für jeden Record `dig +short @ns1.vercel-dns.com <name> <TYP>` == Export-Wert (Hosts, Prioritäten, DKIM-Text zeichengenau). Tabelle in den Report. Schlägt der DKIM-TXT wegen Länge fehl (Limit undokumentiert): Stop, Tomek informieren — **nicht** ohne DKIM wechseln.
- `/commit` (`chore(dns): vercel migration script`).

### A2.3 🙋 Tomek — Nameserver bei Name.com umstellen
- name.com → **My Domains** → `todasolutions.com` → **Domain Actions → Manage Nameservers** → „Delete All" (entfernt die vier `nsone`-Einträge) → „Add Nameserver" einzeln: `ns1.vercel-dns.com`, dann `ns2.vercel-dns.com` → speichern (§7 Item 7; weicht die Oberfläche ab: Screenshot an den Agenten, nichts raten).
- Zurück: Screenshot der gespeicherten Nameserver.

### A2.4 Agent — Propagation + Mail-Beleg
- Alle 10–15 min: `dig +short NS todasolutions.com` bis beide `vercel-dns.com`-Server erscheinen (Name.com-TTL; meist < 1 h, Google-Resolver `dig @8.8.8.8` mitprüfen).
- Danach: `dig +short MX todasolutions.com`, `dig +short TXT todasolutions.com`, `dig +short TXT zmail._domainkey.todasolutions.com`, `curl -sI https://www.todasolutions.com/de` (`server: Vercel`, 200), `vercel domains inspect todasolutions.com` (Nameserver ✔).
- 🙋 Tomek — **Mail-Test:** eine Mail von einer externen Adresse an `tom@todasolutions.com` senden und eine von dort nach außen; beide Ankünfte bestätigen. Erst dann gilt A2 als grün.
- Statuszeile in `docs/seo/url-contract.md` §Status (`:68 ff.`) anhängen: „2026-MM-DD — DNS von Netlify (NS1) nach Vercel DNS umgezogen; Records-Inventar N, DMARC p=none ergänzt; Mail-Test ✅".

### A2.5 🙋 Tomek — Netlify aufräumen (frühestens 48 h später, außerhalb dieser Session)
- Netlify → Domains → `todasolutions.com` → DNS-Zone löschen; danach das Netlify-Konto/Team ist frei. Agent notiert es als offenen Punkt im Abschlussreport, führt es nicht aus.

---

## §4 Teil A3 — Google-Identität: TODA-Gmail als Inhaber, neuer Service-Account

**Reihenfolge ist bindend:** neuer Schlüssel in Prod verifiziert → **dann** alter SA/Privatkonto entfernen. Bis dahin laufen Cron und Scripts mit dem alten Schlüssel weiter.

### A3.1 🙋 Tomek — Property unter dem TODA-Gmail anlegen
- Im Browser als `toda.tattoo.solutions@gmail.com` in Search Console: **„Property hinzufügen"** → Typ **„Domain"** → `todasolutions.com` → Weiter. Google zeigt einen **TXT-Eintrag** `google-site-verification=<token>`. **Noch nicht auf „Bestätigen" klicken.**
- Zurück: den Token-Wert (ist kein Secret — Verifizierungs-Tokens stehen öffentlich im DNS) im Chat oder als Screenshot.

### A3.2 Agent — Token ins Vercel-DNS, Tomek bestätigt
- `vercel dns add todasolutions.com @ TXT "google-site-verification=<token>"`; Beleg `dig +short TXT todasolutions.com @ns1.vercel-dns.com | grep <token>` und gegen `8.8.8.8`.
- 🙋 Tomek: in der GSC-Ansicht **„Bestätigen"** klicken (bei „nicht gefunden" 5–10 min warten, erneut). Rückmeldung: Screenshot „Inhaberschaft bestätigt". Die Property zeigt ab jetzt die historischen Daten (Domain-Property ist dieselbe).

### A3.3 Agent — Cloud-Projekt + Service-Account unter dem TODA-Gmail (gcloud, kein Console-Klick)
Script `scripts/gcloud-gsc-setup.sh` (idempotent; jeder Schritt prüft „existiert schon?"), Konto fest `--account toda.tattoo.solutions@gmail.com`:
```
PROJECT=toda-gsc           # Projekt-ID (global eindeutig; falls vergeben: toda-gsc-2026)
SA=gsc-sync
KEY="$HOME/.toda-secrets/gsc-sa-toda-gsc-v2.json"   # NICHT gsc-sa-toda-gsc.json (0-Byte-Altlast)
gcloud projects create "$PROJECT" --name="TODA GSC" --account=toda.tattoo.solutions@gmail.com
gcloud services enable searchconsole.googleapis.com --project="$PROJECT" --account=…
gcloud iam service-accounts create "$SA" --display-name="TODA GSC sync" --project="$PROJECT" --account=…
gcloud iam service-accounts keys create "$KEY" --iam-account="$SA@$PROJECT.iam.gserviceaccount.com" --project="$PROJECT" --account=…
chmod 600 "$KEY"
```
- Dienstname belegt (§7 Item 2): `searchconsole.googleapis.com` trägt v3-Sitemaps/Search-Analytics **und** URL-Inspection; `webmasters.googleapis.com` existiert nicht. Keine Billing-Pflicht dokumentiert; der Ersteller ist Owner des Projekts (reicht für `services enable`); der SA braucht **keine** IAM-Rolle — seine Berechtigung ist der GSC-Nutzereintrag (§7 Items 1+3). Scheitert `projects create` an der Projekt-Quote des Consumer-Kontos (nicht publiziert): Stop, Tomek fragen (Alternative: SA im bestehenden `yt-comments-api-506923` anlegen — Decision-Abweichung dokumentieren).
- **Ausgabe an Tomek (kein Secret):** die SA-E-Mail `gsc-sync@<PROJECT>.iam.gserviceaccount.com`.
- Beleg: `gcloud projects describe $PROJECT`, `gcloud iam service-accounts list --project $PROJECT`, `ls -l "$KEY"` (nur Größe/Rechte).

### A3.4 🙋 Tomek — SA als Vollnutzer eintragen
- Search Console (TODA-Gmail), Property `todasolutions.com` → **Einstellungen** → **Nutzer und Berechtigungen** → **Nutzer hinzufügen** → E-Mail = SA-Adresse aus A3.3 → Berechtigung **„Uneingeschränkt"** (Full) → Hinzufügen.
- Zurück: Screenshot der Nutzerliste. (Dort sind auch die alten Einträge sichtbar: `gsc-snapshot@toda-gsc-snap…`, `symantzyktom@gmail.com`, `tom@harvestflow.ai` — **noch nichts entfernen**.)

### A3.5 Agent — neuen Schlüssel belegen
- `GSC_SITE_URL=sc-domain:todasolutions.com GSC_SA_KEY_FILE="$HOME/.toda-secrets/gsc-sa-toda-gsc-v2.json" pnpm gsc:inspect --url https://www.todasolutions.com/de` → Sitemap-Status + Inspection laufen mit dem neuen Konto. Zusätzlich `pnpm gsc:submit` mit dem neuen Schlüssel (Vollnutzer-Beleg).
- Ergebnis in den Report; erst dann weiter.

### A3.6 🔴 Agent (mit Tomeks Go) — `GSC_SA_KEY` auf Vercel rotieren
- Script `scripts/rotate-gsc-key.sh` nach dem Muster von `scripts/rotate-cron-secret.sh` (`set -euo pipefail`, `cd "$(dirname "$0")/.."`, CLI-Checks, nichts drucken): `vercel env rm GSC_SA_KEY production --yes >/dev/null 2>&1 || echo "no previous"` → `vercel env add GSC_SA_KEY production --sensitive --yes < "$KEY"` (Wert kommt per stdin aus der Datei, nie aus argv) → Verify `vercel env ls production | grep GSC_SA_KEY`. **Abweichung zum Vorbild:** `.env.local` wird **nicht** angefasst (lokal gilt weiter `GSC_SA_KEY_FILE` als Env-Prefix; `.env.local` hält keine `GSC_*`-Variablen). `GSC_SITE_URL` bleibt unverändert.
- Wirksam erst nach Redeploy (Functions backen Env beim Build) → der Deploy ist der Release-Schritt in §6.4. **Bis dahin bleibt der alte SA eingetragen.**

### A3.7 🙋 Tomek — Aufräumen (erst nach §6.5-Beleg, dass der Cron mit dem neuen Schlüssel läuft)
- GSC → Nutzer und Berechtigungen: `gsc-snapshot@toda-gsc-snap.iam.gserviceaccount.com` entfernen; `symantzyktom@gmail.com` entfernen (als Inhaber: unter „Inhaberschaft bestätigen"/Bestätigungsdetails die Inhaberschaft aufheben; der zugehörige `google-site-verification`-TXT darf danach aus dem DNS — Agent macht `vercel dns rm`, nachdem Tomek sagt, welcher Token zu welchem Konto gehört). `tom@harvestflow.ai` bleibt als zweiter Inhaber.
- Optional, sein Konto: Cloud Console als `symantzyktom@gmail.com` → Projekt `toda-gsc-snap` (Suche nach Nummer 13234811121; Tab „Alle", nicht „Zuletzt") → Löschen. Agent: alte Schlüsseldatei `gsc-sa-toda-gsc-snap.json` und die 0-Byte-Datei `gsc-sa-toda-gsc.json` erst löschen, wenn Tomek das Go gibt (🔴 Datei-Löschung).
- Memory-Notiz `gsc-url-inspection-evidence.md` + `toda-google-account.md` aktualisieren (neuer Pfad, Vollscope, Submit möglich, Projekt unter TODA-Gmail).

---

## §5 Teil B — Sitemap-Submit nach Publish + Endkunden-Strang im Skill

### B1 Agent — Sitemap-Submit nach jedem Publish
- `app/admin/(protected)/posts/actions.ts:74-107` `upsertTranslation`: nach `revalidateBlogPaths();` (`:104`) und nur bei `status === "published"`:
  ```ts
  if (status === "published") after(() => submitSitemapAfterPublish());
  ```
  `after` aus `next/server` (Next 15; Muster: `app/api/cron/*` nutzen `after()`), damit der Publish nie auf Google wartet.
- Neu `lib/gsc/submit-after-publish.ts` (server-only): liest `GSC_SITE_URL`; fehlt Env/Schlüssel → `console.warn("[gsc] sitemap not submitted: credentials missing")` und return (explizit, nicht stumm); sonst `submitSitemap(siteUrl, `${SITE_URL}/sitemap.xml`)`; Fehler → `console.error("[gsc] sitemap submit failed", message)`. Kein Throw — Publish ist wichtiger als der Ping.
- Lokaler Beleg: `pnpm dev` + Admin-Publish eines Test-Drafts ist **nicht** vorgesehen (kein Test-Publish auf prod-DB ohne Tomek). Beleg stattdessen: Unit-Test der URL-Funktion (A1.1) + Prod-Beleg nach Release (§6.5: nächster echter Publish → Vercel-Logs `[gsc]`-Zeile + `pnpm gsc:inspect` Sitemap `lastSubmitted`).
- `/commit` (`feat(blog): submit sitemap to GSC after publish`).

### B2 🙋 Tomek — Kategorie anlegen (Admin-UI ist der sanktionierte Schreibpfad)
- `https://www.todasolutions.com/admin` → **Categories** → neue Kategorie: Name DE **„Tattoo-Wissen"**, EN „Tattoo Knowledge", ES „Saber de tatuajes" (Richtwert), Slug **`tattoo-wissen`**, Sort-Order 5 (nach `toda-podcast`).
- Agent-Beleg (Read-only-MCP): `select slug, name, sort_order from blog_categories where slug='tattoo-wissen'`.

### B3 Agent — Wissens-Spine: Endkunden-Strang als Sonderregel
Alle Änderungen in `docs/blog/` + Skill; `positioning.md` bleibt unberührt.

**B3.1 `docs/blog/toda-context.md`**
- Nach „## Für wen wir schreiben — ICP & Anti-ICP" (`:28-37`) neuer Abschnitt `## Endkunden-Strang — Sonderregel für Google-SEO (seit 2026-09-12)`:
  - Was es ist: ein zweiter Artikel-Strang **nur im Blog**, weil die Google-Nachfrage der Branche (Puls-Serp-Zeilen, Trends) zu > 75 % vom Endkunden kommt. **Keine** Positionierungsänderung, kein zweiter ICP (`positioning.md` gilt unverändert); wer für Social/Brand schreibt, ignoriert diesen Abschnitt.
  - Leser: Menschen, die ein Tattoo wollen oder haben (DACH, Deutsch). Ansprache per Du, gleiche Tonalität (frech, substanziell, Insider-Perspektive **aus Artist-Sicht erklärt**). Haltung: immer zugunsten des Artists — der Artikel erklärt dem Endkunden, wie die Branche tickt und wie er einem Artist gut gegenübertritt (qualifizierte Anfrage, Anzahlung verstehen, Absage-Etikette, realistische Preis-Erwartung).
  - Themenquelle: **ausschließlich Community-Puls** (Endkunden-Shortlist, siehe SKILL.md Lauf 1); nie ein bestehender Artist-Artikel als Ausgangspunkt, nie ein Themen-Zwilling.
  - TODA-Mention: genau eine, im Frame „geführte Anfrage" aus `positioning.md` (Zeile „Ein geführtes Environment statt Selbst-Moderation"): *Viele Artists arbeiten heute mit einem Anfrage-Formular — hat deiner eins, nutz es, das ist für beide Seiten leichter.* Kein Kauf-CTA (Endkunde kauft nichts), keine Claims außerhalb `strategy/claims.md`.
  - Terminologie: Fließtext „Tattoo Artist" bleibt (Regel 8); Suchwörter „Tätowierer", „Tattoo Studio" nur in slug/seo_title/seo_description.
  - Kategorie: `tattoo-wissen`. Formate: Ratgeber und FAQ-artige Ratgeber; Fall & Recht nur, wenn Tier-1-Quelle die Endkunden-Frage trägt.
- Regel 6 (`:158-159`) ergänzen: „… Ausnahme: der Endkunden-Strang (Abschnitt oben) — eigener Regelraum, eigene Shortlist."

**B3.2 `.claude/skills/blog-article/SKILL.md`**
- **Lauf 0, Schritt 7** (`:52-56`): ergänzen — Korrekturen an Endkunden-Artikeln (Kategorie `tattoo-wissen`) werden als **E-Regeln** (`voice-learnings.md`, eigener Abschnitt) destilliert, **nie** in R1–R14; umgekehrt gelten R-Regeln für Endkunden-Artikel nur als Startpunkt, solange keine E-Regel widerspricht.
- **Lauf 1, Schritt 1** (`:64-116`): den Bullet „Endkunden-Signale (`audience = 'endkunde'`) sind Kontext, nie Discovery-Beleg" (`:104`) umformulieren zu: „… sind für den **Artist-Strang** Kontext, nie Discovery-Beleg. Für den **Endkunden-Strang** (Sonderregel, `toda-context.md`) gilt die eigene Shortlist:" + neuer Bullet **Endkunden-Shortlist**: aus `pulse_cluster_weekly` der tragenden Woche(n) die Cluster mit `n_endkunde > n_artist + n_mixed`, `trend_gate = true`, die **blog-beantwortbar** sind (nicht lokal „tätowierer <stadt>", nicht Motiv-Inspiration, nicht off_topic) → plus die Digest-`questions` mit `audience in ('endkunde','mixed')` je Cluster; Serp-Zeilen (`platform = 'serp'`, PAA-Fragen) sind hier **Discovery-Beleg**, weil sie die Google-Nachfrage direkt zeigen. Beide Shortlists (Artist / Endkunde) stehen getrennt im Radar-Eintrag. **Nie** ein Endkunden-Thema aus einem Artist-Kandidaten oder -Artikel ableiten.
- **Zielgruppen-Gate** (`:142-144`): „… gilt **je Strang**: Artist-Strang wie bisher; Endkunden-Strang besteht das Gate, wenn der Cluster endkundenlastig und blog-beantwortbar ist."
- **Schritt 5 Dedup-Check** (`:168`): zusätzlich prüfen, dass das Endkunden-Thema keinen Themen-Zwilling eines Artist-Artikels bildet (Slug/Titel/Tags beider Stränge).
- **Schritt 8 Radar-Eintrag** (`:185`): Feld „Strang: artist | endkunde" + beide Shortlists.
- **2.0 Kontext laden, Schritt 3 Stil-Referenz** (`:198-206`): für Endkunden-Artikel die 1–2 zuletzt veröffentlichten Artikel der Kategorie `tattoo-wissen` mit Snapshot (SQL analog mit `c.slug = 'tattoo-wissen'`); gibt es keine (Pilot): Schicht 1 + 2 + E-Regeln-Abschnitt (auch wenn leer).
- **2.2 Schreiben**: Unterpunkt „Endkunden-Artikel": R-Regeln gelten als Start (R2 Länge, R5 Listen, R8 genau eine Mention), Mention-Frame und Haltung aus `toda-context.md` Endkunden-Abschnitt; im Report steht „Strang: Endkunde".
- **2.3 Draft-JSON** (`:288-300`): `category_slug` = `tattoo-wissen` für den Endkunden-Strang (Kommentarzeile).
- **Frontmatter `description`** (`:3`): „… zwei Stränge (Artist / Endkunde, Sonderregel Google-SEO) …" ergänzen, damit der Trigger passt.
- **Harte Regeln** (`:346 ff.`): neuer Bullet: „Endkunden-Thema kommt nur aus der Endkunden-Shortlist des Pulses — nie als Zwilling eines Artist-Artikels."

**B3.3 `docs/blog/voice-learnings.md`**
- Nach `## Gelernte Regeln` (R-Block, endet vor `## Sonstige Feedback-Signale` `:200`) neuer Abschnitt `## E-Regeln — Endkunden-Strang (gemessen, seit 2026-09-12)` mit Einleitung: leer bis zum ersten ausgewerteten Endkunden-Artikel; R1–R14 sind Startpunkt; E-Regeln überschreiben R-Regeln nur für Endkunden-Artikel.
- Auswertungs-Log (`:281`): Spalte „Artikel" erhält für Endkunden-Artikel den Präfix `(E)` (kein Tabellenumbau).

**B3.4 `docs/blog/topic-radar.md`**
- Methode v3 (`:8 ff.`): Absatz „Zwei Stränge seit 2026-09-12" mit der Shortlist-Regel aus B3.2 (Cluster-Kriterien + Serp/PAA als Endkunden-Discovery-Beleg) und dem Zielgruppen-Gate je Strang (`:206-209` ergänzen).
- Kein Lauf-Eintrag in diesem Plan (der Pilot-Lauf schreibt seinen eigenen).

**B3.5 `docs/blog/sources.md`** — Regel-Absatz: Für Endkunden-Fragen gilt dieselbe Tier-Hierarchie; PAA-Fragen sind Themen-, nie Faktenbeleg.

- Nach allen Doku-Änderungen: `pnpm format:check` (Markdown war zuvor nicht Prettier-clean — nur die eigenen Zeilen sauber halten, keine Massenformatierung) → `/commit` (`feat(blog-article): Endkunden-Strang als Sonderregel Google-SEO`).

### B4 Agent — Doku + Statuszeilen
- `CLAUDE.md`: Commands-Block (`:82`) `pnpm gsc:submit` ergänzen; GSC-Block (`:209-212`): Vollscope, Sitemap-Submit nach Publish (`after()`), Script; Blog-Block (`:156 ff.`): Kategorie `tattoo-wissen` + Endkunden-Strang-Satz mit Verweis auf `toda-context.md`; Env-Block (`:299-300`): Pfad-Hinweis auf `~/.toda-secrets/gsc-sa-toda-gsc-v2.json` und Projekt unter dem TODA-Gmail.
- `docs/seo/url-contract.md` §Status (`:68-78`) anhängen: „2026-09-06 Deploy live (308er, Canonicals, Sitemap 37 URLs — geprüft 08.09.)", „2026-09-12 Inspection: 30 indexed / 5 unknown / 2 duplicate / 2 alternate / 1 crawled-not-indexed; DE-Artikel 7/11 indexiert; Sitemap lastDownloaded 08.07. → Submit per API am <Datum>", plus DNS-Zeile aus A2.4.
- `/commit` (`docs: GSC submit, Endkunden-Strang, url-contract status`).

---

## §6 Release + Prod-Beleg

1. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` grün auf `staging`.
2. `git push origin staging` (stehende Ausnahme, nur grün).
3. 🔴 **Gate 1:** Release-Merge `staging → main` (fast-forward) + `git push origin main` — Tomeks Go.
4. 🔴 **Gate 2:** Vercel-Env `GSC_SA_KEY` rotieren (A3.6) **direkt vor** dem Deploy; dann `vercel deploy --prod` von `main` (Precondition: `main` sauber, `origin/main` synchron) — Tomeks Go.
5. **Prod-Beleg:** (a) `curl -sI https://www.todasolutions.com/de` 200; (b) Cron `gsc-sync` einmal triggern (`curl -H "Authorization: Bearer $CRON_SECRET" …` aus `.env.local` per Script) → Vercel-Logs ohne Auth-Fehler, `gsc_performance_daily` `snapshot_at` heute (Read-only-MCP); (c) 🙋 Tomek publiziert den nächsten echten Artikel (oder re-publisht einen bestehenden ohne Änderung) → Vercel-Logs zeigen `[gsc]`-Zeile ohne Fehler, `pnpm gsc:inspect` zeigt Sitemap `lastSubmitted` = jetzt. Erst dann A3.7 (Aufräumen).

---

## §7 Fakten-Check (externe APIs) — verifiziert am 12.09.2026 gegen offizielle Docs

| # | Fakt | Status | Quelle |
|---|---|---|---|
| 1 | `sitemaps.submit` = `PUT https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}`, **kein Body**, leere Antwort; Scope **nur** `https://www.googleapis.com/auth/webmasters`; Pfadparameter per einfacher RFC-6570-Expansion → `encodeURIComponent` (`sc-domain%3A…`, `https%3A%2F%2F…`); Aufrufer muss **Inhaber oder Uneingeschränkt** sein (Restricted reicht nicht) | verifiziert | developers.google.com/webmaster-tools/v1/sitemaps/submit · support.google.com/webmasters/answer/7687615 |
| 2 | Ein einziger Dienst `searchconsole.googleapis.com` („Google Search Console API") trägt webmasters-v3 **und** urlInspection-v1; `webmasters.googleapis.com` existiert nicht | verifiziert | googleapis.com/discovery/v1/apis?name=searchconsole · lokal `gcloud services list --available` |
| 3 | `gcloud projects create ID --name=…` legt ohne `--organization` ein Projekt ohne Parent an (ID 6–30 Zeichen); `gcloud services enable` braucht Owner auf dem Projekt (der Ersteller ist Owner); `iam service-accounts create --display-name`; `keys create FILE --iam-account=…` (json default). Keine Billing-Pflicht dokumentiert (API kostet nichts); Projekt-Quote für Consumer-Konten nicht publiziert | Flags verifiziert; Billing/Quote unverifiziert | cloud.google.com/sdk/gcloud/reference/projects/create · …/services/enable · …/iam/service-accounts/keys/create |
| 4 | `vercel dns add <domain> '@' MX <host> <prio>`; `vercel dns add <domain> '@' TXT '<wert mit leerzeichen>'` (**Wert als EIN quoted Argument**, sonst „Invalid number of arguments"); `vercel dns add <domain> zmail._domainkey TXT '<dkim>'`. Domain muss **unter dem Team-Scope** liegen, sonst „domain can't be found under <scope>"; Vercel DNS aktivieren: Dashboard → Domains → Domain → DNS Records → „Enable Vercel DNS" oder `vercel domains add <domain> [project]`; Nameserver `ns1.vercel-dns.com` / `ns2.vercel-dns.com`, bis 48 h; Apex- und `www`-Records für das Projekt werden **automatisch** angelegt. TXT-Längenlimit (DKIM): nicht dokumentiert | verifiziert, TXT-Limit offen | vercel.com/docs/cli/dns · vercel.com/docs/domains/managing-nameservers · vercel.com/docs/domains/working-with-nameservers · CLI-Quelle `parse-add-dns-record-args.ts` |
| 5 | GSC-Domain-Verifizierung: TXT `google-site-verification=<token>` am Apex; **mehrere Inhaber-Tokens koexistieren**, Google prüft periodisch; Entfernen eines Tokens entzieht nur diesem Inhaber die Inhaberschaft (nach Kulanzfrist). „Indexierung beantragen" ist UI-only; Docs nennen nur „Tageslimit", keine Zahl | verifiziert; Quote-Zahl unverifiziert | support.google.com/webmasters/answer/9008080 · …/answer/9012289 |
| 6 | Zoho: MX/SPF-Hosts sind **rechenzentrumsabhängig** (`.eu` für EU-Orgs — unser Live-DNS zeigt `mx.zoho.eu` 10 / `mx2` 20 / `mx3` 50 und `include:zohomail.eu`; **der Netlify-Export ist die Wahrheit, nicht die generischen Docs**). DKIM-Selektor ist admin-gewählt (live: `zmail`). `zoho-verification`-TXT wird nach Verifizierung nicht mehr gebraucht (mitnehmen schadet nicht). DMARC-Starter: `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:<adresse>` | verifiziert mit Korrektur | zoho.com/mail/help/adminconsole/configure-email-delivery.html · …/dkim-configuration.html · …/dmarc-policy.html |
| 7 | Name.com: My Domains → Domain → **Domain Actions → Manage Nameservers** → „Delete All" → „Add Nameserver" (einzeln, ≥ 2); Propagation „roughly 48 hours" | verifiziert | name.com/support/articles/205934547 |

Nicht lesbar für den Agenten: Google-Cloud-Console-API-Bibliothek (Login), Vercel-OpenAPI-Spec ab 1 M Zeichen (TXT-Limit). Bei Abweichung im Lauf: Evidence beats plan.

---

## §8 Ende-Zustand + Kickoffs

- **Ende-Zustand:** Sitemap-Submit läuft nach jedem Publish; `pnpm gsc:submit` + `pnpm gsc:inspect` mit neuem SA unter dem TODA-Gmail; DNS bei Vercel, Mail-Test grün, DMARC p=none; `tom@harvestflow.ai` + TODA-Gmail Inhaber der Property, Privatkonto raus; Kategorie `tattoo-wissen`; Skill + Spine kennen den Endkunden-Strang; `url-contract.md`, `CLAUDE.md`, Memory aktualisiert; Commits auf `main` deployed.
- **Nicht in diesem Plan:** der Endkunden-Pilot-Artikel selbst. Kickoff danach in frischer Session: `/blog-article mining` mit dem Zusatz „Endkunden-Strang aktiv: beide Shortlists, Pilot = ein Endkunden-Artikel in `tattoo-wissen`". Die Kickoff-Zeile schreibt der Implementierungs-Agent am Ende als Datei (`pbcopy`).
- **Offene Punkte, die der Abschlussreport trägt:** Netlify-Zone löschen (A2.5, ≥ 48 h), Google Ads erst bei Bedarf unter dem TODA-Gmail, DataForSEO-Re-Evaluation nach Auslöser, Indexierungsstatus der 2 beantragten URLs in 3–7 Tagen (`pnpm gsc:inspect`).

## Decisions (von Claude getroffen, änderbar)
- Reihenfolge A1 → A2 → A3 → B: erst der billige Hebel, dann DNS (damit alle späteren DNS-Edits scriptbar bei Vercel liegen), dann Google-Identität.
- Neuer SA im **eigenen** Projekt `toda-gsc` statt im YouTube-Projekt (Trennung nach Zweck; beide unter dem TODA-Gmail).
- DMARC `p=none` beim DNS-Umzug ergänzen (reines Monitoring, kein Zustellrisiko).
- Sitemap-Submit im Publish-Pfad mit `after()` und ohne Throw.
- Kategorie-Slug `tattoo-wissen`; en/es-Namen sind Richtwert.
- Endkunden-Artikel bleiben bei „Tattoo Artist" im Fließtext (Regel 8), Suchsprache nur in SEO-Feldern.
- `positioning.md` unberührt; die Sonderregel lebt in `toda-context.md` + Skill.

## Abweichungen im Lauf (Begleitsession 2026-09-12, Evidence beats plan)

- **A2 (DNS):** `vercel domains add` antwortete `domain_not_owned` (403); der wirksame Weg war
  Dashboard → Team-Domains → **„Connect External"** (Plan nannte „Enable Vercel DNS" als Fallback, das ist
  der *zweite* Klick auf der Domain-Seite). Netlify-Export enthielt zwei live Netlify-Subdomain-Sites
  (`platzsichern`, `dasisttoda`) → Tomek: **droppen**. Export ließ MX-Prioritäten weg (aus Live-DNS
  10/20/50) und kannte die nach dem Export entstandenen Tokens nicht (dritter
  `google-site-verification`, dritter `_vercel`) → Script liest Live-TXT (Apex + `_vercel`) vom alten
  Nameserver dazu. **Nameserver-Wechsel blockiert:** Domain ist über Netlify registriert (Name.com nur
  Partner-Registrar, kein eigenes Konto), Netlify-UI bietet keinen Nameserver-Edit, nur „Transfer
  domain". Tomeks Entscheidung: **Option A** — Transfer in eigenes Name.com-Konto (Netlify-Support), dann
  A2.3–A2.5; späteres Ziel Registrar Vercel. Vercel-Zone ist vollständig + verifiziert (`verify` grün).
- **A3.1/A3.2:** Tomek hat die Property selbst per DNS-TXT in Netlify verifiziert (Token `Ir84GE…`), der
  Agent-Schritt „Token ins Vercel-DNS" entfiel; Migration nimmt den Token mit.
- **A3.3:** Projekt-ID `toda-gsc` global vergeben → `toda-gsc-2026` (Nr. 1075787569793); SA
  `gsc-sync@toda-gsc-2026.iam.gserviceaccount.com`.
- **Classifier:** externe Schreibzugriffe (GSC-Submit, Vercel-Domain/DNS, gcloud create) laufen im
  Auto-Mode nicht vom Agenten, sondern per `!`-Zeile von Tomek; Read-Belege (dig, `vercel domains
  inspect`, `dns ls`, `gsc:inspect`) zieht der Agent selbst.
