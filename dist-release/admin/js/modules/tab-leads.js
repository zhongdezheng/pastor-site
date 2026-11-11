/*
================================================================================
文件位置: features/admin/modules/tab-leads.js
作用: 线索管理 Tab — 色卡/询价表单提交的线索列表与状态流转
被谁引用: admin-all.js 通过 Tab 切换调用 loadLeads()
================================================================================
*/
async function loadLeads() {
  const r = await API.get('/api/leads');
  const p = r.data || r;
  const fresh = p.filter(x => x.status === 'new').length;
  document.getElementById('leads-stats').innerHTML = `
    <div class="stat-card"><div class="num">${p.length}</div><div class="label">全部线索</div></div>
    <div class="stat-card" style="border:2px solid var(--red)"><div class="num" style="color:var(--red)">${fresh}</div><div class="label">新线索</div></div>`;
  if (!p.length) { document.getElementById('leads-list').innerHTML = '<p style="color:var(--muted)">暂无线索</p>'; return; }
  document.getElementById('leads-list').innerHTML = '<div class="table-wrap"><table><thead><tr><th>姓名</th><th>公司</th><th>国家</th><th>联系方式</th><th>感兴趣</th><th>留言</th><th>状态</th><th>时间</th><th>操作</th></tr></thead><tbody>' +
    p.map(x => `<tr><td>${x.name || '-'}</td><td>${x.company || '-'}</td><td>${x.country || '-'}</td><td>${x.contact || '-'}</td><td>${(x.materials || []).join('、') || '-'}</td><td>${(x.message || '-').slice(0, 60)}</td><td><span class="tag ${x.status === 'new' ? 'tag-notreplied' : 'tag-replied'}">${x.status === 'new' ? '新线索' : x.status === 'contacted' ? '已联系' : x.status === 'quoted' ? '已报价' : '归档'}</span></td><td>${x.created_at || ''}</td><td>
      <select onchange="setLeadStatus('${x.id}', this.value)" class="btn btn-outline btn-sm">
        <option value="" disabled selected>改状态</option>
        <option value="contacted">已联系</option>
        <option value="quoted">已报价</option>
        <option value="archived">归档</option>
      </select></td></tr>`).join('') + '</tbody></table></div>';
}

async function setLeadStatus(id, status) { if (!status) return; await API.put('/api/leads', { id: id, status: status }); loadLeads(); }
