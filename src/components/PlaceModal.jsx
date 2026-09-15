import { useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { geocodeAddress } from '../lib/geocode';
import { DEFAULT_HOME } from '../lib/home';
import TagInput from './TagInput';

const emptyForm = {
  name: '',
  category: CATEGORIES[0].id,
  subcategory: '',
  address: '',
  lat: DEFAULT_HOME.lat,
  lng: DEFAULT_HOME.lng,
  phone: '',
  website: '',
  openingHours: '',
  notes: '',
  tags: [],
};

export default function PlaceModal({ initial, allTags, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...emptyForm, ...initial }));
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const isEdit = Boolean(initial && initial.id);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleLocate() {
    setGeocodeError('');
    if (!form.address.trim()) {
      setGeocodeError('Type an address first.');
      return;
    }
    setGeocoding(true);
    try {
      const result = await geocodeAddress(`${form.address}, Sofia, Bulgaria`);
      if (!result) {
        setGeocodeError('Address not found. Adjust lat/lng manually if needed.');
      } else {
        set('lat', result.lat);
        set('lng', result.lng);
      }
    } catch {
      setGeocodeError('Lookup failed (offline?). Adjust lat/lng manually if needed.');
    } finally {
      setGeocoding(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      name: form.name.trim(),
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      tags: form.tags,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{isEdit ? 'Edit place' : 'Add a new place'}</h2>

        <label>
          Name *
          <input
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Billa Vitosha"
          />
        </label>

        <div className="form-row">
          <label>
            Category *
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type (optional)
            <input
              value={form.subcategory}
              onChange={(e) => set('subcategory', e.target.value)}
              placeholder="e.g. supermarket"
            />
          </label>
        </div>

        <label>
          Address
          <div className="input-with-button">
            <input
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="e.g. Vitosha Blvd 15"
            />
            <button type="button" onClick={handleLocate} disabled={geocoding}>
              {geocoding ? 'Locating…' : '📍 Locate'}
            </button>
          </div>
        </label>
        {geocodeError && <div className="field-error">{geocodeError}</div>}

        <div className="form-row">
          <label>
            Latitude
            <input
              type="number"
              step="0.000001"
              value={form.lat}
              onChange={(e) => set('lat', e.target.value)}
            />
          </label>
          <label>
            Longitude
            <input
              type="number"
              step="0.000001"
              value={form.lng}
              onChange={(e) => set('lng', e.target.value)}
            />
          </label>
        </div>
        <p className="field-hint">
          Tip: close this and use "Add by map click" to drop a pin exactly where you want it.
        </p>

        <div className="form-row">
          <label>
            Phone
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </label>
          <label>
            Website
            <input value={form.website} onChange={(e) => set('website', e.target.value)} />
          </label>
        </div>

        <label>
          Opening hours
          <input
            value={form.openingHours}
            onChange={(e) => set('openingHours', e.target.value)}
            placeholder="e.g. Mon-Sat 09:00-20:00"
          />
        </label>

        <div className="field-block">
          <span className="field-label">My tags</span>
          <TagInput
            value={form.tags}
            onChange={(tags) => set('tags', tags)}
            suggestions={allTags}
          />
        </div>

        <label>
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEdit ? 'Save changes' : 'Add place'}
          </button>
        </div>
      </form>
    </div>
  );
}
