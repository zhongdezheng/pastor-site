/*
================================================================================
文件位置: static/js/admin-all.js
作用: 管理后台前端主入口 — 认证管理、API 封装、Tab 切换、全局初始化
被谁引用: index.html 通过 <script src="/static/js/admin-all.js"></script> 引用
模块说明:
  - modules/quill.js        — Quill 富文本编辑器初始化
  - modules/tab-profile.js  — 个人介绍管理
  - modules/tab-vision.js   — 全球异象管理
  - modules/tab-carousel.js — 轮播经文管理
  - modules/tab-categories.js — 分类管理
  - modules/tab-products.js — 产品管理
  - modules/tab-prayers.js  — 代祷管理
  - modules/tab-testimonies.js — 见证管理
  - modules/tab-courses.js  — 课程管理
  - modules/tab-orders.js   — 订单管理
================================================================================
*/
// ===== Auth =====
let _token = localStorage.getItem('admin_token') || '';

function checkAuth() {
  if (_token) {
    fetch('/api/login', { headers: { 'Authorization': 'Bearer ' + _token  } })
      .then(r => { if (r.ok) showAdmin(); else showLogin(); })
      .catch(function() { showLogin(); });
  } else {
    showLogin();
  }
}
function showAdmin() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('topbar').style.display = '';
  document.getElementById('main-content').style.display = '';
  // 预加载所有 Tab 数据（避免切换到每个 Tab 时才加载）
  loadDashboard(); loadSettings(); loadCarousel(); loadCategories().then(loadProducts);
  loadPrayerSettings(); loadPrayers(); loadTestimonies(); loadOrders();
  switchTab('tab-dashboard');
  // 站点配置预加载
  if (typeof siteConfigPreload === 'function') siteConfigPreload();
}
function showLogin() {
  _token = '';
  localStorage.removeItem('admin_token');
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('topbar').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
  // 清除残留的错误信息
  var msg = document.getElementById('login-msg');
  if (msg) { msg.style.display = 'none'; msg.textContent = ''; }
}
async function doLogin() {
  let msg = document.getElementById('login-msg');
  let user = document.getElementById('login-user').value.trim();
  let pass = document.getElementById('login-pass').value;
  try {
    let r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    });
    let data = await r.json();
    if (data.ok) {
      _token = data.token;
      localStorage.setItem('admin_token', _token);
      showAdmin();
    } else {
      msg.textContent = data.error || '用户名或密码错误';
      msg.style.display = 'block';
    }
  } catch(e) {
    msg.textContent = '网络错误，请稍后重试';
    msg.style.display = 'block';
  }
}
function doLogout() {
  _token = '';
  localStorage.removeItem('admin_token');
  showLogin();
}

// ===== API =====
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _token  }; }
const API = {
  get: async u => { let r = await (await fetch(u, { headers: authHeaders() })).json(); if (r.data !== undefined) { r.data.ok = true; r.data.data = r.data; return r.data; } return r; },
  post: async (u,d) => { let r = await (await fetch(u, { method:'POST', headers: authHeaders(), body: JSON.stringify(d) })).json(); if (r.data !== undefined) { r.data.ok = true; r.data.data = r.data; return r.data; } return r; },
  put: async (u,d) => { let r = await (await fetch(u, { method:'PUT', headers: authHeaders(), body: JSON.stringify(d) })).json(); if (r.data !== undefined) { r.data.ok = true; r.data.data = r.data; return r.data; } return r; },
  del: async u => { let r = await (await fetch(u, { method:'DELETE', headers: authHeaders() })).json(); if (r.data !== undefined) { r.data.ok = true; r.data.data = r.data; return r.data; } return r; },
  upload: async f => { let fd=new FormData(); fd.append('file',f); let r = await (await fetch('/api/upload',{method:'POST',body:fd})).json(); if (r.data !== undefined) { r.data.ok = true; r.data.data = r.data; return r.data; } return r; }
};

// ===== Tab Switch =====
document.querySelectorAll('.nav-item:not(.logout)').forEach(el => {
  el.addEventListener('click', () => {
    if (el.dataset.tab === 'tab-logout') return doLogout();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(el.dataset.tab).classList.add('active');
    loadTab(el.dataset.tab);
  });
});
document.querySelector('.nav-item.logout').addEventListener('click', doLogout);

/**
 * 程序化切换 Tab（被 showAdmin 调用）
 * @param {string} tabId - tab 的 id，如 'tab-profile'
 */
function switchTab(tabId) {
  // 侧边栏高亮
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.tab === tabId);
  });
  // 内容面板切换
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === tabId);
  });
  // 加载数据
  loadTab(tabId);
}

function loadTab(t) {
  switch(t) {
    case 'tab-dashboard': loadDashboard(); break;
    case 'tab-profile': loadSettings(); break;
    case 'tab-vision': loadVision(); break;
    case 'tab-carousel': loadCarousel(); break;
    case 'tab-products': loadCategories().then(loadProducts); break;
    case 'tab-courses': loadCourses(); break;
    case 'tab-prayers': loadPrayerSettings(); loadPrayers(); break;
    case 'tab-leads': loadLeads(); break;
    case 'tab-testimonies': loadTestimonies(); break;
    case 'tab-orders': loadOrders(); break;
    case 'tab-users': loadUsers(); break;
    case 'tab-site-config': loadSiteConfig(); break;
  }
}

// ===== Utilities =====
function H(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ===== Login Enter Key =====
document.getElementById('login-pass').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') doLogin();
});

// ===== Init =====
checkAuth();

// ===== Load all initial data =====
// 注意: 不再在未登录时预加载；数据由 showAdmin() 在登录成功后触发
