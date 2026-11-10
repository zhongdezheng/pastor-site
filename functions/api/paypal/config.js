/* ============================================================
 * PayPal 配置端点 — GET /api/paypal/config
 * 📖 作用: 前端加载 PayPal 按钮前先获取 Client ID 和运行模式
 * 🛠️ 修改指南:
 *   - 换 PayPal 账号: 更新 Cloudflare Secrets 的 PAYPAL_CLIENT_ID / PAYPAL_SECRET
 *   - 沙盒测试: 用沙盒凭据替换 secrets，并把 api-m.paypal.com 改 api-m.sandbox.paypal.com
 * ⚠️ 当前 = live 生产模式，收款进企业账户（真实扣款）
 * ============================================================ */
export async function onRequest(ctx) {
  const { request, env } = ctx;
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  if (!env.PAYPAL_CLIENT_ID) return new Response(JSON.stringify({ error: 'PayPal not configured' }), { status: 503, headers: h });
  return new Response(JSON.stringify({ enabled: true, clientId: env.PAYPAL_CLIENT_ID, mode: 'live' }), { headers: h });
}
