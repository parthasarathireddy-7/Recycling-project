from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import RecyclingFacility
from app.schemas import FacilityCreate, FacilityUpdate, FacilityResponse

router = APIRouter(prefix="/facilities", tags=["Recycling Facilities"])

@router.get("", response_model=List[FacilityResponse])
def get_facilities(db: Session = Depends(get_db)):
    return db.query(RecyclingFacility).order_by(RecyclingFacility.id.asc()).all()

@router.post("", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
def create_facility(f_in: FacilityCreate, db: Session = Depends(get_db)):
    fac = RecyclingFacility(**f_in.model_dump())
    db.add(fac)
    db.commit()
    db.refresh(fac)
    return fac

@router.get("/{fac_id}", response_model=FacilityResponse)
def get_facility(fac_id: int, db: Session = Depends(get_db)):
    fac = db.query(RecyclingFacility).filter(RecyclingFacility.id == fac_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    return fac

@router.put("/{fac_id}", response_model=FacilityResponse)
def update_facility(fac_id: int, f_in: FacilityUpdate, db: Session = Depends(get_db)):
    fac = db.query(RecyclingFacility).filter(RecyclingFacility.id == fac_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    for field, val in f_in.model_dump(exclude_unset=True).items():
        setattr(fac, field, val)
    
    db.commit()
    db.refresh(fac)
    return fac

