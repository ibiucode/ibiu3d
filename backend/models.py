from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

INQUIRY_STATUSES = [
    "新詢價", "已查看", "待切片", "已切片",
    "已報價", "等待客戶回覆", "製作中", "已完成", "已取消",
]

ROLES = ["admin", "staff", "viewer"]


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, default="")
    role = Column(String, default="viewer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    notes = relationship("InquiryNote", back_populates="author")


class Inquiry(Base):
    __tablename__ = "inquiries"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    email = Column(String)
    line_id = Column(String)
    phone = Column(String)
    service_type = Column(String)
    material_preference = Column(String)
    quantity = Column(Integer, default=1)
    usage = Column(String)
    deadline = Column(String)
    customer_note = Column(Text)
    privacy_agreed = Column(Boolean, default=False)
    status = Column(String, default="新詢價")
    final_quote_price = Column(Float, nullable=True)
    budget = Column(String, nullable=True)
    session_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = relationship("InquiryNote", back_populates="inquiry", cascade="all, delete-orphan")
    status_history = relationship("InquiryStatusHistory", back_populates="inquiry", cascade="all, delete-orphan")
    files = relationship("InquiryFile", back_populates="inquiry", cascade="all, delete-orphan")


class InquiryNote(Base):
    __tablename__ = "inquiry_notes"
    id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    inquiry = relationship("Inquiry", back_populates="notes")
    author = relationship("User", back_populates="notes")


class InquiryStatusHistory(Base):
    __tablename__ = "inquiry_status_history"
    id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.id"), nullable=False)
    from_status = Column(String)
    to_status = Column(String, nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    changed_at = Column(DateTime, default=datetime.utcnow)
    inquiry = relationship("Inquiry", back_populates="status_history")


class VisitorSession(Base):
    __tablename__ = "visitor_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, nullable=False, index=True)
    user_agent = Column(Text)
    referrer = Column(Text)
    started_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    inquiry_id = Column(Integer, ForeignKey("inquiries.id"), nullable=True)
    events = relationship("UserEvent", back_populates="session")


class UserEvent(Base):
    __tablename__ = "user_events"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("visitor_sessions.session_id"), nullable=False, index=True)
    event_type = Column(String, nullable=False)
    page = Column(String)
    element = Column(String, nullable=True)
    referrer = Column(String, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    session = relationship("VisitorSession", back_populates="events")


class InquiryFile(Base):
    """第二階段：模型檔案"""
    __tablename__ = "inquiry_files"
    id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.id"), nullable=False)
    original_filename = Column(String)
    stored_filename = Column(String)
    file_path = Column(String)
    file_size = Column(Integer)
    file_type = Column(String)
    bbox_x = Column(Float)
    bbox_y = Column(Float)
    bbox_z = Column(Float)
    is_over_build_volume = Column(Boolean, default=False)
    has_mesh_errors = Column(Boolean, default=False)
    repair_attempted = Column(Boolean, default=False)
    repair_success = Column(Boolean, default=False)
    analysis_warnings = Column(Text)
    sla_result = Column(Text)
    slicing_result = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    inquiry = relationship("Inquiry", back_populates="files")


class FutureOrder(Base):
    """第二階段：訂單 placeholder"""
    __tablename__ = "future_orders"
    id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.id"), nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)


# ── Mini CMS ──────────────────────────────────────────────────────────────────
CMS_STATUSES = ["draft", "published", "archived"]
CMS_PROCESS_TYPES = ["FDM", "SLA", "Other"]


class SiteSettings(Base):
    """全站設定與主題配色（第一階段單筆 id=1）"""
    __tablename__ = "site_settings"
    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String, default="職人自造")
    tagline = Column(String, default="")
    logo_url = Column(String, nullable=True)
    primary_color = Column(String, default="#f97316")
    secondary_color = Column(String, default="#3f3f46")
    background_color = Column(String, default="#09090b")
    surface_color = Column(String, default="#18181b")
    text_color = Column(String, default="#fafafa")
    accent_color = Column(String, default="#f97316")
    border_color = Column(String, default="#27272a")
    hero_title = Column(String, default="")
    hero_subtitle = Column(Text, default="")
    hero_cta_text = Column(String, default="")
    hero_cta_link = Column(String, default="")
    hero_image_url = Column(String, nullable=True)
    contact_email = Column(String, default="")
    contact_phone = Column(String, default="")
    contact_line = Column(String, default="")
    contact_instagram = Column(String, default="")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)


class NewsPost(Base):
    """最新消息 / 公告"""
    __tablename__ = "news_posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, default="")
    summary = Column(Text, default="")
    content = Column(Text, default="")
    cover_image_url = Column(String, nullable=True)
    status = Column(String, default="draft")
    is_pinned = Column(Boolean, default=False)
    published_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)


class GalleryItem(Base):
    """作品展示"""
    __tablename__ = "gallery_items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    process_type = Column(String, default="Other")  # FDM / SLA / Other
    category = Column(String, default="")
    material = Column(String, default="")
    summary = Column(Text, default="")
    description = Column(Text, default="")
    image_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    status = Column(String, default="draft")
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)


class FaqItem(Base):
    """常見問題"""
    __tablename__ = "faq_items"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    answer = Column(Text, default="")
    category = Column(String, default="")
    status = Column(String, default="draft")
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)


class MaterialItem(Base):
    """材料介紹"""
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    process_type = Column(String, default="Other")  # FDM / SLA / Other
    category = Column(String, default="")
    properties = Column(Text, default="")
    suitable_for = Column(Text, default="")
    description = Column(Text, default="")
    image_url = Column(String, nullable=True)
    status = Column(String, default="draft")
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
