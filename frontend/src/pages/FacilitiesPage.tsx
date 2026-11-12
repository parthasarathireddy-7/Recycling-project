import React, { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Phone, Clock, MapPin, RefreshCw } from "lucide-react";
import { facilitiesApi } from "../services/api";
import { Facility } from "../types";
import { Modal } from "../components/Modal";
import { MapComponent } from "../components/MapComponent";

export const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: 40.7128,
    longitude: -74.0060,
    contact_person: "",
    phone_number: "",
    capacity_daily_kg: 15000.0,
    operating_hours: "08:00 AM - 06:00 PM"
  });

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await facilitiesApi.getAll();
      setFacilities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedFacility) {
        await facilitiesApi.update(selectedFacility.id, form);
      } else {
        await facilitiesApi.create(form);
      }
      setIsModalOpen(false);
      setSelectedFacility(null);
      fetchFacilities();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save facility");
    }
  };

  const openEdit = (f: Facility) => {
    setSelectedFacility(f);
    setForm({
      name: f.name,
      address: f.address,
      latitude: f.latitude,
      longitude: f.longitude,
      contact_person: f.contact_person || "",
      phone_number: f.phone_number || "",
      capacity_daily_kg: f.capacity_daily_kg,
      operating_hours: f.operating_hours
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Building2 className="w-4 h-4" /> Destination Infrastructure
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">Central Recycling Facilities</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Depot hubs where collection routes initiate, terminate, and deposit segregated materials.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedFacility(null);
            setForm({
              name: "",
              address: "",
              latitude: 40.7128,
              longitude: -74.0060,
              contact_person: "",
              phone_number: "",
              capacity_daily_kg: 15000.0,
              operating_hours: "08:00 AM - 06:00 PM"
            });
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Facility
        </button>
      </div>

      {/* Map Preview */}
      <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-xs">
        <div className="mb-2 text-xs font-bold text-gray-700">Hub Locations on Network</div>
        <MapComponent facilities={facilities} height="320px" />
      </div>

      {/* Facility Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {facilities.map((fac) => (
          <div
            key={fac.id}
            className="bg-white rounded-3xl border border-red-100 p-6 shadow-xs hover:border-red-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  FACILITY #{fac.id}
                </span>
                <button
                  onClick={() => openEdit(fac)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Edit Facility"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-black text-gray-900 mt-2">{fac.name}</h3>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>{fac.address}</span>
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Processing Capacity</span>
                  <div className="font-black text-gray-900 text-sm mt-0.5">{fac.capacity_daily_kg.toLocaleString()} kg/day</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Operating Window</span>
                  <div className="font-black text-gray-900 text-xs mt-0.5">{fac.operating_hours}</div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold">Contact</span>
                  <div className="font-bold text-gray-900">{fac.contact_person || "Facility Lead"}</div>
                </div>
                <div className="text-right text-gray-600 font-mono text-[11px]">
                  {fac.phone_number || "+1-555-0100"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFacility ? `Edit ${selectedFacility.name}` : "Add Recycling Facility"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Facility Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Daily Capacity (kg)</label>
              <input
                type="number"
                step="500"
                required
                value={form.capacity_daily_kg}
                onChange={(e) => setForm({ ...form, capacity_daily_kg: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Operating Hours</label>
              <input
                type="text"
                value={form.operating_hours}
                onChange={(e) => setForm({ ...form, operating_hours: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={form.contact_person}
                onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 cursor-pointer"
            >
              Save Facility
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

