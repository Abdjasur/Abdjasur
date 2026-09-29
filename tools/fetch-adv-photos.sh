#!/usr/bin/env bash
# Downloads the AI-generated photos for the advantages section (made in Higgsfield)
# and saves them as 1200px WebP files in images/. Run on the server as root:
#   bash tools/fetch-adv-photos.sh
set -euo pipefail
cd "$(dirname "$0")/../images"
command -v cwebp >/dev/null || { apt-get update -qq && apt-get install -y -qq webp >/dev/null; }
base=https://d8j0ntlcm91z4.cloudfront.net/user_3JjqWhQoVQQDZWYFrPNcMY4lCX9
while read -r name id; do
  curl -fsSL "$base/hf_20260929_161951_$id.png" -o "/tmp/adv-$name.png"
  cwebp -quiet -q 82 -resize 1200 0 "/tmp/adv-$name.png" -o "adv-$name.webp"
  rm -f "/tmp/adv-$name.png"
  echo "adv-$name.webp OK"
done <<'EOF'
drainage 620583f5-05e6-48a8-bebf-0e5565edada8
insulation 0c5aae16-5863-4573-830a-b1d8909adb8b
utilities 3119e472-d442-4eb6-b97b-a415ade157b5
level a8504536-0636-4d93-a406-061e8831f2b5
EOF
