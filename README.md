# 个人照片分享网站项目

## 项目概述
交互式个人照片分享网站，包含四个展示页面和一个管理页面。

## 功能模块
1. **环形展示页面** - 图片圆形轨道展示，支持滚动旋转交互
2. **3D轮播页面** - 3D透视轮播画廊，自动循环与景深效果
3. **泡泡头像筛选页面** - 自由浮动头像，悬停筛选与视差滚动
4. **照片管理页面** - 支持照片上传、删除等操作（需登录）

## 技术架构
- **前端**: React + TypeScript + Vite，动画使用 Framer Motion/Three.js
- **后端**: Node.js + Express，JWT认证
- **数据库**: PostgreSQL (开发可用SQLite)，Prisma ORM
- **部署**: Vercel + Supabase 或全栈平台

## 项目结构
```
project/
├── app/                    # 主项目代码
│   ├── frontend/          # 前端页面
│   ├── backend/           # 后端接口
│   ├── database/          # 数据库设计
│   └── package.json
├── ai/                    # AI开发层
│   ├── prompts/           # AI提示词
│   ├── scripts/           # 自动化脚本
│   └── config/            # 模型配置
├── .gitignore
└── README.md
```

## 开发说明
1. 详细任务分解见 `ai/prompts/` 目录
2. 按前端→后端→数据库→集成的顺序开发
3. 每个任务独立可执行，有明确输入输出

## 快速开始
```bash
cd project/app
npm install
# 详细启动步骤见各模块README
```

## 许可证
私有项目，仅供学习开发使用
