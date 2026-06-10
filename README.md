# 職人自造 3D列印工作坊 — 官方網站

專業 FDM・SLA 3D 列印服務的品牌網站，含詢價系統與完整管理後台。

## 技術架構

| 層級 | 技術 | 本地 | 部署 |
|------|------|------|------|
| 前端 | React 19 + Vite 8 + Tailwind CSS v4 | port 5173 | GitHub Pages |
| 後端 | Python FastAPI | port 8001 | Render (Python) |
| 資料庫 | SQLite（本地）/ PostgreSQL（生產）| `backend/db.sqlite3` | Render DB |

---

## 本地快速啟動

```bash
# 後端（Terminal 1）
cd backend
python3 -m pip install -r requirements.txt
cp .env.example .env          # 按需修改
python3 -m uvicorn main:app --reload --port 8001

# 前端（Terminal 2）
cd frontend
npm install
cp .env.example .env.local    # 預設 VITE_API_BASE_URL=http://localhost:8001
npm run dev
```

或使用一鍵啟動腳本：

```bash
./start-dev.sh
```

### 預設管理員帳號

```
Email:    admin@example.com
Password: admin123
```

> 後端首次啟動時自動建立。**正式環境請務必修改 `ADMIN_DEFAULT_PASSWORD`。**

---

## 頁面總覽

### 前台（公開）

| 路徑 | 說明 |
|------|------|
| `/#/` | 首頁 |
| `/#/about` | 關於我們 |
| `/#/services` | 服務項目 |
| `/#/services/fdm` | FDM 熔融堆積列印 |
| `/#/services/sla` | SLA 光固化列印 |
| `/#/materials` | 材料介紹 |
| `/#/gallery` | 作品集 |
| `/#/faq` | 常見問題 |
| `/#/contact` | 聯絡我們 |
| `/#/quote` | 詢價表單 |
| `/#/privacy` | 隱私政策 |

> 使用 HashRouter，所有路徑格式為 `/#/path`，確保 GitHub Pages 不會 404。

### 後台（需登入）

| 路徑 | 說明 | 最低角色 |
|------|------|---------|
| `/#/admin/login` | 登入 | — |
| `/#/admin/dashboard` | 總覽 + KPI | viewer |
| `/#/admin/inquiries` | 詢價管理列表 | viewer |
| `/#/admin/inquiries/:id` | 詢價詳情、狀態更新、備註 | viewer |
| `/#/admin/analytics` | 分析報表 | viewer |
| `/#/admin/modules` | 未來模組路線圖 | viewer |
| `/#/admin/users` | 帳號管理 | **admin** |

---

## 角色權限

| 角色 | 查看詢價 | 更新狀態 / 備註 | 分析報表 | 帳號管理 |
|------|---------|----------------|---------|---------|
| `viewer` | ✅ | ❌ | ✅ | ❌ |
| `staff` | ✅ | ✅ | ✅ | ❌ |
| `admin` | ✅ | ✅ | ✅ | ✅ |

---

## API 端點

| 方法 | 路徑 | 說明 | 驗證 |
|------|------|------|------|
| GET | `/health` | 健康檢查 | 無 |
| POST | `/api/auth/login` | 取得 JWT | 無 |
| GET | `/api/auth/me` | 目前登入者資訊 | JWT |
| POST | `/api/inquiries` | 送出詢價單（前台） | 無 |
| POST | `/api/analytics/event` | 行為事件追蹤 | 無 |
| GET | `/api/admin/inquiries` | 詢價列表（可篩選狀態） | JWT |
| GET | `/api/admin/inquiries/{id}` | 詢價詳情含備註 / 歷程 | JWT |
| PATCH | `/api/admin/inquiries/{id}/status` | 更新狀態 | JWT staff+ |
| POST | `/api/admin/inquiries/{id}/notes` | 新增備註 | JWT staff+ |
| GET | `/api/analytics/admin/summary` | 30 天 KPI 摘要 | JWT |
| GET | `/api/analytics/admin/popular-pages` | 熱門頁面排行 | JWT |
| GET | `/api/analytics/admin/daily-trend` | 每日瀏覽趨勢 | JWT |
| GET | `/api/admin/users` | 帳號列表 | JWT admin |
| POST | `/api/admin/users` | 建立帳號 | JWT admin |
| PATCH | `/api/admin/users/{id}` | 更新帳號（啟用/停用）| JWT admin |
| GET | `/api/admin/modules` | 未來模組狀態 | JWT |

互動文件：`http://localhost:8001/api/docs`

---

## 詢價狀態流程

```
新詢價 → 已查看 → 待切片 → 已切片 → 已報價 → 等待客戶回覆 → 製作中 → 已完成
                                                                         ↓
                                                                       已取消
```

