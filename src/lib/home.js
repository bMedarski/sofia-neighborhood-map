const HOME_KEY = 'sofia-map-home-v1';

// Neutral fallback so the deployed app doesn't ship anyone's address.
// A real home location is set in the app and kept in this browser only.
export const DEFAULT_HOME = {
  lat: 42.6934,
  lng: 23.3211,
  label: 'Sofia city centre',
  isDefault: true,
};

export function loadHome() {
  try {
    const raw = localStorage.getItem(HOME_KEY);
    if (!raw) return DEFAULT_HOME;
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat !== 'number' || typeof parsed.lng !== 'number') return DEFAULT_HOME;
    return { ...parsed, isDefault: false };
  } catch {
    return DEFAULT_HOME;
  }
}

export function saveHome(home) {
  try {
    if (!home || home.isDefault) localStorage.removeItem(HOME_KEY);
    else localStorage.setItem(HOME_KEY, JSON.stringify(home));
  } catch {
    // storage unavailable; home stays set for this session only
  }
}

const R = 6371000;

export function distanceMeters(a, b) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
