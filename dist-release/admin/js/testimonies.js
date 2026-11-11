/*
================================================================================
文件位置: features/testimonies/script.js
作用: 见证管理 Tab — 列表/新增(含图片上传)/编辑/启停用
被谁引用: admin-all.js 通过 Tab 切换调用 loadTestimonies()
================================================================================
*/
let _testImgUrls = [];

async function loadTestimonies() {
  const items = await API.get('/api/testimonies');
  document.getElementById('admin-testimonies-table').innerHTML = items.length ? items.map(t => '<tr><td>'+(t.title_zh||t.title||'')+'</td><td>'+(t.title_en||'')+'</td><td>'+(t.date||'')+'</td><td>'+(t.author||'')+'</td><td><span class="tag '+(t.published?'tag-listed':'tag-unlisted')+'">'+(t.published?'已发布':'草稿')+'</span></td><td><button class="btn btn-outline btn-sm" onclick="editTestimony('+t.id+')">编辑</button> <button class="btn '+(t.published?'btn-danger':'btn-success')+' btn-sm" onclick="toggleTestimony('+t.id+','+(t.published?0:1)+')">'+(t.published?'下架':'上架')+'</button></td></tr>').join('') : '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem">暂无见证</td></tr>';
}

async function handleTestImages(files) { for (const f of files) { const r = await API.upload(f); if(r.url) _testImgUrls.push(r.url); } renderTestPreviews(); }
function renderTestPreviews() { document.getElementById('test-previews').innerHTML = _testImgUrls.map(u => '<img src="'+u+'">').join(''); }

async function addTestimony() {
  const titleZh = document.getElementById('test-title-zh').value;
  if(!titleZh) return alert('请输入中文标题');
  await API.post('/api/testimonies', {
    title_zh: titleZh, title_en: document.getElementById('test-title-en').value,
    content_zh: getQuill('test-content-zh'),
    content_en: getQuill('test-content-en'),
    excerpt_zh: document.getElementById('test-excerpt-zh').value,
    excerpt_en: document.getElementById('test-excerpt-en').value,
    date: document.getElementById('test-date').value,
    author: document.getElementById('test-author').value,
    images: _testImgUrls,
    published: document.getElementById('test-published').checked ? 1 : 0
  });
  _testImgUrls = []; document.getElementById('test-previews').innerHTML = '';
  ['test-title-zh','test-title-en','test-excerpt-zh','test-excerpt-en','test-date','test-author'].forEach(id=>document.getElementById(id).value='');
  setQuill('test-content-zh',''); setQuill('test-content-en','');
  loadTestimonies();
}

async function delTestimony(id) { if(!confirm('删除？')) return; await API.del('/api/testimonies/' + id); loadTestimonies(); }

async function toggleTestimony(id, status) {
  await API.put('/api/testimonies/' + id, {published: status});
  loadTestimonies();
}

async function editTestimony(id) {
  const items = await API.get('/api/testimonies');
  const t = items.find(x => x.id === id);
  if(!t) return;
  document.getElementById('test-title-zh').value = t.title_zh || t.title || '';
  document.getElementById('test-title-en').value = t.title_en || '';
  document.getElementById('test-content-zh').value = t.content_zh || t.content || '';
  setQuill('test-content-en', t.content_en || '');
  document.getElementById('test-excerpt-zh').value = t.excerpt_zh || '';
  document.getElementById('test-excerpt-en').value = t.excerpt_en || '';
  document.getElementById('test-date').value = t.date || '';
  document.getElementById('test-author').value = t.author || '';
  document.getElementById('test-published').checked = t.published ? true : false;
  ['test-title-zh'].forEach(id => document.getElementById(id).scrollIntoView({behavior:'smooth'}));
}
