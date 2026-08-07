-- ============================================================================
-- 文件位置: src/content/schema.sql
-- 作用: Cloudflare D1 数据库建表脚本，定义代祷请求表结构和索引
-- 被谁调用: 手动执行 — wrangler d1 execute pastor-db --file=src/content/schema.sql
--           或在 Cloudflare Dashboard → D1 → pastor-db → Console 中粘贴执行
-- 架构:
--   prayer_requests 表
--     ├── id (TEXT PK)        — UUID，由 prayer.js 自动生成
--     ├── name (TEXT)         — 代祷者显示名（匿名时为 "Anonymous"）
--     ├── email (TEXT)        — 代祷者邮箱
--     ├── request (TEXT)      — 代祷正文
--     ├── lang (TEXT)         — 语言 'en' / 'zh'
--     ├── anonymous (INT)     — 是否匿名 0=否 1=是
--     └── created_at (TEXT)   — 提交时间（datetime('now')）
--     索引: idx_prayer_created (按时间倒序) + idx_prayer_email (按邮箱查询)
-- 修改指南:
--   - 【新增】字段: ALTER TABLE prayer_requests ADD COLUMN 新字段名 类型 DEFAULT 默认值;
--   - 【新增】表: 仿照 prayer_requests 格式写 CREATE TABLE + CREATE INDEX
--   - 【重建】表: 先 DROP TABLE IF EXISTS prayer_requests; 再重新 CREATE
--   - 【修改】执行: 改完后运行 wrangler d1 execute pastor-db --file=src/content/schema.sql
--   - 【注意】D1 基于 SQLite，语法和 Postgres/MySQL 不同（无 BOOLEAN 类型用 INTEGER）
--   - 【注意】prayer.js 中 INSERT 语句字段顺序必须和这里一致
--   - 【注意】详细字段说明和修改指南见同目录下的 schema-教程.md
-- ============================================================================

CREATE TABLE IF NOT EXISTS prayer_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  request TEXT NOT NULL,
  lang TEXT DEFAULT 'en',
  anonymous INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_prayer_created ON prayer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_email ON prayer_requests(email);
