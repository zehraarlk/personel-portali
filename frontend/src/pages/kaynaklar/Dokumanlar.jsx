import { useEffect, useState } from 'react';
import KaynaklarShell from '../../components/KaynaklarShell';
import { fetchDokumanlar } from '../../api/client';
import { KAYNAK_PAGES } from './config';

const page = KAYNAK_PAGES.dokumanlar;

function normalizeIcon(icon) {
  const value = (icon || 'fas fa-file-alt').trim();

  if (value.startsWith('fa-') && !value.includes(' ')) {
    return `fas ${value}`;
  }

  return value;
}

export default function Dokumanlar() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    fetchDokumanlar(search)
      .then((data) => {
        if (!cancelled) {
          setItems(Array.isArray(data.dokumanlar) ? data.dokumanlar : []);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setItems([]);
          setError(
            requestError.message || 'Dokümanlar yüklenirken bir sorun oluştu.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search]);

  const clearSearch = () => {
    setQuery('');
    setSearch('');
  };

  return (
    <KaynaklarShell
      title={page.title}
      description={page.description}
      searchPlaceholder={page.searchPlaceholder}
      searchId={page.searchId}
      statCount={!loading && !error ? items.length : null}
      statLabel={page.statLabel}
      query={query}
      search={search}
      onQueryChange={setQuery}
      onSearch={setSearch}
      onClearSearch={clearSearch}
    >
      {search && !loading && !error ? (
        <p className="protokoller-filter-note">
          “<strong>{search}</strong>” için {items.length} sonuç
        </p>
      ) : null}

      {loading ? (
        <div className="protokoller-state" role="status">
          <span className="protokoller-state__pulse" aria-hidden="true" />
          Dokümanlar yükleniyor…
        </div>
      ) : null}

      {!loading && error ? (
        <p className="protokoller-state protokoller-state--error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="protokoller-empty">
          <i className="fas fa-file-alt" aria-hidden="true" />
          <h2>Doküman bulunamadı</h2>
          <p>
            {search
              ? 'Arama ifadenizi değiştirerek tekrar deneyebilirsiniz.'
              : 'Henüz yayımlanmış bir doküman bulunmuyor.'}
          </p>

          {search ? (
            <button
              type="button"
              className="protokoller-toolbar__btn"
              onClick={clearSearch}
            >
              Aramayı temizle
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="protokoller-grid">
          {items.map((item, index) => {
            const href = item.dosya_yolu || item.resmi_sayfa || '';
            const Card = href ? 'a' : 'article';
            const linkProps = href
              ? {
                  href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }
              : {};

            return (
              <Card
                key={item.id}
                className="protokol-card"
                style={{ '--card-delay': `${Math.min(index, 8) * 40}ms` }}
                {...linkProps}
              >
                <span className="protokol-card__accent" aria-hidden="true" />

                <div className="protokol-card__body">
                  <div className="protokol-card__top">
                    <span className="protokol-card__icon" aria-hidden="true">
                      <i className={normalizeIcon(item.ikon)} />
                    </span>

                    <div className="protokol-card__chips">
                      {item.tarih ? (
                        <span className="protokol-chip">
                          <i className="far fa-calendar-alt" aria-hidden="true" />
                          {item.tarih}
                        </span>
                      ) : null}

                      {item.boyut ? (
                        <span className="protokol-chip">
                          <i className="far fa-file-alt" aria-hidden="true" />
                          {item.boyut}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <h2 className="protokol-card__title">{item.baslik}</h2>
                  <p className="protokol-card__desc">{item.aciklama}</p>
                </div>

                {href ? (
                  <span className="protokol-card__cta">
                    Dokümanı görüntüle
                    <i className="fas fa-arrow-right" aria-hidden="true" />
                  </span>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : null}
    </KaynaklarShell>
  );
}
