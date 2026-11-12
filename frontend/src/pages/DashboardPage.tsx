import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Truck, Layers, Navigation, Fuel,
  TrendingDown, CheckCircle, Clock, ArrowRight,
  Sparkles, RefreshCw, AlertTriangle
} from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { dashboardApi } from "../services/api";
import { DashboardData } from "../types";

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getStats();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard metrics from backend. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Loading live recycling operations data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-red-900 max-w-xl mx-auto my-12">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <h3 className="font-bold text-base">Backend Connection Notice</h3>
            <p className="text-xs text-red-700 mt-1">{error || "Could not retrieve statistics."}</p>
          </div>
        </div>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, charts } = data;

  // Red theme shades for charts
  const RED_PALETTE = ["#DC2626", "#EF4444", "#F87171", "#B91C1C", "#991B1B", "#7F1D1D"];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-red-600 via-red-700 to-red-800 p-6 rounded-3xl text-white shadow-xl shadow-red-600/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
              Live Operations
            </span>
            <span className="text-xs text-red-100">• Algorithmic Dispatch Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Recycling Route Optimizer</h1>
          <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time Dijkstra and A* multi-stop routing engine minimizing mileage, fuel expenditure, and carbon emissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
          >
            <RefreshCw className="w-4 h-4" /> Sync Metrics
          </button>
          <Link
            to="/route-optimization"
            className="px-5 py-2.5 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-red-600" /> Optimize Route
          </Link>
        </div>
      </div>

      {/* 8 Primary Admin Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Collection Points */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Collection Points</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-gray-900">{metrics.total_collection_points}</div>
            <Link to="/collection-points" className="text-[11px] font-bold text-red-600 hover:underline flex items-center">
              View <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Accumulation hubs in grid</div>
        </div>

        {/* Metric 2: Total Vehicles */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Fleet Vehicles</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-gray-900">{metrics.total_vehicles}</div>
            <Link to="/vehicles" className="text-[11px] font-bold text-red-600 hover:underline flex items-center">
              Fleet <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Active collection units</div>
        </div>

        {/* Metric 3: Total Recyclables Weight */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Recyclables Stock</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-gray-900">{metrics.total_recyclable_materials_kg.toLocaleString()}</div>
            <span className="text-xs font-bold text-gray-500">kg</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Current warehouse inventory</div>
        </div>

        {/* Metric 4: Total Distance Covered */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Distance Covered</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-gray-900">{metrics.total_distance_covered_km}</div>
            <span className="text-xs font-bold text-gray-500">km</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Saved {metrics.total_distance_saved_km} km
          </div>
        </div>

        {/* Metric 5: Fuel Consumption */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Fuel Consumed</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-gray-900">{metrics.total_fuel_consumption_litres}</div>
            <span className="text-xs font-bold text-gray-500">Litres</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Across dispatched tours</div>
        </div>

        {/* Metric 6: Estimated Fuel Cost */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Fuel Expenditure</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <span className="text-base font-black">₹</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-gray-900">₹{metrics.total_fuel_cost.toFixed(2)}</div>
            <Link to="/fuel-calculator" className="text-[11px] font-bold text-red-600 hover:underline">
              Calculate
            </Link>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Calculated with live fuel rates</div>
        </div>

        {/* Metric 7: Active Routes */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Routes</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-amber-600">{metrics.active_routes}</div>
            <Link to="/routes" className="text-[11px] font-bold text-red-600 hover:underline">
              Manage
            </Link>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">In progress or planned</div>
        </div>

        {/* Metric 8: Completed Collections */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Completed Collections</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-emerald-600">{metrics.completed_collections}</div>
            <span className="text-xs font-bold text-emerald-700">Finished</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">{metrics.completed_routes} total route runs</div>
        </div>
      </div>

      {/* Row 1 Charts: Daily Collection Trends & Material Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Collection Statistics */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Daily Collection Statistics</h3>
              <p className="text-xs text-gray-500">Total kilograms collected per operational day</p>
            </div>
            <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100">
              7-Day Rolling Trend
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.daily_collection_stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} unit=" kg" />
                <Tooltip
                  formatter={(val: any) => [`${val} kg`, "Collected Weight"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #FCA5A5", fontSize: "12px" }}
                />
                <Bar dataKey="weight_kg" fill="#DC2626" radius={[6, 6, 0, 0]} name="Weight (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Category Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Material Category Breakdown</h3>
              <p className="text-xs text-gray-500">Distribution of recyclable stock</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.material_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="weight_kg"
                  nameKey="name"
                >
                  {charts.material_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RED_PALETTE[index % RED_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} kg`, name]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #FCA5A5", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 text-xs">
            {charts.material_distribution.slice(0, 4).map((m, idx) => (
              <div key={m.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RED_PALETTE[idx % RED_PALETTE.length] }} />
                <span className="text-gray-700 font-medium truncate">{m.name}:</span>
                <span className="font-bold text-gray-900">{m.weight_kg} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Monthly Recycling Stats & Vehicle Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Recycling Statistics */}
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Monthly Recycling Volume (kg)</h3>
              <p className="text-xs text-gray-500">Cumulative throughput across categories</p>
            </div>
            <span className="text-xs font-bold text-red-600">6 Months</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthly_recycling_stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #FCA5A5", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="paper" stackId="1" stroke="#991B1B" fill="#991B1B" fillOpacity={0.8} name="Paper" />
                <Area type="monotone" dataKey="plastic" stackId="1" stroke="#DC2626" fill="#DC2626" fillOpacity={0.8} name="Plastic" />
                <Area type="monotone" dataKey="organic" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.7} name="Organic" />
                <Area type="monotone" dataKey="metal" stackId="1" stroke="#F87171" fill="#F87171" fillOpacity={0.7} name="Metal" />
                <Area type="monotone" dataKey="glass" stackId="1" stroke="#FCA5A5" fill="#FCA5A5" fillOpacity={0.6} name="Glass" />
                <Area type="monotone" dataKey="ewaste" stackId="1" stroke="#FECACA" fill="#FECACA" fillOpacity={0.6} name="E-waste" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Utilization & Fuel Savings */}
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Fuel Consumption Comparison</h3>
              <p className="text-xs text-gray-500">Unoptimized (Original) vs Algorithmic Route (Optimized)</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <TrendingDown className="w-4 h-4" /> Eco Savings
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.fuel_consumption_comparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" />
                <XAxis dataKey="route_code" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} unit=" L" />
                <Tooltip
                  formatter={(val: any) => [`${val} Litres`, ""]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #FCA5A5", fontSize: "12px" }}
                />
                <Bar dataKey="original_fuel_litres" fill="#9CA3AF" radius={[4, 4, 0, 0]} name="Original Fuel (L)" />
                <Bar dataKey="optimized_fuel_litres" fill="#DC2626" radius={[4, 4, 0, 0]} name="Optimized Fuel (L)" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

