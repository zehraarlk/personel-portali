import { useEffect, useState } from 'react';
import { fetchDuyurular } from '../api/client';
import '../styles/duyurular.css';

const DATE_FORMATTER = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function formatDate(value) {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date);
}

function DuyuruCard({ duyuru }) {
  return (
    <article className="duyuru-card">
      <div className="duyuru-card__image" aria-hidden="true">
        <span className="duyuru-card__image-placeholder">
          <i className="fa-solid fa-bullhorn" />
        </span>

        {duyuru.resim ? (
          <img
            src={duyuru.resim}
            alt=""
            loading="lazy"
            onError={(event) => event.currentTarget.remove()}
          />
        ) : null}
      </div>

      <div className="duyuru-card__body">
        <div className="duyuru-card__meta">
          {duyuru.kategori ? (
            <span className="duyuru-card__category">{duyuru.kategori}</span>
          ) : null}

          {duyuru.tarih ? (
            <time dateTime={duyuru.tarih}>
              <i className="fa-regular fa-calendar" aria-hidden="true" />
              {formatDate(duyuru.tarih)}
            </time>
          ) : null}
        </div>

        <h2>{duyuru.baslik}</h2>

        {duyuru.aciklama ? (
          <p className="duyuru-card__description">{duyuru.aciklama}</p>
        ) : (
          <p className="duyuru-card__description duyuru-card__description--empty">
            Bu duyuru için açıklama bulunmuyor.
          </p>
        )}
      </div>
    </article>
  );
}

export default function Duyurular() {
  const [kategoriler, setKategoriler] = useState([]);
  const [duyurular, setDuyurular] = useState([]);
  const [aktifKategori, setAktifKategori] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDuyurular() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchDuyurular(aktifKategori);

        if (!controller.signal.aborted) {
          setKategoriler(Array.isArray(data.kategoriler) ? data.kategoriler : []);
          setDuyurular(Array.isArray(data.duyurular) ? data.duyurular : []);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message || 'Duyurular yüklenemedi.');
          setDuyurular([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDuyurular();

    return () => controller.abort();
  }, [aktifKategori, reloadToken]);

  return (
    <main className="duyurular-page">
      <header className="duyurular-page__header">
        <div>
          <span className="duyurular-page__eyebrow">Etkinlikler</span>
          <h1>Duyurular</h1>
          <p>Kurum içi güncel duyuru ve bilgilendirmeleri buradan takip edebilirsiniz.</p>
        </div>

        {!loading && !error ? (
          <span className="duyurular-page__count">
            {duyurular.length} duyuru
          </span>
        ) : null}
      </header>

      <nav className="duyuru-filters" aria-label="Duyuru kategorileri">
        <button
          type="button"
          className={aktifKategori === '' ? 'is-active' : ''}
          aria-pressed={aktifKategori === ''}
          onClick={() => setAktifKategori('')}
        >
          Tümü
        </button>

        {kategoriler.map((kategori) => (
          <button
            type="button"
            key={kategori.id}
            className={aktifKategori === kategori.slug ? 'is-active' : ''}
            aria-pressed={aktifKategori === kategori.slug}
            onClick={() => setAktifKategori(kategori.slug)}
          >
            {kategori.ad}
          </button>
        ))}
      </nav>

      {loading ? (
        <section className="duyurular-status" aria-live="polite">
          <span className="duyurular-spinner" aria-hidden="true" />
          <p>Duyurular yükleniyor...</p>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="duyurular-status duyurular-status--error" role="alert">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <h2>Duyurular alınamadı</h2>
          <p>{error}</p>
          <button type="button" onClick={() => setReloadToken((value) => value + 1)}>
            Yeniden dene
          </button>
        </section>
      ) : null}

      {!loading && !error && duyurular.length === 0 ? (
        <section className="duyurular-status">
          <i className="fa-regular fa-folder-open" aria-hidden="true" />
          <h2>Duyuru bulunamadı</h2>
          <p>Seçtiğiniz kategoride yayımlanmış bir duyuru bulunmuyor.</p>
        </section>
      ) : null}

      {!loading && !error && duyurular.length > 0 ? (
        <section className="duyurular-grid" aria-label="Duyuru listesi">
          {duyurular.map((duyuru) => (
            <DuyuruCard key={duyuru.id} duyuru={duyuru} />
          ))}
        </section>
      ) : null}
    </main>
  );
}
