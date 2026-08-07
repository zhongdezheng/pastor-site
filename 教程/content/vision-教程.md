# vision.json 教程 —— 全球异象页面内容

## 📍 文件位置
`src/content/vision.json`

## 🎯 用途
被 **VisionSection.astro** 读取，用于展示：
- 全球异象标题
- 长文本内容（包含策略、经文引用、行动号召等）

## 📋 字段说明

| 字段路径 | 类型 | 示例值 | 说明 |
|---------|------|--------|------|
| `zh.title` | string | `"全球异象"` | 中文标题 |
| `zh.content` | string | 长文本（多行） | 中文正文，包含 `\n` 换行符 |
| `en.title` | string | `"Global Vision"` | 英文标题 |
| `en.content` | string | 长文本（多行） | 英文正文，包含 `\n` 换行符 |

## ✏️ 修改指南

### 🟢 安全修改
- **改标题** → `zh.title` / `en.title`
- **改正文** → `zh.content` / `en.content`

### 🔴 不能改 / 改了会崩
- **不要删除 `zh` 或 `en` 对象** — 页面中英文切换依赖两者都存在
- **换行用 `\n`** — 不要把 JSON 里的 `\n` 删掉，否则在页面上会变成一段文字
- **中英文内容保持同步** — 如果用 `Object.keys()` 做语言切换循环，两个 key 必须同时存在
- **content 字段的 JSON 字符串** — 若有双引号必须转义为 `\"`，否则 JSON 解析会失败
- **不要删 `title`** — 即使标题看起来简单，VisionSection 仍依赖此字段

## 📦 被哪些组件读取
- **VisionSection.astro**：读取整个 vision.json，渲染异象页面
