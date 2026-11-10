/*
================================================================================
文件位置: static/js/modules/quill.js
作用: Quill 富文本编辑器初始化与管理（双向同步 textarea ↔ Quill）
被谁引用: index.html 通过 <script src="/static/js/modules/quill.js"></script> 引用

工具栏完整版：字体 / 字号 / 文字颜色 / 背景色 / 加粗斜体下划线 /
            有序无序列表 / 缩进 / 对齐 / 引用 / 链接 / 清除格式
================================================================================
*/
const quills = {};

/** Quill 所有编辑器共用的字体列表 */
/* 字体白名单：12种，覆盖中英文常用字体 */
var FONT_WHITELIST = [
  false,               // 默认
  'yahei',             // 微软雅黑
  'songti',            // 宋体
  'heiti',             // 黑体
  'kaiti',             // 楷体
  'arial',             // Arial
  'georgia',           // Georgia
  'times',             // Times New Roman
  'verdana',           // Verdana
  'impact',            // Impact
  'trebuchet',         // Trebuchet MS
  'mono'               // 等宽
];

/** 字号：Quill 支持 small / false(正常) / large / huge */
var SIZE_LIST = ['small', false, 'large', 'huge'];

/** 所有编辑器共用同一个 Quill 实例映射 */
function initQuill(id, placeholder) {
  var editorEl = document.getElementById(id + '-editor');
  if (!editorEl || quills[id]) return;

  /* 注入字体 CSS（只做一次） */
  if (!window.__quillFontsInjected) {
    window.__quillFontsInjected = true;
    var fontCSS = [
      /* 标题字号 */
      '.ql-editor h1 { font-size: 2em; }',
      '.ql-editor h2 { font-size: 1.5em; }',
      '.ql-editor h3 { font-size: 1.17em; }',
      '.ql-editor h4 { font-size: 1em; }',
      '.ql-editor h5 { font-size: 0.83em; }',
      '.ql-editor h6 { font-size: 0.67em; }',
      /* 修复：字体下拉 "Normal" → "默认" */
      '.ql-snow .ql-picker.ql-font .ql-picker-label::before { content: "默认字体"; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value]::before { content: attr(data-value); }',
      /* 修复：标题下拉 "Normal" → "正文" */
      '.ql-snow .ql-picker.ql-header .ql-picker-label::before { content: "正文"; }',
      '.ql-snow .ql-picker.ql-header .ql-picker-label[data-value]::before { content: attr(data-value); }',
      '.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="false"]::before { content: "正文"; }',
      /* 字体实际样式 */
      '.ql-editor .ql-font-songti   { font-family:"Songti SC","STSong","SimSun","宋体",serif; }',
      '.ql-editor .ql-font-heiti    { font-family:"Heiti SC","STHeiti","SimHei","黑体",sans-serif; }',
      '.ql-editor .ql-font-kaiti    { font-family:"Kaiti SC","STKaiti","KaiTi","楷体",serif; }',
      '.ql-editor .ql-font-yahei    { font-family:"Microsoft YaHei","PingFang SC","微软雅黑",sans-serif; }',
      '.ql-editor .ql-font-arial    { font-family:Arial,Helvetica,sans-serif; }',
      '.ql-editor .ql-font-georgia  { font-family:Georgia,"Times New Roman",serif; }',
      '.ql-editor .ql-font-times    { font-family:"Times New Roman",Times,serif; }',
      '.ql-editor .ql-font-verdana  { font-family:Verdana,Geneva,sans-serif; }',
      '.ql-editor .ql-font-impact   { font-family:Impact,"Arial Black",sans-serif; }',
      '.ql-editor .ql-font-trebuchet{ font-family:"Trebuchet MS","Lucida Grande",sans-serif; }',
      '.ql-editor .ql-font-mono     { font-family:"SF Mono",Menlo,Consolas,"Courier New",monospace; }',
      /* 字体下拉显示名 */
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="songti"]::before{ content:"宋体"; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="heiti"]::before { content:"黑体"; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="kaiti"]::before { content:"楷体"; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="yahei"]::before { content:"微软雅黑"; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before { content:"Arial"; font-family:Arial,sans-serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="georgia"]::before{ content:"Georgia"; font-family:Georgia,serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="times"]::before { content:"Times New Roman"; font-family:"Times New Roman",serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="verdana"]::before{ content:"Verdana"; font-family:Verdana,sans-serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="impact"]::before{ content:"Impact"; font-family:Impact,sans-serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="trebuchet"]::before{ content:"Trebuchet MS"; font-family:"Trebuchet MS",sans-serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="mono"]::before  { content:"等宽"; font-family:monospace; }',
      /* 字体下拉选项 */
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="songti"]::before{ content:"宋体"; font-family:"Songti SC","STSong","SimSun",serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="heiti"]::before { content:"黑体"; font-family:"Heiti SC","STHeiti","SimHei",sans-serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="kaiti"]::before { content:"楷体"; font-family:"Kaiti SC","STKaiti","KaiTi",serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="yahei"]::before { content:"微软雅黑"; font-family:"Microsoft YaHei","PingFang SC",sans-serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before { content:"Arial"; font-family:Arial,sans-serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before{ content:"Georgia"; font-family:Georgia,serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="times"]::before { content:"Times New Roman"; font-family:"Times New Roman",serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="verdana"]::before{ content:"Verdana"; font-family:Verdana,sans-serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="impact"]::before{ content:"Impact"; font-family:Impact,sans-serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="trebuchet"]::before{ content:"Trebuchet MS"; font-family:"Trebuchet MS",sans-serif; }',
      '.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="mono"]::before  { content:"等宽"; font-family:monospace; }',
    ].join('\n');
    var styleTag = document.createElement('style');
    styleTag.textContent = fontCSS;
    document.head.appendChild(styleTag);
  }

  /* ---- 字体下拉 ---- */
  var fontList = Quill.import('formats/font');
  fontList.whitelist = FONT_WHITELIST;
  Quill.register(fontList, true);

  /* ---- 字号下拉 ---- */
  var SizeClass = Quill.import('attributors/class/size');
  SizeClass.whitelist = SIZE_LIST;
  Quill.register(SizeClass, true);

  var q = new Quill(editorEl, {
    theme: 'snow',
    placeholder: placeholder || '',
    modules: {
      toolbar: [
        /* 标题 */
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        /* 字体 + 字号 */
        [{ font: FONT_WHITELIST }],
        [{ size: SIZE_LIST }],

        /* 文字样式 */
        ['bold', 'italic', 'underline', 'strike'],

        /* 颜色 */
        [{ color: [] }, { background: [] }],

        /* 对齐 */
        [{ align: [] }],

        /* 列表 + 缩进 */
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],

        /* 引用 + 链接 */
        ['blockquote', 'link'],

        /* 清除格式 */
        ['clean']
      ]
    }
  });

  /* 文字颜色默认灰色 = Quill bug workaround; 改成黑色 */
  setTimeout(function () {
    var picker = editorEl.querySelector('.ql-color-picker .ql-picker-label svg');
    if (picker) {
      picker.style.display = 'none';
      var lab = editorEl.querySelector('.ql-color-picker .ql-picker-label');
      if (lab && !lab.querySelector('.ql-color-label')) {
        var span = document.createElement('span');
        span.className = 'ql-color-label';
        span.textContent = 'A';
        span.style.color = '#333';
        lab.insertBefore(span, lab.firstChild);
      }
    }
    var picks = editorEl.querySelectorAll('.ql-picker-item');
    for (var i = 0; i < picks.length; i++) {
      picks[i].style.width = '18px';
      picks[i].style.height = '18px';
      picks[i].style.margin = '2px';
    }
  }, 0);

  /* ---- 双向同步 ---- */
  var ta = document.getElementById(id);
  if (ta && ta.value) { q.root.innerHTML = ta.value; }

  q.on('text-change', function () {
    if (ta) ta.value = q.root.innerHTML;
  });

  quills[id] = q;
}

function setQuill(id, html) {
  var q = quills[id];
  if (q) {
    q.root.innerHTML = html || '';
  }
  var ta = document.getElementById(id);
  if (ta) ta.value = html || '';
}

function getQuill(id) {
  var ta = document.getElementById(id);
  return ta ? ta.value : '';
}

/* ---- 全局初始化（可见面板 + MutationObserver） ---- */
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    var visiblePanel = document.querySelector('.tab-panel.active');
    if (visiblePanel) {
      visiblePanel.querySelectorAll('.quill-editor').forEach(function (el) {
        var id = el.id.replace('-editor', '');
        initQuill(id);
      });
    }
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          var panel = m.target;
          if (panel.classList.contains('active')) {
            setTimeout(function () {
              panel.querySelectorAll('.quill-editor').forEach(function (el) {
                var id = el.id.replace('-editor', '');
                initQuill(id);
              });
            }, 200);
          }
        }
      });
    });
    document.querySelectorAll('.tab-panel').forEach(function (p) {
      observer.observe(p, { attributes: true, attributeFilter: ['class'] });
    });
  }, 100);
});
