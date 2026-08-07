/*
 * ============================================================================
 * 文件位置: tailwind.config.mjs
 * 作用: Tailwind CSS 主题配置，定义品牌色板（beige/charcoal/sage）和字体族
 * 被谁调用: @astrojs/tailwind 集成自动加载 → astro.config.mjs 中引用
 * 修改指南:
 *   - 【修改】品牌色: 编辑 beige/charcoal/sage 色阶数组
 *   - 【修改】字体: 编辑 fontFamily 对象，新字体需在 global.css 中补充 @import
 *   - 【新增】自定义断点: 在 theme.extend.screens 添加
 *   - 【新增】自定义间距/圆角: 在 theme.extend 下添加对应的 Tailwind 键
 *   - 【注意】beige 是浅米色背景系、charcoal 是深灰文字系、sage 是鼠尾草绿 CTA 系
 *   - 【注意】content 数组控制 PurgeCSS 扫描范围，新增文件类型时需添加
 * ============================================================================
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // 优雅浅米色系 — 背景
        beige: {
          50:  '#FDFBF7',
          100: '#F9F4EA',
          200: '#F2E8D4',
          300: '#E8D8BC',
          400: '#DCC4A0',
          500: '#CFAE84',
          600: '#BF996B',
          700: '#A88155',
          800: '#8C6A46',
          900: '#73563A',
          950: '#3F2E1E',
        },
        // 深炭灰色系 — 文字、深色元素
        charcoal: {
          50:  '#F5F4F3',
          100: '#E8E6E3',
          200: '#D1CECA',
          300: '#B5B0A9',
          400: '#969085',
          500: '#7D756B',
          600: '#696058',
          700: '#564E47',
          800: '#49423C',
          900: '#3F3934',
          950: '#2C2A29',
        },
        // 鼠尾草绿 — CTA 按钮
        sage: {
          50:  '#F4F6F4',
          100: '#E4EBE5',
          200: '#CAD6CB',
          300: '#A8BCA9',
          400: '#859E86',
          500: '#6E8174',
          600: '#5B6D61',
          700: '#4A584F',
          800: '#3E4942',
          900: '#343D37',
          950: '#1B201D',
        },
      },
      fontFamily: {
        serif: ['"Lora"', '"Noto Serif SC"', 'Georgia', 'serif'],
        sans:  ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
