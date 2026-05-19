"use client";
import { useEffect, useState, FormEvent, useRef} from "react";
import "leaflet/dist/leaflet.css";
import { saveLocation } from "@/lib/action";
const MY_USER_ID = Math.random().toString(36).slice(2)

export default function Map() {
  const [locations, setLocations] = useState([])
  const [mapInstance, setMapInstance] = useState<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {

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
        await saveLocation(latitude, longitude, MY_USER_ID);
        const marker = L.marker([latitude, longitude], { icon: seekicon }).addTo(map);
        map.setView([latitude, longitude], 21)
        marker.bindPopup("<b>your location</b><br>you rn").openPopup();
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      setMapInstance({ map, L });

      return () => {
        map.remove();
      };
    });
  }, []);

  useEffect(() => {
    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: MY_USER_ID,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          })
        })
      })
    }

    const fetchLocations = async () => {
      const res = await fetch('/api/locations')
      const data = await res.json()
      setLocations(data)
    }

    sendLocation()
    fetchLocations()

    const interval = setInterval(() => {
      sendLocation()
      fetchLocations()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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
    const marker = mapInstance.L.marker([lat, lon], { icon: seekicon }).addTo(mapInstance.map);
    marker.bindPopup(`<b>${name}</b>`).openPopup();
  };
const addLocationMarkers = (locations: any[]) => {
  if (!mapInstance) return;

  // Clear existing markers
  markersRef.current.forEach(marker => marker.remove());
  markersRef.current = [];

  const seekicon = mapInstance.L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/7477/7477317.png",
    iconAnchor: [22, 94],
    popupAnchor: [0, 0],
    iconSize: [38, 95],
  });

  const interval = setInterval(() => {
    locations.forEach(loc => {
      const marker = mapInstance.L.marker([loc.lat, loc.lon], { icon: seekicon }).addTo(mapInstance.map);
      markersRef.current.push(marker); 
    });
    }, 5000)
    return () => clearInterval(interval)
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
        <input name="lon" step="any" placeholder="Longitude" required />
        <button type="submit">Add Marker</button>
      </form>
      <div id="map" style={{ height: "100vh", width: "100vw" }} />
    </div>
  );
}