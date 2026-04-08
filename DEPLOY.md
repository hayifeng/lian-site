# 部署指南

## 环境要求

- Node.js 18+
- PostgreSQL 14+ (生产环境)
- Git
- Nginx (可选，用于反向代理)

## 部署选项

### 选项 A: Vercel + Supabase (推荐)

#### 1. 前端部署 (Vercel)

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 进入前端目录
cd app/frontend

# 3. 配置环境变量
vercel env add VITE_API_URL
# 输入: https://your-api.vercel.app/api

# 4. 部署
vercel --prod
```

#### 2. 数据库 (Supabase)

1. 创建 Supabase 项目
2. 获取连接字符串
3. 更新 `.env.production`

#### 3. 后端部署 (Vercel Serverless Functions)

```bash
# 创建 vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
EOF

# 部署
vercel --prod
```

### 选项 B: Railway (一键部署)

```bash
# 1. 安装 Railway CLI
npm i -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
railway init

# 4. 添加 PostgreSQL
railway add postgresql

# 5. 部署
railway up
```

### 选项 C: 传统 VPS 部署

#### 1. 服务器准备

```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# 安装 Nginx
sudo apt-get install -y nginx

# 安装 PM2
npm i -g pm2
```

#### 2. 数据库设置

```bash
# 创建数据库
sudo -u postgres psql
CREATE DATABASE photo_sharing;
CREATE USER photo_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE photo_sharing TO photo_user;
\q
```

#### 3. 应用部署

```bash
# 克隆代码
git clone https://github.com/yourusername/photo-sharing-site.git
cd photo-sharing-site/project/app

# 安装依赖
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 配置环境变量
cp .env.production backend/.env
# 编辑 backend/.env 添加真实的数据库连接信息

# 构建前端
npm run build:frontend

# 使用 PM2 启动后端
cd backend
pm2 start src/index.ts --name photo-api
pm2 save
pm2 startup
```

#### 4. Nginx 配置

```nginx
# /etc/nginx/sites-available/photo-sharing

upstream api {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 前端静态文件
    location / {
        root /path/to/photo-sharing-site/project/app/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件
    location /uploads {
        alias /path/to/photo-sharing-site/project/app/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# HTTPS 重定向
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### 5. SSL 证书 (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 部署检查清单

### 部署前

- [ ] 所有测试通过 (`npm test`)
- [ ] 环境变量已配置
- [ ] 数据库迁移已运行
- [ ] 种子数据已插入（可选）

### 部署后

- [ ] 健康检查通过 (`GET /api/health`)
- [ ] 用户可以注册和登录
- [ ] 可以上传照片
- [ ] 公开照片页面正常显示
- [ ] HTTPS 已配置
- [ ] 域名已解析

### 监控设置

```bash
# 查看日志
pm2 logs photo-api

# 监控状态
pm2 monit

# 重启服务
pm2 restart photo-api
```

## 故障排除

### 数据库连接失败

1. 检查 `DATABASE_URL` 是否正确
2. 确认数据库服务正在运行
3. 检查防火墙设置

### CORS 错误

1. 确认 `FRONTEND_URL` 配置正确
2. 检查 `CORS_ORIGINS` 包含前端域名

### 文件上传失败

1. 检查 `uploads` 目录权限
2. 确认 `MAX_FILE_SIZE` 足够大
3. 检查磁盘空间

## 性能优化

### 生产构建

```bash
# 前端
npm run build:frontend

# 后端
npm run build:backend
```

### Nginx 缓存

```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 备份策略

```bash
# 数据库备份
pg_dump photo_sharing > backup_$(date +%Y%m%d).sql

# 上传文件备份
tar -czf uploads_$(date +%Y%m%d).tar.gz ./uploads
```
