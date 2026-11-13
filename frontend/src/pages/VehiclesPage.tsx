import React, { useState, useEffect } from "react";
import {
  Truck, Plus, Edit2, Trash2, UserPlus, Fuel, ShieldAlert,
  CheckCircle, Clock, AlertTriangle, RefreshCw, X
} from "lucide-react";
import { vehiclesApi } from "../services/api";
import { Vehicle, Driver } from "../types";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isEditVehicleOpen, setIsEditVehicleOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Vehicle | null>(null);

  // Vehicle Form State
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_number: "",
    vehicle_type: "Medium Truck" as "Light Van" | "Medium Truck" | "Heavy Compactor" | "Electric Van",
    driver_id: null as number | null,
    capacity_kg: 2000.0,
    fuel_type: "Diesel" as "Diesel" | "Petrol" | "Electric" | "CNG",
    fuel_efficiency_km_l: 10.0,
    current_location: "Central Depot Yard",
    availability: "Available" as "Available" | "On Route" | "Maintenance",
  });

  // Driver Form State
  const [driverForm, setDriverForm] = useState({
    name: "",
    license_number: "",
    phone_number: "",
    status: "Active" as "Active" | "On Leave" | "Busy",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFleetData = async () => {
    try {
      setLoading(true);
      const [vList, dList] = await Promise.all([
        vehiclesApi.getAll(),
        vehiclesApi.getDrivers(),
      ]);
      setVehicles(vList);
      setDrivers(dList);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch fleet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, []);

  const validateVehicleForm = () => {
    const errors: Record<string, string> = {};
    if (!vehicleForm.vehicle_number.trim()) errors.vehicle_number = "Vehicle Number is required";
    if (Number(vehicleForm.capacity_kg) <= 0) errors.capacity_kg = "Capacity must be > 0 kg";
    if (Number(vehicleForm.fuel_efficiency_km_l) <= 0) errors.fuel_efficiency_km_l = "Fuel efficiency must be > 0";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateVehicleForm()) return;
    try {
      setIsSubmitting(true);
      await vehiclesApi.create(vehicleForm);
      setIsAddVehicleOpen(false);
      resetVehicleForm();
      fetchFleetData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !validateVehicleForm()) return;
    try {
      setIsSubmitting(true);
      await vehiclesApi.update(selectedVehicle.id, vehicleForm);
      setIsEditVehicleOpen(false);
      setSelectedVehicle(null);
      resetVehicleForm();
      fetchFleetData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicleConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await vehiclesApi.delete(deleteCandidate.id);
      setDeleteCandidate(null);
      fetchFleetData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete vehicle");
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverForm.name.trim() || !driverForm.license_number.trim() || !driverForm.phone_number.trim()) {
      alert("All driver fields are required.");
      return;
    }
    try {
      setIsSubmitting(true);
      await vehiclesApi.createDriver(driverForm);
      setIsAddDriverOpen(false);
      setDriverForm({ name: "", license_number: "", phone_number: "", status: "Active" });
      fetchFleetData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create driver");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (v: Vehicle) => {
    setSelectedVehicle(v);
    setVehicleForm({
      vehicle_number: v.vehicle_number,
      vehicle_type: v.vehicle_type,
      driver_id: v.driver_id || null,
      capacity_kg: v.capacity_kg,
      fuel_type: v.fuel_type,
      fuel_efficiency_km_l: v.fuel_efficiency_km_l,
      current_location: v.current_location,
      availability: v.availability,
    });
    setFormErrors({});
    setIsEditVehicleOpen(true);
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      vehicle_number: "",
      vehicle_type: "Medium Truck",
      driver_id: null,
      capacity_kg: 2000.0,
      fuel_type: "Diesel",
      fuel_efficiency_km_l: 10.0,
      current_location: "Central Depot Yard",
      availability: "Available",
    });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Truck className="w-4 h-4" /> Logistics Fleet
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">Vehicle & Driver Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure recycling collection trucks, capacities, fuel efficiencies, and driver assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddDriverOpen(true)}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-gray-600" /> Register Driver
          </button>
          <button
            onClick={() => {
              resetVehicleForm();
              setIsAddVehicleOpen(true);
            }}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      {error ? (
        <div className="p-6 bg-red-50 rounded-3xl border border-red-200 text-red-900 max-w-xl mx-auto my-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h3 className="font-bold text-base">Backend Connection Notice</h3>
              <p className="text-xs text-red-700 mt-1">
                {error} Ensure your FastAPI backend server is running and accessible at <code>{import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"}</code>.
              </p>
            </div>
          </div>
          <button
            onClick={fetchFleetData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 text-red-600 animate-spin" />
          <span>Loading fleet data...</span>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-red-100 text-gray-500">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="font-bold text-gray-800 text-sm">No Vehicles Registered</h3>
          <p className="text-xs text-gray-500 mt-1">Register your collection vehicles to begin route optimization.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vehicles.map((v) => {
            let availBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
            if (v.availability === "On Route") availBadge = "bg-amber-50 text-amber-700 border-amber-200";
            else if (v.availability === "Maintenance") availBadge = "bg-red-50 text-red-700 border-red-200";

            return (
              <div
                key={v.id}
                className="bg-white rounded-3xl border border-red-100 p-6 shadow-xs hover:border-red-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Number & Availability Badge */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gray-400">VEHICLE #{v.id}</span>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">{v.vehicle_number}</h3>
                    </div>
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider ${availBadge}`}>
                      {v.availability}
                    </span>
                  </div>

                  {/* Vehicle Type & Location */}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600 pb-3 border-b border-gray-100">
                    <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                      {v.vehicle_type}
                    </span>
                    <span className="text-gray-500 truncate max-w-[150px]">{v.current_location}</span>
                  </div>

                  {/* Key Stats: Capacity, Fuel Efficiency, Fuel Type */}
                  <div className="grid grid-cols-3 gap-2 py-4 text-center">
                    <div className="p-2.5 bg-gray-50 rounded-2xl">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">Capacity</span>
                      <div className="font-black text-gray-900 text-sm mt-0.5">{v.capacity_kg} <span className="text-[10px] font-normal">kg</span></div>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-2xl">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">Efficiency</span>
                      <div className="font-black text-gray-900 text-sm mt-0.5">{v.fuel_efficiency_km_l} <span className="text-[10px] font-normal">km/l</span></div>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-2xl">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">Fuel</span>
                      <div className="font-black text-gray-900 text-sm mt-0.5">{v.fuel_type}</div>
                    </div>
                  </div>

                  {/* Assigned Driver Card */}
                  <div className="mt-1 p-3 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Assigned Driver</span>
                      <div className="font-bold text-gray-900 mt-0.5">
                        {v.driver ? v.driver.name : <span className="text-gray-400 font-normal">Unassigned</span>}
                      </div>
                    </div>
                    {v.driver && (
                      <div className="text-right text-[11px] text-gray-500 font-mono">
                        {v.driver.license_number}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(v)}
                    className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(v)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        title="Add New Vehicle"
      >
        <form onSubmit={handleCreateVehicle} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle License Plate / Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. ECO-TRK-505"
              value={vehicleForm.vehicle_number}
              onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
            />
            {formErrors.vehicle_number && <span className="text-[10px] text-red-600 font-semibold">{formErrors.vehicle_number}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type *</label>
              <select
                value={vehicleForm.vehicle_type}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
              >
                <option value="Light Van">Light Van</option>
                <option value="Medium Truck">Medium Truck</option>
                <option value="Heavy Compactor">Heavy Compactor</option>
                <option value="Electric Van">Electric Van</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Max Capacity (kg) *</label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={vehicleForm.capacity_kg}
                onChange={(e) => setVehicleForm({ ...vehicleForm, capacity_kg: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fuel Type *</label>
              <select
                value={vehicleForm.fuel_type}
                onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
              >
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fuel Efficiency (km/l or km/kWh) *</label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={vehicleForm.fuel_efficiency_km_l}
                onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_efficiency_km_l: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Assign Driver</label>
            <select
              value={vehicleForm.driver_id || ""}
              onChange={(e) => setVehicleForm({ ...vehicleForm, driver_id: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
            >
              <option value="">No Driver Assigned (Unassigned)</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.license_number})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Current Base Location</label>
              <input
                type="text"
                value={vehicleForm.current_location}
                onChange={(e) => setVehicleForm({ ...vehicleForm, current_location: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Availability</label>
              <select
                value={vehicleForm.availability}
                onChange={(e) => setVehicleForm({ ...vehicleForm, availability: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
              >
                <option value="Available">Available</option>
                <option value="On Route">On Route</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddVehicleOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Add Vehicle"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        isOpen={isEditVehicleOpen}
        onClose={() => setIsEditVehicleOpen(false)}
        title={`Edit Vehicle ${selectedVehicle?.vehicle_number}`}
      >
        <form onSubmit={handleUpdateVehicle} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle License Plate / Number *</label>
            <input
              type="text"
              required
              value={vehicleForm.vehicle_number}
              onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={vehicleForm.vehicle_type}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
              >
                <option value="Light Van">Light Van</option>
                <option value="Medium Truck">Medium Truck</option>
                <option value="Heavy Compactor">Heavy Compactor</option>
                <option value="Electric Van">Electric Van</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Max Capacity (kg)</label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={vehicleForm.capacity_kg}
                onChange={(e) => setVehicleForm({ ...vehicleForm, capacity_kg: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fuel Type</label>
              <select
                value={vehicleForm.fuel_type}
                onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
              >
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fuel Efficiency (km/l)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={vehicleForm.fuel_efficiency_km_l}
                onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_efficiency_km_l: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Assign Driver</label>
            <select
              value={vehicleForm.driver_id || ""}
              onChange={(e) => setVehicleForm({ ...vehicleForm, driver_id: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
            >
              <option value="">No Driver Assigned (Unassigned)</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.license_number})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Current Base Location</label>
              <input
                type="text"
                value={vehicleForm.current_location}
                onChange={(e) => setVehicleForm({ ...vehicleForm, current_location: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Availability</label>
              <select
                value={vehicleForm.availability}
                onChange={(e) => setVehicleForm({ ...vehicleForm, availability: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
              >
                <option value="Available">Available</option>
                <option value="On Route">On Route</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditVehicleOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 cursor-pointer"
            >
              {isSubmitting ? "Updating..." : "Update Vehicle"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Driver Modal */}
      <Modal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        title="Register New Driver"
      >
        <form onSubmit={handleCreateDriver} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Driver Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Marcus Reed"
              value={driverForm.name}
              onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">License Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. DL-NY-90218"
              value={driverForm.license_number}
              onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone Number *</label>
            <input
              type="text"
              required
              placeholder="+1-555-0321"
              value={driverForm.phone_number}
              onChange={(e) => setDriverForm({ ...driverForm, phone_number: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddDriverOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 cursor-pointer"
            >
              Register Driver
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Delete Vehicle"
        message={`Are you sure you want to remove '${deleteCandidate?.vehicle_number}' from the recycling fleet?`}
        confirmText="Delete Vehicle"
        onConfirm={handleDeleteVehicleConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};

