/*
================================================================================
文件位置: features/site-config/script.js
作用: 站点配置 Tab — 用 API.get (与其他 tab 完全一致) + 预加载缓存
================================================================================
*/
var CONFIG_FIELDS = [
  { key: 'site_title', label: '站点名称', placeholder: '如: Grace Covenant', type: 'text' },
  { key: 'site_tagline', label: '站点标语', placeholder: '如: A journey of faith', type: 'text' },
  { key: 'site_footer_text', label: '页脚文字', placeholder: '如: © 2026 All Rights Reserved', type: 'text' },
  { key: 'site_email', label: '联系邮箱', placeholder: '如: hello@example.com', type: 'email' },
  { key: 'site_whatsapp', label: 'WhatsApp', placeholder: '如: 8613602812927', type: 'text' },
  { key: 'site_phone', label: '电话', placeholder: '如: +1234567890', type: 'text' },
  { key: 'site_address', label: '地址', placeholder: '如: 123 Main St, City', type: 'text' },
  { key: 'site_logo_url', label: 'Logo 图片链接', placeholder: '如: /static/logo.png', type: 'text' },
  { key: 'site_primary_color', label: '主色调', placeholder: '如: #4f46e5', type: 'text' },
  { key: 'site_accent_color', label: '强调色', placeholder: '如: #f59e0b', type: 'text' },
  { key: 'notify_email', label: '订单通知邮箱', placeholder: '如: pastorjeffinchina@gmail.com', type: 'email' },
  { key: 'googleSheetsWebhook', label: 'Google Sheets Webhook', placeholder: 'App Script 部署地址', type: 'text' },
];

window._siteConfigCache = null;

function renderSiteConfigForm(config) {
  var container = document.getElementById('site-config-form');
  if (!container) return;

  config = config || {};

  var rows = CONFIG_FIELDS.map(function(f) {
    var val = config[f.key] || '';
    return '<div class="cfg-row">' +
      '<label class="cfg-label">' + H(f.label) + '</label>' +
      '<input class="cfg-input" data-key="' + f.key + '" value="' + H(val).replace(/"/g,'&quot;') + '" placeholder="' + H(f.placeholder).replace(/"/g,'&quot;') + '" type="' + (f.type||'text') + '" onchange="saveSiteField(this)">' +
      '</div>';
  }).join('');

  var notifyOn = config['notify_order'] === 'on';
  rows += '<div class="cfg-row" style="display:flex;align-items:center;justify-content:space-between">' +
    '<label class="cfg-label" style="margin:0">📧 新订单邮件通知</label>' +
    '<button class="btn btn-sm ' + (notifyOn ? 'btn-primary' : 'btn-outline') + '" id="cfg-notify_order" onclick="toggleNotify()">' + (notifyOn ? '已开启 ✓' : '已关闭') + '</button>' +
    '</div>';

  container.innerHTML = rows;
}

function siteConfigPreload() {
  if (window._siteConfigCache) return;
  API.get('/api/site-config').then(function(result) {
    if (result && result.ok) {
      window._siteConfigCache = result.data || {};
      var panel = document.getElementById('tab-site-config');
      if (panel && panel.classList.contains('active')) {
        renderSiteConfigForm(window._siteConfigCache);
      }
    }
  }).catch(function() {
    // 静默失败
  });
}

function loadSiteConfig() {
  // 如果有缓存直接用，避免重复请求
  if (window._siteConfigCache) {
    renderSiteConfigForm(window._siteConfigCache);
    return;
  }
  // 否则实时请求
  var container = document.getElementById('site-config-form');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;color:var(--muted);padding:2rem">加载中...</div>';
  API.get('/api/site-config').then(function(result) {
    if (!result || !result.ok) {
      container.innerHTML = '<div style="text-align:center;color:var(--red);padding:2rem">❌ 加载失败' + (result && result.error ? ': ' + H(result.error) : '') + '</div>';
      return;
    }
    window._siteConfigCache = result.data || {};
    renderSiteConfigForm(window._siteConfigCache);
  }).catch(function(e) {
    container.innerHTML = '<div style="text-align:center;color:var(--red);padding:2rem">❌ ' + H(e.message || '网络错误') + '</div>';
  });
}

var _saveTimer = null;
function saveSiteField(input) {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function() {
    var payload = {};
    payload[input.dataset.key] = input.value.trim();
    API.post('/api/site-config', payload).then(function(res) {
      if (res && res.ok) flashCfg(input.dataset.key + ' ✓');
    });
  }, 600);
}

function toggleNotify() {
  var btn = document.getElementById('cfg-notify_order');
  if (!btn) return;
  var on = btn.textContent.indexOf('开启') !== -1;
  API.post('/api/site-config', { notify_order: on ? 'off' : 'on' }).then(function(res) {
    if (res && res.ok) {
      btn.textContent = on ? '已关闭' : '已开启 ✓';
      btn.className = 'btn btn-sm ' + (on ? 'btn-outline' : 'btn-primary');
    }
  });
}

function flashCfg(text) {
  var el = document.getElementById('config-flash');
  if (!el) return;
  el.textContent = '✓ ' + text;
  el.style.opacity = '1';
  setTimeout(function() { el.style.opacity = '0'; }, 1500);
}
