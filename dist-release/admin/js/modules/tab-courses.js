/*
================================================================================
文件位置: static/js/modules/tab-courses.js
作用: 课程管理 Tab — 列表/新增/内联编辑卡片/启停用/删除
被谁引用: admin-all.js 通过 Tab 切换调用 loadCourses()
================================================================================
*/
async function loadCourses() {
  const items = await API.get('/api/courses');
  document.getElementById('courses-list').innerHTML = (items.length ? items.map(i => {
    const statusLabel = i.status===1 ? '<span class="tag" style="background:var(--green);color:#fff">已上线</span>' : '<span class="tag" style="background:var(--muted)">已下线</span>';
    const toggleLabel = i.status===1 ? '下线' : '上线';
    return '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);padding:0.6rem 0;gap:0.75rem">'
      + '<div style="flex:1"><div style="font-weight:600">'+i.icon+' '+i.title_zh+' / '+i.title_en+' '+statusLabel+'</div>'
      + '<div style="font-size:0.82rem;color:var(--muted)">'+i.description_zh+'</div>'
      + '<div><span class="tag">级别:'+i.level+'</span> <span class="tag">课数:'+i.lessons+'</span> <span class="tag">排序:'+i.sort_order+'</span></div></div>'
      + '<div style="display:flex;gap:0.35rem;flex-shrink:0">'
      + '<button class="btn btn-outline btn-sm" onclick="editCourse('+i.id+',\''+i.title_zh.replace(/'/g,"\\'")+'\',\''+i.title_en.replace(/'/g,"\\'")+'\',\''+(i.description_zh||'').replace(/'/g,"\\'")+'\',\''+(i.description_en||'').replace(/'/g,"\\'")+'\',\''+(i.icon||'📖').replace(/'/g,"\\'")+'\',\''+(i.level||'').replace(/'/g,"\\'")+'\','+i.lessons+','+i.sort_order+')">编辑</button>'
      + '<button class="btn btn-outline btn-sm" onclick="toggleCourse('+i.id+','+i.status+')">'+toggleLabel+'</button>'
      + '<button class="btn btn-danger btn-sm" onclick="delCourse('+i.id+')">删除</button>'
      + '</div></div>';
  }).join('') : '<p style="color:var(--muted)">暂无课程</p>');
}

async function addCourse() {
  await API.post('/api/courses', {
    title_zh: document.getElementById('course-title-zh').value,
    title_en: document.getElementById('course-title-en').value,
    description_zh: document.getElementById('course-desc-zh').value,
    description_en: document.getElementById('course-desc-en').value,
    icon: document.getElementById('course-icon').value,
    level: document.getElementById('course-level').value,
    lessons: parseInt(document.getElementById('course-lessons').value)||6,
    sort_order: parseInt(document.getElementById('course-sort').value)||0
  });
  loadCourses();
}

function editCourse(id, zh, en, dzh, den, icon, level, lessons, sort) {
  document.getElementById('course-edit-id').value = id;
  document.getElementById('course-edit-title-zh').value = zh;
  document.getElementById('course-edit-title-en').value = en;
  document.getElementById('course-edit-desc-zh').value = dzh;
  document.getElementById('course-edit-desc-en').value = den;
  document.getElementById('course-edit-icon').value = icon;
  document.getElementById('course-edit-level').value = level;
  document.getElementById('course-edit-lessons').value = lessons;
  document.getElementById('course-edit-sort').value = sort;
  document.getElementById('course-edit-card').style.display = 'block';
  document.getElementById('course-edit-card').scrollIntoView({behavior:'smooth'});
}

async function saveCourseEdit() {
  await API.put('/api/courses/'+document.getElementById('course-edit-id').value, {
    title_zh: document.getElementById('course-edit-title-zh').value,
    title_en: document.getElementById('course-edit-title-en').value,
    description_zh: document.getElementById('course-edit-desc-zh').value,
    description_en: document.getElementById('course-edit-desc-en').value,
    icon: document.getElementById('course-edit-icon').value,
    level: document.getElementById('course-edit-level').value,
    lessons: parseInt(document.getElementById('course-edit-lessons').value)||6,
    sort_order: parseInt(document.getElementById('course-edit-sort').value)||0
  });
  document.getElementById('course-edit-card').style.display = 'none';
  loadCourses();
}

async function toggleCourse(id, status) {
  await API.put('/api/courses/' + id, {status: status===1?0:1});
  loadCourses();
}

async function delCourse(id) {
  if(!confirm('删除？')) return;
  await API.del('/api/courses/' + id);
  loadCourses();
}
