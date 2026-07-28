import { useEffect, useState } from 'react';
import KaynaklarShell from '../../components/KaynaklarShell';
import { fetchDokumanlar } from '../../api/client';
import { KAYNAK_PAGES } from './config';

const page = KAYNAK_PAGES.dokumanlar;

function normalizeIcon(icon) {
  const value = (icon || 'fas fa-file-alt').trim();

  if (value.startsWith('fa-') && !value.includes(' ')) {
    return `fas ${value}`;
  }

  return value;
}

function getFileType(item) {
  const rawType = item.dosya_turu || item.uzanti || item.tip;

  if (rawType) {
    return String(rawType).replace('.', '').trim().toUpperCase();
  }

  const filePath = item.dosya_yolu || item.resmi_sayfa || '';
  const cleanPath = filePath.split('?')[0].split('#')[0];
  const fileName = cleanPath.split('/').pop() || '';

  if (!fileName.includes('.')) {
    return '';
  }

  return fileName.split('.').pop().toUpperCase();
}

function getFileTypeIcon(fileType) {
  switch (fileType) {
    case 'DOC':
    case 'DOCX':
      return 'far fa-file-word';
    case 'PDF':
      return 'far fa-file-pdf';
    case 'XLS':
    case 'XLSX':
      return 'far fa-file-excel';
    case 'PPT':
    case 'PPTX':
      return 'far fa-file-powerpoint';
    case 'ZIP':
    case 'RAR':
    case '7Z':
      return 'far fa-file-archive';
    default:
      return 'far fa-file-alt';
  }
}

export default function Dokumanlar() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    fetchDokumanlar(search)
      .then((data) => {
        if (!cancelled) {
          setItems(Array.isArray(data.dokumanlar) ? data.dokumanlar : []);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setItems([]);
          setError(
            requestError.message || 'Dokümanlar yüklenirken bir sorun oluştu.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search]);

  const clearSearch = () => {
    setQuery('');
    setSearch('');
  };

  return (
    <KaynaklarShell
      title={page.title}
      description={page.description}
      searchPlaceholder={page.searchPlaceholder}
      searchId={page.searchId}
      statCount={!loading && !error ? items.length : null}
      statLabel={page.statLabel}
      query={query}
      search={search}
      onQueryChange={setQuery}
      onSearch={setSearch}
      onClearSearch={clearSearch}
    >
      {search && !loading && !error ? (
        <p className="protokoller-filter-note">
          “<strong>{search}</strong>” için {items.length} sonuç
        </p>
      ) : null}

      {loading ? (
        <div className="protokoller-state" role="status">
          <span className="protokoller-state__pulse" aria-hidden="true" />
          Dokümanlar yükleniyor…
        </div>
      ) : null}

      {!loading && error ? (
        <p className="protokoller-state protokoller-state--error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="protokoller-empty">
          <i className="fas fa-file-alt" aria-hidden="true" />
          <h2>Doküman bulunamadı</h2>
          <p>
            {search
              ? 'Arama ifadenizi değiştirerek tekrar deneyebilirsiniz.'
              : 'Henüz yayımlanmış bir doküman bulunmuyor.'}
          </p>

          {search ? (
            <button
              type="button"
              className="protokoller-toolbar__btn"
              onClick={clearSearch}
            >
              Aramayı temizle
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="protokoller-grid">
          {items.map((item, index) => {
            const href = item.dosya_yolu || item.resmi_sayfa || '';
            const Card = href ? 'a' : 'article';
            const fileType = getFileType(item);
            const isDownloadable = Boolean(item.dosya_yolu);

            const linkProps = href
              ? isDownloadable
                ? {
                    href,
                    download: '',
                    rel: 'noopener noreferrer',
                  }
                : {
                    href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }
              : {};

            return (
              <Card
                key={item.id}
                className="protokol-card"
                style={{ '--card-delay': `${Math.min(index, 8) * 40}ms` }}
                {...linkProps}
              >
                <span className="protokol-card__accent" aria-hidden="true" />

                <div className="protokol-card__body">
                  <div className="protokol-card__top">
                    <span className="protokol-card__icon" aria-hidden="true">
                      <i className={normalizeIcon(item.ikon)} />
                    </span>

                    <div className="protokol-card__chips">
                      {item.tarih ? (
                        <span className="protokol-chip">
                          <i className="far fa-calendar-alt" aria-hidden="true" />
                          {item.tarih}
                        </span>
                      ) : null}

                      {item.boyut ? (
                        <span className="protokol-chip">
                          <i className="far fa-file-alt" aria-hidden="true" />
                          {item.boyut}
                        </span>
                      ) : null}

                      {fileType ? (
                        <span className="protokol-chip protokol-chip--filetype">
                          <i
                            className={getFileTypeIcon(fileType)}
                            aria-hidden="true"
                          />
                          {fileType}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <h2 className="protokol-card__title">{item.baslik}</h2>
                  <p className="protokol-card__desc">{item.aciklama}</p>
                </div>

                {href ? (
                  <span className="protokol-card__cta">
                    {isDownloadable
                      ? 'Dokümanı indir'
                      : 'Dokümanı görüntüle'}
                    <i
                      className={
                        isDownloadable
                          ? 'fas fa-download'
                          : 'fas fa-arrow-right'
                      }
                      aria-hidden="true"
                    />
                  </span>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : null}
    </KaynaklarShell>
  );
}
