/* ============================================================
 * 类目（分类）API — GET 公开 / POST·PUT·DELETE 管理员
 * 📖 作用: 产品分类管理（后台「分类管理」Tab + 前台产品分类筛选）
 * 📍 路由: functions/api/categories.js → 匹配 /api/categories（精确路径）
 *
 * 🧭 教程（2026-08-24 新建恢复）：
 *   - 数据表: D1 categories（字段: id, name_zh, name_en, slug, sort_order, status）
 *   - GET    : 返回全部启用类目（公开，前台筛选用）
 *   - POST   : 新增类目（管理员）  body: {name_zh, name_en, slug, sort_order}
 *   - PUT    : 改名类目（管理员）  body: {name_zh, name_en, slug, sort_order, status}
 *   - DELETE : 停用类目（管理员，置 status=0 不物理删除）
 *   - 认证   : 请求头 "Bearer <ADMIN_TOKEN>"（后台发送；2026-08-24 起产品/类目统一）
 *   - 历史   : 8-19 恢复副本时本文件丢失 → 后台 loadCategories() 抛错导致
 *             loadProducts() 不执行、产品表格空白；8-24 重建本文件修复
 * ============================================================ */
function checkAuth(r, env) {
  const auth = r.headers.get('Authorization') || '';
  // 【修改】认证前缀（2026-08-24）：后台发送 "Bearer " + token，slice(7) 去掉前缀
  return (auth.startsWith('Bearer ') ? auth.slice(7) : auth).trim() === env.ADMIN_TOKEN;
}

export async function onRequest(ctx) {
  const { request, env } = ctx;
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  const m = request.method;
  const url = new URL(request.url);
  const id = url.pathname.match(/\/api\/categories\/(\d+)/)?.[1];

  // GET — 公开：类目列表
  if (m === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM categories ORDER BY sort_order, id').all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }

  // 以下 — 管理员
  if (!checkAuth(request, env))
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: h });

  // POST — 新增类目
  if (m === 'POST') {
    const d = await request.json();
    const r = await env.DB.prepare(
      'INSERT INTO categories (name_zh, name_en, slug, sort_order, status) VALUES (?1, ?2, ?3, ?4, ?5)'
    ).bind(d.name_zh || '', d.name_en || '', d.slug || '', d.sort_order || 0, d.status === undefined ? 1 : d.status).run();
    return new Response(JSON.stringify({ ok: true, id: r.meta.last_row_id }), { headers: h });
  }

  if (!id) return new Response(JSON.stringify({ error: 'Invalid id' }), { status: 400, headers: h });

  // PUT — 更新类目（改名/排序/停用）
  if (m === 'PUT') {
    const d = await request.json();
    const fields = ['name_zh', 'name_en', 'slug', 'sort_order', 'status'];
    const sets = fields.filter(f => d[f] !== undefined).map(f => f + '=?').join(',');
    const vals = fields.filter(f => d[f] !== undefined).map(f => d[f]);
    if (!sets) return new Response(JSON.stringify({ ok: true }), { headers: h });
    await env.DB.prepare('UPDATE categories SET ' + sets + ' WHERE id=?').bind(...vals, id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  // DELETE — 停用类目（软停用）
  if (m === 'DELETE') {
    await env.DB.prepare('UPDATE categories SET status=0 WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
}