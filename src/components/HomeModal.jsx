import { useState } from 'react';
import { geocodeAddress } from '../lib/geocode';
import { DEFAULT_HOME } from '../lib/home';

export default function HomeModal({ home, onSave, onReset, onClose }) {
  const [address, setAddress] = useState(home.isDefault ? '' : home.label);
  const [lat, setLat] = useState(home.lat);
  const [lng, setLng] = useState(home.lng);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleLocate() {
    setError('');
    if (!address.trim()) {
      setError('Type an address first.');
      return;
    }
    setBusy(true);
    try {
      const result = await geocodeAddress(`${address}, Sofia, Bulgaria`);
      if (!result) setError('Address not found — try a nearby intersection, or set it by map click.');
      else {
        setLat(result.lat);
        setLng(result.lng);
      }
    } catch {
      setError('Lookup failed (offline?). Enter coordinates manually if needed.');
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      label: address.trim() || 'My home',
      isDefault: false,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Set your home location</h2>
        <p className="field-hint">
          Stays in this browser only — it is never sent anywhere or stored in the app's code.
        </p>

        <label>
          Address
          <div className="input-with-button">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Vitosha Blvd 15"
              autoFocus
            />
            <button type="button" onClick={handleLocate} disabled={busy}>
              {busy ? 'Locating…' : '📍 Locate'}
            </button>
          </div>
        </label>
        {error && <div className="field-error">{error}</div>}

        <div className="form-row">
          <label>
            Latitude
            <input type="number" step="0.000001" value={lat} onChange={(e) => setLat(e.target.value)} />
          </label>
          <label>
            Longitude
            <input type="number" step="0.000001" value={lng} onChange={(e) => setLng(e.target.value)} />
          </label>
        </div>
        <p className="field-hint">
          Or close this and use "Set home by map click" to drop the pin exactly.
        </p>

        <div className="modal-actions">
          {!home.isDefault && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                onReset();
                onClose();
              }}
            >
              Clear ({DEFAULT_HOME.label})
            </button>
          )}
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save home
          </button>
        </div>
      </form>
    </div>
  );
}
