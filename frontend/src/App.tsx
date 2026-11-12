import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { CollectionPointsPage } from "./pages/CollectionPointsPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { RouteOptimizationPage } from "./pages/RouteOptimizationPage";
import { RouteManagementPage } from "./pages/RouteManagementPage";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { FuelCalculatorPage } from "./pages/FuelCalculatorPage";
import { ReportsPage } from "./pages/ReportsPage";
import { BackendWorkspacePage } from "./pages/BackendWorkspacePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="collection-points" element={<CollectionPointsPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="route-optimization" element={<RouteOptimizationPage />} />
          <Route path="routes" element={<RouteManagementPage />} />
          <Route path="facilities" element={<FacilitiesPage />} />
          <Route path="fuel-calculator" element={<FuelCalculatorPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="backend-workspace" element={<BackendWorkspacePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
