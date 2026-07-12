#!/usr/bin/env bash
# Provisions a Google Cloud service account for headless Search Console API access,
# so the GSC-snapshot cron can pull performance data into Supabase.
#
# Idempotent: safe to re-run. Creates the SA + a JSON key, enables the API, and prints
# the SA email + the two steps Google exposes NO API for (add-user, key handoff).
# Secret hygiene: the JSON key is written to a gitignored file OUTSIDE the repo and is
# NEVER printed to the terminal.
#
# Run it yourself (it acts on YOUR Google account): paste into the session prompt:
#     ! bash "<this file>"
# If gcloud auth is needed it will tell you the exact command to run.
set -euo pipefail

PROJECT_ID="${GSC_PROJECT_ID:-toda-gsc}"      # set GSC_PROJECT_ID=... to reuse an existing project
SA_NAME="gsc-snapshot"
KEY_DIR="${HOME}/.toda-secrets"
KEY_FILE="${KEY_DIR}/gsc-sa-${PROJECT_ID}.json"

command -v gcloud >/dev/null 2>&1 || {
  echo "gcloud not found. Install with:  brew install --cask google-cloud-sdk"
  echo "then re-run this script."; exit 1; }

# gcloud auth is interactive (browser) — must already be done.
gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q . || {
  echo "Not authenticated. In the session prompt run:  ! gcloud auth login"
  echo "then re-run this script."; exit 1; }

if ! gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1; then
  echo "Creating Google Cloud project '$PROJECT_ID' ..."
  gcloud projects create "$PROJECT_ID" --name="TODA GSC"
fi
gcloud config set project "$PROJECT_ID" >/dev/null

echo "Enabling the Search Console API (free, no billing for reads) ..."
gcloud services enable searchconsole.googleapis.com

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1 || \
  gcloud iam service-accounts create "$SA_NAME" --display-name="GSC snapshot (headless read)"

mkdir -p "$KEY_DIR"; chmod 700 "$KEY_DIR"
if [ ! -f "$KEY_FILE" ]; then
  # A just-created service account can take a few seconds to propagate before it
  # accepts key creation (IAM eventual consistency, NOT_FOUND) — retry with backoff.
  for attempt in 1 2 3 4 5 6; do
    if gcloud iam service-accounts keys create "$KEY_FILE" --iam-account="$SA_EMAIL" 2>/dev/null; then
      break
    fi
    echo "  SA not ready for key creation yet (attempt $attempt) — waiting ${attempt}s ..."
    sleep "$attempt"
  done
  [ -f "$KEY_FILE" ] || { echo "ERROR: key creation failed after retries — just re-run the script"; exit 1; }
  chmod 600 "$KEY_FILE"
  echo "Key written to: $KEY_FILE  (gitignored location, keep secret)"
else
  echo "Key already exists at: $KEY_FILE  (not regenerated)"
fi

echo
echo "=== DONE. Two steps with no Google API — do these manually: ==="
echo "1) Search Console -> Settings -> Users and permissions -> Add user:"
echo "       $SA_EMAIL      (permission: Restricted)"
echo "   Add it on the SAME property you verified (Domain or URL-prefix)."
echo "2) Tell Claude the key is ready. For Vercel prod, Claude runs 'vercel env add GSC_SA_KEY'"
echo "   and you paste the file contents; local dev reads \$KEY_FILE via GSC_SA_KEY_FILE."
echo
echo "Service-account email (also needed for step 1): $SA_EMAIL"
