# testimonies.json 教程 —— 见证文章列表

## 📍 文件位置
`src/content/testimonies.json`

## 🎯 用途
被见证页面读取，用于展示：
- 列表页：标题、摘要、日期、作者
- 详情页：完整见证正文

## 📋 字段说明

| 字段路径 | 类型 | 示例值 | 说明 |
|---------|------|--------|------|
| `[].id` | number | `1` | 唯一 ID，用于标识和索引 |
| `[].title.en` | string | `"Pastor Jeff's Personal Testimony..."` | 英文标题 |
| `[].title.zh` | string | `"Jeff牧师的个人见证..."` | 中文标题 |
| `[].date` | string | `"2025-01-15"` | 日期（YYYY-MM-DD 格式） |
| `[].author.en` | string | `"Pastor Jeff"` | 英文作者名 |
| `[].author.zh` | string | `"Jeff牧师"` | 中文作者名 |
| `[].excerpt.en` | string | `"At a very young age..."` | 英文摘要（列表页展示） |
| `[].excerpt.zh` | string | `"在很小的时候..."` | 中文摘要 |
| `[].content.en` | string | 长文本 | 英文完整正文（含 `\n` 换行） |
| `[].content.zh` | string | 长文本 | 中文完整正文 |

数据结构：**JSON 数组**。

## ✏️ 修改指南

### 🟢 安全修改
- **改正文** → `[0].content.zh` / `[0].content.en`
- **改摘要** → `[0].excerpt.zh` / `[0].excerpt.en`
- **改标题** → `[0].title.zh` / `[0].title.en`
- **改日期** → `[0].date`，保持 `YYYY-MM-DD` 格式
- **新增见证** → 在数组中追加一个对象，id 不要重复

### 🔴 不能改 / 改了会崩
- **id 必须唯一** — 页面可能根据 id 做路由匹配
- **content 中 `\n` 不能丢** — 丢失会导致段落合在一起
- **date 格式必须是 YYYY-MM-DD** — 不要用其他格式
- **别删 `excerpt`** — 列表页会用到摘要
- **双引号转义** — content 中的半角双引号必须转义为 `\"`

## 📦 被哪些组件读取
- 见证列表页：读取 `title`、`excerpt`、`date`、`author`
- 见证详情页：按 `id` 查找，读取 `content`
