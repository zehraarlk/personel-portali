import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', label: 'Ana Sayfa' },
  { to: '/personel', label: 'Personel' },
  { to: '/test', label: 'Sistem Testi' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className="site-navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <button
              type="button"
              className="nav-hamburger"
              aria-label="Menüyü aç"
              onClick={() => setMenuOpen(true)}
            >
              <i className="fa-solid fa-bars" />
            </button>
            <Link to="/" className="nav-logo">
              Personel Portalı
            </Link>
          </div>

          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <span className="nav-user-placeholder" title="Giriş yakında">
              <i className="fa-regular fa-user" />
            </span>
          </div>
        </div>
      </nav>

      <div
        className={`menu-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />
      <aside className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          <span>Menü</span>
          <button
            type="button"
            className="side-menu-close"
            aria-label="Menüyü kapat"
            onClick={() => setMenuOpen(false)}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <ul className="side-menu-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <Link to={item.to} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
