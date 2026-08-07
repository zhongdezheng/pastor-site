# package.json 教程 —— 项目依赖与脚本

## 📍 文件位置
`package.json`（项目根目录）

## 🎯 用途
Node.js / npm 项目的标准配置文件，定义：
- 项目名称和版本
- npm 脚本（dev、build、preview）
- 运行时依赖
- 开发依赖

## 📋 字段说明

| 字段路径 | 类型 | 示例值 | 说明 |
|---------|------|--------|------|
| `name` | string | `"pastor-site"` | 项目名称 |
| `version` | string | `"1.0.0"` | 版本号 |
| `type` | string | `"module"` | ES 模块模式（能用 `import`） |
| `scripts.dev` | string | `"astro dev"` | 启动开发服务器 |
| `scripts.build` | string | `"astro build"` | 构建生产版本 |
| `scripts.preview` | string | `"astro preview"` | 预览构建结果 |
| `dependencies` | object | 见下方 | 生产依赖 |
| `devDependencies` | object | 见下方 | 仅开发时依赖 |

### 依赖列表

| 包名 | 用途 |
|------|------|
| `astro` | Astro 框架核心 |
| `@astrojs/cloudflare` | Cloudflare Pages 部署适配器 |
| `@astrojs/tailwind` | Tailwind CSS 集成 |
| `tailwindcss` | Tailwind CSS v3 |
| `@supabase/supabase-js` | Supabase 数据库客户端 |
| `nanostores` | 状态管理 |
| `@nanostores/persistent` | 持久化状态 |
| `swiper` | 轮播/Swiper 组件 |
| `@astrojs/check` | Astro 类型检查 |
| `typescript` (dev) | TypeScript |

## ✏️ 修改指南

### 🟢 安全修改
- **改版本号** → `version`

### 🔴 不能改 / 改了会崩
- **不要随意删依赖** — 删了可能导致 `npm i` 后缺失关键包，页面崩溃
- **不要改 `type`** — `"module"` 模式影响整个项目的 import/export 语法
- **不要乱改 `scripts`** — dev/build/preview 是 Astro 项目命脉
- **升级依赖有风险** — 大版本升级（如 Astro 5→6）可能破坏兼容性，需测试后再升级
- **不要改 `name`** — 虽然不影响运行，但可能影响部署配置（如 Cloudflare project name）

## 📦 谁读取它
- **npm / pnpm**：安装依赖、运行脚本
- **Cloudflare Pages**：构建时自动运行 `npm run build`
- **Astro**：根据 `@astrojs/cloudflare` 决定输出模式
