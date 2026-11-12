import React, { useState, useEffect } from "react";
import {
  Layers, Plus, Edit2, Trash2, Leaf,
  TrendingUp, RefreshCw, X
} from "lucide-react";
import { materialsApi } from "../services/api";
import { MaterialCategory } from "../types";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";

export const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialCategory | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MaterialCategory | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    unit_price_per_kg: 0.50,
    current_stock_kg: 0.0,
    carbon_offset_per_kg: 1.2,
  });

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialsApi.getAll();
      setMaterials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await materialsApi.create(form);
      setIsAddModalOpen(false);
      setForm({ name: "", description: "", unit_price_per_kg: 0.50, current_stock_kg: 0.0, carbon_offset_per_kg: 1.2 });
      fetchMaterials();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create material");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || !form.name.trim()) return;
    try {
      await materialsApi.update(selectedMaterial.id, form);
      setIsEditModalOpen(false);
      setSelectedMaterial(null);
      fetchMaterials();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update material");
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await materialsApi.delete(deleteCandidate.id);
      setDeleteCandidate(null);
      fetchMaterials();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  const openEdit = (m: MaterialCategory) => {
    setSelectedMaterial(m);
    setForm({
      name: m.name,
      description: m.description || "",
      unit_price_per_kg: m.unit_price_per_kg,
      current_stock_kg: m.current_stock_kg,
      carbon_offset_per_kg: m.carbon_offset_per_kg,
    });
    setIsEditModalOpen(true);
  };

  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalStockKg = materials.reduce((acc, m) => acc + m.current_stock_kg, 0);
  const totalValuation = materials.reduce((acc, m) => acc + m.current_stock_kg * m.unit_price_per_kg, 0);
  const totalCarbonOffsetKg = materials.reduce((acc, m) => acc + m.current_stock_kg * m.carbon_offset_per_kg, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Layers className="w-4 h-4" /> Recyclable Inventory
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">Material Category Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track categorized recyclable material volumes, economic valuation, and environmental carbon offsets.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ name: "", description: "", unit_price_per_kg: 0.50, current_stock_kg: 0.0, carbon_offset_per_kg: 1.2 });
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Collected Stock</span>
            <Layers className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-3 text-2xl font-black text-gray-900">
            {totalStockKg.toLocaleString()} <span className="text-xs font-normal text-gray-500">kg</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Across {materials.length} classifications</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Estimated Market Value</span>
            <span className="text-emerald-600 font-bold text-sm">₹</span>
          </div>
          <div className="mt-3 text-2xl font-black text-gray-900">
            ₹{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Commodity value of stored stock</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Carbon Offset</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700">
            {totalCarbonOffsetKg.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs font-normal">kg CO₂</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Emissions prevented by recycling</div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.map((m) => {
          const categoryValuation = m.current_stock_kg * m.unit_price_per_kg;
          const categoryCo2 = m.current_stock_kg * m.carbon_offset_per_kg;

          return (
            <div
              key={m.id}
              className="bg-white rounded-3xl border border-red-100 p-6 shadow-xs hover:border-red-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600"></span>
                    <h3 className="text-lg font-black text-gray-900">{m.name}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100">
                    ₹{m.unit_price_per_kg.toFixed(2)}/kg
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-2 min-h-[36px] line-clamp-2">
                  {m.description || "Standard segregated recyclable materials stream."}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Stock Volume</span>
                    <div className="font-black text-gray-900 text-sm mt-0.5">{m.current_stock_kg.toLocaleString()} kg</div>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Value</span>
                    <div className="font-black text-gray-900 text-sm mt-0.5">₹{categoryValuation.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center justify-between">
                  <span>Carbon Offset Factor:</span>
                  <span className="font-bold">{m.carbon_offset_per_kg} kg CO₂ / kg</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEdit(m)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteCandidate(m)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? `Edit ${selectedMaterial?.name}` : "Add Material Category"}
      >
        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description / Types</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Unit Price (₹/kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.unit_price_per_kg}
                onChange={(e) => setForm({ ...form, unit_price_per_kg: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Stock (kg)</label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={form.current_stock_kg}
                onChange={(e) => setForm({ ...form, current_stock_kg: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">CO₂ Factor</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={form.carbon_offset_per_kg}
                onChange={(e) => setForm({ ...form, carbon_offset_per_kg: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/20 cursor-pointer"
            >
              {isEditModalOpen ? "Update Details" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Delete Material Category"
        message={`Are you sure you want to delete category '${deleteCandidate?.name}'?`}
        confirmText="Delete Category"
        onConfirm={handleDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};

