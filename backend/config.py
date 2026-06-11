import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./db.sqlite3")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))

ADMIN_DEFAULT_EMAIL = os.getenv("ADMIN_DEFAULT_EMAIL", "admin@example.com")
ADMIN_DEFAULT_PASSWORD = os.getenv("ADMIN_DEFAULT_PASSWORD", "admin123")

CORS_ORIGINS_RAW = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://localhost:5174"
)
def _normalize_origin(o: str) -> str:
    o = o.strip()
    parts = o.split("/")
    return "/".join(parts[:3]) if len(parts) >= 3 else o

CORS_ORIGINS = [_normalize_origin(o) for o in CORS_ORIGINS_RAW.split(",") if o.strip()]

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# === Email (SMTP) ===
MAIL_ENABLED = os.getenv("MAIL_ENABLED", "false").lower() == "true"
MAIL_HOST = os.getenv("MAIL_HOST", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USERNAME)
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "職人自造")
MAIL_ADMIN_TO = os.getenv("MAIL_ADMIN_TO", MAIL_USERNAME)  # 接收詢價通知的信箱

# SLA 估價 (僅後台使用，預留)
SLA_PRICE_PER_CM3 = float(os.getenv("SLA_PRICE_PER_CM3", "1.6"))
SLA_SHELL_THICKNESS_MM = 2.0

# FDM 估價 (僅後台使用，預留)
FDM_PRICE_PER_GRAM = float(os.getenv("FDM_PRICE_PER_GRAM", "3.0"))

# 列印範圍 (mm)
PRINTER_MAX_X = 320.0
PRINTER_MAX_Y = 340.0
PRINTER_MAX_Z = 340.0

# 檔案儲存路徑 (第二階段啟用)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
