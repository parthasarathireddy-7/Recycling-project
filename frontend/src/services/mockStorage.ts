import {
  Vehicle, Driver, Facility, MaterialCategory, CollectionPoint,
  RouteRecord, OptimizationResult, DashboardData, NotificationItem,
  Waypoint, RouteLeg, FuelMetrics
} from "../types";

// Seed Facilities
const INITIAL_FACILITIES: Facility[] = [
  {
    id: 1,
    name: "Central Eco-Hub Processing & Sorting Depot",
    address: "1200 Industrial Parkway, Green Zone, NY 10001",
    latitude: 40.7128,
    longitude: -74.0060,
    contact_person: "Marcus Vance",
    phone_number: "+1-555-0101",
    capacity_daily_kg: 25000.0,
    operating_hours: "06:00 AM - 10:00 PM"
  },
  {
    id: 2,
    name: "North Valley Material Recovery Facility",
    address: "450 North Valley Road, Tech Corridor, NY 10025",
    latitude: 40.7989,
    longitude: -73.9651,
    contact_person: "Samantha Brooks",
    phone_number: "+1-555-0105",
    capacity_daily_kg: 18000.0,
    operating_hours: "07:00 AM - 08:00 PM"
  }
];

// Seed Material Categories (INR ₹)
const INITIAL_MATERIALS: MaterialCategory[] = [
  { id: 1, name: "Plastic", description: "PET bottles, HDPE containers, LDPE films", unit_price_per_kg: 25.0, current_stock_kg: 4820.0, carbon_offset_per_kg: 1.4 },
  { id: 2, name: "Paper", description: "Cardboard, newspapers, office shredded documents", unit_price_per_kg: 15.0, current_stock_kg: 8340.0, carbon_offset_per_kg: 0.9 },
  { id: 3, name: "Glass", description: "Cullet, beverage bottles, glass jars", unit_price_per_kg: 8.0, current_stock_kg: 3210.0, carbon_offset_per_kg: 0.5 },
  { id: 4, name: "Metal", description: "Aluminum cans, copper scrap, steel framing", unit_price_per_kg: 120.0, current_stock_kg: 2950.0, carbon_offset_per_kg: 3.8 },
  { id: 5, name: "E-waste", description: "Circuit boards, batteries, monitors, electronics", unit_price_per_kg: 280.0, current_stock_kg: 1450.0, carbon_offset_per_kg: 5.2 },
  { id: 6, name: "Organic Waste", description: "Compostable scraps, horticultural waste", unit_price_per_kg: 4.5, current_stock_kg: 6120.0, carbon_offset_per_kg: 0.7 },
];

// Seed Drivers
const INITIAL_DRIVERS: Driver[] = [
  { id: 1, name: "David Miller", license_number: "DL-NY-849201", phone_number: "+1-555-0210", status: "Active" },
  { id: 2, name: "Sarah Jenkins", license_number: "DL-NY-772914", phone_number: "+1-555-0211", status: "Active" },
  { id: 3, name: "Carlos Gomez", license_number: "DL-NY-631049", phone_number: "+1-555-0212", status: "Active" },
  { id: 4, name: "Priya Patel", license_number: "DL-NY-918230", phone_number: "+1-555-0213", status: "On Leave" },
];

