import { useEffect, useMemo, useState } from 'react';
import './App.css';
import HomeModal from './components/HomeModal';
import MapView from './components/MapView';
import PlaceModal from './components/PlaceModal';
import Sidebar from './components/Sidebar';
import { CATEGORIES } from './data/categories';
import { usePlaces } from './hooks/usePlaces';
import { DEFAULT_HOME, distanceMeters, loadHome, saveHome } from './lib/home';

const ALL_CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

export default function App() {
  const { places, allTags, addPlace, updatePlace, deletePlace, renameTag } = usePlaces();

  const [home, setHome] = useState(loadHome);
  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState(ALL_CATEGORY_IDS);
  const [activeTags, setActiveTags] = useState(new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [showRadius, setShowRadius] = useState(true);
  const [addMode, setAddMode] = useState(null); // null | 'place' | 'home'
  const [modal, setModal] = useState(null); // null | { initial }
  const [homeModalOpen, setHomeModalOpen] = useState(false);

  useEffect(() => {
    saveHome(home);
  }, [home]);

  const counts = useMemo(() => {
    const c = {};
    for (const p of places) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, [places]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = places.filter((p) => {
      if (!activeCategories.has(p.category)) return false;
      if (activeTags.size && !p.tags.some((t) => activeTags.has(t))) return false;
      if (!q) return true;
      return (
        [p.name, p.address, p.subcategory, p.category].some((f) =>
          (f || '').toLowerCase().includes(q)
        ) || p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
    return matches
      .map((p) => ({ ...p, distance: distanceMeters(home, p) }))
      .sort((a, b) => a.distance - b.distance);
  }, [places, activeCategories, activeTags, search, home]);

  function toggleCategory(id) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next.size === 0 ? new Set(ALL_CATEGORY_IDS) : next;
    });
  }

  function selectAllCategories() {
    setActiveCategories(new Set(ALL_CATEGORY_IDS));
  }

  function toggleTag(name) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function openAddModal(initial) {
    setAddMode(null);
    setModal({ initial: { lat: home.lat, lng: home.lng, ...initial } });
  }

  function openEditModal(id) {
    const place = places.find((p) => p.id === id);
    if (place) setModal({ initial: place });
  }

  function handleDelete(id) {
    const place = places.find((p) => p.id === id);
    const label = place ? place.name : 'this place';
    if (window.confirm(`Delete "${label}"? This can't be undone.`)) {
      deletePlace(id);
      if (selectedId === id) setSelectedId(null);
    }
  }

  function handleSave(data) {
    if (data.id) {
      updatePlace(data.id, data);
    } else {
      const id = addPlace(data);
      setSelectedId(id);
    }
    setModal(null);
  }

  function handleMapPick(latlng) {
    if (addMode === 'home') {
      setHome({ lat: latlng.lat, lng: latlng.lng, label: 'My home', isDefault: false });
      setAddMode(null);
      return;
    }
    openAddModal({ lat: latlng.lat, lng: latlng.lng });
  }

  return (
    <div className="app-layout">
      <Sidebar
        search={search}
        onSearchChange={setSearch}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        onSelectAllCategories={selectAllCategories}
        allTags={allTags}
        activeTags={activeTags}
        onToggleTag={toggleTag}
        onClearTags={() => setActiveTags(new Set())}
        onRenameTag={renameTag}
        counts={counts}
        totalVisible={results.length}
        totalAll={places.length}
        results={results}
        selectedId={selectedId}
        onSelectPlace={setSelectedId}
        onEditPlace={openEditModal}
        onDeletePlace={handleDelete}
        onAddNew={() => openAddModal()}
        addMode={addMode}
        onToggleAddMode={() => setAddMode((v) => (v === 'place' ? null : 'place'))}
        onToggleHomeMode={() => setAddMode((v) => (v === 'home' ? null : 'home'))}
        home={home}
        onEditHome={() => setHomeModalOpen(true)}
        showRadius={showRadius}
        onToggleRadius={() => setShowRadius((v) => !v)}
      />

      <div className="map-pane">
        <MapView
          home={home}
          places={results}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onEdit={openEditModal}
          onDelete={handleDelete}
          showRadius={showRadius}
          addMode={addMode}
          onPickLocation={handleMapPick}
        />
      </div>

      {modal && (
        <PlaceModal
          initial={modal.initial}
          allTags={allTags}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {homeModalOpen && (
        <HomeModal
          home={home}
          onSave={(next) => {
            setHome(next);
            setHomeModalOpen(false);
          }}
          onReset={() => setHome(DEFAULT_HOME)}
          onClose={() => setHomeModalOpen(false)}
        />
      )}
    </div>
  );
}
