import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ADMIN_BASE, ADMIN_NAV } from '../navConfig';
import { BRAND_IMG } from '../constants';

function isActive(pathname, item) {
  const path = pathname.replace(/\/$/, '') || '/';
  const target = item.to.replace(/\/$/, '') || '/';
  if (item.end) return path === target;
  return path === target || path.startsWith(`${target}/`);
}

export default function AdminSidebar({ open, onClose }) {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <aside className={`admin-sidebar${open ? ' is-open' : ''}`}>
      <div className="admin-sidebar__brand-row">
        <Link to={ADMIN_BASE} className="admin-sidebar__brand" onClick={onClose}>
          <span className="admin-sidebar__brand-mark" aria-hidden="true">
            <img src={BRAND_IMG} alt="" />
          </span>
          <div>
            <strong>Yönetim Paneli</strong>
            <span>Gebze Belediyesi</span>
          </div>
        </Link>
        <button type="button" className="admin-sidebar__close" onClick={onClose} aria-label="Kapat">
          <i className="fas fa-times" aria-hidden="true" />
        </button>
      </div>

      <nav className="admin-sidebar__nav">
        {ADMIN_NAV.map((section, idx) => (
          <div key={section.title ?? `sec-${idx}`}>
            {section.title && <p className="admin-nav-section">{section.title}</p>}
            {section.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`admin-nav-link${isActive(location.pathname, item) ? ' is-active' : ''}`}
              >
                <i className={item.icon} aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
