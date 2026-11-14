#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pastor-site sitemap 生成器（2026-11-12 新增 · SEO 五件套之一，照皮料站方案移植）
- 扫描 dist/ 下所有 index.html 生成 sitemap.xml
- 排除：admin 后台、404、带 .off- 的归档目录
- 输出：dist/sitemap.xml（含 lastmod）
- package.json postbuild 钩子自动调用
"""
import os
import glob
from datetime import date
from xml.sax.saxutils import escape

DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
SITE = 'https://pastorjeffnchina.com'

# 不进 sitemap 的路径段（按路径段匹配，避免子串误伤）
EXCLUDE_SEGMENTS = {'admin', '404'}

def excluded(rel):
    parts = rel.split('/')
    for seg in parts[:-1]:  # 目录段
        if seg in EXCLUDE_SEGMENTS or '.off-' in seg or seg.startswith('_archive'):
            return True
    fname = parts[-1]
    if '.off-' in fname:
        return True
    return False

def main():
    pages = []
    for f in glob.glob(os.path.join(DIST, '**', 'index.html'), recursive=True):
        rel = os.path.relpath(f, DIST).replace(os.sep, '/')
        if excluded(rel):
            continue
        url = SITE + '/' + rel[: -len('index.html')]
        url = url.rstrip('/')
        # 目录首页（/zh/）保留斜杠，与线上 trailingSlash 一致
        if not url.count('/') > 2 and not url.endswith(('zh', 'en')):
            pass
        url += '/'
        lastmod = date.fromtimestamp(os.path.getmtime(f)).isoformat()
        pages.append((url, lastmod))

    pages = sorted(set(pages))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, lm in pages:
        lines.append('  <url>')
        lines.append(f'    <loc>{escape(url)}</loc>')
        lines.append(f'    <lastmod>{lm}</lastmod>')
        lines.append('  </url>')
    lines.append('</urlset>')

    out = os.path.join(DIST, 'sitemap.xml')
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(lines))
    print(f'[sitemap-gen] OK {len(pages)} URLs -> dist/sitemap.xml')

if __name__ == '__main__':
    main()
