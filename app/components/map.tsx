"use client";

import { useEffect, useState, FormEvent,ButtonHTMLAttributes, FC } from "react";
import "leaflet/dist/leaflet.css";

export default function Map() {
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    // Only runs in the browser

    import("leaflet").then((L) => {
      const map = L.map("map");
      const seekicon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/7477/7477317.png",
        iconAnchor: [22, 94],
        popupAnchor: [0, 0],
        iconSize: [38, 95],
      });
    
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      
      const marker = L.marker([latitude, longitude], { icon: seekicon }).addTo(map);
      map.setView([latitude, longitude], 21)
      marker.bindPopup("<b>your location</b><br>you rn").openPopup();
    },);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      setMapInstance({ map, L });

      return () => {
        map.remove();
      };
    });
  }, []);

  const addmarker = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mapInstance) return;
      const seekicon = mapInstance.L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/7477/7477317.png",
        iconAnchor: [22, 94],
        popupAnchor: [0, 0],
        iconSize: [38, 95],
      });
    const formData = new FormData(event.currentTarget);
    const lat = Number(formData.get("lat"));
    const lon = Number(formData.get("lon"));
    const name = String(formData.get("name"));

    const marker = mapInstance.L.marker([lat, lon], {icon: seekicon}).addTo(mapInstance.map);
    marker.bindPopup(`<b>${name}</b>`).openPopup();
  };

  return (
    <div>
      <form
        onSubmit={addmarker}
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          zIndex: 1000,
          background: "black",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <input name="lat" step="any" placeholder="Latitude" required />
        <input  name="lon" step="any" placeholder="Longitude" required />
        <input type="text" name="name" placeholder="Marker Name" required />
        <button type="submit">Add Marker</button>
      </form>

      <div id="map" style={{ height: "100vh", width: "100vw" }} />
    </div>
  );
}
