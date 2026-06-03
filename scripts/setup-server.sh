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

echo "正在启用 pnpm 并安装 PM2..."
corepack enable
corepack prepare pnpm@latest --activate
npm install -g pm2

mkdir -p "$APP_DIR"
chown -R ec2-user:ec2-user "$APP_DIR" || true

cat >/etc/nginx/conf.d/${APP_NAME}.conf <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

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

systemctl enable nginx
nginx -t
systemctl restart nginx

echo "正在配置 PM2 开机自启动..."
PM2_CMD="$(pm2 startup systemd -u ec2-user --hp /home/ec2-user | tail -n 1 || true)"
if [[ "$PM2_CMD" == sudo* ]]; then
  eval "${PM2_CMD#sudo }"
fi

echo
echo "服务器初始化完成。"
echo "后续步骤："
echo "1. 将项目代码放到 ${APP_DIR}"
echo "2. 从 .env.production.example 创建 .env.production"
echo "3. 运行：APP_NAME=${APP_NAME} APP_DIR=${APP_DIR} ./scripts/deploy-amazon-linux-2023.sh"
