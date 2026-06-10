#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-yaokai-me}"

ensure_sqlite_db_file() {
  local env_file="$1"
  local database_url
  database_url="$(grep -E '^DATABASE_URL=' "$env_file" | head -n 1 | cut -d '=' -f2- | tr -d '"')"
  if [[ "$database_url" == file:* ]]; then
    local db_path="${database_url#file:}"
    if [[ "$db_path" != /* ]]; then
      db_path="prisma/${db_path}"
    fi
    mkdir -p "$(dirname "$db_path")"
    if [[ ! -f "$db_path" ]]; then
      touch "$db_path"
      echo "已创建 SQLite 数据库文件：$db_path"
    fi
  fi
}

if [[ -d .git ]]; then
  git pull --ff-only
fi

if [[ -f ".env.production" ]]; then
  set -a
  source .env.production
  set +a
  ./scripts/prepare-prisma-provider.sh .env.production
  PRISMA_SCHEMA="$(./scripts/prepare-prisma-provider.sh .env.production --print)"
  ensure_sqlite_db_file .env.production
else
  PRISMA_SCHEMA="prisma/schema.prisma"
fi

pnpm install --frozen-lockfile || pnpm install
pnpm prisma generate --schema "$PRISMA_SCHEMA"
pnpm prisma migrate deploy --schema "$PRISMA_SCHEMA"
pnpm build
sudo systemctl restart "${APP_NAME}.service"
sudo nginx -t
sudo systemctl reload nginx

echo "更新完成。"
