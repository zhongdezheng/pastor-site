/* ============================================================
 * 线索 API — POST 公开提交（色卡/询价表单）/ GET·PUT 管理员
 * 📖 作用: 承接前台「免费色卡/询价」表单，线索落 D1 leads 表
 * 🛠️ 修改指南:
 *   - 表结构: D1 leads（id/name/company/country/contact/materials/message/lang/status/created_at）
 *   - POST 公开：蜜罐字段 website 必须为空；name/contact 必填
 *   - GET/PUT 管理员：Authorization: Bearer <ADMIN_TOKEN>
 * ============================================================ */
function checkAuth(r, env) {
  const auth = r.headers.get('Authorization') || '';
  return (auth.startsWith('Bearer ') ? auth.slice(7) : auth).trim() === env.ADMIN_TOKEN;
}
function json(h, obj, status) { return new Response(JSON.stringify(obj), { status: status || 200, headers: h }); }

export async function onRequestGet({ request, env }) {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  if (!checkAuth(request, env)) return json(h, { error: 'Unauthorized' }, 401);
  const rows = await env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  const data = rows.results.map(r => ({
    ...r,
    materials: (() => { try { return JSON.parse(r.materials || '[]'); } catch(e) { return []; } })(),
  }));
  return json(h, { ok: true, data });
}

export async function onRequestPost({ request, env }) {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  try {
    const d = await request.json();
    // 蜜罐反垃圾：正常用户看不到也不会填 website 字段
    if (d.website) return json(h, { success: true, id: 'skipped' });
    const name = String(d.name || '').trim();
    const contact = String(d.contact || '').trim();
    if (!name || !contact || name.length > 100 || contact.length > 200) {
      return json(h, { error: 'Name and contact are required' }, 400);
    }
    const id = crypto.randomUUID();
    const materials = Array.isArray(d.materials) ? JSON.stringify(d.materials.slice(0, 12).map(String)) : '[]';
    const message = String(d.message || '').slice(0, 5000);
    const company = String(d.company || '').slice(0, 200);
    const country = String(d.country || '').slice(0, 100);
    const lang = d.lang === 'zh' ? 'zh' : 'en';
    const created = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await env.DB.prepare(
      'INSERT INTO leads (id,name,company,country,contact,materials,message,lang,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
    ).bind(id, name, company, country, contact, materials, message, lang, 'new', created).run();
    return json(h, { success: true, id });
  } catch (e) {
    return json(h, { error: 'Server error' }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  if (!checkAuth(request, env)) return json(h, { error: 'Unauthorized' }, 401);
  try {
    const d = await request.json();
    const id = String(d.id || '');
    const status = ['new', 'contacted', 'quoted', 'archived'].includes(d.status) ? d.status : null;
    if (!id || !status) return json(h, { error: 'id and status required' }, 400);
    await env.DB.prepare('UPDATE leads SET status=? WHERE id=?').bind(status, id).run();
    return json(h, { ok: true });
  } catch (e) {
    return json(h, { error: 'Server error' }, 500);
  }
}
