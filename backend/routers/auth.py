from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User
from auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class CreateUserRequest(BaseModel):
    email: str
    password: str
    name: str = ""
    role: str = "viewer"


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email, User.is_active == True).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(400, "帳號或密碼錯誤")
    user.last_login = datetime.utcnow()
    db.commit()
    token = create_token(user.id, user.email, user.role)
    return {"access_token": token, "token_type": "bearer", "role": user.role, "name": user.name}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role}


@router.post("/logout")
def logout():
    return {"message": "已登出"}
