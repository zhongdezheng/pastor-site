/*
 * Hero 图片 API — GET 公开 / POST DELETE 管理员
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
  const id = url.pathname.match(/\/api\/hero\/(\d+)/)?.[1];

  if (m === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM hero_images WHERE status=1 ORDER BY sort_order, id').all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }

  if (!checkAuth(request, env))
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: h });

  if (m === 'POST') {
    const d = await request.json();
    const r = await env.DB.prepare('INSERT INTO hero_images (url, sort_order) VALUES (?1, ?2)')
      .bind(d.url || '', d.sort_order || 0).run();
    return new Response(JSON.stringify({ ok: true, id: r.meta.last_row_id }), { headers: h });
  }

  if (m === 'DELETE' && id) {
    await env.DB.prepare('UPDATE hero_images SET status=0 WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
}
