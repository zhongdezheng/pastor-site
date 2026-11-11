/*
================================================================================
文件位置: static/js/modules/tab-categories.js
作用: 分类管理 Tab — 列表展示、新增、启停用
被谁引用: admin-all.js 通过 Tab 切换调用 loadCategories()
================================================================================
*/
let _catCache = [];

async function loadCategories() {
  const cats = await API.get('/api/categories');
  document.getElementById('categories-list').innerHTML = cats.map(c => `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0;border-bottom:1px solid var(--border)"><span><strong>${c.name_zh}</strong> / ${c.name_en||c.name_zh}</span><div>${c.status!==0?'<button class="btn btn-danger btn-sm" onclick="toggleCatStatus('+c.id+',0)">关闭</button>':'<button class="btn btn-success btn-sm" onclick="toggleCatStatus('+c.id+',1)">启用</button>'}</div></div>`).join('') || '<p style="color:var(--muted)">暂无类目</p>';
  _catCache = cats;
  document.getElementById('prod-cat').innerHTML = cats.map(c => `<option value="${c.id}">${c.name_zh}</option>`).join('');
}

async function addCategory() {
  const zh = document.getElementById('cat-name-zh').value; if(!zh) return alert('请输入');
  await API.post('/api/categories',{name_zh:zh,name_en:document.getElementById('cat-name-en').value,slug:document.getElementById('cat-slug')&&document.getElementById('cat-slug').value||zh.toLowerCase().replace(/\s+/g,'-')});
  document.getElementById('cat-name-zh').value='';document.getElementById('cat-name-en').value='';loadCategories();
}

async function toggleCatStatus(id, status) {
  await API.put('/api/categories/'+id, {..._catCache.find(c=>c.id===id), status});
  loadCategories().then(loadProducts);
}

async function delCategory(id) { if(!confirm('删除类目会同时删除该类目下所有产品，确定？')) return; await API.del('/api/categories/'+id); loadCategories().then(loadProducts); }
