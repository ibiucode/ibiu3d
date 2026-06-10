import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from services import mesh as mesh_svc
from config import MAX_FILE_SIZE

router = APIRouter()

ALLOWED_EXTENSIONS = {".stl", ".obj", ".step", ".stp"}


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"不支援的格式：{ext}，請上傳 STL、OBJ 或 STEP 檔案")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(413, "檔案超過 1GB 上限")
    if len(data) == 0:
        raise HTTPException(400, "檔案是空的")

    tmp = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
    tmp.write(data)
    tmp.close()

    try:
        mesh, warnings = mesh_svc.load_and_repair(tmp.path if hasattr(tmp, 'path') else tmp.name, ext)
        dims = mesh_svc.get_dimensions(mesh)
        volume_errors = mesh_svc.check_print_volume(dims)
    finally:
        os.unlink(tmp.name)

    has_mesh_errors = "MESH_REPAIRED" in warnings
    repair_attempted = has_mesh_errors

    return {
        "filename": file.filename,
        "dimensions": dims,
        "warnings": warnings,
        "volume_errors": volume_errors,
        "has_mesh_errors": has_mesh_errors,
        "repair_attempted": repair_attempted,
        "can_proceed": True,
    }
