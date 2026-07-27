import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { fetchMevzuatlar } from '../../api/client';
import '../../styles/protokoller.css';
import '../../styles/mevzuatlar.css';

const QUICK_LINKS = [
  { to: '/protokoller', label: 'Protokoller', icon: 'fas fa-file-signature' },
  { to: '/dokumanlar', label: 'Dökümanlar', icon: 'fas fa-file-alt' },
  { to: '/mevzuatlar', label: 'Mevzuatlar', icon: 'fas fa-balance-scale' },
  { to: '/egitimler', label: 'Eğitimler', icon: 'fas fa-graduation-cap' },
];

const SAYFA_BASI = 9;

function normalizeIcon(ikon) {
  const raw = (ikon || 'fas fa-balance-scale').trim();
  if (raw.startsWith('fa-') && !raw.includes(' ')) return `fas ${raw}`;
  return raw;
}

export default function Mevzuatlar() {
  const location = useLocation();
  const filtreRef = useRef(null);
  const [items, setItems] = useState([]);
  const [altKategoriler, setAltKategoriler] = useState([]);
  const [altKategori, setAltKategori] = useState(null);
  const [query, setQuery] = useState('');
  const [sayfa, setSayfa] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuAcik, setMenuAcik] = useState(false);

  useEffect(() => {
    setAltKategori(null);
    setQuery('');
    setSayfa(0);
  }, [location.key]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const gecikme = setTimeout(() => {
      fetchMevzuatlar(query.trim(), altKategori)
        .then((data) => {
          if (cancelled) return;
          setItems(data.mevzuatlar ?? []);
          setAltKategoriler(data.alt_kategoriler ?? []);
          setError(null);
        })
        .catch(() => {
          if (!cancelled) setError('Mevzuatlar yüklenirken bir sorun oluştu.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(gecikme);
    };
  }, [query, altKategori]);

  useEffect(() => {
    setSayfa(0);
  }, [query, altKategori]);

  const filtered = useMemo(() => items, [items]);

  const toplamSayfa = Math.max(1, Math.ceil(filtered.length / SAYFA_BASI));
  const gosterilenler = filtered.slice(sayfa * SAYFA_BASI, sayfa * SAYFA_BASI + SAYFA_BASI);
  const sayfaNumaralari = Array.from({ length: toplamSayfa }, (_, i) => i);

  const clearSearch = () => {
    setQuery('');
  };

  const aktifAltKategoriAdi = altKategori
    ? altKategoriler.find((k) => k.slug === altKategori)?.ad
    : 'Tümü';

  return (
    <Layout>
      <div className="protokoller-page">
        <header className="protokoller-hero">
          <div className="protokoller-hero__text">
            <span className="protokoller-hero__eyebrow">Kaynaklar</span>
            <h1>Mevzuatlar</h1>
            <p>
              Personelimizi ilgilendiren kanun, yönetmelik ve mevzuat metinlerine buradan
              ulaşabilirsiniz.
            </p>
          </div>
          {!loading && !error ? (
            <div className="protokoller-hero__stat" aria-live="polite">
              <strong>{filtered.length}</strong>
              <span>mevzuat</span>
            </div>
          ) : null}
        </header>

        <div className="protokoller-bar">
          <div className="protokoller-toolbar">
            <label className="protokoller-toolbar__field" htmlFor="mevzuat-ara">
              <i className="fas fa-search" aria-hidden="true" />
              <input
                id="mevzuat-ara"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kanun veya mevzuat adı ara…"
                autoComplete="off"
              />
            </label>
            {query ? (
              <div className="protokoller-toolbar__actions">
                <button type="button" className="protokoller-toolbar__ghost" onClick={clearSearch}>
                  Temizle
                </button>
              </div>
            ) : null}
          </div>

          <nav className="protokoller-quick" aria-label="Hızlı erişim">
            {QUICK_LINKS.map((item) => {
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`protokoller-quick__btn${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <i className={item.icon} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mevzuat-filter-bar" ref={filtreRef}>
          <p className="mevzuat-filter-bar__label">
            Kategori: <strong>{aktifAltKategoriAdi}</strong>
          </p>

          <div className="mevzuat-menu">
            <button
              type="button"
              className="mevzuat-menu__btn"
              onClick={() => setMenuAcik((v) => !v)}
            >
              <i className="fas fa-bars" aria-hidden="true" />
              Kategoriler
            </button>

            {menuAcik && (
              <>
                <div className="mevzuat-menu__overlay" onClick={() => setMenuAcik(false)} />
                <div className="mevzuat-menu__list">
                  <button
                    type="button"
                    className={`mevzuat-menu__item${altKategori === null ? ' is-active' : ''}`}
                    onClick={() => {
                      setAltKategori(null);
                      setQuery('');
                      setMenuAcik(false);
                    }}
                  >
                    <i className="fas fa-list" aria-hidden="true" />
                    Tümü
                  </button>
                  {altKategoriler.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      className={`mevzuat-menu__item${altKategori === k.slug ? ' is-active' : ''}`}
                      onClick={() => {
                        setAltKategori(k.slug);
                        setQuery('');
                        setMenuAcik(false);
                      }}
                    >
                      <i className="fas fa-balance-scale" aria-hidden="true" />
                      {k.ad}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {query && !loading && !error ? (
          <p className="protokoller-filter-note">
            “<strong>{query}</strong>” için {filtered.length} sonuç
          </p>
        ) : null}

        {loading && (
          <div className="protokoller-state" role="status">
            <span className="protokoller-state__pulse" aria-hidden="true" />
            Mevzuatlar yükleniyor…
          </div>
        )}
        {!loading && error && (
          <p className="protokoller-state protokoller-state--error">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="protokoller-empty">
            <i className="fas fa-balance-scale" aria-hidden="true" />
            <h2>Sonuç bulunamadı</h2>
            <p>Aramanızı veya kategori seçiminizi değiştirerek tekrar deneyebilirsiniz.</p>
            {query ? (
              <button type="button" className="protokoller-toolbar__btn" onClick={clearSearch}>
                Aramayı temizle
              </button>
            ) : null}
          </div>
        )}

        {!loading && !error && gosterilenler.length > 0 && (
          <div className="mevzuat-grid">
            {gosterilenler.map((item) => {
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
                <CardTag key={item.id} className="mevzuat-card" {...cardProps}>
                  <div className="mevzuat-card__head">
                    <span className="mevzuat-card__icon" aria-hidden="true">
                      <i className={normalizeIcon(item.ikon)} />
                    </span>
                    <h2 className="mevzuat-card__title">{item.baslik}</h2>
                  </div>

                  <p className="mevzuat-card__desc">{item.aciklama}</p>

                  <div className="mevzuat-card__foot">
                    <span className="mevzuat-card__meta">
                      <i className="far fa-calendar-alt" aria-hidden="true" />
                      {item.tarih || '—'}
                    </span>
                    <span className="mevzuat-card__meta">
                      <i className="far fa-file-alt" aria-hidden="true" />
                      {item.boyut || '—'}
                    </span>
                    {href ? (
                      <span className="mevzuat-card__link">
                        Görüntüle
                        <i className="fas fa-arrow-right" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                </CardTag>
              );
            })}
          </div>
        )}

        {!loading && !error && toplamSayfa > 1 && (
          <div className="mevzuat-pagination">
            <button
              type="button"
              onClick={() => {
                setSayfa((s) => Math.max(0, s - 1));
                filtreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              disabled={sayfa === 0}
              className="mevzuat-pagination__arrow"
              aria-label="Önceki sayfa"
            >
              <i className="fas fa-chevron-left" aria-hidden="true" />
            </button>

            {sayfaNumaralari.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setSayfa(n);
                  filtreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                aria-current={sayfa === n ? 'page' : undefined}
                className={`mevzuat-pagination__num${sayfa === n ? ' is-active' : ''}`}
              >
                {n + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setSayfa((s) => Math.min(toplamSayfa - 1, s + 1));
                filtreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              disabled={sayfa >= toplamSayfa - 1}
              className="mevzuat-pagination__arrow"
              aria-label="Sonraki sayfa"
            >
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}