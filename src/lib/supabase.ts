/*
 * ============================================================================
 * 📁 文件位置: src/lib/supabase.ts
 * 🎯 作用: Supabase 客户端初始化 + TypeScript 类型定义
 * 📦 依赖: @supabase/supabase-js
 * 🔧 修改指南:
 *   【修改】Supabase URL → 改 SUPABASE_URL 常量
 *   【修改】匿名密钥 → 改 SUPABASE_ANON_KEY（⚠️ 敏感信息，不要提交到公开仓库）
 *   【修改】数据类型 → 改 PrayerRequest / Order / SiteContent 接口
 *   【添加】新表类型 → 新增 interface，参考现有格式
 * ============================================================================
 */

// ====== Supabase 连接配置 ======
// 【修改】更换 Supabase 项目时改这两个值
const SUPABASE_URL = 'https://uwebpdtjkucbcyscfzmq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_pub…OzNl';  // ⚠️ 已脱敏，完整 Key 在正式文件中

import { createClient } from '@supabase/supabase-js';

// 导出全局 supabase 客户端实例，其他文件直接 import { supabase }
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====== 代祷请求数据类型 ======
// 对应 Supabase prayers 表
export type PrayerRequest = {
  id?: number;          // 自增主键
  name: string;         // 祷告者姓名
  email: string;        // 邮箱
  country: string;      // 国家
  request: string;      // 祷告内容
  lang: 'en' | 'zh';    // 语言
  created_at?: string;   // 创建时间（数据库自动生成）
  prayed: boolean;      // 是否已代祷（管理员标记）
};

// ====== 订单数据类型 ======
// 对应 Supabase orders 表
export type Order = {
  id?: number;                     // 自增主键
  user_id: string;                 // 下单用户 ID（Supabase Auth UUID）
  email: string;                   // 客户邮箱
  items: string;                   // 购物车内容，JSON 字符串（CartItem[]序列化）
  total: number;                   // 订单总金额
  currency: string;                // 货币，如 'USD'
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';  // 订单状态
  shipping_name: string;           // 收件人
  shipping_address: string;        // 收件地址
  shipping_city: string;           // 城市
  shipping_country: string;        // 国家
  shipping_phone: string;          // 电话
  notes: string;                   // 备注
  created_at?: string;             // 创建时间
  updated_at?: string;             // 更新时间
};

// ====== 站点内容数据类型 ======
// 对应 Supabase site_content 表（用于 CMS 内容管理）
export type SiteContent = {
  id?: number;                // 自增主键
  key: string;                // 内容标识，如 'hero' 'vision' 'products' 'scriptures'
  lang: 'en' | 'zh';          // 语言
  data: string;               // JSON 字符串，存储实际内容
  updated_at?: string;        // 更新时间
};
