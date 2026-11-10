/*
 * 站点配置 API — GET 公开 / POST 管理员
 */
function checkAuth(request, env) {
  const auth = request.headers.get('Authorization') || '';
  // 【修改】认证前缀说明: 后台 admin-all.js 发送 "Bearer " + token（Bearer 后带空格，共 7 个字符），
  //   slice(7) 去掉前缀后与 ADMIN_TOKEN 比对；以前误写成 '***' 前缀导致保存永远 401
  const token = (auth.startsWith('Bearer ') ? auth.slice(7) : auth).trim();
  return token === env.ADMIN_TOKEN;
}

export async function onRequest(context) {
  const { request, env } = context;
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };

  if (request.method === 'GET') {
    const rows = await env.DB.prepare('SELECT key, value FROM settings').all();
    const s = {};
    for (const r of rows.results) s[r.key] = r.value;
    return new Response(JSON.stringify({
      ok: true, data: {
        site_title: s.site_title || 'Livingstone', site_title_zh: s.site_title_zh || '活石',
        site_tagline: s.site_tagline || '', site_tagline_zh: s.site_tagline_zh || '',
        site_email: s.site_email || '', site_whatsapp: s.site_whatsapp || '',
        site_phone: s.site_phone || '', site_address: s.site_address || '',
        site_logo_url: s.site_logo_url || '', site_primary_color: s.site_primary_color || '',
        site_accent_color: s.site_accent_color || '',
        // 【修改】site_footer_text_zh: 中文页脚文字（2026-08-21 新增；后台站点设置"页脚文字(中文)"保存/回显用，缺了保存后刷新会丢）
        site_footer_text: s.site_footer_text || '', site_footer_text_zh: s.site_footer_text_zh || '',
        notify_email: s.notify_email || '', googleSheetsWebhook: s.googleSheetsWebhook || '',
        notify_order: s.notify_order || 'off',
      }
    }), { headers: h });
  }

  if (request.method === 'POST') {
    if (!checkAuth(request, env))
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: h });
    const data = await request.json();
    const stmt = env.DB.prepare('INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value=?2');
    const batch = [];
    for (const [k, v] of Object.entries(data)) batch.push(stmt.bind(k, String(v)));
    await env.DB.batch(batch);
    return new Response(JSON.stringify({ ok: true, saved: batch.length }), { headers: h });
  }
  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
}
