import { useEffect, useId, useRef, useState } from 'react';
import { fetchSiteIcons } from '../api/client';

function normalizeIconOptions(items = []) {
  const seen = new Set();
  const options = [];

  items.forEach((item) => {
    const value = item?.ikon_sinifi?.trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    options.push({
      value,
      label: item?.ad?.trim() || item?.anahtar?.trim() || value,
      kategori: item?.kategori || '',
    });
  });

  return options;
}

/**
 * site_ikonlari listesinden görsel ikon seçici (custom combobox).
 * value: Font Awesome sınıfı (örn. "fas fa-hospital")
 */
export default function IconSelectField({
  value = '',
  onChange,
  defaultIcon = 'fas fa-file-alt',
  label = 'İkon değiştir',
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSiteIcons()
      .then((data) => {
        if (cancelled) return;
        setOptions(normalizeIconOptions(data?.items || []));
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = value || defaultIcon;
  const selected =
    options.find((o) => o.value === current) ||
    (current ? { value: current, label: current } : null);

  const filtered = query.trim()
    ? options.filter((o) => {
        const q = query.trim().toLocaleLowerCase('tr-TR');
        return (
          o.label.toLocaleLowerCase('tr-TR').includes(q) ||
          o.value.toLocaleLowerCase('tr-TR').includes(q) ||
          (o.kategori || '').toLocaleLowerCase('tr-TR').includes(q)
        );
      })
    : options;

  const pick = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="admin-icon-picker" ref={rootRef}>
      <span className="admin-image-picker__label">{label}</span>

      <div className="admin-form-preview admin-form-preview--icon">
        <div className="admin-form-preview__empty">
          <i className={current} aria-hidden="true" />
          <span>{selected?.label || 'Önizleme'}</span>
        </div>
      </div>

      <div className={`admin-icon-select${open ? ' is-open' : ''}`}>
        <button
          type="button"
          className="admin-icon-select__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="admin-icon-select__current">
            <i className={current} aria-hidden="true" />
            <span className="admin-icon-select__text">
              <strong>{selected?.label || 'İkon seç'}</strong>
              <small>{current}</small>
            </span>
          </span>
          <i
            className={`fas fa-chevron-${open ? 'up' : 'down'} admin-icon-select__chevron`}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div className="admin-icon-select__panel" role="presentation">
            <input
              type="search"
              className="admin-icon-select__search"
              placeholder="İkon ara…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <ul
              id={listId}
              className="admin-icon-select__list"
              role="listbox"
              aria-label="Site ikonları"
            >
              {loading && (
                <li className="admin-icon-select__empty">İkonlar yükleniyor…</li>
              )}
              {!loading && filtered.length === 0 && (
                <li className="admin-icon-select__empty">İkon bulunamadı.</li>
              )}
              {!loading &&
                filtered.map((opt) => {
                  const active = opt.value === current;
                  return (
                    <li key={opt.value} role="option" aria-selected={active}>
                      <button
                        type="button"
                        className={`admin-icon-select__option${active ? ' is-active' : ''}`}
                        onClick={() => pick(opt)}
                      >
                        <i className={opt.value} aria-hidden="true" />
                        <span className="admin-icon-select__text">
                          <strong>{opt.label}</strong>
                          <small>{opt.value}</small>
                        </span>
                        {active ? (
                          <i className="fas fa-check admin-icon-select__check" aria-hidden="true" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
