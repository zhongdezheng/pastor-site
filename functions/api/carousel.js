/*
 * 轮播经文 API — GET 公开 / POST PUT DELETE 管理员
 */
function checkAuth(r, env) {
  const auth = r.headers.get('Authorization') || '';
  return (auth.startsWith('***') ? auth.slice(3) : auth).trim() === env.ADMIN_TOKEN;
}

export async function onRequest(ctx) {
  const { request, env } = ctx;
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  const m = request.method;
  const url = new URL(request.url);
  const id = url.pathname.match(/\/api\/carousel\/(\d+)/)?.[1];

  if (m === 'GET') {
    if (id) {
      const r = await env.DB.prepare('SELECT * FROM carousel_verses WHERE id=?').bind(id).first();
      return new Response(JSON.stringify({ ok: true, data: r || null }), { headers: h });
    }
    const rows = await env.DB.prepare('SELECT * FROM carousel_verses WHERE status=1 ORDER BY sort_order, id').all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }

  if (!checkAuth(request, env))
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: h });

  if (m === 'POST') {
    const d = await request.json();
    const r = await env.DB.prepare(
      'INSERT INTO carousel_verses (title_en,title_zh,content_en,content_zh,image,sort_order) VALUES (?1,?2,?3,?4,?5,?6)'
    ).bind(d.title_en||'', d.title_zh||'', d.content_en||'', d.content_zh||'', d.image||'', d.sort_order||0).run();
    return new Response(JSON.stringify({ ok: true, id: r.meta.last_row_id }), { headers: h });
  }

  if (m === 'PUT' && id) {
    const d = await request.json();
    const fields = ['title_en','title_zh','content_en','content_zh','image','sort_order','status'];
    const sets = fields.filter(f => d[f] !== undefined).map(f => `${f}=?`).join(', ');
    const vals = fields.filter(f => d[f] !== undefined).map(f => d[f]);
    await env.DB.prepare(`UPDATE carousel_verses SET ${sets} WHERE id=?`).bind(...vals, id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  if (m === 'DELETE' && id) {
    await env.DB.prepare('UPDATE carousel_verses SET status=0 WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
}
