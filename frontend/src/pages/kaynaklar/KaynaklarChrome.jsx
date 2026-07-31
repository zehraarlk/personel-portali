import { Link, useLocation } from 'react-router-dom';
import useSiteIcons from '../../hooks/useSiteIcons';
import { KAYNAK_PAGES, KAYNAK_QUICK_LINKS } from './config';
import '../../styles/protokoller.css';
import '../../styles/mevzuatlar.css';
import '../../styles/kaynaklar.css';

/**
 * Kaynaklar sayfalarının ortak başlık + arama + hızlı erişim satırı.
 * Protokoller / Mevzuatlar görünümü; sayfa genişliği .kaynaklar-page ile Eğitimler gibi.
 */
export default function KaynaklarChrome({
  pageKey,
  query,
  onQueryChange,
  onClear,
  title,
  description,
  searchPlaceholder,
  searchId,
  iconClassName,
}) {
  const { icon } = useSiteIcons();
  const location = useLocation();
  const page = KAYNAK_PAGES[pageKey] || {};

  const resolvedTitle = title ?? page.title;
  const resolvedDescription = description ?? page.description;
  const resolvedPlaceholder = searchPlaceholder ?? page.searchPlaceholder;
  const resolvedSearchId = searchId ?? page.searchId ?? `${pageKey}-ara`;
  const resolvedIcon = iconClassName || icon(page.iconKey || pageKey);

  return (
    <>
      <header className="mevzuat-head">
        <div className="mevzuat-head-left">
          <span className="mevzuat-head-icon">
            <i className={resolvedIcon} aria-hidden="true" />
          </span>
          <div>
            <h1>{resolvedTitle}</h1>
            <p>{resolvedDescription}</p>
          </div>
        </div>
      </header>

      <div className="mevzuat-toolbar-row">
        <div className="prt-search mevzuat-toolbar-row__search">
          <label className="prt-search__field" htmlFor={resolvedSearchId}>
            <i className={icon('arama')} aria-hidden="true" />
            <input
              id={resolvedSearchId}
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={resolvedPlaceholder}
              autoComplete="off"
            />
          </label>
          {query ? (
            <button type="button" className="prt-search__clear" onClick={onClear}>
              Temizle
            </button>
          ) : null}
        </div>

        <nav className="prt-tabs mevzuat-toolbar-row__tabs" aria-label="Hızlı erişim">
          {KAYNAK_QUICK_LINKS.map((item) => {
            const active =
              location.pathname === item.to ||
              location.pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`prt-tabs__link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <i className={icon(item.iconKey)} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
