from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import math

class Entity(ABC):
    """Abstract Base Entity with identity and timestamp attributes."""
    def __init__(self, entity_id: int):
        self._id = entity_id
        self._created_at = datetime.now(timezone.utc)

    @property
    def id(self) -> int:
        return self._id

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        """Serialize entity to dictionary representation."""
        pass

class RecyclingFacility(Entity):
    """Represents a central recycling depot or destination hub."""
    def __init__(self, facility_id: int, name: str, address: str, latitude: float, longitude: float, capacity_daily_kg: float = 10000.0):
        super().__init__(facility_id)
        self._name = name
        self._address = address
        self._latitude = latitude
        self._longitude = longitude
        self._capacity_daily_kg = capacity_daily_kg

    @property
    def name(self) -> str:
        return self._name

    @property
    def coordinates(self) -> tuple[float, float]:
        return (self._latitude, self._longitude)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self._id,
            "name": self._name,
            "address": self._address,
            "latitude": self._latitude,
            "longitude": self._longitude,
            "capacity_daily_kg": self._capacity_daily_kg
        }

class RecyclableMaterial(Entity):
    """Represents recyclable material classifications."""
    def __init__(self, material_id: int, name: str, unit_price_per_kg: float = 0.50, carbon_offset_per_kg: float = 1.2):
        super().__init__(material_id)
        self._name = name
        self._unit_price_per_kg = unit_price_per_kg
        self._carbon_offset_per_kg = carbon_offset_per_kg
        self._stock_kg = 0.0

    def add_stock(self, weight_kg: float) -> None:
        if weight_kg < 0:
            raise ValueError("Cannot add negative stock.")
        self._stock_kg += weight_kg

    def calculate_valuation(self) -> float:
        return self._stock_kg * self._unit_price_per_kg

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self._id,
            "name": self._name,
            "unit_price_per_kg": self._unit_price_per_kg,
            "carbon_offset_per_kg": self._carbon_offset_per_kg,
            "stock_kg": self._stock_kg
        }

class CollectionPoint(Entity):
    """Represents a designated site where recyclables are accumulated."""
    VALID_STATUSES = {"Pending", "Scheduled", "Collected", "Inactive"}
    VALID_PRIORITIES = {"High", "Medium", "Low"}

    def __init__(
        self,
        point_id: int,
        name: str,
        address: str,
        latitude: float,
        longitude: float,
        material_category: str,
        estimated_weight_kg: float,
        priority: str = "Medium",
        status: str = "Pending"
    ):
        super().__init__(point_id)
        self._name = name
        self._address = address
        self._latitude = latitude
        self._longitude = longitude
        self._material_category = material_category
        self._estimated_weight_kg = max(0.0, float(estimated_weight_kg))
        self.priority = priority
        self.status = status

    @property
    def priority(self) -> str:
        return self._priority

    @priority.setter
    def priority(self, value: str):
        if value not in self.VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of {self.VALID_PRIORITIES}")
        self._priority = value

    @property
    def status(self) -> str:
        return self._status

    @status.setter
    def status(self, value: str):
        if value not in self.VALID_STATUSES:
            raise ValueError(f"Status must be one of {self.VALID_STATUSES}")
        self._status = value

    @property
    def weight_kg(self) -> float:
        return self._estimated_weight_kg

    @property
    def coordinates(self) -> tuple[float, float]:
        return (self._latitude, self._longitude)

    def mark_collected(self) -> None:
        self._status = "Collected"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self._id,
            "name": self._name,
            "address": self._address,
            "latitude": self._latitude,
            "longitude": self._longitude,
            "material_category": self._material_category,
            "estimated_weight_kg": self._estimated_weight_kg,
            "priority": self._priority,
            "status": self._status
        }

class Driver(Entity):
    """Represents a collection vehicle driver."""
    def __init__(self, driver_id: int, name: str, license_number: str, phone_number: str):
        super().__init__(driver_id)
        self._name = name
        self._license_number = license_number
        self._phone_number = phone_number
        self._is_active = True

    @property
    def name(self) -> str:
        return self._name

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self._id,
            "name": self._name,
            "license_number": self._license_number,
            "phone_number": self._phone_number,
            "is_active": self._is_active
        }

