#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.production}"
BACKUP_DIR="${BACKUP_DIR:-backups}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "没有找到环境文件：$ENV_FILE"
  exit 1
fi

DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -n 1 | cut -d '=' -f2- | tr -d '"')"

if [[ "$DATABASE_URL" != file:* ]]; then
  echo "backup-db.sh 仅用于 SQLite 文件数据库。PostgreSQL 请使用 pg_dump。"
  exit 1
fi

DB_PATH="${DATABASE_URL#file:}"
if [[ "$DB_PATH" != /* ]]; then
  DB_PATH="prisma/${DB_PATH}"
fi

if [[ ! -f "$DB_PATH" ]]; then
  echo "没有找到数据库文件：$DB_PATH"
  exit 1
fi

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="${BACKUP_DIR}/yaokai-me-${STAMP}.db"
cp "$DB_PATH" "$TARGET"

echo "数据库备份已创建：$TARGET"
