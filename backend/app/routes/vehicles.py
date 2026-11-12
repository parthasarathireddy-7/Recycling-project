from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models import Vehicle, Driver, Notification
from app.schemas import (
    VehicleCreate, VehicleUpdate, VehicleResponse,
    DriverCreate, DriverResponse
)

router = APIRouter(prefix="/vehicles", tags=["Vehicles & Drivers"])

@router.get("", response_model=List[VehicleResponse])
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).order_by(Vehicle.id.desc()).all()

@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(v_in: VehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(Vehicle).filter(Vehicle.vehicle_number == v_in.vehicle_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle number already registered")
    
    new_vehicle = Vehicle(**v_in.model_dump())
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle

@router.get("/drivers/list", response_model=List[DriverResponse])
def get_drivers(db: Session = Depends(get_db)):
    return db.query(Driver).order_by(Driver.name.asc()).all()

@router.post("/drivers/create", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(d_in: DriverCreate, db: Session = Depends(get_db)):
    existing = db.query(Driver).filter(Driver.license_number == d_in.license_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Driver with this license already registered")
    driver = Driver(**d_in.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: int, v_in: VehicleUpdate, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    update_data = v_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(v, field, val)
    
    db.commit()
    db.refresh(v)
    return v

@router.delete("/{vehicle_id}", status_code=status.HTTP_200_OK)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    num = v.vehicle_number
    db.delete(v)
    db.commit()
    return {"message": f"Vehicle '{num}' deleted successfully", "id": vehicle_id}

