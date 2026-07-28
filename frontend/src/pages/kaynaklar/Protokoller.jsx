import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { fetchProtokoller } from '../../api/client';
import useSiteIcons from '../../hooks/useSiteIcons';
import { KAYNAK_PAGES, KAYNAK_QUICK_LINKS } from './config';
import '../../styles/protokoller.css';

function normalizeIcon(ikon) {
  const raw = (ikon || 'fas fa-file-signature').trim();
  if (raw.startsWith('fa-') && !raw.includes(' ')) return `fas ${raw}`;
  return raw;
}

const page = KAYNAK_PAGES.protokoller;

export default function Protokoller() {
  const { icon } = useSiteIcons();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProtokoller()
      .then((data) => {
        if (cancelled) return;
        setItems(data.protokoller ?? []);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError('Protokoller yüklenirken bir sorun oluştu.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr-TR');
    if (!q) return items;
    return items.filter((item) => {
      const haystack = `${item.baslik || ''} ${item.aciklama || ''}`.toLocaleLowerCase(
        'tr-TR',
      );
      return haystack.includes(q);
    });
  }, [items, search]);

  const onSearch = (e) => {
    e.preventDefault();
    setSearch(query.trim());
  };

  const clearSearch = () => {
    setQuery('');
    setSearch('');
  };

  return (
    <Layout>
      <div className="prt-page">
        <header className="prt-head">
          <div className="prt-head__icon" aria-hidden="true">
            <i className={icon('protokoller')} />
          </div>
          <div className="prt-head__text">
            <p className="prt-head__eyebrow">Kaynaklar</p>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
          </div>
        </header>

        <nav className="prt-tabs" aria-label="Kaynaklar">
          {KAYNAK_QUICK_LINKS.map((item) => {
            const active = item.to === '/protokoller';
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

        <section className="prt-toolbar" aria-label="Arama">
          <form className="prt-search" onSubmit={onSearch} role="search">
            <label className="prt-search__field" htmlFor={page.searchId}>
              <i className={icon('arama')} aria-hidden="true" />
              <input
                id={page.searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={page.searchPlaceholder}
                autoComplete="off"
              />
            </label>
            <button type="submit" className="prt-search__btn">
              Ara
            </button>
            {search ? (
              <button type="button" className="prt-search__clear" onClick={clearSearch}>
                Temizle
              </button>
            ) : null}
          </form>
        </section>

        <div className="prt-results" aria-live="polite">
          {!loading && !error ? (
            <p className="prt-results__count">
              {search ? (
                <>
                  “<strong>{search}</strong>” için <strong>{filtered.length}</strong> sonuç
                </>
              ) : (
                <>
                  Toplam <strong>{filtered.length}</strong> {page.statLabel}
                </>
              )}
            </p>
          ) : (
            <span />
          )}
        </div>

        {loading ? (
          <p className="prt-state" role="status">
            Protokoller yükleniyor…
          </p>
        ) : null}

        {!loading && error ? (
          <p className="prt-state prt-state--error" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <div className="prt-empty">
            <i className={icon('protokoller')} aria-hidden="true" />
            <h2>Sonuç bulunamadı</h2>
            <p>Aramanızı değiştirerek tekrar deneyebilirsiniz.</p>
            {search ? (
              <button type="button" className="prt-search__btn" onClick={clearSearch}>
                Aramayı temizle
              </button>
            ) : null}
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <ul className="prt-list">
            {filtered.map((item) => {
              const href = item.dosya_yolu || item.resmi_sayfa || '';
              const content = (
                <>
                  <span className="prt-item__icon" aria-hidden="true">
                    <i className={normalizeIcon(item.ikon)} />
                  </span>
                  <span className="prt-item__body">
                    <span className="prt-item__title">{item.baslik}</span>
                    {item.aciklama ? (
                      <span className="prt-item__desc">{item.aciklama}</span>
                    ) : null}
                    <span className="prt-item__meta">
                      <span>
                        <i className="far fa-calendar-alt" aria-hidden="true" />
                        {item.tarih || '—'}
                      </span>
                      <span>
                        <i className="far fa-file-alt" aria-hidden="true" />
                        {item.boyut || '—'}
                      </span>
                    </span>
                  </span>
                  {href ? (
                    <span className="prt-item__action">
                      İncele
                      <i className={icon('sonraki')} aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              );

              return (
                <li key={item.id} className="prt-item">
                  {href ? (
                    <a
                      href={href}
                      className="prt-item__link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.baslik} belgesini aç`}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="prt-item__link is-static">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </Layout>
  );
}
