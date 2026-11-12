from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.database.init_db import init_db
from app.routes import (
    auth, collection_points, vehicles, materials, facilities,
    routes, fuel, dashboard, reports, notifications, code_explorer
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("recycling_optimizer")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database and seeding baseline dataset...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    yield
    logger.info("Shutting down Recycling Center Route Optimizer service...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise API for Recycling Fleet Routing, Dijkstra & A* Optimization, and Carbon Tracking.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(collection_points.router, prefix=settings.API_V1_STR)
app.include_router(vehicles.router, prefix=settings.API_V1_STR)
app.include_router(materials.router, prefix=settings.API_V1_STR)
app.include_router(facilities.router, prefix=settings.API_V1_STR)
app.include_router(routes.router, prefix=settings.API_V1_STR)
app.include_router(fuel.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(code_explorer.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
        "endpoints": [
            f"{settings.API_V1_STR}/dashboard/stats",
            f"{settings.API_V1_STR}/collection-points",
            f"{settings.API_V1_STR}/vehicles",
            f"{settings.API_V1_STR}/materials",
            f"{settings.API_V1_STR}/routes",
            f"{settings.API_V1_STR}/facilities",
            f"{settings.API_V1_STR}/fuel/calculate",
            f"{settings.API_V1_STR}/reports/summary",
            f"{settings.API_V1_STR}/notifications"
        ]
    }

@app.get("/api/v1")
@app.get("/api/v1/")
def api_v1_root():
    return {
        "message": "Welcome to Recycling Center Route Optimizer API v1",
        "documentation": "/docs",
        "status": "active"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "recycling-route-optimizer"}
