"""後台 CMS 管理 API：需登入。
權限：
- GET（讀取）           → get_current_user（含 viewer）
- POST/PUT（新增/編輯/發布） → require_staff_or_above
- DELETE（封存）/ site-settings 更新 → require_admin
"""
import re
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import SiteSettings, NewsPost, GalleryItem, FaqItem, MaterialItem, User, CMS_STATUSES, CMS_PROCESS_TYPES
from auth import get_current_user, require_admin, require_staff_or_above

router = APIRouter()


def _iso(dt):
    return dt.isoformat() if dt else None


def _parse_dt(value: Optional[str]):
    """接受 ISO 日期或日期時間字串；空值回 None。"""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00").replace("+00:00", ""))
    except ValueError:
        raise HTTPException(400, f"日期格式無效：{value}")


def _slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", (text or "").strip().lower()).strip("-")
    return s


def _unique_slug(db: Session, model, base: str, fallback_prefix: str) -> str:
    base = base or f"{fallback_prefix}-{int(datetime.utcnow().timestamp())}"
    slug, i = base, 2
    while db.query(model).filter(model.slug == slug).first():
        slug = f"{base}-{i}"
        i += 1
    return slug


# ── Site Settings ─────────────────────────────────────────────────────────────
_SITE_FIELDS = [
    "site_name", "tagline", "logo_url",
    "primary_color", "secondary_color", "background_color",
    "surface_color", "text_color", "accent_color", "border_color",
    "hero_title", "hero_subtitle", "hero_cta_text", "hero_cta_link", "hero_image_url",
    "contact_email", "contact_phone", "contact_line", "contact_instagram",
]


def _get_or_create_settings(db: Session) -> SiteSettings:
    s = db.query(SiteSettings).order_by(SiteSettings.id).first()
    if not s:
        s = SiteSettings()
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


def _serialize_settings(s: SiteSettings) -> dict:
    data = {f: getattr(s, f) for f in _SITE_FIELDS}
    data["id"] = s.id
    data["updated_at"] = s.updated_at.isoformat() if s.updated_at else None
    data["updated_by"] = s.updated_by
    return data


class SiteSettingsUpdate(BaseModel):
    site_name: Optional[str] = None
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    background_color: Optional[str] = None
    surface_color: Optional[str] = None
    text_color: Optional[str] = None
    accent_color: Optional[str] = None
    border_color: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_cta_text: Optional[str] = None
    hero_cta_link: Optional[str] = None
    hero_image_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_line: Optional[str] = None
    contact_instagram: Optional[str] = None


@router.get("/site-settings")
def get_site_settings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _serialize_settings(_get_or_create_settings(db))


