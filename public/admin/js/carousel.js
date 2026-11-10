/*
================================================================================
文件位置: features/carousel/script.js
作用: 轮播经文 Tab — 列表展示、新增、编辑(内联卡片)、启停用、删除
被谁引用: admin-all.js 通过 Tab 切换调用 loadCarousel()
================================================================================
*/
var _carouselItems = [];

async function loadCarousel() {
  _carouselItems = await API.get('/api/carousel');
  document.getElementById('carousel-list').innerHTML = (_carouselItems.length ? _carouselItems.map(function(i, idx){
    var statusLabel = (i.status===1||i.status===undefined) ? '<span class="tag" style="background:var(--green);color:#fff">已上线</span>' : '<span class="tag" style="background:var(--muted)">已下线</span>';
    var toggleLabel = (i.status===1||i.status===undefined) ? '下线' : '上线';
    var toggleStyle = (i.status===1||i.status===undefined) ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm';
    var zhContent = i.content_zh || '';
    return '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);padding:0.6rem 0;gap:0.75rem">'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-weight:600;margin-bottom:0.15rem">' + (i.title_zh || '') + ' <span style="color:var(--muted);font-weight:400">' + (i.title_en || '') + '</span> ' + statusLabel + '</div>'
      + '<div style="font-size:0.82rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + H(zhContent.substring(0,60)) + '</div>'
      + '<div style="margin-top:0.15rem"><span class="tag">排序:'+i.sort_order+'</span></div>'
      + '</div>'
      + '<div style="display:flex;gap:0.35rem;flex-shrink:0">'
      + '<button class="btn btn-outline btn-sm" onclick="editCarouselByIdx('+idx+')">编辑</button>'
      + '<button class="'+toggleStyle+'" onclick="toggleCarousel('+i.id+','+(i.status||1)+')">'+toggleLabel+'</button>'
      + '<button class="btn btn-danger btn-sm" onclick="delCarousel('+i.id+')">删除</button>'
      + '</div></div>';
  }).join('') : '<p style="color:var(--muted)">暂无经文</p>');
}

function editCarouselByIdx(idx){
  var i = _carouselItems[idx];
  if(!i)return;
  document.getElementById('cv-edit-id').value = i.id;
  document.getElementById('cv-edit-title-zh').value = i.title_zh || '';
  document.getElementById('cv-edit-title-en').value = i.title_en || '';
  document.getElementById('cv-edit-content-zh').value = i.content_zh || '';
  document.getElementById('cv-edit-content-en').value = i.content_en || '';
  document.getElementById('cv-edit-image').value = i.image || '';
  document.getElementById('cv-edit-sort').value = i.sort_order;
  document.getElementById('carousel-edit-card').style.display = 'block';
  document.getElementById('carousel-edit-card').scrollIntoView({behavior:'smooth'});
}

async function addCarousel() {
  await API.post('/api/carousel',{
    title_zh: document.getElementById('cv-title-zh').value,
    title_en: document.getElementById('cv-title-en').value,
    content_zh: document.getElementById('cv-content-zh').value,
    content_en: document.getElementById('cv-content-en').value,
    image: document.getElementById('cv-image').value,
    sort_order: parseInt(document.getElementById('cv-sort').value)||0
  });
  ['cv-title-zh','cv-title-en','cv-content-zh','cv-content-en','cv-image'].forEach(function(id){document.getElementById(id).value=''});
  document.getElementById('cv-sort').value = '0'; loadCarousel();
}

async function saveCarouselEdit() {
  const id = document.getElementById('cv-edit-id').value;
  const data = {
    title_zh: document.getElementById('cv-edit-title-zh').value,
    title_en: document.getElementById('cv-edit-title-en').value,
    content_zh: document.getElementById('cv-edit-content-zh').value,
    content_en: document.getElementById('cv-edit-content-en').value,
    image: document.getElementById('cv-edit-image').value,
    sort_order: parseInt(document.getElementById('cv-edit-sort').value) || 0
  };
  await API.put('/api/carousel/' + id, data);
  document.getElementById('carousel-edit-card').style.display = 'none';
  loadCarousel();
}

async function toggleCarousel(id, currentStatus) {
  const newStatus = currentStatus === 1 ? 0 : 1;
  await API.put('/api/carousel/' + id, {status: newStatus});
  loadCarousel();
}

async function delCarousel(id) { if(!confirm('删除？')) return; await API.del('/api/carousel/'+id); loadCarousel(); }