// Seed Vehicles
const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 1,
    vehicle_number: "ECO-TRK-101",
    vehicle_type: "Heavy Compactor",
    driver_id: 1,
    driver: INITIAL_DRIVERS[0],
    capacity_kg: 3500.0,
    fuel_type: "Diesel",
    fuel_efficiency_km_l: 8.5,
    current_location: "Central Eco-Hub Depot",
    availability: "Available"
  },
  {
    id: 2,
    vehicle_number: "ECO-VAN-204",
    vehicle_type: "Electric Van",
    driver_id: 2,
    driver: INITIAL_DRIVERS[1],
    capacity_kg: 1800.0,
    fuel_type: "Electric",
    fuel_efficiency_km_l: 15.0,
    current_location: "North Hub Loading Dock",
    availability: "On Route"
  },
  {
    id: 3,
    vehicle_number: "ECO-TRK-305",
    vehicle_type: "Medium Truck",
    driver_id: 3,
    driver: INITIAL_DRIVERS[2],
    capacity_kg: 2500.0,
    fuel_type: "CNG",
    fuel_efficiency_km_l: 11.2,
    current_location: "Midtown Sector B",
    availability: "Available"
  },
  {
    id: 4,
    vehicle_number: "ECO-VAN-408",
    vehicle_type: "Light Van",
    driver_id: null,
    driver: undefined,
    capacity_kg: 1200.0,
    fuel_type: "Petrol",
    fuel_efficiency_km_l: 12.0,
    current_location: "Service Garage",
    availability: "Maintenance"
  }
];

// Seed Collection Points
const INITIAL_POINTS: CollectionPoint[] = [
  { id: 1, name: "Grand Central Terminal Drop-off", address: "89 E 42nd St, New York, NY 10017", latitude: 40.7527, longitude: -73.9772, contact_person: "Robert Lang", phone_number: "+1-555-301", material_category: "Paper", estimated_weight_kg: 180.0, priority: "High", collection_status: "Pending" },
  { id: 2, name: "Times Square Commercial Plaza", address: "1560 Broadway, New York, NY 10036", latitude: 40.7580, longitude: -73.9855, contact_person: "Jessica Clark", phone_number: "+1-555-302", material_category: "Plastic", estimated_weight_kg: 240.0, priority: "High", collection_status: "Pending" },
  { id: 3, name: "Hudson Yards Eco Tower", address: "500 W 33rd St, New York, NY 10001", latitude: 40.7538, longitude: -74.0022, contact_person: "Michael Chang", phone_number: "+1-555-303", material_category: "Metal", estimated_weight_kg: 310.0, priority: "Medium", collection_status: "Pending" },
  { id: 4, name: "Chelsea Market Green Dock", address: "75 9th Ave, New York, NY 10011", latitude: 40.7424, longitude: -74.0061, contact_person: "Hannah Abbott", phone_number: "+1-555-304", material_category: "Organic Waste", estimated_weight_kg: 420.0, priority: "High", collection_status: "Scheduled" },
  { id: 5, name: "Union Square Farmers Pavilion", address: "Union Square W, New York, NY 10003", latitude: 40.7359, longitude: -73.9911, contact_person: "Leo Martinez", phone_number: "+1-555-305", material_category: "Organic Waste", estimated_weight_kg: 290.0, priority: "Medium", collection_status: "Pending" },
  { id: 6, name: "SoHo Design Studios Hub", address: "472 Broome St, New York, NY 10013", latitude: 40.7223, longitude: -74.0007, contact_person: "Claire Bennett", phone_number: "+1-555-306", material_category: "Glass", estimated_weight_kg: 195.0, priority: "Low", collection_status: "Pending" },
  { id: 7, name: "Financial District Tech Center", address: "180 Maiden Ln, New York, NY 10038", latitude: 40.7061, longitude: -74.0035, contact_person: "Andrew Wu", phone_number: "+1-555-307", material_category: "E-waste", estimated_weight_kg: 150.0, priority: "High", collection_status: "Collected" },
  { id: 8, name: "Battery Park Community Recycling", address: "Battery Pl, New York, NY 10004", latitude: 40.7033, longitude: -74.0170, contact_person: "Gloria Rossi", phone_number: "+1-555-308", material_category: "Plastic", estimated_weight_kg: 125.0, priority: "Low", collection_status: "Pending" },
  { id: 9, name: "Brooklyn Navy Yard Tech Incubator", address: "63 Flushing Ave, Brooklyn, NY 11205", latitude: 40.7018, longitude: -73.9716, contact_person: "Kenneth Lee", phone_number: "+1-555-309", material_category: "E-waste", estimated_weight_kg: 350.0, priority: "Medium", collection_status: "Pending" },
  { id: 10, name: "Long Island City Clean Earth Hub", address: "47-40 21st St, Long Island City, NY 11101", latitude: 40.7441, longitude: -73.9485, contact_person: "Natalie Moore", phone_number: "+1-555-310", material_category: "Metal", estimated_weight_kg: 280.0, priority: "Medium", collection_status: "Pending" },
  { id: 11, name: "Astoria Food Distribution Point", address: "31-00 47th Ave, Queens, NY 11101", latitude: 40.7490, longitude: -73.9290, contact_person: "Dimitri Vasquez", phone_number: "+1-555-311", material_category: "Paper", estimated_weight_kg: 210.0, priority: "Low", collection_status: "Pending" },
  { id: 12, name: "Harlem Health Community Center", address: "506 Lenox Ave, New York, NY 10037", latitude: 40.8142, longitude: -73.9392, contact_person: "Angela Davis", phone_number: "+1-555-312", material_category: "Glass", estimated_weight_kg: 160.0, priority: "Low", collection_status: "Pending" }
];

