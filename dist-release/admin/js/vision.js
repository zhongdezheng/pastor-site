/*
================================================================================
文件位置: features/vision/script.js
作用: 全球异象 Tab — 加载/保存中英文标题与内容（Quill 编辑器）
被谁引用: admin-all.js 通过 Tab 切换调用 loadVision()
================================================================================
*/
async function loadVision() {
  const v = await API.get('/api/vision');
  document.getElementById('vision-title-zh').value = v.title_zh || '';
  setQuill('vision-content-zh', v.content_zh || '');
  document.getElementById('vision-title-en').value = v.title_en || '';
  setQuill('vision-content-en', v.content_en || '');
}

async function saveVision() {
  await API.put('/api/vision', {
    title_zh: document.getElementById('vision-title-zh').value,
    content_zh: document.getElementById('vision-content-zh').value,
    title_en: document.getElementById('vision-title-en').value,
    content_en: document.getElementById('vision-content-en').value
  });
  const msg = document.getElementById('vision-msg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 2000);
}
