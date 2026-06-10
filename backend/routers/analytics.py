from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import VisitorSession, UserEvent, Inquiry
from auth import get_current_user
from models import User

router = APIRouter()


class EventRequest(BaseModel):
    session_id: str
    event_type: str         # pageview | click | quote_click | form_enter | form_submit
    page: Optional[str] = None
    element: Optional[str] = None
    referrer: Optional[str] = None
    duration_ms: Optional[int] = None
    user_agent: Optional[str] = None


@router.post("/event")
def track_event(req: EventRequest, request: Request, db: Session = Depends(get_db)):
    user_agent = req.user_agent or request.headers.get("user-agent", "")
    referrer = req.referrer or request.headers.get("referer", "")

    # 建立或更新 session
    session = db.query(VisitorSession).filter(VisitorSession.session_id == req.session_id).first()
    if not session:
        session = VisitorSession(
            session_id=req.session_id,
            user_agent=user_agent,
            referrer=referrer,
        )
        db.add(session)
    else:
        session.last_seen_at = datetime.utcnow()

    event = UserEvent(
        session_id=req.session_id,
        event_type=req.event_type,
        page=req.page,
        element=req.element,
        referrer=referrer,
        duration_ms=req.duration_ms,
    )
    db.add(event)
    db.commit()
    return {"ok": True}


@router.post("/session/link-inquiry")
def link_inquiry(session_id: str, inquiry_id: int, db: Session = Depends(get_db)):
    """表單送出後，將 session 與 inquiry 關聯"""
    session = db.query(VisitorSession).filter(VisitorSession.session_id == session_id).first()
    if session:
        session.inquiry_id = inquiry_id
        db.commit()
    return {"ok": True}


# ── 後台分析 ──────────────────────────────────────────────────────────────────
@router.get("/admin/summary")
def summary(days: int = 30, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=days)

    total_pageviews = db.query(func.count(UserEvent.id)).filter(
        UserEvent.event_type == "pageview",
        UserEvent.created_at >= since
    ).scalar() or 0

    quote_clicks = db.query(func.count(UserEvent.id)).filter(
        UserEvent.event_type == "quote_click",
        UserEvent.created_at >= since
    ).scalar() or 0

    form_submits = db.query(func.count(UserEvent.id)).filter(
        UserEvent.event_type == "form_submit",
        UserEvent.created_at >= since
    ).scalar() or 0

    unique_sessions = db.query(func.count(func.distinct(UserEvent.session_id))).filter(
        UserEvent.created_at >= since
    ).scalar() or 0

    total_inquiries = db.query(func.count(Inquiry.id)).filter(
        Inquiry.created_at >= since
    ).scalar() or 0

    return {
        "period_days": days,
        "total_pageviews": total_pageviews,
        "unique_sessions": unique_sessions,
        "quote_clicks": quote_clicks,
        "form_submits": form_submits,
        "total_inquiries": total_inquiries,
    }


@router.get("/admin/popular-pages")
def popular_pages(days: int = 30, limit: int = 10, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(UserEvent.page, func.count(UserEvent.id).label("views"))
        .filter(UserEvent.event_type == "pageview", UserEvent.created_at >= since, UserEvent.page != None)
        .group_by(UserEvent.page)
        .order_by(func.count(UserEvent.id).desc())
        .limit(limit)
        .all()
    )
    return [{"page": r.page, "views": r.views} for r in rows]


@router.get("/admin/daily-trend")
def daily_trend(days: int = 30, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(
            func.date(UserEvent.created_at).label("date"),
            func.count(UserEvent.id).label("views"),
        )
        .filter(UserEvent.event_type == "pageview", UserEvent.created_at >= since)
        .group_by(func.date(UserEvent.created_at))
        .order_by(func.date(UserEvent.created_at))
        .all()
    )
    # Fill in missing days with 0
    result = {str(r.date): r.views for r in rows}
    out = []
    for i in range(days):
        d = (datetime.utcnow() - timedelta(days=days - 1 - i)).date()
        out.append({"date": str(d), "views": result.get(str(d), 0)})
    return out
