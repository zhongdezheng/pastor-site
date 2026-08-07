# prayer-settings.json 教程 —— 代祷页面配置

## 📍 文件位置
`src/content/prayer-settings.json`

## 🎯 用途
被 **PrayerHomeSection.astro**、**PrayerForm.astro**、**PrayerGlobe.astro** 读取，用于：
- 代祷页面顶部经文展示
- 代祷页面引导语文字
- 可能涉及地球仪 3D 展示和表单提交

## 📋 字段说明

| 字段路径 | 类型 | 示例值 | 说明 |
|---------|------|--------|------|
| `zh.verse` | string | `""` | 中文引用经文（当前为空） |
| `zh.pageIntro` | string | `""` | 中文页面引导语（当前为空） |
| `en.verse` | string | `""` | 英文引用经文（当前为空） |
| `en.pageIntro` | string | `""` | 英文页面引导语（当前为空） |

## ✏️ 修改指南

### 🟢 安全修改
- **添加经文** → `zh.verse` / `en.verse`，填写经文正文
- **添加引导语** → `zh.pageIntro` / `en.pageIntro`
- 当前所有字段为空字符串 `""`，留空页面可能不显示对应内容（优雅降级）

### 🔴 不能改 / 改了会崩
- **不要删除 `zh` / `en` 对象** — PrayerForm/PrayerGlobe/PrayerHomeSection 可能需要这两个语言对象
- **不要改字段名** — `verse` 和 `pageIntro` 是硬编码的字段名
- **空字符串是合法的** — 保持现有格式即可，不填内容不会报错

## 📦 被哪些组件读取
- **PrayerHomeSection.astro**：代祷首页区块
- **PrayerForm.astro**：代祷表单
- **PrayerGlobe.astro**：代祷地球仪（3D 可视化）
