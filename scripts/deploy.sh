#!/usr/bin/env bash
set -euo pipefail

# 本地一键部署入口：
#   npm run deploy
#
# 默认部署到 yaokai.me / 57.180.83.160。私钥只在本地 SSH 时引用，不会被打包上传。

EC2_USER="${EC2_USER:-ec2-user}"
EC2_HOST="${EC2_HOST:-57.180.83.160}"
EC2_KEY="${EC2_KEY:-/Users/yaokai/Desktop/it/ios/machiL.pem}"
if [[ ! -f "$EC2_KEY" && -f "/Users/yaokai/Desktop/IT/ios/machiL.pem" ]]; then
  EC2_KEY="/Users/yaokai/Desktop/IT/ios/machiL.pem"
fi

DOMAIN="${DOMAIN:-yaokai.me}"
DOMAIN_ALIASES="${DOMAIN_ALIASES:-yaokai.me www.yaokai.me}"
APP_NAME="${APP_NAME:-yaokai-me}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/var/www/yaokai.me}"
PORT="${PORT:-3000}"
RUN_SEED="${RUN_SEED:-1}"
ENABLE_SSL="${ENABLE_SSL:-1}"
DEFAULT_ADMIN_EMAIL="${ADMIN_EMAIL:-admin@${DOMAIN}}"
PUBLIC_SCHEME="https"
if [[ "$ENABLE_SSL" != "1" ]]; then
  PUBLIC_SCHEME="http"
fi

LOCAL_PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_PROJECT_NAME="$(basename "$LOCAL_PROJECT_DIR")"
TARBALL="${TMPDIR:-/tmp}/yaokai-me-$(date +%Y%m%d-%H%M%S).tar.gz"
REMOTE_TARBALL="/home/${EC2_USER}/$(basename "$TARBALL")"

if [[ ! -f "$EC2_KEY" ]]; then
  echo "找不到 SSH 私钥：$EC2_KEY"
  echo "可用 EC2_KEY=/path/to/key.pem npm run deploy 指定。"
  exit 1
fi

quote() {
  printf "%q" "$1"
}

SSH_OPTS=(-i "$EC2_KEY" -o StrictHostKeyChecking=accept-new)
REMOTE_ENV="APP_NAME=$(quote "$APP_NAME") REMOTE_APP_DIR=$(quote "$REMOTE_APP_DIR") DOMAIN=$(quote "$DOMAIN") DOMAIN_ALIASES=$(quote "$DOMAIN_ALIASES") EC2_HOST=$(quote "$EC2_HOST") PORT=$(quote "$PORT") RUN_SEED=$(quote "$RUN_SEED") ENABLE_SSL=$(quote "$ENABLE_SSL") PUBLIC_SCHEME=$(quote "$PUBLIC_SCHEME") DEFAULT_ADMIN_EMAIL=$(quote "$DEFAULT_ADMIN_EMAIL") REMOTE_TARBALL=$(quote "$REMOTE_TARBALL")"

echo "==> [本地] 项目目录：$LOCAL_PROJECT_DIR"
dot_clean "$LOCAL_PROJECT_DIR" 2>/dev/null || true

echo "==> [本地] 打包项目，排除本地环境变量、数据库、构建产物和依赖目录"
cd "$(dirname "$LOCAL_PROJECT_DIR")"
COPYFILE_DISABLE=1 tar \
  --exclude="${LOCAL_PROJECT_NAME}/.next" \
  --exclude="${LOCAL_PROJECT_NAME}/node_modules" \
  --exclude="${LOCAL_PROJECT_NAME}/tsconfig.tsbuildinfo" \
  --exclude="${LOCAL_PROJECT_NAME}/.env" \
  --exclude="${LOCAL_PROJECT_NAME}/.env.local" \
  --exclude="${LOCAL_PROJECT_NAME}/.env.production" \
  --exclude="${LOCAL_PROJECT_NAME}/prisma/dev.db" \
  --exclude="${LOCAL_PROJECT_NAME}/prisma/production.db" \
  --exclude="${LOCAL_PROJECT_NAME}/prisma/*.db" \
  --exclude="${LOCAL_PROJECT_NAME}/backups" \
  --exclude="${LOCAL_PROJECT_NAME}/.git" \
  --exclude="${LOCAL_PROJECT_NAME}/yaokai.me" \
  --exclude="*/.DS_Store" \
  --exclude="*/._*" \
  -czf "$TARBALL" "${LOCAL_PROJECT_NAME}/"

