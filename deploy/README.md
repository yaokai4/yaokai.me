# yaokai.me 一键部署入口

直接在本地 Mac 运行：

```bash
bash /Users/yaokai/Desktop/IT/web/yaokai.me/deploy/deploy.sh
```

这个入口会复用项目里的 `scripts/deploy.sh`，默认部署到 `yaokai.me` 生产服务器。

临时指定私钥或关闭 HTTPS：

```bash
EC2_KEY=/path/to/key.pem bash /Users/yaokai/Desktop/IT/web/yaokai.me/deploy/deploy.sh
ENABLE_SSL=0 bash /Users/yaokai/Desktop/IT/web/yaokai.me/deploy/deploy.sh
```
