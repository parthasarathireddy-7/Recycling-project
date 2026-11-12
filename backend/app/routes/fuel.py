from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.algorithms.fuel_calculator import FuelCalculator

router = APIRouter(prefix="/fuel", tags=["Fuel & Cost Calculation Engine"])
calculator = FuelCalculator()

class FuelCalculateInput(BaseModel):
    distance_km: float
    fuel_efficiency_km_l: float
    fuel_price_per_litre: float
    fuel_type: str = "Diesel"

class FuelCompareInput(BaseModel):
    original_distance_km: float
    optimized_distance_km: float
    fuel_efficiency_km_l: float
    fuel_price_per_litre: float
    fuel_type: str = "Diesel"

@router.post("/calculate")
def calculate_fuel_and_cost(data: FuelCalculateInput):
    if data.distance_km < 0 or data.fuel_efficiency_km_l <= 0:
        raise HTTPException(status_code=400, detail="Invalid distance or fuel efficiency")
    
    return calculator.calculate_trip(
        distance_km=data.distance_km,
        efficiency_km_per_unit=data.fuel_efficiency_km_l,
        fuel_type=data.fuel_type,
        custom_price_per_unit=data.fuel_price_per_litre
    )

@router.post("/compare")
def compare_fuel_savings(data: FuelCompareInput):
    if data.original_distance_km < 0 or data.optimized_distance_km < 0 or data.fuel_efficiency_km_l <= 0:
        raise HTTPException(status_code=400, detail="Invalid distance or efficiency parameters")
    
    return calculator.compare_savings(
        original_distance_km=data.original_distance_km,
        optimized_distance_km=data.optimized_distance_km,
        efficiency_km_per_unit=data.fuel_efficiency_km_l,
        fuel_type=data.fuel_type,
        custom_price_per_unit=data.fuel_price_per_litre
    )

