import { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { fetchHomeDashboard } from '../api/client';
import { BRAND_IMG } from '../constants';
import '../styles/home.css';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [haberIndex, setHaberIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const thumbRefs = useRef([]);
  const thumbRailRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    fetchHomeDashboard()
      .then((response) => {
        if (isMounted) {
          setData(response);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Veriler alınırken beklenmeyen bir hata oluştu.',
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const haberler = Array.isArray(data?.haberler) ? data.haberler : [];
  const duyurular = Array.isArray(data?.duyurular) ? data.duyurular : [];
  const dogumGunleri = Array.isArray(data?.dogum_gunleri)
    ? data.dogum_gunleri
    : [];
  const otomasyon = Array.isArray(data?.otomasyon) ? data.otomasyon : [];
  const aktif = haberler[haberIndex];

  // Haber listesi değiştiğinde seçili indeksin geçerli kalmasını sağlar.
  useEffect(() => {
    setHaberIndex((prev) => {
      if (haberler.length === 0) return 0;
      return Math.min(prev, haberler.length - 1);
    });
  }, [haberler.length]);

  // Haber slider otomatik geçişi.
  useEffect(() => {
    if (haberler.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setHaberIndex((prev) => (prev + 1) % haberler.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [haberler.length]);

  // Aktif haber değiştiğinde küçük görsel şeridini kaydırır.
  useEffect(() => {
    const rail = thumbRailRef.current;
    const activeThumb = thumbRefs.current[haberIndex];

    if (!rail || !activeThumb) return;

    const target =
      activeThumb.offsetLeft -
      rail.clientWidth / 2 +
      activeThumb.clientWidth / 2;

    rail.scrollTo({ left: target, behavior: 'smooth' });
  }, [haberIndex]);

  const handlePrev = () => {
    if (haberler.length === 0) return;

    setHaberIndex((prev) =>
      prev === 0 ? haberler.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    if (haberler.length === 0) return;

    setHaberIndex((prev) =>
      prev === haberler.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <Layout>
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Yükleniyor…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Veriler alınamadı: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {/* 1. HABER SLIDER */}
          <section id="haberler" className="flex flex-col gap-3">
            <div className="group relative flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-md md:min-h-[460px]">
              {aktif ? (
                <>
                  <div className="relative flex-1 overflow-hidden bg-slate-950">
                    <img
                      src={aktif.resim || BRAND_IMG}
                      alt={aktif.baslik || 'Haber görseli'}
                      className="absolute inset-0 h-full w-full object-contain object-center transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                          Öne Çıkan
                        </span>
                        <span className="text-xs font-medium text-white/80">
                          {data?.tarih_tr || 'Bugün'}
                        </span>
                      </div>
                      <h2 className="max-w-4xl text-xl font-bold leading-tight text-white drop-shadow md:text-3xl">
                        {aktif.baslik}
                      </h2>
                    </div>
                  </div>

                  {haberler.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Önceki haber"
                        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition hover:bg-amber-500"
                      >
                        <span className="material-symbols-outlined">
                          chevron_left
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Sonraki haber"
                        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition hover:bg-amber-500"
                      >
                        <span className="material-symbols-outlined">
                          chevron_right
                        </span>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <p className="m-auto p-8 text-slate-400">Haber bulunamadı.</p>
              )}
            </div>

            {haberler.length > 1 && (
              <div
                ref={thumbRailRef}
                className="scrollbar-thin flex gap-2.5 overflow-x-auto scroll-smooth pb-1"
              >
                {haberler.map((haber, index) => (
                  <button
                    key={haber.id ?? index}
                    ref={(element) => {
                      thumbRefs.current[index] = element;
                    }}
                    type="button"
                    onClick={() => setHaberIndex(index)}
                    aria-current={index === haberIndex ? 'true' : undefined}
                    className={`group/thumb relative flex min-w-[220px] max-w-[260px] shrink-0 items-center gap-3 overflow-hidden rounded-xl border p-2 pr-3 text-left transition-all duration-200 ${
                      index === haberIndex
                        ? 'border-amber-400 bg-white shadow-md ring-1 ring-amber-400/40'
                        : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                        index === haberIndex
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover/thumb:bg-slate-200'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                      <img
                        src={haber.resim || BRAND_IMG}
                        alt=""
                        className={`absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 ${
                          index === haberIndex
                            ? ''
                            : 'group-hover/thumb:scale-110'
                        }`}
                      />
                      {index !== haberIndex && (
                        <div className="absolute inset-0 bg-white/40" />
                      )}
                    </div>

                    <span
                      className={`line-clamp-2 text-xs font-semibold leading-snug ${
                        index === haberIndex
                          ? 'text-slate-900'
                          : 'text-slate-600'
                      }`}
                    >
                      {haber.baslik}
                    </span>

                    {index === haberIndex && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* 2. DUYURU BANT KISMI */}
          <section
            id="duyurular-bandi"
            className="flex min-h-[132px] select-none items-stretch gap-4 overflow-hidden rounded-2xl border-b-4 border-amber-500 bg-[#0b3757] text-white shadow-md"
          >
            <div className="z-10 flex shrink-0 items-center gap-2.5 bg-[#022842] pl-5 pr-6">
              <span className="material-symbols-outlined text-2xl text-amber-400">
                campaign
              </span>
              <span className="text-sm font-black uppercase tracking-wide md:text-base">
                Duyurular
              </span>
            </div>

            <div
              className="relative flex min-w-0 flex-1 items-center overflow-hidden py-3 pr-4"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {duyurular.length > 0 ? (
                <div
                  className="animate-marquee flex w-max items-start gap-3 whitespace-nowrap"
                  style={{
                    animationPlayState: isPaused ? 'paused' : 'running',
                  }}
                >
                  {[...duyurular, ...duyurular].map((duyuru, index) => (
                    <div
                      key={`${duyuru.id ?? 'duyuru'}-${index}`}
                      className="flex w-24 shrink-0 cursor-pointer flex-col rounded-xl border border-white/15 bg-white/10 p-1.5 transition hover:bg-white/20"
                    >
                      <div className="relative h-16 w-full shrink-0 overflow-hidden rounded-lg border border-white/20">
                        {duyuru.resim ? (
                          <img
                            src={duyuru.resim}
                            alt={duyuru.baslik || 'Duyuru görseli'}
                            className="absolute inset-0 h-full w-full object-cover object-top"
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center bg-white/10">
                            <span className="material-symbols-outlined text-base text-white/50">
                              campaign
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="mt-1.5 line-clamp-2 whitespace-normal text-[11px] font-semibold leading-snug text-white/95">
                        {duyuru.baslik}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/70">Duyuru bulunamadı.</p>
              )}
            </div>
          </section>

          {/* 3. DOĞUM GÜNÜ ALANI */}
          <section
            id="dogum-gunu"
            className="birthday-section relative overflow-hidden rounded-2xl border border-rose-200/60 bg-gradient-to-r from-rose-50/70 via-white to-amber-50/50 p-5 shadow-sm md:p-6"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-rose-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-amber-300/20 blur-2xl" />

            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-rose-100/80 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-200">
                  <span className="material-symbols-outlined text-xl">
                    cake
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-800 md:text-xl">
                    Bugün Doğum Günü Olanlar
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Çalışma arkadaşlarımızın yeni yaşını kutlarız!
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/50 bg-rose-100/80 px-3.5 py-1 text-xs font-bold text-rose-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                {data?.tarih_tr || 'Bugün'}
              </span>
            </div>

            <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {dogumGunleri.length > 0 ? (
                dogumGunleri.map((personel, index) => (
                  <div
                    key={personel.id ?? index}
                    className="group relative flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white/90 p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-300 hover:bg-white hover:shadow-lg"
                  >
                    <div className="relative mb-3">
                      <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-md ring-2 ring-rose-400/30 transition-transform duration-300 group-hover:scale-105 group-hover:ring-rose-500">
                        <img
                          src={personel.foto || BRAND_IMG}
                          alt={personel.ad_soyad || 'Personel fotoğrafı'}
                          className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs shadow-sm ring-2 ring-white">
                        🎉
                      </span>
                    </div>

                    <div className="flex w-full min-w-0 flex-col items-center justify-center">
                      <h3 className="w-full truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-rose-600">
                        {personel.ad_soyad}
                      </h3>
                      <span className="mt-1 inline-block text-xs font-semibold text-rose-500">
                        Mutlu Yıllar!
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center gap-2 rounded-xl border border-rose-100/60 bg-white/60 py-8 text-sm text-slate-500">
                  <span className="material-symbols-outlined text-rose-400">
                    event_busy
                  </span>
                  Bugün doğum günü olan personel bulunmamaktadır.
                </div>
              )}
            </div>
          </section>

          {/* 4. OTOMASYON SİSTEMLERİ ALANI */}
          <section
            id="otomasyon"
            className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm md:p-6"
          >
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#022842] text-amber-400 shadow-sm">
                  <span className="material-symbols-outlined text-xl">
                    grid_view
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#022842] md:text-xl">
                    Kurum İçi Otomasyon Sistemleri
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Hızlı erişim ve yönetim portalları
                  </p>
                </div>
              </div>

              <span className="rounded-lg border border-slate-200/60 bg-slate-100 px-3 py-1 text-xs font-bold text-[#022842]">
                {otomasyon.length} Uygulama
              </span>
            </div>

            {otomasyon.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {otomasyon.map((link, index) => (
                  <a
                    key={link.id ?? index}
                    href={link.hedef_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#022842]/30 hover:bg-white hover:shadow-lg"
                  >
                    <span className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-[#022842] group-hover:text-white">
                      <span className="material-symbols-outlined text-base">
                        north_east
                      </span>
                    </span>

                    <div className="my-2 flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
                      <img
                        src={link.logo || BRAND_IMG}
                        alt={link.baslik || 'Uygulama logosu'}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="mt-2 w-full">
                      <h3 className="line-clamp-2 text-sm font-bold text-slate-800 transition-colors group-hover:text-[#022842]">
                        {link.baslik}
                      </h3>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                Otomasyon uygulaması bulunamadı.
              </p>
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}