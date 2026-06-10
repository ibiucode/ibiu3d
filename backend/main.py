from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import User
from auth import hash_password
from config import CORS_ORIGINS, ADMIN_DEFAULT_EMAIL, ADMIN_DEFAULT_PASSWORD, ENVIRONMENT
from routers import auth, inquiries, admin, analytics, health, future_modules

# 建立所有資料表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="3D列印工作坊 API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(inquiries.router, prefix="/api", tags=["inquiries"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(future_modules.router, prefix="/api/admin", tags=["future-modules"])


@app.on_event("startup")
def seed_admin():
    """首次啟動時建立預設 Admin 帳號"""
    db: Session = SessionLocal()
    try:
        if not db.query(User).filter(User.email == ADMIN_DEFAULT_EMAIL).first():
            admin_user = User(
                email=ADMIN_DEFAULT_EMAIL,
                hashed_password=hash_password(ADMIN_DEFAULT_PASSWORD),
                name="管理員",
                role="admin",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            print(f"[startup] 已建立預設管理員：{ADMIN_DEFAULT_EMAIL}")
    finally:
        db.close()


@app.get("/")
def root():
    return {"status": "ok", "service": "3D列印工作坊 API", "env": ENVIRONMENT}
