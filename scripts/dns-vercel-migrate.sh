#!/usr/bin/env bash
# DNS migration Netlify -> Vercel DNS for todasolutions.com (plan A2.2).
# Reads the Netlify export reports/dns-netlify-export.csv (gitignored) PLUS the
# apex TXT set the current authoritative nameserver serves right now (records
# added after the export — e.g. the GSC token of 2026-09-12 — must not be lost),
# derives the record set Vercel DNS must serve, and either
#   apply   — creates every missing record via `vercel dns add` (idempotent:
#             records already listed by `vercel dns ls` are skipped)
#   verify  — read-only: asks ns1.vercel-dns.com directly (`dig`) and compares
#             every expected record byte-for-byte; exit 1 on any mismatch.
# The nameserver switch at the registrar happens ONLY after `verify` is green.
#
# Rules baked in (from the plan + live DNS 2026-09-12):
#   - NETLIFY-type rows (platzsichern / dasisttoda subdomain sites on Netlify)
#     are dropped — Tomek's decision 2026-09-12; those sites go dark with the
#     nameserver switch.
#   - Apex A / www CNAME are NOT created: Vercel DNS serves them for the project
#     itself. `verify` still checks that ns1 answers for both.
#   - MX priorities come from the live zone (the export drops them): 10/20/50.
#   - _dmarc is new (monitoring only, p=none) and is added on top.
# No secrets involved: the Vercel CLI login is the auth.
#
#   bash scripts/dns-vercel-migrate.sh apply    # Tomek runs (writes)
#   bash scripts/dns-vercel-migrate.sh verify   # read-only
set -euo pipefail
cd "$(dirname "$0")/.."

DOMAIN="todasolutions.com"
SCOPE="toda-solutions"
CSV="reports/dns-netlify-export.csv"
NS="ns1.vercel-dns.com"
OLD_NS="dns1.p05.nsone.net"   # Netlify DNS, authoritative until the switch
DMARC_VALUE="v=DMARC1; p=none; rua=mailto:tom@todasolutions.com"

MODE="${1:-}"
[[ "$MODE" == "apply" || "$MODE" == "verify" ]] || { echo "usage: $0 apply|verify"; exit 2; }
[[ -f "$CSV" ]] || { echo "missing $CSV (copy the Netlify export there first)"; exit 1; }
command -v dig >/dev/null || { echo "dig missing"; exit 1; }
command -v python3 >/dev/null || { echo "python3 missing"; exit 1; }
[[ "$MODE" == "apply" ]] && { command -v vercel >/dev/null || { echo "vercel CLI missing"; exit 1; }; }

mx_priority() {
  case "$1" in
    mx.zoho.eu) echo 10 ;;
    mx2.zoho.eu) echo 20 ;;
    mx3.zoho.eu) echo 50 ;;
    *) echo "unknown MX host $1 — add its priority to mx_priority()" >&2; exit 1 ;;
  esac
}

# Desired records as TSV lines: name<TAB>type<TAB>value<TAB>priority
# (name relative to the zone, "@" for apex; CSV values keep their quoting-safe
# commas thanks to the csv module). Live apex TXT strings missing from the
# export are appended so post-export additions migrate too.
desired() {
  local live_txt
  live_txt="$(dig +short @"$OLD_NS" "$DOMAIN" TXT | sed -E 's/" "//g; s/^"//; s/"$//')"
  python3 - "$CSV" "$DOMAIN" "$live_txt" <<'PY'
import csv, sys
path, domain, live_txt = sys.argv[1], sys.argv[2], sys.argv[3]
seen = set()
with open(path, newline="") as fh:
    for row in csv.DictReader(fh):
        fqdn, rtype, value = row["name"].strip(), row["type"].strip(), row["value"].strip()
        name = "@" if fqdn == domain else fqdn.removesuffix("." + domain)
        if rtype == "NETLIFY":
            continue  # Netlify-hosted subdomain sites: dropped by decision
        if (name, rtype) in {("@", "A"), ("www", "CNAME")}:
            continue  # served by Vercel DNS for the project itself
        if rtype == "CNAME":
            value = value.rstrip(".")
        seen.add((name, rtype, value))
        print(f"{name}\t{rtype}\t{value}\t")
for value in filter(None, live_txt.splitlines()):
    if ("@", "TXT", value) not in seen:
        print(f"@\tTXT\t{value}\t")
PY
  printf '_dmarc\tTXT\t%s\t\n' "$DMARC_VALUE"
}

