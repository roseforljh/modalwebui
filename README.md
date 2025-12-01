# Z-Image-Turbo 前端部署指南

本指南将帮助您在 VPS 上使用 Docker 快速部署 Z-Image-Turbo 前端服务，并实现开机自启和自动保活。

## 1. 环境准备

确保您的 VPS 已安装 Docker 和 Docker Compose。

### Ubuntu / Debian 安装 Docker:
```bash
# 更新软件源
sudo apt update

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker 并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

## 2. 部署步骤

### 第一步：上传代码
将项目文件上传到您的 VPS（例如 `/opt/z-image-turbo` 目录）。您可以使用 `scp` 或 `git clone`。

### 第二步：启动服务
进入项目目录并运行以下命令：

```bash
# 进入项目目录
cd /path/to/your/project

# 构建并后台启动容器
docker compose up -d --build
```

## 3. 验证部署

服务启动后，默认运行在 **18080** 端口。
请在浏览器访问：`http://<您的VPS_IP>:18080`

## 4. 常用维护命令

```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 更新代码后重新部署
git pull
docker compose up -d --build
```

## 5. 自动保活与开机自启

我们在 `docker-compose.yml` 中配置了 `restart: always` 策略：
- **开机自启**：当 VPS 重启后，Docker 守护进程启动时会自动拉起该容器。
- **自动保活**：如果容器因错误意外退出，Docker 会自动尝试重启它。

无需额外配置脚本即可实现高可用。