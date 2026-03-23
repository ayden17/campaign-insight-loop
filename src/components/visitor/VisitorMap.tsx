import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";

interface VisitorMapProps {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  visitorName: string | null;
}

export default function VisitorMap({ latitude, longitude, city, visitorName }: VisitorMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    supabase.functions.invoke("mapbox-token").then(({ data }) => {
      if (data?.token) setToken(data.token);
    });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

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
  }, [token]);

  useEffect(() => {
    if (!map.current || latitude == null || longitude == null) return;

    marker.current?.remove();

    map.current.flyTo({
      center: [longitude, latitude],
      zoom: 11,
      duration: 2000,
    });

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

  if (!token) {
    return (
      <div className="w-full h-56 bg-muted flex items-center justify-center rounded-lg text-sm text-muted-foreground animate-pulse">
        Loading map...
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
