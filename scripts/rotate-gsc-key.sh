#!/usr/bin/env bash
# Rotates GSC_SA_KEY on Vercel Production to the TODA-owned service-account key
# (plan A3.6): removes the previous variable and adds the new one as sensitive,
# value streamed from the key file via stdin — never in argv, never printed.
# .env.local is NOT touched (local runs keep using GSC_SA_KEY_FILE as env prefix).
#
# Afterwards a production redeploy is REQUIRED (functions bake env at build time):
# main clean + in sync, then `vercel deploy --prod`. Until then the old SA keeps
# serving the cron — do not remove it from the GSC property before that deploy
# is verified (plan §6.5).
#
#   bash scripts/rotate-gsc-key.sh
set -euo pipefail
cd "$(dirname "$0")/.."
KEY="${KEY:-$HOME/.toda-secrets/gsc-sa-toda-gsc-v2.json}"
SCOPE="toda-solutions"
command -v vercel >/dev/null || { echo "vercel CLI missing"; exit 1; }
[[ -s "$KEY" ]] || { echo "key file missing or empty: $KEY"; exit 1; }
python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); assert d.get("client_email") and d.get("private_key")' "$KEY" \
  || { echo "key file is not a service-account JSON"; exit 1; }

vercel env rm GSC_SA_KEY production --yes --scope "$SCOPE" >/dev/null 2>&1 && echo "vercel: previous GSC_SA_KEY removed" || echo "vercel: no previous GSC_SA_KEY"
vercel env add GSC_SA_KEY production --sensitive --yes --scope "$SCOPE" < "$KEY" >/dev/null
echo "vercel: GSC_SA_KEY added (sensitive, production)"

echo "== verify =="
vercel env ls production --scope "$SCOPE" | grep -E '^\s*GSC_SA_KEY\s' || { echo "GSC_SA_KEY not listed"; exit 1; }
echo
echo "Next: redeploy production (main clean + in sync): vercel deploy --prod"
