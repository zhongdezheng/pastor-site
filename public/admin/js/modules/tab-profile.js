/*
================================================================================
文件位置: static/js/modules/tab-profile.js
作用: 个人介绍 Tab — 加载/保存站点设置、修改密码
被谁引用: admin-all.js 通过 Tab 切换调用 loadSettings()
================================================================================
*/
async function loadSettings() {
  const s = await API.get('/api/settings');
  document.getElementById('set-name-zh').value = s.hero_name_zh || '';
  document.getElementById('set-title-zh').value = s.hero_title_zh || '';
  setQuill('set-intro-zh', s.hero_preview_zh || s.site_intro || '');
  document.getElementById('set-verse-zh').value = s.hero_verse_zh || '';
  document.getElementById('set-verse-ref-zh').value = s.hero_verse_ref_zh || '';
  document.getElementById('set-name-en').value = s.hero_name_en || '';
  document.getElementById('set-title-en').value = s.hero_title_en || '';
  setQuill('set-intro-en', s.hero_preview_en || s.site_intro || '');
  document.getElementById('set-verse-en').value = s.hero_verse_en || '';
  document.getElementById('set-verse-ref-en').value = s.hero_verse_ref_en || '';
  if(s.profile_image){ document.getElementById('avatar-preview').src = s.profile_image; document.getElementById('avatar-preview').style.display = ''; }
}

async function saveSettings() {
  await API.put('/api/settings', {
    hero_name_zh: document.getElementById('set-name-zh').value,
    hero_title_zh: document.getElementById('set-title-zh').value,
    hero_preview_zh: getQuill('set-intro-zh'),
    hero_verse_zh: document.getElementById('set-verse-zh').value,
    hero_verse_ref_zh: document.getElementById('set-verse-ref-zh').value,
    hero_name_en: document.getElementById('set-name-en').value,
    hero_title_en: document.getElementById('set-title-en').value,
    hero_preview_en: getQuill('set-intro-en'),
    hero_verse_en: document.getElementById('set-verse-en').value,
    hero_verse_ref_en: document.getElementById('set-verse-ref-en').value
  });
  var m = document.getElementById('settings-msg');
  m.textContent = '已保存，正在同步到网站...';
  m.style.display = 'block';
  setTimeout(function(){ m.textContent = '同步完成！1-2分钟后网站更新'; }, 2000);
  setTimeout(function(){ m.style.display = 'none'; }, 5000);
}

async function uploadAvatar(i) {
  const f = i.files[0]; if(!f) return;
  const r = await API.upload(f);
  if(r.url){ await API.put('/api/settings',{profile_image: r.url}); document.getElementById('avatar-preview').src = r.url; document.getElementById('avatar-preview').style.display = ''; }
}
