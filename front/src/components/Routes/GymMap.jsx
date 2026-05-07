import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});
const defaultCenter = [-20.5386, -47.4008]; 
const geocodeCache = {};
const knownLocations = {
  "smartfit": { lat: -20.5369, lon: -47.3828 },
  "exprime": { lat: -20.5620, lon: -47.3950 },
  "hydrox": { lat: -20.56267, lon: -47.39711 }
};
export default function GymMap({ gyms = [] }) {
  const [markers, setMarkers] = useState([]);
  useEffect(() => {
    let isMounted = true;
    const geocodeGyms = async () => {
      const newMarkers = [];
      for (const gym of gyms) {
        const gymKey = gym.id || gym._id || gym.name;
        if (geocodeCache[gymKey]) {
          newMarkers.push({ ...gym, ...geocodeCache[gymKey] });
          continue;
        }
        let lat, lon;
        const gymNameLower = (gym.name || "").toLowerCase();
        // 1. Check known locations
        let foundKnown = false;
        for (const [key, coords] of Object.entries(knownLocations)) {
          if (gymNameLower.includes(key)) {
            lat = coords.lat;
            lon = coords.lon;
            foundKnown = true;
            break;
          }
        }
        if (foundKnown) {
          geocodeCache[gymKey] = { lat, lon };
          newMarkers.push({ ...gym, lat, lon });
          continue;
        }
        // 2. Fallback deterministic hash
        let hash = 0;
        const str = gym.name || '';
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        lat = defaultCenter[0] + ((Math.abs(hash) % 100) / 100) * 0.02 - 0.01;
        lon = defaultCenter[1] + ((Math.abs(hash >> 2) % 100) / 100) * 0.02 - 0.01;
        // 3. Try geocoding
        if (gym.address) {
          try {
            // Simplify address to improve geocoding chances
            let queryStr = gym.address;
            if (!queryStr.toLowerCase().includes('franca')) {
              queryStr += ', Franca, SP';
            }
            const query = encodeURIComponent(queryStr);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
              lat = parseFloat(data[0].lat);
              lon = parseFloat(data[0].lon);
            }
          } catch (e) {
            console.error("Geocoding failed for", gym.address);
          }
          await new Promise(resolve => setTimeout(resolve, 600)); 
        }
        geocodeCache[gymKey] = { lat, lon };
        newMarkers.push({ ...gym, lat, lon });
      }
      if (isMounted) {
        setMarkers(newMarkers);
      }
    };
    if (gyms.length > 0) {
      geocodeGyms();
    } else {
      setMarkers([]);
    }
    return () => {
      isMounted = false;
    };
  }, [gyms]);
  return (
    <div style={{ 
      height: '250px', 
      width: '100%', 
      borderRadius: '16px', 
      overflow: 'hidden', 
      margin: '0', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    }}
    >
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((gym, idx) => (
          <Marker key={idx} position={[gym.lat, gym.lon]}>
            <Popup>
              <strong>{gym.name}</strong><br />
              {gym.address || "Endereço não informado"}<br />
              Capacidade: {gym.capacity}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
