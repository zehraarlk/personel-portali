import { useEffect, useMemo, useState } from 'react';
import KaynaklarShell from '../../components/KaynaklarShell';
import { fetchProtokoller } from '../../api/client';
import { KAYNAK_PAGES } from './config';

function normalizeIcon(ikon) {
  const raw = (ikon || 'fas fa-file-signature').trim();
  if (raw.startsWith('fa-') && !raw.includes(' ')) return `fas ${raw}`;
  return raw;
}

const page = KAYNAK_PAGES.protokoller;

export default function Protokoller() {
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

  return (
    <KaynaklarShell
      title={page.title}
      description={page.description}
      searchPlaceholder={page.searchPlaceholder}
      searchId={page.searchId}
      statCount={!loading && !error ? filtered.length : null}
      statLabel={page.statLabel}
      query={query}
      search={search}
      onQueryChange={setQuery}
      onSearch={setSearch}
      onClearSearch={() => {
        setQuery('');
        setSearch('');
      }}
    >
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
            <button
              type="button"
              className="protokoller-toolbar__btn"
              onClick={() => {
                setQuery('');
                setSearch('');
              }}
            >
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
    </KaynaklarShell>
  );
}
