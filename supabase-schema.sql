-- ============================================================
-- Pastor Jeff Site — Supabase 建表脚本
-- 在 Supabase SQL Editor 中执行（https://app.supabase.com）
-- ============================================================

-- 1. 代祷请求表
CREATE TABLE IF NOT EXISTS prayer_requests (
  id BIGSERIAL PRIMARY KEY,
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  country TEXT NOT NULL,
  request TEXT NOT NULL,
  lang TEXT DEFAULT 'en' CHECK (lang IN ('en', 'zh')),
  prayed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 订单表
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_name TEXT DEFAULT '',
  shipping_address TEXT DEFAULT '',
  shipping_city TEXT DEFAULT '',
  shipping_country TEXT DEFAULT '',
  shipping_phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 网站内容表（后台编辑用）
CREATE TABLE IF NOT EXISTS site_content (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  lang TEXT DEFAULT 'en' CHECK (lang IN ('en', 'zh')),
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, lang)
);

-- 4. 用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  country TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS 策略（行级安全）
-- ============================================================

-- 代祷：任何人都可以提交，但只能看自己的（按 email）
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert prayer"
  ON prayer_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own prayers"
  ON prayer_requests FOR SELECT
  USING (true); -- 公开可读（没有敏感信息）

-- 订单：只能看自己的
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 网站内容：任何人都能读
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read content"
  ON site_content FOR SELECT
  USING (true);

-- 用户资料：只能看自己的
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 自动创建 profile（注册后触发）
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_prayer_email ON prayer_requests(email);
CREATE INDEX IF NOT EXISTS idx_prayer_created ON prayer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_key ON site_content(key, lang);
