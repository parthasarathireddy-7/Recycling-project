import React, { useState, useEffect } from "react";
import {
  Fuel, Calculator, Leaf, TrendingDown,
  RefreshCw, Sliders, ArrowRight
} from "lucide-react";
import { fuelApi } from "../services/api";

export const FuelCalculatorPage: React.FC = () => {
  // Input Parameters
  const [distanceKm, setDistanceKm] = useState<number>(45.0);
  const [mileageKmPerL, setMileageKmPerL] = useState<number>(10.0);
  const [fuelPrice, setFuelPrice] = useState<number>(96.50);
  const [fuelType, setFuelType] = useState<string>("Diesel");

  // Comparison Inputs
  const [originalDist, setOriginalDist] = useState<number>(65.0);
  const [optimizedDist, setOptimizedDist] = useState<number>(45.0);

  // Results
  const [tripResult, setTripResult] = useState<any>(null);
  const [savingsResult, setSavingsResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateCosts = async () => {
    try {
      setIsCalculating(true);
      const [trip, savings] = await Promise.all([
        fuelApi.calculate({
          distance_km: distanceKm,
          fuel_efficiency_km_l: mileageKmPerL,
          fuel_price_per_litre: fuelPrice,
          fuel_type: fuelType,
        }),
        fuelApi.compare({
          original_distance_km: originalDist,
          optimized_distance_km: optimizedDist,
          fuel_efficiency_km_l: mileageKmPerL,
          fuel_price_per_litre: fuelPrice,
          fuel_type: fuelType,
        })
      ]);
      setTripResult(trip);
      setSavingsResult(savings);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    calculateCosts();
  }, [distanceKm, mileageKmPerL, fuelPrice, fuelType, originalDist, optimizedDist]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
          <Fuel className="w-4 h-4" /> Operational Efficiency
        </div>
        <h1 className="text-2xl font-black text-gray-900 mt-1">Fuel & Transportation Cost Calculator</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Simulate logistics expenditures, cost per kilometer, fuel consumption, and monetary ROI from route optimization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-red-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-600" /> Dynamic Trip Parameters
            </h3>
            <button
              onClick={calculateCosts}
              className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? "animate-spin" : ""}`} /> Recalculate
            </button>
          </div>

          {/* Distance Input & Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
              <span>Total Travel Distance</span>
              <span className="text-red-700 font-black">{distanceKm} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="250"
              step="1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
              />
              <span className="text-[11px] text-gray-500">kilometers</span>
            </div>
          </div>

          {/* Vehicle Efficiency Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
              <span>Vehicle Mileage (Efficiency)</span>
              <span className="text-red-700 font-black">{mileageKmPerL} km/l</span>
            </div>
            <input
              type="range"
              min="3"
              max="35"
              step="0.5"
              value={mileageKmPerL}
              onChange={(e) => setMileageKmPerL(parseFloat(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="0.1"
                value={mileageKmPerL}
                onChange={(e) => setMileageKmPerL(parseFloat(e.target.value) || 10)}
                className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
              />
              <span className="text-[11px] text-gray-500">km per litre / unit</span>
            </div>
          </div>

          {/* Fuel Price Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Fuel Price Per Litre / Unit (₹)</label>
            <div className="relative">
              <span className="font-bold text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-sm">₹</span>
              <input
                type="number"
                step="0.5"
                min="1"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 96.50)}
                className="w-full pl-9 pr-3.5 py-2 text-xs font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Fuel Type Modality */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Fuel Modality</label>
            <div className="grid grid-cols-2 gap-2">
              {["Diesel", "Petrol", "Electric", "CNG"].map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setFuelType(ft)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    fuelType === ft
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output: Real-time Output & Savings Benchmark (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Output Cards */}
          {tripResult && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Estimated Fuel Consumption</span>
                <div className="text-3xl font-black text-gray-900 mt-1">
                  {tripResult.fuel_consumption_units} <span className="text-sm font-semibold text-gray-500">L</span>
                </div>
                <div className="mt-2 text-[11px] text-gray-500 font-medium">
                  At {tripResult.fuel_efficiency_km_unit} km/L efficiency
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Estimated Fuel Cost</span>
                <div className="text-3xl font-black text-red-700 mt-1">
                  ₹{tripResult.estimated_fuel_cost.toFixed(2)}
                </div>
                <div className="mt-2 text-[11px] text-red-600 font-bold">
                  ₹{tripResult.cost_per_km} per kilometer
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Cost Per Kilometre</span>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  ₹{tripResult.cost_per_km}
                </div>
                <div className="mt-2 text-[11px] text-gray-500">
                  Linear operating fuel rate
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Carbon Emissions</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {tripResult.co2_emissions_kg} <span className="text-xs font-semibold">kg CO₂</span>
                </div>
                <div className="mt-2 text-[11px] text-emerald-600 font-semibold">
                  {fuelType} combustion footprint
                </div>
              </div>
            </div>
          )}

          {/* Comparative Optimization Savings Card */}
          <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-black text-gray-900 text-base">Route Optimization Savings Model</h3>
                <p className="text-xs text-gray-500">Evaluate cost reductions by shortening travel routes</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
                ROI Analysis
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">Unoptimized Distance (km)</label>
                <input
                  type="number"
                  value={originalDist}
                  onChange={(e) => setOriginalDist(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-bold mb-1">Optimized Distance (km)</label>
                <input
                  type="number"
                  value={optimizedDist}
                  onChange={(e) => setOptimizedDist(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-red-200 bg-red-50/50 rounded-xl focus:outline-none focus:border-red-500 font-bold text-red-700"
                />
              </div>
            </div>

            {savingsResult && (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Distance Saved</span>
                  <div className="font-black text-emerald-950 text-base mt-0.5">
                    {savingsResult.distance_saved_km} km
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Fuel Saved</span>
                  <div className="font-black text-emerald-950 text-base mt-0.5">
                    {savingsResult.fuel_saved_units} L
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Rupee Savings</span>
                  <div className="font-black text-emerald-950 text-base mt-0.5">
                    ₹{savingsResult.cost_saved.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Improvement</span>
                  <div className="font-black text-emerald-950 text-base mt-0.5">
                    {savingsResult.improvement_percentage}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