@router.put("/site-settings")
def update_site_settings(
    req: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    s = _get_or_create_settings(db)
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    s.updated_by = user.id
    s.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(s)
    return _serialize_settings(s)


# ── News ──────────────────────────────────────────────────────────────────────
def _serialize_news(n: NewsPost) -> dict:
    return {
        "id": n.id, "title": n.title, "slug": n.slug, "category": n.category,
        "summary": n.summary, "content": n.content, "cover_image_url": n.cover_image_url,
        "status": n.status, "is_pinned": n.is_pinned,
        "published_at": _iso(n.published_at), "expires_at": _iso(n.expires_at),
        "sort_order": n.sort_order,
        "created_at": _iso(n.created_at), "updated_at": _iso(n.updated_at),
        "created_by": n.created_by, "updated_by": n.updated_by,
    }


class NewsCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    category: Optional[str] = ""
    summary: Optional[str] = ""
    content: Optional[str] = ""
    cover_image_url: Optional[str] = None
    status: Optional[str] = "draft"
    is_pinned: Optional[bool] = False
    published_at: Optional[str] = None
    expires_at: Optional[str] = None
    sort_order: Optional[int] = 0


class NewsUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: Optional[str] = None
    is_pinned: Optional[bool] = None
    published_at: Optional[str] = None
    expires_at: Optional[str] = None
    sort_order: Optional[int] = None


def _validate_status(status):
    if status is not None and status not in CMS_STATUSES:
        raise HTTPException(400, f"無效狀態，可用：{CMS_STATUSES}")


@router.get("/news")
def admin_news_list(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.query(NewsPost).order_by(NewsPost.is_pinned.desc(), NewsPost.created_at.desc()).all()
    return [_serialize_news(n) for n in items]


@router.get("/news/{news_id}")
def admin_news_get(news_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    n = db.query(NewsPost).filter(NewsPost.id == news_id).first()
    if not n:
        raise HTTPException(404, "找不到此公告")
    return _serialize_news(n)


@router.post("/news")
def admin_news_create(req: NewsCreate, db: Session = Depends(get_db), user: User = Depends(require_staff_or_above)):
    _validate_status(req.status)
    slug = _unique_slug(db, NewsPost, req.slug or _slugify(req.title), "news")
    published_at = _parse_dt(req.published_at)
    if req.status == "published" and not published_at:
        published_at = datetime.utcnow()
    n = NewsPost(
        title=req.title, slug=slug, category=req.category or "", summary=req.summary or "",
        content=req.content or "", cover_image_url=req.cover_image_url,
        status=req.status or "draft", is_pinned=bool(req.is_pinned),
        published_at=published_at, expires_at=_parse_dt(req.expires_at),
        sort_order=req.sort_order or 0, created_by=user.id, updated_by=user.id,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return _serialize_news(n)


@router.put("/news/{news_id}")
def admin_news_update(news_id: int, req: NewsUpdate, db: Session = Depends(get_db), user: User = Depends(require_staff_or_above)):
    n = db.query(NewsPost).filter(NewsPost.id == news_id).first()
    if not n:
        raise HTTPException(404, "找不到此公告")
    _validate_status(req.status)
    data = req.model_dump(exclude_unset=True)
    if "slug" in data:
        new_slug = data.pop("slug") or _slugify(n.title)
        if new_slug != n.slug:
            n.slug = _unique_slug(db, NewsPost, new_slug, "news")
    for field in ("published_at", "expires_at"):
        if field in data:
            setattr(n, field, _parse_dt(data.pop(field)))
    for field, value in data.items():
        setattr(n, field, value)
    if n.status == "published" and not n.published_at:
        n.published_at = datetime.utcnow()
    n.updated_by = user.id
    n.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(n)
    return _serialize_news(n)


@router.delete("/news/{news_id}")
def admin_news_delete(news_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    """軟封存（status=archived），不硬刪資料。"""
    n = db.query(NewsPost).filter(NewsPost.id == news_id).first()
    if not n:
        raise HTTPException(404, "找不到此公告")
    n.status = "archived"
    n.updated_by = user.id
    n.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "id": news_id, "status": "archived"}


# ── Gallery ───────────────────────────────────────────────────────────────────
def _validate_process_type(pt):
    if pt is not None and pt not in CMS_PROCESS_TYPES:
        raise HTTPException(400, f"無效工法，可用：{CMS_PROCESS_TYPES}")


def _serialize_gallery(g: GalleryItem) -> dict:
    return {
        "id": g.id, "title": g.title, "slug": g.slug, "process_type": g.process_type,
        "category": g.category, "material": g.material, "summary": g.summary,
        "description": g.description, "image_url": g.image_url, "thumbnail_url": g.thumbnail_url,
        "is_featured": g.is_featured, "status": g.status, "sort_order": g.sort_order,
        "created_at": _iso(g.created_at), "updated_at": _iso(g.updated_at),
        "created_by": g.created_by, "updated_by": g.updated_by,
    }


class GalleryCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    process_type: Optional[str] = "Other"
    category: Optional[str] = ""
    material: Optional[str] = ""
    summary: Optional[str] = ""
    description: Optional[str] = ""
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_featured: Optional[bool] = False
    status: Optional[str] = "draft"
    sort_order: Optional[int] = 0


class GalleryUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    process_type: Optional[str] = None
    category: Optional[str] = None
    material: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_featured: Optional[bool] = None
    status: Optional[str] = None
    sort_order: Optional[int] = None


@router.get("/gallery")
def admin_gallery_list(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.query(GalleryItem).order_by(GalleryItem.sort_order, GalleryItem.id.desc()).all()
    return [_serialize_gallery(g) for g in items]


@router.get("/gallery/{item_id}")
def admin_gallery_get(item_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    g = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not g:
        raise HTTPException(404, "找不到此作品")
    return _serialize_gallery(g)


@router.post("/gallery")
def admin_gallery_create(req: GalleryCreate, db: Session = Depends(get_db), user: User = Depends(require_staff_or_above)):
    _validate_status(req.status)
    _validate_process_type(req.process_type)
    slug = _unique_slug(db, GalleryItem, req.slug or _slugify(req.title), "work")
    g = GalleryItem(
        title=req.title, slug=slug, process_type=req.process_type or "Other",
        category=req.category or "", material=req.material or "", summary=req.summary or "",
        description=req.description or "", image_url=req.image_url, thumbnail_url=req.thumbnail_url,
        is_featured=bool(req.is_featured), status=req.status or "draft", sort_order=req.sort_order or 0,
        created_by=user.id, updated_by=user.id,
    )
    db.add(g)
    db.commit()
    db.refresh(g)
    return _serialize_gallery(g)


@router.put("/gallery/{item_id}")
def admin_gallery_update(item_id: int, req: GalleryUpdate, db: Session = Depends(get_db), user: User = Depends(require_staff_or_above)):
    g = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not g:
        raise HTTPException(404, "找不到此作品")
    _validate_status(req.status)
    _validate_process_type(req.process_type)
    data = req.model_dump(exclude_unset=True)
    if "slug" in data:
        new_slug = data.pop("slug") or _slugify(g.title)
        if new_slug != g.slug:
            g.slug = _unique_slug(db, GalleryItem, new_slug, "work")
    for field, value in data.items():
        setattr(g, field, value)
    g.updated_by = user.id
    g.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(g)
    return _serialize_gallery(g)


@router.delete("/gallery/{item_id}")
def admin_gallery_delete(item_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    g = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not g:
        raise HTTPException(404, "找不到此作品")
    g.status = "archived"
    g.updated_by = user.id
    g.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "id": item_id, "status": "archived"}


# ── FAQ ───────────────────────────────────────────────────────────────────────
def _serialize_faq(f: FaqItem) -> dict:
    return {
        "id": f.id, "question": f.question, "answer": f.answer, "category": f.category,
        "status": f.status, "sort_order": f.sort_order,
        "created_at": _iso(f.created_at), "updated_at": _iso(f.updated_at),
        "created_by": f.created_by, "updated_by": f.updated_by,
    }


class FaqCreate(BaseModel):
    question: str
    answer: Optional[str] = ""
    category: Optional[str] = ""
    status: Optional[str] = "draft"
    sort_order: Optional[int] = 0


class FaqUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    sort_order: Optional[int] = None


@router.get("/faqs")
def admin_faq_list(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.query(FaqItem).order_by(FaqItem.sort_order, FaqItem.id).all()
    return [_serialize_faq(f) for f in items]


@router.get("/faqs/{faq_id}")
def admin_faq_get(faq_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    f = db.query(FaqItem).filter(FaqItem.id == faq_id).first()
    if not f:
        raise HTTPException(404, "找不到此 FAQ")
    return _serialize_faq(f)


@router.post("/faqs")
def admin_faq_create(req: FaqCreate, db: Session = Depends(get_db), user: User = Depends(require_staff_or_above)):
    _validate_status(req.status)
    f = FaqItem(
        question=req.question, answer=req.answer or "", category=req.category or "",
        status=req.status or "draft", sort_order=req.sort_order or 0,
        created_by=user.id, updated_by=user.id,
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    return _serialize_faq(f)


@router.put("/faqs/{faq_id}")
def admin_faq_update(faq_id: int, req: FaqUpdate, db: Session = Depends(get_db), user: User = Depends(require_staff_or_above)):
    f = db.query(FaqItem).filter(FaqItem.id == faq_id).first()
    if not f:
        raise HTTPException(404, "找不到此 FAQ")
    _validate_status(req.status)
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(f, field, value)
    f.updated_by = user.id
    f.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(f)
    return _serialize_faq(f)


@router.delete("/faqs/{faq_id}")
def admin_faq_delete(faq_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    f = db.query(FaqItem).filter(FaqItem.id == faq_id).first()
    if not f:
        raise HTTPException(404, "找不到此 FAQ")
    f.status = "archived"
    f.updated_by = user.id
    f.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "id": faq_id, "status": "archived"}


# ── Materials ─────────────────────────────────────────────────────────────────
def _serialize_material(m: MaterialItem) -> dict:
    return {
        "id": m.id, "name": m.name, "process_type": m.process_type, "category": m.category,
        "properties": m.properties, "suitable_for": m.suitable_for, "description": m.description,
        "image_url": m.image_url, "status": m.status, "sort_order": m.sort_order,
        "created_at": _iso(m.created_at), "updated_at": _iso(m.updated_at),
        "created_by": m.created_by, "updated_by": m.updated_by,
    }


class MaterialCreate(BaseModel):
    name: str
    process_type: Optional[str] = "Other"
    category: Optional[str] = ""
    properties: Optional[str] = ""
    suitable_for: Optional[str] = ""
    description: Optional[str] = ""
    image_url: Optional[str] = None
    status: Optional[str] = "draft"
    sort_order: Optional[int] = 0


class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    process_type: Optional[str] = None
    category: Optional[str] = None
    properties: Optional[str] = None
    suitable_for: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None
    sort_order: Optional[int] = None


@router.get("/materials")
def admin_material_list(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.query(MaterialItem).order_by(MaterialItem.sort_order, MaterialItem.id).all()
    return [_serialize_material(m) for m in items]


@router.get("/materials/{item_id}")
def admin_material_get(item_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    m = db.query(MaterialItem).filter(MaterialItem.id == item_id).first()
    if not m:
        raise HTTPException(404, "找不到此材料")
    return _serialize_material(m)


@router.post("/materials")
def admin_material_create(req: MaterialCreate, db: Session = Depends(get_db), user: User = Depends(require_staff_or_above)):
    _validate_status(req.status)
    _validate_process_type(req.process_type)
    m = MaterialItem(
        name=req.name, process_type=req.process_type or "Other", category=req.category or "",
        properties=req.properties or "", suitable_for=req.suitable_for or "", description=req.description or "",
        image_url=req.image_url, status=req.status or "draft", sort_order=req.sort_order or 0,
        created_by=user.id, updated_by=user.id,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return _serialize_material(m)


@router.put("/materials/{item_id}")
def admin_material_update(item_id: int, req: MaterialUpdate, db: Session = Depends(get_db), user: User = Depends(require_staff_or_above)):
    m = db.query(MaterialItem).filter(MaterialItem.id == item_id).first()
    if not m:
        raise HTTPException(404, "找不到此材料")
    _validate_status(req.status)
    _validate_process_type(req.process_type)
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(m, field, value)
    m.updated_by = user.id
    m.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(m)
    return _serialize_material(m)


@router.delete("/materials/{item_id}")
def admin_material_delete(item_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    m = db.query(MaterialItem).filter(MaterialItem.id == item_id).first()
    if not m:
        raise HTTPException(404, "找不到此材料")
    m.status = "archived"
    m.updated_by = user.id
    m.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "id": item_id, "status": "archived"}
