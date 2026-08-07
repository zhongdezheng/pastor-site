#!/bin/bash
# 前台网站一键重新构建 + 部署
cd "$(dirname "$0")"
echo "🔨 构建中..."
npx astro build && echo "✅ 构建完成" && \
echo "🚀 部署中..." && \
npx wrangler pages deploy dist --project-name pastorjeffnchina --branch main --commit-dirty=true && \
echo "✅ 已上线！"
