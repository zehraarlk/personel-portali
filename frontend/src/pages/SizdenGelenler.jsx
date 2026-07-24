import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSizdenGelenler } from '../api/client';

const SAYFA_BASI = 6;

function getDeptIcon(kategori) {
  const value = `${kategori?.slug ?? ''} ${kategori?.ad ?? ''}`.toLocaleLowerCase('tr-TR');

  if (value.includes('insan') || value.includes('kaynak')) return 'groups';
  if (value.includes('fen')) return 'construction';
  if (value.includes('temizlik')) return 'cleaning_services';
  if (value.includes('veteriner')) return 'pets';
  if (value.includes('park') || value.includes('bahce') || value.includes('bahçe')) return 'park';
  if (value.includes('zabita') || value.includes('zabıta')) return 'shield';

  return 'apartment';
}

function vurgula(metin, sorgu) {
  const temizSorgu = sorgu.trim();
  if (!temizSorgu) return metin;

  const kacisli = temizSorgu.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parcalar = metin.split(new RegExp(`(${kacisli})`, 'gi'));

  return parcalar.map((parca, i) =>
    parca.toLocaleLowerCase('tr-TR') === temizSorgu.toLocaleLowerCase('tr-TR') ? (
      <span key={i} className="font-bold text-[#022842] bg-[#f5a623]/25 rounded px-0.5">
        {parca}
      </span>
    ) : (
      parca
    )
  );
}

