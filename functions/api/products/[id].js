/* ============================================================
 * 产品 API — GET 公开 / POST·PUT·DELETE 管理员
 * 📖 作用: 前台产品展示 + 管理后台产品管理共用
 * 🛠️ 修改指南:
 *   - 产品数据在 D1 数据库 products 表（后台「产品管理」Tab 直接改）
 *   - 后台保存即生效（前端页面实时拉取），无需部署
 *   - 排序: 改 sort_order 字段
 * ⚠️ 删除 = 软删除（deleted=1），不物理删除
 * ============================================================ */
function checkAuth(r, env) {
  const auth = r.headers.get('Authorization') || '';
  // 【修改】认证前缀（2026-08-21）：后台 admin-all.js 发送 "Bearer " + token（7 字符），
  //   slice(7) 去掉前缀后与 ADMIN_TOKEN 比对；原误写 '***' 导致后台产品操作全部 401
  return (auth.startsWith('Bearer ') ? auth.slice(7) : auth).trim() === env.ADMIN_TOKEN;
}

function formatProduct(r) {
  return {
    id: r.id, name_zh: r.name_zh, name_en: r.name_en, price: r.price,
    colors: (() => { try { return JSON.parse(r.colors || '[]'); } catch(e) { return []; } })(),
    sizes: (() => { try { return JSON.parse(r.sizes || '[]'); } catch(e) { return []; } })(),
    material: r.material, description_zh: r.description_zh, description_en: r.description_en,
    images: (() => { try { return JSON.parse(r.images || '[]'); } catch(e) { return []; } })(),
    category_id: r.category_id, status: r.status, sort_order: r.sort_order, created_at: r.created_at,
    deleted: r.deleted,  // 【修改】2026-08-24：返回 deleted 字段（与 index.js 一致）
  };
}

/* 拆分说明（2026-08-21）：本文件处理 /api/products/{id} 及
 * /api/products/{id}/status、/delete、/restore 子路径（后台按钮调用）
 * 路由：functions/api/products/[id].js → 匹配 /api/products/任意数字ID */
export async function onRequest(ctx) {
  const { request, env } = ctx;
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  const m = request.method;
  const url = new URL(request.url);
  const id = url.pathname.match(/\/api\/products\/(\d+)/)?.[1];
  if (!id) return new Response(JSON.stringify({ error: 'Invalid id' }), { status: 400, headers: h });

  // GET — 公开：单条
  if (m === 'GET') {
    const r = await env.DB.prepare('SELECT * FROM products WHERE id=? AND deleted=0').bind(id).first();
    if (!r) return new Response(JSON.stringify({ ok: true, data: null }), { headers: h });
    return new Response(JSON.stringify({ ok: true, data: formatProduct(r) }), { headers: h });
  }

  // 以下 — 管理员
  if (!checkAuth(request, env))
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: h });

  // PUT /api/products/{id}/status — 下架/上架（后台按钮调用，body: {status: 0|1}）
  if (m === 'PUT' && url.pathname.endsWith('/status')) {
    const d = await request.json();
    await env.DB.prepare('UPDATE products SET status=? WHERE id=?').bind(d.status === 0 ? 0 : 1, id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  // PUT /api/products/{id}/delete — 软删除（移入回收站）
  if (m === 'PUT' && url.pathname.endsWith('/delete')) {
    await env.DB.prepare('UPDATE products SET deleted=1 WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  // PUT /api/products/{id}/restore — 恢复（从回收站恢复）
  if (m === 'PUT' && url.pathname.endsWith('/restore')) {
    await env.DB.prepare('UPDATE products SET deleted=0 WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  // PUT /api/products/{id} — 编辑保存（后台表单保存调用）
  if (m === 'PUT') {
    const d = await request.json();
    // 【修改】数组字段（colors/sizes/images）前端传数组，D1 需 JSON 字符串
    ['colors', 'sizes', 'images'].forEach(function(k) {
      if (d[k] !== undefined) d[k] = Array.isArray(d[k]) ? JSON.stringify(d[k]) : d[k];
    });
    const fields = ['name_zh','name_en','price','colors','sizes','material','description_zh','description_en','images','category_id','status','sort_order','deleted'];
    const sets = fields.filter(f => d[f] !== undefined).map(f => f + '=?').join(',');
    const vals = fields.filter(f => d[f] !== undefined).map(f => d[f]);
    await env.DB.prepare('UPDATE products SET ' + sets + ' WHERE id=?').bind(...vals, id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  // DELETE /api/products/{id} — 彻底删除（软删标记，不物理删除）
  if (m === 'DELETE') {
    await env.DB.prepare('UPDATE products SET deleted=1 WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
}
