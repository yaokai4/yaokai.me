#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-yaokai-me}"
APP_DIR="${APP_DIR:-$(pwd)}"
PORT="${PORT:-3000}"

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

if [[ ! -f ".env.production" ]]; then
  echo "缺少 .env.production。请先复制 .env.production.example 并完成配置。"
  exit 1
fi

if [[ ! -d "node_modules" ]]; then
  pnpm install
fi

set -a
source .env.production
set +a

./scripts/prepare-prisma-provider.sh .env.production
PRISMA_SCHEMA="$(./scripts/prepare-prisma-provider.sh .env.production --print)"
ensure_sqlite_db_file .env.production
pnpm prisma generate --schema "$PRISMA_SCHEMA"

if ! command -v sudo >/dev/null 2>&1; then
  echo "缺少 sudo，无法创建 systemd 服务。请使用 pnpm start 手动运行。"
  exit 1
fi

sudo tee "/etc/systemd/system/${APP_NAME}.service" >/dev/null <<EOF
[Unit]
Description=${APP_NAME} Next.js app
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$(id -un)
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env.production
Environment=NODE_ENV=production
Environment=PORT=${PORT}
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=5
KillSignal=SIGINT
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now "${APP_NAME}.service"
sudo systemctl restart "${APP_NAME}.service"

echo "${APP_NAME} 正在运行：http://127.0.0.1:${PORT}"
