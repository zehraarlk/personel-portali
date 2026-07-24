import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchEtkinlikler } from '../api/client';
import Layout from '../components/Layout';
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
            .sort((a, b) => new Date(a.tarih) - new Date(b.tarih))
            .slice(0, 3);
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

  const tarih = useMemo(() => (etkinlik ? formatTarih(etkinlik.tarih) : null), [etkinlik]);
  const bitisTarih = useMemo(
    () => (etkinlik?.bitis_tarihi ? formatTarih(etkinlik.bitis_tarihi) : null),
    [etkinlik],
  );

  return (
    <Layout>
      <div className="etkinlik-detay-page">
        <button type="button" className="etkinlik-detay-back" onClick={() => navigate('/etkinlikler')}>
  <i className="fas fa-arrow-left" aria-hidden="true" />
  Etkinliklere Dön
</button>

        {loading && (
          <div className="etkinlik-detay-skeleton">
            <div className="etkinlik-detay-skeleton-hero" />
            <div className="etkinlik-detay-skeleton-row" />
            <div className="etkinlik-detay-skeleton-row" />
          </div>
        )}

        {!loading && error && (
          <div className="etkinlikler-empty">
            <i className="fas fa-calendar-xmark" aria-hidden="true" />
            <p>{error}</p>
            <Link to="/etkinlikler" className="etkinlik-detay-empty-link">
              Tüm etkinliklere göz at
            </Link>
          </div>
        )}

        {!loading && !error && etkinlik && (
          <>
            {/* Hero Header Section */}
            <article className="etkinlik-detay-hero">
              <div className="etkinlik-detay-media">
                {etkinlik.resim ? (
                  <img src={etkinlik.resim} alt={etkinlik.baslik} />
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

            {/* Content & Sidebar Grid */}
            <div className="etkinlik-detay-grid">
              <main className="etkinlik-detay-main-content">
                {etkinlik.aciklama && (
                  <section className="etkinlik-detay-card">
                    <h2>
                      <i className="fas fa-align-left" aria-hidden="true" />
                      Etkinlik Hakkında
                    </h2>
                    <p className="etkinlik-detay-aciklama">{etkinlik.aciklama}</p>
                  </section>
                )}

                {diger.length > 0 && (
                  <section className="etkinlik-detay-card">
                    <h2>
                      <i className="fas fa-calendar-week" aria-hidden="true" />
                      Diğer Etkinlikler
                    </h2>
                    <div className="etkinlik-detay-diger-list">
                      {diger.map((e) => {
                        const t = formatTarih(e.tarih);
                        return (
                          <Link
                            key={e.id}
                            to={`/etkinlikler/${e.id}`}
                            className="etkinlik-detay-diger-card"
                          >
                            {e.resim && (
                              <div className="etkinlik-detay-diger-media">
                                <img src={e.resim} alt={e.baslik} />
                              </div>
                            )}
                            <div className="etkinlik-detay-diger-body">
                              <span className="etkinlik-detay-diger-tarih">{t.tam}</span>
                              <h3>{e.baslik}</h3>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                )}
              </main>

              {/* Sidebar Info Card */}
              <aside className="etkinlik-detay-sidebar">
                <div className="etkinlik-detay-card">
                  <h2>Etkinlik Detayları</h2>

                  <div className="etkinlik-detay-info-box">
                    <div className="etkinlik-detay-date-badge">
                      <span className="etkinlik-detay-date-gun">{tarih.gun}</span>
                      <span className="etkinlik-detay-date-ay">{tarih.ay}</span>
                    </div>
                    <div className="etkinlik-detay-info-text">
                      <strong>{tarih.tam}</strong>
                      <span>{tarih.gunAdi}</span>
                      {bitisTarih && (
                        <span>({bitisTarih.tam} tarihine kadar)</span>
                      )}
                    </div>
                  </div>

                  {(etkinlik.konum || etkinlik.adres) && (
                    <div className="etkinlik-detay-info-box">
                      <div className="etkinlik-detay-icon-wrapper">
                        <i className="fas fa-location-dot" aria-hidden="true" />
                      </div>
                      <div className="etkinlik-detay-info-text">
                        <strong>Konum</strong>
                        <span>{etkinlik.konum ?? etkinlik.adres}</span>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}