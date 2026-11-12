from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models import CollectionPoint, Notification
from app.schemas import CollectionPointCreate, CollectionPointUpdate, CollectionPointResponse

router = APIRouter(prefix="/collection-points", tags=["Collection Points"])

@router.get("", response_model=List[CollectionPointResponse])
def get_collection_points(
    search: Optional[str] = None,
    material: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CollectionPoint)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (CollectionPoint.name.ilike(search_fmt)) |
            (CollectionPoint.address.ilike(search_fmt)) |
            (CollectionPoint.contact_person.ilike(search_fmt))
        )
    if material:
        query = query.filter(CollectionPoint.material_category == material)
    if status:
        query = query.filter(CollectionPoint.collection_status == status)
    if priority:
        query = query.filter(CollectionPoint.priority == priority)
    
    return query.order_by(CollectionPoint.id.desc()).all()

@router.post("", response_model=CollectionPointResponse, status_code=status.HTTP_201_CREATED)
def create_collection_point(cp_in: CollectionPointCreate, db: Session = Depends(get_db)):
    new_cp = CollectionPoint(**cp_in.model_dump())
    db.add(new_cp)
    
    # Notify
    notif = Notification(
        title="New Collection Point Added",
        message=f"Added '{new_cp.name}' ({new_cp.material_category}, {new_cp.estimated_weight_kg} kg).",
        type="collection"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(new_cp)
    return new_cp

@router.get("/{cp_id}", response_model=CollectionPointResponse)
def get_collection_point(cp_id: int, db: Session = Depends(get_db)):
    cp = db.query(CollectionPoint).filter(CollectionPoint.id == cp_id).first()
    if not cp:
        raise HTTPException(status_code=404, detail="Collection point not found")
    return cp

@router.put("/{cp_id}", response_model=CollectionPointResponse)
def update_collection_point(cp_id: int, cp_in: CollectionPointUpdate, db: Session = Depends(get_db)):
    cp = db.query(CollectionPoint).filter(CollectionPoint.id == cp_id).first()
    if not cp:
        raise HTTPException(status_code=404, detail="Collection point not found")
    
    update_data = cp_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cp, field, value)
    
    db.commit()
    db.refresh(cp)
    return cp

@router.delete("/{cp_id}", status_code=status.HTTP_200_OK)
def delete_collection_point(cp_id: int, db: Session = Depends(get_db)):
    cp = db.query(CollectionPoint).filter(CollectionPoint.id == cp_id).first()
    if not cp:
        raise HTTPException(status_code=404, detail="Collection point not found")
    
    name = cp.name
    db.delete(cp)
    db.commit()
    return {"message": f"Collection point '{name}' successfully deleted", "id": cp_id}

