import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { fetchProtokoller } from '../api/client';
import '../styles/protokoller.css';

function normalizeIcon(ikon) {
  const raw = (ikon || 'fas fa-file-signature').trim();
  if (raw.startsWith('fa-') && !raw.includes(' ')) return `fas ${raw}`;
  return raw;
}

export default function Protokoller() {
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

  return (
    <Layout>
      <div className="protokoller-page">
        <header className="protokoller-header">
          <h1>Protokoller</h1>
          <p>
            Belediyemizin personel ve kurumsal indirim anlaşmalarına buradan
            ulaşabilirsiniz.
          </p>
        </header>

        <form className="protokoller-search" onSubmit={onSubmitSearch} role="search">
          <label className="protokoller-search__field" htmlFor="protokol-ara">
            <i className="fas fa-search" aria-hidden="true" />
            <input
              id="protokol-ara"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Protokol ara…"
              autoComplete="off"
            />
          </label>
          <button type="submit" className="protokoller-search__btn">
            Ara
          </button>
          {search ? (
            <button
              type="button"
              className="protokoller-search__clear"
              onClick={() => {
                setQuery('');
                setSearch('');
              }}
            >
              Temizle
            </button>
          ) : null}
        </form>

        <div className="protokoller-results">
          {!loading && !error ? (
            <p className="protokoller-results__count">
              <strong>{filtered.length}</strong> protokol listeleniyor
              {search ? (
                <>
                  {' '}
                  · “<span>{search}</span>”
                </>
              ) : null}
            </p>
          ) : (
            <span />
          )}
        </div>

        {loading && <p className="protokoller-state">Yükleniyor…</p>}
        {!loading && error && (
          <p className="protokoller-state protokoller-state--error">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="protokoller-state">Gösterilecek protokol bulunamadı.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="protokoller-grid">
            {filtered.map((item) => {
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
                <CardTag key={item.id} className="protokol-card" {...cardProps}>
                  <div className="protokol-card__top">
                    <span className="protokol-card__icon" aria-hidden="true">
                      <i className={normalizeIcon(item.ikon)} />
                    </span>
                    <div className="protokol-card__meta">
                      <span className="protokol-card__date">
                        <i className="far fa-calendar-alt" aria-hidden="true" />
                        {item.tarih || '—'}
                      </span>
                      <span className="protokol-card__size">
                        <i className="far fa-file" aria-hidden="true" />
                        {item.boyut || '—'}
                      </span>
                    </div>
                  </div>

                  <h2 className="protokol-card__title">{item.baslik}</h2>
                  <p className="protokol-card__desc">{item.aciklama}</p>

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
