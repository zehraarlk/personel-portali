import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { fetchYardimciLinkler } from '../api/client';
import '../styles/etkinlikler.css';

const BLUE = '#1c3a5e';
const ORANGE = '#f5a623';

export default function YardimciLinkler() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [seciliKategori, setSeciliKategori] = useState(null);
  const [kategorilerPaneliAcik, setKategorilerPaneliAcik] = useState(false);
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

  // Artık "Ara" butonuna basmaya gerek yok; her tuş vuruşunda anında filtreleniyor.
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return items;
    return items.filter((item) =>
      (item.baslik || '').toLocaleLowerCase('tr-TR').includes(q),
    );
  }, [items, query]);

  const gruplanmis = useMemo(() => {
    const map = new Map();
    filtered.forEach((item) => {
      const anahtar = item.kategori || 'Diğer';
      if (!map.has(anahtar)) map.set(anahtar, []);
      map.get(anahtar).push(item);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Bir kategoriye tıklayınca sadece o kategori gösterilir; aynısına tekrar
  // tıklanırsa veya hiçbiri seçili değilse tüm kategoriler gösterilir.
  const kategoriSec = (kategoriAdi) => {
    setSeciliKategori((eski) => (eski === kategoriAdi ? null : kategoriAdi));
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <Layout>
      <style>{`
        .yl-kategoriler-panel {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          overflow: hidden;
          isolation: isolate;
        }
        .yl-kategoriler-baslik {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          cursor: pointer;
          user-select: none;
          background: #fff;
        }
        .yl-kategoriler-baslik i {
          color: ${BLUE};
          font-size: 16px;
          width: 18px;
          text-align: center;
        }
        .yl-kategoriler-baslik span {
          font-size: 14px;
          font-weight: 500;
          color: #222;
        }
        .yl-kategori-satir {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          text-align: left;
          padding: 13px 16px;
          border: none;
          border-top: 1px solid rgba(0,0,0,0.07);
          background: #fff;
          color: #333;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .yl-kategori-satir:hover {
          background: rgba(28,58,94,0.05);
        }
        .yl-kategori-satir.acik {
          background: #fdf1dc;
          border-top-color: ${ORANGE};
          color: #1a1a1a;
          font-weight: 600;
        }
        .yl-kategori-satir.acik + .yl-kategori-satir {
          border-top-color: ${ORANGE};
        }
        .yl-kategori-sag {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .yl-kategori-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(0,0,0,0.06);
          color: #666;
        }
        .yl-kategori-satir.acik .yl-kategori-badge {
          background: ${ORANGE};
          color: #fff;
        }
        .yl-kategori-satir .yl-kategori-chevron {
          font-size: 12px;
          color: #b5b5ae;
        }
        .yl-section {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          overflow: hidden;
        }
        .yl-section-head {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
        }
        .yl-section-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: ${BLUE};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .yl-section-icon i {
          color: ${ORANGE};
          font-size: 18px;
        }
        .yl-section-title {
          font-size: 17px;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0;
        }
        .yl-section-sub {
          font-size: 12.5px;
          color: #777;
          margin: 2px 0 0;
        }
        .yl-section-badge {
          font-size: 12.5px;
          font-weight: 500;
          color: #444;
          background: rgba(0,0,0,0.05);
          border-radius: 999px;
          padding: 5px 14px;
          white-space: nowrap;
          margin-left: auto;
        }
        .yl-section-body {
          padding: 4px 20px 22px;
          border-top: 1px solid rgba(0,0,0,0.06);
        }
        .yl-card {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 14px;
          background: #e2e8f0;
          padding: 14px 12px 12px;
          position: relative;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          aspect-ratio: 1 / 1;
          justify-content: center;
        }
        .yl-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(28, 58, 94, 0.14);
          border-color: rgba(28, 58, 94, 0.35);
        }
        .yl-card-ext {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 7px;
          border: 1px solid rgba(0,0,0,0.12);
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9a9a95;
          font-size: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .yl-card:hover .yl-card-ext {
          color: ${BLUE};
          border-color: rgba(28,58,94,0.35);
        }
        .yl-card-logo {
          width: 70%;
          aspect-ratio: 1 / 1;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 10px;
        }
        .yl-card-logo img {
          max-width: 60%;
          max-height: 60%;
          object-fit: contain;
        }
        .yl-card-title {
          font-size: 15px;
          font-weight: 500;
          color: #222;
          text-align: center;
          margin: 0;
        }
      `}</style>

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 28px' }}>
          <div style={{ position: 'relative', width: 500 }}>
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
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px 10px 38px',
                borderRadius: 10,
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.12)',
                color: '#222',
                height: 40,
              }}
            />
          </div>
          {query ? (
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

          {/* Kategoriler: satırın en sağında, açılır menü */}
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setKategorilerPaneliAcik((v) => !v)}
              aria-expanded={kategorilerPaneliAcik}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 40,
                padding: '0 16px',
                borderRadius: 10,
                border: '0.5px solid rgba(0,0,0,0.18)',
                background: '#fff',
                color: '#222',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <i className={kategorilerPaneliAcik ? 'fas fa-xmark' : 'fas fa-bars'} aria-hidden="true" style={{ color: BLUE }} />
              Kategoriler
            </button>

            {kategorilerPaneliAcik && (
              <div className="yl-kategoriler-panel" style={{ position: 'absolute', top: 46, right: 0, width: 260, zIndex: 20, boxShadow: '0 10px 24px rgba(0,0,0,0.12)' }}>
                <button
                  type="button"
                  className={`yl-kategori-satir${!seciliKategori ? ' acik' : ''}`}
                  onClick={() => setSeciliKategori(null)}
                  aria-pressed={!seciliKategori}
                  style={{ borderTop: 'none' }}
                >
                  <span>Tümü</span>
                  <span className="yl-kategori-sag">
                    <span className="yl-kategori-badge">{filtered.length}</span>
                    <i className="fas fa-chevron-right yl-kategori-chevron" aria-hidden="true" />
                  </span>
                </button>
                {gruplanmis.map(([kategoriAdi, kategoriLinkleri]) => {
                  const secili = seciliKategori === kategoriAdi;
                  return (
                    <button
                      key={kategoriAdi}
                      type="button"
                      className={`yl-kategori-satir${secili ? ' acik' : ''}`}
                      onClick={() => kategoriSec(kategoriAdi)}
                      aria-pressed={secili}
                    >
                      <span>{kategoriAdi}</span>
                      <span className="yl-kategori-sag">
                        <span className="yl-kategori-badge">{kategoriLinkleri.length}</span>
                        <i className="fas fa-chevron-right yl-kategori-chevron" aria-hidden="true" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {gruplanmis
              .filter(([kategoriAdi]) => !seciliKategori || seciliKategori === kategoriAdi)
              .map(([kategoriAdi, kategoriLinkleri]) => (
                <div key={kategoriAdi} className="yl-section">
                  <div className="yl-section-head">
                    <span className="yl-section-icon">
                      <i className="fas fa-link" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="yl-section-title">{kategoriAdi}</p>
                      <p className="yl-section-sub">Sık kullanılan bağlantılar</p>
                    </div>
                    <span className="yl-section-badge">{kategoriLinkleri.length} Bağlantı</span>
                  </div>
                  <div className="yl-section-body">
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, minmax(0, 210px))',
                        gap: 16,
                        paddingTop: 18,
                      }}
                    >
                      {kategoriLinkleri.map((item) => (
                        <a
                          key={item.id}
                          href={item.hedef_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="yl-card"
                        >
                          <span className="yl-card-ext">
                            <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
                          </span>
                          <div className="yl-card-logo">
                            {item.logo_url ? (
                              <img
                                src={item.logo_url}
                                alt=""
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <i className="fas fa-link" style={{ fontSize: 22, color: BLUE }} aria-hidden="true" />
                            )}
                          </div>
                          <p className="yl-card-title">{item.baslik}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </Layout>
  );
}