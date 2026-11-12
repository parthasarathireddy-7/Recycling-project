import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navigation, Sparkles, Check, CheckSquare, Square,
  Truck, Building2, Fuel, Clock, ArrowRight,
  TrendingDown, AlertTriangle, ShieldCheck, RefreshCw, Send
} from "lucide-react";
import {
  routesApi, collectionPointsApi, vehiclesApi, facilitiesApi
} from "../services/api";
import {
  CollectionPoint, Vehicle, Facility, OptimizationResult, Waypoint
} from "../types";
import { MapComponent } from "../components/MapComponent";

export const RouteOptimizationPage: React.FC = () => {
  const navigate = useNavigate();

  // Master Data
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Configuration Selections
  const [startFacilityId, setStartFacilityId] = useState<number>(1);
  const [destinationFacilityId, setDestinationFacilityId] = useState<number>(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(1);
  const [selectedPointIds, setSelectedPointIds] = useState<number[]>([]);
  const [algorithm, setAlgorithm] = useState<string>("Dijkstra-TSP");
  const [fuelPrice, setFuelPrice] = useState<number>(96.50);
  const [customCapacity, setCustomCapacity] = useState<number>(0);

  // Optimization Execution State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Map display toggles
  const [showRouteA, setShowRouteA] = useState(true);
  const [showRouteB, setShowRouteB] = useState(true);

  // Load baseline options
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingInitial(true);
        const [facs, vechs, pts] = await Promise.all([
          facilitiesApi.getAll(),
          vehiclesApi.getAll(),
          collectionPointsApi.getAll()
        ]);
        setFacilities(facs);
        setVehicles(vechs);
        setCollectionPoints(pts);

        if (facs.length > 0) {
          setStartFacilityId(facs[0].id);
          setDestinationFacilityId(facs[0].id);
        }
        if (vechs.length > 0) {
          setSelectedVehicleId(vechs[0].id);
          setCustomCapacity(vechs[0].capacity_kg);
        }
        // Auto-select pending points initially (up to 6)
        const pending = pts.filter((p) => p.collection_status === "Pending").slice(0, 6);
        setSelectedPointIds(pending.map((p) => p.id));
      } catch (err) {
        console.error("Failed to load initial routing parameters", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    loadInitialData();
  }, []);

  // Update capacity if vehicle changed and custom capacity was untouched
  const handleVehicleChange = (vId: number) => {
    setSelectedVehicleId(vId);
    const v = vehicles.find((item) => item.id === vId);
    if (v) {
      setCustomCapacity(v.capacity_kg);
    }
  };

  const handleTogglePoint = (id: number) => {
    setSelectedPointIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSelectAllPending = () => {
    const pendingIds = collectionPoints
      .filter((p) => p.collection_status === "Pending" || p.collection_status === "Scheduled")
      .map((p) => p.id);
    setSelectedPointIds(pendingIds);
  };

  const handleClearSelection = () => {
    setSelectedPointIds([]);
  };

  // Selected points weight accumulator
  const totalSelectedWeight = collectionPoints
    .filter((p) => selectedPointIds.includes(p.id))
    .reduce((sum, p) => sum + p.estimated_weight_kg, 0);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const effectiveCapacity = customCapacity > 0 ? customCapacity : (selectedVehicle?.capacity_kg || 1500);
  const isOverCapacity = totalSelectedWeight > effectiveCapacity;

  // Execute Real Route Optimization via Backend API
  const handleRunOptimization = async () => {
    if (selectedPointIds.length === 0) {
      alert("Please select at least one collection point to build an optimized route.");
      return;
    }

    try {
      setIsOptimizing(true);
      setDispatchSuccess(null);
      const res = await routesApi.optimize({
        start_facility_id: startFacilityId,
        destination_facility_id: destinationFacilityId,
        collection_point_ids: selectedPointIds,
        vehicle_id: selectedVehicleId,
        algorithm: algorithm,
        fuel_price_per_litre: fuelPrice,
        max_vehicle_capacity: effectiveCapacity,
      });

      setOptimizationResult(res);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Optimization failed. Check server logs.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Save & Dispatch Route to Database
  const handleSaveAndDispatch = async () => {
    if (!optimizationResult) return;
    try {
      setIsDispatching(true);
      const opt = optimizationResult.route_b_optimized;
      const comp = optimizationResult.comparison;

      // Extract stop IDs in the optimized sequence (excluding depot markers)
      const stopIds = opt.route_sequence_ids
        .filter((id) => id.startsWith("CP_"))
        .map((id) => parseInt(id.replace("CP_", ""), 10));

      const createdRoute = await routesApi.create({
        vehicle_id: selectedVehicleId,
        driver_id: selectedVehicle?.driver_id || null,
        start_facility_id: startFacilityId,
        destination_facility_id: destinationFacilityId,
        optimization_algorithm: algorithm,
        total_distance_km: opt.total_distance_km,
        original_distance_km: comp.original_distance_km,
        distance_saved_km: comp.distance_saved_km,
        estimated_time_minutes: opt.total_time_minutes,
        fuel_consumption_litres: opt.fuel_metrics.fuel_consumption_units,
        estimated_fuel_cost: opt.fuel_metrics.estimated_fuel_cost,
        total_load_kg: opt.total_load_kg,
        status: "In Progress",
        stop_ids: stopIds,
      });

      setDispatchSuccess(`Route '${createdRoute.route_code}' has been dispatched and saved to database!`);
      // Update local points status
      setCollectionPoints((prev) =>
        prev.map((pt) =>
          stopIds.includes(pt.id) ? { ...pt, collection_status: "Scheduled" } : pt
        )
      );
    } catch (err: any) {
      console.error(err);
      alert("Failed to dispatch route: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsDispatching(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Loading optimization nodes & graph...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Navigation className="w-4 h-4" /> Core Algorithmic Engine
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">Recycling Center Route Optimizer</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Compare Dijkstra, A*, and 2-Opt heuristic shortest-paths to eliminate wasteful mileage and emissions.
          </p>
        </div>

        {optimizationResult && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAndDispatch}
              disabled={isDispatching}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {isDispatching ? "Dispatching..." : "Save & Dispatch Route"}
            </button>
          </div>
        )}
      </div>

      {/* Dispatch Success Alert */}
      {dispatchSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{dispatchSuccess}</span>
          </div>
          <button
            onClick={() => navigate("/routes")}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Go to Route Management &rarr;
          </button>
        </div>
      )}

      {/* Layout Grid: Config Sidebar + Interactive Map & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Route Setup & Parameters (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-red-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              Optimization Parameters
            </h3>
            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              {algorithm}
            </span>
          </div>

          {/* 1. Algorithm Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Shortest Path Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white"
            >
              <option value="Dijkstra-TSP">Dijkstra's Algorithm + 2-Opt TSP (Guaranteed Min Distance)</option>
              <option value="A*-TSP">A* Search Algorithm + 2-Opt TSP (Heuristic Admissible)</option>
              <option value="Nearest-Neighbor-2Opt">Nearest Neighbor Greedy Heuristic + 2-Opt</option>
            </select>
          </div>

          {/* 2. Facility Depots */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-700" /> Start Facility
              </label>
              <select
                value={startFacilityId}
                onChange={(e) => setStartFacilityId(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-700" /> Return Facility
              </label>
              <select
                value={destinationFacilityId}
                onChange={(e) => setDestinationFacilityId(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Vehicle Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-red-600" /> Fleet Vehicle
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => handleVehicleChange(parseInt(e.target.value))}
              className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-semibold"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} — {v.vehicle_type} ({v.capacity_kg} kg, {v.fuel_type})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Pricing & Max Capacity Overrides */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fuel Price (₹/L)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 96.50)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Max Capacity (kg)</label>
              <input
                type="number"
                step="50"
                min="100"
                value={effectiveCapacity}
                onChange={(e) => setCustomCapacity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-semibold"
              />
            </div>
          </div>

          {/* 5. Capacity Validation Warning */}
          <div
            className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
              isOverCapacity
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}
          >
            {isOverCapacity ? (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="text-[11px] leading-tight">
              <div className="font-bold">
                Load: {totalSelectedWeight} kg / {effectiveCapacity} kg
              </div>
              <div className="mt-0.5 text-gray-600">
                {isOverCapacity
                  ? `Exceeds vehicle capacity by ${roundNum(totalSelectedWeight - effectiveCapacity)} kg!`
                  : `Safe payload margin (${Math.round((totalSelectedWeight / effectiveCapacity) * 100)}% utilization)`}
              </div>
            </div>
          </div>

          {/* 6. Collection Points Multi-selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700">
                Collection Points ({selectedPointIds.length} selected)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllPending}
                  className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-[11px] text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 border border-gray-200 rounded-2xl p-2 bg-gray-50/50">
              {collectionPoints.map((cp) => {
                const isChecked = selectedPointIds.includes(cp.id);
                return (
                  <div
                    key={cp.id}
                    onClick={() => handleTogglePoint(cp.id)}
                    className="p-2 flex items-center justify-between hover:bg-white rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-red-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                      <div className="truncate text-xs">
                        <div className="font-bold text-gray-900 truncate">{cp.name}</div>
                        <div className="text-[10px] text-gray-500">{cp.material_category} • {cp.estimated_weight_kg} kg</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 shrink-0 ml-2">
                      #{cp.id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optimize Button */}
          <button
            type="button"
            onClick={handleRunOptimization}
            disabled={isOptimizing || selectedPointIds.length === 0}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-white" />
            {isOptimizing ? "Running Optimization..." : "Execute Route Optimization"}
          </button>
        </div>

        {/* Right Column: Interactive Map & Route Comparison (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Map Section */}
          <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-gray-800 flex items-center gap-2">
                <span>Interactive Route Geo-Network</span>
                {optimizationResult && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold border border-emerald-200 text-[10px]">
                    Optimized Sequence Ready
                  </span>
                )}
              </div>

              {/* Layer Toggles */}
              {optimizationResult && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-600">
                    <input
                      type="checkbox"
                      checked={showRouteA}
                      onChange={(e) => setShowRouteA(e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span>Route A (Original)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-red-700">
                    <input
                      type="checkbox"
                      checked={showRouteB}
                      onChange={(e) => setShowRouteB(e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span>Route B (Optimized)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Map Canvas */}
            <MapComponent
              facilities={facilities}
              collectionPoints={collectionPoints}
              selectedPointIds={selectedPointIds}
              onTogglePoint={handleTogglePoint}
              routeASequence={optimizationResult?.route_a_original.waypoints || []}
              routeBSequence={optimizationResult?.route_b_optimized.waypoints || []}
              showRouteA={showRouteA}
              showRouteB={showRouteB}
              height="440px"
            />
          </div>

          {/* Route Comparison Side-by-Side (Route A vs Route B) */}
          {optimizationResult && (
            <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-black text-gray-900 text-base">Route Optimization Benchmark</h3>
                  <p className="text-xs text-gray-500">
                    Calculated using {optimizationResult.algorithm} shortest-path network
                  </p>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <span>{optimizationResult.comparison.distance_improvement_pct}% Distance Reduction</span>
                </div>
              </div>

              {/* Side-by-Side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Route A: Original Route */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <span>ROUTE A (ORIGINAL INPUT)</span>
                    <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full">Unoptimized</span>
                  </div>
                  <div className="text-2xl font-black text-gray-800">
                    {optimizationResult.comparison.original_distance_km} <span className="text-xs font-semibold text-gray-500">km</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t border-gray-200">
                    <div>
                      <span className="text-[10px] text-gray-400">Est. Time</span>
                      <div className="font-bold text-gray-900">{optimizationResult.comparison.original_time_minutes} mins</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Fuel Consumption</span>
                      <div className="font-bold text-gray-900">{optimizationResult.comparison.original_fuel_consumption} L</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Fuel Cost</span>
                      <div className="font-bold text-gray-900">₹{optimizationResult.comparison.original_fuel_cost.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Total Stops</span>
                      <div className="font-bold text-gray-900">{optimizationResult.route_a_original.waypoints.length} nodes</div>
                    </div>
                  </div>
                </div>

                {/* Route B: Optimized Route */}
                <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-red-700">
                    <span>ROUTE B (OPTIMIZED ROUTE)</span>
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">
                      Recommended
                    </span>
                  </div>
                  <div className="text-2xl font-black text-red-700">
                    {optimizationResult.comparison.optimized_distance_km} <span className="text-xs font-semibold text-red-500">km</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 pt-2 border-t border-red-200">
                    <div>
                      <span className="text-[10px] text-gray-500">Est. Time</span>
                      <div className="font-bold text-gray-900">{optimizationResult.comparison.optimized_time_minutes} mins</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500">Fuel Consumption</span>
                      <div className="font-bold text-gray-900">{optimizationResult.comparison.optimized_fuel_consumption} L</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500">Fuel Cost</span>
                      <div className="font-bold text-gray-900">₹{optimizationResult.comparison.optimized_fuel_cost.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500">CO₂ Emissions</span>
                      <div className="font-bold text-emerald-700">{optimizationResult.route_b_optimized.fuel_metrics.co2_emissions_kg} kg</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exact Savings Summary Strip */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Distance Saved</span>
                  <div className="font-black text-emerald-900 text-base mt-0.5">
                    {optimizationResult.comparison.distance_saved_km} km
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Time Saved</span>
                  <div className="font-black text-emerald-900 text-base mt-0.5">
                    {optimizationResult.comparison.time_saved_minutes} mins
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Fuel Saved</span>
                  <div className="font-black text-emerald-900 text-base mt-0.5">
                    {optimizationResult.comparison.fuel_saved_units} L
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Cost Savings</span>
                  <div className="font-black text-emerald-900 text-base mt-0.5">
                    ₹{optimizationResult.comparison.fuel_cost_saved.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Turn-by-Turn Leg Sequence */}
              <div>
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">
                  Optimized Collection Sequence (Waypoint Itinerary)
                </h4>
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 text-xs">
                  {optimizationResult.route_b_optimized.legs.map((leg, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-gray-900">{leg.from_name}</span>
                          <span className="mx-1 text-gray-400">&rarr;</span>
                          <span className="font-bold text-red-700">{leg.to_name}</span>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-gray-600 flex items-center gap-3">
                        <span>{leg.distance_km} km</span>
                        <span>~{leg.estimated_time_minutes} mins</span>
                        <span className="font-bold text-gray-900">{leg.cumulative_weight_kg} kg cargo</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispatch Action */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAndDispatch}
                  disabled={isDispatching}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-red-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  {isDispatching ? "Saving to Database..." : "Save Route & Dispatch Driver"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function roundNum(n: number): number {
  return Math.round(n * 100) / 100;
}