function IcerikKarti({ item, arama, sayfa }) {
  return (
    <Link
      to={`/sizden-gelenler/detay/${item.id}?ref=${sayfa}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white via-[#f2f7fb] to-[#dbeaf5] shadow-[0_6px_22px_rgba(2,40,66,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#022842]/25 hover:shadow-[0_16px_36px_rgba(2,40,66,0.14)]"
    >
      <div className="relative h-52 overflow-hidden bg-[#dce6ed]">
        <img
          src={item.resim}
          alt={item.kategori}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#011f34]/55 via-transparent to-black/5 opacity-80 transition duration-300 group-hover:opacity-100" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/50 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
          <span className="material-symbols-outlined text-[14px]">visibility</span>
          {item.goruntulenme ?? 0}
        </span>

        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/50 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
          {item.tarih}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-2 min-h-[3.25rem] text-lg font-extrabold leading-[1.45] tracking-tight text-[#0b1c30] transition group-hover:text-[#022842]">
          {vurgula(item.kategori, arama)}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#61717d]">
          {item.ozet}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#022842]/10 pt-4">
          <span className="text-sm font-bold text-[#022842]">
            Detayları gör
          </span>
          <span className="material-symbols-outlined text-xl text-[#7a8994] transition duration-300 group-hover:translate-x-1 group-hover:text-[#022842]">
            arrow_forward
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function SizdenGelenler() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seciliKategori, setSeciliKategori] = useState(null);
  const [arama, setArama] = useState('');
  const [slide, setSlide] = useState(0);
  const listeRef = useRef(null);
  const ilkYuklemeRef = useRef(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const sayfa = Number(searchParams.get('sayfa') || 0);

  function sayfaAyarla(deger, kaydir = true) {
    setSearchParams(
      (prev) => {
        const yeniDeger = typeof deger === 'function' ? deger(sayfa) : deger;
        const next = new URLSearchParams(prev);
        if (yeniDeger === 0) {
          next.delete('sayfa');
        } else {
          next.set('sayfa', String(yeniDeger));
        }
        return next;
      },
      { replace: true }
    );
    if (kaydir) {
      listeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

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
  }, [vitrin.length, slide]);

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
    if (ilkYuklemeRef.current) {
      ilkYuklemeRef.current = false;
      return;
    }
    sayfaAyarla(0, false);
  }, [seciliKategori, arama]);

  const toplamSayfa = Math.max(1, Math.ceil(filtreliIcerikler.length / SAYFA_BASI));
  const gosterilenler = filtreliIcerikler.slice(
    sayfa * SAYFA_BASI,
    sayfa * SAYFA_BASI + SAYFA_BASI
  );

  function kategoriSecVeKaydir(slug) {
    setSeciliKategori(slug);
    setArama('');
    listeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const sayfaNumaralari = Array.from({ length: toplamSayfa }, (_, i) => i);

  return (
    <Layout>
      <div className="mx-auto w-full max-w-[1440px]">
        

        {loading && (
          <div className="rounded-2xl border border-[#022842]/10 bg-white p-8 text-[#536575] shadow-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-[#022842]">
                progress_activity
              </span>
              Yükleniyor…
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined">error</span>
              <div>
                <p className="font-semibold">Veriler alınamadı</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {vitrin.length > 0 && (
              <div className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-start">
                <div className="relative isolate overflow-hidden rounded-[28px] border border-[#022842]/10 bg-[#011f34] shadow-[0_18px_50px_rgba(2,40,66,0.12)] lg:col-span-8">
                  <div className="relative aspect-video">
                    {vitrin.map((item, i) => (
                      <Link
                        key={item.id}
                        to={`/sizden-gelenler/detay/${item.id}`}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                          i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      >
                        <img
                          src={item.resim}
                          alt={item.kategori}
                          className="h-full w-full scale-105 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#011f34]/85 via-[#011f34]/25 to-transparent" />
                        <div className="absolute left-4 bottom-4 right-4 sm:left-6 sm:bottom-6 sm:right-24">
                          <span className="mb-2 inline-block text-xs font-bold uppercase tracking-wide text-[#f5a623]">
                            {item.kategori}
                          </span>
                          <p className="line-clamp-2 max-w-xl text-sm leading-6 text-white/80">
                            {item.ozet}
                          </p>
                        </div>
                      </Link>
                    ))}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSlide((s) => (s - 1 + vitrin.length) % vitrin.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/35 hover:bg-white/80 shadow-md transition"
                      aria-label="Önceki"
                    >
                      <span className="material-symbols-outlined text-[16px] leading-none">
                        chevron_left
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSlide((s) => (s + 1) % vitrin.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/35 hover:bg-white/80 shadow-md transition"
                      aria-label="Sonraki"
                    >
                      <span className="material-symbols-outlined text-[16px] leading-none">
                        chevron_right
                      </span>
                    </button>

                    <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
                      {vitrin.map((item, i) => (
                        <button
                          key={item.id}
                          onClick={(e) => {
                            e.preventDefault();
                            setSlide(i);
                          }}
                          aria-label={`${i + 1}. görsele git`}
                          className={`h-2 rounded-full transition-all ${
                            i === slide ? 'w-6 bg-[#f5a623]' : 'w-2 bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative flex flex-col justify-center overflow-hidden rounded-[28px] border border-[#022842]/10 border-t-4 border-t-[#f5a623] bg-gradient-to-br from-white via-[#f2f7fb] to-[#dbeaf5] p-6 shadow-[0_18px_50px_rgba(2,40,66,0.12)] md:p-8 lg:col-span-4">
                  <h2 className="mb-4 text-xl font-extrabold leading-tight tracking-tight text-[#0b1c30]">
                    Müdürlüğe Göre Filtrele
                  </h2>

                  <div className="relative mb-4">
                    <button
                      type="button"
                      onClick={() => listeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#8a98a2] hover:text-[#022842] transition"
                      aria-label="Ara ve listeye git"
                    >
                      <span className="material-symbols-outlined text-[19px]">search</span>
                    </button>
                    <input
                      type="text"
                      value={arama}
                      onChange={(e) => setArama(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          listeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      placeholder="Başlık veya içerikte ara…"
                      className="w-full rounded-xl border border-[#022842]/10 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0b1c30] shadow-sm transition focus:border-[#022842]/40 focus:outline-none focus:ring-2 focus:ring-[#022842]/10"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => kategoriSecVeKaydir(null)}
                      className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition ${
                        seciliKategori === null
                          ? 'bg-[#022842] text-white shadow-[0_5px_14px_rgba(2,40,66,0.18)]'
                          : 'bg-white/70 text-[#33495a] hover:bg-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[19px]">grid_view</span>
                      Tümü
                    </button>

                    {kategoriler.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => kategoriSecVeKaydir(k.slug)}
                        className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition ${
                          seciliKategori === k.slug
                            ? 'bg-[#022842] text-white shadow-[0_5px_14px_rgba(2,40,66,0.18)]'
                            : 'bg-white/70 text-[#33495a] hover:bg-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[19px]">
                          {getDeptIcon(k)}
                        </span>
                        {k.ad}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={listeRef} className="mb-5 flex flex-wrap items-center justify-between gap-3 scroll-mt-6">
              <div>
                <h2 className="text-xl font-bold text-[#0b1c30] md:text-2xl">
                  {kategoriler.find((k) => k.slug === seciliKategori)?.ad || 'Tüm İçerikler'}
                </h2>
                <p className="mt-1 text-sm text-[#61717d]">
                  {filtreliIcerikler.length > 0
                    ? `${filtreliIcerikler.length} içerik listeleniyor`
                    : 'Bu kategoride içerik bulunmuyor'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {gosterilenler.map((item) => (
                <IcerikKarti key={item.id} item={item} arama={arama} sayfa={sayfa} />
              ))}

              {!gosterilenler.length && (
                <div className="col-span-full rounded-2xl border border-[#022842]/10 bg-white p-10 text-center shadow-sm">
                  <span className="material-symbols-outlined mb-3 text-5xl text-[#c3ccd3]">
                    search_off
                  </span>
                  <h3 className="text-lg font-semibold text-[#0b1c30]">İçerik bulunamadı</h3>
                  <p className="mt-2 text-sm text-[#61717d]">
                    Aramanla ya da seçtiğin müdürlükle eşleşen bir içerik yok.
                  </p>
                </div>
              )}
            </div>

            {toplamSayfa > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  onClick={() => sayfaAyarla((s) => Math.max(0, s - 1))}
                  disabled={sayfa === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#022842]/10 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#022842]/30 transition"
                  aria-label="Önceki sayfa"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">
                    chevron_left
                  </span>
                </button>

                {sayfaNumaralari.map((n) => (
                  <button
                    key={n}
                    onClick={() => sayfaAyarla(n)}
                    aria-label={`${n + 1}. sayfaya git`}
                    aria-current={sayfa === n ? 'page' : undefined}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition ${
                      sayfa === n
                        ? 'bg-[#022842] text-white shadow-sm'
                        : 'bg-white border border-[#022842]/10 text-[#33495a] hover:border-[#022842]/30'
                    }`}
                  >
                    {n + 1}
                  </button>
                ))}

                <button
                  onClick={() => sayfaAyarla((s) => Math.min(toplamSayfa - 1, s + 1))}
                  disabled={sayfa >= toplamSayfa - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#022842]/10 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#022842]/30 transition"
                  aria-label="Sonraki sayfa"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">
                    chevron_right
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}