class Vehicle(Entity):
    """Represents a recycling transport fleet vehicle."""
    def __init__(
        self,
        vehicle_id: int,
        vehicle_number: str,
        vehicle_type: str,
        capacity_kg: float,
        fuel_type: str = "Diesel",
        fuel_efficiency_km_l: float = 10.0,
        availability: str = "Available"
    ):
        super().__init__(vehicle_id)
        self._vehicle_number = vehicle_number
        self._vehicle_type = vehicle_type
        self._capacity_kg = float(capacity_kg)
        self._fuel_type = fuel_type
        self._fuel_efficiency_km_l = float(fuel_efficiency_km_l)
        self._availability = availability
        self._current_load_kg = 0.0
        self._assigned_driver: Optional[Driver] = None

    @property
    def capacity_kg(self) -> float:
        return self._capacity_kg

    @property
    def availability(self) -> str:
        return self._availability

    @availability.setter
    def availability(self, value: str):
        self._availability = value

    @property
    def fuel_efficiency_km_l(self) -> float:
        return self._fuel_efficiency_km_l

    @property
    def fuel_type(self) -> str:
        return self._fuel_type

    def assign_driver(self, driver: Driver) -> None:
        self._assigned_driver = driver

    def can_carry(self, additional_weight_kg: float) -> bool:
        """Encapsulated validation of vehicle capacity."""
        return (self._current_load_kg + additional_weight_kg) <= self._capacity_kg

    def load_cargo(self, weight_kg: float) -> None:
        if not self.can_carry(weight_kg):
            raise ValueError(f"Exceeds vehicle capacity of {self._capacity_kg} kg.")
        self._current_load_kg += weight_kg

    def reset_cargo(self) -> None:
        self._current_load_kg = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self._id,
            "vehicle_number": self._vehicle_number,
            "vehicle_type": self._vehicle_type,
            "capacity_kg": self._capacity_kg,
            "current_load_kg": self._current_load_kg,
            "fuel_type": self._fuel_type,
            "fuel_efficiency_km_l": self._fuel_efficiency_km_l,
            "availability": self._availability,
            "driver": self._assigned_driver.to_dict() if self._assigned_driver else None
        }

class Route(Entity):
    """Represents a scheduled or active collection route."""
    def __init__(
        self,
        route_id: int,
        route_code: str,
        start_facility: RecyclingFacility,
        destination_facility: RecyclingFacility,
        vehicle: Vehicle,
        algorithm: str = "Dijkstra-TSP"
    ):
        super().__init__(route_id)
        self._route_code = route_code
        self._start_facility = start_facility
        self._destination_facility = destination_facility
        self._vehicle = vehicle
        self._algorithm = algorithm
        self._stops: List[CollectionPoint] = []
        self._status = "Planned"
        self._total_distance_km = 0.0
        self._total_time_minutes = 0.0

    def add_stop(self, point: CollectionPoint) -> None:
        self._stops.append(point)

    def total_weight_kg(self) -> float:
        return sum(stop.weight_kg for stop in self._stops)

    def validate_capacity(self) -> bool:
        return self._vehicle.can_carry(self.total_weight_kg())

    def update_status(self, new_status: str) -> None:
        valid_statuses = {"Planned", "Assigned", "In Progress", "Paused", "Completed", "Cancelled"}
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid route status: {new_status}")
        self._status = new_status
        if new_status == "In Progress":
            self._vehicle.availability = "On Route"
        elif new_status in {"Completed", "Cancelled"}:
            self._vehicle.availability = "Available"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self._id,
            "route_code": self._route_code,
            "start_facility": self._start_facility.to_dict(),
            "destination_facility": self._destination_facility.to_dict(),
            "vehicle": self._vehicle.to_dict(),
            "stops_count": len(self._stops),
            "total_weight_kg": self.total_weight_kg(),
            "status": self._status,
            "algorithm": self._algorithm
        }

