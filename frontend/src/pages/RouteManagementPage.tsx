import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Route as RouteIcon, Play, Pause, CheckCircle2, XCircle,
  Truck, Clock, Calendar, ArrowRight, Eye, Trash2,
  RefreshCw, Navigation, AlertCircle
} from "lucide-react";
import { routesApi } from "../services/api";
import { RouteRecord } from "../types";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";

export const RouteManagementPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<RouteRecord | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<RouteRecord | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const data = await routesApi.getAll(statusFilter || undefined);
      setRoutes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [statusFilter]);

  const handleStatusChange = async (routeId: number, newStatus: string) => {
    try {
      setActionInProgress(routeId);
      await routesApi.updateStatus(routeId, newStatus);
      fetchRoutes();
      if (selectedRoute && selectedRoute.id === routeId) {
        const updated = await routesApi.getById(routeId);
        setSelectedRoute(updated);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update route status");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteRoute = async () => {
    if (!deleteCandidate) return;
    try {
      await routesApi.delete(deleteCandidate.id);
      setDeleteCandidate(null);
      fetchRoutes();
    } catch (err) {
      console.error(err);
      alert("Failed to delete route");
    }
  };

  const openRouteDetails = async (id: number) => {
    try {
      const details = await routesApi.getById(id);
      setSelectedRoute(details);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <RouteIcon className="w-4 h-4" /> Operational Dispatch
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">Route Lifecycle & Fleet Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor dispatched collection routes, track driver progress, pause/resume trips, and verify collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/route-optimization"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4" /> Create & Optimize New Route
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-red-100 shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {["", "In Progress", "Planned", "Assigned", "Paused", "Completed", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-red-50 hover:text-red-600"
              }`}
            >
              {st || "All Statuses"}
            </button>
          ))}
        </div>

        <button
          onClick={fetchRoutes}
          className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
          title="Refresh Routes"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Routes List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 text-red-600 animate-spin" />
          <span>Loading dispatched routes...</span>
        </div>
      ) : routes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-red-100 text-gray-500">
          <RouteIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="font-bold text-gray-800 text-sm">No Routes Found</h3>
          <p className="text-xs text-gray-500 mt-1">There are no routes matching this status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((r) => {
            let statusColor = "bg-gray-100 text-gray-700 border-gray-200";
            if (r.status === "In Progress") statusColor = "bg-blue-50 text-blue-700 border-blue-200 animate-pulse";
            else if (r.status === "Completed") statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
            else if (r.status === "Paused") statusColor = "bg-amber-50 text-amber-700 border-amber-200";
            else if (r.status === "Cancelled") statusColor = "bg-red-50 text-red-700 border-red-200";

            return (
              <div
                key={r.id}
                className="bg-white rounded-3xl border border-red-100 p-5 shadow-xs hover:border-red-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Route Header Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-gray-900 text-base">{r.route_code}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${statusColor}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-400">• {r.optimization_algorithm}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-gray-400" />
                      <span>{r.vehicle ? r.vehicle.vehicle_number : "Unassigned Vehicle"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-800">Driver:</span>
                      <span>{r.driver ? r.driver.name : "Unassigned"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-red-700 font-bold">
                      <span>{r.stops.length} Collection Stops</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>~{r.estimated_time_minutes} mins</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Strip */}
                <div className="flex items-center gap-4 bg-gray-50/80 px-4 py-2.5 rounded-2xl text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Distance</span>
                    <div className="font-black text-gray-900">{r.total_distance_km} km</div>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Cargo</span>
                    <div className="font-black text-gray-900">{r.total_load_kg} kg</div>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Fuel Cost</span>
                    <div className="font-black text-red-700">₹{r.estimated_fuel_cost.toFixed(2)}</div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-2">
                  {r.status === "Planned" && (
                    <button
                      onClick={() => handleStatusChange(r.id, "In Progress")}
                      disabled={actionInProgress === r.id}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Route
                    </button>
                  )}

                  {r.status === "In Progress" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(r.id, "Paused")}
                        disabled={actionInProgress === r.id}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </button>
                      <button
                        onClick={() => handleStatusChange(r.id, "Completed")}
                        disabled={actionInProgress === r.id}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </button>
                    </>
                  )}

                  {r.status === "Paused" && (
                    <button
                      onClick={() => handleStatusChange(r.id, "In Progress")}
                      disabled={actionInProgress === r.id}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" /> Resume
                    </button>
                  )}

                  {r.status !== "Completed" && r.status !== "Cancelled" && (
                    <button
                      onClick={() => handleStatusChange(r.id, "Cancelled")}
                      disabled={actionInProgress === r.id}
                      className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold cursor-pointer"
                      title="Cancel Route"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => openRouteDetails(r.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="View Route Details & Stops"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteCandidate(r)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Route"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Route Details Modal */}
      <Modal
        isOpen={Boolean(selectedRoute)}
        onClose={() => setSelectedRoute(null)}
        title={`Route Details — ${selectedRoute?.route_code}`}
        maxWidth="max-w-3xl"
      >
        {selectedRoute && (
          <div className="space-y-4 text-xs">
            {/* Header Strip */}
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase">Route Sequence & Itinerary</span>
                <div className="text-lg font-black text-gray-900 mt-0.5">{selectedRoute.route_code}</div>
                <div className="text-gray-500 mt-0.5">Algorithm: {selectedRoute.optimization_algorithm}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-700">Status: {selectedRoute.status}</span>
                <div className="text-red-700 font-black text-sm mt-0.5">{selectedRoute.total_distance_km} km</div>
              </div>
            </div>

            {/* Stops Sequence */}
            <div>
              <h4 className="font-bold text-gray-900 mb-2 uppercase text-[11px] tracking-wider">
                Stops Sequence ({selectedRoute.stops.length} points)
              </h4>
              <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                {selectedRoute.stops.map((stop) => (
                  <div key={stop.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                        {stop.stop_order}
                      </span>
                      <div>
                        <div className="font-bold text-gray-900">
                          {stop.collection_point ? stop.collection_point.name : `Stop #${stop.collection_point_id}`}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {stop.collection_point?.address}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-red-700">
                        {stop.collection_point?.estimated_weight_kg} kg
                      </span>
                      <div className="text-[10px] text-gray-400 uppercase mt-0.5">{stop.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRoute(null)}
                className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold cursor-pointer hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Delete Route"
        message={`Are you sure you want to permanently remove route '${deleteCandidate?.route_code}'? Any scheduled collection points will be reset to pending.`}
        confirmText="Delete Route"
        onConfirm={handleDeleteRoute}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};

