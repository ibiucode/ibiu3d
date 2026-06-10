from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models import Inquiry, InquiryNote, InquiryStatusHistory, User, INQUIRY_STATUSES, ROLES
from auth import get_current_user, require_admin, require_staff_or_above, hash_password

router = APIRouter()


# ── 詢價單列表 ────────────────────────────────────────────────────────────────
@router.get("/inquiries")
def list_inquiries(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Inquiry).order_by(Inquiry.created_at.desc())
    if status:
        q = q.filter(Inquiry.status == status)
    inquiries = q.all()
    return [
        {
            "id": i.id,
            "customer_name": i.customer_name,
            "email": i.email,
            "line_id": i.line_id,
            "phone": i.phone,
            "service_type": i.service_type,
            "budget": i.budget,
            "status": i.status,
            "created_at": i.created_at.isoformat(),
        }
        for i in inquiries
    ]


@router.get("/inquiries/{inquiry_id}")
def get_inquiry(inquiry_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    i = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not i:
        raise HTTPException(404, "找不到此詢價單")
    return {
        "id": i.id,
        "customer_name": i.customer_name,
        "email": i.email,
        "line_id": i.line_id,
        "phone": i.phone,
        "service_type": i.service_type,
        "material_preference": i.material_preference,
        "budget": i.budget,
        "quantity": i.quantity,
        "usage": i.usage,
        "deadline": i.deadline,
        "customer_note": i.customer_note,
        "privacy_agreed": i.privacy_agreed,
        "status": i.status,
        "final_quote_price": i.final_quote_price,
        "created_at": i.created_at.isoformat(),
        "updated_at": i.updated_at.isoformat(),
        "notes": [
            {
                "id": n.id,
                "content": n.content,
                "author": n.author.name if n.author else "系統",
                "created_at": n.created_at.isoformat(),
            }
            for n in i.notes
        ],
        "status_history": [
            {
                "from": h.from_status,
                "to": h.to_status,
                "changed_at": h.changed_at.isoformat(),
            }
            for h in i.status_history
        ],
    }


class StatusUpdate(BaseModel):
    status: str


@router.patch("/inquiries/{inquiry_id}/status")
def update_status(
    inquiry_id: int,
    req: StatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_above),
):
    if req.status not in INQUIRY_STATUSES:
        raise HTTPException(400, f"無效狀態，可用：{INQUIRY_STATUSES}")
    i = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not i:
        raise HTTPException(404, "找不到此詢價單")
    history = InquiryStatusHistory(
        inquiry_id=inquiry_id,
        from_status=i.status,
        to_status=req.status,
        changed_by=user.id,
    )
    db.add(history)
    i.status = req.status
    i.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "status": req.status}


class NoteCreate(BaseModel):
    content: str


@router.post("/inquiries/{inquiry_id}/notes")
def add_note(
    inquiry_id: int,
    req: NoteCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_above),
):
    i = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not i:
        raise HTTPException(404, "找不到此詢價單")
    note = InquiryNote(inquiry_id=inquiry_id, author_id=user.id, content=req.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": note.id, "content": note.content, "created_at": note.created_at.isoformat()}


# ── 帳號管理 (Admin only) ─────────────────────────────────────────────────────
@router.get("/users")
def list_users(db: Session = Depends(get_db), user: User = Depends(require_admin)):
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "name": u.name, "role": u.role, "is_active": u.is_active} for u in users]


class UserCreate(BaseModel):
    email: str
    password: str
    name: str = ""
    role: str = "viewer"


@router.post("/users")
def create_user(req: UserCreate, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    if req.role not in ROLES:
        raise HTTPException(400, f"無效角色，可用：{ROLES}")
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(400, "Email 已被使用")
    new_user = User(email=req.email, hashed_password=hash_password(req.password), name=req.name, role=req.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email, "role": new_user.role}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


@router.patch("/users/{user_id}")
def update_user(user_id: int, req: UserUpdate, db: Session = Depends(get_db), current: User = Depends(require_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "找不到此帳號")
    if req.name is not None:
        u.name = req.name
    if req.role is not None:
        if req.role not in ROLES:
            raise HTTPException(400, f"無效角色")
        u.role = req.role
    if req.is_active is not None:
        u.is_active = req.is_active
    if req.password:
        u.hashed_password = hash_password(req.password)
    db.commit()
    return {"success": True}
