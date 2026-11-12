import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { CollectionPoint, Facility, Waypoint } from "../types";

// Fix standard leaflet icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapProps {
  facilities?: Facility[];
  collectionPoints?: CollectionPoint[];
  selectedPointIds?: number[];
  onTogglePoint?: (id: number) => void;
  routeASequence?: Waypoint[];
  routeBSequence?: Waypoint[];
  showRouteA?: boolean;
  showRouteB?: boolean;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export const MapComponent: React.FC<MapProps> = ({
  facilities = [],
  collectionPoints = [],
  selectedPointIds = [],
  onTogglePoint,
  routeASequence = [],
  routeBSequence = [],
  showRouteA = true,
  showRouteB = true,
  height = "480px",
  center = [40.7428, -73.9860],
  zoom = 12
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeALayerRef = useRef<L.Polyline | null>(null);
  const routeBLayerRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds: [number, number][] = [];

    // 1. Facility Markers (Depot Icons)
    const facilityIcon = L.divIcon({
      className: "custom-depot-marker",
      html: `
        <div style="background-color: #1E3A8A; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
          🏭
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    facilities.forEach((f) => {
      bounds.push([f.latitude, f.longitude]);
      const marker = L.marker([f.latitude, f.longitude], { icon: facilityIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <div style="font-weight: 700; color: #1E3A8A; font-size: 14px; margin-bottom: 4px;">🏭 ${f.name}</div>
          <div><strong>Address:</strong> ${f.address}</div>
          <div><strong>Capacity:</strong> ${f.capacity_daily_kg.toLocaleString()} kg/day</div>
          <div><strong>Hours:</strong> ${f.operating_hours}</div>
          <div style="margin-top: 6px; padding: 2px 6px; background-color: #DBEAFE; color: #1E40AF; border-radius: 4px; display: inline-block; font-weight: 600; font-size: 11px;">Central Recycling Facility</div>
        </div>
      `);
      markersLayer.addLayer(marker);
    });

    // 2. Collection Point Markers
    collectionPoints.forEach((cp) => {
      bounds.push([cp.latitude, cp.longitude]);
      const isSelected = selectedPointIds.includes(cp.id);

      // Status color
      let markerColor = "#DC2626"; // Default Pending Red
      if (cp.collection_status === "Collected") markerColor = "#059669"; // Emerald
      else if (cp.collection_status === "Scheduled") markerColor = "#D97706"; // Amber
      else if (cp.collection_status === "Inactive") markerColor = "#6B7280"; // Gray

      const borderStyle = isSelected ? "3px solid #FBBF24" : "2px solid white";
      const scale = isSelected ? "transform: scale(1.15);" : "";

      const cpIcon = L.divIcon({
        className: "custom-cp-marker",
        html: `
          <div style="background-color: ${markerColor}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: ${borderStyle}; box-shadow: 0 3px 6px rgba(0,0,0,0.35); ${scale}">
            ${cp.id}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([cp.latitude, cp.longitude], { icon: cpIcon });

      const popupContent = document.createElement("div");
      popupContent.innerHTML = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <div style="font-weight: 700; color: #DC2626; font-size: 14px; margin-bottom: 4px;">📍 ${cp.name}</div>
          <div><strong>Address:</strong> ${cp.address}</div>
          <div><strong>Material:</strong> ${cp.material_category}</div>
          <div><strong>Weight:</strong> <span style="font-weight: 700; color: #991B1B;">${cp.estimated_weight_kg} kg</span></div>
          <div><strong>Priority:</strong> ${cp.priority}</div>
          <div><strong>Status:</strong> ${cp.collection_status}</div>
          <div style="margin-top: 8px;">
            <button id="toggle-cp-${cp.id}" style="background-color: ${isSelected ? '#991B1B' : '#DC2626'}; color: white; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
              ${isSelected ? "✓ Selected (Click to remove)" : "+ Select for Route"}
            </button>
          </div>
        </div>
      `;

      // Attach button click event inside popup
      const btn = popupContent.querySelector(`#toggle-cp-${cp.id}`);
      if (btn && onTogglePoint) {
        btn.addEventListener("click", () => {
          onTogglePoint(cp.id);
          marker.closePopup();
        });
      }

      marker.bindPopup(popupContent);
      markersLayer.addLayer(marker);
    });

    // 3. Draw Route A (Original Unoptimized Sequence)
    if (routeALayerRef.current) {
      map.removeLayer(routeALayerRef.current);
      routeALayerRef.current = null;
    }
    if (showRouteA && routeASequence.length > 1) {
      const latlngs: [number, number][] = routeASequence.map((wp) => [wp.latitude, wp.longitude]);
      routeALayerRef.current = L.polyline(latlngs, {
        color: "#9CA3AF",
        weight: 3.5,
        dashArray: "6, 6",
        opacity: 0.85,
      }).addTo(map);
      routeALayerRef.current.bindTooltip("Route A (Original Order)", { sticky: true });
    }

    // 4. Draw Route B (Optimized Sequence)
    if (routeBLayerRef.current) {
      map.removeLayer(routeBLayerRef.current);
      routeBLayerRef.current = null;
    }
    if (showRouteB && routeBSequence.length > 1) {
      const latlngs: [number, number][] = routeBSequence.map((wp) => [wp.latitude, wp.longitude]);
      routeBLayerRef.current = L.polyline(latlngs, {
        color: "#DC2626", // RED Primary
        weight: 5,
        opacity: 0.95,
      }).addTo(map);
      routeBLayerRef.current.bindTooltip("Route B (Optimized Route)", { sticky: true });
    }

    // Auto-fit bounds if we have points
    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 });
    }
  }, [facilities, collectionPoints, selectedPointIds, routeASequence, routeBSequence, showRouteA, showRouteB]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-red-100 bg-white">
      <div ref={mapContainerRef} style={{ height }} className="w-full" />
      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-lg border border-red-200 text-xs shadow-md z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <div className="font-semibold text-gray-800 border-b border-red-100 pb-1">Map Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-900 flex items-center justify-center text-[8px] text-white font-bold">🏭</span>
          <span className="text-gray-600">Recycling Facility (Depot)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white"></span>
          <span className="text-gray-600">Pending Collection Point</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white"></span>
          <span className="text-gray-600">Scheduled Stop</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white"></span>
          <span className="text-gray-600">Collected</span>
        </div>
        {showRouteB && (
          <div className="flex items-center gap-2">
            <span className="w-5 h-1 bg-red-600 rounded"></span>
            <span className="text-red-700 font-medium">Optimized Route (Red)</span>
          </div>
        )}
        {showRouteA && (
          <div className="flex items-center gap-2">
            <span className="w-5 h-1 border-t-2 border-dashed border-gray-400"></span>
            <span className="text-gray-500">Original Sequence</span>
          </div>
        )}
      </div>
    </div>
  );
};

