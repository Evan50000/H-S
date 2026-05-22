"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { saveLocation, getLocations } from "@/lib/action";

const MY_USER_ID = Math.random().toString(36).slice(2)

export default function Map() {
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize map
  useEffect(() => {
    import("leaflet").then((L) => {
      const map = L.map("map");

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        await saveLocation(latitude, longitude, MY_USER_ID);
        map.setView([latitude, longitude], 21);
      });

      mapInstanceRef.current = { map, L };

      return () => map.remove();
    });
  }, []);

  // Save location every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        await saveLocation(latitude, longitude, MY_USER_ID);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fetch and display all locations every 5 seconds
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current) return;
      const { map, L } = mapInstanceRef.current;

      const result = await getLocations();
      if (!result.success) return;

      // clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const seekicon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/7477/7477317.png",
        iconAnchor: [22, 94],
        popupAnchor: [0, 0],
        iconSize: [38, 95],
      });

      // add new markers
      result.locations.forEach((loc: any) => {
        const marker = L.marker([loc.latitude, loc.longitude], { icon: seekicon }).addTo(map);
        marker.bindPopup(`<b>User: ${loc.userId.slice(0, 6)}</b>`).openPopup();
        markersRef.current.push(marker);
      });
    };

    // run immediately then every 5 seconds
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