SIZE_MB="$(du -m "$TARBALL" | cut -f1)"
echo "    包大小：${SIZE_MB}MB"

echo "==> [本地] 上传到 ${EC2_USER}@${EC2_HOST}"
if ! scp "${SSH_OPTS[@]}" -C -q "$TARBALL" "${EC2_USER}@${EC2_HOST}:${REMOTE_TARBALL}"; then
  echo "    常规 scp 上传失败，尝试 legacy scp 模式"
  scp -O "${SSH_OPTS[@]}" -C -q "$TARBALL" "${EC2_USER}@${EC2_HOST}:${REMOTE_TARBALL}"
fi

echo "==> [远端] 解压、保留生产数据、安装依赖、迁移、构建、重启"
ssh "${SSH_OPTS[@]}" "${EC2_USER}@${EC2_HOST}" "$REMOTE_ENV bash -s" <<'REMOTE'
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
USER_NAME="${SUDO_USER:-ec2-user}"

need_base_setup=0
for cmd in node pnpm nginx; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    need_base_setup=1
  fi
done

if [[ "$need_base_setup" == "1" ]]; then
  echo "    [远端] 安装基础运行环境"
  sudo dnf update -y
  sudo dnf install -y git nginx tar gzip sqlite findutils openssl
  if ! command -v curl >/dev/null 2>&1; then
    sudo dnf install -y curl-minimal || sudo dnf install -y curl --allowerasing
  fi
  if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
    sudo dnf install -y nodejs
  fi
  sudo corepack enable
  sudo corepack prepare pnpm@latest --activate
  sudo systemctl enable nginx
fi

echo "    [远端] 备份当前应用"
if [[ -d "$REMOTE_APP_DIR" ]]; then
  sudo cp -a "$REMOTE_APP_DIR" "${REMOTE_APP_DIR}.backup-${TS}"
  ls -dt "${REMOTE_APP_DIR}".backup-* 2>/dev/null | tail -n +4 | xargs -r sudo rm -rf
fi

PRESERVE_DIR="$(mktemp -d)"
if [[ -f "$REMOTE_APP_DIR/.env.production" ]]; then
  sudo cp -a "$REMOTE_APP_DIR/.env.production" "$PRESERVE_DIR/.env.production"
fi
if ls "$REMOTE_APP_DIR"/prisma/production.db* >/dev/null 2>&1; then
  mkdir -p "$PRESERVE_DIR/prisma"
  sudo cp -a "$REMOTE_APP_DIR"/prisma/production.db* "$PRESERVE_DIR/prisma/" || true
fi
if [[ -d "$REMOTE_APP_DIR/backups" ]]; then
  sudo cp -a "$REMOTE_APP_DIR/backups" "$PRESERVE_DIR/backups"
fi

echo "    [远端] 部署新代码到 $REMOTE_APP_DIR"
sudo rm -rf "$REMOTE_APP_DIR"
sudo mkdir -p "$REMOTE_APP_DIR"
sudo tar -xzf "$REMOTE_TARBALL" -C "$REMOTE_APP_DIR" --strip-components=1
sudo chown -R "$USER_NAME:$USER_NAME" "$REMOTE_APP_DIR"

if [[ -f "$PRESERVE_DIR/.env.production" ]]; then
  cp "$PRESERVE_DIR/.env.production" "$REMOTE_APP_DIR/.env.production"
fi
if [[ -d "$PRESERVE_DIR/prisma" ]]; then
  mkdir -p "$REMOTE_APP_DIR/prisma"
  cp -a "$PRESERVE_DIR"/prisma/production.db* "$REMOTE_APP_DIR/prisma/" || true
fi
if [[ -d "$PRESERVE_DIR/backups" ]]; then
  cp -a "$PRESERVE_DIR/backups" "$REMOTE_APP_DIR/backups"
fi
rm -rf "$PRESERVE_DIR"
sudo chown -R "$USER_NAME:$USER_NAME" "$REMOTE_APP_DIR"

