import trimesh
from config import SLA_PRICE_PER_CM3, SLA_WALL_THRESHOLD_MM, SLA_SHELL_THICKNESS_MM
from services.mesh import analyze_wall_thickness, hollow_mesh


def quote(mesh: trimesh.Trimesh) -> dict:
    max_thickness_mm = analyze_wall_thickness(mesh)
    hollowed = False

    if max_thickness_mm > SLA_WALL_THRESHOLD_MM:
        mesh = hollow_mesh(mesh, SLA_SHELL_THICKNESS_MM)
        hollowed = True

    volume_mm3 = abs(mesh.volume)
    volume_cm3 = volume_mm3 / 1000.0
    price = round(volume_cm3 * SLA_PRICE_PER_CM3, 1)

    return {
        "volume_cm3": round(volume_cm3, 3),
        "max_wall_thickness_mm": round(max_thickness_mm, 2),
        "hollowed": hollowed,
        "price_twd": price,
        "unit": "元",
    }
