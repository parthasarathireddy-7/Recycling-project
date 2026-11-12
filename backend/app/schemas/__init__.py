from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

# --- Auth & User ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_name: str
    user_email: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "Collection Staff"  # Administrator, Manager, Collection Staff

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Recycling Facility ---
class FacilityBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    contact_person: Optional[str] = None
    phone_number: Optional[str] = None
    capacity_daily_kg: float = 10000.0
    operating_hours: str = "08:00 AM - 06:00 PM"

class FacilityCreate(FacilityBase):
    pass

class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_person: Optional[str] = None
    phone_number: Optional[str] = None
    capacity_daily_kg: Optional[float] = None
    operating_hours: Optional[str] = None

class FacilityResponse(FacilityBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Driver ---
class DriverBase(BaseModel):
    name: str
    license_number: str
    phone_number: str
    status: str = "Active"

class DriverCreate(DriverBase):
    pass

class DriverResponse(DriverBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Vehicle ---
class VehicleBase(BaseModel):
    vehicle_number: str
    vehicle_type: str
    driver_id: Optional[int] = None
    capacity_kg: float = 1500.0
    fuel_type: str = "Diesel"
    fuel_efficiency_km_l: float = 10.0
    current_location: str = "Central Facility Depot"
    availability: str = "Available"

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    driver_id: Optional[int] = None
    capacity_kg: Optional[float] = None
    fuel_type: Optional[str] = None
    fuel_efficiency_km_l: Optional[float] = None
    current_location: Optional[str] = None
    availability: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: int
    created_at: Optional[datetime] = None
    driver: Optional[DriverResponse] = None

    class Config:
        from_attributes = True

# --- Material Category ---
class MaterialCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    unit_price_per_kg: float = 0.50
    current_stock_kg: float = 0.0
    carbon_offset_per_kg: float = 1.2

class MaterialCategoryCreate(MaterialCategoryBase):
    pass

class MaterialCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit_price_per_kg: Optional[float] = None
    current_stock_kg: Optional[float] = None
    carbon_offset_per_kg: Optional[float] = None

class MaterialCategoryResponse(MaterialCategoryBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Collection Point ---
class CollectionPointBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    contact_person: str
    phone_number: str
    material_category: str
    estimated_weight_kg: float = 50.0
    priority: str = "Medium"  # High, Medium, Low
    collection_status: str = "Pending"  # Pending, Scheduled, Collected, Inactive

class CollectionPointCreate(CollectionPointBase):
    pass

class CollectionPointUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_person: Optional[str] = None
    phone_number: Optional[str] = None
    material_category: Optional[str] = None
    estimated_weight_kg: Optional[float] = None
    priority: Optional[str] = None
    collection_status: Optional[str] = None

class CollectionPointResponse(CollectionPointBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Route Optimization ---
class OptimizeRouteRequest(BaseModel):
    start_facility_id: int
    destination_facility_id: int
    collection_point_ids: List[int]
    vehicle_id: int
    algorithm: str = "Dijkstra-TSP"  # Dijkstra-TSP, A*-TSP, Nearest-Neighbor-2Opt
    fuel_price_per_litre: Optional[float] = None
    max_vehicle_capacity: Optional[float] = None

class RouteStopResponse(BaseModel):
    id: int
    stop_order: int
    collection_point_id: int
    planned_arrival_time: Optional[str] = None
    status: str
    weight_collected_kg: float
    notes: Optional[str] = None
    collection_point: Optional[CollectionPointResponse] = None

    class Config:
        from_attributes = True

class RouteCreateRequest(BaseModel):
    route_code: Optional[str] = None
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    start_facility_id: int
    destination_facility_id: int
    optimization_algorithm: str = "Dijkstra-TSP"
    total_distance_km: float
    original_distance_km: float
    distance_saved_km: float
    estimated_time_minutes: float
    fuel_consumption_litres: float
    estimated_fuel_cost: float
    total_load_kg: float
    status: str = "Planned"
    stop_ids: List[int]

class RouteStatusUpdate(BaseModel):
    status: str  # Planned, Assigned, In Progress, Paused, Completed, Cancelled

class RouteResponse(BaseModel):
    id: int
    route_code: str
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    start_facility_id: int
    destination_facility_id: int
    optimization_algorithm: str
    total_distance_km: float
    original_distance_km: float
    distance_saved_km: float
    estimated_time_minutes: float
    fuel_consumption_litres: float
    estimated_fuel_cost: float
    total_load_kg: float
    status: str
    created_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    vehicle: Optional[VehicleResponse] = None
    driver: Optional[DriverResponse] = None
    start_facility: Optional[FacilityResponse] = None
    destination_facility: Optional[FacilityResponse] = None
    stops: List[RouteStopResponse] = []

    class Config:
        from_attributes = True

# --- Notification ---
class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "system"

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Fuel Calculation Request ---
class FuelCalcRequest(BaseModel):
    distance_km: float
    fuel_efficiency_km_l: float
    fuel_price_per_litre: float
    fuel_type: str = "Diesel"

