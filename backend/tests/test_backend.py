import pytest
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.algorithms.graph import Graph, Node
from app.algorithms.dijkstra import DijkstraSolver
from app.algorithms.astar import AStarSolver
from app.algorithms.fuel_calculator import FuelCalculator
from app.algorithms.route_optimizer import RouteOptimizationEngine
from app.services.oop_domain import Vehicle as OOPVehicle, CollectionPoint as OOPCollectionPoint
from app.database.session import Base, engine, SessionLocal
from app.database.init_db import init_db
from app.models import CollectionPoint, Vehicle, Route, User
from app.core.security import verify_password, hash_password

def setup_module(module):
    """Initialize DB before tests run."""
    init_db()

def test_password_hashing():
    pw = "supersecret123"
    hashed = hash_password(pw)
    assert verify_password(pw, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_graph_and_dijkstra_algorithm():
    graph = Graph()
    n_a = Node("A", "Depot", 40.7128, -74.0060)
    n_b = Node("B", "Station 1", 40.7228, -74.0160)
    n_c = Node("C", "Station 2", 40.7328, -74.0260)

    graph.add_node(n_a)
    graph.add_node(n_b)
    graph.add_node(n_c)

    # Edge A->B: 5 km, B->C: 4 km, Direct A->C: 12 km
    graph.add_edge("A", "B", 5.0)
    graph.add_edge("B", "C", 4.0)
    graph.add_edge("A", "C", 12.0)

    solver = DijkstraSolver(graph)
    path, dist, visited = solver.shortest_path("A", "C")
    assert path == ["A", "B", "C"]
    assert dist == 9.0  # 5 + 4 < 12
    assert visited >= 2

def test_astar_search_algorithm():
    graph = Graph()
    # Coordinates in a straight line
    n1 = Node("N1", "Start", 40.0, -74.0)
    n2 = Node("N2", "Midpoint", 40.05, -74.0)
    n3 = Node("N3", "Goal", 40.10, -74.0)

    graph.add_node(n1)
    graph.add_node(n2)
    graph.add_node(n3)

    graph.add_edge("N1", "N2", 6.0)
    graph.add_edge("N2", "N3", 6.0)
    graph.add_edge("N1", "N3", 20.0)

    astar = AStarSolver(graph)
    path, dist, visited = solver = astar.shortest_path("N1", "N3")
    assert path == ["N1", "N2", "N3"]
    assert dist == 12.0
    assert visited >= 2

def test_fuel_and_cost_calculator():
    calc = FuelCalculator(fuel_price_per_unit=1.50)
    res = calc.calculate_trip(
        distance_km=100.0,
        efficiency_km_per_unit=10.0,
        fuel_type="Diesel",
        custom_price_per_unit=1.50
    )
    assert res["fuel_consumption_units"] == 10.0
    assert res["estimated_fuel_cost"] == 15.0
    assert res["cost_per_km"] == 0.15

    # Test savings comparison
    savings = calc.compare_savings(
        original_distance_km=100.0,
        optimized_distance_km=80.0,
        efficiency_km_per_unit=10.0,
        custom_price_per_unit=1.50
    )
    assert savings["distance_saved_km"] == 20.0
    assert savings["fuel_saved_units"] == 2.0
    assert savings["cost_saved"] == 3.0
    assert savings["improvement_percentage"] == 20.0

def test_oop_vehicle_capacity_validation():
    v = OOPVehicle(
        vehicle_id=1,
        vehicle_number="TRK-999",
        vehicle_type="Medium Truck",
        capacity_kg=1000.0,
        fuel_efficiency_km_l=10.0
    )
    assert v.can_carry(500.0) is True
    assert v.can_carry(1001.0) is False

    v.load_cargo(600.0)
    assert v.can_carry(400.0) is True
    assert v.can_carry(401.0) is False

def test_route_optimization_engine_execution():
    engine = RouteOptimizationEngine(default_fuel_price=1.45)
    start = Node("DEPOT", "Central Hub", 40.7128, -74.0060, node_type="facility")
    dest = Node("DEST", "Central Hub", 40.7128, -74.0060, node_type="facility")

    stops = [
        Node("P1", "Point 1", 40.7580, -73.9855, weight_kg=100.0),
        Node("P2", "Point 2", 40.7538, -74.0022, weight_kg=150.0),
        Node("P3", "Point 3", 40.7424, -74.0061, weight_kg=200.0),
    ]

    opt_result = engine.optimize_route(
        start_node=start,
        destination_node=dest,
        collection_nodes=stops,
        vehicle_capacity_kg=1500.0,
        vehicle_fuel_efficiency_km_l=10.0,
        algorithm="Dijkstra-TSP"
    )

    assert "route_a_original" in opt_result
    assert "route_b_optimized" in opt_result
    assert "comparison" in opt_result
    assert opt_result["capacity_validation"]["capacity_exceeded"] is False
    assert len(opt_result["route_b_optimized"]["route_sequence_ids"]) == 5

def test_database_crud_operations():
    db = SessionLocal()
    try:
        # 1. Collection Point CRUD
        new_cp = CollectionPoint(
            name="Test Point Alpha",
            address="123 Test St",
            latitude=40.7500,
            longitude=-73.9900,
            contact_person="Tester",
            phone_number="555-9999",
            material_category="Plastic",
            estimated_weight_kg=75.0,
            priority="High",
            collection_status="Pending"
        )
        db.add(new_cp)
        db.commit()
        db.refresh(new_cp)
        cp_id = new_cp.id
        assert cp_id is not None

        # Read
        found = db.query(CollectionPoint).filter(CollectionPoint.id == cp_id).first()
        assert found.name == "Test Point Alpha"

        # Update
        found.priority = "Low"
        db.commit()
        updated = db.query(CollectionPoint).filter(CollectionPoint.id == cp_id).first()
        assert updated.priority == "Low"

        # Delete
        db.delete(updated)
        db.commit()
        deleted = db.query(CollectionPoint).filter(CollectionPoint.id == cp_id).first()
        assert deleted is None

        # 2. Vehicle query check
        vehicles = db.query(Vehicle).all()
        assert len(vehicles) >= 1

    finally:
        db.close()

