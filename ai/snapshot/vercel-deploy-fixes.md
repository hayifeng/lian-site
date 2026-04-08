# Vercel 部署问题与解决方案

> 生成时间: 2026-04-09
> 项目: hayifeng-site (原 lian-site)

---

## 问题汇总

### 1. 项目目录结构问题

**现象**: Vercel 构建提示 "No framework detected" 或 "找不到 app/frontend 目录"

**原因**: 项目采用 monorepo 结构，前端代码位于 `app/frontend/` 子目录，但 Vercel 默认在根目录查找配置。

**解决方案**:
```json
// vercel.json 放在 app/frontend/ 目录下
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**关键配置**:
- 在 Vercel 控制台设置 **Root Directory** 为 `app/frontend`
- `vercel.json` 必须放在指定的 Root Directory 内

---

### 2. TypeScript 编译错误

#### 2.1 测试文件包含 JSX 但使用 .ts 扩展名

**错误信息**:
```
src/test/api.test.ts(28,30): error TS1161: Unterminated regular expression literal.
```

**原因**: `.ts` 文件不能包含 JSX 语法，编译器将 `<AuthProvider>` 误解析为泛型。

**解决方案**:
```bash
# 重命名文件扩展名
mv api.test.ts api.test.tsx
```

**并排除测试文件**:
```json
// tsconfig.app.json
{
  "include": ["src"],
  "exclude": ["src/test"]
}
```

#### 2.2 类型定义不完整

**错误信息**:
```
Type '{ id: string; name: string; }' is missing the following properties from type 'User': email
```

**原因**: 示例数据缺少 `Photo` 和 `User` 类型要求的必填字段。

**解决方案**:
```typescript
// 在 usePhotos.ts 中补充缺失字段
function generateSamplePhotos(count: number): Photo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `sample-${i}`,
    // ... 其他字段
    filename: `sample_${i + 1}.jpg`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: { id: '', email: 'demo@example.com', name: '示例用户' },
  }));
}
```

---

### 3. Tailwind CSS v4 配置问题

#### 3.1 PostCSS 配置错误

**错误信息**:
```
Error: [postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
```

**原因**: Tailwind CSS v4 将 PostCSS 插件从 `tailwindcss` 分离到独立包。

**解决方案**:
```bash
# 安装 @tailwindcss/vite 插件
npm install @tailwindcss/vite
```

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

```javascript
// postcss.config.js - 移除 tailwindcss 插件
export default {
  plugins: {
    autoprefixer: {},
  },
}
```

#### 3.2 CSS 导入语法过时

**错误信息**:
```
Error: Cannot apply unknown utility class `from-primary-500`
```

**原因**: Tailwind CSS v4 使用新的 CSS-first 配置方式，不再自动读取 `tailwind.config.js`。

**解决方案**:
```css
/* index.css */
@import "tailwindcss";

@theme {
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-300: #7dd3fc;
  --color-primary-400: #38bdf8;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-800: #075985;
  --color-primary-900: #0c4a6e;
}
```

---

### 4. Node.js 版本要求

**错误信息**:
```
You are using Node.js 20.18.0. Vite requires Node.js version 20.19+ or 22.12+.
```

**解决方案**:
```bash
# 使用 fnm 升级
fnm install 22
fnm use 22

# 或使用 nvm
nvm install 22
nvm use 22
```

**package.json engines 配置**:
```json
{
  "engines": {
    "node": ">=20.19.0"
  }
}
```

---

### 5. npm workspace 配置冲突

**原因**: `app/package.json` 中配置了 `workspaces`，导致 `node_modules` 安装到父目录，与子项目依赖冲突。

**解决方案**:
```json
// app/package.json - 移除 workspaces 配置
{
  "name": "photo-sharing-site",
  "private": true,
  // 移除 "workspaces": ["frontend", "backend"]
}
```

---

## 最终配置清单

### 目录结构
```
project/
├── app/
│   ├── frontend/
│   │   ├── vercel.json          # SPA 路由配置
│   │   ├── package.json
│   │   ├── package-lock.json    # 提交到 GitHub
│   │   ├── vite.config.ts       # 包含 @tailwindcss/vite
│   │   └── src/
│   │       └── index.css         # @import "tailwindcss" + @theme
│   └── backend/
└── package.json                  # 根目录用于 Vercel 构建
```

### Vercel 控制台设置
| 配置项 | 值 |
|--------|-----|
| Root Directory | `app/frontend` |
| Framework Preset | `Vite` |
| Build Command | (留空，自动检测) |
| Output Directory | (留空，默认 `dist`) |

### 关键依赖版本
| 依赖 | 版本 |
|------|------|
| Vite | ^8.0.4 |
| Tailwind CSS | ^4.2.2 |
| @tailwindcss/vite | ^4.2.2 |
| React | ^19.2.4 |
| Node.js | >=20.19.0 |

---

## 部署命令

```bash
# 本地开发
cd app/frontend
npm install
npm run dev

# 推送代码后 Vercel 自动构建
git push
```

## 访问地址

- 本地: http://localhost:5173
- Vercel: https://lian-site.vercel.app (或自定义域名)
