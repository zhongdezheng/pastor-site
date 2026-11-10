/* ============================================================
 * PayPal 确认收款 — POST /api/paypal/capture-order
 * 📖 作用: 买家在 PayPal 弹窗批准后，确认收款并完成订单
 * 🛠️ 请求体: {"orderID":"付款后返回的订单ID"}（前端自动传）
 * ⚠️ 注意: 订单必须先经买家批准，否则返回 ORDER_NOT_APPROVED
 * 📈 扩展: 可在 COMPLETED 分支里写订单入库/发邮件通知
 * ============================================================ */
async function getToken(env) {
  const auth = btoa(env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_SECRET);
  const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  const d = await res.json();
  return d.access_token;
}

export async function onRequest(ctx) {
  const { request, env } = ctx;
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
  try {
    const body = await request.json();
    const orderId = body.orderID || body.orderId;
    const token = await getToken(env);
    const res = await fetch('https://api-m.paypal.com/v2/checkout/orders/' + orderId + '/capture', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    });
    const d = await res.json();
    if (d.status === 'COMPLETED') {
      return new Response(JSON.stringify({ status: d.status, id: d.id }), { headers: h });
    }
    return new Response(JSON.stringify({ error: d.details?.[0]?.issue || d.name || 'Capture failed', status: d.status }), { status: res.status, headers: h });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: h });
  }
}
