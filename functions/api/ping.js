/*
 * Ping API — GET /api/ping
 * 健康检查端点
 */
export async function onRequest(ctx) {
  return new Response(JSON.stringify({ ok: true, message: 'pong', time: Date.now() }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
