# site.json 教程 —— 站点全局配置

## 📍 文件位置
`src/content/site.json`

## 🎯 用途
被 **BaseLayout.astro** 读取，用于设置网站全局信息：
- 网站名称（中/英文）
- WhatsApp 联系方式
- 联系邮箱
- 可选：Google Sheets 表单提交 Webhook

## 📋 字段说明

| 字段路径 | 类型 | 示例值 | 说明 |
|---------|------|--------|------|
| `site.name.en` | string | `"Livingstone"` | 英文站名，显示在浏览器标签栏和导航栏 |
| `site.name.zh` | string | `"活石"` | 中文站名 |
| `site.tagline.en` | string | `""` | 英文标语（可留空） |
| `site.tagline.zh` | string | `""` | 中文标语（可留空） |
| `site.whatsapp` | string | `"+85297094785"` | WhatsApp 号码，含国际区号 |
| `site.email` | string | `"pastorjeffinchina@gmail.com"` | 联系邮箱，BaseLayout 中显示 |
| `site.googleSheetsWebhook` | string | `""` | Google Sheets Webhook URL，用于表单提交；留空则不触发 |

## ✏️ 修改指南

### 🟢 安全修改
- **改 WhatsApp 号码** → `site.whatsapp`，如 `"+8613800138000"`
- **改网站名** → `site.name.zh`（中文名）或 `site.name.en`（英文名）
- **改联系邮箱** → `site.email`
- **加标语** → `site.tagline.zh` / `site.tagline.en`
- **启用 Google Sheets 收集** → 填入有效的 Webhook URL（不填 = 不触发）

### 🔴 不能改 / 改了会崩
- **不要删除 `site` 对象本身** — BaseLayout.astro 直接读 `site.name`、`site.whatsapp`、`site.email`
- **不要改字段名** — 如 `name` 改为 `title` 会读取失败
- **googleSheetsWebhook 留空** — 不填不会报错，留空等同于未启用
- **JSON 语法** — 确保是合法 JSON（逗号、引号、花括号不能少）

## 📦 被哪些组件读取
- **BaseLayout.astro**：读取 `site.name`、`site.whatsapp`、`site.email`
