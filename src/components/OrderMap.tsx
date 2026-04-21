"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

// Mapbox Token from env
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
mapboxgl.accessToken = MAPBOX_TOKEN;

export interface OrderMapProps {
  pickup?: { lng: number; lat: number };
  drop?: { lng: number; lat: number };
  livePosition?: { lng: number; lat: number } | null;
}

export default function OrderMap({
  pickup,
  drop,
  livePosition,
}: OrderMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const agentMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (!MAPBOX_TOKEN) {
      mapContainer.current.innerHTML = "Mapbox token not configured";
      return;
    }

    const initial = livePosition || pickup || { lng: 77.209, lat: 28.6139 };

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initial.lng, initial.lat],
      zoom: 13,
      attributionControl: false,
    });

    mapRef.current = map;

    // Create a custom element for the delivery boy icon
    const el = document.createElement("div");
    el.className = "delivery-boy-marker";
    el.style.backgroundImage = `url('https://cdn-icons-png.flaticon.com/512/2972/2972185.png')`; // Bike delivery icon
    el.style.width = "40px";
    el.style.height = "40px";
    el.style.backgroundSize = "cover";
    el.style.borderRadius = "50%";
    el.style.border = "2px solid white";
    el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    el.style.backgroundColor = "#fff";

    agentMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([initial.lng, initial.lat])
      .addTo(map);

    if (drop) {
      const dropEl = document.createElement("div");
      dropEl.className = "drop-marker";
      dropEl.style.backgroundImage = `url('https://cdn-icons-png.flaticon.com/512/684/684908.png')`; // Home/Pin icon
      dropEl.style.width = "32px";
      dropEl.style.height = "32px";
      dropEl.style.backgroundSize = "cover";

      dropMarkerRef.current = new mapboxgl.Marker(dropEl)
        .setLngLat([drop.lng, drop.lat])
        .addTo(map);
        
      // Fit bounds to show both
      const bounds = new mapboxgl.LngLatBounds()
        .extend([initial.lng, initial.lat])
        .extend([drop.lng, drop.lat]);
      
      map.fitBounds(bounds, { padding: 50, duration: 1000 });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // React to live position updates
  useEffect(() => {
    if (!mapRef.current || !agentMarkerRef.current || !livePosition) return;
    
    agentMarkerRef.current.setLngLat([livePosition.lng, livePosition.lat]);
    
    // Smoothly pan map
    mapRef.current.easeTo({
      center: [livePosition.lng, livePosition.lat],
      duration: 1000,
      essential: true
    });
  }, [livePosition]);

  return <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-gray-100" />;
}
