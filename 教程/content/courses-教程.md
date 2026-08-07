# courses.json 教程 —— 课程列表

## 📍 文件位置
`src/content/courses.json`

## 🎯 用途
被课程页面读取，用于展示可用的学习课程列表。

## 📋 字段说明

| 字段路径 | 类型 | 示例值 | 说明 |
|---------|------|--------|------|
| `[].id` | number | `1` | 唯一课程 ID |
| `[].title.zh` | string | `"信仰根基"` | 中文课程名称 |
| `[].title.en` | string | `"Foundations of Faith"` | 英文课程名称 |
| `[].description.zh` | string | `"6周的根基性学习..."` | 中文课程简介 |
| `[].description.en` | string | `"A 6-week foundational study..."` | 英文课程简介 |
| `[].icon` | string | `"📖"` | Emoji 图标，展示在课程卡片上 |
| `[].level` | string | `"入门"` | 难度级别：入门/中级/进阶/所有级别 |
| `[].lessons` | number | `6` | 课时数量 |
| `[].is_free` | boolean | `true` | 是否免费 |

数据结构：**JSON 数组**。

## ✏️ 修改指南

### 🟢 安全修改
- **改课程名** → `[].title.zh` / `[].title.en`
- **改简介** → `[].description.zh` / `[].description.en`
- **改良图标** → `[].icon`（直接写 emoji）
- **改级别** → `[].level`
- **改课时数** → `[].lessons`（数字类型）
- **改是否免费** → `[].is_free`（布尔值 `true` / `false`）
- **新增课程** → 在数组中追加对象，id 不重复

### 🔴 不能改 / 改了会崩
- **id 必须唯一且递增** — 用于课程索引
- **lessons 是 number 不是 string** — 不要写 `"6"`，要写 `6`
- **is_free 是 boolean** — 不是 `"true"`（字符串），是 `true`（布尔）
- **level 值必须一致** — 建议统一用目前已有的值（入门/中级/进阶/所有级别），不要随意造新值，除非页面也有对应处理
- **id 目前是 1-4** — 如果删除某个课程不要空出编号，可重新排序或保留

## 📦 被哪些组件读取
- 课程目录页面：遍历数组，渲染课程卡片列表
