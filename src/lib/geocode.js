// Looks up an address using OpenStreetMap's free Nominatim geocoder.
// Only ever called on explicit user action (button click), never automatically,
// to stay within Nominatim's usage policy of light, human-triggered use.
export async function geocodeAddress(query) {
  const q = query && query.trim();
  if (!q) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Geocoding request failed');

  const data = await res.json();
  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
