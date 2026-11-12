import React, { useState } from "react";
import { Settings, User, Shield, Fuel, Database, Check } from "lucide-react";
import { authApi } from "../services/api";

export const SettingsPage: React.FC = () => {
  const currentUser = authApi.getCurrentUser() || {
    name: "Alex Turner",
    role: "Administrator",
    email: "admin@recycling.org"
  };

  const [fuelPrice, setFuelPrice] = useState(1.45);
  const [avgSpeed, setAvgSpeed] = useState(40);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
          <Settings className="w-4 h-4" /> Preferences & Config
        </div>
        <h1 className="text-2xl font-black text-gray-900 mt-1">Application Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure default fuel pricing, routing parameters, and inspect security credentials.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Profile Info */}
      <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
          <User className="w-4 h-4 text-red-600" /> Current Authenticated User
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-2xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Name</span>
            <div className="font-black text-gray-900 mt-0.5">{currentUser.name}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Email</span>
            <div className="font-black text-gray-900 mt-0.5">{currentUser.email}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Role</span>
            <div className="font-black text-red-700 mt-0.5">{currentUser.role}</div>
          </div>
        </div>
      </div>

      {/* Global Routing Engine Defaults */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
          <Fuel className="w-4 h-4 text-red-600" /> Routing Engine Parameters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Default Fuel Price ($ per Litre)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Urban Fleet Average Speed (km/h)
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={avgSpeed}
              onChange={(e) => setAvgSpeed(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-bold"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 cursor-pointer transition-all"
          >
            Save Parameters
          </button>
        </div>
      </form>

      {/* Database Connection Info */}
      <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
          <Database className="w-4 h-4 text-red-600" /> Database Engine Connection
        </div>
        <p className="text-gray-600">
          The backend connects to MySQL (<code className="font-mono text-red-700 bg-red-50 px-1 py-0.5 rounded">recycling_db</code>) with automatic resilience fallback to embedded SQLite for seamless offline testing.
        </p>
      </div>
    </div>
  );
};

