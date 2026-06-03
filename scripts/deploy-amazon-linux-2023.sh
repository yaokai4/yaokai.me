#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-yaokai-me}"
APP_DIR="${APP_DIR:-$(pwd)}"
PORT="${PORT:-3000}"

cd "$APP_DIR"

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

for cmd in node pnpm pm2; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "缺少命令：$cmd"
    echo "请先运行 sudo ./scripts/setup-server.sh。"
    exit 1
  fi
done

if [[ ! -f ".env.production" ]]; then
  cp .env.production.example .env.production
  echo "已从示例创建 .env.production。请填入真实配置后重新运行该脚本。"
  exit 1
fi

set -a
source .env.production
set +a

if [[ -d .git ]]; then
  git pull --ff-only || true
fi

./scripts/prepare-prisma-provider.sh .env.production
PRISMA_SCHEMA="$(./scripts/prepare-prisma-provider.sh .env.production --print)"
ensure_sqlite_db_file .env.production

echo "正在安装依赖..."
pnpm install --frozen-lockfile || pnpm install

echo "正在生成 Prisma Client 并应用迁移..."
pnpm prisma generate --schema "$PRISMA_SCHEMA"
pnpm prisma migrate deploy --schema "$PRISMA_SCHEMA"

if [[ "${RUN_SEED:-0}" == "1" ]]; then
  pnpm prisma db seed --schema "$PRISMA_SCHEMA"
fi

echo "正在构建 Next.js..."
pnpm build

echo "正在通过 PM2 启动 ${APP_NAME}..."
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
pm2 start "pnpm start" --name "$APP_NAME" --time --update-env -- start
pm2 save

if command -v sudo >/dev/null 2>&1; then
  sudo nginx -t
  sudo systemctl reload nginx
else
  nginx -t
  systemctl reload nginx
fi

echo "部署完成。应用：${APP_NAME}，端口：${PORT}"
