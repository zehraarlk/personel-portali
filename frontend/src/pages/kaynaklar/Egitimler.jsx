import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { fetchEgitimler } from '../../api/client';
import KaynaklarChrome from './KaynaklarChrome';
import '../../styles/etkinlikler.css';
import '../../styles/protokoller.css';
import '../../styles/egitimler.css';

const ORANGE = '#f5a623';
const BLUE = '#1c3a5e';
const LINK_BLUE = '#3762e3';
const RED = '#dc2626';
const GRAY_ICON = '#8a8a85';
const PAGE_SIZE = 6;

/**
 * Backend tablosundaki alan adı henüz netleşmediği için, olası tüm
 * isimlendirmeleri sırayla deniyoruz ve ilk dolu olanı kullanıyoruz. Şu anda
 * üç buton da (Resmi Sayfa / Video / Sunum) aynı linke gidiyor; ileride her
 * biri için ayrı sütun eklenirse bu fonksiyon otomatik olarak kendi alanını
 * bulup kullanacak, ekstra bir değişiklik gerekmeyecek.
 */

function resolveLink(item, keys) {
  for (const key of keys) {
    if (item[key]) return item[key];
  }
  return null;
}

const ORTAK_LINK_ALANLARI = [
  'video_url',
  'video',
  'video_link',
  'resmi_sayfa_url',
  'resmi_sayfa',
  'sunum_url',
  'dosya_yolu',
  'link',
];

