# 職人自造 3D列印工作坊 — Codebase Guide

## 專案定位

B2C 3D 列印服務品牌網站。前台讓客戶了解服務並送出詢價；後台讓管理員/員工處理詢價單、查看分析數據、管理帳號。

---

## 技術選型

| 項目 | 選擇 | 原因 |
|------|------|------|
| 前端框架 | React 19 + Vite 8 | SPA，HashRouter 支援 GitHub Pages 靜態部署 |
| CSS | Tailwind CSS v4 | @tailwindcss/vite 插件，無 postcss 設定 |
| 路由 | react-router-dom v7 (HashRouter) | `#/path` 避免 GitHub Pages 404 |
| 後端 | FastAPI (Python) | 輕量、自動 OpenAPI 文件 |
| ORM | SQLAlchemy + Alembic | 支援 SQLite（開發）/ PostgreSQL（生產） |
| 認證 | JWT (python-jose) + bcrypt | localStorage 持久化，角色：admin/staff/viewer |
| Email | smtplib (內建) | MAIL_ENABLED=false 可關閉，不影響測試 |

---

## 前端架構重點

### 路由宣告（`src/App.jsx`）
```
HashRouter
└── AuthProvider
    ├── <Route element={<MainLayout />}>  ← 公開頁面（前台 Header/Footer）
    │   └── / /about /services /quote … (11 頁)
    ├── /admin/login                      ← 無 layout
    ├── /admin → redirect /admin/dashboard
    └── AdminRoute(ProtectedRoute + AdminLayout)
        ├── /admin/dashboard
        ├── /admin/inquiries
        ├── /admin/inquiries/:id
        ├── /admin/analytics
        ├── /admin/modules
        └── /admin/users  (requiredRole="admin")
```

`AdminRoute` 是包裝元件，合併 `ProtectedRoute`（未登入導 login）+ `AdminLayout`（左側欄）。

### API 服務（`src/services/api.js`）
- `BASE_URL` = `VITE_API_BASE_URL` env var（預設 `http://localhost:8001`）
- 所有請求自動附加 `Authorization: Bearer <token>`（從 localStorage）
- 後端 4xx/5xx 解析 `detail` 欄位拋出 Error

### 分析追蹤（`src/hooks/useAnalytics.js`）
- `sessionStorage` 維持 session ID（關分頁後重設）
- `trackEvent(type, props)` 呼叫 `POST /api/analytics/event`
- `trackPageView(path)` 在每個頁面 useEffect 呼叫

### 狀態管理
- 無 Redux/Zustand：`useApi` hook 封裝 `loading/error/data/execute`
- Auth 用 React Context（`AuthContext.jsx`），整個 app 共享

---

## 後端架構重點

### 入口（`main.py`）
- startup event：`create_all()` 建表 + `seed_admin()` 建預設管理員
- router 掛載：`/api/auth`、`/api/inquiries`、`/api/admin`、`/api/analytics`、`/api/admin`（modules）

### 認證（`auth/`）
```python
get_current_user(token)  # 解碼 JWT，查 DB 確認 user 存在且 is_active
```
所有後台 API 都 `Depends(get_current_user)`；帳號管理另外檢查 `role == "admin"`。

### 資料模型（`models.py`）
```
User           — id, email, hashed_password, name, role, is_active
Inquiry        — id, customer_name, email, phone, line_id, service_type,
                 budget, material_preference, quantity, deadline,
                 customer_note, status, created_at
InquiryNote    — id, inquiry_id, content, author, created_at
StatusHistory  — id, inquiry_id, from_status, to_status, changed_by, changed_at
VisitorSession — id, session_id, user_agent, referrer, inquiry_id, …
UserEvent      — id, session_id, event_type, page, element, referrer, …
```

### Email（`services/email.py`）
- `notify_admin(inquiry)` — 寄給 `MAIL_ADMIN_TO`
- `confirm_customer(inquiry)` — 寄給客戶（若有 email）
- `MAIL_ENABLED=false` 時只 print log，不發送
- 使用 FastAPI `BackgroundTasks` — API 立即回應，email 背景送出

### 資料庫遷移（Alembic）
```bash
# 新增欄位後產生遷移
cd backend && python3 -m alembic revision --autogenerate -m "描述"
python3 -m alembic upgrade head

# 若 create_all 已建表，同步狀態
python3 -m alembic stamp head
```

---

## 常見操作

### 新增前台頁面
1. 在 `frontend/src/pages/` 建立 `NewPage.jsx`
2. 在 `App.jsx` 的 `<Route element={<MainLayout />}>` 下加 `<Route path="/new" element={<NewPage />} />`
3. 在 `Header.jsx` 的導覽陣列加入連結

### 新增後台頁面
1. 在 `frontend/src/pages/admin/` 建立 `NewAdmin.jsx`
2. 在 `App.jsx` 加 `<Route path="/admin/new" element={<AdminRoute><NewAdmin /></AdminRoute>} />`
3. 在 `AdminLayout.jsx` 的 `NAV` 陣列加入 `{ label, path, icon }`
4. 若限 admin，在 AdminRoute 加 `requiredRole="admin"`

### 新增 API 端點
1. 在對應 router 檔案新增 endpoint
2. 在 `frontend/src/services/api.js` 新增對應方法
3. 若需要新欄位 → 修改 `models.py` → `alembic revision --autogenerate` → `alembic upgrade head`

### 查看即時 API 文件
```
http://localhost:8001/api/docs
```

---

## 環境變數

### 後端（`backend/.env`）
| 變數 | 預設 | 說明 |
|------|------|------|
| `DATABASE_URL` | sqlite:///./db.sqlite3 | 生產用 postgresql:// |
| `JWT_SECRET` | 必填 | 建議 32 字元以上隨機字串 |
| `ADMIN_DEFAULT_EMAIL` | admin@example.com | 首次啟動建立的管理員 |
| `ADMIN_DEFAULT_PASSWORD` | admin123 | **生產環境必須修改** |
| `CORS_ORIGINS` | localhost:5173,5174 | 前端 origin，逗號分隔 |
| `MAIL_ENABLED` | false | true 才實際寄信 |
| `MAIL_HOST/PORT/USERNAME/PASSWORD` | — | SMTP 設定（Gmail 用應用程式密碼）|

### 前端（`frontend/.env.local`）
| 變數 | 預設 | 說明 |
|------|------|------|
| `VITE_API_BASE_URL` | http://localhost:8001 | 後端 URL |
| `VITE_BASE_PATH` | / | GitHub Pages 部署時設為 `/repo-name/` |

---

## 部署快速參考

### GitHub Pages（前端）
```bash
cd frontend
npm run build:gh   # VITE_BASE_PATH 須先設定
# 或推 main branch 讓 GitHub Actions 自動部署
```

### Render（後端）
- Root Directory: `backend`
- Start: `alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT`
- 環境變數：DATABASE_URL（Render DB 自動注入）、JWT_SECRET、CORS_ORIGINS、MAIL_*

---

## Phase 2 開發指引

未來模組的後端佔位在 `backend/routers/future_modules.py`，前端展示在 `/#/admin/modules`。

實作時建議：
1. 在 `backend/modules/<module_name>/` 建立業務邏輯
2. 在 `backend/routers/` 建立對應 router
3. 將 `future_modules.py` 中對應模組的 `status` 改為 `"active"`
4. 前端在 `Modules.jsx` 的對應卡片加入「前往」連結