cd "$REMOTE_APP_DIR"
chmod +x scripts/*.sh

if [[ ! -f ".env.production" ]]; then
  GENERATED_AUTH_SECRET="$(openssl rand -hex 32)"
  GENERATED_JWT_SECRET="$(openssl rand -hex 32)"
  GENERATED_CRON_SECRET="$(openssl rand -hex 32)"
  GENERATED_ENCRYPTION_KEY="$(openssl rand -hex 32)"
  GENERATED_ADMIN_PASSWORD="$(openssl rand -base64 32 | tr -d '\n')"
  cat > .env.production <<EOF
DATABASE_URL="file:./production.db"
NEXT_PUBLIC_SITE_URL="${PUBLIC_SCHEME}://${DOMAIN}"
APP_URL="${PUBLIC_SCHEME}://${DOMAIN}"
AUTH_SECRET="${GENERATED_AUTH_SECRET}"
JWT_SECRET="${GENERATED_JWT_SECRET}"
CRON_SECRET="${GENERATED_CRON_SECRET}"
ENCRYPTION_KEY="${GENERATED_ENCRYPTION_KEY}"
VPS_PRIVATE_MODE=1
VPS_PUBLIC_HOST="${DOMAIN}"
VPS_PUBLIC_IP="${EC2_HOST}"
VPS_APP_URL="${PUBLIC_SCHEME}://${DOMAIN}"
VPS_AUTH_SECRET="${GENERATED_AUTH_SECRET}"
VPS_ENCRYPTION_KEY="${GENERATED_ENCRYPTION_KEY}"
VPS_DEFAULT_ENDPOINT_HOST="${DOMAIN}"
VPS_DEFAULT_LISTEN_PORT=51820
VPS_DEFAULT_DNS="1.1.1.1"
VPS_DEFAULT_MTU=1280
VPS_WG_ALLOWED_IPS="10.66.0.0/24"
VPS_CLIENT_ALLOWED_IPS="0.0.0.0/0"
VPS_DEFAULT_PROFILE_EXPIRE_DAYS=180
VPS_ONE_TIME_TOKEN_MINUTES=10
VPS_SHADOWROCKET_TOKEN_DAYS=180
VPS_ALLOW_PUBLIC_STATUS=false
VPS_DRY_RUN=true
VPS_ALLOW_SYSTEM_APPLY=false
ADMIN_EMAIL="${DEFAULT_ADMIN_EMAIL}"
ADMIN_PASSWORD="${GENERATED_ADMIN_PASSWORD}"
NODE_ENV="production"
PORT=${PORT}
EOF
  echo "    [远端] 已创建 .env.production"
  echo "    [远端] 初始后台账号：${DEFAULT_ADMIN_EMAIL}"
  echo "    [远端] 初始后台密码已随机生成并仅保存在远端 .env.production"
else
  set_secret_if_missing() {
    local key="$1"
    local value="$2"
    local current=""
    if grep -q "^${key}=" .env.production; then
      current="$(grep "^${key}=" .env.production | head -n 1 | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//')"
      if [[ -n "$current" && "$current" != replace-with* ]]; then
        return
      fi
      sed -i "/^${key}=/d" .env.production
    fi
    printf '%s="%s"\n' "$key" "$value" >> .env.production
  }

  if grep -q '^NEXT_PUBLIC_SITE_URL=' .env.production; then
    sed -i "s#^NEXT_PUBLIC_SITE_URL=.*#NEXT_PUBLIC_SITE_URL=\"${PUBLIC_SCHEME}://${DOMAIN}\"#" .env.production
  else
    echo "NEXT_PUBLIC_SITE_URL=\"${PUBLIC_SCHEME}://${DOMAIN}\"" >> .env.production
  fi
  if grep -q '^APP_URL=' .env.production; then
    sed -i "s#^APP_URL=.*#APP_URL=\"${PUBLIC_SCHEME}://${DOMAIN}\"#" .env.production
  else
    echo "APP_URL=\"${PUBLIC_SCHEME}://${DOMAIN}\"" >> .env.production
  fi
  if grep -q '^PORT=' .env.production; then
    sed -i "s#^PORT=.*#PORT=${PORT}#" .env.production
  else
    echo "PORT=${PORT}" >> .env.production
  fi
	  if ! grep -q '^VPS_PRIVATE_MODE=' .env.production; then
	    echo "VPS_PRIVATE_MODE=1" >> .env.production
	  fi
	  if ! grep -q '^DATABASE_URL=' .env.production; then
	    echo 'DATABASE_URL="file:./production.db"' >> .env.production
	  fi
	  set_secret_if_missing AUTH_SECRET "$(openssl rand -hex 32)"
  set_secret_if_missing JWT_SECRET "$(openssl rand -hex 32)"
  set_secret_if_missing CRON_SECRET "$(openssl rand -hex 32)"
  set_secret_if_missing ENCRYPTION_KEY "$(openssl rand -hex 32)"
  set_or_replace_env() {
    local key="$1"
    local value="$2"
    if grep -q "^${key}=" .env.production; then
      sed -i "s#^${key}=.*#${key}=\"${value}\"#" .env.production
    else
      printf '%s="%s"\n' "$key" "$value" >> .env.production
    fi
  }
  set_or_replace_env VPS_PUBLIC_HOST "$DOMAIN"
  set_or_replace_env VPS_PUBLIC_IP "$EC2_HOST"
  set_or_replace_env VPS_APP_URL "${PUBLIC_SCHEME}://${DOMAIN}"
  set_or_replace_env VPS_DEFAULT_ENDPOINT_HOST "$DOMAIN"
  if ! grep -q '^VPS_DEFAULT_LISTEN_PORT=' .env.production; then
    echo "VPS_DEFAULT_LISTEN_PORT=51820" >> .env.production
  fi
  if ! grep -q '^VPS_DEFAULT_DNS=' .env.production; then
    echo 'VPS_DEFAULT_DNS="1.1.1.1"' >> .env.production
  fi
  set_or_replace_env VPS_DEFAULT_MTU "1280"
  if ! grep -q '^VPS_WG_ALLOWED_IPS=' .env.production; then
    echo 'VPS_WG_ALLOWED_IPS="10.66.0.0/24"' >> .env.production
  fi
  if ! grep -q '^VPS_CLIENT_ALLOWED_IPS=' .env.production; then
    echo 'VPS_CLIENT_ALLOWED_IPS="0.0.0.0/0"' >> .env.production
  fi
  set_or_replace_env VPS_DEFAULT_PROFILE_EXPIRE_DAYS "180"
  if ! grep -q '^VPS_ONE_TIME_TOKEN_MINUTES=' .env.production; then
    echo "VPS_ONE_TIME_TOKEN_MINUTES=10" >> .env.production
  fi
  set_or_replace_env VPS_SHADOWROCKET_TOKEN_DAYS "180"
  if ! grep -q '^VPS_ALLOW_PUBLIC_STATUS=' .env.production; then
    echo "VPS_ALLOW_PUBLIC_STATUS=false" >> .env.production
  fi
  if ! grep -q '^VPS_DRY_RUN=' .env.production; then
    echo "VPS_DRY_RUN=true" >> .env.production
  fi
  if ! grep -q '^VPS_ALLOW_SYSTEM_APPLY=' .env.production; then
    echo "VPS_ALLOW_SYSTEM_APPLY=false" >> .env.production
  fi
  if ! grep -q '^VPS_AUTH_SECRET=' .env.production; then
    if grep -q '^AUTH_SECRET=' .env.production; then
      grep '^AUTH_SECRET=' .env.production | head -n 1 | sed 's/^AUTH_SECRET=/VPS_AUTH_SECRET=/' >> .env.production
    else
      printf 'VPS_AUTH_SECRET="%s"\n' "$(openssl rand -hex 32)" >> .env.production
    fi
  fi
  if ! grep -q '^VPS_ENCRYPTION_KEY=' .env.production; then
    if grep -q '^ENCRYPTION_KEY=' .env.production; then
      grep '^ENCRYPTION_KEY=' .env.production | head -n 1 | sed 's/^ENCRYPTION_KEY=/VPS_ENCRYPTION_KEY=/' >> .env.production
    else
      printf 'VPS_ENCRYPTION_KEY="%s"\n' "$(openssl rand -hex 32)" >> .env.production
    fi
  fi
  if grep -Eq '^ADMIN_PASSWORD=.*kai.*xuan' .env.production; then
    sed -i '/^ADMIN_PASSWORD=/d' .env.production
    printf 'ADMIN_PASSWORD="%s"\n' "$(openssl rand -base64 32 | tr -d '\n')" >> .env.production
    echo "    [远端] 已轮换旧的固定后台密码，新密码仅保存在远端 .env.production"
  fi
  if ! grep -q '^ADMIN_PASSWORD_HASH=' .env.production && ! grep -q '^ADMIN_PASSWORD=' .env.production; then
    printf 'ADMIN_PASSWORD="%s"\n' "$(openssl rand -base64 32 | tr -d '\n')" >> .env.production
    echo "    [远端] 已生成后台初始密码并仅保存在远端 .env.production"
  fi
  if ! grep -q '^ADMIN_EMAIL=' .env.production; then
    printf 'ADMIN_EMAIL="%s"\n' "$DEFAULT_ADMIN_EMAIL" >> .env.production
  fi
fi

echo "    [远端] 写入 Nginx 配置：${DOMAIN_ALIASES}"
sudo tee "/etc/nginx/conf.d/${APP_NAME}.conf" >/dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN_ALIASES};

    client_max_body_size 20m;

    location ~ ^/api/(vps/access/(download|shadowrocket)|admin/vps/access-profiles/download)/ {
        access_log off;
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl restart nginx

echo "    [远端] 执行项目部署脚本"
APP_NAME="$APP_NAME" APP_DIR="$REMOTE_APP_DIR" PORT="$PORT" RUN_SEED="$RUN_SEED" bash scripts/deploy-amazon-linux-2023.sh

if [[ "$ENABLE_SSL" == "1" ]]; then
  echo "    [远端] 申请或更新 HTTPS 证书"
  sudo dnf install -y certbot python3-certbot-nginx
  sudo certbot --nginx --redirect --non-interactive --agree-tos -m "admin@${DOMAIN}" -d "$DOMAIN" -d "www.${DOMAIN}"
  if [[ -f "/etc/nginx/conf.d/${APP_NAME}.conf" ]]; then
    if ! sudo grep -q 'listen \[::\]:443 ssl' "/etc/nginx/conf.d/${APP_NAME}.conf"; then
      sudo sed -i '/listen 443 ssl/a\    listen [::]:443 ssl; # managed by deploy' "/etc/nginx/conf.d/${APP_NAME}.conf"
    fi
    if ! sudo grep -q 'listen \[::\]:80' "/etc/nginx/conf.d/${APP_NAME}.conf"; then
      sudo sed -i '/listen 80;/a\    listen [::]:80; # managed by deploy' "/etc/nginx/conf.d/${APP_NAME}.conf"
    fi
  fi
  sudo systemctl enable --now certbot-renew.timer >/dev/null 2>&1 || sudo systemctl enable --now certbot.timer >/dev/null 2>&1 || true
  sudo nginx -t
  sudo systemctl reload nginx
fi

echo "    [远端] 本机健康检查"
wait_for_path() {
  local path="$1"
  local url="http://127.0.0.1:${PORT}${path}"
  for attempt in $(seq 1 30); do
    if curl -fsS -o /dev/null "$url"; then
      return 0
    fi
    sleep 2
  done
  echo "    健康检查失败：$url"
  return 1
}

wait_for_path "/"
wait_for_path "/explore"
wait_for_path "/guide"
wait_for_path "/projects"

echo "    [远端] 公网入口检查（DNS 未生效时这里只提示，不阻断部署）"
if curl -fsS --connect-timeout 5 --max-time 15 -o /dev/null "${PUBLIC_SCHEME}://${DOMAIN}/"; then
  echo "    公网首页检查通过：${PUBLIC_SCHEME}://${DOMAIN}/"
else
  echo "    公网首页暂未通过，请确认 DNS A 记录已指向服务器公网 IP：57.180.83.160"
fi

echo "    部署完成：${DOMAIN} -> 127.0.0.1:${PORT}"
echo "    WireGuard 公网防火墙要求：允许 UDP 51820 入站（来源 0.0.0.0/0）"
REMOTE

rm -f "$TARBALL"
if [[ "$ENABLE_SSL" == "1" ]]; then
  echo "==> [本地] 部署完成：https://${DOMAIN}"
else
  echo "==> [本地] 部署完成：http://${DOMAIN}"
fi
