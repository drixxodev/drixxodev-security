#!/bin/bash
# SessionStart hook — provisions a working dev environment for Claude Code on the web.
#
# Brings up everything the app and tests need:
#   1. npm dependencies
#   2. a running local PostgreSQL 16 cluster
#   3. the `drixxodev` database + role matching .env.example
#   4. a .env with a generated TOKEN_ENCRYPTION_KEY (created once, never overwritten)
#   5. the Prisma client + schema applied via `prisma db push`
#
# Without this, DB-backed pages (e.g. /dashboard) and any DB-touching test fail with
# "Can't reach database server at localhost:5432". Idempotent — safe to re-run.
set -euo pipefail

# Web-only: local dev machines run their own Postgres and manage their own .env.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  echo "[session-start] not a remote session; skipping provisioning."
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Connection details — must match .env.example's DATABASE_URL.
DB_USER="user"
DB_PASSWORD="password"
DB_NAME="drixxodev"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"

echo "[session-start] installing npm dependencies..."
npm install --no-audit --no-fund

echo "[session-start] starting PostgreSQL 16 cluster..."
# pg_ctlcluster exits non-zero if already running; tolerate that, then confirm readiness.
pg_ctlcluster 16 main start 2>/dev/null || true
for i in $(seq 1 30); do
  if pg_isready -q -h localhost -p 5432; then break; fi
  sleep 1
done
pg_isready -h localhost -p 5432

echo "[session-start] ensuring role and database exist..."
# Run as the postgres superuser (owns the cluster). Write the SQL to a file via a
# quoted heredoc so $$ dollar-quoting survives (su -c would otherwise expand it).
# Identifiers are hardcoded to match .env.example's DATABASE_URL (user/password/drixxodev).
INIT_SQL="$(mktemp -p /tmp dvxx_init.XXXXXX)"
cat > "$INIT_SQL" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'user') THEN
    CREATE ROLE "user" LOGIN PASSWORD 'password';
  END IF;
END
$$;
ALTER ROLE "user" CREATEDB;
SQL
chmod 644 "$INIT_SQL"
su -s /bin/bash postgres -c "psql -v ON_ERROR_STOP=1 -f '${INIT_SQL}'"
rm -f "$INIT_SQL"
if ! su -s /bin/bash postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'\"" | grep -q 1; then
  su -s /bin/bash postgres -c "createdb -O '${DB_USER}' '${DB_NAME}'"
fi

# Create .env once from the example; never clobber an existing one (may hold real keys).
if [ ! -f .env ]; then
  echo "[session-start] creating .env from .env.example..."
  cp .env.example .env
  TOKEN_KEY="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
  # Replace the placeholder lines with working local values.
  node - "$DATABASE_URL" "$TOKEN_KEY" <<'NODE'
const fs = require('fs');
const [databaseUrl, tokenKey] = process.argv.slice(2);
let env = fs.readFileSync('.env', 'utf8');
env = env.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${databaseUrl}`);
env = env.replace(/^TOKEN_ENCRYPTION_KEY=.*$/m, `TOKEN_ENCRYPTION_KEY=${tokenKey}`);
fs.writeFileSync('.env', env);
NODE
fi

# Expose DB connection + token key to the agent's shell (Prisma CLI, ad-hoc scripts).
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo "export DATABASE_URL='${DATABASE_URL}'"
    grep '^TOKEN_ENCRYPTION_KEY=' .env | sed "s/^/export /"
  } >> "$CLAUDE_ENV_FILE"
fi

echo "[session-start] generating Prisma client and applying schema..."
export DATABASE_URL
npx prisma generate
# No migration baseline exists yet (prisma/ has only schema.prisma), so use db push
# to sync the schema — the quick-start path documented in DEPLOYMENT.md §5.
npx prisma db push --skip-generate

echo "[session-start] done. Postgres is up and schema is applied."
