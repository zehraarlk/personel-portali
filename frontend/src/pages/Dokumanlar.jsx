import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Layout from '../../components/Layout';
import { fetchDokumanlar } from '../../api/client';
import { KAYNAK_PAGES, KAYNAK_QUICK_LINKS } from './config';
import '../../styles/dokumanlar.css';

const page = KAYNAK_PAGES.dokumanlar;
const DEFAULT_PAGE_SIZE = 8;


const SORT_OPTIONS = [
  { value: 'newest', label: 'En yeni' },
  { value: 'oldest', label: 'En eski' },
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
];

const PAGE_SIZE_OPTIONS = [
  { value: 8, label: '8 / sayfa' },
  { value: 12, label: '12 / sayfa' },
  { value: 16, label: '16 / sayfa' },
];

const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: 'fas fa-th-large' },
  { id: 'forms', label: 'Formlar', icon: 'far fa-clipboard' },
  { id: 'notifications', label: 'Bildirimler', icon: 'fas fa-bullhorn' },
  { id: 'policies', label: 'Politikalar', icon: 'fas fa-shield-alt' },
  { id: 'contracts', label: 'Sözleşmeler', icon: 'far fa-file-alt' },
  { id: 'other', label: 'Diğer', icon: 'fas fa-ellipsis-h' },
];

const KAYNAK_LINK_ICONS = {
  protokoller: 'fas fa-handshake',
  dokumanlar: 'far fa-file-alt',
  mevzuatlar: 'fas fa-balance-scale',
  egitimler: 'fas fa-graduation-cap',
};

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

