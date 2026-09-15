import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { DEFAULT_RADIUS_METERS } from '../data/categories';
import ClusterLayer from './ClusterLayer';

const homeIcon = L.divIcon({
  html: '<div class="pin pin-home">🏠</div>',
  className: 'pin-wrapper',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

function MapClickCapture({ active, onPick }) {
  useMapEvents({
    click(e) {
      if (active) onPick(e.latlng);
    },
  });
  return null;
}

// Re-centres when the user sets a new home, but leaves normal panning alone.
function RecenterOnHome({ home }) {
  const map = useMap();
  const previous = useRef(null);
  useEffect(() => {
    const key = `${home.lat},${home.lng}`;
    if (previous.current && previous.current !== key) {
      map.setView([home.lat, home.lng], Math.max(map.getZoom(), 16));
    }
    previous.current = key;
  }, [home, map]);
  return null;
}

export default function MapView({
  home,
  places,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  showRadius,
  addMode,
  onPickLocation,
}) {
  return (
    <MapContainer
      center={[home.lat, home.lng]}
      zoom={16}
      minZoom={12}
      maxZoom={22}
      style={{ height: '100%', width: '100%', cursor: addMode ? 'crosshair' : '' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={22}
        maxNativeZoom={19}
      />

      {showRadius && (
        <Circle
          center={[home.lat, home.lng]}
          radius={DEFAULT_RADIUS_METERS}
          pathOptions={{ color: '#1565c0', weight: 1, fillOpacity: 0.04 }}
        />
      )}

      <Marker position={[home.lat, home.lng]} icon={homeIcon}>
        <Popup>
          <strong>{home.isDefault ? 'Map centre' : 'Home'}</strong>
          <br />
          {home.label}
        </Popup>
      </Marker>

      <RecenterOnHome home={home} />

      <ClusterLayer
        places={places}
        selectedId={selectedId}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <MapClickCapture active={Boolean(addMode)} onPick={onPickLocation} />
    </MapContainer>
  );
}