---

## 目錄結構

```
3d-printing-website/
├── backend/
│   ├── main.py                  # FastAPI 入口 + startup seed
│   ├── config.py                # 環境變數（Pydantic-free）
│   ├── database.py              # SQLAlchemy engine（SQLite/PostgreSQL）
│   ├── models.py                # ORM 模型（Inquiry、User、UserEvent…）
│   ├── auth/                    # JWT 工具（hash_password、get_current_user）
│   ├── routers/
│   │   ├── auth.py              # 登入 / me
│   │   ├── inquiries.py         # 詢價表單 + email BackgroundTasks
│   │   ├── admin.py             # 後台詢價 / 帳號 API
│   │   ├── analytics.py         # 事件追蹤 + 後台分析
│   │   ├── health.py            # /health
│   │   └── future_modules.py    # Phase 2 模組 placeholder
│   ├── services/
│   │   └── email.py             # SMTP 寄信（smtplib + MAIL_ENABLED 開關）
│   ├── alembic/                 # 資料庫遷移
│   ├── requirements.txt
│   ├── render.yaml              # Render 部署設定
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # HashRouter + 所有路由宣告
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx   # Header / Footer / CookieBanner（前台）
│   │   │   └── AdminLayout.jsx  # 側欄導覽 + 行動版漢堡選單（後台）
│   │   ├── pages/
│   │   │   ├── Home.jsx … Privacy.jsx   # 11 個前台頁面
│   │   │   └── admin/
│   │   │       ├── Login.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Inquiries.jsx
│   │   │       ├── InquiryDetail.jsx
│   │   │       ├── Analytics.jsx
│   │   │       ├── Modules.jsx
│   │   │       └── Users.jsx
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx       # 登入守衛 + 角色 403
│   │   │   ├── ui/                      # Badge、Button、Spinner…
│   │   │   └── forms/                   # FormInput、FormSelect、FormTextarea
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # JWT localStorage 持久化
│   │   ├── hooks/
│   │   │   ├── useApi.js                # 通用 loading/error/execute hook
│   │   │   └── useAnalytics.js          # sessionStorage session ID + trackEvent
│   │   └── services/
│   │       └── api.js                   # 所有 fetch 封裝（BASE_URL + token）
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── start-dev.sh                 # 一鍵啟動前後端
└── README.md
```

---

## 部署：GitHub Pages（前端）

```bash
# 1. 設定 .env.production（或直接寫在 vite.config.js）
VITE_API_BASE_URL=https://your-api.onrender.com
VITE_BASE_PATH=/your-repo-name/

# 2. 建置
cd frontend
npm run build:gh   # = vite build --base=$VITE_BASE_PATH

# 3. 自動部署（已設定 GitHub Actions）
git push origin main   # 推送後 .github/workflows/deploy.yml 自動觸發
```

## 部署：Render（後端）

1. 在 Render 建立 **Web Service**，連接 GitHub repo
2. Root Directory：`backend`
3. Build Command：`pip install -r requirements.txt`
4. Start Command：`alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 建立 **PostgreSQL** 資料庫，Render 自動注入 `DATABASE_URL`
6. 設定其餘環境變數（參考 `backend/.env.example`）
7. Email：在 Dashboard 手動填入 `MAIL_USERNAME` / `MAIL_PASSWORD`（`sync: false`）

> **冷啟動**：Render 免費方案閒置後需 ~30 秒喚醒，前端 API 請求已有錯誤處理。

---

## Email 通知設定（Gmail）

1. Google 帳號開啟**兩步驟驗證**
2. 前往「應用程式密碼」產生 16 碼密碼
3. 在 `.env` 設定：
   ```
   MAIL_ENABLED=true
   MAIL_USERNAME=your@gmail.com
   MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   MAIL_ADMIN_TO=接收通知的信箱
   ```

本地開發設 `MAIL_ENABLED=false`，後端只會 log 不寄信。

---

## 第二階段預留模組

| 模組 | 說明 | 後端位置 |
|------|------|---------|
| 自動估價系統 | STL 體積 + 支撐量計算報價 | `backend/modules/pricing_engine/` |
| 模型渲染引擎 | 瀏覽器 3D 預覽（WebGL）| `backend/modules/render_engine/` |
| 檔案格式檢查 | 非流形 / 薄壁偵測 | `backend/modules/file_checker/` |
| FDM 切片整合 | 後台切片取得時間 / 耗材 | `backend/modules/slicer_adapter/` |
| STL/OBJ 分析 | 尺寸 / 體積 / 面數報告 | `backend/modules/model_analyzer/` |

目前狀態 API：`GET /api/admin/modules`（全部 `coming_soon`）
