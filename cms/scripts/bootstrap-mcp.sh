#!/usr/bin/env bash
# Bootstrap an MCP API key against a running local Payload dev server.
#
# What it does:
#   1. Creates the first admin user (or reuses one if email/password already work)
#   2. Creates a payload-mcp-api-keys doc with full media+pages access
#   3. Sets the apiKey field to a freshly generated UUID
#   4. Writes the key to .env.mcp.local (gitignored) and prints export instructions
#
# Prereqs:
#   - `npm run dev` running in another terminal (server reachable at $BASE_URL)
#   - `.env` exists with PAYLOAD_SECRET set
#
# Usage:
#   bash scripts/bootstrap-mcp.sh
#   BASE_URL=http://127.0.0.1:3000 ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... bash scripts/bootstrap-mcp.sh

set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@kombo.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-correct-horse-battery-staple}"
KEY_LABEL="${KEY_LABEL:-claude-code-dev}"

require() {
  command -v "$1" >/dev/null 2>&1 || { echo "missing dependency: $1"; exit 1; }
}
require curl
require python3

# 1. Try first-register; fall back to login if the admin already exists.
echo "→ Ensuring admin user $ADMIN_EMAIL"
register_resp=$(curl -s -X POST "$BASE_URL/api/users/first-register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"passwordConfirm\":\"$ADMIN_PASSWORD\"}")

if echo "$register_resp" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d.get('token') else 1)" 2>/dev/null; then
  echo "  registered new admin"
  TOKEN=$(echo "$register_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
else
  echo "  first-register declined; logging in instead"
  TOKEN=$(curl -s -X POST "$BASE_URL/api/users/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
fi

USER_ID=$(curl -s -H "Authorization: JWT $TOKEN" "$BASE_URL/api/users/me" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['id'])")
echo "  user id = $USER_ID"

# 2. Create the API key doc with full permissions on media + pages.
echo "→ Creating MCP API key '$KEY_LABEL'"
create_resp=$(curl -s -X POST "$BASE_URL/api/payload-mcp-api-keys" \
  -H "Authorization: JWT $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "$(cat <<JSON
{
  "user": $USER_ID,
  "label": "$KEY_LABEL",
  "description": "Bootstrapped by scripts/bootstrap-mcp.sh",
  "enableAPIKey": true,
  "media": { "find": true, "create": true, "update": true, "delete": true },
  "pages": { "find": true, "create": true, "update": true, "delete": true }
}
JSON
)")
KEY_ID=$(echo "$create_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['doc']['id'])")
echo "  key doc id = $KEY_ID"

# 3. Generate a UUID and patch it onto the apiKey field.
KEY_VALUE=$(python3 -c "import uuid; print(uuid.uuid4())")
curl -s -X PATCH "$BASE_URL/api/payload-mcp-api-keys/$KEY_ID" \
  -H "Authorization: JWT $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"apiKey\":\"$KEY_VALUE\"}" >/dev/null

# 4. Write the key out and print next steps.
ENV_FILE=".env.mcp.local"
printf 'PAYLOAD_MCP_API_KEY=%s\n' "$KEY_VALUE" > "$ENV_FILE"
chmod 600 "$ENV_FILE"

cat <<EOF

✓ Done. API key written to $ENV_FILE (gitignored, mode 600).

To wire it into Claude Code, export it in the shell that launches \`claude\`:

  set -a; source $ENV_FILE; set +a
  claude

Verify with:

  curl -s -X POST $BASE_URL/api/mcp \\
    -H "Authorization: Bearer \$PAYLOAD_MCP_API_KEY" \\
    -H 'Content-Type: application/json' \\
    -H 'Accept: application/json, text/event-stream' \\
    -d '{"jsonrpc":"2.0","id":"1","method":"tools/list","params":{}}' \\
    | head -c 400

EOF
