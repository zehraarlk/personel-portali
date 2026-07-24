import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEtkinlikler } from '../api/client';
import Layout from '../components/Layout';
import '../styles/etkinlikler.css';

const PAGE_SIZE = 8;

function formatTarih(iso) {
  const d = new Date(iso);
  return {
    gun: d.toLocaleDateString('tr-TR', { day: '2-digit' }),
    ay: d.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', ''),
    ayYil: d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
    yil: d.getFullYear(),
    gunAdi: d.toLocaleDateString('tr-TR', { weekday: 'long' }),
    tam: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
  };
}

const BUGUN = new Date();

export default function Etkinlikler() {
  const [durumlar, setDurumlar] = useState([]);
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [activeDurum, setActiveDurum] = useState(null); // null = Tümü
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const timelineRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEtkinlikler(activeDurum)
      .then((data) => {
        if (cancelled) return;
        setDurumlar(data.durumlar ?? []);
        setEtkinlikler(data.etkinlikler ?? []);
        setError(null);
        setSelectedYear('all');
        setPage(1);
      })
      .catch(() => {
        if (!cancelled) setError('Etkinlikler yüklenirken bir sorun oluştu.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeDurum]);

  const siraliEtkinlikler = useMemo(
    () => [...etkinlikler].sort((a, b) => new Date(a.tarih) - new Date(b.tarih)),
    [etkinlikler],
  );

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('tr-TR');
  const isSearching = normalizedSearch.length > 0;

  const searchSonuclari = useMemo(() => {
    if (!isSearching) return siraliEtkinlikler;
    return siraliEtkinlikler.filter((e) => {
      const hedef = `${e.baslik ?? ''} ${e.aciklama ?? ''}`.toLocaleLowerCase('tr-TR');
      return hedef.includes(normalizedSearch);
    });
  }, [siraliEtkinlikler, isSearching, normalizedSearch]);

  const featured = isSearching ? null : siraliEtkinlikler[0] ?? null;
  const rest = isSearching ? searchSonuclari : siraliEtkinlikler.slice(1);

  const years = useMemo(() => {
    const set = new Set(rest.map((e) => formatTarih(e.tarih).yil));
    return Array.from(set).sort((a, b) => a - b);
  }, [rest]);

  const filteredRest = useMemo(() => {
    if (selectedYear === 'all') return rest;
    return rest.filter((e) => formatTarih(e.tarih).yil === Number(selectedYear));
  }, [rest, selectedYear]);

  const totalPages = Math.max(1, Math.ceil(filteredRest.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pagedRest = filteredRest.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const bugunEtiket = BUGUN.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <Layout>
      <div className="etkinlikler-page">
        {/* Header */}
        <header className="etkinlikler-head">
          <div className="etkinlikler-head-left">
            <span className="etkinlikler-head-icon">
              <i className="fas fa-calendar-days" aria-hidden="true" />
            </span>
            <div>
              <h1>Etkinlikler</h1>
              <p>Gebze Belediyesi tarafından düzenlenen güncel ve yaklaşan etkinlikler.</p>
            </div>
          </div>
        </header>

        {loading && (
          <div className="etkinlikler-skeleton">
            <div className="etkinlikler-skeleton-hero" />
            <div className="etkinlikler-skeleton-row" />
            <div className="etkinlikler-skeleton-row" />
          </div>
        )}

        {!loading && error && <p className="etkinlikler-state etkinlikler-state--error">{error}</p>}

        {!loading && !error && siraliEtkinlikler.length === 0 && (
          <div className="etkinlikler-empty">
            <i className="fas fa-calendar-xmark" aria-hidden="true" />
            <p>Şu anda gösterilecek bir etkinlik yok.</p>
          </div>
        )}

        {!loading && !error && siraliEtkinlikler.length > 0 && (
          <>
            {/* 1. Sıradaki Etkinlik (Hero) */}
            {featured && (
              <Link to={`/etkinlikler/${featured.id}`} className="etkinlik-hero">
                <div className="etkinlik-hero-media">
                  {featured.resim ? (
                    <img src={featured.resim} alt={featured.baslik} />
                  ) : (
                    <div className="etkinlik-hero-media--placeholder" />
                  )}
                  <div className="etkinlik-hero-shade" />
                </div>

                <div className="etkinlik-hero-body">
                  <div className="etkinlik-hero-top">
                    <span className="etkinlik-hero-tag">
                      <i className="fas fa-star" aria-hidden="true" />
                      Sıradaki Etkinlik
                    </span>
                  </div>

                  <h2 className="etkinlik-hero-title">{featured.baslik}</h2>

                  <div className="etkinlik-hero-date">
                    <div className="etkinlik-hero-date-block">
                      <span className="etkinlik-hero-date-gun">{formatTarih(featured.tarih).gun}</span>
                      <span className="etkinlik-hero-date-ay">{formatTarih(featured.tarih).ay}</span>
                    </div>
                    <div className="etkinlik-hero-date-text">
                      <strong>{formatTarih(featured.tarih).tam}</strong>
                      <span>{formatTarih(featured.tarih).gunAdi}</span>
                      {featured.bitis_tarihi && (
                        <span className="etkinlik-hero-date-bitis">
                          {formatTarih(featured.bitis_tarihi).tam} tarihine kadar
                        </span>
                      )}
                    </div>
                    {featured.durum_ref && (
                      <span className="etkinlik-hero-badge">{featured.durum_ref}</span>
                    )}
                  </div>

                  {featured.aciklama && <p className="etkinlik-hero-desc">{featured.aciklama}</p>}
                </div>
              </Link>
            )}

            {/* 2. Arama ve Filtre Toolbar'ı (Sıradaki Etkinliğin Altına Alındı) */}
            <div className="etkinlikler-toolbar">
              <div className="etkinlikler-searchbar">
                <i className="fas fa-magnifying-glass" aria-hidden="true" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Etkinlik ara…"
                  aria-label="Etkinlik ara"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="etkinlikler-searchbar-clear"
                    onClick={() => {
                      setSearchTerm('');
                      setPage(1);
                    }}
                    aria-label="Aramayı temizle"
                  >
                    <i className="fas fa-xmark" aria-hidden="true" />
                  </button>
                )}
              </div>

              {durumlar.length > 0 && (
                <div className="etkinlikler-tabs" role="tablist" aria-label="Etkinlik durumu filtrele">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeDurum === null}
                    className={`etkinlikler-tab${activeDurum === null ? ' is-active' : ''}`}
                    onClick={() => setActiveDurum(null)}
                  >
                    Tümü
                  </button>
                  {durumlar.map((d) => (
                    <button
                      key={d.slug}
                      type="button"
                      role="tab"
                      aria-selected={activeDurum === d.slug}
                      className={`etkinlikler-tab${activeDurum === d.slug ? ' is-active' : ''}`}
                      onClick={() => setActiveDurum(d.slug)}
                    >
                      {d.ad}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Liste / Kart Alanı */}
            {(rest.length > 0 || isSearching) && (
              <div className="etkinlik-timeline" ref={timelineRef}>
                <div className="etkinlik-timeline-toolbar">
                  {isSearching ? (
                    <span className="etkinlik-timeline-today-label">
                      “{searchTerm.trim()}” için {filteredRest.length} sonuç bulundu
                    </span>
                  ) : (
                    <div className="etkinlik-timeline-today">
                      <span className="etkinlik-timeline-today-dot" />
                      <span className="etkinlik-timeline-today-label">Bugün · {bugunEtiket}</span>
                    </div>
                  )}

                  {years.length > 1 && (
                    <label className="etkinlik-year-select">
                      <i className="fas fa-filter" aria-hidden="true" />
                      <select value={selectedYear} onChange={handleYearChange}>
                        <option value="all">Tüm Yıllar</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                {pagedRest.length === 0 ? (
                  <p className="etkinlikler-state">
                    {isSearching
                      ? 'Aramanızla eşleşen bir etkinlik bulunamadı.'
                      : 'Bu seçime uygun etkinlik bulunmuyor.'}
                  </p>
                ) : (
                  <div className="etkinlik-timeline-items">
                    {pagedRest.map((e) => {
                      const tarih = formatTarih(e.tarih);
                      return (
                        <Link
                          key={e.id}
                          to={`/etkinlikler/${e.id}`}
                          className="etkinlik-timeline-card"
                        >
                          {e.resim && (
                            <div className="etkinlik-timeline-card-media">
                              <img src={e.resim} alt={e.baslik} />
                            </div>
                          )}
                          <div className="etkinlik-timeline-card-body">
                            <div className="etkinlik-timeline-card-badges">
                              <span className="etkinlik-timeline-card-month">{tarih.ayYil}</span>
                              {e.durum_ref && (
                                <span className="etkinlik-timeline-card-badge">{e.durum_ref}</span>
                              )}
                            </div>
                            <h3>{e.baslik}</h3>
                            <p className="etkinlik-timeline-card-meta">
                              <i className="fas fa-calendar-day" aria-hidden="true" />
                              {tarih.tam}
                              {e.bitis_tarihi && ` – ${formatTarih(e.bitis_tarihi).tam}`}
                            </p>
                            {e.aciklama && (
                              <p className="etkinlik-timeline-card-desc">{e.aciklama}</p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="etkinlik-pagination">
                    <button
                      type="button"
                      className="etkinlik-pagination-btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      aria-label="Önceki sayfa"
                    >
                      <i className="fas fa-chevron-left" aria-hidden="true" />
                    </button>

                    <span className="etkinlik-pagination-label">
                      Sayfa {safePage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      className="etkinlik-pagination-btn"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      aria-label="Sonraki sayfa"
                    >
                      <i className="fas fa-chevron-right" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}