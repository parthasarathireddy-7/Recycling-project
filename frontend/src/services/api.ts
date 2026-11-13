import axios from "axios";
import {
  AuthResponse, User, Facility, Driver, Vehicle, MaterialCategory,
  CollectionPoint, RouteRecord, OptimizationResult, DashboardData, NotificationItem
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject JWT Bearer Token if logged in
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("recycling_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for handling 401s gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking me
      if (!error.config.url.includes("/auth/me")) {
        console.warn("Session expired or unauthorized request.");
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/login", { email, password });
    localStorage.setItem("recycling_token", res.data.access_token);
    localStorage.setItem("recycling_user", JSON.stringify({
      email: res.data.user_email,
      name: res.data.user_name,
      role: res.data.role
    }));
    return res.data;
  },
  register: async (userData: any): Promise<User> => {
    const res = await apiClient.post<User>("/auth/register", userData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>("/auth/me");
    return res.data;
  },
  logout: () => {
    localStorage.removeItem("recycling_token");
    localStorage.removeItem("recycling_user");
  },
  getCurrentUser: () => {
    const data = localStorage.getItem("recycling_user");
    return data ? JSON.parse(data) : null;
  }
};

// Collection Points Service
export const collectionPointsApi = {
  getAll: async (params?: { search?: string; material?: string; status?: string; priority?: string }) => {
    const res = await apiClient.get<CollectionPoint[]>("/collection-points", { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<CollectionPoint>(`/collection-points/${id}`);
    return res.data;
  },
  create: async (data: Omit<CollectionPoint, "id">) => {
    const res = await apiClient.post<CollectionPoint>("/collection-points", data);
    return res.data;
  },
  update: async (id: number, data: Partial<CollectionPoint>) => {
    const res = await apiClient.put<CollectionPoint>(`/collection-points/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/collection-points/${id}`);
    return res.data;
  }
};

// Vehicles & Drivers Service
export const vehiclesApi = {
  getAll: async () => {
    const res = await apiClient.get<Vehicle[]>("/vehicles");
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<Vehicle>(`/vehicles/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<Vehicle>("/vehicles", data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await apiClient.put<Vehicle>(`/vehicles/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/vehicles/${id}`);
    return res.data;
  },
  getDrivers: async () => {
    const res = await apiClient.get<Driver[]>("/vehicles/drivers/list");
    return res.data;
  },
  createDriver: async (data: any) => {
    const res = await apiClient.post<Driver>("/vehicles/drivers/create", data);
    return res.data;
  }
};

// Materials Service
export const materialsApi = {
  getAll: async () => {
    const res = await apiClient.get<MaterialCategory[]>("/materials");
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<MaterialCategory>("/materials", data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await apiClient.put<MaterialCategory>(`/materials/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/materials/${id}`);
    return res.data;
  }
};

// Facilities Service
export const facilitiesApi = {
  getAll: async () => {
    const res = await apiClient.get<Facility[]>("/facilities");
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<Facility>("/facilities", data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await apiClient.put<Facility>(`/facilities/${id}`, data);
    return res.data;
  }
};

// Route Optimization & Management Service
export const routesApi = {
  optimize: async (data: {
    start_facility_id: number;
    destination_facility_id: number;
    collection_point_ids: number[];
    vehicle_id: number;
    algorithm: string;
    fuel_price_per_litre?: number;
    max_vehicle_capacity?: number;
  }): Promise<OptimizationResult> => {
    const res = await apiClient.post<OptimizationResult>("/routes/optimize", data);
    return res.data;
  },
  create: async (data: any): Promise<RouteRecord> => {
    const res = await apiClient.post<RouteRecord>("/routes", data);
    return res.data;
  },
  getAll: async (status?: string) => {
    const res = await apiClient.get<RouteRecord[]>("/routes", { params: status ? { status } : {} });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<RouteRecord>(`/routes/${id}`);
    return res.data;
  },
  updateStatus: async (id: number, status: string) => {
    const res = await apiClient.patch<RouteRecord>(`/routes/${id}/status`, { status });
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/routes/${id}`);
    return res.data;
  }
};

// Fuel Calculator Service
export const fuelApi = {
  calculate: async (data: {
    distance_km: number;
    fuel_efficiency_km_l: number;
    fuel_price_per_litre: number;
    fuel_type?: string;
  }) => {
    const res = await apiClient.post("/fuel/calculate", data);
    return res.data;
  },
  compare: async (data: {
    original_distance_km: number;
    optimized_distance_km: number;
    fuel_efficiency_km_l: number;
    fuel_price_per_litre: number;
    fuel_type?: string;
  }) => {
    const res = await apiClient.post("/fuel/compare", data);
    return res.data;
  }
};

// Dashboard Service
export const dashboardApi = {
  getStats: async (): Promise<DashboardData> => {
    const res = await apiClient.get<DashboardData>("/dashboard/stats");
    return res.data;
  }
};

// Reports Service
export const reportsApi = {
  getSummary: async (params?: { report_type?: string; category?: string; vehicle_id?: number }) => {
    const res = await apiClient.get("/reports/summary", { params });
    return res.data;
  },
  getExportCsvUrl: (vehicle_id?: number, status?: string) => {
    let url = `${API_BASE_URL}/reports/export-csv`;
    const params = new URLSearchParams();
    if (vehicle_id) params.append("vehicle_id", vehicle_id.toString());
    if (status) params.append("status", status);
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  }
};

// Notifications Service
export const notificationsApi = {
  getAll: async () => {
    const res = await apiClient.get<NotificationItem[]>("/notifications");
    return res.data;
  },
  markRead: async (id: number) => {
    const res = await apiClient.patch<NotificationItem>(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.patch("/notifications/read-all");
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/notifications/${id}`);
    return res.data;
  }
};

// Backend Source Code Explorer Service
export const codeExplorerApi = {
  listFiles: async () => {
    const res = await apiClient.get("/code/backend-files");
    return res.data;
  },
  getFile: async (path: string) => {
    const res = await apiClient.get("/code/backend-file", { params: { path } });
    return res.data;
  },
  getSystemInfo: async () => {
    const res = await apiClient.get("/code/system-info");
    return res.data;
  }
};

