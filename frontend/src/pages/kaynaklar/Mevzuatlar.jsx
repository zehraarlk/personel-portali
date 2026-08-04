import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { fetchMevzuatlar } from '../../api/client';
import KaynaklarChrome from './KaynaklarChrome';
import '../../styles/protokoller.css';
import '../../styles/mevzuatlar.css';

const SAYFA_BASI = 9;

function normalizeIcon(ikon) {
  const raw = (ikon || 'fas fa-balance-scale').trim();
  if (raw.startsWith('fa-') && !raw.includes(' ')) {
    return `fas ${raw}`;
  }
  return raw;
}

export default function Mevzuatlar() {
  const location = useLocation();
  const filtreRef = useRef(null);
  const ilkYuklemeTamam = useRef(false);
  const oncekiAltKategori = useRef(null);

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
    setMenuAcik(false);
  }, [location.key]);

  useEffect(() => {
    let cancelled = false;

    if (!ilkYuklemeTamam.current) {
      setLoading(true);
    }
    setError(null);

    const kategoriDegisti = oncekiAltKategori.current !== altKategori;
    oncekiAltKategori.current = altKategori;
    const bekleSuresi = kategoriDegisti ? 0 : 300;

    const gecikme = setTimeout(() => {
      fetchMevzuatlar(query.trim(), altKategori)
        .then((data) => {
          if (cancelled) return;
          setItems(data?.mevzuatlar ?? []);
          setAltKategoriler(data?.alt_kategoriler ?? []);
          setError(null);
        })
        .catch(() => {
          if (cancelled) return;
          setItems([]);
          setError('Mevzuatlar yüklenirken bir sorun oluştu.');
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
            ilkYuklemeTamam.current = true;
          }
        });
    }, bekleSuresi);

    return () => {
      cancelled = true;
      clearTimeout(gecikme);
    };
  }, [query, altKategori]);

  useEffect(() => {
    setSayfa(0);
  }, [query, altKategori]);

  useEffect(() => {
    if (!menuAcik) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuAcik(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuAcik]);

  const filtered = useMemo(() => items, [items]);

  const toplamSayfa = Math.max(1, Math.ceil(filtered.length / SAYFA_BASI));
  const gosterilenler = filtered.slice(sayfa * SAYFA_BASI, sayfa * SAYFA_BASI + SAYFA_BASI);
  const sayfaNumaralari = Array.from({ length: toplamSayfa }, (_, i) => i);

  const clearSearch = () => {
    setQuery('');
  };

  const scrollToFiltre = () => {
    filtreRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  };

  const aktifAltKategoriAdi = altKategori
    ? altKategoriler.find((kategori) => kategori.slug === altKategori)?.ad ?? 'Seçili kategori'
    : 'Tümü';

  return (
    <Layout>
      <div className="kaynaklar-page mevzuatlar-page-route">
        <KaynaklarChrome
          pageKey="mevzuatlar"
          query={query}
          onQueryChange={setQuery}
          onClear={clearSearch}
          iconClassName="fas fa-balance-scale"
        />

        <div className="mevzuat-filter-bar" ref={filtreRef}>
          <p className="mevzuat-filter-bar__label">
            Kategori: <strong>{aktifAltKategoriAdi}</strong>
          </p>

          <div className="mevzuat-menu">
            <button
              type="button"
              className="mevzuat-menu__btn"
              onClick={() => setMenuAcik((oncekiDeger) => !oncekiDeger)}
              aria-expanded={menuAcik}
              aria-controls="mevzuat-kategori-listesi"
            >
              <i className="fas fa-bars" aria-hidden="true" />
              Kategoriler
            </button>

            {menuAcik ? (
              <>
                <button
                  type="button"
                  className="mevzuat-menu__overlay"
                  aria-label="Kategori menüsünü kapat"
                  onClick={() => setMenuAcik(false)}
                />

                <div id="mevzuat-kategori-listesi" className="mevzuat-menu__list">
                  <button
                    type="button"
                    className={`mevzuat-menu__item${altKategori === null ? ' is-active' : ''}`}
                    onClick={() => {
                      setAltKategori(null);
                      setQuery('');
                      setMenuAcik(false);
                      scrollToFiltre();
                    }}
                  >
                    <i className="fas fa-list" aria-hidden="true" />
                    Tümü
                  </button>

                  {altKategoriler.map((kategori) => (
                    <button
                      key={kategori.id}
                      type="button"
                      className={`mevzuat-menu__item${altKategori === kategori.slug ? ' is-active' : ''}`}
                      onClick={() => {
                        setAltKategori(kategori.slug);
                        setQuery('');
                        setMenuAcik(false);
                        scrollToFiltre();
                      }}
                    >
                      <i className="fas fa-balance-scale" aria-hidden="true" />
                      {kategori.ad}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {query && !loading && !error ? (
          <p className="protokoller-filter-note">
            “<strong>{query}</strong>” için {filtered.length} sonuç
          </p>
        ) : null}

        {loading ? (
          <div className="protokoller-state" role="status">
            <span className="protokoller-state__pulse" aria-hidden="true" />
            Mevzuatlar yükleniyor…
          </div>
        ) : null}

        {!loading && error ? (
          <p className="protokoller-state protokoller-state--error" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
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
        ) : null}

        {!loading && !error && gosterilenler.length > 0 ? (
          <div className="mevzuat-grid">
            {gosterilenler.map((item) => {
              const href = item.dosya_yolu || item.resmi_sayfa || undefined;
              const CardTag = href ? 'a' : 'article';
              const cardProps = href
                ? {
                    href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    'aria-label': `${item.baslik} bağlantısını aç`,
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

                  <p className="mevzuat-card__desc">
                    {item.aciklama || 'Açıklama bulunmuyor.'}
                  </p>

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
        ) : null}

        {!loading && !error && toplamSayfa > 1 ? (
          <div className="mevzuat-pagination">
            <button
              type="button"
              onClick={() => {
                setSayfa((s) => Math.max(0, s - 1));
                scrollToFiltre();
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
                  scrollToFiltre();
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
                scrollToFiltre();
              }}
              disabled={sayfa >= toplamSayfa - 1}
              className="mevzuat-pagination__arrow"
              aria-label="Sonraki sayfa"
            >
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}