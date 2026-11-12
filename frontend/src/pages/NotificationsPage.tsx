import React, { useState, useEffect } from "react";
import {
  Bell, CheckCircle2, AlertTriangle, Truck, Route,
  Trash2, Check, RefreshCw, X
} from "lucide-react";
import { notificationsApi } from "../services/api";
import { NotificationItem } from "../types";

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = filterType
    ? notifications.filter((n) => n.type === filterType)
    : notifications;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-red-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Bell className="w-4 h-4" /> Activity Feed
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">System Notifications & Alerts</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit logs for route completions, vehicle capacity warnings, and optimization events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Mark All as Read
          </button>
          <button
            onClick={fetchNotifs}
            className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            title="Refresh Notifications"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs bg-white p-3 rounded-2xl border border-red-100 shadow-xs">
        <span className="font-bold text-gray-500 mr-2">Filter by Type:</span>
        {["", "route", "capacity", "collection", "vehicle", "system"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer uppercase text-[10px] tracking-wider ${
              filterType === type
                ? "bg-red-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            {type || "All"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading notifications...</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">No notifications found.</div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !n.is_read ? "bg-red-50/20" : "hover:bg-gray-50/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 ${!n.is_read ? "bg-red-600" : "bg-gray-300"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{n.title}</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-gray-100 text-gray-700 uppercase">
                      {n.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

