"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { saveLocation, getLocations } from "@/lib/action";

export default function Map() {
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<globalThis.Map<string, any>>(new globalThis.Map());
  const initializedRef = useRef(false);
  const userIdRef = useRef<string>("");

  useEffect(() => {
    const existing = localStorage.getItem("userId");
    if (existing) {
      userIdRef.current = existing;
    } else {
      const newId = Math.random().toString(36).slice(2);
      localStorage.setItem("userId", newId);
      userIdRef.current = newId;
    }
  }, []);

  useEffect(() => {
    import("leaflet").then((L) => {
      const map = L.map("map");

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        if (!initializedRef.current) {
          map.setView([latitude, longitude], 21);
          initializedRef.current = true;
        }
      });

      mapInstanceRef.current = { map, L };
      return () => map.remove();
    });
  }, []);

useEffect(() => {
  const save = () => {
    const id = localStorage.getItem("userId");
    if (!id) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await saveLocation(latitude, longitude, id);
    });
  };

  save();
  const interval = setInterval(save, 5000);
  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const seekicon = () => {
      if (!mapInstanceRef.current) return null;
      return mapInstanceRef.current.L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/7477/7477317.png",
        iconAnchor: [22, 94],
        popupAnchor: [0, 0],
        iconSize: [38, 95],
      });
    };

    const updateMarkers = async () => {
      if (!mapInstanceRef.current) return;
      const { map, L } = mapInstanceRef.current;

      const result = await getLocations();
      if (!result.success) return;

      const icon = seekicon();
      const seenUserIds = new Set<string>();

      result.locations.forEach((loc: any) => {
        seenUserIds.add(loc.userId);

        if (markersRef.current.has(loc.userId)) {
          markersRef.current.get(loc.userId).setLatLng([loc.latitude, loc.longitude]);
        } else {
          const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map);
          marker.bindPopup(`<b>User: ${loc.userId.slice(0, 6)}</b>`);
          markersRef.current.set(loc.userId, marker);
        }
      });

      markersRef.current.forEach((marker, userId) => {
        if (!seenUserIds.has(userId)) {
          marker.remove();
          markersRef.current.delete(userId);
        }
      });
    };

    const interval = setInterval(updateMarkers, 5000);
    updateMarkers();
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div id="map" style={{ height: "100vh", width: "100vw" }} />
    </div>
  );
}