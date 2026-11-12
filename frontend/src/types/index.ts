export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "Administrator" | "Manager" | "Collection Staff";
  is_active: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: "Administrator" | "Manager" | "Collection Staff";
  user_name: string;
  user_email: string;
}

export interface Facility {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_person?: string;
  phone_number?: string;
  capacity_daily_kg: number;
  operating_hours: string;
}

export interface Driver {
  id: number;
  name: string;
  license_number: string;
  phone_number: string;
  status: "Active" | "On Leave" | "Busy";
}

export interface Vehicle {
  id: number;
  vehicle_number: string;
  vehicle_type: "Light Van" | "Medium Truck" | "Heavy Compactor" | "Electric Van";
  driver_id?: number | null;
  capacity_kg: number;
  fuel_type: "Diesel" | "Petrol" | "Electric" | "CNG";
  fuel_efficiency_km_l: number;
  current_location: string;
  availability: "Available" | "On Route" | "Maintenance";
  driver?: Driver;
}

export interface MaterialCategory {
  id: number;
  name: string;
  description?: string;
  unit_price_per_kg: number;
  current_stock_kg: number;
  carbon_offset_per_kg: number;
}

export interface CollectionPoint {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_person: string;
  phone_number: string;
  material_category: string;
  estimated_weight_kg: number;
  priority: "High" | "Medium" | "Low";
  collection_status: "Pending" | "Scheduled" | "Collected" | "Inactive";
  created_at?: string;
  updated_at?: string;
}

export interface Waypoint {
  node_id: string;
  name: string;
  latitude: number;
  longitude: number;
  node_type: "facility" | "point";
  weight_kg: number;
}

export interface RouteLeg {
  from_node_id: string;
  from_name: string;
  to_node_id: string;
  to_name: string;
  distance_km: number;
  estimated_time_minutes: number;
  cumulative_weight_kg: number;
  target_latitude: number;
  target_longitude: number;
}

export interface FuelMetrics {
  distance_km: number;
  fuel_type: string;
  fuel_efficiency_km_unit: number;
  fuel_price_per_unit: number;
  fuel_consumption_units: number;
  estimated_fuel_cost: number;
  cost_per_km: number;
  co2_emissions_kg: number;
}

export interface RouteDetails {
  route_sequence_ids: string[];
  waypoints: Waypoint[];
  legs: RouteLeg[];
  total_distance_km: number;
  total_time_minutes: number;
  total_load_kg: number;
  fuel_metrics: FuelMetrics;
}

export interface OptimizationResult {
  algorithm: string;
  capacity_validation: {
    vehicle_capacity_kg: number;
    total_load_kg: number;
    capacity_utilization_pct: number;
    capacity_exceeded: boolean;
    warning_message: string;
  };
  route_a_original: RouteDetails;
  route_b_optimized: RouteDetails;
  comparison: {
    original_distance_km: number;
    optimized_distance_km: number;
    distance_saved_km: number;
    distance_improvement_pct: number;
    original_time_minutes: number;
    optimized_time_minutes: number;
    time_saved_minutes: number;
    original_fuel_consumption: number;
    optimized_fuel_consumption: number;
    fuel_saved_units: number;
    original_fuel_cost: number;
    optimized_fuel_cost: number;
    fuel_cost_saved: number;
    co2_saved_kg: number;
  };
  meta: {
    start_facility: { id: number; name: string; coordinates: [number, number] };
    destination_facility: { id: number; name: string; coordinates: [number, number] };
    vehicle: { id: number; number: string; type: string; capacity_kg: number };
  };
}

export interface RouteStop {
  id: number;
  stop_order: number;
  collection_point_id: number;
  planned_arrival_time?: string;
  status: "Pending" | "Arrived" | "Collected" | "Skipped";
  weight_collected_kg: number;
  notes?: string;
  collection_point?: CollectionPoint;
}

export interface RouteRecord {
  id: number;
  route_code: string;
  vehicle_id?: number | null;
  driver_id?: number | null;
  start_facility_id: number;
  destination_facility_id: number;
  optimization_algorithm: string;
  total_distance_km: number;
  original_distance_km: number;
  distance_saved_km: number;
  estimated_time_minutes: number;
  fuel_consumption_litres: number;
  estimated_fuel_cost: number;
  total_load_kg: number;
  status: "Planned" | "Assigned" | "In Progress" | "Paused" | "Completed" | "Cancelled";
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  vehicle?: Vehicle;
  driver?: Driver;
  start_facility?: Facility;
  destination_facility?: Facility;
  stops: RouteStop[];
}

export interface DashboardMetrics {
  total_collection_points: number;
  total_vehicles: number;
  total_recyclable_materials_kg: number;
  total_distance_covered_km: number;
  total_distance_saved_km: number;
  total_fuel_consumption_litres: number;
  total_fuel_cost: number;
  active_routes: number;
  completed_collections: number;
  completed_routes: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  charts: {
    daily_collection_stats: Array<{ date: string; weight_kg: number; trips: number }>;
    monthly_recycling_stats: Array<{
      month: string;
      plastic: number;
      paper: number;
      glass: number;
      metal: number;
      ewaste: number;
      organic: number;
    }>;
    vehicle_utilization: Array<{
      vehicle_number: string;
      vehicle_type: string;
      capacity_kg: number;
      active_load_kg: number;
      utilization_pct: number;
      availability: string;
      fuel_type: string;
    }>;
    fuel_consumption_comparison: Array<{
      route_code: string;
      original_fuel_litres: number;
      optimized_fuel_litres: number;
      fuel_saved_litres: number;
      distance_km: number;
    }>;
    material_distribution: Array<{
      name: string;
      weight_kg: number;
      unit_price: number;
      valuation: number;
      carbon_offset_kg: number;
    }>;
  };
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: "route" | "capacity" | "collection" | "vehicle" | "optimization" | "system";
  is_read: boolean;
  created_at?: string;
}

