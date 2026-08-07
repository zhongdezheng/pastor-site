# `schema.sql` 教程 —— Cloudflare D1 数据库建表脚本

## 文件位置

```
src/content/schema.sql
```

## 用途

这是 Cloudflare D1（Cloudflare 的边缘 SQLite 数据库）的 **数据库建表脚本**。它定义了 `prayer_requests`（代祷请求）表的结构和索引。

**被谁使用**：Cloudflare Pages Functions 中的 `functions/api/prayer.js`，用于接收和存储用户提交的代祷请求。

## 表结构说明

### `prayer_requests` 表

| 字段名 | 类型 | 说明 | 是否必填 |
|--------|------|------|----------|
| `id` | TEXT | 主键，唯一标识每条代祷请求。由应用层生成（UUID 或类似） | 是（PRIMARY KEY） |
| `name` | TEXT | 提交者的姓名 | 是（NOT NULL） |
| `email` | TEXT | 提交者的邮箱地址 | 是（NOT NULL） |
| `request` | TEXT | 代祷请求的正文内容 | 是（NOT NULL） |
| `lang` | TEXT | 语言标识，`'en'` 或 `'zh'`，默认为 `'en'` | 否（DEFAULT 'en'） |
| `anonymous` | INTEGER | 是否匿名提交：`0` = 实名，`1` = 匿名，默认为 `0` | 否（DEFAULT 0） |
| `created_at` | TEXT | 创建时间，自动填充为当前 UTC 时间（SQLite `datetime('now')`） | 是（DEFAULT datetime('now')） |

### 索引

| 索引名 | 索引列 | 说明 |
|--------|--------|------|
| `idx_prayer_created` | `created_at DESC` | 按创建时间降序排列，用于查询最新代祷请求 |
| `idx_prayer_email` | `email` | 按邮箱查�，用于"我的代祷请求"功能 |

### IF NOT EXISTS

所有 `CREATE` 语句都使用了 `IF NOT EXISTS`：
- **作用**：如果表/索引已存在，不会报错，直接跳过
- **好处**：多次执行脚本不会重复创建，适合 CI/CD 和开发环境

## 如何执行（wrangler d1 execute）

### 前置条件

1. 安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)：
   ```bash
   npm install -g wrangler
   ```

2. 登录 Cloudflare：
   ```bash
   npx wrangler login
   ```

3. 确认 D1 数据库已创建（如果还没创建）：
   ```bash
   npx wrangler d1 create pastor-db
   ```

### 执行建表脚本

```bash
npx wrangler d1 execute pastor-db --file=src/content/schema.sql
```

### 执行单个 SQL 查询

```bash
# 查看所有代祷请求
npx wrangler d1 execute pastor-db --command="SELECT * FROM prayer_requests ORDER BY created_at DESC LIMIT 10"
```

### 在 Cloudflare Dashboard 操作

也可以登录 Cloudflare Dashboard → Workers & Pages → D1 → 选择 `pastor-db` → Console 标签页，在网页中直接执行 SQL。

## 修改指南

### 新增字段

例如要添加一个"是否已回复"的状态字段：

```sql
ALTER TABLE prayer_requests ADD COLUMN responded INTEGER DEFAULT 0;
```

- 通过 wrangler 执行：
  ```bash
  npx wrangler d1 execute pastor-db --command="ALTER TABLE prayer_requests ADD COLUMN responded INTEGER DEFAULT 0"
  ```

- ⚠️ 然后把 ALTER 语句也加到这个 `schema.sql` 文件的注释里，方便新建环境时追踪变更历史

### 新增表

例如要添加一个"用户账户"表：

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

- 加到 `schema.sql` 文件末尾

### 重建数据库

如果需要完全重建（⚠️ 会丢失所有数据）：

```bash
# 1. 删除旧表
npx wrangler d1 execute pastor-db --command="DROP TABLE IF EXISTS prayer_requests"

# 2. 重新执行建表脚本
npx wrangler d1 execute pastor-db --file=src/content/schema.sql
```

> ⚠️ `DROP TABLE` 不可逆！执行前确保已备份数据。

## 类型对照

| SQLite/D1 类型 | JavaScript/TypeScript 对应 | 说明 |
|---------------|--------------------------|------|
| TEXT | `string` | 可变长字符串 |
| INTEGER | `number` | 整数（SQLite 不区分 int/bool，用 0/1 表示布尔） |
| REAL | `number` | 浮点数 |
| BLOB | `Buffer` / `Uint8Array` | 二进制数据 |

## 相关文件

- `functions/api/prayer.js` — 代祷表单 API，读写此表
- `src/components/PrayerForm.astro` — 前端代祷表单组件
- `src/content/prayer-settings.json` — 代祷表单配置
