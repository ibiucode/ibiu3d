from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Inquiry
from services.email import notify_admin, confirm_customer

router = APIRouter()


class InquiryCreate(BaseModel):
    customer_name: str
    email: Optional[str] = None
    line_id: Optional[str] = None
    phone: Optional[str] = None
    service_type: Optional[str] = None
    material_preference: Optional[str] = None
    budget: Optional[str] = None
    quantity: int = 1
    usage: Optional[str] = None
    deadline: Optional[str] = None
    customer_note: Optional[str] = None
    privacy_agreed: bool = False
    session_id: Optional[str] = None


@router.post("/inquiries")
def create_inquiry(req: InquiryCreate, background: BackgroundTasks, db: Session = Depends(get_db)):
    if not req.email and not req.line_id and not req.phone:
        raise HTTPException(400, "請至少填寫一種聯絡方式（Email、LINE 或電話）")
    if not req.privacy_agreed:
        raise HTTPException(400, "請同意隱私政策")

    inquiry = Inquiry(
        customer_name=req.customer_name,
        email=req.email,
        line_id=req.line_id,
        phone=req.phone,
        service_type=req.service_type,
        material_preference=req.material_preference,
        budget=req.budget,
        quantity=req.quantity,
        usage=req.usage,
        deadline=req.deadline,
        customer_note=req.customer_note,
        privacy_agreed=req.privacy_agreed,
        session_id=req.session_id,
        status="新詢價",
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    background.add_task(notify_admin, inquiry)
    background.add_task(confirm_customer, inquiry)

    return {
        "success": True,
        "inquiry_id": inquiry.id,
        "message": "詢價已送出！我們將盡快與您聯繫。",
    }
