import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchEtkinlikler } from '../api/client';
import Layout from '../components/Layout';
import MediaFrame from '../components/MediaFrame';
import '../styles/etkinlik-detay.css';

function formatTarih(iso) {
  const d = new Date(iso);
  return {
    gun: d.toLocaleDateString('tr-TR', { day: '2-digit' }),
    ay: d.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', ''),
    gunAdi: d.toLocaleDateString('tr-TR', { weekday: 'long' }),
    tam: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
  };
}

export default function EtkinlikDetay() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [etkinlik, setEtkinlik] = useState(null);
  const [diger, setDiger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchEtkinlikler(null)
      .then((data) => {
        if (cancelled) return;
        const liste = data.etkinlikler ?? [];
        const bulunan = liste.find((e) => String(e.id) === String(id)) ?? null;

        if (!bulunan) {
          setError('Bu etkinlik bulunamadı ya da kaldırılmış olabilir.');
          setEtkinlik(null);
        } else {
          setEtkinlik(bulunan);
          const siraliDiger = liste
            .filter((e) => String(e.id) !== String(id))
            .sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
          
          setDiger(siraliDiger);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Etkinlik yüklenirken bir sorun oluştu.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Yan paneldeki "Diğer Etkinlikler" listesi için sayfalama (scroll yerine ok tuşları)
  const [digerIndex, setDigerIndex] = useState(0);
  const DIGER_VISIBLE_COUNT = 6;

  useEffect(() => {
    setDigerIndex(0);
  }, [id]);

  const digerPageCount = Math.max(1, Math.ceil(diger.length / DIGER_VISIBLE_COUNT));
  const digerPage = Math.floor(digerIndex / DIGER_VISIBLE_COUNT);

  const handleDigerPrev = () => {
    setDigerIndex((prev) => Math.max(0, prev - DIGER_VISIBLE_COUNT));
  };

  const handleDigerNext = () => {
    setDigerIndex((prev) =>
      Math.min((digerPageCount - 1) * DIGER_VISIBLE_COUNT, prev + DIGER_VISIBLE_COUNT),
    );
  };

  const visibleDiger = useMemo(
    () => diger.slice(digerIndex, digerIndex + DIGER_VISIBLE_COUNT),
    [diger, digerIndex],
  );

  return (
    <Layout>
      <div className="etkinlik-detay-page">
        <button type="button" className="etkinlik-detay-back" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Geri Dön
        </button>

        {loading && (
          <div className="etkinlik-detay-skeleton">
            <div className="etkinlik-detay-skeleton-hero" />
            <div className="etkinlik-detay-skeleton-row" />
          </div>
        )}

        {!loading && !error && etkinlik && (
          <>
            <div className="etkinlik-detay-top-grid">
              <article className="etkinlik-detay-hero">
                <div className="etkinlik-detay-media">
                  {etkinlik.resim ? (
                    <MediaFrame
                      src={etkinlik.resim}
                      alt={etkinlik.baslik}
                      dark
                      className="absolute inset-0"
                      eager
                    />
                  ) : (
                    <div className="etkinlik-detay-media--placeholder" />
                  )}
                  <div className="etkinlik-detay-shade" />
                </div>

                <div className="etkinlik-detay-hero-overlay">
                  {etkinlik.durum_ref && (
                    <span className="etkinlik-detay-badge">{etkinlik.durum_ref}</span>
                  )}
                  <h1 className="etkinlik-detay-title">{etkinlik.baslik}</h1>
                </div>
              </article>

              <aside className="etkinlik-detay-side-panel">
                {(etkinlik.konum || etkinlik.adres) && (
                  <div className="etkinlik-detay-konum-box">
                    <i className="fas fa-location-dot" aria-hidden="true" />
                    <span>{etkinlik.konum ?? etkinlik.adres}</span>
                  </div>
                )}

                {diger.length > 0 && (
                  <div className="etkinlik-detay-side-diger">
                    <div className="etkinlik-detay-side-diger-head">
                      <h2>
                        <i className="fas fa-calendar-week" aria-hidden="true" />
                        Diğer Etkinlikler
                      </h2>

                      {diger.length > DIGER_VISIBLE_COUNT && (
                        <div className="etkinlik-detay-side-diger-controls">
                          <button
                            type="button"
                            className="etkinlik-slider-btn"
                            onClick={handleDigerPrev}
                            disabled={digerPage === 0}
                            aria-label="Önceki Etkinlikler"
                          >
                            <i className="fas fa-chevron-up" />
                          </button>
                          <button
                            type="button"
                            className="etkinlik-slider-btn"
                            onClick={handleDigerNext}
                            disabled={digerPage >= digerPageCount - 1}
                            aria-label="Sonraki Etkinlikler"
                          >
                            <i className="fas fa-chevron-down" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="etkinlik-detay-side-diger-list">
                      {visibleDiger.map((e) => {
                        const t = formatTarih(e.tarih);
                        return (
                          <Link
                            key={e.id}
                            to={`/etkinlikler/${e.id}`}
                            className="etkinlik-detay-side-diger-card"
                          >
                            {e.resim && (
                              <div className="etkinlik-detay-side-diger-media">
                                <MediaFrame
                                  src={e.resim}
                                  alt={e.baslik}
                                  className="absolute inset-0"
                                />
                              </div>
                            )}
                            <div className="etkinlik-detay-side-diger-body">
                              <span className="etkinlik-detay-side-diger-tarih">{t.tam}</span>
                              <h3>{e.baslik}</h3>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </aside>
            </div>

            {/* Alt Kısım: Ana Etkinliğin Tüm Genişlikte Açıklaması */}
            {etkinlik.aciklama && (
              <section className="etkinlik-detay-full-section">
                <h2>
                  <i className="fas fa-align-left" aria-hidden="true" />
                  Etkinlik Hakkında
                </h2>
                <p className="etkinlik-detay-aciklama">{etkinlik.aciklama}</p>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}