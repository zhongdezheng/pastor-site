-- pastor-site-v2 完整 Schema（2026-11-11 从 functions API 反推汇编）
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name_zh TEXT, name_en TEXT, slug TEXT, sort_order INTEGER DEFAULT 0, status INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER, name_zh TEXT NOT NULL, name_en TEXT, price REAL DEFAULT 0, colors TEXT, sizes TEXT, material TEXT, description_zh TEXT, description_en TEXT, images TEXT, status INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS carousel_verses (id INTEGER PRIMARY KEY AUTOINCREMENT, title_en TEXT DEFAULT '', title_zh TEXT DEFAULT '', content_en TEXT DEFAULT '', content_zh TEXT DEFAULT '', image TEXT, sort_order INTEGER DEFAULT 0, status INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS hero_images (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, status INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS testimonies (id INTEGER PRIMARY KEY AUTOINCREMENT, title_zh TEXT DEFAULT '', title_en TEXT DEFAULT '', content_zh TEXT DEFAULT '', content_en TEXT DEFAULT '', excerpt_zh TEXT DEFAULT '', excerpt_en TEXT DEFAULT '', date TEXT DEFAULT '', author TEXT DEFAULT '', images TEXT DEFAULT '[]', published INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY AUTOINCREMENT, title_zh TEXT, title_en TEXT, description_zh TEXT, description_en TEXT, icon TEXT, level TEXT, lessons TEXT, is_free INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, status INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS vision (id INTEGER PRIMARY KEY DEFAULT 1, title_zh TEXT, title_en TEXT, content_zh TEXT, content_en TEXT);
CREATE TABLE IF NOT EXISTS prayer_requests (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, request TEXT NOT NULL, lang TEXT DEFAULT 'en', anonymous INTEGER DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS prayers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, content TEXT, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, name TEXT, company TEXT, country TEXT, contact TEXT, materials TEXT, message TEXT, lang TEXT DEFAULT 'zh', status TEXT DEFAULT 'new', created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT, email TEXT, items TEXT, total REAL, currency TEXT DEFAULT 'USD', status TEXT DEFAULT 'pending', shipping_name TEXT, shipping_address TEXT, shipping_city TEXT, shipping_country TEXT, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT, username TEXT, display_name TEXT, role TEXT DEFAULT 'user', active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));

-- 基础配置
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_title','Pastor Jeff'),('site_title_zh','杰夫牧师'),('site_tagline',''),('site_email','pastorjeffinchina@gmail.com'),('site_whatsapp','8613602812927'),('notify_email','pastorjeffinchina@gmail.com');
INSERT OR IGNORE INTO categories (id, name_zh, name_en, slug, sort_order, status) VALUES (1,'服装','Clothing','apparel',1,1),(2,'首饰','Jewelry','accessories',2,1),(3,'皮料(已下线)','Leather(retired)','leather',99,0);
INSERT OR IGNORE INTO vision (id, title_zh, title_en, content_zh, content_en) VALUES (1,'异象','Vision','','');
