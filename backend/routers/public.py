"""前台公開 CMS API：免登入，只回傳 published / 可見資料，不含管理內部欄位。"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import SiteSettings, NewsPost, GalleryItem, FaqItem, MaterialItem

router = APIRouter()


def _iso(dt):
    return dt.isoformat() if dt else None


# ── Site Settings ─────────────────────────────────────────────────────────────
DEFAULT_SITE_SETTINGS = {
    "site_name": "職人自造",
    "tagline": "精準製造，實現你的設計",
    "logo_url": None,
    "primary_color": "#f97316",
    "secondary_color": "#3f3f46",
    "background_color": "#09090b",
    "surface_color": "#18181b",
    "text_color": "#fafafa",
    "accent_color": "#f97316",
    "border_color": "#27272a",
    "hero_title": "精準製造，實現你的設計",
    "hero_subtitle": "專業 FDM・SLA 3D 列印服務，提供建模、修模、後處理加工。",
    "hero_cta_text": "立即詢價",
    "hero_cta_link": "/quote",
    "hero_image_url": None,
    "contact_email": "",
    "contact_phone": "",
    "contact_line": "",
    "contact_instagram": "",
}

_SITE_PUBLIC_FIELDS = list(DEFAULT_SITE_SETTINGS.keys())


def _serialize_site_settings(s: SiteSettings) -> dict:
    return {f: getattr(s, f) for f in _SITE_PUBLIC_FIELDS}


@router.get("/site-settings")
def public_site_settings(db: Session = Depends(get_db)):
    s = db.query(SiteSettings).order_by(SiteSettings.id).first()
    if not s:
        return DEFAULT_SITE_SETTINGS
    return _serialize_site_settings(s)


# ── News ──────────────────────────────────────────────────────────────────────
def _news_visible(query, now):
    """只取 published 且未過期；pinned 優先、published_at 新到舊。"""
    return query.filter(NewsPost.status == "published")


def _news_card(n: NewsPost) -> dict:
    return {
        "id": n.id,
        "title": n.title,
        "slug": n.slug,
        "category": n.category,
        "summary": n.summary,
        "cover_image_url": n.cover_image_url,
        "is_pinned": n.is_pinned,
        "published_at": _iso(n.published_at),
    }


@router.get("/news")
def public_news_list(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    items = _news_visible(db.query(NewsPost), now).all()
    items = [n for n in items if n.expires_at is None or n.expires_at > now]
    items.sort(key=lambda n: (0 if n.is_pinned else 1, -((n.published_at or n.created_at).timestamp())))
    return [_news_card(n) for n in items]


@router.get("/news/{slug}")
def public_news_detail(slug: str, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    n = db.query(NewsPost).filter(NewsPost.slug == slug, NewsPost.status == "published").first()
    if not n or (n.expires_at is not None and n.expires_at <= now):
        raise HTTPException(404, "找不到此公告")
    data = _news_card(n)
    data["content"] = n.content
    return data


# ── Gallery ───────────────────────────────────────────────────────────────────
def _gallery_card(g: GalleryItem) -> dict:
    return {
        "id": g.id, "title": g.title, "slug": g.slug,
        "process_type": g.process_type, "category": g.category, "material": g.material,
        "summary": g.summary, "image_url": g.image_url, "thumbnail_url": g.thumbnail_url,
        "is_featured": g.is_featured,
    }


@router.get("/gallery")
def public_gallery_list(process_type: str = None, featured: bool = False, db: Session = Depends(get_db)):
    q = db.query(GalleryItem).filter(GalleryItem.status == "published")
    if process_type and process_type.lower() != "all":
        q = q.filter(GalleryItem.process_type == process_type)
    if featured:
        q = q.filter(GalleryItem.is_featured == True)
    items = q.all()
    items.sort(key=lambda g: (g.sort_order, -g.id))
    return [_gallery_card(g) for g in items]


@router.get("/gallery/{slug}")
def public_gallery_detail(slug: str, db: Session = Depends(get_db)):
    g = db.query(GalleryItem).filter(GalleryItem.slug == slug, GalleryItem.status == "published").first()
    if not g:
        raise HTTPException(404, "找不到此作品")
    data = _gallery_card(g)
    data["description"] = g.description
    return data


# ── FAQ ───────────────────────────────────────────────────────────────────────
@router.get("/faqs")
def public_faqs(db: Session = Depends(get_db)):
    items = (
        db.query(FaqItem)
        .filter(FaqItem.status == "published")
        .order_by(FaqItem.sort_order, FaqItem.id)
        .all()
    )
    return [
        {"id": f.id, "question": f.question, "answer": f.answer, "category": f.category}
        for f in items
    ]


# ── Materials ─────────────────────────────────────────────────────────────────
@router.get("/materials")
def public_materials(process_type: str = None, db: Session = Depends(get_db)):
    q = db.query(MaterialItem).filter(MaterialItem.status == "published")
    if process_type and process_type.lower() != "all":
        q = q.filter(MaterialItem.process_type == process_type)
    items = q.order_by(MaterialItem.sort_order, MaterialItem.id).all()
    return [
        {
            "id": m.id, "name": m.name, "process_type": m.process_type, "category": m.category,
            "properties": m.properties, "suitable_for": m.suitable_for,
            "description": m.description, "image_url": m.image_url,
        }
        for m in items
    ]
