"use client";
import React, { useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

declare global {
  interface Window {
    google?: any;
  }
}

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
  const mapRef = useRef<any>(null);
  const agentMarkerRef = useRef<any>(null);
  const dropMarkerRef = useRef<any>(null);

  const loadGoogleMapsScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const existingScript = document.getElementById(
        "google-maps-script",
      ) as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), {
          once: true,
        });
        existingScript.addEventListener("error", () => reject(), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    if (!GOOGLE_MAPS_API_KEY) {
      mapContainer.current.innerHTML = "Google Maps API key not configured";
      return;
    }

    let mounted = true;

    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript();
        if (!mounted || !mapContainer.current || !window.google?.maps) return;

        const initial = livePosition || pickup || { lng: 77.209, lat: 28.6139 };

        mapRef.current = new window.google.maps.Map(mapContainer.current, {
          center: { lat: initial.lat, lng: initial.lng },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        agentMarkerRef.current = new window.google.maps.Marker({
          map: mapRef.current,
          position: { lat: initial.lat, lng: initial.lng },
          title: "Delivery Partner",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#FF8C00",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        if (drop) {
          dropMarkerRef.current = new window.google.maps.Marker({
            map: mapRef.current,
            position: { lat: drop.lat, lng: drop.lng },
            title: "Delivery Address",
          });
        }
      } catch {
        if (mapContainer.current) {
          mapContainer.current.innerHTML = "Unable to load Google Maps";
        }
      }
    };

    initializeMap();

    return () => {
      mounted = false;
      agentMarkerRef.current = null;
      dropMarkerRef.current = null;
      mapRef.current = null;
    };
  }, [pickup, livePosition]);

  // React to live position updates from Socket.IO
  useEffect(() => {
    if (!mapRef.current || !agentMarkerRef.current || !livePosition) return;
    const next = { lat: livePosition.lat, lng: livePosition.lng };
    agentMarkerRef.current.setPosition(next);
    mapRef.current.panTo(next);
  }, [livePosition]);

  useEffect(() => {
    if (!mapRef.current || !drop || !window.google?.maps) return;

    if (!dropMarkerRef.current) {
      dropMarkerRef.current = new window.google.maps.Marker({
        map: mapRef.current,
        title: "Delivery Address",
      });
    }

    dropMarkerRef.current.setPosition({ lat: drop.lat, lng: drop.lng });
  }, [drop]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
