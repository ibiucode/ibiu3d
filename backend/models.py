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
