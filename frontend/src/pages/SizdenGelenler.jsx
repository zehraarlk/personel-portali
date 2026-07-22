import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchSizdenGelenler } from '../api/client';

export default function SizdenGelenler() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seciliKategori, setSeciliKategori] = useState(null);

  useEffect(() => {
    fetchSizdenGelenler()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const kategoriler = data?.kategoriler ?? [];
  const icerikler = data?.icerikler ?? [];

  const filtreliIcerikler = seciliKategori
    ? icerikler.filter((i) => i.kategori_slug === seciliKategori)
    : icerikler;

  return (
    <Layout>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-on-surface">
          Sizden Gelenler
        </h1>
        <p className="mt-1 text-base text-on-surface-variant">
          Müdürlüklerimizden haberler ve paylaşımlar.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white border border-outline-variant/20 p-8 text-on-surface-variant shadow-sm">
          Yükleniyor…
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-error-container text-on-error-container p-6">
          Veriler alınamadı: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {/* Kategori filtre butonları */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSeciliKategori(null)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                seciliKategori === null
                  ? 'bg-primary text-white'
                  : 'bg-white border border-outline-variant/30 text-on-surface-variant hover:border-primary/40'
              }`}
            >
              Tümü
            </button>
            {kategoriler.map((k) => (
              <button
                key={k.id}
                onClick={() => setSeciliKategori(k.slug)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  seciliKategori === k.slug
                    ? 'bg-primary text-white'
                    : 'bg-white border border-outline-variant/30 text-on-surface-variant hover:border-primary/40'
                }`}
              >
                {k.ad}
              </button>
            ))}
          </div>

          {/* Kart listesi */}
          <div className="flex flex-col gap-4">
            {filtreliIcerikler.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 rounded-2xl bg-white border border-outline-variant/15 shadow-[0_4px_20px_rgba(30,58,138,0.05)] overflow-hidden"
              >
                <div className="sm:w-64 h-48 sm:h-auto shrink-0 bg-surface-container">
                  <img
                    src={item.resim}
                    alt={item.baslik}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-4 sm:p-5">
                  <h2 className="text-lg font-semibold text-on-surface">{item.baslik}</h2>
                  <p className="mt-1 text-xs text-on-surface-variant">{item.tarih}</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant line-clamp-3">
                    {item.ozet}
                  </p>
                </div>
              </div>
            ))}

            {!filtreliIcerikler.length && (
              <p className="text-on-surface-variant">Bu kategoride içerik bulunamadı.</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}