from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.models import (
    User, RecyclingFacility, Driver, Vehicle, MaterialCategory,
    CollectionPoint, Route, RouteStop, CollectionLog, Notification
)
from app.core.security import hash_password
from datetime import datetime, timezone, timedelta

def init_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Check if users already seeded
        if db.query(User).first() is not None:
            return

        print("Seeding initial database data...")

        # 1. Users
        users = [
            User(
                email="admin@recycling.org",
                full_name="Alex Turner (Admin)",
                hashed_password=hash_password("admin123"),
                role="Administrator",
                is_active=True
            ),
            User(
                email="manager@recycling.org",
                full_name="Elena Vance (Logistics Manager)",
                hashed_password=hash_password("manager123"),
                role="Manager",
                is_active=True
            ),
            User(
                email="collector@recycling.org",
                full_name="Marcus Reed (Fleet Specialist)",
                hashed_password=hash_password("collector123"),
                role="Collection Staff",
                is_active=True
            ),
        ]
        db.add_all(users)
        db.commit()

        # 2. Recycling Facilities
        facilities = [
            RecyclingFacility(
                name="Central Eco-Hub Processing Plant",
                address="100 Green Industrial Way, Eco City, NY 10001",
                latitude=40.7128,
                longitude=-74.0060,
                contact_person="Dr. Jonathan Vance",
                phone_number="+1-555-0100",
                capacity_daily_kg=25000.0,
                operating_hours="06:00 AM - 10:00 PM"
            ),
            RecyclingFacility(
                name="North Valley Material Recovery Facility",
                address="450 North Valley Road, Tech Corridor, NY 10025",
                latitude=40.7989,
                longitude=-73.9651,
                contact_person="Samantha Brooks",
                phone_number="+1-555-0105",
                capacity_daily_kg=18000.0,
                operating_hours="07:00 AM - 08:00 PM"
            )
        ]
        db.add_all(facilities)
        db.commit()

        # 3. Material Categories (Prices in Indian Rupees - INR / ₹)
        materials = [
            MaterialCategory(name="Plastic", description="PET bottles, HDPE containers, LDPE films", unit_price_per_kg=25.00, current_stock_kg=4820.0, carbon_offset_per_kg=1.4),
            MaterialCategory(name="Paper", description="Cardboard, newspapers, office shredded documents", unit_price_per_kg=15.00, current_stock_kg=8340.0, carbon_offset_per_kg=0.9),
            MaterialCategory(name="Glass", description="Cullet, beverage bottles, glass jars (flint, amber, green)", unit_price_per_kg=8.00, current_stock_kg=3210.0, carbon_offset_per_kg=0.5),
            MaterialCategory(name="Metal", description="Aluminum cans, copper scrap, steel framing", unit_price_per_kg=120.00, current_stock_kg=2950.0, carbon_offset_per_kg=3.8),
            MaterialCategory(name="E-waste", description="Circuit boards, batteries, monitors, obsolete consumer electronics", unit_price_per_kg=280.00, current_stock_kg=1450.0, carbon_offset_per_kg=5.2),
            MaterialCategory(name="Organic Waste", description="Compostable scraps, horticultural waste, food residuals", unit_price_per_kg=4.50, current_stock_kg=6120.0, carbon_offset_per_kg=0.7)
        ]
        db.add_all(materials)
        db.commit()

        # 4. Drivers
        drivers = [
            Driver(name="David Miller", license_number="DL-NY-849201", phone_number="+1-555-0210", status="Active"),
            Driver(name="Sarah Jenkins", license_number="DL-NY-772914", phone_number="+1-555-0211", status="Active"),
            Driver(name="Carlos Gomez", license_number="DL-NY-631049", phone_number="+1-555-0212", status="Active"),
            Driver(name="Priya Patel", license_number="DL-NY-918230", phone_number="+1-555-0213", status="On Leave"),
        ]
        db.add_all(drivers)
        db.commit()

        # 5. Vehicles
        vehicles = [
            Vehicle(
                vehicle_number="ECO-TRK-101",
                vehicle_type="Heavy Compactor",
                driver_id=1,
                capacity_kg=3500.0,
                fuel_type="Diesel",
                fuel_efficiency_km_l=8.5,
                current_location="Central Eco-Hub Depot",
                availability="Available"
            ),
            Vehicle(
                vehicle_number="ECO-VAN-204",
                vehicle_type="Electric Van",
                driver_id=2,
                capacity_kg=1800.0,
                fuel_type="Electric",
                fuel_efficiency_km_l=15.0,  # km/kWh equivalent
                current_location="North Hub Loading Dock",
                availability="Available"
            ),
            Vehicle(
                vehicle_number="ECO-TRK-305",
                vehicle_type="Medium Truck",
                driver_id=3,
                capacity_kg=2500.0,
                fuel_type="CNG",
                fuel_efficiency_km_l=11.2,
                current_location="Midtown Sector B",
                availability="Available"
            ),
            Vehicle(
                vehicle_number="ECO-VAN-408",
                vehicle_type="Light Van",
                driver_id=None,
                capacity_kg=1200.0,
                fuel_type="Petrol",
                fuel_efficiency_km_l=12.0,
                current_location="Service Garage",
                availability="Maintenance"
            ),
        ]
        db.add_all(vehicles)
        db.commit()

        # 6. Collection Points
        collection_points = [
            CollectionPoint(
                name="Grand Central Terminal Drop-off",
                address="89 E 42nd St, New York, NY 10017",
                latitude=40.7527,
                longitude=-73.9772,
                contact_person="Robert Lang",
                phone_number="+1-555-301",
                material_category="Paper",
                estimated_weight_kg=180.0,
                priority="High",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="Times Square Commercial Plaza",
                address="1560 Broadway, New York, NY 10036",
                latitude=40.7580,
                longitude=-73.9855,
                contact_person="Jessica Clark",
                phone_number="+1-555-302",
                material_category="Plastic",
                estimated_weight_kg=240.0,
                priority="High",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="Hudson Yards Eco Tower",
                address="500 W 33rd St, New York, NY 10001",
                latitude=40.7538,
                longitude=-74.0022,
                contact_person="Michael Chang",
                phone_number="+1-555-303",
                material_category="Metal",
                estimated_weight_kg=310.0,
                priority="Medium",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="Chelsea Market Green Dock",
                address="75 9th Ave, New York, NY 10011",
                latitude=40.7424,
                longitude=-74.0061,
                contact_person="Hannah Abbott",
                phone_number="+1-555-304",
                material_category="Organic Waste",
                estimated_weight_kg=420.0,
                priority="High",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="Union Square Farmers Pavilion",
                address="Union Square W, New York, NY 10003",
                latitude=40.7359,
                longitude=-73.9911,
                contact_person="Leo Martinez",
                phone_number="+1-555-305",
                material_category="Organic Waste",
                estimated_weight_kg=290.0,
                priority="Medium",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="SoHo Design Studios Hub",
                address="472 Broome St, New York, NY 10013",
                latitude=40.7223,
                longitude=-74.0007,
                contact_person="Claire Bennett",
                phone_number="+1-555-306",
                material_category="Glass",
                estimated_weight_kg=195.0,
                priority="Low",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="Financial District Tech Center",
                address="180 Maiden Ln, New York, NY 10038",
                latitude=40.7061,
                longitude=-74.0035,
                contact_person="Andrew Wu",
                phone_number="+1-555-307",
                material_category="E-waste",
                estimated_weight_kg=150.0,
                priority="High",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="Battery Park Community Recycling",
                address="Battery Pl, New York, NY 10004",
                latitude=40.7033,
                longitude=-74.0170,
                contact_person="Gloria Rossi",
                phone_number="+1-555-308",
                material_category="Plastic",
                estimated_weight_kg=125.0,
                priority="Low",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="Brooklyn Navy Yard Technology Incubator",
                address="63 Flushing Ave, Brooklyn, NY 11205",
                latitude=40.7018,
                longitude=-73.9716,
                contact_person="Kenneth Lee",
                phone_number="+1-555-309",
                material_category="E-waste",
                estimated_weight_kg=350.0,
                priority="Medium",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="Long Island City Clean Earth Hub",
                address="47-40 21st St, Long Island City, NY 11101",
                latitude=40.7441,
                longitude=-73.9485,
                contact_person="Natalie Moore",
                phone_number="+1-555-310",
                material_category="Metal",
                estimated_weight_kg=280.0,
                priority="Medium",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="Astoria Food Distribution Point",
                address="31-00 47th Ave, Queens, NY 11101",
                latitude=40.7490,
                longitude=-73.9290,
                contact_person="Dimitri Vasquez",
                phone_number="+1-555-311",
                material_category="Paper",
                estimated_weight_kg=210.0,
                priority="Low",
                collection_status="Pending"
            ),
            CollectionPoint(
                name="Harlem Health Community Center",
                address="506 Lenox Ave, New York, NY 10037",
                latitude=40.8142,
                longitude=-73.9392,
                contact_person="Angela Davis",
                phone_number="+1-555-312",
                material_category="Glass",
                estimated_weight_kg=160.0,
                priority="Low",
                collection_status="Pending"
            ),
        ]
        db.add_all(collection_points)
        db.commit()

        # 7. Notifications
        notifications = [
            Notification(
                title="System Initialized",
                message="Recycling Center Route Optimizer database initialized with comprehensive sample routes and fleets.",
                type="system",
                is_read=False
            ),
            Notification(
                title="High-Priority Waste Alert",
                message="Chelsea Market Green Dock has accumulated 420 kg of organic waste requiring expedited collection.",
                type="collection",
                is_read=False
            ),
            Notification(
                title="Fleet Ready",
                message="ECO-TRK-101 and ECO-VAN-204 are fueled and cleared for optimized dispatch.",
                type="vehicle",
                is_read=True
            ),
        ]
        db.add_all(notifications)
        db.commit()

        # 8. Seed sample completed route for analytics and reports
        now = datetime.now(timezone.utc)
        completed_route = Route(
            route_code="RT-2026-001",
            vehicle_id=1,
            driver_id=1,
            start_facility_id=1,
            destination_facility_id=1,
            optimization_algorithm="Dijkstra-TSP",
            total_distance_km=28.4,
            original_distance_km=41.2,
            distance_saved_km=12.8,
            estimated_time_minutes=68.5,
            fuel_consumption_litres=3.34,
            estimated_fuel_cost=322.31,
            total_load_kg=1250.0,
            status="Completed",
            created_at=now - timedelta(days=2),
            started_at=now - timedelta(days=2, hours=3),
            completed_at=now - timedelta(days=2, hours=1)
        )
        db.add(completed_route)
        db.commit()

        # Add route stops for the completed route
        stop1 = RouteStop(route_id=completed_route.id, collection_point_id=1, stop_order=1, status="Collected", weight_collected_kg=180.0)
        stop2 = RouteStop(route_id=completed_route.id, collection_point_id=2, stop_order=2, status="Collected", weight_collected_kg=240.0)
        stop3 = RouteStop(route_id=completed_route.id, collection_point_id=4, stop_order=3, status="Collected", weight_collected_kg=420.0)
        stop4 = RouteStop(route_id=completed_route.id, collection_point_id=7, stop_order=4, status="Collected", weight_collected_kg=150.0)
        db.add_all([stop1, stop2, stop3, stop4])

        # Add collection logs
        log1 = CollectionLog(collection_point_id=1, route_id=completed_route.id, material_category="Paper", weight_kg=180.0, collected_at=now - timedelta(days=2, hours=2, minutes=30))
        log2 = CollectionLog(collection_point_id=2, route_id=completed_route.id, material_category="Plastic", weight_kg=240.0, collected_at=now - timedelta(days=2, hours=2, minutes=10))
        log3 = CollectionLog(collection_point_id=4, route_id=completed_route.id, material_category="Organic Waste", weight_kg=420.0, collected_at=now - timedelta(days=2, hours=1, minutes=45))
        log4 = CollectionLog(collection_point_id=7, route_id=completed_route.id, material_category="E-waste", weight_kg=150.0, collected_at=now - timedelta(days=2, hours=1, minutes=15))
        db.add_all([log1, log2, log3, log4])
        db.commit()

        print("Database seeded successfully with users, facilities, fleet, and collection network!")
    finally:
        db.close()

