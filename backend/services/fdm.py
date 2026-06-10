import json
import os
import re
import shutil
import subprocess
import tempfile
from typing import Optional
from fastapi import HTTPException
from config import FDM_PRICE_PER_GRAM

BAMBU_STUDIO = "/Applications/BambuStudio.app/Contents/MacOS/BambuStudio"

SYSTEM_DIR = os.path.expanduser(
    "~/Library/Application Support/BambuStudio/system/BBL"
)
USER_DIR = os.path.expanduser(
    "~/Library/Application Support/BambuStudio/user/default"
)

MACHINE_JSON  = os.path.join(SYSTEM_DIR, "machine",  "Bambu Lab H2S 0.4 nozzle.json")
FILAMENT_JSON = os.path.join(USER_DIR,   "filament", "H2S - Copy.json")
PROCESS_JSON  = os.path.join(USER_DIR,   "process",  "H2S - Copy.json")

# preset 搜尋目錄（順序：用戶優先）
_PRESET_DIRS = {
    "filament": [
        os.path.join(USER_DIR, "filament"),
        os.path.join(SYSTEM_DIR, "filament"),
    ],
    "process": [
        os.path.join(USER_DIR, "process"),
        os.path.join(SYSTEM_DIR, "process"),
    ],
    "machine": [
        os.path.join(USER_DIR, "machine"),
        os.path.join(SYSTEM_DIR, "machine"),
    ],
}


def _find_preset(name: str, category: str) -> Optional[dict]:
    """在系統和用戶目錄中依名稱找 preset JSON。"""
    for d in _PRESET_DIRS.get(category, []):
        if not os.path.isdir(d):
            continue
        for fn in os.listdir(d):
            if not fn.endswith(".json"):
                continue
            path = os.path.join(d, fn)
            try:
                data = json.load(open(path, encoding="utf-8"))
            except Exception:
                continue
            if data.get("name") == name or fn[:-5] == name:
                return data
    return None


def _resolve_preset(name: str, category: str, visited: set = None) -> dict:
    """遞迴解析繼承鏈，回傳完整合併後的 preset dict。"""
    if visited is None:
        visited = set()
    if name in visited:
        return {}
    visited.add(name)

    data = _find_preset(name, category)
    if data is None:
        return {}

    parent_name = data.get("inherits")
    if parent_name:
        parent = _resolve_preset(parent_name, category, visited)
        merged = {**parent, **data}  # 子 preset 覆蓋父 preset
    else:
        merged = dict(data)

    return merged


def _write_resolved(resolved: dict, type_value: str, extra: dict, tmp_dir: str, prefix: str) -> str:
    """把解析後的 preset 寫成暫存 JSON。"""
    out = {**resolved, "type": type_value}
    if extra:
        out.update(extra)
    dst = os.path.join(tmp_dir, f"{prefix}.json")
    json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False)
    return dst


def quote(model_path: str, ext: str) -> dict:
    """單一檔案估價（向下相容）。"""
    return quote_multi([(model_path, ext)])


def quote_multi(model_paths: list) -> dict:
    """多零件合併切片估價。model_paths = [(path, ext), ...]"""
    if not os.path.isfile(BAMBU_STUDIO):
        raise HTTPException(501, "找不到 Bambu Studio，請確認已安裝。")

    # 用 trimesh 把所有模型排開合併成單一 STL
    merged_stl = _merge_models(model_paths)
    converted = [merged_stl]

    tmp_dir = tempfile.mkdtemp()
    out_dir = tempfile.mkdtemp()

    try:
        filament_resolved = _resolve_preset("H2S - Copy", "filament")
        process_resolved  = _resolve_preset("H2S - Copy", "process")

        filament_tmp = _write_resolved(
            filament_resolved, "filament", {}, tmp_dir, "filament"
        )
        process_tmp = _write_resolved(
            process_resolved, "process",
            {"compatible_printers": ["Bambu Lab H2S 0.4 nozzle"]},
            tmp_dir, "process"
        )

        cmd = [
            BAMBU_STUDIO,
            "--slice", "0",
            "--load-settings", f"{MACHINE_JSON};{process_tmp}",
            "--load-filaments", filament_tmp,
            "--outputdir", out_dir,
            merged_stl,
        ]

        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        except subprocess.TimeoutExpired:
            raise HTTPException(504, "切片超時（超過 180 秒）")
        except Exception as e:
            raise HTTPException(500, f"切片失敗：{e}")

        if proc.returncode != 0:
            raise HTTPException(500, f"切片失敗（code {proc.returncode}）：{proc.stderr[-300:]}")

        gcode_file = _find_output(out_dir)
        if not gcode_file:
            raise HTTPException(500, "切片未產生輸出檔案")

        weight_g = _parse_filament_weight(gcode_file)
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        shutil.rmtree(out_dir, ignore_errors=True)
        for c in converted:
            try:
                os.unlink(c)
            except OSError:
                pass

    price = round(weight_g * FDM_PRICE_PER_GRAM, 1)
    return {
        "filament_weight_g": round(weight_g, 2),
        "total_price_twd": price,
        "unit": "元",
    }


