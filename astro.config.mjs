/*
 * ============================================================================
 * 文件位置: astro.config.mjs
 * 作用: Astro 项目总配置文件，控制构建输出、国际化路由、Tailwind CSS 集成
 * 被谁调用: Astro 构建系统（astro build / astro dev）自动读取
 * 修改指南:
 *   - 【修改】output: 改 'static' → 'server' 切换 SSR 模式（需要适配器）
 *   - 【修改】trailingSlash: 改 'always'/'never'/'ignore' 控制 URL 末尾斜杠
 *   - 【修改】i18n.locales: 新增语言时加数组元素 ['en','zh','fr']
 *   - 【修改】i18n.prefixDefaultLocale: true=默认语言也显示前缀/en/，false=不显示
 *   - 【新增】SSR 适配器: 在 integrations 数组中添加 @astrojs/cloudflare
 *   - 【注意】改 output 或 i18n 后需重新构建，所有链接可能受影响
 * ============================================================================
 */

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  integrations: [tailwind()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
