import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Recycling Center Route Optimizer"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "recycling-optimizer-super-secret-key-2026-secure-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database URL: Primary MySQL, fallback SQLite
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: str = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DB: str = os.getenv("MYSQL_DB", "recycling_db")
    
    # Custom DB URL or automatic
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    )
    SQLITE_FALLBACK_URL: str = "sqlite:///./recycling.db"
    
    # Fuel and pricing defaults (Indian Rupees - INR / ₹)
    DEFAULT_FUEL_PRICE_PER_LITRE: float = float(os.getenv("DEFAULT_FUEL_PRICE_PER_LITRE", "96.50"))
    DEFAULT_AVERAGE_SPEED_KMH: float = 40.0
    
    # OSRM routing service (OpenStreetMap Routing Machine)
    OSRM_BASE_URL: str = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")

settings = Settings()
