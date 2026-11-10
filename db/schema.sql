-- pastor-site D1 Schema
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER, name_zh TEXT NOT NULL, name_en TEXT, price REAL DEFAULT 0, colors TEXT, sizes TEXT, material TEXT, description_zh TEXT, description_en TEXT, images TEXT, status INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS carousel_verses (id INTEGER PRIMARY KEY AUTOINCREMENT, title_en TEXT DEFAULT '', title_zh TEXT DEFAULT '', content_en TEXT DEFAULT '', content_zh TEXT DEFAULT '', image TEXT, sort_order INTEGER DEFAULT 0, status INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS hero_images (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, status INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0);
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_title','Livingstone'),('site_title_zh','活石'),('site_tagline',''),('site_email','pastorjeffinchina@gmail.com'),('site_whatsapp','8613602812927'),('notify_email','pastorjeffinchina@gmail.com');
SQLEEOF

echo "✅ schema created"
cd /Users/jeff/Desktop/pastor-site
npx wrangler d1 execute pastor-db --file=db/schema.sql --remote 2>&1