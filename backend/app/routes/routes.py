from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from app.database.session import get_db
from app.models import (
    Route, RouteStop, CollectionPoint, Vehicle, RecyclingFacility,
    Driver, Notification, CollectionLog, MaterialCategory
)
from app.schemas import (
    OptimizeRouteRequest, RouteCreateRequest, RouteStatusUpdate, RouteResponse
)
from app.algorithms.graph import Node
from app.algorithms.route_optimizer import RouteOptimizationEngine

router = APIRouter(prefix="/routes", tags=["Route Optimization & Management"])
optimization_engine = RouteOptimizationEngine()

@router.post("/optimize")
def optimize_collection_route(req: OptimizeRouteRequest, db: Session = Depends(get_db)):
    # 1. Fetch Start and Destination Facilities
    start_fac = db.query(RecyclingFacility).filter(RecyclingFacility.id == req.start_facility_id).first()
    dest_fac = db.query(RecyclingFacility).filter(RecyclingFacility.id == req.destination_facility_id).first()
    if not start_fac or not dest_fac:
        raise HTTPException(status_code=404, detail="Start or destination facility not found")

    # 2. Fetch Vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Selected vehicle not found")

    # 3. Fetch Collection Points
    if not req.collection_point_ids:
        raise HTTPException(status_code=400, detail="Please select at least one collection point to optimize")

    collection_points = db.query(CollectionPoint).filter(CollectionPoint.id.in_(req.collection_point_ids)).all()
    if not collection_points:
        raise HTTPException(status_code=404, detail="Selected collection points not found")

    # 4. Map to domain Nodes
    start_node = Node(
        node_id=f"FAC_{start_fac.id}",
        name=start_fac.name,
        latitude=start_fac.latitude,
        longitude=start_fac.longitude,
        node_type="facility"
    )
    dest_node = Node(
        node_id=f"FAC_{dest_fac.id}",
        name=dest_fac.name,
        latitude=dest_fac.latitude,
        longitude=dest_fac.longitude,
        node_type="facility"
    )
    cp_nodes = [
        Node(
            node_id=f"CP_{cp.id}",
            name=cp.name,
            latitude=cp.latitude,
            longitude=cp.longitude,
            node_type="point",
            weight_kg=cp.estimated_weight_kg
        )
        for cp in collection_points
    ]

    # Vehicle capacity limit
    capacity_limit = req.max_vehicle_capacity if req.max_vehicle_capacity and req.max_vehicle_capacity > 0 else vehicle.capacity_kg
    fuel_price = req.fuel_price_per_litre if req.fuel_price_per_litre and req.fuel_price_per_litre > 0 else 96.50

    # Execute Optimization Engine
    result = optimization_engine.optimize_route(
        start_node=start_node,
        destination_node=dest_node,
        collection_nodes=cp_nodes,
        vehicle_capacity_kg=capacity_limit,
        vehicle_fuel_efficiency_km_l=vehicle.fuel_efficiency_km_l,
        fuel_type=vehicle.fuel_type,
        fuel_price=fuel_price,
        algorithm=req.algorithm
    )

    # Attach facility & vehicle metadata
    result["meta"] = {
        "start_facility": {"id": start_fac.id, "name": start_fac.name, "coordinates": [start_fac.latitude, start_fac.longitude]},
        "destination_facility": {"id": dest_fac.id, "name": dest_fac.name, "coordinates": [dest_fac.latitude, dest_fac.longitude]},
        "vehicle": {"id": vehicle.id, "number": vehicle.vehicle_number, "type": vehicle.vehicle_type, "capacity_kg": vehicle.capacity_kg}
    }

    return result

