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

  // Slider kontrolü için indeks state'i
  const [startIndex, setStartIndex] = useState(0);
  const VISIBLE_COUNT = 3; // Ekranda aynı anda görünecek kart sayısı

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStartIndex(0); // Sayfa/id değişince slider sıfırlansın

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

  const tarih = useMemo(() => (etkinlik ? formatTarih(etkinlik.tarih) : null), [etkinlik]);
  const bitisTarih = useMemo(
    () => (etkinlik?.bitis_tarihi ? formatTarih(etkinlik.bitis_tarihi) : null),
    [etkinlik],
  );

  // Kaydırma Fonksiyonları
  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(diger.length - VISIBLE_COUNT, prev + 1));
  };

  // Ekranda gösterilecek mevcut kartlar
  const visibleDiger = useMemo(() => {
    return diger.slice(startIndex, startIndex + VISIBLE_COUNT);
  }, [diger, startIndex]);

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
            <div className="etkinlik-detay-top-grid">
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

              <aside className="etkinlik-detay-side-panel">
                <div className="etkinlik-detay-date-box">
                  <div className="etkinlik-detay-date-badge">
                    <span className="etkinlik-detay-date-gun">{tarih.gun}</span>
                    <span className="etkinlik-detay-date-ay">{tarih.ay}</span>
                  </div>
                  <div className="etkinlik-detay-date-text">
                    <strong>{tarih.tam}</strong>
                    <span>{tarih.gunAdi}</span>
                    {bitisTarih && (
                      <span>({bitisTarih.tam} tarihine kadar)</span>
                    )}
                  </div>
                </div>

                {(etkinlik.konum || etkinlik.adres) && (
                  <div className="etkinlik-detay-konum-box">
                    <i className="fas fa-location-dot" aria-hidden="true" />
                    <span>{etkinlik.konum ?? etkinlik.adres}</span>
                  </div>
                )}

                {etkinlik.aciklama && (
                  <div className="etkinlik-detay-aciklama-wrapper">
                    <h2>Etkinlik Hakkında</h2>
                    <p className="etkinlik-detay-aciklama">{etkinlik.aciklama}</p>
                  </div>
                )}
              </aside>
            </div>

            {/* Alt Kısım: Ok Tuşlu Slider Yapısı */}
            {diger.length > 0 && (
              <section className="etkinlik-detay-full-section">
                <div className="etkinlik-detay-slider-header">
                  <h2>
                    <i className="fas fa-calendar-week" aria-hidden="true" />
                    Diğer Etkinlikler
                  </h2>
                  
                  {/* Etkinlik sayısı gösterilenden fazlaysa ok butonlarını göster */}
                  {diger.length > VISIBLE_COUNT && (
                    <div className="etkinlik-detay-slider-controls">
                      <button
                        type="button"
                        className="etkinlik-slider-btn"
                        onClick={handlePrev}
                        disabled={startIndex === 0}
                        aria-label="Önceki Etkinlikler"
                      >
                        <i className="fas fa-chevron-left" />
                      </button>
                      <button
                        type="button"
                        className="etkinlik-slider-btn"
                        onClick={handleNext}
                        disabled={startIndex >= diger.length - VISIBLE_COUNT}
                        aria-label="Sonraki Etkinlikler"
                      >
                        <i className="fas fa-chevron-right" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="etkinlik-detay-diger-list">
                  {visibleDiger.map((e) => {
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
          </>
        )}
      </div>
    </Layout>
  );
}