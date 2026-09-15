import { useCallback, useEffect, useMemo, useState } from 'react';
import seed from '../data/places_seed.json';
import { isKnownCategory } from '../data/categories';
import { loadState, saveState, SEED_VERSION } from '../lib/storage';

function withTimestamps(p) {
  const now = Date.now();
  return { tags: [], createdAt: now, updatedAt: now, ...p };
}

function makeId() {
  return 'custom-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

function normalize(p) {
  return {
    ...p,
    tags: Array.isArray(p.tags) ? p.tags : [],
    category: isKnownCategory(p.category) ? p.category : 'Other',
  };
}

// Matches a stored place against a refreshed seed record when ids don't line up
// (the id scheme changed between dataset versions).
function matchKey(p) {
  return `${(p.name || '').toLowerCase()}|${p.lat.toFixed(4)}|${p.lng.toFixed(4)}`;
}

function buildInitialState() {
  const stored = loadState();
  if (!stored) {
    return { places: seed.map(withTimestamps), deletedSeedIds: [] };
  }

  const places = stored.places.map(normalize);
  if (stored.seedVersion >= SEED_VERSION) {
    return { places, deletedSeedIds: stored.deletedSeedIds };
  }

  // Dataset refresh: replace untouched OSM entries with the new data, but keep
  // everything the user owns — their own places, their edits, and their deletions.
  const deleted = new Set(stored.deletedSeedIds);
  const custom = places.filter((p) => p.source === 'custom');
  const editedByKey = new Map(
    places.filter((p) => p.source !== 'custom' && p.userEdited).map((p) => [matchKey(p), p])
  );

  const refreshed = [];
  for (const s of seed) {
    if (deleted.has(s.id)) continue;
    const prior = editedByKey.get(matchKey(s));
    refreshed.push(prior ? { ...prior, id: s.id } : withTimestamps(s));
  }

  return { places: [...refreshed, ...custom], deletedSeedIds: stored.deletedSeedIds };
}

export function usePlaces() {
  const [state, setState] = useState(buildInitialState);

  useEffect(() => {
    saveState({
      seedVersion: SEED_VERSION,
      places: state.places,
      deletedSeedIds: state.deletedSeedIds,
    });
  }, [state]);

  const addPlace = useCallback((data) => {
    const id = makeId();
    const now = Date.now();
    setState((prev) => ({
      ...prev,
      places: [
        ...prev.places,
        { ...data, id, source: 'custom', tags: data.tags || [], createdAt: now, updatedAt: now },
      ],
    }));
    return id;
  }, []);

  const updatePlace = useCallback((id, data) => {
    setState((prev) => ({
      ...prev,
      places: prev.places.map((p) =>
        p.id === id ? { ...p, ...data, userEdited: true, updatedAt: Date.now() } : p
      ),
    }));
  }, []);

  const deletePlace = useCallback((id) => {
    setState((prev) => ({
      places: prev.places.filter((p) => p.id !== id),
      deletedSeedIds: id.startsWith('osm-')
        ? [...prev.deletedSeedIds, id]
        : prev.deletedSeedIds,
    }));
  }, []);

  // Adds/removes a tag across the whole collection, so a typo can be fixed in one go.
  const renameTag = useCallback((from, to) => {
    const target = to.trim();
    setState((prev) => ({
      ...prev,
      places: prev.places.map((p) => {
        if (!p.tags.includes(from)) return p;
        const rest = p.tags.filter((t) => t !== from);
        return { ...p, tags: target && !rest.includes(target) ? [...rest, target] : rest };
      }),
    }));
  }, []);

  const allTags = useMemo(() => {
    const counts = new Map();
    for (const p of state.places) {
      for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [state.places]);

  return {
    places: state.places,
    allTags,
    addPlace,
    updatePlace,
    deletePlace,
    renameTag,
  };
}
