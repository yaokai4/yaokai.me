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

for cmd in node pnpm; do
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

require_real_env() {
  local key="$1"
  local value="${!key:-}"
  if [[ -z "$value" || "$value" == replace-with* ]]; then
    echo ".env.production 缺少有效配置：$key"
    exit 1
  fi
}

ensure_app_systemd_service() {
  if ! command -v sudo >/dev/null 2>&1; then
    return
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
}

ensure_swap() {
  local swap_mb
  swap_mb="$(free -m | awk '/^Swap:/ {print $2}')"
  if [[ -n "$swap_mb" && "$swap_mb" -ge 1024 ]]; then
    return
  fi
  if ! command -v sudo >/dev/null 2>&1; then
    return
  fi

  echo "正在配置 2GB swap，避免生产构建压满内存..."
  if [[ ! -f /swapfile ]]; then
    sudo fallocate -l 2G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
  fi
  sudo swapon /swapfile 2>/dev/null || true
  if ! grep -qE '^/swapfile\s' /etc/fstab; then
    echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab >/dev/null
  fi
}

for key in AUTH_SECRET JWT_SECRET CRON_SECRET ENCRYPTION_KEY; do
  require_real_env "$key"
done

if [[ -z "${ADMIN_PASSWORD_HASH:-}" ]]; then
  require_real_env ADMIN_PASSWORD
  if [[ "${ADMIN_PASSWORD}" == *kai*xuan* ]]; then
    echo ".env.production 中的 ADMIN_PASSWORD 仍是旧固定密码模式，请改为随机强密码或 ADMIN_PASSWORD_HASH。"
    exit 1
  fi
fi

if [[ -d .git ]]; then
  git pull --ff-only || true
fi

ensure_swap

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

echo "正在初始化 Secure Access Endpoint..."
node scripts/init-secure-access-endpoint.mjs

echo "正在构建 Next.js..."
pnpm build

echo "正在通过 systemd 启动 ${APP_NAME}..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  pm2 save >/dev/null 2>&1 || true
fi
if command -v sudo >/dev/null 2>&1; then
  sudo systemctl disable --now "pm2-$(id -un)" >/dev/null 2>&1 || true
fi
ensure_app_systemd_service

if command -v sudo >/dev/null 2>&1; then
  sudo nginx -t
  sudo systemctl enable --now nginx
  sudo systemctl reload nginx
else
  nginx -t
  systemctl reload nginx
fi

echo "部署完成。应用：${APP_NAME}，端口：${PORT}"
