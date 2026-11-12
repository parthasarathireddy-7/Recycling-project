from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from typing import Optional
import csv
import io

from app.database.session import get_db
from app.models import (
    Route, CollectionPoint, Vehicle, MaterialCategory, CollectionLog
)

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/summary")
def get_reports_summary(
    report_type: str = "daily",
    category: Optional[str] = None,
    vehicle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    routes_q = db.query(Route)
    if vehicle_id:
        routes_q = routes_q.filter(Route.vehicle_id == vehicle_id)
    routes = routes_q.all()

    total_dist = sum(r.total_distance_km for r in routes)
    dist_saved = sum(r.distance_saved_km for r in routes)
    fuel_used = sum(r.fuel_consumption_litres for r in routes)
    cost = sum(r.estimated_fuel_cost for r in routes)
    savings = sum((r.distance_saved_km / (r.vehicle.fuel_efficiency_km_l if r.vehicle and r.vehicle.fuel_efficiency_km_l > 0 else 10.0)) * 96.50 for r in routes)

    col_q = db.query(CollectionPoint)
    if category:
        col_q = col_q.filter(CollectionPoint.material_category == category)
    points = col_q.all()

    total_weight = sum(p.estimated_weight_kg for p in points)

    items = [
        {
            "id": r.id,
            "route_code": r.route_code,
            "vehicle": r.vehicle.vehicle_number if r.vehicle else "Unassigned",
            "driver": r.driver.name if r.driver else "Unassigned",
            "algorithm": r.optimization_algorithm,
            "distance_km": r.total_distance_km,
            "distance_saved_km": r.distance_saved_km,
            "fuel_litres": r.fuel_consumption_litres,
            "fuel_cost": r.estimated_fuel_cost,
            "total_load_kg": r.total_load_kg,
            "status": r.status,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
        }
        for r in routes
    ]

    return {
        "report_type": report_type,
        "aggregate": {
            "total_routes": len(routes),
            "total_distance_km": round(total_dist, 2),
            "total_distance_saved_km": round(dist_saved, 2),
            "total_fuel_litres": round(fuel_used, 2),
            "total_fuel_cost": round(cost, 2),
            "estimated_cost_savings": round(savings, 2),
            "total_material_weight_kg": round(total_weight, 2)
        },
        "records": items
    }

@router.get("/export-csv")
def export_routes_csv(
    vehicle_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Route)
    if vehicle_id:
        query = query.filter(Route.vehicle_id == vehicle_id)
    if status:
        query = query.filter(Route.status == status)
    routes = query.order_by(Route.id.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Route ID", "Route Code", "Vehicle", "Driver", "Algorithm",
        "Total Distance (km)", "Distance Saved (km)", "Time (mins)",
        "Fuel Consumption (L)", "Fuel Cost (INR)", "Total Load (kg)", "Status", "Created At"
    ])

    for r in routes:
        writer.writerow([
            r.id,
            r.route_code,
            r.vehicle.vehicle_number if r.vehicle else "Unassigned",
            r.driver.name if r.driver else "Unassigned",
            r.optimization_algorithm,
            r.total_distance_km,
            r.distance_saved_km,
            r.estimated_time_minutes,
            r.fuel_consumption_litres,
            r.estimated_fuel_cost,
            r.total_load_kg,
            r.status,
            r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=recycling_route_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )

