import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface VisitorMapProps {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  visitorName: string | null;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

export default function VisitorMap({ latitude, longitude, city, visitorName }: VisitorMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [0, 20],
      zoom: 1.5,
      projection: "globe" as any,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || latitude == null || longitude == null) return;

    // Remove old marker
    marker.current?.remove();

    // Fly to location
    map.current.flyTo({
      center: [longitude, latitude],
      zoom: 11,
      duration: 2000,
    });

    // Create pulsing marker element
    const el = document.createElement("div");
    el.innerHTML = `
      <div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:hsl(142,76%,36%);opacity:0.3;animation:pulse-ring 1.5s ease-out infinite;"></div>
        <div style="position:absolute;top:5px;left:5px;width:10px;height:10px;border-radius:50%;background:hsl(142,76%,36%);border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.3);"></div>
      </div>
    `;

    marker.current = new mapboxgl.Marker({ element: el })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 15 }).setHTML(
          `<strong>${visitorName || "Anonymous Visitor"}</strong><br/>${city || "Unknown location"}`
        )
      )
      .addTo(map.current);
  }, [latitude, longitude, city, visitorName]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-56 bg-muted flex items-center justify-center rounded-lg text-sm text-muted-foreground">
        Mapbox token not configured
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
      <div ref={mapContainer} className="w-full h-56 rounded-lg" />
    </>
  );
}
