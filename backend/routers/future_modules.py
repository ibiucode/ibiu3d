"""
未來功能模組 placeholder — 第二階段實作
"""
from fastapi import APIRouter, Depends
from auth import get_current_user
from models import User

router = APIRouter()

MODULES = {
    "pricing": {"name": "自動估價系統", "status": "coming_soon", "phase": 2},
    "render": {"name": "模型渲染引擎", "status": "coming_soon", "phase": 2},
    "file_checker": {"name": "檔案格式檢查", "status": "coming_soon", "phase": 2},
    "slicer": {"name": "FDM 切片整合", "status": "coming_soon", "phase": 2},
    "model_analyzer": {"name": "STL/OBJ 分析", "status": "coming_soon", "phase": 2},
}


@router.get("/modules")
def list_modules(user: User = Depends(get_current_user)):
    return {"modules": MODULES, "note": "Phase 2 功能，尚未開放"}


@router.get("/modules/{module_name}/status")
def module_status(module_name: str, user: User = Depends(get_current_user)):
    if module_name not in MODULES:
        return {"error": "模組不存在"}
    return {**MODULES[module_name], "available": False}
