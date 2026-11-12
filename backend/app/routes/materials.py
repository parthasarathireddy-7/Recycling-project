from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import MaterialCategory, CollectionPoint
from app.schemas import MaterialCategoryCreate, MaterialCategoryUpdate, MaterialCategoryResponse

router = APIRouter(prefix="/materials", tags=["Materials Management"])

@router.get("", response_model=List[MaterialCategoryResponse])
def get_materials(db: Session = Depends(get_db)):
    return db.query(MaterialCategory).order_by(MaterialCategory.id.asc()).all()

@router.post("", response_model=MaterialCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_material(m_in: MaterialCategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(MaterialCategory).filter(MaterialCategory.name.ilike(m_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Material category already exists")
    
    mat = MaterialCategory(**m_in.model_dump())
    db.add(mat)
    db.commit()
    db.refresh(mat)
    return mat

@router.get("/{mat_id}", response_model=MaterialCategoryResponse)
def get_material(mat_id: int, db: Session = Depends(get_db)):
    mat = db.query(MaterialCategory).filter(MaterialCategory.id == mat_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    return mat

@router.put("/{mat_id}", response_model=MaterialCategoryResponse)
def update_material(mat_id: int, m_in: MaterialCategoryUpdate, db: Session = Depends(get_db)):
    mat = db.query(MaterialCategory).filter(MaterialCategory.id == mat_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    
    for field, val in m_in.model_dump(exclude_unset=True).items():
        setattr(mat, field, val)
    
    db.commit()
    db.refresh(mat)
    return mat

@router.delete("/{mat_id}", status_code=status.HTTP_200_OK)
def delete_material(mat_id: int, db: Session = Depends(get_db)):
    mat = db.query(MaterialCategory).filter(MaterialCategory.id == mat_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    
    name = mat.name
    db.delete(mat)
    db.commit()
    return {"message": f"Category '{name}' deleted", "id": mat_id}

