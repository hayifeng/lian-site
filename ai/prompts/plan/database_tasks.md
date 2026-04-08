# 数据库任务列表 (D1-D4)

## 技术栈要求
- PostgreSQL（生产） / SQLite（开发）
- Prisma ORM 或 Drizzle ORM
- 数据库迁移工具

## 任务列表

### D1: 设计数据库Schema
**输入**: 项目需求文档
**输出**: 数据库ER图、Schema定义文件（如schema.prisma）
**依赖关系**: 无
**说明**: 设计User和Photo表结构，包含必要字段和关系

### D2: 初始化数据库连接与ORM
**输入**: B1 后端项目初始化完成
**输出**: 配置好的ORM实例，数据库连接配置
**依赖关系**: B1
**说明**: 安装ORM包，配置数据库连接字符串，创建ORM客户端

### D3: 创建迁移脚本
**输入**: D1, D2 的输出
**输出**: 可执行的数据库迁移文件
**依赖关系**: D1, D2
**说明**: 根据Schema生成迁移脚本，创建初始表结构

### D4: 种子数据（可选）
**输入**: D3 的输出
**输出**: 开发用的初始数据
**依赖关系**: D3
**说明**: 创建种子脚本，插入测试用户和照片数据

## 数据模型设计参考

### User 表
- id: 主键
- email: 唯一，用于登录
- passwordHash: 加密后的密码
- name: 显示名称
- createdAt: 创建时间
- updatedAt: 更新时间

### Photo 表
- id: 主键
- userId: 外键关联User
- filename: 存储的文件名
- originalName: 原始文件名
- fileSize: 文件大小
- mimeType: 文件类型
- title: 照片标题（可选）
- description: 描述（可选）
- isPublic: 是否公开（默认true）
- uploadPath: 存储路径
- createdAt: 上传时间
- updatedAt: 更新时间

## 执行建议
1. D1 Schema设计应尽早完成，为前后端开发提供数据模型参考
2. D2 需要后端项目结构（B1）完成后进行
3. D3 迁移脚本应在Schema确定后立即创建
4. D4 种子数据可选，但建议开发环境使用
