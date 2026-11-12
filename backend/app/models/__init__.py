from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(191), unique=True, index=True, nullable=False)
    full_name = Column(String(191), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Collection Staff", nullable=False)  # Administrator, Manager, Collection Staff
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class RecyclingFacility(Base):
    __tablename__ = "recycling_facilities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(191), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_person = Column(String(100), nullable=True)
    phone_number = Column(String(50), nullable=True)
    capacity_daily_kg = Column(Float, default=10000.0)
    operating_hours = Column(String(100), default="08:00 AM - 06:00 PM")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    start_routes = relationship("Route", foreign_keys="Route.start_facility_id", back_populates="start_facility")
    dest_routes = relationship("Route", foreign_keys="Route.destination_facility_id", back_populates="destination_facility")

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    license_number = Column(String(100), unique=True, index=True, nullable=False)
    phone_number = Column(String(50), nullable=False)
    status = Column(String(50), default="Active")  # Active, On Leave, Busy
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    vehicles = relationship("Vehicle", back_populates="driver")
    routes = relationship("Route", back_populates="driver")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_number = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_type = Column(String(50), nullable=False)  # Light Van, Medium Truck, Heavy Compactor, Electric Van
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    capacity_kg = Column(Float, nullable=False, default=1500.0)
    fuel_type = Column(String(50), default="Diesel", nullable=False)  # Diesel, Petrol, Electric, CNG
    fuel_efficiency_km_l = Column(Float, default=10.0, nullable=False)
    current_location = Column(String(191), default="Central Facility Depot")
    availability = Column(String(50), default="Available", nullable=False)  # Available, On Route, Maintenance
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    driver = relationship("Driver", back_populates="vehicles")
    routes = relationship("Route", back_populates="vehicle")

class MaterialCategory(Base):
    __tablename__ = "material_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    unit_price_per_kg = Column(Float, default=0.50)
    current_stock_kg = Column(Float, default=0.0)
    carbon_offset_per_kg = Column(Float, default=1.2)  # kg CO2 saved per kg recycled
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CollectionPoint(Base):
    __tablename__ = "collection_points"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(191), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_person = Column(String(100), nullable=False)
    phone_number = Column(String(50), nullable=False)
    material_category = Column(String(100), nullable=False)
    estimated_weight_kg = Column(Float, default=50.0, nullable=False)
    priority = Column(String(50), default="Medium", nullable=False)  # High, Medium, Low
    collection_status = Column(String(50), default="Pending", nullable=False)  # Pending, Scheduled, Collected, Inactive
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    route_stops = relationship("RouteStop", back_populates="collection_point", cascade="all, delete-orphan")
    collections = relationship("CollectionLog", back_populates="collection_point")

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    route_code = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    start_facility_id = Column(Integer, ForeignKey("recycling_facilities.id"), nullable=False)
    destination_facility_id = Column(Integer, ForeignKey("recycling_facilities.id"), nullable=False)
    optimization_algorithm = Column(String(50), default="Dijkstra-TSP", nullable=False)  # Dijkstra-TSP, A*-TSP, Nearest-Neighbor-2Opt
    total_distance_km = Column(Float, default=0.0, nullable=False)
    original_distance_km = Column(Float, default=0.0, nullable=False)
    distance_saved_km = Column(Float, default=0.0, nullable=False)
    estimated_time_minutes = Column(Float, default=0.0, nullable=False)
    fuel_consumption_litres = Column(Float, default=0.0, nullable=False)
    estimated_fuel_cost = Column(Float, default=0.0, nullable=False)
    total_load_kg = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="Planned", nullable=False)  # Planned, Assigned, In Progress, Paused, Completed, Cancelled
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    vehicle = relationship("Vehicle", back_populates="routes")
    driver = relationship("Driver", back_populates="routes")
    start_facility = relationship("RecyclingFacility", foreign_keys=[start_facility_id], back_populates="start_routes")
    destination_facility = relationship("RecyclingFacility", foreign_keys=[destination_facility_id], back_populates="dest_routes")
    stops = relationship("RouteStop", back_populates="route", cascade="all, delete-orphan", order_by="RouteStop.stop_order")
    collections = relationship("CollectionLog", back_populates="route")

class RouteStop(Base):
    __tablename__ = "route_stops"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    collection_point_id = Column(Integer, ForeignKey("collection_points.id"), nullable=False)
    stop_order = Column(Integer, nullable=False)
    planned_arrival_time = Column(String(50), nullable=True)
    status = Column(String(50), default="Pending", nullable=False)  # Pending, Arrived, Collected, Skipped
    weight_collected_kg = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    route = relationship("Route", back_populates="stops")
    collection_point = relationship("CollectionPoint", back_populates="route_stops")

class CollectionLog(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    collection_point_id = Column(Integer, ForeignKey("collection_points.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    material_category = Column(String(100), nullable=False)
    weight_kg = Column(Float, nullable=False)
    collected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(Text, nullable=True)

    collection_point = relationship("CollectionPoint", back_populates="collections")
    route = relationship("Route", back_populates="collections")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(191), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="system")  # route, capacity, collection, vehicle, optimization, system
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

