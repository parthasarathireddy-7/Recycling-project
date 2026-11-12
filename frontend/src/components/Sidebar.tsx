import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, MapPin, Truck, Layers, Navigation,
  Route as RouteIcon, Building2, Fuel, BarChart3,
  Bell, Settings, LogOut, Code2, Sparkles
} from "lucide-react";
import { authApi } from "../services/api";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Collection Points", path: "/collection-points", icon: MapPin },
    { name: "Vehicles", path: "/vehicles", icon: Truck },
    { name: "Materials", path: "/materials", icon: Layers },
    { name: "Route Optimization", path: "/route-optimization", icon: Navigation, badge: "Core Engine" },
    { name: "Route Management", path: "/routes", icon: RouteIcon },
    { name: "Recycling Facility", path: "/facilities", icon: Building2 },
    { name: "Fuel Calculator", path: "/fuel-calculator", icon: Fuel },
    { name: "Reports & Analytics", path: "/reports", icon: BarChart3 },
    { name: "Backend Workspace", path: "/backend-workspace", icon: Code2, isBlueHighlight: true, badge: "Blue Theme" },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    authApi.logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-red-100 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation List */}
      <div className="p-4 flex-1 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-red-700/80">
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => {
                if (item.isBlueHighlight) {
                  return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-blue-700 bg-blue-50/70 hover:bg-blue-100/80 hover:text-blue-800"
                  }`;
                }

                return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                }`;
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-tight ${
                    item.isBlueHighlight
                      ? "bg-blue-200 text-blue-900"
                      : "bg-red-100 text-red-700 group-hover:bg-red-200"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section - Logout & Footprint Summary */}
      <div className="p-4 border-t border-red-100 bg-red-50/30">
        <div className="mb-3 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-900">
          <div className="font-bold flex items-center gap-1.5 text-red-700">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Optimal Routing</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-600 leading-tight">
            Dijkstra & A* algorithms active for continuous route minimization.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

