import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Liste satırı işlemleri — yuvarlatılmış özel dropdown (Düzenle / Sil).
 */
export default function AdminRowActions({ editTo, onDelete, label = 'İşlem' }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuStyle(null);
      return undefined;
    }

    const place = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = Math.max(rect.width, 132);
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
        minWidth: menuWidth,
        zIndex: 1200,
      });
    };

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`admin-row-actions${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="admin-row-actions__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} aria-hidden="true" />
      </button>

      {open && menuStyle && (
        <div className="admin-row-actions__menu" role="menu" style={menuStyle}>
          <button
            type="button"
            role="menuitem"
            className="admin-row-actions__item"
            onClick={() => {
              setOpen(false);
              if (editTo) navigate(editTo);
            }}
          >
            <i className="fas fa-pen" aria-hidden="true" />
            Düzenle
          </button>
          <button
            type="button"
            role="menuitem"
            className="admin-row-actions__item is-danger"
            onClick={() => {
              setOpen(false);
              onDelete?.();
            }}
          >
            <i className="fas fa-trash" aria-hidden="true" />
            Sil
          </button>
        </div>
      )}
    </div>
  );
}
