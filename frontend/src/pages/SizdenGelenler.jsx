import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { fetchSizdenGelenler } from '../api/client';

const SAYFA_BASI = 6;

function vurgula(metin, sorgu) {
  const temizSorgu = sorgu.trim();
  if (!temizSorgu) return metin;

  const kacisli = temizSorgu.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parcalar = metin.split(new RegExp(`(${kacisli})`, 'gi'));

  return parcalar.map((parca, i) =>
    parca.toLocaleLowerCase('tr-TR') === temizSorgu.toLocaleLowerCase('tr-TR') ? (
      <span key={i} className="font-bold text-on-surface bg-primary/15 rounded px-0.5">
        {parca}
      </span>
    ) : (
      parca
    )
  );
}

export default function SizdenGelenler() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seciliKategori, setSeciliKategori] = useState(null);
  const [arama, setArama] = useState('');
  const [slide, setSlide] = useState(0);
  const [acikKart, setAcikKart] = useState(null);
  const [sayfa, setSayfa] = useState(0);

  useEffect(() => {
    fetchSizdenGelenler()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const kategoriler = data?.kategoriler ?? [];
  const icerikler = data?.icerikler ?? [];

  const vitrin = useMemo(
    () => [...icerikler].sort((a, b) => b.goruntulenme - a.goruntulenme).slice(0, 5),
    [icerikler]
  );

  useEffect(() => {
    if (vitrin.length < 2) return;
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % vitrin.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [vitrin.length]);

  const filtreliIcerikler = useMemo(() => {
    let sonuc = seciliKategori
      ? icerikler.filter((i) => i.kategori_slug === seciliKategori)
      : icerikler;

    if (arama.trim()) {
      const q = arama.trim().toLocaleLowerCase('tr-TR');
      sonuc = sonuc.filter(
        (i) =>
          i.baslik.toLocaleLowerCase('tr-TR').includes(q) ||
          i.ozet.toLocaleLowerCase('tr-TR').includes(q) ||
          i.kategori.toLocaleLowerCase('tr-TR').includes(q)
      );
    }

    return sonuc;
  }, [icerikler, seciliKategori, arama]);

  useEffect(() => {
    setSayfa(0);
  }, [seciliKategori, arama]);

  const toplamSayfa = Math.max(1, Math.ceil(filtreliIcerikler.length / SAYFA_BASI));
  const gosterilenler = filtreliIcerikler.slice(
    sayfa * SAYFA_BASI,
    sayfa * SAYFA_BASI + SAYFA_BASI
  );

  return (
    <Layout>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-on-surface">
          Sizden Gelenler
        </h1>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white border border-outline-variant/20 p-8 text-on-surface-variant shadow-sm animate-pulse">
          Yükleniyor…
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-error-container text-on-error-container p-6">
          Veriler alınamadı: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-8">
          {/* Öne çıkanlar - kayan ekran */}
          {vitrin.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl shadow-lg h-[420px] sm:h-[480px] md:h-[560px] group">
              {vitrin.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => setAcikKart(item)}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${
                    i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={item.resim}
                    alt={item.baslik}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                    <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white mb-2">
                      {item.kategori}
                    </span>
                    <h2 className="text-white text-xl sm:text-3xl font-bold drop-shadow-sm max-w-2xl">
                      {item.baslik}
                    </h2>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setSlide((s) => (s - 1 + vitrin.length) % vitrin.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/80 hover:bg-white p-2 shadow-md opacity-0 group-hover:opacity-100 transition"
                aria-label="Önceki"
              >
                ‹
              </button>
              <button
                onClick={() => setSlide((s) => (s + 1) % vitrin.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/80 hover:bg-white p-2 shadow-md opacity-0 group-hover:opacity-100 transition"
                aria-label="Sonraki"
              >
                ›
              </button>

              <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
                {vitrin.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setSlide(i)}
                    aria-label={`${i + 1}. görsele git`}
                    className={`h-2 rounded-full transition-all ${
                      i === slide ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Arama */}
          <div className="relative max-w-md w-full mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              🔍
            </span>
            <input
              type="text"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Başlık veya içerikte ara…"
              className="w-full rounded-full border border-outline-variant/30 bg-white pl-11 pr-4 py-2.5 text-sm text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          {/* Kategori filtre butonları */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSeciliKategori(null)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                seciliKategori === null
                  ? 'bg-primary text-white shadow-sm'
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
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-outline-variant/30 text-on-surface-variant hover:border-primary/40'
                }`}
              >
                {k.ad}
              </button>
            ))}
          </div>

          {/* Kart grid'i - dikey kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gosterilenler.map((item) => (
              <button
                key={item.id}
                onClick={() => setAcikKart(item)}
                className="group flex flex-col text-left rounded-2xl bg-white border border-outline-variant/15 shadow-[0_4px_20px_rgba(30,58,138,0.05)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(30,58,138,0.14)] cursor-pointer"
              >
                <div className="w-full h-70 shrink-0 bg-surface-container overflow-hidden">
                  <img
                    src={item.resim}
                    alt={item.baslik}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col p-4">
                  <span className="text-xs font-semibold text-primary">
                    {vurgula(item.kategori, arama)}
                  </span>
                  <h2 className="mt-1 text-base font-semibold text-on-surface transition-colors group-hover:text-primary line-clamp-2">
                    {vurgula(item.baslik, arama)}
                  </h2>
                  <p className="mt-1 text-xs text-on-surface-variant">{item.tarih}</p>
                </div>
              </button>
            ))}

            {!gosterilenler.length && (
              <p className="text-on-surface-variant col-span-full">
                Aramanla eşleşen içerik bulunamadı.
              </p>
            )}
          </div>

          {/* Sayfalama okları */}
          {filtreliIcerikler.length > SAYFA_BASI && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setSayfa((s) => Math.max(0, s - 1))}
                disabled={sayfa === 0}
                className="rounded-full bg-white border border-outline-variant/30 p-2.5 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/40 transition"
                aria-label="Önceki sayfa"
              >
                ‹
              </button>
              <span className="text-sm text-on-surface-variant">
                Sayfa {sayfa + 1} / {toplamSayfa}
              </span>
              <button
                onClick={() => setSayfa((s) => Math.min(toplamSayfa - 1, s + 1))}
                disabled={sayfa >= toplamSayfa - 1}
                className="rounded-full bg-white border border-outline-variant/30 p-2.5 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/40 transition"
                aria-label="Sonraki sayfa"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detay modalı */}
      {acikKart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setAcikKart(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAcikKart(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-white/90 hover:bg-white p-2 shadow-md text-on-surface"
              aria-label="Kapat"
            >
              ✕
            </button>
            <img
              src={acikKart.resim}
              alt={acikKart.baslik}
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="p-5 sm:p-8">
              <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-3">
                {acikKart.kategori}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface">{acikKart.baslik}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">{acikKart.tarih}</p>
              <p className="mt-4 text-base leading-7 text-on-surface-variant">{acikKart.ozet}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}