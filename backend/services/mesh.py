import os
import tempfile
from typing import Tuple, List, Dict
import trimesh
import numpy as np
from fastapi import HTTPException
from config import PRINTER_MAX_X, PRINTER_MAX_Y, PRINTER_MAX_Z


def load_and_repair(path: str, ext: str) -> Tuple[trimesh.Trimesh, List[str]]:
    """載入模型，若有破面則嘗試修復。回傳 (mesh, warnings)。"""
    warnings = []

    if ext in (".step", ".stp"):
        path = _convert_step_to_stl(path)
        warnings.append("STEP 格式已自動轉換為 STL")

    try:
        loaded = trimesh.load(path, force="mesh")
    except Exception as e:
        raise HTTPException(422, f"無法讀取模型：{e}")

    if isinstance(loaded, trimesh.Scene):
        meshes = list(loaded.geometry.values())
        if not meshes:
            raise HTTPException(422, "模型不含任何幾何體")
        mesh = trimesh.util.concatenate(meshes)
    else:
        mesh = loaded

    if len(mesh.vertices) == 0:
        raise HTTPException(422, "模型為空，無法估價")

    if not mesh.is_watertight:
        mesh, repaired = _repair(mesh)
        if repaired:
            warnings.append("MESH_REPAIRED")  # 前端用來判斷是否跳彈窗
        else:
            raise HTTPException(422, "模型有破面且無法自動修復，請重新檢查檔案")

    return mesh, warnings


def get_dimensions(mesh: trimesh.Trimesh) -> Dict[str, float]:
    """取得模型邊界尺寸（mm），並檢查是否超出列印範圍。"""
    bounds = mesh.bounding_box.extents  # [x, y, z]
    dims = {
        "x": round(float(bounds[0]), 2),
        "y": round(float(bounds[1]), 2),
        "z": round(float(bounds[2]), 2),
    }
    return dims


def check_print_volume(dims: Dict[str, float]) -> List[str]:
    """檢查尺寸是否超出列印範圍，回傳錯誤訊息列表。"""
    errors = []
    limits = {"x": PRINTER_MAX_X, "y": PRINTER_MAX_Y, "z": PRINTER_MAX_Z}
    axis_label = {"x": "X", "y": "Y", "z": "Z"}
    for axis, limit in limits.items():
        if dims[axis] > limit:
            errors.append(
                f"模型 {axis_label[axis]} 軸尺寸 {dims[axis]} mm 超出列印範圍 {limit} mm"
            )
    return errors


def _repair(mesh: trimesh.Trimesh) -> Tuple[trimesh.Trimesh, bool]:
    try:
        import pymeshfix
        tin = pymeshfix.MeshFix(mesh.vertices, mesh.faces)
        tin.repair(verbose=False)
        repaired = trimesh.Trimesh(vertices=tin.v, faces=tin.f, process=True)
        return repaired, repaired.is_watertight
    except ImportError:
        trimesh.repair.fix_normals(mesh)
        trimesh.repair.fill_holes(mesh)
        return mesh, mesh.is_watertight


def _convert_step_to_stl(step_path: str) -> str:
    try:
        import cadquery as cq
        result = cq.importers.importStep(step_path)
        out = tempfile.mktemp(suffix=".stl")
        cq.exporters.export(result, out)
        return out
    except ImportError:
        raise HTTPException(501, "STEP 格式需要安裝 cadquery。請先安裝：pip install cadquery")
    except Exception as e:
        raise HTTPException(422, f"STEP 轉換失敗：{e}")


def analyze_wall_thickness(mesh: trimesh.Trimesh, sample_count: int = 2000) -> float:
    """用 ray casting 估算模型最大壁厚（mm）。"""
    points, face_idx = trimesh.sample.sample_surface(mesh, sample_count)
    normals = mesh.face_normals[face_idx]

    origins = points - normals * 1e-4
    directions = -normals

    locations, index_ray, _ = mesh.ray.intersects_location(
        ray_origins=origins,
        ray_directions=directions,
        multiple_hits=False,
    )

    if len(locations) == 0:
        return 0.0

    hit_origins = origins[index_ray]
    thicknesses = np.linalg.norm(locations - hit_origins, axis=1)
    return float(np.max(thicknesses))


def hollow_mesh(mesh: trimesh.Trimesh, shell_mm: float) -> trimesh.Trimesh:
    """抽殼：將模型縮小 shell_mm，回傳空心後的外殼 mesh。"""
    try:
        inner = mesh.copy()
        inner.vertices -= inner.vertex_normals * shell_mm
        inner.invert()
        hollowed = trimesh.util.concatenate([mesh, inner])
        return hollowed
    except Exception:
        return mesh
