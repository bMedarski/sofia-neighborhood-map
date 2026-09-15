import { CATEGORIES, categoryMeta } from '../data/categories';

const LIST_LIMIT = 150;

export default function Sidebar({
  search,
  onSearchChange,
  activeCategories,
  onToggleCategory,
  onSelectAllCategories,
  allTags,
  activeTags,
  onToggleTag,
  onClearTags,
  onRenameTag,
  counts,
  totalVisible,
  totalAll,
  results,
  selectedId,
  onSelectPlace,
  onEditPlace,
  onDeletePlace,
  onAddNew,
  addMode,
  onToggleAddMode,
  onToggleHomeMode,
  home,
  onEditHome,
  showRadius,
  onToggleRadius,
}) {
  const allActive = activeCategories.size === CATEGORIES.length;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Around Home</h1>
        <p className="subtitle">
          {home.isDefault ? 'No home set' : home.label}
          <button className="link-btn" onClick={onEditHome}>
            {home.isDefault ? 'set home' : 'change'}
          </button>
        </p>
      </div>

      {home.isDefault && (
        <div className="home-prompt">
          Set your home address to centre the map and sort places by distance. It is saved in
          this browser only.
        </div>
      )}

      <div className="sidebar-actions">
        <button className="btn btn-primary" onClick={onAddNew}>
          + Add place
        </button>
        <button
          className={`btn ${addMode === 'place' ? 'btn-active' : ''}`}
          onClick={onToggleAddMode}
          title="Click a spot on the map to add a place there"
        >
          📍 {addMode === 'place' ? 'Click the map…' : 'Add by map click'}
        </button>
      </div>

      <div className="sidebar-actions">
        <button
          className={`btn ${addMode === 'home' ? 'btn-active' : ''}`}
          onClick={onToggleHomeMode}
          title="Click the map to place your home pin"
        >
          🏠 {addMode === 'home' ? 'Click your home…' : 'Set home by map click'}
        </button>
      </div>

      <label className="toggle-row">
        <input type="checkbox" checked={showRadius} onChange={onToggleRadius} />
        Show ~15-block radius circle
      </label>

      <input
        className="search-input"
        type="search"
        placeholder="Search by name, address, type…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className="category-list">
        <button
          className={`chip ${allActive ? 'chip-active' : ''}`}
          onClick={onSelectAllCategories}
        >
          All ({totalAll})
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip ${activeCategories.has(c.id) ? 'chip-active' : ''}`}
            style={activeCategories.has(c.id) ? { borderColor: c.color, color: c.color } : undefined}
            onClick={() => onToggleCategory(c.id)}
          >
            {c.emoji} {c.id} ({counts[c.id] || 0})
          </button>
        ))}
      </div>

      <div className="tag-section">
        <div className="tag-section-head">
          <span>My tags {allTags.length > 0 && `(${allTags.length})`}</span>
          {activeTags.size > 0 && (
            <button className="link-btn" onClick={onClearTags}>
              clear
            </button>
          )}
        </div>
        {allTags.length === 0 ? (
          <p className="tag-empty">
            No tags yet — open any place, hit Edit, and add your own (e.g. "favourites",
            "late-night").
          </p>
        ) : (
          <div className="tag-filter-row">
            {allTags.map((t) => (
              <button
                key={t.name}
                className={`tag-filter ${activeTags.has(t.name) ? 'tag-filter-active' : ''}`}
                onClick={() => onToggleTag(t.name)}
                onDoubleClick={() => {
                  const next = window.prompt(`Rename tag "${t.name}" everywhere:`, t.name);
                  if (next !== null && next.trim() !== t.name) onRenameTag(t.name, next);
                }}
                title="Click to filter · double-click to rename everywhere"
              >
                {t.name} <span className="tag-filter-count">{t.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="results-summary">
        Showing {Math.min(results.length, LIST_LIMIT)} of {totalVisible} matching places
      </div>

      <div className="place-list">
        {results.slice(0, LIST_LIMIT).map((p) => {
          const meta = categoryMeta(p.category);
          return (
            <div
              key={p.id}
              className={`place-row ${selectedId === p.id ? 'place-row-selected' : ''}`}
              onClick={() => onSelectPlace(p.id)}
            >
              <span className="place-row-icon" style={{ background: meta.color }}>
                {meta.emoji}
              </span>
              <div className="place-row-body">
                <div className="place-row-name">{p.name}</div>
                <div className="place-row-meta">
                  {p.category}
                  {p.subcategory ? ` · ${p.subcategory}` : ''}
                  {typeof p.distance === 'number' ? ` · ${p.distance}m` : ''}
                </div>
                {p.tags.length > 0 && (
                  <div className="place-row-tags">
                    {p.tags.map((t) => (
                      <span key={t} className="tag-mini">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="place-row-actions">
                <button
                  className="icon-btn"
                  title="Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPlace(p.id);
                  }}
                >
                  ✏️
                </button>
                <button
                  className="icon-btn"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePlace(p.id);
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
        {results.length === 0 && <div className="empty-state">No places match your filters.</div>}
      </div>
    </div>
  );
}
