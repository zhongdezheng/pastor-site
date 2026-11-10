/*
================================================================================
文件位置: static/js/modules/tab-products.js
作用: 产品管理 Tab — 列表/搜索/编辑/状态切换/排序拖拽/回收站/弹窗编辑
被谁引用: admin-all.js 通过 Tab 切换调用 loadProducts()
================================================================================
*/
let _editingProduct = null;
let _editUploadedUrls = [];
let _dragItem = null;

async function loadProducts() {
  const prods = await API.get('/api/products');
  const deleted = prods.filter(p => p.deleted === 1);
  const active = prods.filter(p => p.deleted === 0);

  document.getElementById('products-table-body').innerHTML = active.length ? active.map((p,i) => `<tr class="sortable-row" draggable="true" data-id="${p.id}" data-deleted="${p.deleted||0}">
    <td style="cursor:grab;text-align:center;color:var(--muted)">⋮⋮</td>
    <td>${p.name_zh}</td>
    <td>${p.cat_name||'-'}</td><td>$${p.price}</td>
    <td><span class="tag ${p.status!==0?'tag-listed':'tag-unlisted'}">${p.status!==0?'已上架':'已下架'}</span></td>
    <td style="white-space:nowrap">
      <button class="btn btn-outline btn-sm" onclick="editProduct(${p.id})">编辑</button> ${p.status!==0
      ?'<button class="btn btn-danger btn-sm" onclick="toggleStatus('+p.id+',0)">下架</button> '
      :'<button class="btn btn-success btn-sm" onclick="toggleStatus('+p.id+',1)">上架</button> '}
      <button class="btn btn-outline btn-sm" onclick="softDeleteProd('+p.id+')">删除</button>
    </td></tr>`).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem">暂无产品</td></tr>';

  var delCard = document.getElementById('deleted-products-card');
  var delBody = document.getElementById('deleted-products-body');
  if (deleted.length > 0) {
    delCard.style.display = '';
    delBody.innerHTML = deleted.map(p => `<tr>
      <td>${p.name_zh}</td><td>${p.cat_name||'-'}</td><td>$${p.price}</td>
      <td><button class="btn btn-outline btn-sm" onclick="restoreProd(${p.id})">恢复</button>
      <button class="btn btn-danger btn-sm" onclick="hardDeleteProd(${p.id})">彻底删除</button></td>
    </tr>`).join('');
  } else {
    delCard.style.display = 'none';
  }
  initDragSort();
}

