/* ============================================================
 * PayPal 创建订单 — POST /api/paypal/create-order
 * 📖 作用: 购物车/奉献页提交时创建 PayPal 订单，返回订单 ID
 * 🛠️ 支持两种请求体:
 *   1. 商品订单: {"items":[{"name":"T恤","price":15,"quantity":2}]}
 *   2. 纯金额捐赠: {"amount":50}（奉献页用）
 * 🔧 修改: 币种/税费/运费在下方 purchaseUnit 构造处调整
 * ⚠️ 返回 {id} 给前端，前端用它渲染 PayPal 按钮并打开支付弹窗
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
    const items = body.items || [];
    // 支持纯金额捐赠：无 items 时用 amount 字段
    let total = parseFloat(body.amount) || 0;
    if (items.length) total = items.reduce((s, i) => s + parseFloat(i.price || 0) * parseInt(i.quantity || 1), 0);
    if (total <= 0) return new Response(JSON.stringify({ error: 'No items or amount' }), { status: 400, headers: h });
    const token = await getToken(env);
    const purchaseUnit = items.length
      ? { amount: { currency_code: 'USD', value: total.toFixed(2), breakdown: { item_total: { currency_code: 'USD', value: total.toFixed(2) } } }, items: items.map(i => ({ name: i.name, quantity: String(i.quantity), unit_amount: { currency_code: 'USD', value: parseFloat(i.price).toFixed(2) } })) }
      : { amount: { currency_code: 'USD', value: total.toFixed(2) } };
    const res = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [purchaseUnit] })
    });
    const d = await res.json();
    if (d.id) return new Response(JSON.stringify({ id: d.id, status: d.status }), { headers: h });
    return new Response(JSON.stringify({ error: d.details?.[0]?.issue || d.name || 'Create failed' }), { status: res.status, headers: h });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: h });
  }
}
