import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Restaurant } from "@ontime/web-shared";

// No react-leaflet in the dependency set (see the TDD's tech stack table —
// just "Leaflet + @types/leaflet"), so this wraps vanilla Leaflet directly
// instead of pulling in a binding library.
const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#e3572c;border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.35)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export interface MapViewProps {
  restaurants: Restaurant[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function MapView({ restaurants, selectedId, onSelect, className }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [41.7151, 44.8271],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const marker of markersRef.current.values()) marker.remove();
    markersRef.current.clear();

    restaurants.forEach((restaurant) => {
      const marker = L.marker([restaurant.location.lat, restaurant.location.lng], { icon: markerIcon })
        .addTo(map)
        .bindTooltip(restaurant.name, { direction: "top" });
      marker.on("click", () => onSelect?.(restaurant.id));
      markersRef.current.set(restaurant.id, marker);
    });

    if (restaurants.length > 0) {
      const bounds = L.latLngBounds(restaurants.map((r) => [r.location.lat, r.location.lng]));
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
    }
  }, [restaurants, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const restaurant = restaurants.find((r) => r.id === selectedId);
    if (restaurant) {
      map.panTo([restaurant.location.lat, restaurant.location.lng]);
      markersRef.current.get(selectedId)?.openTooltip();
    }
  }, [selectedId, restaurants]);

  return <div ref={containerRef} className={className} role="application" aria-label="Restaurant map" />;
}
