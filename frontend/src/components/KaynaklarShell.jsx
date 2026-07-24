import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from './Layout';
import { KAYNAK_QUICK_LINKS } from '../pages/kaynaklar/config';
import '../styles/protokoller.css';

/**
 * Kaynaklar sayfaları ortak iskeleti: hero + arama + hızlı erişim.
 * `children` veri alanıdır; boş bırakılabilir.
 */
export default function KaynaklarShell({
  title,
  description,
  searchPlaceholder,
  searchId,
  statCount = null,
  statLabel = '',
  query: controlledQuery,
  search: controlledSearch,
  onQueryChange,
  onSearch,
  onClearSearch,
  children,
}) {
  const location = useLocation();
  const [localQuery, setLocalQuery] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  const isControlled = controlledQuery !== undefined;
  const query = isControlled ? controlledQuery : localQuery;
  const search = isControlled ? controlledSearch : localSearch;

  const setQuery = (value) => {
    if (isControlled) onQueryChange?.(value);
    else setLocalQuery(value);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const next = query.trim();
    if (isControlled) onSearch?.(next);
    else setLocalSearch(next);
  };

  const clearSearch = () => {
    if (isControlled) onClearSearch?.();
    else {
      setLocalQuery('');
      setLocalSearch('');
    }
  };

  return (
    <Layout>
      <div className="protokoller-page">
        <header className="protokoller-hero">
          <div className="protokoller-hero__text">
            <span className="protokoller-hero__eyebrow">Kaynaklar</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {statCount !== null ? (
            <div className="protokoller-hero__stat" aria-live="polite">
              <strong>{statCount}</strong>
              <span>{statLabel}</span>
            </div>
          ) : null}
        </header>

        <div className="protokoller-bar">
          <form className="protokoller-toolbar" onSubmit={submitSearch} role="search">
            <label className="protokoller-toolbar__field" htmlFor={searchId}>
              <i className="fas fa-search" aria-hidden="true" />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                autoComplete="off"
              />
            </label>
            <div className="protokoller-toolbar__actions">
              <button type="submit" className="protokoller-toolbar__btn">
                Ara
              </button>
              {search ? (
                <button
                  type="button"
                  className="protokoller-toolbar__ghost"
                  onClick={clearSearch}
                >
                  Temizle
                </button>
              ) : null}
            </div>
          </form>

          <nav className="protokoller-quick" aria-label="Hızlı erişim">
            {KAYNAK_QUICK_LINKS.map((item) => {
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`protokoller-quick__btn${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <i className={item.icon} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {children}
      </div>
    </Layout>
  );
}
