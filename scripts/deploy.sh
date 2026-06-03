#!/usr/bin/env bash
set -euo pipefail

# 本地一键部署入口：
#   npm run deploy
#
# 默认部署到 yaokai.me / 52.194.191.244。私钥只在本地 SSH 时引用，不会被打包上传。

EC2_USER="${EC2_USER:-ec2-user}"
EC2_HOST="${EC2_HOST:-52.194.191.244}"
EC2_KEY="${EC2_KEY:-/Users/yaokai/Desktop/it/ios/Machi2.pem}"
if [[ ! -f "$EC2_KEY" && -f "/Users/yaokai/Desktop/IT/ios/Machi2.pem" ]]; then
  EC2_KEY="/Users/yaokai/Desktop/IT/ios/Machi2.pem"
fi

DOMAIN="${DOMAIN:-yaokai.me}"
DOMAIN_ALIASES="${DOMAIN_ALIASES:-yaokai.me www.yaokai.me}"
APP_NAME="${APP_NAME:-yaokai-me}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/var/www/yaokai.me}"
PORT="${PORT:-3000}"
RUN_SEED="${RUN_SEED:-1}"
ENABLE_SSL="${ENABLE_SSL:-0}"

LOCAL_PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
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
REMOTE_ENV="APP_NAME=$(quote "$APP_NAME") REMOTE_APP_DIR=$(quote "$REMOTE_APP_DIR") DOMAIN=$(quote "$DOMAIN") DOMAIN_ALIASES=$(quote "$DOMAIN_ALIASES") PORT=$(quote "$PORT") RUN_SEED=$(quote "$RUN_SEED") ENABLE_SSL=$(quote "$ENABLE_SSL") REMOTE_TARBALL=$(quote "$REMOTE_TARBALL")"

echo "==> [本地] 项目目录：$LOCAL_PROJECT_DIR"
dot_clean "$LOCAL_PROJECT_DIR" 2>/dev/null || true

echo "==> [本地] 打包项目，排除本地环境变量、数据库、构建产物和依赖目录"
cd "$(dirname "$LOCAL_PROJECT_DIR")"
COPYFILE_DISABLE=1 tar \
  --exclude="yaokai.me/.next" \
  --exclude="yaokai.me/node_modules" \
  --exclude="yaokai.me/tsconfig.tsbuildinfo" \
  --exclude="yaokai.me/.env" \
  --exclude="yaokai.me/.env.local" \
  --exclude="yaokai.me/.env.production" \
  --exclude="yaokai.me/prisma/dev.db" \
  --exclude="yaokai.me/prisma/production.db" \
  --exclude="yaokai.me/prisma/*.db" \
  --exclude="yaokai.me/backups" \
  --exclude="yaokai.me/.git" \
  --exclude="*/.DS_Store" \
  --exclude="*/._*" \
  -czf "$TARBALL" "yaokai.me/"

SIZE_MB="$(du -m "$TARBALL" | cut -f1)"
echo "    包大小：${SIZE_MB}MB"

echo "==> [本地] 上传到 ${EC2_USER}@${EC2_HOST}"
scp "${SSH_OPTS[@]}" -C -q "$TARBALL" "${EC2_USER}@${EC2_HOST}:${REMOTE_TARBALL}"

echo "==> [远端] 解压、保留生产数据、安装依赖、迁移、构建、重启"
ssh "${SSH_OPTS[@]}" "${EC2_USER}@${EC2_HOST}" "$REMOTE_ENV bash -s" <<'REMOTE'
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
USER_NAME="${SUDO_USER:-ec2-user}"

need_base_setup=0
for cmd in node pnpm pm2 nginx; do
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
  sudo npm install -g pm2
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

cd "$REMOTE_APP_DIR"
chmod +x scripts/*.sh

if [[ ! -f ".env.production" ]]; then
  GENERATED_SECRET="$(openssl rand -hex 32)"
  GENERATED_PASSWORD="$(openssl rand -base64 24)"
  cat > .env.production <<EOF
DATABASE_URL="file:./production.db"
NEXT_PUBLIC_SITE_URL="https://${DOMAIN}"
JWT_SECRET="${GENERATED_SECRET}"
ADMIN_EMAIL="yaokai"
ADMIN_PASSWORD="kaixuan2390166"
NODE_ENV="production"
PORT=${PORT}
EOF
  echo "    [远端] 已创建 .env.production"
  echo "    [远端] 初始后台账号：yaokai"
  echo "    [远端] 初始后台密码：kaixuan2390166"
else
  if grep -q '^NEXT_PUBLIC_SITE_URL=' .env.production; then
    sed -i "s#^NEXT_PUBLIC_SITE_URL=.*#NEXT_PUBLIC_SITE_URL=\"https://${DOMAIN}\"#" .env.production
  else
    echo "NEXT_PUBLIC_SITE_URL=\"https://${DOMAIN}\"" >> .env.production
  fi
  if grep -q '^PORT=' .env.production; then
    sed -i "s#^PORT=.*#PORT=${PORT}#" .env.production
  else
    echo "PORT=${PORT}" >> .env.production
  fi
fi

echo "    [远端] 写入 Nginx 配置：${DOMAIN_ALIASES}"
sudo tee "/etc/nginx/conf.d/${APP_NAME}.conf" >/dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN_ALIASES};

    client_max_body_size 20m;

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
sudo systemctl restart nginx

echo "    [远端] 执行项目部署脚本"
APP_NAME="$APP_NAME" APP_DIR="$REMOTE_APP_DIR" PORT="$PORT" RUN_SEED="$RUN_SEED" bash scripts/deploy-amazon-linux-2023.sh

if [[ "$ENABLE_SSL" == "1" ]]; then
  echo "    [远端] 申请或更新 HTTPS 证书"
  sudo dnf install -y certbot python3-certbot-nginx
  sudo certbot --nginx --non-interactive --agree-tos -m "admin@${DOMAIN}" -d "$DOMAIN" -d "www.${DOMAIN}"
  sudo systemctl enable --now certbot-renew.timer >/dev/null 2>&1 || sudo systemctl enable --now certbot.timer >/dev/null 2>&1 || true
fi

echo "    [远端] 本机健康检查"
curl -fsS -o /dev/null "http://127.0.0.1:${PORT}/"
curl -fsS -o /dev/null "http://127.0.0.1:${PORT}/explore"
curl -fsS -o /dev/null "http://127.0.0.1:${PORT}/guide"
curl -fsS -o /dev/null "http://127.0.0.1:${PORT}/projects"

PUBLIC_SCHEME="http"
if [[ "$ENABLE_SSL" == "1" ]]; then
  PUBLIC_SCHEME="https"
fi

echo "    [远端] 公网入口检查（DNS 未生效时这里只提示，不阻断部署）"
if curl -fsS --connect-timeout 5 --max-time 15 -o /dev/null "${PUBLIC_SCHEME}://${DOMAIN}/"; then
  echo "    公网首页检查通过：${PUBLIC_SCHEME}://${DOMAIN}/"
else
  echo "    公网首页暂未通过，请确认 DNS A 记录已指向服务器公网 IP：52.194.191.244"
fi

echo "    部署完成：${DOMAIN} -> 127.0.0.1:${PORT}"
REMOTE

rm -f "$TARBALL"
echo "==> [本地] 部署完成：https://${DOMAIN}"
