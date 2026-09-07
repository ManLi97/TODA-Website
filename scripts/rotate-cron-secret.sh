#!/usr/bin/env bash
# Rotates CRON_SECRET: generates a fresh 32-byte hex value, writes it to .env.local
# (replacing an existing line), and replaces the Vercel Production variable
# (sensitive). The value is never printed and never appears in argv.
#
# Afterwards a production redeploy is REQUIRED (functions bake the value at build
# time, the cron invoker reads the project setting): main clean + in sync, then
# `vercel deploy --prod`. Both crons (gsc-sync daily, mining-sync Monday) and the
# pulse chain use this one secret.
#
#   bash scripts/rotate-cron-secret.sh
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE=".env.local"
command -v vercel >/dev/null || { echo "vercel CLI missing"; exit 1; }
command -v openssl >/dev/null || { echo "openssl missing"; exit 1; }

SECRET="$(openssl rand -hex 32)"
[[ ${#SECRET} -eq 64 ]] || { echo "secret generation failed"; exit 1; }

# 1) .env.local — replace or append, keep every other line untouched.
touch "$ENV_FILE"
if grep -qE '^CRON_SECRET=' "$ENV_FILE"; then
  NEW_SECRET="$SECRET" perl -i -pe 's/^CRON_SECRET=.*$/CRON_SECRET=$ENV{NEW_SECRET}/' "$ENV_FILE"
  echo ".env.local: CRON_SECRET replaced"
else
  printf '\nCRON_SECRET=%s\n' "$SECRET" >> "$ENV_FILE"
  echo ".env.local: CRON_SECRET appended"
fi

# 2) Vercel Production — remove the old variable, add the new one as sensitive.
vercel env rm CRON_SECRET production --yes >/dev/null 2>&1 || echo "vercel: no previous CRON_SECRET to remove"
printf '%s' "$SECRET" | vercel env add CRON_SECRET production --sensitive --yes >/dev/null
echo "vercel: CRON_SECRET (Production, sensitive) set"
unset SECRET

echo "verify:"
vercel env ls production 2>/dev/null | grep -E '^\s*CRON_SECRET' || echo "  (CRON_SECRET not listed — check the dashboard)"
grep -cE '^CRON_SECRET=[0-9a-f]{64}$' "$ENV_FILE" | sed 's/^/  .env.local lines with a 64-hex CRON_SECRET: /'
echo "next: git checkout main && git merge --ff-only staging && git push origin main && vercel deploy --prod && git checkout staging"
