#!/usr/bin/env bash

# yaokai.me 一键部署脚本（在本地 Mac 运行）
#
# 用法：
#   bash /Users/yaokai/Desktop/IT/web/yaokai.me/deploy/deploy.sh
#
# 默认会部署到当前生产环境：
#   ssh -i /Users/yaokai/Desktop/it/ios/machiL.pem ec2-user@57.180.83.160
#
# 如需临时覆盖配置：
#   EC2_KEY=/path/to/key.pem ENABLE_SSL=1 bash /Users/yaokai/Desktop/IT/web/yaokai.me/deploy/deploy.sh

set -euo pipefail

# ================= 固定生产配置 =================
LOCAL_PROJECT_DIR="/Users/yaokai/Desktop/IT/web/yaokai.me"
EC2_USER="${EC2_USER:-ec2-user}"
EC2_HOST="${EC2_HOST:-57.180.83.160}"
EC2_KEY="${EC2_KEY:-/Users/yaokai/Desktop/it/ios/machiL.pem}"
DOMAIN="${DOMAIN:-yaokai.me}"
DOMAIN_ALIASES="${DOMAIN_ALIASES:-yaokai.me www.yaokai.me}"
APP_NAME="${APP_NAME:-yaokai-me}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/var/www/yaokai.me}"
PORT="${PORT:-3000}"
RUN_SEED="${RUN_SEED:-1}"
ENABLE_SSL="${ENABLE_SSL:-1}"
# =================================================

DEPLOY_SCRIPT="$LOCAL_PROJECT_DIR/scripts/deploy.sh"

if [[ ! -d "$LOCAL_PROJECT_DIR" ]]; then
  echo "找不到项目目录：$LOCAL_PROJECT_DIR" >&2
  exit 1
fi

if [[ ! -f "$DEPLOY_SCRIPT" ]]; then
  echo "找不到部署脚本：$DEPLOY_SCRIPT" >&2
  exit 1
fi

if [[ ! -f "$EC2_KEY" && -f "/Users/yaokai/Desktop/IT/ios/machiL.pem" ]]; then
  EC2_KEY="/Users/yaokai/Desktop/IT/ios/machiL.pem"
fi

echo "==> 一键部署 yaokai.me"
echo "    本地项目：$LOCAL_PROJECT_DIR"
echo "    远端主机：$EC2_USER@$EC2_HOST"
echo "    远端目录：$REMOTE_APP_DIR"
echo "    站点域名：$DOMAIN"
echo "    HTTPS：$ENABLE_SSL"

cd "$LOCAL_PROJECT_DIR"

export EC2_USER
export EC2_HOST
export EC2_KEY
export DOMAIN
export DOMAIN_ALIASES
export APP_NAME
export REMOTE_APP_DIR
export PORT
export RUN_SEED
export ENABLE_SSL

exec bash "$DEPLOY_SCRIPT"