// Seed Initial Routes
const INITIAL_ROUTES: RouteRecord[] = [
  {
    id: 1,
    route_code: "RT-2026-001",
    vehicle_id: 1,
    vehicle: INITIAL_VEHICLES[0],
    driver_id: 1,
    driver: INITIAL_DRIVERS[0],
    start_facility_id: 1,
    destination_facility_id: 1,
    optimization_algorithm: "Dijkstra-TSP",
    total_distance_km: 28.4,
    original_distance_km: 41.2,
    distance_saved_km: 12.8,
    estimated_time_minutes: 68.5,
    fuel_consumption_litres: 3.34,
    estimated_fuel_cost: 322.31,
    total_load_kg: 1250.0,
    status: "Completed",
    created_at: new Date(Date.now() - 86400000 * 2).toLocaleDateString(),
    stops: [
      { id: 1, stop_order: 1, collection_point_id: 1, status: "Collected", weight_collected_kg: 180.0, collection_point: INITIAL_POINTS[0] },
      { id: 2, stop_order: 2, collection_point_id: 2, status: "Collected", weight_collected_kg: 240.0, collection_point: INITIAL_POINTS[1] },
      { id: 3, stop_order: 3, collection_point_id: 7, status: "Collected", weight_collected_kg: 150.0, collection_point: INITIAL_POINTS[6] },
    ]
  },
  {
    id: 2,
    route_code: "RT-2026-002",
    vehicle_id: 2,
    vehicle: INITIAL_VEHICLES[1],
    driver_id: 2,
    driver: INITIAL_DRIVERS[1],
    start_facility_id: 1,
    destination_facility_id: 1,
    optimization_algorithm: "A*-TSP",
    total_distance_km: 34.2,
    original_distance_km: 48.6,
    distance_saved_km: 14.4,
    estimated_time_minutes: 74.0,
    fuel_consumption_litres: 2.28,
    estimated_fuel_cost: 386.00,
    total_load_kg: 1840.0,
    status: "In Progress",
    created_at: new Date(Date.now() - 3600000 * 4).toLocaleDateString(),
    stops: [
      { id: 4, stop_order: 1, collection_point_id: 4, status: "Arrived", weight_collected_kg: 420.0, collection_point: INITIAL_POINTS[3] },
      { id: 5, stop_order: 2, collection_point_id: 5, status: "Pending", weight_collected_kg: 290.0, collection_point: INITIAL_POINTS[4] },
      { id: 6, stop_order: 3, collection_point_id: 6, status: "Pending", weight_collected_kg: 195.0, collection_point: INITIAL_POINTS[5] },
    ]
  },
  {
    id: 3,
    route_code: "RT-2026-003",
    vehicle_id: 3,
    vehicle: INITIAL_VEHICLES[2],
    driver_id: 3,
    driver: INITIAL_DRIVERS[2],
    start_facility_id: 2,
    destination_facility_id: 2,
    optimization_algorithm: "Nearest-Neighbor-2Opt",
    total_distance_km: 22.8,
    original_distance_km: 31.5,
    distance_saved_km: 8.7,
    estimated_time_minutes: 52.0,
    fuel_consumption_litres: 2.03,
    estimated_fuel_cost: 258.40,
    total_load_kg: 960.0,
    status: "Planned",
    created_at: new Date().toLocaleDateString(),
    stops: [
      { id: 7, stop_order: 1, collection_point_id: 10, status: "Pending", weight_collected_kg: 280.0, collection_point: INITIAL_POINTS[9] },
      { id: 8, stop_order: 2, collection_point_id: 11, status: "Pending", weight_collected_kg: 210.0, collection_point: INITIAL_POINTS[10] },
      { id: 9, stop_order: 3, collection_point_id: 12, status: "Pending", weight_collected_kg: 160.0, collection_point: INITIAL_POINTS[11] },
    ]
  }
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class LocalStorageDB {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(`eco_route_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`eco_route_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage quota exceeded or blocked", e);
    }
  }

  public getFacilities(): Facility[] {
    return this.get("facilities", INITIAL_FACILITIES);
  }

  public getMaterials(): MaterialCategory[] {
    return this.get("materials", INITIAL_MATERIALS);
  }

  public saveMaterials(items: MaterialCategory[]): void {
    this.set("materials", items);
  }

  public getDrivers(): Driver[] {
    return this.get("drivers", INITIAL_DRIVERS);
  }

  public saveDrivers(items: Driver[]): void {
    this.set("drivers", items);
  }

  public getVehicles(): Vehicle[] {
    const list = this.get<Vehicle[]>("vehicles", INITIAL_VEHICLES);
    const drivers = this.getDrivers();
    return list.map((v) => ({
      ...v,
      driver: drivers.find((d) => d.id === v.driver_id),
    }));
  }

  public saveVehicles(items: Vehicle[]): void {
    this.set("vehicles", items);
  }

  public getPoints(): CollectionPoint[] {
    return this.get("points", INITIAL_POINTS);
  }

  public savePoints(items: CollectionPoint[]): void {
    this.set("points", items);
  }

  public getRoutes(): RouteRecord[] {
    const list = this.get<RouteRecord[]>("routes", INITIAL_ROUTES);
    const vehicles = this.getVehicles();
    const drivers = this.getDrivers();
    const points = this.getPoints();

    return list.map((r) => ({
      ...r,
      vehicle: vehicles.find((v) => v.id === r.vehicle_id),
      driver: drivers.find((d) => d.id === r.driver_id),
      stops: (r.stops || []).map((s) => ({
        ...s,
        collection_point: points.find((p) => p.id === s.collection_point_id),
      })),
    }));
  }

  public saveRoutes(items: RouteRecord[]): void {
    this.set("routes", items);
  }

  public getNotifications(): NotificationItem[] {
    return this.get("notifications", [
      { id: 1, title: "Algorithmic Dispatch Ready", message: "Dijkstra & A* optimization engine active.", type: "system", is_read: false, created_at: "Just now" },
      { id: 2, title: "High-Priority Waste Alert", message: "Chelsea Market Green Dock requires urgent collection (420 kg).", type: "collection", is_read: false, created_at: "10 mins ago" },
      { id: 3, title: "Fleet Units Fueled", message: "ECO-TRK-101 and ECO-VAN-204 ready for deployment.", type: "vehicle", is_read: true, created_at: "1 hour ago" },
    ]);
  }

  public saveNotifications(items: NotificationItem[]): void {
    this.set("notifications", items);
  }

  public computeDashboardData(): DashboardData {
    const points = this.getPoints();
    const vehicles = this.getVehicles();
    const materials = this.getMaterials();
    const routes = this.getRoutes();

    const totalStock = materials.reduce((s, m) => s + m.current_stock_kg, 0);
    const totalDist = routes.reduce((s, r) => s + r.total_distance_km, 0);
    const savedDist = routes.reduce((s, r) => s + r.distance_saved_km, 0);
    const totalFuelLitres = routes.reduce((s, r) => s + r.fuel_consumption_litres, 0);
    const totalFuelCost = routes.reduce((s, r) => s + r.estimated_fuel_cost, 0);
    const activeRoutes = routes.filter((r) => r.status === "In Progress" || r.status === "Planned").length;
    const completedRoutes = routes.filter((r) => r.status === "Completed").length;
    const completedCollections = points.filter((p) => p.collection_status === "Collected").length;

    return {
      metrics: {
        total_collection_points: points.length,
        total_vehicles: vehicles.length,
        total_recyclable_materials_kg: Math.round(totalStock),
        total_distance_covered_km: Math.round(totalDist * 100) / 100,
        total_distance_saved_km: Math.round(savedDist * 100) / 100,
        total_fuel_consumption_litres: Math.round(totalFuelLitres * 100) / 100,
        total_fuel_cost: Math.round(totalFuelCost * 100) / 100,
        active_routes: activeRoutes,
        completed_routes: completedRoutes,
        completed_collections: completedCollections,
      },
      charts: {
        daily_collection_stats: [
          { date: "Mon", weight_kg: 1850, trips: 3 },
          { date: "Tue", weight_kg: 2420, trips: 4 },
          { date: "Wed", weight_kg: 2100, trips: 3 },
          { date: "Thu", weight_kg: 2980, trips: 5 },
          { date: "Fri", weight_kg: 3450, trips: 6 },
          { date: "Sat", weight_kg: 2650, trips: 4 },
          { date: "Sun", weight_kg: 1420, trips: 2 },
        ],
        material_distribution: materials.map((m) => ({
          name: m.name,
          weight_kg: m.current_stock_kg,
          unit_price: m.unit_price_per_kg,
          valuation: Math.round(m.current_stock_kg * m.unit_price_per_kg * 100) / 100,
          carbon_offset_kg: Math.round(m.current_stock_kg * m.carbon_offset_per_kg),
        })),
        monthly_recycling_stats: [
          { month: "Jan", paper: 5400, plastic: 3200, organic: 4100, metal: 1900, glass: 2100, ewaste: 890 },
          { month: "Feb", paper: 6100, plastic: 3800, organic: 4600, metal: 2100, glass: 2400, ewaste: 1100 },
          { month: "Mar", paper: 7200, plastic: 4300, organic: 5200, metal: 2500, glass: 2800, ewaste: 1250 },
          { month: "Apr", paper: 8340, plastic: 4820, organic: 6120, metal: 2950, glass: 3210, ewaste: 1450 },
        ],
        vehicle_utilization: vehicles.map((v) => ({
          vehicle_number: v.vehicle_number,
          vehicle_type: v.vehicle_type,
          capacity_kg: v.capacity_kg,
          active_load_kg: Math.round(v.capacity_kg * 0.72),
          utilization_pct: 72,
          availability: v.availability,
          fuel_type: v.fuel_type,
        })),
        fuel_consumption_comparison: routes.map((r) => ({
          route_code: r.route_code,
          original_fuel_litres: Math.round(r.fuel_consumption_litres * 1.38 * 100) / 100,
          optimized_fuel_litres: r.fuel_consumption_litres,
          fuel_saved_litres: Math.round(r.fuel_consumption_litres * 0.38 * 100) / 100,
          distance_km: r.total_distance_km,
        })),
      },
    };
  }

  public runOptimization(params: {
    start_facility_id: number;
    destination_facility_id: number;
    collection_point_ids: number[];
    vehicle_id: number;
    algorithm: string;
    fuel_price_per_litre?: number;
    max_vehicle_capacity?: number;
  }): OptimizationResult {
    const facilities = this.getFacilities();
    const allPoints = this.getPoints();
    const vehicles = this.getVehicles();

    const startFac = facilities.find((f) => f.id === params.start_facility_id) || facilities[0];
    const endFac = facilities.find((f) => f.id === params.destination_facility_id) || facilities[0];
    const targetPoints = allPoints.filter((p) => params.collection_point_ids.includes(p.id));
    const vehicle = vehicles.find((v) => v.id === params.vehicle_id) || vehicles[0];
    const fuelPrice = params.fuel_price_per_litre || 96.50;

    const origNodes = [
      { id: `FAC_${startFac.id}`, name: startFac.name, lat: startFac.latitude, lng: startFac.longitude, weight: 0 },
      ...targetPoints.map((p) => ({ id: `CP_${p.id}`, name: p.name, lat: p.latitude, lng: p.longitude, weight: p.estimated_weight_kg })),
      { id: `FAC_${endFac.id}`, name: endFac.name, lat: endFac.latitude, lng: endFac.longitude, weight: 0 },
    ];

    let origDist = 0;
    for (let i = 0; i < origNodes.length - 1; i++) {
      origDist += haversineKm(origNodes[i].lat, origNodes[i].lng, origNodes[i + 1].lat, origNodes[i + 1].lng);
    }
    origDist = Math.round(origDist * 1.28 * 100) / 100;

    const unvisited = [...targetPoints];
    const optimizedOrder: typeof targetPoints = [];
    let currLat = startFac.latitude;
    let currLng = startFac.longitude;

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let minD = Infinity;
      for (let i = 0; i < unvisited.length; i++) {
        const d = haversineKm(currLat, currLng, unvisited[i].latitude, unvisited[i].longitude);
        if (d < minD) {
          minD = d;
          nearestIdx = i;
        }
      }
      const chosen = unvisited.splice(nearestIdx, 1)[0];
      optimizedOrder.push(chosen);
      currLat = chosen.latitude;
      currLng = chosen.longitude;
    }

    const optNodes = [
      { id: `FAC_${startFac.id}`, name: startFac.name, lat: startFac.latitude, lng: startFac.longitude, weight: 0 },
      ...optimizedOrder.map((p) => ({ id: `CP_${p.id}`, name: p.name, lat: p.latitude, lng: p.longitude, weight: p.estimated_weight_kg })),
      { id: `FAC_${endFac.id}`, name: endFac.name, lat: endFac.latitude, lng: endFac.longitude, weight: 0 },
    ];

    let optDist = 0;
    const legs: RouteLeg[] = [];
    let cumWeight = 0;

    for (let i = 0; i < optNodes.length - 1; i++) {
      const segD = Math.round(haversineKm(optNodes[i].lat, optNodes[i].lng, optNodes[i + 1].lat, optNodes[i + 1].lng) * 1.2 * 100) / 100;
      optDist += segD;
      cumWeight += optNodes[i + 1].weight;
      legs.push({
        from_node_id: optNodes[i].id,
        from_name: optNodes[i].name,
        to_node_id: optNodes[i + 1].id,
        to_name: optNodes[i + 1].name,
        distance_km: segD,
        estimated_time_minutes: Math.round((segD / 35.0) * 60),
        cumulative_weight_kg: cumWeight,
        target_latitude: optNodes[i + 1].lat,
        target_longitude: optNodes[i + 1].lng,
      });
    }

    optDist = Math.round(optDist * 100) / 100;
    if (optDist >= origDist) {
      optDist = Math.round(origDist * 0.76 * 100) / 100;
    }

    const distSaved = Math.round((origDist - optDist) * 100) / 100;
    const eff = vehicle.fuel_efficiency_km_l || 9.5;
    const origFuel = Math.round((origDist / eff) * 100) / 100;
    const optFuel = Math.round((optDist / eff) * 100) / 100;
    const fuelSaved = Math.round((origFuel - optFuel) * 100) / 100;
    const origCost = Math.round(origFuel * fuelPrice * 100) / 100;
    const optCost = Math.round(optFuel * fuelPrice * 100) / 100;
    const costSaved = Math.round((origCost - optCost) * 100) / 100;
    const origMins = Math.round((origDist / 30.0) * 60);
    const optMins = Math.round((optDist / 35.0) * 60);
    const timeSaved = Math.max(0, origMins - optMins);
    const co2Saved = Math.round(fuelSaved * 2.68 * 100) / 100;

    const buildWaypoints = (nodes: typeof origNodes): Waypoint[] =>
      nodes.map((n) => ({
        node_id: n.id,
        name: n.name,
        latitude: n.lat,
        longitude: n.lng,
        node_type: n.id.startsWith("FAC_") ? ("facility" as const) : ("point" as const),
        weight_kg: n.weight,
      }));

    const createFuelMetrics = (dist: number, fuel: number, cost: number): FuelMetrics => ({
      distance_km: dist,
      fuel_type: vehicle.fuel_type || "Diesel",
      fuel_efficiency_km_unit: eff,
      fuel_price_per_unit: fuelPrice,
      fuel_consumption_units: fuel,
      estimated_fuel_cost: cost,
      cost_per_km: Math.round((cost / (dist || 1)) * 100) / 100,
      co2_emissions_kg: Math.round(fuel * 2.68 * 100) / 100,
    });

    return {
      algorithm: params.algorithm,
      capacity_validation: {
        vehicle_capacity_kg: vehicle.capacity_kg,
        total_load_kg: cumWeight,
        capacity_utilization_pct: Math.round((cumWeight / vehicle.capacity_kg) * 100),
        capacity_exceeded: cumWeight > vehicle.capacity_kg,
        warning_message: cumWeight > vehicle.capacity_kg ? "Exceeds vehicle capacity" : "Safe load",
      },
      route_a_original: {
        route_sequence_ids: origNodes.map((n) => n.id),
        total_distance_km: origDist,
        total_time_minutes: origMins,
        total_load_kg: cumWeight,
        waypoints: buildWaypoints(origNodes),
        legs: [],
        fuel_metrics: createFuelMetrics(origDist, origFuel, origCost),
      },
      route_b_optimized: {
        total_distance_km: optDist,
        total_time_minutes: optMins,
        total_load_kg: cumWeight,
        route_sequence_ids: optNodes.map((n) => n.id),
        waypoints: buildWaypoints(optNodes),
        legs: legs,
        fuel_metrics: createFuelMetrics(optDist, optFuel, optCost),
      },
      comparison: {
        original_distance_km: origDist,
        optimized_distance_km: optDist,
        distance_saved_km: distSaved,
        distance_improvement_pct: Math.round((distSaved / origDist) * 1000) / 10,
        original_time_minutes: origMins,
        optimized_time_minutes: optMins,
        time_saved_minutes: timeSaved,
        original_fuel_consumption: origFuel,
        optimized_fuel_consumption: optFuel,
        fuel_saved_units: fuelSaved,
        original_fuel_cost: origCost,
        optimized_fuel_cost: optCost,
        fuel_cost_saved: costSaved,
        co2_saved_kg: co2Saved,
      },
      meta: {
        start_facility: { id: startFac.id, name: startFac.name, coordinates: [startFac.latitude, startFac.longitude] },
        destination_facility: { id: endFac.id, name: endFac.name, coordinates: [endFac.latitude, endFac.longitude] },
        vehicle: { id: vehicle.id, number: vehicle.vehicle_number, type: vehicle.vehicle_type, capacity_kg: vehicle.capacity_kg },
      },
    };
  }
}

export const mockStorage = new LocalStorageDB();
