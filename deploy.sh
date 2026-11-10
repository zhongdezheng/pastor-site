#!/bin/bash
set -e
echo "🚀 pastor-site 全云端部署"
echo ""

# 1. Build Astro static
echo "📦 构建前端..."
npx astro build

# 2. Build Cloudflare Functions
echo "⚡ 编译 Functions..."
npx wrangler pages functions build functions --outdir /tmp/pastor-funcs
cp /tmp/pastor-funcs/index.js dist/_worker.js
cp functions/_routes.json dist/_routes.json

# 3. Deploy
echo "🌎 部署到 Cloudflare..."
npx wrangler pages deploy dist --project-name pastorjeffnchina --branch main --commit-dirty=true

echo ""
echo "✅ 全云端部署完成!"
echo "  前端 + API + 数据库 全部运行在 Cloudflare"
echo "  不再依赖 Flask / Mac / Tunnel"