fqdn_of() { [[ "$1" == "@" ]] && echo "$DOMAIN" || echo "$1.$DOMAIN"; }

if [[ "$MODE" == "apply" ]]; then
  echo "== existing records at Vercel (before) =="
  existing="$(vercel dns ls "$DOMAIN" --scope "$SCOPE" 2>&1)"
  echo "$existing"
  echo
  while IFS=$'\t' read -r name rtype value _; do
    [[ -n "$name" ]] || continue
    if grep -qE "[[:space:]]${rtype}[[:space:]]" <<<"$existing" && grep -qF -- "$value" <<<"$existing"; then
      echo "skip   $name $rtype (exists)"
      continue
    fi
    if [[ "$rtype" == "MX" ]]; then
      prio="$(mx_priority "$value")"
      echo "add    $name MX $value $prio"
      vercel dns add "$DOMAIN" "$name" MX "$value" "$prio" --scope "$SCOPE"
    else
      echo "add    $name $rtype ${value:0:60}"
      vercel dns add "$DOMAIN" "$name" "$rtype" "$value" --scope "$SCOPE"
    fi
  done < <(desired)
  echo
  echo "== existing records at Vercel (after) =="
  vercel dns ls "$DOMAIN" --scope "$SCOPE"
  exit 0
fi

# ---- verify: ask Vercel's nameserver directly, compare with the export ----
fail=0
check() { # $1 label, $2 expected, $3 actual
  if [[ "$2" == "$3" ]]; then echo "OK     $1"; else echo "MISS   $1"; echo "         expected: $2"; echo "         got:      $3"; fail=1; fi
}
txt_values() { # all TXT strings of a name, chunks joined, one per line
  dig +short @"$NS" "$1" TXT | sed -E 's/" "//g; s/^"//; s/"$//'
}
while IFS=$'\t' read -r name rtype value _; do
  [[ -n "$name" ]] || continue
  fqdn="$(fqdn_of "$name")"
  case "$rtype" in
    MX)
      prio="$(mx_priority "$value")"
      got="$(dig +short @"$NS" "$fqdn" MX | grep -F "$prio $value." || true)"
      check "$fqdn MX $prio $value" "$prio $value." "$got" ;;
    TXT)
      got="$(txt_values "$fqdn" | grep -Fx -- "$value" || true)"
      check "$fqdn TXT ${value:0:50}" "$value" "$got" ;;
    CNAME)
      got="$(dig +short @"$NS" "$fqdn" CNAME | sed 's/\.$//')"
      check "$fqdn CNAME $value" "$value" "$got" ;;
    *) echo "unhandled type $rtype for $fqdn"; fail=1 ;;
  esac
done < <(desired)
# Web records: Vercel serves them itself — any answer from ns1 counts.
apex_a="$(dig +short @"$NS" "$DOMAIN" A | head -1)"
www_any="$(dig +short @"$NS" "www.$DOMAIN" A | head -1)"
[[ -n "$apex_a" ]] && echo "OK     $DOMAIN A -> $apex_a" || { echo "MISS   $DOMAIN A (no answer from $NS)"; fail=1; }
[[ -n "$www_any" ]] && echo "OK     www.$DOMAIN -> $www_any" || { echo "MISS   www.$DOMAIN (no answer from $NS)"; fail=1; }
# Nothing we did not intend: extra TXT at apex would be a surprise worth seeing.
echo "-- apex TXT as served by $NS:"; txt_values "$DOMAIN" | sed 's/^/     /'
[[ $fail -eq 0 ]] && echo "VERIFY: all records served by $NS match the export" || { echo "VERIFY: mismatches above — do NOT switch nameservers"; exit 1; }
