"use client";

import { useEffect, useState, FormEvent,ButtonHTMLAttributes, FC } from "react";
import "leaflet/dist/leaflet.css";
import { saveLocation } from "@/lib/action";
//import socket.io
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
  
    navigator.geolocation.getCurrentPosition(async (position: GeolocationPosition) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      const result = await saveLocation(latitude, longitude);
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
  const chat = ({
    OnSendMessage,
  }: {
    OnSendMessage: (message:string) => void;
  }) =>{}
    const [message, setmessage] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim() !== "") {
        setmessage("");

      
      }
    };
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
      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
        type = "text"
        onChange={(e) => setmessage(e.target.value)}
        className = "flex-1 px-4 border-2 py-2 rounded-lg focus:outline-none"
        placeholder = "write message to opponent"
        >
        </input>
        <button type="submit">send</button>

      </form>
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


