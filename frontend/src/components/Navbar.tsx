import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, Recycle, Truck, CheckCircle2, AlertCircle,
  LogOut, User as UserIcon, RefreshCw, ChevronDown
} from "lucide-react";
import { notificationsApi, authApi, checkBackendStatus, isBackendConnected } from "../services/api";
import { NotificationItem } from "../types";

interface NavbarProps {
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefreshData, isRefreshing = false }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [backendLive, setBackendLive] = useState(false);
  const currentUser = authApi.getCurrentUser() || { name: "Alex Turner", role: "Administrator", email: "admin@recycling.org" };

  const fetchNotifs = async () => {
    try {
      const isLive = await checkBackendStatus();
      setBackendLive(isLive);
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (err) {
      console.debug("Could not fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-red-100 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Brand Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <Recycle className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-900 text-lg tracking-tight">EcoRoute</span>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-red-100 text-red-700 rounded-full border border-red-200 uppercase tracking-wider">
                Optimizer
              </span>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">Recycling Fleet & Route Optimization Platform</p>
          </div>
        </div>

        {/* Right Action Icons & User Info */}
        <div className="flex items-center gap-3">
          {/* Quick Refresh Data Button */}
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Live Database Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-red-600" : ""}`} />
              <span className="hidden md:inline">{isRefreshing ? "Refreshing..." : "Sync DB"}</span>
            </button>
          )}

          {/* System Status Pill */}
          <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1 border text-xs font-medium rounded-full ${
            backendLive
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}>
            <span className={`w-2 h-2 rounded-full ${backendLive ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`}></span>
            <span>{backendLive ? "FastAPI Live" : "Cloud Demo Engine"}</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-red-100 py-3 z-50 animate-in fade-in-50 duration-100">
                <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">System Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-500">No notifications yet.</div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-red-50/50 transition-colors ${!n.is_read ? 'bg-red-50/20' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!n.is_read ? 'bg-red-600' : 'bg-transparent'}`} />
                          <div>
                            <div className="text-xs font-bold text-gray-900">{n.title}</div>
                            <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 pt-2 border-t border-gray-100 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifMenu(false)}
                    className="text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    View All Notifications &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-red-100 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-gray-900 leading-none">{currentUser.name}</div>
                <div className="text-[10px] text-red-600 font-semibold leading-none mt-1">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-red-100 py-2 z-50 animate-in fade-in-50 duration-100">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-xs font-bold text-gray-900">{currentUser.name}</div>
                  <div className="text-[11px] text-gray-500 truncate">{currentUser.email}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                    {currentUser.role}
                  </span>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium"
                >
                  <UserIcon className="w-4 h-4" /> Account Settings
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