function initDragSort() {
  document.querySelectorAll('.sortable-row').forEach(row => {
    row.addEventListener('dragstart', function(e) {
      _dragItem = this;
      this.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', function() { this.style.opacity = ''; });
    row.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    row.addEventListener('drop', async function(e) {
      e.preventDefault();
      if (!_dragItem || _dragItem === this) return;
      var tbody = document.getElementById('products-table-body');
      var rows = [...tbody.querySelectorAll('.sortable-row')];
      var fromIdx = rows.indexOf(_dragItem);
      var toIdx = rows.indexOf(this);
      if (fromIdx < toIdx) { tbody.insertBefore(_dragItem, this.nextSibling); }
      else { tbody.insertBefore(_dragItem, this); }
      var ids = [...tbody.querySelectorAll('.sortable-row')].map(r => parseInt(r.dataset.id));
      await API.post('/api/products/reorder', {ids: ids});
    });
  });
}

async function softDeleteProd(id) {
  if (!confirm('将此产品移至已删除区？')) return;
  await API.put('/api/products/' + id, {deleted: 1});
  loadProducts();
}

async function restoreProd(id) {
  await API.put('/api/products/' + id, {deleted: 0});
  loadProducts();
}

async function hardDeleteProd(id) {
  if (!confirm('⚠️ 彻底删除，不可恢复！确定？')) return;
  await API.del('/api/products/' + id);
  loadProducts();
}

async function editProduct(id) {
  const p = await (await fetch('/api/products')).json().then(ps=>ps.find(x=>x.id===id));
  if(!p) return;
  _editingProduct = p;
  const sp = (v) => { try { return JSON.parse(v||'[]'); } catch(e) { return String(v||'').split(',').map(s=>s.trim()).filter(Boolean); }};
  document.getElementById('prod-cat').value = p.category_id||'';
  document.getElementById('prod-name-zh').value = p.name_zh;
  document.getElementById('prod-name-en').value = p.name_en||'';
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-sizes').value = sp(p.sizes).join(', ');
  document.getElementById('prod-colors').value = sp(p.colors).join(', ');
  document.getElementById('prod-material').value = p.material||'';
  document.getElementById('prod-desc-zh').value = p.description_zh||'';
  document.getElementById('prod-desc-en').value = p.description_en||'';
  const imgs = sp(p.images);
  document.getElementById('upload-previews').innerHTML = imgs.map(u=>`<img src="${u}">`).join('');
  document.getElementById('btn-save-product').textContent = '保存修改';
  document.getElementById('btn-cancel-edit').style.display = '';
  document.getElementById('product-form-card').scrollIntoView({behavior:'smooth'});
}

function cancelEdit() {
  _editingProduct = null;
  document.getElementById('prod-edit-id').value = '';
  document.getElementById('prod-cat').value = '';
  document.getElementById('prod-name-zh').value = '';
  document.getElementById('prod-name-en').value = '';
  document.getElementById('prod-price').value = '';
  document.getElementById('prod-sizes').value = '';
  document.getElementById('prod-colors').value = '';
  document.getElementById('prod-material').value = '';
  document.getElementById('prod-desc-zh').value = '';
  document.getElementById('prod-desc-en').value = '';
  document.getElementById('upload-previews').innerHTML = '';
  document.getElementById('btn-save-product').textContent = '添加产品';
  document.getElementById('btn-cancel-edit').style.display = 'none';
}

async function saveProduct() {
  try {
  const name = document.getElementById('prod-name-zh').value; if(!name) return alert('请输入产品名');
  const catId = document.getElementById('prod-cat').value; if(!catId) return alert('请先创建类目');
  const data = {
    category_id: parseInt(catId), name_zh: name, name_en: document.getElementById('prod-name-en').value,
    price: parseFloat(document.getElementById('prod-price').value)||0,
    colors: (document.getElementById('prod-colors').value||'').split(',').map(s=>s.trim()).filter(Boolean),
    sizes: (document.getElementById('prod-sizes').value||'').split(',').map(s=>s.trim()).filter(Boolean),
    material: document.getElementById('prod-material').value,
    description_zh: document.getElementById('prod-desc-zh').value,
    description_en: document.getElementById('prod-desc-en').value,
    images: (function(v) { try { return JSON.parse(v||'[]'); } catch(e) { return String(v||'').split(',').map(s=>s.trim()).filter(Boolean); }})(_editingProduct ? _editingProduct.images : '[]')
  };
  if (_editingProduct) {
    await API.put('/api/products/' + _editingProduct.id, data);
  } else {
    await API.post('/api/products', data);
  }
  cancelEdit(); loadProducts();
  } catch(e) { alert('保存失败: ' + e.message); console.error(e); }
}

async function toggleStatus(id, status) {
  await API.put('/api/products/' + id, {status: status});
  loadProducts();
}

// ===== Upload =====
let _uploadedUrls = [];
const uz = document.getElementById('upload-zone');
if (uz) {
  uz.addEventListener('dragover', e => { e.preventDefault(); uz.classList.add('dragover'); });
  uz.addEventListener('dragleave', () => uz.classList.remove('dragover'));
  uz.addEventListener('drop', e => { e.preventDefault(); uz.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
}
async function handleFiles(files) {
  for (const f of files) {
    const r = await API.upload(f);
    if (r.url) _uploadedUrls.push(r.url);
  }
  renderPreviews();
}
function renderPreviews() {
  const existing = _editingProduct ? (function(v) { try { return JSON.parse(v||'[]'); } catch(e) { return []; }})(_editingProduct.images) : [];
  const all = [...existing, ..._uploadedUrls];
  document.getElementById('upload-previews').innerHTML = all.map(u => `<img src="${u}">`).join('');
}

// ===== Edit Modal =====
async function openEditModal() {
  const p = _editingProduct; if(!p) return;
  const cats = await API.get('/api/categories');
  document.getElementById('edit-prod-cat').innerHTML = cats.map(c => `<option value="${c.id}" ${c.id===p.category_id?'selected':''}>${c.name_zh}</option>`).join('');
  document.getElementById('edit-prod-name-zh').value = p.name_zh;
  document.getElementById('edit-prod-name-en').value = p.name_en || '';
  document.getElementById('edit-prod-price').value = p.price;
  document.getElementById('edit-prod-sizes').value = (function(v){ try { return JSON.parse(v||'[]').join(', '); }catch(e){return v||'';}})(p.sizes);
  document.getElementById('edit-prod-colors').value = (function(v){ try { return JSON.parse(v||'[]').join(', '); }catch(e){return v||'';}})(p.colors);
  document.getElementById('edit-prod-material').value = p.material || '';
  setQuill('edit-prod-desc-zh', p.description_zh || '');
  setQuill('edit-prod-desc-en', p.description_en || '');
  document.getElementById('edit-upload-previews').innerHTML = (function(v){ try { return JSON.parse(v||'[]').map(u=>`<img src="${u}">`).join(''); }catch(e){return '';}})(p.images);
  _editUploadedUrls = [];
  document.getElementById('edit-product-modal').classList.add('open');
}

async function handleEditFiles(files) {
  for (const f of files) { const r = await API.upload(f); if(r.url) _editUploadedUrls.push(r.url); }
  renderEditPreviews();
}

function renderEditPreviews() {
  const existing = _editingProduct ? (function(v){ try { return JSON.parse(v||'[]'); }catch(e){return [];}})(_editingProduct.images) : [];
  const all = [...existing, ..._editUploadedUrls];
  document.getElementById('edit-upload-previews').innerHTML = all.map(u => `<img src="${u}">`).join('');
}

async function saveEditProduct() {
  if(!_editingProduct) return;
  const data = {
    category_id: parseInt(document.getElementById('edit-prod-cat').value),
    name_zh: document.getElementById('edit-prod-name-zh').value,
    name_en: document.getElementById('edit-prod-name-en').value,
    price: parseFloat(document.getElementById('edit-prod-price').value)||0,
    colors: (document.getElementById('edit-prod-colors').value||'').split(',').map(s=>s.trim()).filter(Boolean),
    sizes: (document.getElementById('edit-prod-sizes').value||'').split(',').map(s=>s.trim()).filter(Boolean),
    material: document.getElementById('edit-prod-material').value,
    description_zh: document.getElementById('edit-prod-desc-zh').value,
    description_en: document.getElementById('edit-prod-desc-en').value,
    images: [...(function(v){ try { return JSON.parse(v||'[]'); }catch(e){return [];}})(_editingProduct.images), ..._editUploadedUrls]
  };
  await API.put('/api/products/' + _editingProduct.id, data);
  document.getElementById('edit-product-modal').classList.remove('open');
  _editingProduct = null; _editUploadedUrls = []; loadProducts();
}
