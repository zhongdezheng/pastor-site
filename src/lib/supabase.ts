const SUPABASE_URL = 'https://uwebpdtjkucbcyscfzmq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TfquiTSSQip7GcF4Sodsjg_PNc_OzNl';

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type PrayerRequest = {
  id?: number;
  name: string;
  email: string;
  country: string;
  request: string;
  lang: 'en' | 'zh';
  created_at?: string;
  prayed: boolean;
};

export type Order = {
  id?: number;
  user_id: string;
  email: string;
  items: string; // JSON string of cart items
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_phone: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
};

export type SiteContent = {
  id?: number;
  key: string; // e.g. 'hero', 'vision', 'products', 'scriptures'
  lang: 'en' | 'zh';
  data: string; // JSON string
  updated_at?: string;
};