export default function Egitimler() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEgitimler()
      .then((data) => {
        if (cancelled) return;
        setItems(data.egitimler ?? []);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError('Eğitimler yüklenirken bir sorun oluştu.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return items;
    return items.filter((item) => {
      const haystack = `${item.baslik || ''} ${item.aciklama || ''}`.toLocaleLowerCase(
        'tr-TR',
      );
      return haystack.includes(q);
    });
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setPage(1);
  };

  return (
    <Layout>
      {/* Resmi Sayfa / Video / Sunum butonları için hover + tıklama (active) efektleri.
          Inline style'lar :hover ve :active durumlarını desteklemediği için buradan yönetiliyor. */}
      <style>{`
        .eg-link-btn {
          transition: background-color 0.15s ease, border-color 0.15s ease,
            color 0.15s ease, transform 0.08s ease;
        }
        .eg-link-btn i {
          transition: color 0.15s ease;
        }
        .eg-link-btn--resmi:hover {
          background: ${BLUE} !important;
          border-color: ${BLUE} !important;
          color: #fff !important;
        }
        .eg-link-btn--resmi:hover i {
          color: #fff !important;
        }
        .eg-link-btn--resmi:active {
          background: #0f253a !important;
          border-color: #0f253a !important;
          transform: scale(0.94);
        }

        .eg-link-btn--video:hover {
          background: ${RED} !important;
          border-color: ${RED} !important;
          color: #fff !important;
        }
        .eg-link-btn--video:hover i {
          color: #fff !important;
        }
        .eg-link-btn--video:active {
          background: #a71d1d !important;
          border-color: #a71d1d !important;
          transform: scale(0.94);
        }

        .eg-link-btn--sunum:hover {
          background: ${ORANGE} !important;
          border-color: ${ORANGE} !important;
          color: #fff !important;
        }
        .eg-link-btn--sunum:hover i {
          color: #fff !important;
        }
        .eg-link-btn--sunum:active {
          background: #c8830f !important;
          border-color: #c8830f !important;
          transform: scale(0.94);
        }
      `}</style>

      <div className="kaynaklar-page etkinlikler-page" style={{ minHeight: '85vh' }}>
        <KaynaklarChrome
          pageKey="egitimler"
          query={query}
          onQueryChange={setQuery}
          onClear={clearSearch}
          iconClassName="fas fa-graduation-cap"
        />

        {query.trim() && !loading && !error ? (
          <p className="protokoller-filter-note">
            "<strong>{query.trim()}</strong>" için {filtered.length} sonuç
          </p>
        ) : null}

        {loading && (
          <div className="protokoller-state" role="status">
            <span className="protokoller-state__pulse" aria-hidden="true" />
            Eğitimler yükleniyor…
          </div>
        )}
        {!loading && error && (
          <p className="protokoller-state protokoller-state--error">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="protokoller-empty">
            <i className="fas fa-graduation-cap" aria-hidden="true" />
            <h2>Sonuç bulunamadı</h2>
            <p>Aramanızı değiştirerek tekrar deneyebilirsiniz.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gridTemplateRows: `repeat(${Math.ceil(PAGE_SIZE / 2)}, minmax(140px, auto))`,
              gap: 30,
            }}
          >
            {paged.map((item) => {
              const ortakLink = resolveLink(item, ORTAK_LINK_ALANLARI);
              const isHovered = hoveredId === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 25,
                    padding: '14px 18px',
                    background: '#ffffff',
                    border: isHovered
                      ? `0.5px solid ${ORANGE}`
                      : '0.5px solid rgba(0,0,0,0.15)',
                    borderRadius: 12,
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        background: isHovered ? 'rgba(28,58,94,0.20)' : 'rgba(28,58,94,0.10)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <i
                        className="fas fa-graduation-cap"
                        style={{
                          fontSize: 20,
                          color: BLUE,
                          transition: 'color 0.15s ease',
                        }}
                        aria-hidden="true"
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 500, fontSize: 16, margin: 0 }}>{item.baslik}</p>
                      <p
                        style={{
                          fontSize: 13,
                          color: '#888',
                          margin: '6px 0 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <i
                            className="far fa-calendar-alt"
                            style={{ color: ORANGE, fontSize: 13 }}
                            aria-hidden="true"
                          />
                          {item.tarih || '—'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <i
                            className="far fa-file-alt"
                            style={{ color: ORANGE, fontSize: 13 }}
                            aria-hidden="true"
                          />
                          {item.boyut || '—'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {ortakLink && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a
                        href={ortakLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eg-link-btn eg-link-btn--resmi"
                        style={{
                          flex: 1,
                          height: 34,
                          justifyContent: 'center',
                          fontSize: 13,
                          border: '0.5px solid rgba(0,0,0,0.15)',
                          borderRadius: 8,
                          background: '#f4f5f7',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          textDecoration: 'none',
                          color: '#333',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <i className="fas fa-globe" style={{ color: LINK_BLUE }} aria-hidden="true" />Resmi Sayfa
                      </a>
                      <a
                        href={ortakLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eg-link-btn eg-link-btn--video"
                        style={{
                          flex: 1,
                          height: 34,
                          justifyContent: 'center',
                          fontSize: 13,
                          border: '0.5px solid rgba(0,0,0,0.15)',
                          borderRadius: 8,
                          background: '#f4f5f7',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          textDecoration: 'none',
                          color: '#333',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <i className="fas fa-circle-play" style={{ color: RED }} aria-hidden="true" />Video
                      </a>
                      <a
                        href={ortakLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eg-link-btn eg-link-btn--sunum"
                        style={{
                          flex: 1,
                          height: 34,
                          justifyContent: 'center',
                          fontSize: 13,
                          border: '0.5px solid rgba(0,0,0,0.15)',
                          borderRadius: 8,
                          background: '#f4f5f7',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          textDecoration: 'none',
                          color: '#333',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <i className="fas fa-file-pdf" style={{ color: ORANGE }} aria-hidden="true" />Sunum
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              marginTop: 28,
            }}
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Önceki sayfa"
              style={{
                width: 34,
                height: 34,
                border: '0.5px solid rgba(0,0,0,0.15)',
                borderRadius: 8,
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: safePage === 1 ? 0.4 : 1,
                cursor: safePage === 1 ? 'default' : 'pointer',
              }}
            >
              <i className="fas fa-chevron-left" style={{ fontSize: 12 }} aria-hidden="true" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
              const isActive = num === safePage;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPage(num)}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    width: 34,
                    height: 34,
                    border: isActive ? `0.5px solid ${BLUE}` : '0.5px solid rgba(0,0,0,0.15)',
                    borderRadius: 8,
                    background: isActive ? BLUE : 'transparent',
                    color: isActive ? '#fff' : '#333',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {num}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Sonraki sayfa"
              style={{
                width: 34,
                height: 34,
                border: '0.5px solid rgba(0,0,0,0.15)',
                borderRadius: 8,
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: safePage === totalPages ? 0.4 : 1,
                cursor: safePage === totalPages ? 'default' : 'pointer',
              }}
            >
              <i className="fas fa-chevron-right" style={{ fontSize: 12 }} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}