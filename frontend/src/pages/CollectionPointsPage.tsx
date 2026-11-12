import React, { useState, useEffect } from "react";
import {
  MapPin, Plus, Search, Filter, Edit2, Trash2, Eye,
  AlertCircle, CheckCircle2, RefreshCw, X, ArrowUpDown
} from "lucide-react";
import { collectionPointsApi, materialsApi } from "../services/api";
import { CollectionPoint, MaterialCategory } from "../types";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { MapComponent } from "../components/MapComponent";

export const CollectionPointsPage: React.FC = () => {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [materials, setMaterials] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Modals & Forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<CollectionPoint | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: 40.7580,
    longitude: -73.9855,
    contact_person: "",
    phone_number: "",
    material_category: "Plastic",
    estimated_weight_kg: 50.0,
    priority: "Medium" as "High" | "Medium" | "Low",
    collection_status: "Pending" as "Pending" | "Scheduled" | "Collected" | "Inactive",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapView, setShowMapView] = useState(false);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const [pts, mats] = await Promise.all([
        collectionPointsApi.getAll({
          search: search || undefined,
          material: materialFilter || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        }),
        materialsApi.getAll()
      ]);
      setPoints(pts);
      setMaterials(mats);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load collection points. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [materialFilter, statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPoints();
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Collection Point Name is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.contact_person.trim()) errors.contact_person = "Contact Person is required";
    if (!formData.phone_number.trim()) errors.phone_number = "Phone Number is required";
    if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = "Valid latitude between -90 and 90 is required";
    }
    if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = "Valid longitude between -180 and 180 is required";
    }
    if (Number(formData.estimated_weight_kg) <= 0) {
      errors.estimated_weight_kg = "Estimated weight must be greater than 0 kg";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      await collectionPointsApi.create(formData);
      setIsAddModalOpen(false);
      resetForm();
      fetchPoints();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create collection point");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoint || !validateForm()) return;
    try {
      setIsSubmitting(true);
      await collectionPointsApi.update(selectedPoint.id, formData);
      setIsEditModalOpen(false);
      setSelectedPoint(null);
      resetForm();
      fetchPoints();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update collection point");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await collectionPointsApi.delete(deleteCandidate.id);
      setDeleteCandidate(null);
      fetchPoints();
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete collection point");
    }
  };

  const openEditModal = (point: CollectionPoint) => {
    setSelectedPoint(point);
    setFormData({
      name: point.name,
      address: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
      contact_person: point.contact_person,
      phone_number: point.phone_number,
      material_category: point.material_category,
      estimated_weight_kg: point.estimated_weight_kg,
      priority: point.priority,
      collection_status: point.collection_status,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openViewModal = (point: CollectionPoint) => {
    setSelectedPoint(point);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      latitude: 40.7580,
      longitude: -73.9855,
      contact_person: "",
      phone_number: "",
      material_category: materials[0]?.name || "Plastic",
      estimated_weight_kg: 50.0,
      priority: "Medium",
      collection_status: "Pending",
    });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <MapPin className="w-4 h-4" /> Collection Infrastructure
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">Collection Points Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor, register, and update geographic accumulation hubs and waste capacities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMapView(!showMapView)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              showMapView
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {showMapView ? "Hide Map View" : "Show Map View"}
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Collection Point
          </button>
        </div>
      </div>

      {/* Embedded Map Toggle */}
      {showMapView && (
        <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-xs">
          <div className="mb-2 text-xs font-bold text-gray-700">Geographic Distribution of Collection Points</div>
          <MapComponent
            collectionPoints={points}
            height="360px"
          />
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, address, or contact person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Material Category Filter */}
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold focus:outline-none focus:border-red-500"
          >
            <option value="">All Material Categories</option>
            {materials.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>

          {/* Collection Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold focus:outline-none focus:border-red-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Collected">Collected</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold focus:outline-none focus:border-red-500"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Clear Filters */}
          {(search || materialFilter || statusFilter || priorityFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setMaterialFilter("");
                setStatusFilter("");
                setPriorityFilter("");
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
              title="Reset Filters"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Collection Points Table */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-red-600 animate-spin" />
            <span>Fetching collection points from database...</span>
          </div>
        ) : points.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="font-bold text-gray-800 text-sm">No Collection Points Found</h4>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search criteria or add a new collection point.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-red-100 bg-red-50/40 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Name & Address</th>
                  <th className="py-3.5 px-4">Coordinates</th>
                  <th className="py-3.5 px-4">Material</th>
                  <th className="py-3.5 px-4">Est. Weight</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {points.map((pt) => {
                  let statusBadge = "bg-red-50 text-red-700 border-red-200";
                  if (pt.collection_status === "Collected") statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  else if (pt.collection_status === "Scheduled") statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
                  else if (pt.collection_status === "Inactive") statusBadge = "bg-gray-100 text-gray-600 border-gray-200";

                  let priorityBadge = "text-gray-600";
                  if (pt.priority === "High") priorityBadge = "text-red-700 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full";
                  else if (pt.priority === "Medium") priorityBadge = "text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full";
                  else priorityBadge = "text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full";

                  return (
                    <tr key={pt.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-500">#{pt.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{pt.name}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-xs">{pt.address}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                        {pt.latitude.toFixed(4)}, {pt.longitude.toFixed(4)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800">{pt.material_category}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-red-700">
                        {pt.estimated_weight_kg} kg
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] uppercase tracking-wider inline-block ${priorityBadge}`}>
                          {pt.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${statusBadge}`}>
                          {pt.collection_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-gray-900 font-semibold">{pt.contact_person}</div>
                        <div className="text-[11px] text-gray-500">{pt.phone_number}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openViewModal(pt)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(pt)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(pt)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Collection Point Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Collection Point"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Collection Point Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Grand Central Terminal Drop-off"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2 text-xs border rounded-xl focus:outline-none focus:border-red-500 ${
                formErrors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
              }`}
            />
            {formErrors.name && <span className="text-[10px] text-red-600 font-semibold">{formErrors.name}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Street Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. 89 E 42nd St, New York, NY 10017"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`w-full px-3.5 py-2 text-xs border rounded-xl focus:outline-none focus:border-red-500 ${
                formErrors.address ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
              }`}
            />
            {formErrors.address && <span className="text-[10px] text-red-600 font-semibold">{formErrors.address}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Latitude *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Longitude *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                placeholder="Manager / On-site Contact"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+1-555-0199"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Material Category</label>
              <select
                value={formData.material_category}
                onChange={(e) => setFormData({ ...formData, material_category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Est. Weight (kg) *</label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={formData.estimated_weight_kg}
                onChange={(e) => setFormData({ ...formData, estimated_weight_kg: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Collection Point"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Collection Point Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Collection Point #${selectedPoint?.id}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Collection Point Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Street Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                required
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Material</label>
              <select
                value={formData.material_category}
                onChange={(e) => setFormData({ ...formData, material_category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={formData.estimated_weight_kg}
                onChange={(e) => setFormData({ ...formData, estimated_weight_kg: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Collection Status</label>
            <select
              value={formData.collection_status}
              onChange={(e) => setFormData({ ...formData, collection_status: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-red-500"
            >
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Collected">Collected</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 cursor-pointer"
            >
              {isSubmitting ? "Updating..." : "Update Details"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Collection Point Detailed Overview"
      >
        {selectedPoint && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Point #{selectedPoint.id}</span>
              <h3 className="text-lg font-black text-gray-900 mt-0.5">{selectedPoint.name}</h3>
              <p className="text-gray-600 mt-1">{selectedPoint.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 font-semibold">Material Category</span>
                <div className="font-bold text-gray-900 text-sm mt-0.5">{selectedPoint.material_category}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 font-semibold">Estimated Weight</span>
                <div className="font-bold text-red-700 text-sm mt-0.5">{selectedPoint.estimated_weight_kg} kg</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 font-semibold">Priority</span>
                <div className="font-bold text-gray-900 text-sm mt-0.5">{selectedPoint.priority}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 font-semibold">Collection Status</span>
                <div className="font-bold text-gray-900 text-sm mt-0.5">{selectedPoint.collection_status}</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">On-site Contact</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div><strong>Contact:</strong> {selectedPoint.contact_person}</div>
                <div><strong>Phone:</strong> {selectedPoint.phone_number}</div>
                <div><strong>Latitude:</strong> {selectedPoint.latitude}</div>
                <div><strong>Longitude:</strong> {selectedPoint.longitude}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold cursor-pointer hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Delete Collection Point"
        message={`Are you sure you want to permanently remove '${deleteCandidate?.name}'? Any associated scheduled route stops will be impacted.`}
        confirmText="Delete Point"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};

