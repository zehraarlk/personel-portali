import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { fetchYardimciLinkler } from '../api/client';
import '../styles/etkinlikler.css';

const BLUE = '#1c3a5e';
const ORANGE = '#f5a623';

function LinkIkon({ logoUrl }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 38,
        height: 38,
        borderRadius: 8,
        background: 'rgba(28,58,94,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <i className="fas fa-link" style={{ fontSize: 16, color: BLUE }} aria-hidden="true" />
      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#fff',
          }}
        />
      )}
    </div>
  );
}

export default function YardimciLinkler() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchYardimciLinkler()
      .then((data) => {
        if (cancelled) return;
        setItems(data.linkler ?? []);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError('Yardımcı linkler yüklenirken bir sorun oluştu.');
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
    return items.filter((item) =>
      (item.baslik || '').toLocaleLowerCase('tr-TR').includes(q),
    );
  }, [items, search]);

  const gruplanmis = useMemo(() => {
    const map = new Map();
    filtered.forEach((item) => {
      const anahtar = item.kategori || 'Diğer';
      if (!map.has(anahtar)) map.set(anahtar, []);
      map.get(anahtar).push(item);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(query.trim());
  };

  const clearSearch = () => {
    setQuery('');
    setSearch('');
  };

  return (
    <Layout>
      <div className="etkinlikler-page" style={{ minHeight: '85vh', paddingBottom: 40 }}>
        <header className="etkinlikler-head">
          <div className="etkinlikler-head-left">
            <span className="etkinlikler-head-icon">
              <i className="fas fa-link" aria-hidden="true" />
            </span>
            <div>
              <h1>Yardımcı Linkler</h1>
              <p>Sık kullanılan kurumsal sistemlere ve bağlantılara buradan ulaşın.</p>
            </div>
          </div>
        </header>

        <form
          onSubmit={submitSearch}
          role="search"
          style={{ display: 'flex', gap: 8, margin: '20px 0 28px', alignItems: 'center' }}
        >
          <div style={{ position: 'relative', width: 360 }}>
            <i
              className="fas fa-magnifying-glass"
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9a9a95',
                fontSize: 14,
              }}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Link adı ara…"
              autoComplete="off"
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 10 }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '0 20px',
              height: 40,
              borderRadius: 10,
              border: 'none',
              background: BLUE,
              color: '#fff',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Ara
          </button>
          {search ? (
            <button
              type="button"
              onClick={clearSearch}
              style={{
                padding: '0 18px',
                height: 40,
                borderRadius: 10,
                border: '0.5px solid rgba(0,0,0,0.18)',
                background: 'transparent',
                color: '#333',
                fontSize: 14,
              }}
            >
              Temizle
            </button>
          ) : null}
        </form>

        {loading && (
          <div className="protokoller-state" role="status">
            <span className="protokoller-state__pulse" aria-hidden="true" />
            Yardımcı linkler yükleniyor…
          </div>
        )}
        {!loading && error && (
          <p className="protokoller-state protokoller-state--error">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="protokoller-empty">
            <i className="fas fa-link" aria-hidden="true" />
            <h2>Sonuç bulunamadı</h2>
            <p>Aramanızı değiştirerek tekrar deneyebilirsiniz.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            {gruplanmis.map(([kategoriAdi, kategoriLinkleri]) => (
              <div key={kategoriAdi}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#555',
                    margin: '0 0 4px',
                    textTransform: 'uppercase',
                    letterSpacing: 0.3,
                  }}
                >
                  {kategoriAdi}
                </p>
                <div
                  style={{
                    height: 1,
                    background: 'rgba(0,0,0,0.08)',
                    marginBottom: 12,
                  }}
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 12,
                  }}
                >
                  {kategoriLinkleri.map((item) => (
                    <a
                      key={item.id}
                      href={item.hedef_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        border: '0.5px solid rgba(0,0,0,0.15)',
                        borderRadius: 10,
                        background: '#ffffff',
                      }}
                    >
                      <LinkIkon logoUrl={item.logo_url} />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#111',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {item.baslik}
                      </span>
                      <i
                        className="fas fa-arrow-up-right-from-square"
                        style={{ fontSize: 12, color: '#9a9a95' }}
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
