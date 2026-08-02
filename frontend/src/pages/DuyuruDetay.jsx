import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchDuyurular } from '../api/client';
import Layout from '../components/Layout';
import MediaFrame from '../components/MediaFrame';
import '../styles/duyuru-detay.css';

const DATE_FORMATTER = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const OTHER_ANNOUNCEMENTS_PAGE_SIZE = 6;

function formatDate(value) {
  if (!value) return '';

  const normalizedValue = String(value);
  const isoDateMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    const localDate = new Date(Number(year), Number(month) - 1, Number(day));

    return Number.isNaN(localDate.getTime())
      ? normalizedValue
      : DATE_FORMATTER.format(localDate);
  }

  const date = new Date(normalizedValue);
  return Number.isNaN(date.getTime())
    ? normalizedValue
    : DATE_FORMATTER.format(date);
}

function getDuyuruMetni(duyuru) {
  return duyuru?.icerik || duyuru?.detay || duyuru?.aciklama || '';
}

function AnnouncementMedia({ announcement, eager = false, contain = false }) {
  if (announcement?.resim) {
    if (contain) {
      // Ana görseli arka plan olarak çiziyoruz. Bu yöntem global img/MediaFrame
      // stillerinin yeniden object-fit: cover uygulamasını tamamen engeller.
      return (
        <div
          className="duyuru-detay-hero-picture"
          role="img"
          aria-label={announcement.baslik || 'Duyuru görseli'}
          style={{
            backgroundImage: `url(${JSON.stringify(announcement.resim)})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
          }}
        />
      );
    }

    return (
      <MediaFrame
        src={announcement.resim}
        alt={announcement.baslik || 'Duyuru görseli'}
        className="absolute inset-0"
        eager={eager}
        dark={eager}
      />
    );
  }

  return (
    <div className="duyuru-detay-media-placeholder" aria-hidden="true">
      <i className="fas fa-bullhorn" />
    </div>
  );
}

export default function DuyuruDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const stateDuyuru = location.state?.duyuru;
  const stateDuyuruUygun =
    stateDuyuru && String(stateDuyuru.id) === String(id)
      ? stateDuyuru
      : null;

  const [duyuru, setDuyuru] = useState(stateDuyuruUygun);
  const [duyurular, setDuyurular] = useState(
    stateDuyuruUygun ? [stateDuyuruUygun] : [],
  );
  const [loading, setLoading] = useState(!stateDuyuruUygun);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [otherPage, setOtherPage] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadDuyurular() {
      if (!stateDuyuruUygun) {
        setLoading(true);
      }

      setError('');

      try {
        const result = await fetchDuyurular();
        const gelenDuyurular = Array.isArray(result?.duyurular)
          ? result.duyurular
          : [];
        const bulunanDuyuru = gelenDuyurular.find(
          (item) => String(item.id) === String(id),
        );

        if (cancelled) return;

        setDuyurular(gelenDuyurular);

        if (bulunanDuyuru) {
          setDuyuru(bulunanDuyuru);
        } else if (stateDuyuruUygun) {
          setDuyuru(stateDuyuruUygun);
        } else {
          setDuyuru(null);
          setError('Aradığınız duyuru bulunamadı.');
        }
      } catch (requestError) {
        if (cancelled) return;

        if (stateDuyuruUygun) {
          setDuyuru(stateDuyuruUygun);
          setDuyurular([stateDuyuruUygun]);
        } else {
          setDuyuru(null);
          setError(
            requestError?.message || 'Duyuru bilgileri yüklenemedi.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDuyurular();

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken, stateDuyuruUygun]);

  const duyuruMetni = useMemo(() => getDuyuruMetni(duyuru), [duyuru]);

  const digerDuyurular = useMemo(
    () =>
      duyurular
        .filter((item) => String(item.id) !== String(id))
        .sort((a, b) => new Date(a.tarih || 0) - new Date(b.tarih || 0)),
    [duyurular, id],
  );

  const otherPageCount = Math.max(
    1,
    Math.ceil(digerDuyurular.length / OTHER_ANNOUNCEMENTS_PAGE_SIZE),
  );

  const gorunenDigerDuyurular = useMemo(() => {
    const start = otherPage * OTHER_ANNOUNCEMENTS_PAGE_SIZE;

    return digerDuyurular.slice(
      start,
      start + OTHER_ANNOUNCEMENTS_PAGE_SIZE,
    );
  }, [digerDuyurular, otherPage]);

  useEffect(() => {
    setOtherPage(0);
  }, [id, digerDuyurular.length]);

  return (
    <Layout>
      <div className="duyuru-detay-page">
        <button
          type="button"
          className="duyuru-detay-back"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Geri Dön
        </button>

        {loading && (
          <div className="duyuru-detay-skeleton" aria-label="Duyuru yükleniyor">
            <div className="duyuru-detay-skeleton-hero" />
            <div className="duyuru-detay-skeleton-row" />
          </div>
        )}

        {!loading && error && (
          <section className="duyuru-detay-error" role="alert">
            <i className="fas fa-circle-exclamation" aria-hidden="true" />
            <div>
              <h1>Duyuru görüntülenemedi</h1>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setReloadToken((value) => value + 1)}
              >
                <i className="fas fa-rotate-right" aria-hidden="true" />
                Yeniden dene
              </button>
            </div>
          </section>
        )}

        {!loading && !error && duyuru && (
          <>
            <div className="duyuru-detay-top-grid">
              <article className="duyuru-detay-hero">
                <div className="duyuru-detay-media">
                  <AnnouncementMedia announcement={duyuru} eager contain />
                  <div className="duyuru-detay-shade" />
                </div>

                <div className="duyuru-detay-hero-overlay">
                  <div className="duyuru-detay-meta">
                    {duyuru.kategori && (
                      <span className="duyuru-detay-badge">
                        {duyuru.kategori}
                      </span>
                    )}

                    {duyuru.tarih && (
                      <time dateTime={duyuru.tarih}>
                        <i className="far fa-calendar-alt" aria-hidden="true" />
                        {formatDate(duyuru.tarih)}
                      </time>
                    )}
                  </div>

                  <h1 className="duyuru-detay-title">{duyuru.baslik}</h1>
                </div>
              </article>

              <aside className="duyuru-detay-side-panel">
                <div className="duyuru-detay-side-head">
                  <h2>
                    <i className="fas fa-bullhorn" aria-hidden="true" />
                    Diğer Duyurular
                  </h2>

                  {digerDuyurular.length > OTHER_ANNOUNCEMENTS_PAGE_SIZE && (
                    <div className="duyuru-detay-controls">
                      <button
                        type="button"
                        className="duyuru-detay-slider-btn"
                        onClick={() =>
                          setOtherPage((page) => Math.max(0, page - 1))
                        }
                        disabled={otherPage === 0}
                        aria-label="Önceki duyurular"
                      >
                        <i className="fas fa-chevron-up" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        className="duyuru-detay-slider-btn"
                        onClick={() =>
                          setOtherPage((page) =>
                            Math.min(otherPageCount - 1, page + 1),
                          )
                        }
                        disabled={otherPage >= otherPageCount - 1}
                        aria-label="Sonraki duyurular"
                      >
                        <i className="fas fa-chevron-down" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                {gorunenDigerDuyurular.length > 0 ? (
                  <div className="duyuru-detay-side-list">
                    {gorunenDigerDuyurular.map((item) => (
                      <Link
                        key={item.id}
                        to={`/duyurular/${item.id}`}
                        state={{ duyuru: item }}
                        className="duyuru-detay-side-card"
                      >
                        <div className="duyuru-detay-side-media">
                          <AnnouncementMedia announcement={item} />
                        </div>

                        <div className="duyuru-detay-side-body">
                          {item.tarih && (
                            <time dateTime={item.tarih}>
                              {formatDate(item.tarih)}
                            </time>
                          )}
                          <h3>{item.baslik}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="duyuru-detay-empty">
                    <i className="far fa-bell-slash" aria-hidden="true" />
                    <p>Gösterilecek başka duyuru bulunmuyor.</p>
                  </div>
                )}
              </aside>
            </div>

            <section className="duyuru-detay-full-section">
              <h2>
                <i className="fas fa-align-left" aria-hidden="true" />
                Duyuru Hakkında
              </h2>

              {duyuruMetni ? (
                <p className="duyuru-detay-description">{duyuruMetni}</p>
              ) : (
                <p className="duyuru-detay-description duyuru-detay-description--empty">
                  Bu duyuru için ayrıntılı açıklama bulunmuyor.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}