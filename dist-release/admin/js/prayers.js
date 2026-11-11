/*
================================================================================
文件位置: features/prayers/script.js
作用: 代祷管理 Tab — 列表/统计数据/回复弹窗/删除、代祷区设置
被谁引用: admin-all.js 通过 Tab 切换调用 loadPrayers() / loadPrayerSettings()
================================================================================
*/
async function loadPrayers() {
  const p = await API.get('/api/prayers');
  const unreplied = p.filter(x=>!x.replied).length;
  document.getElementById('prayers-stats').innerHTML = `
    <div class="stat-card"><div class="num">${p.length}</div><div class="label">全部</div></div>
    <div class="stat-card" style="border:2px solid var(--red)"><div class="num" style="color:var(--red)">${unreplied}</div><div class="label">待回复</div></div>`;
  document.getElementById('prayers-list').innerHTML = p.length ? '<div class="table-wrap"><table><thead><tr><th>姓名</th><th>邮箱</th><th>内容</th><th>状态</th><th>时间</th><th>操作</th></tr></thead><tbody>'+
    p.map(x=>`<tr><td>${x.name||'匿名'}</td><td>${x.email||'-'}</td><td>${x.content}</td><td>${x.replied?'<span class="tag tag-replied">已回复</span>':'<span class="tag tag-notreplied">待回复'}</td><td>${x.created_at||''}</td><td>
      ${!x.replied?`<button class="btn btn-outline btn-sm" onclick="openReply(${x.id},'${x.email}','${x.content.replace(/'/g,"\\'")}')">回复</button> `:''}
      <button class="btn btn-danger btn-sm" onclick="delPrayer(${x.id})">删除</button></td></tr>`).join('') + '</tbody></table></div>' : '<p style="color:var(--muted)">暂无代祷</p>';
}

function openReply(id, email, content) {
  document.getElementById('reply-id').value = id;
  document.getElementById('reply-email').value = email;
  document.getElementById('reply-original').value = content;
  document.getElementById('reply-content').value = '';
  document.getElementById('reply-modal').classList.add('open');
}

async function submitReply() {
  const d = document.getElementById('reply-content').value; if(!d) return alert('请输入');
  await API.post('/api/prayers/' + document.getElementById('reply-id').value + '/reply', {reply: d});
  document.getElementById('reply-modal').classList.remove('open'); loadPrayers();
}

async function delPrayer(id) { if(!confirm('删除？')) return; await API.del('/api/prayers/' + id); loadPrayers(); }

// ===== Prayer Settings =====
async function savePrayerVerse() {
  await API.put('/api/settings', {prayer_verse_zh: document.getElementById('prayer-verse-zh').value, prayer_verse_en: document.getElementById('prayer-verse-en').value});
  var m = document.getElementById('prayer-verse-msg'); m.style.display = 'block'; setTimeout(function(){ m.style.display = 'none'; }, 2000);
}

async function loadPrayerSettings() {
  var s = await API.get('/api/settings');
  if(s.prayer_verse_zh) document.getElementById('prayer-verse-zh').value = s.prayer_verse_zh;
  if(s.prayer_verse_en) document.getElementById('prayer-verse-en').value = s.prayer_verse_en;
  if(s.prayer_intro_zh) setQuill('prayer-intro-zh', s.prayer_intro_zh);
  if(s.prayer_intro_en) setQuill('prayer-intro-en', s.prayer_intro_en);
}

async function savePrayerIntro() {
  await API.put('/api/settings', {prayer_intro_zh: getQuill('prayer-intro-zh'), prayer_intro_en: getQuill('prayer-intro-en')});
  var m = document.getElementById('prayer-intro-msg'); m.style.display = 'block'; setTimeout(function(){ m.style.display = 'none'; }, 2000);
}
