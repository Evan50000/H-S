"use client";
import { useEffect, useRef, useState, MouseEvent } from "react";
import "leaflet/dist/leaflet.css";
import { saveLocation, getLocations } from "@/lib/action";

// Haversine formula — returns distance in meters between two lat/lng points (found online)
const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function Map() {
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<globalThis.Map<string, any>>(new globalThis.Map());
  const initializedRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const seekerRef = useRef(false);
  const [isSeeker, setIsSeeker] = useState(false); 
  const [nearbyAlert, setNearbyAlert] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem("userId");
    if (!existing) {
      const newId = Math.random().toString(36).slice(2);
      localStorage.setItem("userId", newId);
    }
  }, []);

  useEffect(() => {
    import("leaflet").then((L) => {
      const map = L.map("map");
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

      navigator.geolocation.getCurrentPosition((position) => {
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
    const save = async () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (isSavingRef.current) return;
        const id = localStorage.getItem("userId");
        if (!id) return;

        isSavingRef.current = true;
        try {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(async (position) => {
              const { latitude, longitude } = position.coords;
              await saveLocation(latitude, longitude, id, seekerRef.current);
              resolve();
            });
          });
        } finally {
          isSavingRef.current = false;
        }
      }, 500);
    };

    save();
    const interval = setInterval(save, 5000);
    return () => {
      clearInterval(interval);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      const id = localStorage.getItem("userId");
      if (!id) return;
      navigator.sendBeacon("/api/delete-location", JSON.stringify({ userId: id }));
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    const getIcon = (L: any) => L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/7477/7477317.png",
      iconAnchor: [22, 94],
      popupAnchor: [0, 0],
      iconSize: [48, 95],
    });


const updateMarkers = async () => {
  if (!mapInstanceRef.current) return;
  const { map, L } = mapInstanceRef.current;

  const result = await getLocations();
  if (!result.success) return;

  const seenUserIds = new Set<string>();
  const seekers: any[] = [];
  const hiders: any[] = [];

  result.locations.forEach((loc: any) => {
    if (loc.seeker) seekers.push(loc);
    else hiders.push(loc);
  });

  if (!seekerRef.current) {
    let anyNearby = false;
    seekers.forEach((seeker) => {
      hiders.forEach((hider) => {
        const dist = getDistanceMeters(seeker.latitude, seeker.longitude, hider.latitude, hider.longitude);
        if (dist <= 50) anyNearby = true;
      });
    });
    setNearbyAlert(anyNearby);
  }



  let visibleLocations = result.locations;

  if (seekerRef.current) {
    visibleLocations = result.locations.filter((loc: any) => loc.seeker);
  }

  visibleLocations.forEach((loc: any) => {
    seenUserIds.add(loc.userId);
    const icon = getIcon(L);

    if (markersRef.current.has(loc.userId)) {
      markersRef.current.get(loc.userId).setLatLng([loc.latitude, loc.longitude]);
      markersRef.current.get(loc.userId).setIcon(icon);
    } else {
      const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map);
      marker.bindPopup(`<b> ${loc.userId.slice(0, 6)}</b>`);
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

  const seekeractivator = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("switched roles")
    const newValue = !seekerRef.current;
    seekerRef.current = newValue;
    setIsSeeker(newValue);
    const id = localStorage.getItem("userId");
    if (!id) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await saveLocation(latitude, longitude, id, newValue);
    });
  };

  return (
  <div style={{ position: "relative" }}>
    <button 
      onClick={seekeractivator}
      style={{
        position: "absolute",
        top: 10,
        left: 50,
        zIndex: 1000,
        padding: "10px 10px",
        background: "black",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Change Role
    </button>

      {nearbyAlert && (
        <div style={{
          position: "absolute",
          top: 60,
          left: 50,
          zIndex: 1000,
          padding: "10px 20px",
          background: "black",
          color: "white",
          borderRadius: "8px",
          fontWeight: "bold",
        }}>
          Seeker is within 50 meters GG
        </div>
      )}

      <div id="map" style={{ height: "100vh", width: "100vw" }} />
    </div>
  );
}