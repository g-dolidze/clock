import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#e3572c;border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.35)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export interface RestaurantMapProps {
  lat: number;
  lng: number;
  name: string;
  className?: string;
}

/** A small, non-interactive-feeling single-location map for the restaurant
 * header (see the "mini map" column in the redesign doc) — as opposed to
 * MapView, which plots and lets you pick between many restaurants. */
export function RestaurantMap({ lat, lng, name, className }: RestaurantMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);
    L.marker([lat, lng], { icon: markerIcon }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className={className}>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10">
        <div ref={containerRef} className="h-full w-full" role="img" aria-label={`Map showing ${name}'s location`} />
      </div>
      <a
        href={directionsHref}
        target="_blank"
        rel="noreferrer"
        className="mt-2 block text-center text-xs font-semibold text-[#e3572c] hover:underline"
      >
        Directions →
      </a>
    </div>
  );
}
