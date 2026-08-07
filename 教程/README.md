# pastor-site 代码修改教程 📖

> pastorjeffnchina.com 网站维护手册 · 全部教程文件统一索引

## 📂 教程目录

### content/ — JSON 内容数据教程（9 个）

| 教程文件 | 对应 JSON | 改什么 |
|---------|----------|--------|
| [site-教程.md](content/site-教程.md) | `src/content/site.json` | 网站名、WhatsApp、邮箱 |
| [hero-教程.md](content/hero-教程.md) | `src/content/hero.json` | 牧师姓名、头衔、经文 |
| [vision-教程.md](content/vision-教程.md) | `src/content/vision.json` | 异象页长文本 |
| [scriptures-教程.md](content/scriptures-教程.md) | `src/content/scriptures.json` | 经文轮播卡片 |
| [testimonies-教程.md](content/testimonies-教程.md) | `src/content/testimonies.json` | 见证文章 |
| [products-教程.md](content/products-教程.md) | `src/content/products.json` | 商品数据 |
| [courses-教程.md](content/courses-教程.md) | `src/content/courses.json` | 课程列表 |
| [prayer-settings-教程.md](content/prayer-settings-教程.md) | `src/content/prayer-settings.json` | 代祷页经文和引导语 |
| [schema-教程.md](content/schema-教程.md) | `src/content/schema.sql` | D1 建表脚本 |

### data/ — 数据文件教程（1 个）

| 教程文件 | 对应文件 | 改什么 |
|---------|---------|--------|
| [countries-教程.md](data/countries-教程.md) | `src/data/countries.json` | 地球仪国家坐标 |

### public/ — 公共文件教程（1 个）

| 教程文件 | 对应文件 | 改什么 |
|---------|---------|--------|
| [_redirects-教程.md](public/_redirects-教程.md) | `public/_redirects` | URL 重定向规则 |

### 项目配置教程（1 个）

| 教程文件 | 对应文件 | 改什么 |
|---------|---------|--------|
| [package-教程.md](package-教程.md) | `package.json` | 依赖管理与构建脚本 |

---

## 📝 代码文件注释

以下 48 个代码文件**内嵌文件头注释**（打开即见），不需要额外教程文件：

| 类型 | 数量 | 代表文件 |
|------|------|---------|
| 页面 (.astro) | 34 | `src/pages/en/index.astro` 等 |
| 组件 (.astro) | 8 | `Hero.astro`, `PrayerForm.astro` 等 |
| 工具类 (.ts/.js) | 5 | `supabase.ts`, `cart.ts`, `prayer.js` |
| 配置 (.mjs/.css) | 4 | `astro.config.mjs`, `tailwind.config.mjs`, `global.css` |
| 数据库 (.sql) | 2 | `schema.sql`, `supabase-schema.sql` |

---

## 📄 汇总文档

- **[pastor-site 代码修改指南.docx](/Users/jeff/Desktop/pastor-site%20代码修改指南.docx)** — Word 版，含封面 + 5 章 + 附录
- **[pastor-site 代码修改指南.html](/Users/jeff/Desktop/pastor-site%20代码修改指南.html)** — 浏览器预览版

---

## 🔍 快速查找

**想改什么 → 打开哪个教程：**

| 任务 | 教程 |
|------|------|
| 修改网站名/WhatsApp号 | [site-教程](content/site-教程.md) |
| 修改牧师姓名/头衔/经文 | [hero-教程](content/hero-教程.md) |
| 修改异象内容 | [vision-教程](content/vision-教程.md) |
| 修改经文卡片 | [scriptures-教程](content/scriptures-教程.md) |
| 添加/修改见证文章 | [testimonies-教程](content/testimonies-教程.md) |
| 修改商品 | [products-教程](content/products-教程.md) |
| 修改课程 | [courses-教程](content/courses-教程.md) |
| 修改代祷页内容 | [prayer-settings-教程](content/prayer-settings-教程.md) |
| 修改品牌色/字体 | 打开 tailwind.config.mjs + global.css |
| 修改导航/布局 | 打开 BaseLayout.astro |
| 修改地球仪国家 | [countries-教程](data/countries-教程.md) |
