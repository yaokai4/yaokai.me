#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env}"
MODE="${2:-}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "没有找到环境文件：$ENV_FILE"
  exit 1
fi

DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -n 1 | cut -d '=' -f2- | tr -d '"')"

if [[ "$DATABASE_URL" == postgres* || "$DATABASE_URL" == postgresql* ]]; then
  PRISMA_SCHEMA="prisma/postgresql/schema.prisma"
else
  PRISMA_SCHEMA="prisma/schema.prisma"
fi

if [[ "$MODE" == "--print" ]]; then
  echo "$PRISMA_SCHEMA"
  exit 0
fi

echo "已选择 Prisma schema：$PRISMA_SCHEMA"
