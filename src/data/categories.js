export const DEFAULT_RADIUS_METERS = 1300; // roughly a 10-15 block radius in central Sofia

export const CATEGORIES = [
  { id: 'Groceries', emoji: '🛒', color: '#2e7d32' },
  { id: 'Food & Drink', emoji: '🍽️', color: '#f57c00' },
  { id: 'Pharmacy', emoji: '💊', color: '#00897b' },
  { id: 'Health', emoji: '🏥', color: '#e53935' },
  { id: 'Shopping', emoji: '🛍️', color: '#d81b60' },
  { id: 'Services', emoji: '🔧', color: '#795548' },
  { id: 'Bank/ATM', emoji: '🏦', color: '#00838f' },
  { id: 'Cinema', emoji: '🎬', color: '#8e24aa' },
  { id: 'Culture', emoji: '🎭', color: '#5e35b1' },
  { id: 'Education', emoji: '🎓', color: '#3949ab' },
  { id: 'Public Services', emoji: '🏛️', color: '#1565c0' },
  { id: 'Parks & Leisure', emoji: '🌳', color: '#388e3c' },
  { id: 'Transport', emoji: '🚇', color: '#546e7a' },
  { id: 'Other', emoji: '📍', color: '#616161' },
];

const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function categoryMeta(id) {
  return byId[id] || byId.Other;
}

export function isKnownCategory(id) {
  return Boolean(byId[id]);
}
