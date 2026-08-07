# hero.json 教程 —— 首页大图内容

## 📍 文件位置
`src/content/hero.json`

## 🎯 用途
被 **Hero.astro**（首页大图组件）读取，显示：
- 牧师姓名和头衔
- 简介文字
- 引用经文及出处

## 📋 字段说明

| 字段路径 | 类型 | 示例值 | 说明 |
|---------|------|--------|------|
| `en.name` | string | `"Pastor Jeff"` | 牧师英文姓名，显示在大图上 |
| `en.title` | string | `"A Young Pastor from China"` | 英文头衔 |
| `en.preview` | string | `"At a very young age..."` | 英文简介，展示在姓名下方 |
| `en.verse` | string | `"\"My grace is sufficient for you...\""` | 英文经文，带引号 |
| `en.verseRef` | string | `"— 2 Corinthians 12:9"` | 英文经文出处 |
| `zh.name` | string | `"杰夫牧师"` | 中文姓名 |
| `zh.title` | string | `"一位来自中国的年轻牧师"` | 中文头衔 |
| `zh.preview` | string | `"在我很年轻的时候..."` | 中文简介 |
| `zh.verse` | string | `"「我的恩典够你用的...」 "` | 中文经文 |
| `zh.verseRef` | string | `"— 哥林多后书 12:9"` | 中文经文出处 |

## ✏️ 修改指南

### 🟢 安全修改
- **改牧师姓名** → `en.name`（英文）或 `zh.name`（中文）
- **改头衔** → `en.title` / `zh.title`
- **改简介文字** → `en.preview` / `zh.preview`
- **换圣经经文** → `en.verse` + `en.verseRef` / `zh.verse` + `zh.verseRef`

### 🔴 不能改 / 改了会崩
- **不要删除 `en` 或 `zh` 对象** — Hero.astro 同时读取中英文
- **不要改动顶层结构** — `en` 和 `zh` 必须作为两个独立对象存在
- **不要删 `verseRef`** — 经文出处和经文是配对显示的
- **preview 是简介而非全篇** — 大图区域空间有限，内容不宜太长
- **JSON 格式** — 英文引号内如含双引号需转义 `\"`

## 📦 被哪些组件读取
- **Hero.astro**：读取整个 hero.json，中英双语展示
