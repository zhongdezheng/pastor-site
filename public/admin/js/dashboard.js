/*
================================================================================
文件位置: features/dashboard/script.js
作用: 仪表盘 Tab — 数据概览卡片 + 最近订单 + 快捷入口
被谁引用: admin-all.js 通过 loadTab('tab-dashboard') 调用 loadDashboard()
================================================================================
*/
var STATUS_MAP = { pending: '待处理', paid: '已付款', shipped: '已发货', completed: '已完成', cancelled: '已取消' };
var STATUS_CLASS = { pending: 'tag-warn', paid: 'tag-info', shipped: 'tag-primary', completed: 'tag-success', cancelled: 'tag-muted' };

async function loadDashboard() {
  try {
    var res = await API.get('/api/dashboard');
    if (!res.ok) throw new Error('获取数据失败');
    var d = res.data;

    // 卡片数据
    setCard('stat-orders-today', d.orders.today_count);
    setCard('stat-revenue-today', '$' + d.orders.today_amount.toLocaleString());
    setCard('stat-orders-month', d.orders.month_count);
    setCard('stat-revenue-month', '$' + d.orders.month_amount.toLocaleString());
    setCard('stat-products', d.products.active);
    setCard('stat-categories', d.products.categories);
    setCard('stat-prayers-pending', d.prayers.unreplied);
    setCard('stat-testimonies', d.content.testimonies);

    // 最近订单
    var tbody = document.getElementById('dash-recent-orders');
    if (!tbody) return;
    if (!d.recent_orders || d.recent_orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem">暂无订单</td></tr>';
    } else {
      tbody.innerHTML = d.recent_orders.map(function(o) {
        return '<tr>' +
          '<td>#' + o.id + '</td>' +
          '<td>' + H(o.customer) + '</td>' +
          '<td>' + H(o.product) + '</td>' +
          '<td>$' + o.amount.toFixed(2) + '</td>' +
          '<td><span class="tag ' + (STATUS_CLASS[o.status] || '') + '">' + (STATUS_MAP[o.status] || o.status) + '</span></td>' +
          '</tr>';
      }).join('');
    }
  } catch (e) {
    console.error('仪表盘加载失败:', e);
  }
}

function setCard(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value;
}
