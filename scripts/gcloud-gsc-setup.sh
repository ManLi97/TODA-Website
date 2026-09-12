#!/usr/bin/env bash
# Google Cloud project + service account for the Search Console sync, owned by
# the TODA Google account (plan A3.3). Idempotent: every step checks first.
# No Cloud organisation, no billing, no IAM role — the SA's only permission is
# the "Full" user entry in the GSC property (Tomek adds it in the UI, A3.4).
# Prints the SA e-mail (not a secret); the key file is written 0600 and never
# shown.
#
#   bash scripts/gcloud-gsc-setup.sh          # PROJECT=toda-gsc-2026 (toda-gsc is taken globally)
set -euo pipefail

ACCOUNT="toda.tattoo.solutions@gmail.com"
PROJECT="${PROJECT:-toda-gsc-2026}"
SA="gsc-sync"
SA_EMAIL="$SA@$PROJECT.iam.gserviceaccount.com"
KEY="$HOME/.toda-secrets/gsc-sa-toda-gsc-v2.json"   # NOT gsc-sa-toda-gsc.json (0-byte leftover)
G=(gcloud --account="$ACCOUNT" --quiet)

command -v gcloud >/dev/null || { echo "gcloud missing"; exit 1; }
gcloud auth list --format='value(account)' | grep -qx "$ACCOUNT" || { echo "not logged in as $ACCOUNT"; exit 1; }

# 1) Project (no --organization: standalone project under the consumer account).
if "${G[@]}" projects describe "$PROJECT" --format='value(projectId)' >/dev/null 2>&1; then
  echo "project: $PROJECT exists"
else
  echo "project: creating $PROJECT"
  "${G[@]}" projects create "$PROJECT" --name="TODA GSC" \
    || { echo "projects create failed — id taken or project quota; pick another PROJECT=… or ask Tomek"; exit 1; }
fi

# 2) Search Console API (one service carries webmasters-v3 + urlInspection-v1).
if "${G[@]}" services list --enabled --project="$PROJECT" --format='value(config.name)' | grep -qx 'searchconsole.googleapis.com'; then
  echo "api: searchconsole.googleapis.com already enabled"
else
  echo "api: enabling searchconsole.googleapis.com"
  "${G[@]}" services enable searchconsole.googleapis.com --project="$PROJECT"
fi

# 3) Service account.
if "${G[@]}" iam service-accounts describe "$SA_EMAIL" --project="$PROJECT" >/dev/null 2>&1; then
  echo "sa: $SA_EMAIL exists"
else
  echo "sa: creating $SA_EMAIL"
  "${G[@]}" iam service-accounts create "$SA" --display-name="TODA GSC sync" --project="$PROJECT"
fi

# 4) Key file (only if missing or empty — never overwrite a working key).
mkdir -p "$(dirname "$KEY")"
if [[ -s "$KEY" ]]; then
  echo "key: $KEY exists ($(stat -f %z "$KEY") bytes) — keeping it"
else
  echo "key: creating $KEY"
  "${G[@]}" iam service-accounts keys create "$KEY" --iam-account="$SA_EMAIL" --project="$PROJECT"
fi
chmod 600 "$KEY"

echo
echo "== evidence =="
"${G[@]}" projects describe "$PROJECT" --format='table(projectId,name,projectNumber,lifecycleState)'
"${G[@]}" iam service-accounts list --project="$PROJECT" --format='table(email,displayName,disabled)'
ls -l "$KEY"
echo
echo "SA e-mail for GSC 'Nutzer und Berechtigungen' (Uneingeschränkt): $SA_EMAIL"
