#!/bin/bash
# 職人自造 3D列印工作坊 — 本地開發一鍵啟動腳本
# 前端: http://localhost:5173
# 後端: http://localhost:8001
# API 文件: http://localhost:8001/api/docs

ROOT=$(cd "$(dirname "$0")" && pwd)
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

echo "🚀 啟動職人自造開發環境..."

# 停止舊服務
kill $(lsof -ti:8001) 2>/dev/null
kill $(lsof -ti:5173) 2>/dev/null
sleep 1

# 啟動後端
echo "▶  後端 FastAPI → http://localhost:8001"
cd "$BACKEND"

if [ ! -f ".env" ]; then
  echo "   ⚠️  找不到 backend/.env，複製 .env.example..."
  cp .env.example .env
fi

python3 -m uvicorn main:app --reload --port 8001 &
BACKEND_PID=$!
sleep 2

# 確認後端正常
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
  echo "   ✅ 後端啟動成功"
else
  echo "   ❌ 後端啟動失敗，請檢查錯誤訊息"
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

# 啟動前端
echo "▶  前端 Vite   → http://localhost:5173"
cd "$FRONTEND"

if [ ! -f ".env.local" ]; then
  echo "   ⚠️  找不到 frontend/.env.local，複製 .env.example..."
  cp .env.example .env.local
  # 自動設定對應後端 port
  sed -i '' 's|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://localhost:8001|' .env.local 2>/dev/null || true
fi

npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  職人自造開發環境已啟動               ║"
echo "║                                      ║"
echo "║  前台：  http://localhost:5173        ║"
echo "║  後台：  http://localhost:5173/#/admin/login"
echo "║  API：   http://localhost:8001/api/docs"
echo "║                                      ║"
echo "║  預設帳號：admin@example.com          ║"
echo "║  預設密碼：admin123                   ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "按 Ctrl+C 停止所有服務"

# Ctrl+C 清理
trap "echo ''; echo '正在停止服務...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

wait $BACKEND_PID $FRONTEND_PID
