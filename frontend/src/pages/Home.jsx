import { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { fetchHomeDashboard } from '../api/client';
import { BRAND_IMG } from '../constants';
import '../styles/home.css';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [haberIndex, setHaberIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const thumbRefs = useRef([]);
  const thumbRailRef = useRef(null);

  useEffect(() => {
    fetchHomeDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const list = data?.haberler ?? [];
    if (list.length < 2) return undefined;
    const id = setInterval(() => {
      setHaberIndex((prev) => (prev + 1) % list.length);
    }, 5000);
    return () => clearInterval(id);
  }, [data?.haberler]);

  useEffect(() => {
    const rail = thumbRailRef.current;
    const active = thumbRefs.current[haberIndex];
    if (!rail || !active) return;
    const target =
      active.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2;
    rail.scrollTo({ left: target, behavior: 'smooth' });
  }, [haberIndex]);

  const haberler = data?.haberler ?? [];
  const duyurular = data?.duyurular ?? [];
  const dogumGunleri = data?.dogum_gunleri ?? [];
  const otomasyon = data?.otomasyon ?? [];
  const aktif = haberler[haberIndex];

  const handlePrev = () => {
    setHaberIndex((prev) => (prev === 0 ? haberler.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setHaberIndex((prev) => (prev === haberler.length - 1 ? 0 : prev + 1));
  };

  return (
    <Layout>
      <div className="home-page">
        {loading && <div className="home-state">Yükleniyor…</div>}

        {error && (
          <div className="home-state home-state--error">
            Veriler alınamadı: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="home-stack">
            {/* Haber slider */}
            <section id="haberler" className="home-haber">
              <div className="home-haber__frame">
                {aktif ? (
                  <>
                    <img
                      key={aktif.id}
                      src={aktif.resim}
                      alt={aktif.baslik}
                      className="home-haber__img"
                      decoding="async"
                      fetchPriority="high"
                    />
                    <div className="home-haber__veil" aria-hidden="true" />
                    <div className="home-haber__copy">
                      <div className="home-haber__meta">
                        <span className="home-haber__badge">Öne Çıkan</span>
                        <span className="home-haber__date">{data.tarih_tr}</span>
                      </div>
                      <h2>{aktif.baslik}</h2>
                    </div>

                    {haberler.length > 1 && (
                      <div className="home-haber__controls">
                        <button
                          type="button"
                          onClick={handlePrev}
                          aria-label="Önceki Haber"
                          className="home-haber__btn"
                        >
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          aria-label="Sonraki Haber"
                          className="home-haber__btn"
                        >
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="home-haber__empty">Haber bulunamadı.</p>
                )}
              </div>

              {haberler.length > 1 && (
                <div ref={thumbRailRef} className="home-haber__thumbs" role="tablist" aria-label="Haberler">
                  {haberler.map((h, i) => (
                    <button
                      key={h.id}
                      ref={(el) => {
                        thumbRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      aria-selected={i === haberIndex}
                      onClick={() => setHaberIndex(i)}
                      className={`home-thumb${i === haberIndex ? ' is-active' : ''}`}
                    >
                      <span className="home-thumb__num">{i + 1}</span>
                      <span className="home-thumb__media">
                        <img src={h.resim} alt="" loading="lazy" decoding="async" />
                      </span>
                      <span className="home-thumb__title">{h.baslik}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Duyurular bandı */}
            <section id="duyurular-bandi" className="home-duyuru">
              <div className="home-duyuru__label">
                <span className="material-symbols-outlined">campaign</span>
                <span>Duyurular</span>
              </div>

              <div
                className="home-duyuru__track-wrap"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {duyurular.length ? (
                  <div
                    className="home-duyuru__track animate-marquee"
                    style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                  >
                    {[...duyurular, ...duyurular].map((d, index) => (
                      <article key={`${d.id}-${index}`} className="home-duyuru__card">
                        <div className="home-duyuru__img">
                          {d.resim ? (
                            <img src={d.resim} alt="" loading="lazy" decoding="async" />
                          ) : (
                            <span className="material-symbols-outlined">campaign</span>
                          )}
                        </div>
                        <h3>{d.baslik}</h3>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="home-duyuru__empty">Şu an gösterilecek duyuru yok.</p>
                )}
              </div>
            </section>

            {/* Doğum günü */}
            <section id="dogum-gunu" className="home-birthday">
              <div className="home-section-head">
                <div className="home-section-head__left">
                  <div className="home-section-head__icon home-section-head__icon--rose">
                    <span className="material-symbols-outlined">cake</span>
                  </div>
                  <div>
                    <h2>Bugün Doğum Günü Olanlar</h2>
                    <p>Çalışma arkadaşlarımızın yeni yaşını kutlarız!</p>
                  </div>
                </div>
                <span className="home-birthday__date">
                  <span className="home-birthday__dot" />
                  {data?.tarih_tr || 'Bugün'}
                </span>
              </div>

              <div className="home-birthday__grid">
                {dogumGunleri.length ? (
                  dogumGunleri.map((p) => (
                    <article key={p.id} className="home-person">
                      <div className="home-person__avatar">
                        <img
                          src={p.foto || BRAND_IMG}
                          alt={p.ad_soyad}
                          className="home-media-cover"
                        />
                        <span className="home-person__badge" aria-hidden="true">
                          🎉
                        </span>
                      </div>
                      <h3>{p.ad_soyad}</h3>
                      <span>Mutlu Yıllar!</span>
                    </article>
                  ))
                ) : (
                  <div className="home-birthday__empty">
                    <span className="material-symbols-outlined">event_busy</span>
                    Bugün doğum günü olan personel bulunmamaktadır.
                  </div>
                )}
              </div>
            </section>

            {/* Otomasyon */}
            <section id="otomasyon" className="home-otomasyon">
              <div className="home-section-head">
                <div className="home-section-head__left">
                  <div className="home-section-head__icon home-section-head__icon--navy">
                    <span className="material-symbols-outlined">grid_view</span>
                  </div>
                  <div>
                    <h2>Kurum İçi Otomasyon Sistemleri</h2>
                    <p>Hızlı erişim ve yönetim portalları</p>
                  </div>
                </div>
                <span className="home-otomasyon__count">{otomasyon.length} Uygulama</span>
              </div>

              <div className="home-otomasyon__grid">
                {otomasyon.map((link) => (
                  <a
                    key={link.id}
                    href={link.hedef_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-system"
                  >
                    <span className="home-system__go" aria-hidden="true">
                      <span className="material-symbols-outlined">north_east</span>
                    </span>
                    <div className="home-system__logo">
                      <img
                        src={link.logo || BRAND_IMG}
                        alt=""
                        className="home-media-contain"
                      />
                    </div>
                    <h3>{link.baslik}</h3>
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
