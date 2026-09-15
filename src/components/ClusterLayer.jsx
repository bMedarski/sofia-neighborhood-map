import L from 'leaflet';
import 'leaflet.markercluster';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { categoryMeta } from '../data/categories';

function buildIcon(place) {
  const meta = categoryMeta(place.category);
  const html = `<div class="pin" style="background:${meta.color}">${meta.emoji}</div>`;
  return L.divIcon({
    html,
    className: 'pin-wrapper',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function buildPopupHtml(place) {
  const meta = categoryMeta(place.category);
  const rows = [];
  if (place.address) rows.push(`<div class="popup-row">📍 ${escapeHtml(place.address)}</div>`);
  if (place.openingHours) rows.push(`<div class="popup-row">🕒 ${escapeHtml(place.openingHours)}</div>`);
  if (place.phone) rows.push(`<div class="popup-row">📞 ${escapeHtml(place.phone)}</div>`);
  if (place.website) {
    const href = /^https?:\/\//i.test(place.website) ? place.website : `https://${place.website}`;
    rows.push(`<div class="popup-row">🔗 <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(place.website)}</a></div>`);
  }
  if (place.notes) rows.push(`<div class="popup-row popup-notes">${escapeHtml(place.notes)}</div>`);
  if (place.tags && place.tags.length) {
    const chips = place.tags
      .map((t) => `<span class="tag-mini">${escapeHtml(t)}</span>`)
      .join('');
    rows.push(`<div class="popup-row popup-tags">${chips}</div>`);
  }

  return `
    <div class="place-popup">
      <div class="popup-title">${meta.emoji} ${escapeHtml(place.name)}</div>
      <div class="popup-category" style="color:${meta.color}">${escapeHtml(place.category)}${place.subcategory ? ' · ' + escapeHtml(place.subcategory) : ''}${typeof place.distance === 'number' ? ' · ' + place.distance + 'm away' : ''}</div>
      ${rows.join('')}
      <div class="popup-actions">
        <button class="popup-btn" data-action="edit" data-id="${escapeHtml(place.id)}">Edit</button>
        <button class="popup-btn popup-btn-danger" data-action="delete" data-id="${escapeHtml(place.id)}">Delete</button>
      </div>
    </div>
  `;
}

// leaflet.markercluster is a plain-Leaflet plugin, not React-aware, so this layer
// manages its own markers imperatively instead of rendering <Marker> children.
export default function ClusterLayer({ places, selectedId, onSelect, onEdit, onDelete }) {
  const map = useMap();
  const clusterRef = useRef(null);
  const markersRef = useRef(new Map());
  const actionsRef = useRef({ onEdit, onDelete, onSelect });

  useEffect(() => {
    actionsRef.current = { onEdit, onDelete, onSelect };
  }, [onEdit, onDelete, onSelect]);

  useEffect(() => {
    const cluster = L.markerClusterGroup({ maxClusterRadius: 50, spiderfyOnMaxZoom: true });
    clusterRef.current = cluster;
    const markersById = new Map();

    for (const place of places) {
      const marker = L.marker([place.lat, place.lng], { icon: buildIcon(place) });
      marker.bindPopup(buildPopupHtml(place), { maxWidth: 260 });
      marker.on('click', () => actionsRef.current.onSelect(place.id));
      marker.on('popupopen', (e) => {
        const el = e.popup.getElement();
        if (!el) return;
        el.querySelectorAll('[data-action="edit"]').forEach((btn) =>
          btn.addEventListener('click', () => actionsRef.current.onEdit(place.id))
        );
        el.querySelectorAll('[data-action="delete"]').forEach((btn) =>
          btn.addEventListener('click', () => actionsRef.current.onDelete(place.id))
        );
      });
      cluster.addLayer(marker);
      markersById.set(place.id, marker);
    }

    markersRef.current = markersById;
    map.addLayer(cluster);

    return () => {
      map.removeLayer(cluster);
      markersRef.current = new Map();
    };
  }, [places, map]);

  useEffect(() => {
    if (!selectedId) return;
    const marker = markersRef.current.get(selectedId);
    if (!marker) return;
    const cluster = clusterRef.current;
    if (cluster && cluster.zoomToShowLayer) {
      cluster.zoomToShowLayer(marker, () => marker.openPopup());
    } else {
      marker.openPopup();
    }
  }, [selectedId]);

  return null;
}
