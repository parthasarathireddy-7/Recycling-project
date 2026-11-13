from fastapi import APIRouter, HTTPException, Query, Depends
import os
import sys
import platform
import time
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.database.session import get_db, engine
from app.models import Vehicle, CollectionPoint, Route, MaterialCategory, RecyclingFacility

router = APIRouter(prefix="/code", tags=["Backend Code Workspace"])

SERVER_START_TIME = time.time()

BASE_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

ALLOWED_FILES = {
    "algorithms/dijkstra.py": "Dijkstra Shortest Path Algorithm Solver",
    "algorithms/astar.py": "A* Search Shortest Path Heuristic Solver",
    "algorithms/route_optimizer.py": "Route Optimization Engine & 2-Opt TSP",
    "algorithms/fuel_calculator.py": "Fuel, Cost & Emission Engine",
    "algorithms/graph.py": "Network Graph & Node Data Structure",
    "algorithms/geo_distance.py": "Haversine & OSRM Geodesic Matrix",
    "services/oop_domain.py": "Object-Oriented Domain Entities (OOP)",
    "models/__init__.py": "SQLAlchemy Relational Database Schema Models",
    "routes/routes.py": "Route Optimization & Dispatch REST APIs",
    "routes/dashboard.py": "Live Database Analytics & Aggregations",
    "database/session.py": "Database Connection & Resilience Manager",
    "database/init_db.py": "Seed Data & Network Initialization",
    "core/security.py": "BCrypt & JWT Authentication Core",
    "main.py": "FastAPI Application Factory & Middleware"
}

@router.get("/backend-files")
def list_backend_source_files():
    files = []
    for rel_path, desc in ALLOWED_FILES.items():
        full_path = os.path.join(BASE_BACKEND_DIR, rel_path)
        size = os.path.getsize(full_path) if os.path.exists(full_path) else 0
        files.append({
            "path": rel_path,
            "filename": os.path.basename(rel_path),
            "description": desc,
            "size_bytes": size
        })
    return files

@router.get("/backend-file")
def get_backend_source_content(path: str = Query(...)):
    if path not in ALLOWED_FILES:
        raise HTTPException(status_code=403, detail="Access denied or file not allowed")
    
    full_path = os.path.join(BASE_BACKEND_DIR, path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    return {
        "path": path,
        "filename": os.path.basename(path),
        "description": ALLOWED_FILES[path],
        "content": content
    }

@router.get("/system-info")
def get_system_runtime_info(db: Session = Depends(get_db)):
    db_name = engine.dialect.name
    try:
        vehicles_count = db.query(Vehicle).count()
        points_count = db.query(CollectionPoint).count()
        routes_count = db.query(Route).count()
        materials_count = db.query(MaterialCategory).count()
        facilities_count = db.query(RecyclingFacility).count()
    except Exception as e:
        vehicles_count = points_count = routes_count = materials_count = facilities_count = 0

    uptime_seconds = int(time.time() - SERVER_START_TIME)

    return {
        "status": "Online",
        "database_engine": db_name.upper(),
        "database_url": str(engine.url).split("@")[-1] if "@" in str(engine.url) else str(engine.url),
        "python_version": platform.python_version(),
        "platform": f"{platform.system()} {platform.release()}",
        "uptime_seconds": uptime_seconds,
        "counts": {
            "vehicles": vehicles_count,
            "collection_points": points_count,
            "routes": routes_count,
            "material_categories": materials_count,
            "facilities": facilities_count
        },
        "supported_algorithms": [
            {"name": "Dijkstra's Algorithm", "complexity": "O((V + E) log V)", "type": "Exact Shortest Path"},
            {"name": "A* Search Algorithm", "complexity": "O(E)", "type": "Heuristic (Admissible Haversine)"},
            {"name": "2-Opt TSP Heuristic", "complexity": "O(N²)", "type": "Combinatorial Tour Optimization"}
        ]
    }

