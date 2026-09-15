const STORAGE_KEY = 'sofia-map-places-v1';

// Bumped whenever the bundled OSM dataset is refreshed, so existing browsers
// pick up the new places instead of staying on whatever they seeded with.
export const SEED_VERSION = 2;

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    // the original format was a bare array of places
    if (Array.isArray(parsed)) {
      return { seedVersion: 1, places: parsed, deletedSeedIds: [] };
    }
    return {
      seedVersion: parsed.seedVersion || 1,
      places: parsed.places || [],
      deletedSeedIds: parsed.deletedSeedIds || [],
    };
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable; data stays in memory for this session
  }
}
