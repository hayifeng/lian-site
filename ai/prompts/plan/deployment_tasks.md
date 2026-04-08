# 部署任务列表 (O1-O7)

## 部署选项
- **选项A**: Vercel（前端）+ Supabase（数据库+后端函数）
- **选项B**: Railway/Render（全栈部署）
- **选项C**: 传统VPS（需要更多配置）

## 任务列表

### O1: 配置生产环境变量
**输入**: 开发环境配置
**输出**: 生产环境变量文件（.env.production）或平台环境变量设置
**依赖关系**: 所有开发任务完成
**说明**: 配置数据库连接字符串、JWT密钥、文件存储配置等

### O2: 构建前端生产包
**输入**: 所有前端任务完成（F1-F23）
**输出**: 优化后的前端静态文件（dist/或build/目录）
**依赖关系**: 所有前端任务
**说明**: 运行构建命令，生成生产优化的前端资源

### O3: 部署后端服务
**输入**: 所有后端任务完成（B1-B11），O1环境变量
**输出**: 线上可访问的API地址
**依赖关系**: 所有后端任务，O1
**说明**: 部署Express应用到云平台，配置进程管理（如PM2）

### O4: 部署数据库
**输入**: D3迁移脚本，O1环境变量
**输出**: 线上数据库连接字符串
**依赖关系**: D3, O1
**说明**: 创建生产数据库实例，运行迁移脚本

### O5: 配置CDN/静态资源托管
**输入**: O2构建的前端资源，O4数据库（用于图片存储）
**输出**: 前端页面线上地址，图片CDN地址
**依赖关系**: O2, O4
**说明**: 部署前端到Vercel等平台，配置图片文件存储（如AWS S3+CloudFront）

### O6: 设置域名与HTTPS
**输入**: O3后端地址，O5前端地址
**输出**: 自定义域名访问，SSL证书配置
**依赖关系**: O3, O5
**说明**: 配置域名DNS，申请SSL证书，设置HTTPS重定向

### O7: 监控与告警（可选）
**输入**: 线上服务运行
**输出**: 健康检查端点，错误追踪配置
**依赖关系**: O3, O5
**说明**: 设置应用监控（如Sentry），配置告警规则

## 部署详细说明

### Vercel + Supabase 方案
1. **前端部署**: 将 `app/frontend/` 连接到Vercel，自动部署
2. **后端部署**: 使用Supabase Edge Functions或Vercel Serverless Functions
3. **数据库**: 使用Supabase PostgreSQL
4. **文件存储**: 使用Supabase Storage 或 Vercel Blob

### Railway 全栈方案
1. 将整个 `app/` 目录部署到Railway
2. 配置PostgreSQL插件
3. 设置环境变量
4. 自动部署Git分支

### 环境变量清单
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
UPLOAD_PATH=/uploads 或云存储配置
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

## 执行建议
1. 先完成所有开发任务再进行部署
2. 按顺序：环境变量→数据库→后端→前端→域名
3. 部署后立即进行冒烟测试
4. 保留回滚方案
