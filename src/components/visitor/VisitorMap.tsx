import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VisitorMapProps {
  latitude: number | string | null;
  longitude: number | string | null;
  city: string | null;
  visitorName: string | null;
  companyConfidence: string | null;
}

export default function VisitorMap({ latitude, longitude, city, visitorName, companyConfidence }: VisitorMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isStreetView, setIsStreetView] = useState(false);

  const lat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === "string" ? parseFloat(longitude) : longitude;

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
      center: [-98.5795, 39.8283],
      zoom: 3,
      projection: "globe" as any,
      attributionControl: false,
      config: {
        basemap: {
          lightPreset: "day",
        },
      } as any,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, [token]);

  useEffect(() => {
    if (!map.current || lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;

    marker.current?.remove();

    map.current.flyTo({
      center: [lng, lat],
      zoom: isStreetView ? 18 : 14,
      pitch: isStreetView ? 60 : 0,
      essential: true,
      duration: 2500,
    });

    const el = document.createElement("div");
    el.innerHTML = `
      <div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:#22c55e;opacity:0.3;animation:pulse-ring 1.5s ease-out infinite;"></div>
        <div style="position:absolute;top:5px;left:5px;width:10px;height:10px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.3);"></div>
      </div>
    `;

    marker.current = new mapboxgl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding:4px 0;">
            <strong style="font-size:14px;">${visitorName || "Anonymous Visitor"}</strong><br/>
            <span style="font-size:12px;color:#666;">${city || "Location Verified"}</span>
          </div>`
        )
      )
      .addTo(map.current);
  }, [lat, lng, city, visitorName, isStreetView]);

  if (!token) {
    return (
      <div className="w-full h-56 bg-muted flex items-center justify-center rounded-lg text-sm text-muted-foreground animate-pulse">
        Loading map...
      </div>
    );
  }

  const getConfidenceBadgeClass = (conf: string | null) => {
    if (conf === "very high" || conf === "high") return "bg-green-500/90 text-white border-green-600";
    if (conf === "moderate") return "bg-yellow-500/90 text-black border-yellow-600";
    return "bg-red-400/90 text-white border-red-500";
  };

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
      <div className="relative">
        <div ref={mapContainer} className="w-full h-56 rounded-lg" />

        {/* 3D View Toggle */}
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={() => setIsStreetView(!isStreetView)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg transition-all ${
              isStreetView
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
          >
            <Eye className="h-3 w-3" />
            {isStreetView ? "Exit 3D View" : "3D Building View"}
          </button>
        </div>

        {/* Confidence Overlay */}
        {companyConfidence && (
          <div className="absolute bottom-3 left-3 z-10">
            <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground leading-none mb-1">Company Confidence</span>
                <Badge className={`text-[10px] px-1.5 py-0 ${getConfidenceBadgeClass(companyConfidence)}`}>
                  {companyConfidence.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
