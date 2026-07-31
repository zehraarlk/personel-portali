import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import { fetchDokumanlar } from '../../api/client';
import KaynaklarChrome from './KaynaklarChrome';
import '../../styles/etkinlikler.css';
import '../../styles/dokumanlar.css';

const DEFAULT_PAGE_SIZE = 8;


const PAGE_SIZE_OPTIONS = [
  { value: 8, label: '8 / sayfa' },
  { value: 12, label: '12 / sayfa' },
  { value: 16, label: '16 / sayfa' },
];

const ChevronDownIcon = () => (
  <svg
    viewBox="0 0 20 20"
    width="16"
    height="16"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="m5.5 7.75 4.5 4.5 4.5-4.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 20 20"
    width="15"
    height="15"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="m4.5 10.25 3.25 3.25 7.75-7.75"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);


function DocumentsDropdown({
  id,
  label,
  value,
  options,
  onChange,
  icon,
  compact = false,
  placement = 'bottom',
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selectedOption =
    options.find((option) => String(option.value) === String(value)) || options[0];

  useEffect(() => {
    if (!open) return undefined;

    const closeFromOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const closeWithEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeFromOutside);
    document.addEventListener('keydown', closeWithEscape);

    return () => {
      document.removeEventListener('pointerdown', closeFromOutside);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, [open]);

  const focusOption = (index) => {
    const optionButtons = menuRef.current?.querySelectorAll('[role="option"]');
    optionButtons?.[index]?.focus();
  };

  const openAndFocusSelected = () => {
    setOpen(true);
    window.requestAnimationFrame(() => {
      const selectedIndex = Math.max(
        0,
        options.findIndex(
          (option) => String(option.value) === String(value)
        )
      );
      focusOption(selectedIndex);
    });
  };

  const chooseOption = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openAndFocusSelected();
    }
  };

  const handleOptionKeyDown = (event, index) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusOption((index + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption((index - 1 + options.length) % options.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusOption(options.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`documents-dropdown${compact ? ' documents-dropdown--compact' : ''}${
        placement === 'top' ? ' documents-dropdown--up' : ''
      }${open ? ' is-open' : ''}`}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="documents-dropdown__trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((valueIsOpen) => !valueIsOpen)}
        onKeyDown={handleTriggerKeyDown}
      >
        {icon ? (
          <span className="documents-dropdown__leading-icon" aria-hidden="true">
            <i className={icon} />
          </span>
        ) : null}
        <span className="documents-dropdown__value">{selectedOption?.label}</span>
        <span className="documents-dropdown__chevron" aria-hidden="true">
          <ChevronDownIcon />
        </span>
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={`${id}-menu`}
          className="documents-dropdown__menu"
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${id}-option-${String(value)}`}
        >
          {options.map((option, index) => {
            const selected = String(option.value) === String(value);

            return (
              <button
                key={option.value}
                id={`${id}-option-${String(option.value)}`}
                type="button"
                className={`documents-dropdown__option${
                  selected ? ' is-selected' : ''
                }`}
                role="option"
                aria-selected={selected}
                onClick={() => chooseOption(option.value)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
              >
                <span className="documents-dropdown__option-main">
                  {option.icon ? (
                    <i className={option.icon} aria-hidden="true" />
                  ) : null}
                  <span>{option.label}</span>
                </span>

                <span className="documents-dropdown__option-tail" aria-hidden="true">
                  {option.badge !== undefined ? (
                    <span className="documents-dropdown__badge">{option.badge}</span>
                  ) : selected ? (
                    <CheckIcon />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function getFileType(item) {
  const rawType = item.dosya_turu || item.uzanti || item.tip;

  if (rawType) {
    return String(rawType).replace('.', '').trim().toUpperCase();
  }

  const filePath = item.dosya_yolu || item.resmi_sayfa || '';
  const cleanPath = filePath.split('?')[0].split('#')[0];
  const fileName = cleanPath.split('/').pop() || '';

  return fileName.includes('.')
    ? fileName.split('.').pop().toUpperCase()
    : 'DOSYA';
}

function getFileTone(fileType) {
  if (['DOC', 'DOCX'].includes(fileType)) return 'blue';
  if (['XLS', 'XLSX', 'CSV'].includes(fileType)) return 'green';
  if (fileType === 'PDF') return 'red';
  if (['PPT', 'PPTX'].includes(fileType)) return 'orange';
  if (['ZIP', 'RAR', '7Z'].includes(fileType)) return 'amber';
  return 'navy';
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR');
}

function parseDocumentDate(value) {
  if (!value) return 0;

  const text = String(value).trim();
  const turkishDate = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);

  if (turkishDate) {
    const [, day, month, year] = turkishDate;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }

  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getDocumentHref(item) {
  return item.dosya_yolu || item.resmi_sayfa || '';
}

export default function Dokumanlar() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    const timer = setTimeout(() => {
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
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(search);

    const result = items.filter((item) => {
      if (!normalizedQuery) return true;

      const searchableText = normalizeText(
        `${item.baslik || ''} ${item.aciklama || ''} ${getFileType(item)}`
      );

      return searchableText.includes(normalizedQuery);
    });

    return [...result].sort(
      (first, second) =>
        parseDocumentDate(second.tarih) - parseDocumentDate(first.tarih)
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleQueryChange = (value) => {
    setQuery(value);
    setSearch(value.trim());
  };

  const clearSearch = () => {
    setQuery('');
    setSearch('');
  };

  return (
    <Layout>
      <div className="kaynaklar-page documents-page">
        <KaynaklarChrome
          pageKey="dokumanlar"
          query={query}
          onQueryChange={handleQueryChange}
          onClear={clearSearch}
          iconClassName="far fa-file-alt"
        />

        {search && !loading && !error ? (
          <div className="documents-result-note">
            <span>
              “<strong>{search}</strong>” için {filteredItems.length} sonuç
            </span>
            <button type="button" onClick={clearSearch}>
              Aramayı temizle
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="documents-state" role="status">
            <span className="documents-state__spinner" aria-hidden="true" />
            Dokümanlar yükleniyor…
          </div>
        ) : null}

        {!loading && error ? (
          <div className="documents-state documents-state--error" role="alert">
            <i className="fas fa-exclamation-circle" aria-hidden="true" />
            {error}
          </div>
        ) : null}

        {!loading && !error && filteredItems.length === 0 ? (
          <div className="documents-empty">
            <span className="documents-empty__icon" aria-hidden="true">
              <i className="far fa-folder-open" />
            </span>
            <h2>Doküman bulunamadı</h2>
            <p>Arama ifadenizi değiştirerek tekrar deneyin.</p>
            <button type="button" onClick={clearSearch}>
              Aramayı temizle
            </button>
          </div>
        ) : null}

        {!loading && !error && visibleItems.length > 0 ? (
          <section
            className={`documents-list documents-list--${viewMode}`}
            aria-label="Doküman listesi"
            style={{ marginTop: '1.5rem' }}
          >
            {visibleItems.map((item) => {
              const href = getDocumentHref(item);
              const fileType = getFileType(item);
              const isDownloadable = Boolean(item.dosya_yolu);

              return (
                <article
                  className="documents-card"
                  key={item.id}
                  style={{ borderRadius: '24px', overflow: 'hidden' }}
                >
                  <span
                    className={`documents-card__file documents-card__file--${getFileTone(
                      fileType
                    )}`}
                    aria-hidden="true"
                  >
                    <strong>{fileType}</strong>
                    <small>{fileType}</small>
                  </span>

                  <div className="documents-card__content">
                    <h2>{item.baslik || 'İsimsiz doküman'}</h2>
                    <p>{item.aciklama || 'Bu doküman için açıklama bulunmuyor.'}</p>
                  </div>

                  <footer className="documents-card__footer">
                    <div className="documents-card__meta">
                      {item.tarih ? (
                        <span>
                          <i className="far fa-calendar-alt" aria-hidden="true" />
                          {item.tarih}
                        </span>
                      ) : null}

                      {item.boyut ? (
                        <span>
                          <i className="far fa-file-alt" aria-hidden="true" />
                          {item.boyut}
                        </span>
                      ) : null}
                    </div>

                    {href ? (
                      <a
                        className="documents-card__action"
                        href={href}
                        {...(isDownloadable
                          ? { download: '', rel: 'noopener noreferrer' }
                          : { target: '_blank', rel: 'noopener noreferrer' })}
                        aria-label={`${item.baslik || 'Doküman'} ${
                          isDownloadable ? 'indir' : 'görüntüle'
                        }`}
                      >
                        <i
                          className={
                            isDownloadable
                              ? 'fas fa-download'
                              : 'fas fa-external-link-alt'
                          }
                          aria-hidden="true"
                        />
                      </a>
                    ) : null}
                  </footer>
                </article>
              );
            })}
          </section>
        ) : null}

        {!loading && !error && filteredItems.length > 0 ? (
          <footer className="documents-pagination" aria-label="Sayfalama">
            <span>Toplam {filteredItems.length} doküman</span>

            <div className="documents-pagination__controls">
              <button
                type="button"
                className="documents-pagination__arrow"
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
                aria-label="Önceki sayfa"
              >
                <i className="fas fa-chevron-left" aria-hidden="true" />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (pageNumber) =>
                    totalPages <= 5 ||
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - currentPage) <= 1
                )
                .map((pageNumber, index, visiblePages) => {
                  const previousPage = visiblePages[index - 1];
                  const showGap = previousPage && pageNumber - previousPage > 1;

                  return (
                    <span className="documents-pagination__item" key={pageNumber}>
                      {showGap ? <span className="documents-pagination__gap">…</span> : null}
                      <button
                        type="button"
                        className={`documents-pagination__page${
                          currentPage === pageNumber ? ' is-active' : ''
                        }`}
                        onClick={() => setCurrentPage(pageNumber)}
                        aria-current={currentPage === pageNumber ? 'page' : undefined}
                      >
                        {pageNumber}
                      </button>
                    </span>
                  );
                })}

              <button
                type="button"
                className="documents-pagination__arrow"
                onClick={() =>
                  setCurrentPage((value) => Math.min(totalPages, value + 1))
                }
                disabled={currentPage === totalPages}
                aria-label="Sonraki sayfa"
              >
                <i className="fas fa-chevron-right" aria-hidden="true" />
              </button>

              <DocumentsDropdown
                id="documents-page-size"
                label="Sayfa başına doküman sayısı"
                value={pageSize}
                options={PAGE_SIZE_OPTIONS}
                onChange={(nextValue) => setPageSize(Number(nextValue))}
                compact
                placement="top"
              />

              <div className="documents-view-switch" aria-label="Görünüm seçimi">
                <button
                  type="button"
                  className={viewMode === 'grid' ? 'is-active' : ''}
                  onClick={() => setViewMode('grid')}
                  aria-label="Kart görünümü"
                  aria-pressed={viewMode === 'grid'}
                >
                  <i className="fas fa-th-large" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={viewMode === 'list' ? 'is-active' : ''}
                  onClick={() => setViewMode('list')}
                  aria-label="Liste görünümü"
                  aria-pressed={viewMode === 'list'}
                >
                  <i className="fas fa-list" aria-hidden="true" />
                </button>
              </div>
            </div>
          </footer>
        ) : null}
      </div>
    </Layout>
  );
}