@router.post("", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
def save_and_dispatch_route(req: RouteCreateRequest, db: Session = Depends(get_db)):
    route_code = req.route_code or f"RT-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"

    new_route = Route(
        route_code=route_code,
        vehicle_id=req.vehicle_id,
        driver_id=req.driver_id,
        start_facility_id=req.start_facility_id,
        destination_facility_id=req.destination_facility_id,
        optimization_algorithm=req.optimization_algorithm,
        total_distance_km=req.total_distance_km,
        original_distance_km=req.original_distance_km,
        distance_saved_km=req.distance_saved_km,
        estimated_time_minutes=req.estimated_time_minutes,
        fuel_consumption_litres=req.fuel_consumption_litres,
        estimated_fuel_cost=req.estimated_fuel_cost,
        total_load_kg=req.total_load_kg,
        status=req.status,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_route)
    db.flush()

    # Create Route Stops in the provided optimized order
    for idx, cp_id in enumerate(req.stop_ids, start=1):
        stop = RouteStop(
            route_id=new_route.id,
            collection_point_id=cp_id,
            stop_order=idx,
            status="Pending"
        )
        db.add(stop)

        # Update collection point status to Scheduled
        cp = db.query(CollectionPoint).filter(CollectionPoint.id == cp_id).first()
        if cp:
            cp.collection_status = "Scheduled"

    # If vehicle assigned and route is active
    if req.vehicle_id:
        veh = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id).first()
        if veh:
            veh.availability = "On Route" if req.status == "In Progress" else "Available"

    # Notification
    notif = Notification(
        title="Route Created & Dispatched",
        message=f"Optimized route {route_code} ({req.total_distance_km} km, {len(req.stop_ids)} stops) created using {req.optimization_algorithm}.",
        type="route"
    )
    db.add(notif)

    db.commit()
    db.refresh(new_route)
    return new_route

@router.get("", response_model=List[RouteResponse])
def get_routes(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Route)
    if status:
        q = q.filter(Route.status == status)
    return q.order_by(Route.id.desc()).all()

@router.get("/{route_id}", response_model=RouteResponse)
def get_route(route_id: int, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.patch("/{route_id}/status", response_model=RouteResponse)
def update_route_status(route_id: int, status_update: RouteStatusUpdate, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    new_status = status_update.status
    route.status = new_status
    now = datetime.now(timezone.utc)

    if new_status == "In Progress":
        route.started_at = now
        if route.vehicle:
            route.vehicle.availability = "On Route"

    elif new_status == "Completed":
        route.completed_at = now
        if route.vehicle:
            route.vehicle.availability = "Available"

        # Complete all stops and log collections
        for stop in route.stops:
            stop.status = "Collected"
            cp = stop.collection_point
            if cp:
                cp.collection_status = "Collected"
                stop.weight_collected_kg = cp.estimated_weight_kg

                # Log collection
                log = CollectionLog(
                    collection_point_id=cp.id,
                    route_id=route.id,
                    material_category=cp.material_category,
                    weight_kg=cp.estimated_weight_kg,
                    collected_at=now,
                    notes=f"Collected via Route {route.route_code}"
                )
                db.add(log)

                # Update material category stock
                mat = db.query(MaterialCategory).filter(MaterialCategory.name == cp.material_category).first()
                if mat:
                    mat.current_stock_kg += cp.estimated_weight_kg

        notif = Notification(
            title="Route Completed",
            message=f"Route {route.route_code} successfully finished. Total collected: {route.total_load_kg} kg.",
            type="route"
        )
        db.add(notif)

    elif new_status in {"Cancelled", "Paused"}:
        if route.vehicle and new_status == "Cancelled":
            route.vehicle.availability = "Available"
            # Reset collection points
            for stop in route.stops:
                if stop.collection_point:
                    stop.collection_point.collection_status = "Pending"

    db.commit()
    db.refresh(route)
    return route

@router.delete("/{route_id}", status_code=status.HTTP_200_OK)
def delete_route(route_id: int, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    if route.vehicle:
        route.vehicle.availability = "Available"

    # Reset collection points to pending
    for stop in route.stops:
        if stop.collection_point and stop.collection_point.collection_status == "Scheduled":
            stop.collection_point.collection_status = "Pending"

    code = route.route_code
    db.delete(route)
    db.commit()
    return {"message": f"Route '{code}' deleted successfully", "id": route_id}

