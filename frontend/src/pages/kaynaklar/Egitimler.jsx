import { useEffect, useMemo, useState } from 'react';
import KaynaklarShell from '../../components/KaynaklarShell';
import { fetchEgitimler } from '../../api/client';
import { KAYNAK_PAGES } from './config';
import '../../styles/protokoller.css';
import '../../styles/egitimler.css';

function normalizeIcon(ikon) {
  const raw = (ikon || 'fas fa-graduation-cap').trim();
  if (raw.startsWith('fa-') && !raw.includes(' ')) return `fas ${raw}`;
  return raw;
}

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

const page = KAYNAK_PAGES.egitimler;

export default function Egitimler() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const q = search.trim().toLocaleLowerCase('tr-TR');
    if (!q) return items;
    return items.filter((item) => {
      const haystack = `${item.baslik || ''} ${item.aciklama || ''}`.toLocaleLowerCase(
        'tr-TR',
      );
      return haystack.includes(q);
    });
  }, [items, search]);

  return (
    <KaynaklarShell
      title={page.title}
      description={page.description}
      searchPlaceholder={page.searchPlaceholder}
      searchId={page.searchId}
      statCount={!loading && !error ? filtered.length : null}
      statLabel={page.statLabel}
      query={query}
      search={search}
      onQueryChange={setQuery}
      onSearch={setSearch}
      onClearSearch={() => {
        setQuery('');
        setSearch('');
      }}
    >
      {search && !loading && !error ? (
        <p className="protokoller-filter-note">
          “<strong>{search}</strong>” için {filtered.length} sonuç
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
          {search ? (
            <button
              type="button"
              className="protokoller-toolbar__btn"
              onClick={() => {
                setQuery('');
                setSearch('');
              }}
            >
              Aramayı temizle
            </button>
          ) : null}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="protokoller-grid">
          {filtered.map((item, index) => {
            const ortakLink = resolveLink(item, ORTAK_LINK_ALANLARI);

            return (
              <article
                key={item.id}
                className="protokol-card"
                style={{ '--card-delay': `${Math.min(index, 8) * 40}ms` }}
              >
                <span className="protokol-card__accent" aria-hidden="true" />
                <div className="protokol-card__body">
                  <div className="protokol-card__top">
                    <span className="protokol-card__icon" aria-hidden="true">
                      <i className={normalizeIcon(item.ikon)} />
                    </span>
                    <div className="protokol-card__chips">
                      <span className="protokol-chip">
                        <i className="far fa-calendar-alt" aria-hidden="true" />
                        {item.tarih || '—'}
                      </span>
                      <span className="protokol-chip">
                        <i className="far fa-file-alt" aria-hidden="true" />
                        {item.boyut || '—'}
                      </span>
                    </div>
                  </div>

                  <h2 className="protokol-card__title">{item.baslik}</h2>
                  <p className="protokol-card__desc">{item.aciklama}</p>
                </div>

                {ortakLink && (
                  <div className="protokol-card__cta protokol-card__cta--split">
                    <a
                      href={ortakLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="protokol-card__cta-item"
                    >
                      <i className="fas fa-globe" aria-hidden="true" />
                      Resmi Sayfa
                    </a>
                    <a
                      href={ortakLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="protokol-card__cta-item"
                    >
                      <i className="fas fa-circle-play" aria-hidden="true" />
                      Video
                    </a>
                    <a
                      href={ortakLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="protokol-card__cta-item"
                    >
                      <i className="fas fa-file-pdf" aria-hidden="true" />
                      Sunum
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </KaynaklarShell>
  );
}