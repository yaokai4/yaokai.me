#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-yaokai-me}"
APP_DIR="${APP_DIR:-/var/www/yaokai.me}"
PORT="${PORT:-3000}"
DOMAIN="${DOMAIN:-yaokai.me www.yaokai.me}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请使用 root 权限运行：sudo ./scripts/setup-server.sh"
  exit 1
fi

ensure_swap() {
  local swap_mb
  swap_mb="$(free -m | awk '/^Swap:/ {print $2}')"
  if [[ -n "$swap_mb" && "$swap_mb" -ge 1024 ]]; then
    return
  fi

  echo "正在配置 2GB swap..."
  if [[ ! -f /swapfile ]]; then
    fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile 2>/dev/null || true
  if ! grep -qE '^/swapfile\s' /etc/fstab; then
    echo "/swapfile none swap sw 0 0" >> /etc/fstab
  fi
}

echo "正在更新 Amazon Linux 2023 软件包..."
dnf update -y
dnf install -y git nginx tar gzip sqlite
if ! command -v curl >/dev/null 2>&1; then
  dnf install -y curl-minimal || dnf install -y curl --allowerasing
fi

if ! command -v node >/dev/null 2>&1; then
  echo "正在安装 Node.js LTS..."
  curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
  dnf install -y nodejs
fi

echo "正在启用 pnpm..."
corepack enable
corepack prepare pnpm@latest --activate
ensure_swap

mkdir -p "$APP_DIR"
chown -R ec2-user:ec2-user "$APP_DIR" || true

cat >/etc/nginx/conf.d/${APP_NAME}.conf <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

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

systemctl enable nginx
nginx -t
systemctl restart nginx

echo
echo "服务器初始化完成。"
echo "后续步骤："
echo "1. 将项目代码放到 ${APP_DIR}"
echo "2. 从 .env.production.example 创建 .env.production"
echo "3. 运行：APP_NAME=${APP_NAME} APP_DIR=${APP_DIR} ./scripts/deploy-amazon-linux-2023.sh"
