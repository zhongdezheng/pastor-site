# products.json 教程 —— 商品数据

## 📍 文件位置
`src/content/products.json`

## 🎯 用途
被 **ProductCarousel.astro** 和 **ProductShowcase.astro** 读取，用于：
- 商品列表/轮播展示
- 商品详情页

## 📋 字段说明

| 字段路径 | 类型 | 示例值 | 说明 |
|---------|------|--------|------|
| `[].id` | string | `"prod-2"` | 唯一商品 ID（字符串格式） |
| `[].category` | string | `"apparel"` | 分类标识 |
| `[].name.en` | string | `"Men's Crew Neck T-Shirt"` | 英文商品名 |
| `[].name.zh` | string | `"180g男士圆领短袖T恤"` | 中文商品名 |
| `[].price` | number | `10.0` | 价格（数字） |
| `[].currency` | string | `"USD"` | 货币单位 |
| `[].colors` | string[] | `["白色","黑色"]` | 可选颜色列表 |
| `[].sizes` | string[] | `["S","M","L","XL"]` | 可选尺码列表 |
| `[].weight` | string | `"100%棉（200gsm）"` | 重量/面料描述 |
| `[].material.en` | string | `"100%棉（200gsm）"` | 英文面料 |
| `[].material.zh` | string | `"100%棉（200gsm）"` | 中文面料 |
| `[].description.en` | string | 长文本 | 英文商品描述 |
| `[].description.zh` | string | 长文本 | 中文商品描述 |
| `[].images` | string[] | `["/images/products/..."]` | 商品图片路径数组 |
| `[].stock` | number | `200` | 库存数量 |
| `[].details.en` | string | 文本 | 英文详情 |
| `[].details.zh` | string | 文本 | 中文详情 |

数据结构：**JSON 数组**，每个元素是一个商品对象。

## ✏️ 修改指南

### 🟢 安全修改
- **改商品名** → `[].name.zh` / `[].name.en`
- **改价格** → `[].price`（数字，不要加引号）
- **改颜色** → `[].colors` 数组
- **改尺码** → `[].sizes` 数组
- **改图片** → `[].images` 数组（路径相对于 `/public`）
- **改库存** → `[].stock`
- **改描述** → `[].description.zh` / `[].description.en`
- **新增商品** → 在数组中追加对象，确保 `id` 唯一

### 🔴 不能改 / 改了会崩
- **id 必须唯一** — 页面根据 id 路由商品详情
- **price 是数字** — 不要 `"10.0"`（字符串），必须 `10.0`（数字）
- **images 必须用数组** — 即使只有一张图片也要 `["/images/..."]`
- **图片路径** — 确保 `public/images/products/` 下确有对应文件
- **description.en 和 details.en 内容可能重复** — 当前数据中两者常常一样，修改时注意同步
- **双引号转义** — 描述文本中的英文双引号需转义

## 📦 被哪些组件读取
- **ProductCarousel.astro**：轮播展示商品卡片
- **ProductShowcase.astro**：商品详情展示
