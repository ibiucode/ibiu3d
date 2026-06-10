from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()


@router.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "db": "connected" if db_ok else "error"}
