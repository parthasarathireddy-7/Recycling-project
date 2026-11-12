import React, { useState, useEffect } from "react";
import {
  BarChart3, Download, Printer, Filter, Calendar,
  Layers, Truck, TrendingDown, RefreshCw, FileText
} from "lucide-react";
import { reportsApi, vehiclesApi, materialsApi } from "../services/api";
import { Vehicle, MaterialCategory } from "../types";

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<string>("daily");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [vehicleFilter, setVehicleFilter] = useState<number | undefined>(undefined);

  const [summaryData, setSummaryData] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [materials, setMaterials] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const [summary, vList, mList] = await Promise.all([
        reportsApi.getSummary({
          report_type: reportType,
          category: categoryFilter || undefined,
          vehicle_id: vehicleFilter
        }),
        vehiclesApi.getAll(),
        materialsApi.getAll()
      ]);
      setSummaryData(summary);
      setVehicles(vList);
      setMaterials(mList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, categoryFilter, vehicleFilter]);

  const handleExportCsv = () => {
    const url = reportsApi.getExportCsvUrl(vehicleFilter, undefined);
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-red-100 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" /> Operational Audits
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">Reports & Analytics Center</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Generate verifiable logistics audits, fuel consumption records, and export CSV/PDF reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-600" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Report / PDF
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs (Hidden on Print) */}
      <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-xs space-y-3 print:hidden">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span>Select Report Type</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "daily", label: "Daily Collection Report" },
            { id: "weekly", label: "Weekly Collection Report" },
            { id: "monthly", label: "Monthly Recycling Report" },
            { id: "vehicle", label: "Vehicle Performance Report" },
            { id: "fuel", label: "Fuel Consumption Report" },
            { id: "optimization", label: "Route Optimization Report" },
            { id: "cost", label: "Cost Savings Report" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${reportType === r.id
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-600">Material Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="">All Categories</option>
              {materials.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-600">Vehicle Filter:</span>
            <select
              value={vehicleFilter || ""}
              onChange={(e) => setVehicleFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.vehicle_number} ({v.vehicle_type})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs space-y-6 print:border-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="text-xs font-bold text-red-600 uppercase tracking-wider">OFFICIAL AUDIT REPORT</div>
            <h2 className="text-xl font-black text-gray-900 capitalize mt-0.5">{reportType} Logistics Summary</h2>
            <p className="text-xs text-gray-500">Recycling Center Fleet & Route Optimization System</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div><strong>Generated:</strong> {new Date().toLocaleDateString()}</div>
            <div><strong>Status:</strong> Active Operations</div>
          </div>
        </div>

        {/* Aggregate Summary Cards */}
        {summaryData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Total Routes</span>
              <div className="text-xl font-black text-gray-900 mt-0.5">{summaryData.aggregate.total_routes}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Total Distance</span>
              <div className="text-xl font-black text-gray-900 mt-0.5">{summaryData.aggregate.total_distance_km} km</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Distance Saved</span>
              <div className="text-xl font-black text-emerald-700 mt-0.5">{summaryData.aggregate.total_distance_saved_km} km</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Estimated Cost Savings</span>
              <div className="text-xl font-black text-emerald-700 mt-0.5">₹{summaryData.aggregate.estimated_cost_savings.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] bg-red-50/40">
                <th className="py-3 px-3">Route Code</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Driver</th>
                <th className="py-3 px-3">Algorithm</th>
                <th className="py-3 px-3">Distance (km)</th>
                <th className="py-3 px-3">Fuel (L)</th>
                <th className="py-3 px-3">Fuel Cost</th>
                <th className="py-3 px-3">Cargo (kg)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaryData?.records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 font-mono font-bold text-gray-900">{r.route_code}</td>
                  <td className="py-3 px-3 text-gray-700">{r.vehicle}</td>
                  <td className="py-3 px-3 text-gray-700">{r.driver}</td>
                  <td className="py-3 px-3 text-gray-600 font-semibold">{r.algorithm}</td>
                  <td className="py-3 px-3 font-bold text-gray-900">{r.distance_km}</td>
                  <td className="py-3 px-3 text-gray-700">{r.fuel_litres}</td>
                  <td className="py-3 px-3 font-bold text-red-700">₹{r.fuel_cost.toFixed(2)}</td>
                  <td className="py-3 px-3 text-gray-900">{r.total_load_kg}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500">{r.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

