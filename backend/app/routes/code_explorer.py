from fastapi import APIRouter, HTTPException, Query
import os
from typing import List, Dict, Any

router = APIRouter(prefix="/code", tags=["Backend Code Workspace"])

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

