/*
================================================================================
文件位置: static/js/modules/tab-orders.js
作用: 订单管理 Tab — 列表/状态统计/状态变更
被谁引用: admin-all.js 通过 Tab 切换调用 loadOrders()
================================================================================
*/
async function loadOrders() {
  const orders = await API.get('/api/orders');
  const stats = {pending:0,processing:0,shipped:0,done:0};
  orders.forEach(o => stats[o.status] = (stats[o.status]||0)+1);
  document.getElementById('orders-stats').innerHTML = `
    <div class="stat-card"><div class="num" style="color:var(--accent2)">${stats.pending||0}</div><div class="label">待处理</div></div>
    <div class="stat-card"><div class="num" style="color:var(--blue)">${stats.processing||0}</div><div class="label">处理中</div></div>
    <div class="stat-card"><div class="num" style="color:var(--green)">${stats.shipped||0}</div><div class="label">已发货</div></div>
    <div class="stat-card"><div class="num">${stats.done||0}</div><div class="label">已完成</div></div>`;
  document.getElementById('orders-table-body').innerHTML = orders.length ? orders.map(o => `<tr>
    <td>#${o.id}</td><td>${o.customer_name||'-'}<br><small>${o.customer_email||''}</small></td><td>${o.product_name||'-'}</td>
    <td>${o.quantity}</td><td>${[o.color,o.size].filter(Boolean).join(' / ')||'-'}</td><td>$${o.total_price||0}</td>
    <td>${statusTag(o.status)}</td><td>${o.created_at||''}</td>
    <td><select onchange="updateOrder(${o.id},this.value)" style="padding:0.2rem;border-radius:6px;border:1px solid var(--border)"><option value="">变更</option><option value="pending">待处理</option><option value="processing">处理中</option><option value="shipped">已发货</option><option value="done">已完成</option></select></td>
    </tr>`).join('') : '<tr><td colspan="9" style="text-align:right;color:var(--muted);padding:2rem">暂无订单</td></tr>';
}

function statusTag(s) {
  const m = {pending:'<span class="tag tag-notreplied">待处理</span>',processing:'<span class="tag" style="background:#dbeafe;color:#1e40af">处理中</span>',shipped:'<span class="tag tag-listed">已发货</span>',done:'<span class="tag" style="background:#e0e7ff;color:#3730a3">已完成</span>'};
  return m[s] || s;
}

async function updateOrder(id, status) {
  if(!status) return;
  await API.put('/api/orders/' + id + '/status', {status: status});
  loadOrders();
}
