#!/usr/bin/env bash
# Triggers one of the Vercel cron routes on production with the CRON_SECRET
# from .env.local (sourced in-process — the value never appears in argv or
# output). Prints HTTP status + response body as evidence.
#
#   bash scripts/cron-trigger.sh gsc-sync|mining-sync|pulse-worker [querystring]
set -euo pipefail
cd "$(dirname "$0")/.."
ROUTE="${1:-}"
QS="${2:-}"
[[ "$ROUTE" =~ ^(gsc-sync|mining-sync|pulse-worker)$ ]] || { echo "usage: $0 gsc-sync|mining-sync|pulse-worker [querystring]"; exit 2; }
[[ -f .env.local ]] || { echo ".env.local missing"; exit 1; }
CRON_SECRET="$(grep -E '^CRON_SECRET=' .env.local | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
[[ -n "$CRON_SECRET" ]] || { echo "CRON_SECRET not set in .env.local"; exit 1; }
URL="https://www.todasolutions.com/api/cron/${ROUTE}${QS:+?$QS}"
echo "GET $URL"
curl -sS -o /tmp/cron-trigger-body.$$ -w "HTTP %{http_code}\n" -H "Authorization: Bearer $CRON_SECRET" "$URL"
echo "--- body:"; cat /tmp/cron-trigger-body.$$; echo; rm -f /tmp/cron-trigger-body.$$
