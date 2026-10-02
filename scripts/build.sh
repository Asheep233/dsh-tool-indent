#!/bin/bash
# dsh-tool-indent 构建脚本：host tsc → client 类型 → client bundle(tsdown)。
# 自包含：不依赖 dsh 源码 checkout（本插件对 @deepseek-ai/* 零运行时依赖），
# 只在首次构建时按 package.json 装 devDependencies。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TSC="node_modules/.bin/tsc"
if [ ! -x "$TSC" ]; then
  echo "=== 安装构建依赖（typescript / tsdown）==="
  npm install --no-audit --no-fund
fi

echo "=== 1/3 编译 host（tsc → lib/index.js）==="
"$TSC" -p tsconfig.json

echo "=== 2/3 生成 client 类型（tsc → lib/types/client）==="
"$TSC" -p tsconfig.client.json

echo "=== 3/3 打包 client bundle（tsdown → lib/client.js）==="
npm run --silent build:client

echo "=== 构建完成 ==="
ls -l lib/index.js lib/client.js