def _find_output(directory: str) -> Optional[str]:
    for fname in os.listdir(directory):
        if fname.endswith((".gcode", ".gcode.3mf", ".3mf")):
            return os.path.join(directory, fname)
    return None


def _parse_filament_weight(path: str) -> float:
    patterns = [
        re.compile(r";\s*total filament weight\s*\[g\]\s*:\s*([\d.]+)", re.IGNORECASE),
        re.compile(r";\s*filament used\s*\[g\]\s*=\s*([\d.]+)", re.IGNORECASE),
        re.compile(r";\s*total filament weight\s*=\s*([\d.]+)\s*g", re.IGNORECASE),
    ]

    if path.endswith(".3mf"):
        return _parse_3mf_weight(path)

    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                for pat in patterns:
                    m = pat.search(line)
                    if m:
                        val = float(m.group(1))
                        if val > 0:
                            return val
    except OSError:
        pass
    raise HTTPException(500, "無法從切片結果讀取材料用量")


def _parse_3mf_weight(path: str) -> float:
    import zipfile
    patterns = [
        re.compile(r";\s*total filament weight\s*\[g\]\s*:\s*([\d.]+)", re.IGNORECASE),
        re.compile(r";\s*filament used\s*\[g\]\s*=\s*([\d.]+)", re.IGNORECASE),
    ]
    try:
        with zipfile.ZipFile(path) as z:
            for name in z.namelist():
                if name.endswith(".gcode"):
                    with z.open(name) as f:
                        for raw in f:
                            line = raw.decode("utf-8", errors="ignore")
                            for pat in patterns:
                                m = pat.search(line)
                                if m:
                                    val = float(m.group(1))
                                    if val > 0:
                                        return val
    except Exception:
        pass
    raise HTTPException(500, "無法從 3mf 切片結果讀取材料用量")


def _merge_models(model_paths: list) -> str:
    """載入所有模型，沿 X 軸排開後合併成單一暫存 STL。"""
    import trimesh
    import numpy as np

    meshes = []
    offset_x = 0.0

    for model_path, ext in model_paths:
        try:
            if ext in (".step", ".stp"):
                stl = _export_stl(model_path)
                loaded = trimesh.load(stl, force="mesh")
                try:
                    os.unlink(stl)
                except OSError:
                    pass
            else:
                loaded = trimesh.load(model_path, force="mesh")

            if isinstance(loaded, trimesh.Scene):
                parts = list(loaded.geometry.values())
                mesh = trimesh.util.concatenate(parts) if parts else None
            else:
                mesh = loaded

            if mesh is None or len(mesh.vertices) == 0:
                continue

            mesh.apply_translation(-mesh.bounding_box.centroid)  # 置中
            w = mesh.bounding_box.extents[0]
            mesh.apply_translation([offset_x + w / 2, 0, 0])
            offset_x += w + 10  # 10mm 間距

            meshes.append(mesh)
        except Exception:
            continue

    if not meshes:
        raise HTTPException(422, "無法載入任何模型")

    combined = trimesh.util.concatenate(meshes)
    out = tempfile.mktemp(suffix=".stl")
    combined.export(out)
    return out


def _export_stl(path: str) -> str:
    import trimesh
    mesh = trimesh.load(path, force="mesh")
    out = tempfile.mktemp(suffix=".stl")
    mesh.export(out)
    return out
