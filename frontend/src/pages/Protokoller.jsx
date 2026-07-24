import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchProtokoller } from '../api/client';
import '../styles/protokoller.css';

const QUICK_LINKS = [
  { to: '/protokoller', label: 'Protokoller', icon: 'fas fa-file-signature' },
  { to: '/dokumanlar', label: 'Dökümanlar', icon: 'fas fa-file-alt' },
  { to: '/mevzuatlar', label: 'Mevzuatlar', icon: 'fas fa-balance-scale' },
  { to: '/egitimler', label: 'Eğitimler', icon: 'fas fa-graduation-cap' },
];

function normalizeIcon(ikon) {
  const raw = (ikon || 'fas fa-file-signature').trim();
  if (raw.startsWith('fa-') && !raw.includes(' ')) return `fas ${raw}`;
  return raw;
}

export default function Protokoller() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProtokoller(search)
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
  }, [search]);

  const filtered = useMemo(() => items, [items]);

  const onSubmitSearch = (e) => {
    e.preventDefault();
    setSearch(query.trim());
  };

  const clearSearch = () => {
    setQuery('');
    setSearch('');
  };

  return (
    <Layout>
      <div className="protokoller-page">
        <header className="protokoller-hero">
          <div className="protokoller-hero__text">
            <span className="protokoller-hero__eyebrow">Kaynaklar</span>
            <h1>Protokoller</h1>
            <p>
              Personel ve kurumsal indirim anlaşmalarını inceleyin; ilgili belgeye tek
              tıkla ulaşın.
            </p>
          </div>
          {!loading && !error ? (
            <div className="protokoller-hero__stat" aria-live="polite">
              <strong>{filtered.length}</strong>
              <span>aktif protokol</span>
            </div>
          ) : null}
        </header>

        <div className="protokoller-bar">
          <form className="protokoller-toolbar" onSubmit={onSubmitSearch} role="search">
            <label className="protokoller-toolbar__field" htmlFor="protokol-ara">
              <i className="fas fa-search" aria-hidden="true" />
              <input
                id="protokol-ara"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kurum veya protokol adı ara…"
                autoComplete="off"
              />
            </label>
            <div className="protokoller-toolbar__actions">
              <button type="submit" className="protokoller-toolbar__btn">
                Ara
              </button>
              {search ? (
                <button type="button" className="protokoller-toolbar__ghost" onClick={clearSearch}>
                  Temizle
                </button>
              ) : null}
            </div>
          </form>

          <nav className="protokoller-quick" aria-label="Hızlı erişim">
            {QUICK_LINKS.map((item) => {
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

        {search && !loading && !error ? (
          <p className="protokoller-filter-note">
            “<strong>{search}</strong>” için {filtered.length} sonuç
          </p>
        ) : null}

        {loading && (
          <div className="protokoller-state" role="status">
            <span className="protokoller-state__pulse" aria-hidden="true" />
            Protokoller yükleniyor…
          </div>
        )}
        {!loading && error && (
          <p className="protokoller-state protokoller-state--error">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="protokoller-empty">
            <i className="fas fa-file-signature" aria-hidden="true" />
            <h2>Sonuç bulunamadı</h2>
            <p>Aramanızı değiştirerek tekrar deneyebilirsiniz.</p>
            {search ? (
              <button type="button" className="protokoller-toolbar__btn" onClick={clearSearch}>
                Aramayı temizle
              </button>
            ) : null}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="protokoller-grid">
            {filtered.map((item, index) => {
              const href = item.dosya_yolu || item.resmi_sayfa || undefined;
              const CardTag = href ? 'a' : 'article';
              const cardProps = href
                ? {
                    href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }
                : {};

              return (
                <CardTag
                  key={item.id}
                  className="protokol-card"
                  style={{ '--card-delay': `${Math.min(index, 8) * 40}ms` }}
                  {...cardProps}
                >
                  <span className="protokol-card__accent" aria-hidden="true" />
                  <div className="protokol-card__body">
                    <div className="protokol-card__top">
                      <span className="protokol-card__icon" aria-hidden="true">
                        <i className={normalizeIcon(item.ikon)} />
                      </span>
                      <div className="protokol-card__chips">
                        <span className="protokol-chip">
                          <i className="far fa-calendar-alt" aria-hidden="true" />
                          {item.tarih || '—'}
                        </span>
                        <span className="protokol-chip">
                          <i className="far fa-file-alt" aria-hidden="true" />
                          {item.boyut || '—'}
                        </span>
                      </div>
                    </div>

                    <h2 className="protokol-card__title">{item.baslik}</h2>
                    <p className="protokol-card__desc">{item.aciklama}</p>
                  </div>

                  {href ? (
                    <span className="protokol-card__cta">
                      Detaylı bilgi için tıklayınız
                      <i className="fas fa-arrow-right" aria-hidden="true" />
                    </span>
                  ) : null}
                </CardTag>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}