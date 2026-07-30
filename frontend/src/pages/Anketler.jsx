import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MediaFrame from '../components/MediaFrame';
import { fetchAnketler } from '../api/client';
import { BRAND_IMG } from '../constants';
import useSiteIcons from '../hooks/useSiteIcons';
import '../styles/anketler.css';

const FILTERS = [
  { id: 'all', label: 'Tümü', iconKey: 'anketler' },
  { id: 'favorites', label: 'Favoriler', iconKey: 'favori', iconFallback: 'fas fa-star' },
  { id: 'active', label: 'Aktif', iconKey: 'aktif', iconFallback: 'fas fa-play' },
  { id: 'pending', label: 'Beklemede', iconKey: 'beklemede', iconFallback: 'fas fa-clock' },
  { id: 'completed', label: 'Tamamlanan', iconKey: 'tamam', iconFallback: 'fas fa-check' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'oldest', label: 'En Eski' },
  { value: 'popular', label: 'Popülerlik' },
];

function emptyMessage(filter, query) {
  if (filter === 'favorites') return 'Henüz favori anketiniz bulunmuyor.';
  if (query) return 'Aradığınız kriterlere uygun anket bulunamadı.';
  return 'Bu kategoride anket bulunamadı.';
}

function statusFa(statusClass) {
  if (statusClass === 'is-pending') return 'fas fa-clock';
  if (statusClass === 'is-completed') return 'fas fa-check-circle';
  if (statusClass === 'is-expired') return 'fas fa-times-circle';
  return 'fas fa-play-circle';
}

export default function Anketler() {
  const { icon } = useSiteIcons();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAnketler()
      .then((data) => {
        if (cancelled) return;
        setRows(Array.isArray(data?.anketler) ? data.anketler : []);
        setError('');
      })
      .catch((ex) => {
        if (!cancelled) setError(ex.message || 'Anketler yüklenemedi.');
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
    let items = rows.filter((item) => {
      if (filter === 'favorites') return !!item.favorite;
      if (filter !== 'all' && item.kategori_slug !== filter) return false;
      return true;
    });

    if (q) {
      items = items.filter((item) => {
        const hay = `${item.baslik || ''} ${item.excerpt || ''} ${item.aciklama || ''}`.toLocaleLowerCase(
          'tr-TR',
        );
        return hay.includes(q);
      });
    }

    items = [...items].sort((a, b) => {
      if (sort === 'popular') {
        return (b.percent || 0) - (a.percent || 0) || b.id - a.id;
      }
      const dateA = Date.parse(a.baslangic_tarihi || '') || 0;
      const dateB = Date.parse(b.baslangic_tarihi || '') || 0;
      if (sort === 'oldest') return dateA - dateB || a.id - b.id;
      return dateB - dateA || b.id - a.id;
    });

    return items;
  }, [rows, search, filter, sort]);

  const onSearch = (e) => {
    e.preventDefault();
    setSearch(query.trim());
  };

  return (
    <Layout>
      <div className="anketler-page">
        <header className="ak-head">
          <div className="ak-head__left">
            <span className="ak-head__icon" aria-hidden="true">
              <i className={icon('anketler')} />
            </span>
            <div>
              <h1>Anketler</h1>
              <p>Kurumsal anketlere katılın, ilerlemeyi takip edin.</p>
            </div>
          </div>
        </header>

        <section className="ak-toolbar" aria-label="Arama ve filtre">
          <form className="ak-search" onSubmit={onSearch} role="search">
            <label className="ak-search__field" htmlFor="anket-search">
              <i className={icon('arama', 'fas fa-search')} aria-hidden="true" />
              <input
                id="anket-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Anket ara…"
                autoComplete="off"
              />
            </label>
            <button type="submit" className="ak-search__btn">
              Ara
            </button>
          </form>

          <label className="ak-sort">
            <span className="sr-only">Sıralama</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <nav className="ak-tabs" aria-label="Anket filtreleri">
          {FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`ak-tab${filter === tab.id ? ' is-active' : ''}`}
              onClick={() => setFilter(tab.id)}
            >
              <i
                className={icon(tab.iconKey, tab.iconFallback || 'fas fa-poll')}
                aria-hidden="true"
              />
              {tab.label}
            </button>
          ))}
        </nav>

        <p className="ak-count">
          <strong>{filtered.length}</strong> sonuç
        </p>

        {loading && <div className="ak-state">Yükleniyor…</div>}
        {!loading && error && <div className="ak-state is-error">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="ak-state">
            <i className={icon('anketler')} aria-hidden="true" />
            <p>{emptyMessage(filter, search)}</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="ak-grid">
            {filtered.map((item) => (
              <article key={item.id} className="ak-card">
                <span className={`ak-badge ${item.status_class || 'is-active'}`}>
                  <i className={statusFa(item.status_class)} aria-hidden="true" />
                  {item.status_label || 'Aktif'}
                </span>
                <div className="ak-card__media">
                  <MediaFrame src={item.resim || BRAND_IMG} alt={item.baslik || ''} forceCover />
                </div>
                <div className="ak-card__body">
                  <h2 className="ak-card__title">{item.baslik}</h2>
                  <p className="ak-card__desc">{item.excerpt || item.aciklama || ''}</p>
                  {item.date_label && (
                    <p className="ak-card__meta">
                      <i className="fas fa-calendar-alt" aria-hidden="true" />
                      {item.date_label}
                    </p>
                  )}
                  <div className="ak-progress">
                    <div className="ak-progress__meta">
                      <span>
                        {item.katilim_sayisi || 0}/{item.hedef_katilim || 1}
                      </span>
                      <span>%{item.percent || 0}</span>
                    </div>
                    <div className="ak-progress__track">
                      <div
                        className="ak-progress__bar"
                        style={{ width: `${Math.min(100, item.percent || 0)}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    to={`/anketler/${item.id}`}
                    className={`ak-card__cta${item.participated ? ' is-done' : ''}`}
                  >
                    <i
                      className={item.participated ? 'fas fa-eye' : 'fas fa-pen'}
                      aria-hidden="true"
                    />
                    {item.participated ? 'Cevapları Gör' : 'Ankete Katıl'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
