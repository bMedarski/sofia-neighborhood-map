import { useState } from 'react';

export default function TagInput({ value, onChange, suggestions }) {
  const [draft, setDraft] = useState('');

  function commit(raw) {
    const tag = raw.trim().replace(/^#/, '');
    if (!tag || value.includes(tag)) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  const unused = suggestions.filter((s) => !value.includes(s.name));

  return (
    <div className="tag-input">
      <div className="tag-input-box">
        {value.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button
              type="button"
              className="tag-chip-remove"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          list="tag-suggestions"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          placeholder={value.length ? 'Add another…' : 'e.g. favourites, late-night, cheap'}
        />
        <datalist id="tag-suggestions">
          {unused.map((s) => (
            <option key={s.name} value={s.name} />
          ))}
        </datalist>
      </div>
      {unused.length > 0 && (
        <div className="tag-suggest-row">
          {unused.slice(0, 8).map((s) => (
            <button
              key={s.name}
              type="button"
              className="tag-suggest"
              onClick={() => commit(s.name)}
            >
              + {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