function getItemCategory(item) {
  const explicitCategory = normalizeText(
    item.kategori_slug ||
      item.kategori_adi ||
      item.kategori ||
      item.dokuman_kategorisi ||
      item.grup ||
      item.tur_adi
  );

  const titleAndDescription = normalizeText(
    `${item.baslik || ''} ${item.aciklama || ''}`
  );
  const source = explicitCategory || titleAndDescription;

  if (/form|dilekçe|talep/.test(source)) return 'forms';
  if (/bildirim|duyuru|ilan|haber/.test(source)) return 'notifications';
  if (/politika|prosedür|prosedur|yönerge|yonerge|talimat|kvkk|aydınlatma|aydinlatma/.test(source)) {
    return 'policies';
  }
  if (/sözleşme|sozlesme|protokol|mutabakat/.test(source)) return 'contracts';

  return 'other';
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
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
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
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search]);

  const categoryCounts = useMemo(() => {
    const counts = CATEGORIES.reduce(
      (result, category) => ({ ...result, [category.id]: 0 }),
      { all: items.length }
    );

    items.forEach((item) => {
      const category = getItemCategory(item);
      counts[category] = (counts[category] || 0) + 1;
    });

    counts.all = items.length;
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(search);

    const result = items.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || getItemCategory(item) === activeCategory;

      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      const searchableText = normalizeText(
        `${item.baslik || ''} ${item.aciklama || ''} ${getFileType(item)}`
      );

      return searchableText.includes(normalizedQuery);
    });

    return [...result].sort((first, second) => {
      if (sortBy === 'oldest') {
        return parseDocumentDate(first.tarih) - parseDocumentDate(second.tarih);
      }

      if (sortBy === 'az') {
        return String(first.baslik || '').localeCompare(
          String(second.baslik || ''),
          'tr-TR'
        );
      }

      if (sortBy === 'za') {
        return String(second.baslik || '').localeCompare(
          String(first.baslik || ''),
          'tr-TR'
        );
      }

      return parseDocumentDate(second.tarih) - parseDocumentDate(first.tarih);
    });
  }, [items, activeCategory, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory, sortBy, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(query.trim());
  };

  const clearFilters = () => {
    setQuery('');
    setSearch('');
    setActiveCategory('all');
  };

  const changeCategory = (category) => {
    setActiveCategory(category);
  };

  return (
    <Layout>
      <div className="documents-page">
        <section className="documents-heading" aria-labelledby="documents-title">
          <div className="documents-heading__identity">
            <span className="documents-heading__icon" aria-hidden="true">
              <i className="far fa-file-alt" />
            </span>

            <div>
              <h1 id="documents-title">{page.title}</h1>
              <p>{page.description}</p>
            </div>
          </div>

          <div className="documents-stat" aria-live="polite">
            <span className="documents-stat__icon" aria-hidden="true">
              <i className="far fa-folder-open" />
            </span>
            <strong>{loading || error ? '—' : items.length}</strong>
            <span>{page.statLabel || 'Aktif doküman'}</span>
          </div>
        </section>

        <nav className="documents-resource-links" aria-label="Kaynak sayfaları">
          {KAYNAK_QUICK_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `documents-resource-link${isActive ? ' is-active' : ''}`
              }
            >
              <span className="documents-resource-link__label">
                <i
                  className={KAYNAK_LINK_ICONS[link.iconKey] || 'far fa-folder'}
                  aria-hidden="true"
                />
                {link.label}
              </span>
              <i
                className="fas fa-chevron-right documents-resource-link__arrow"
                aria-hidden="true"
              />
            </NavLink>
          ))}
        </nav>

        <section className="documents-toolbar" aria-label="Doküman araçları">
          <form className="documents-search" role="search" onSubmit={submitSearch}>
            <label className="documents-search__field" htmlFor={page.searchId}>
              <i className="fas fa-search" aria-hidden="true" />
              <input
                id={page.searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  page.searchPlaceholder ||
                  'Doküman adı, açıklama veya anahtar kelime ile ara...'
                }
                autoComplete="off"
              />
            </label>

            <button className="documents-search__button" type="submit">
              Ara
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          </form>

          <DocumentsDropdown
            id="documents-category-filter"
            label="Kategori seç"
            value={activeCategory}
            icon="fas fa-th-large"
            options={CATEGORIES.map((category) => ({
              value: category.id,
              label:
                category.id === 'all' ? 'Tüm Kategoriler' : category.label,
              icon: category.icon,
              badge: categoryCounts[category.id] || 0,
            }))}
            onChange={changeCategory}
          />

          <DocumentsDropdown
            id="documents-sort-filter"
            label="Dokümanları sırala"
            value={sortBy}
            icon="fas fa-sort"
            options={SORT_OPTIONS}
            onChange={setSortBy}
          />
        </section>

        <nav className="documents-categories" aria-label="Doküman kategorileri">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`documents-category${
                activeCategory === category.id ? ' is-active' : ''
              }`}
              onClick={() => changeCategory(category.id)}
              aria-pressed={activeCategory === category.id}
            >
              <span className="documents-category__label">
                <i className={category.icon} aria-hidden="true" />
                {category.label}
              </span>
              <span className="documents-category__count">
                {categoryCounts[category.id] || 0}
              </span>
            </button>
          ))}
        </nav>

        {search && !loading && !error ? (
          <div className="documents-result-note">
            <span>
              “<strong>{search}</strong>” için {filteredItems.length} sonuç
            </span>
            <button type="button" onClick={clearFilters}>
              Filtreleri temizle
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
            <p>Arama ifadenizi veya kategori seçiminizi değiştirerek tekrar deneyin.</p>
            <button type="button" onClick={clearFilters}>
              Filtreleri temizle
            </button>
          </div>
        ) : null}

        {!loading && !error && visibleItems.length > 0 ? (
          <section
            className={`documents-list documents-list--${viewMode}`}
            aria-label="Doküman listesi"
          >
            {visibleItems.map((item) => {
              const href = getDocumentHref(item);
              const fileType = getFileType(item);
              const isDownloadable = Boolean(item.dosya_yolu);

              return (
                <article className="documents-card" key={item.id}>
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