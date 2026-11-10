/* ============================================================
 * 产品排序 API — POST /api/products/reorder（管理员）
 * 📖 作用: 后台「产品管理」拖拽排序后保存顺序
 * 🛠️ body 格式: {"ids": [2, 4, 5]}（按显示顺序排列的产品 id）
 * ⚠️ 2026-08-21 新增：单文件 products.js 无法匹配子路径，独立成文件
 * ============================================================ */
function checkAuth(r, env) {
  const auth = r.headers.get('Authorization') || '';
  // 【修改】认证前缀（2026-08-21）：后台发送 "Bearer " + token，slice(7) 去掉前缀
  return (auth.startsWith('Bearer ') ? auth.slice(7) : auth).trim() === env.ADMIN_TOKEN;
}

export async function onRequest(ctx) {
  const { request, env } = ctx;
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
  }
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: h });
  }
  const d = await request.json();
  const ids = Array.isArray(d.ids) ? d.ids : [];
  if (ids.length) {
    await env.DB.batch(ids.map(function(pid, i) {
      return env.DB.prepare('UPDATE products SET sort_order=? WHERE id=?').bind(i + 1, pid);
    }));
  }
  return new Response(JSON.stringify({ ok: true, count: ids.length }), { headers: h });
}
