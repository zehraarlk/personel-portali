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
    fetchHomeDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const list = data?.haberler ?? [];
    if (list.length < 2) return undefined;
    const id = setInterval(() => {
      setHaberIndex((prev) => (prev + 1) % list.length);
    }, 5000);
    return () => clearInterval(id);
  }, [data?.haberler]);

  useEffect(() => {
    const rail = thumbRailRef.current;
    const active = thumbRefs.current[haberIndex];
    if (!rail || !active) return;
    const target =
      active.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2;
    rail.scrollTo({ left: target, behavior: 'smooth' });
  }, [haberIndex]);

  const haberler = data?.haberler ?? [];
  const duyurular = data?.duyurular ?? [];
  const dogumGunleri = data?.dogum_gunleri ?? [];
  const otomasyon = data?.otomasyon ?? [];
  const aktif = haberler[haberIndex];

  const handlePrev = () => {
    setHaberIndex((prev) => (prev === 0 ? haberler.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setHaberIndex((prev) => (prev === haberler.length - 1 ? 0 : prev + 1));
  };

  return (
    <Layout>
      <div className="home-page">
        {loading && <div className="home-state">Yükleniyor…</div>}

        {error && (
          <div className="home-state home-state--error">
            Veriler alınamadı: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="home-stack">
            {/* Haber slider */}
            <section id="haberler" className="home-haber">
              <div className="home-haber__frame">
                {aktif ? (
                  <>
                    <img
                      key={aktif.id}
                      src={aktif.resim}
                      alt={aktif.baslik}
                      className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                          Öne Çıkan
                        </span>
                        <span className="text-xs text-white/80 font-medium">{data.tarih_tr}</span>
                      </div>
                      <h2>{aktif.baslik}</h2>
                    </div>

                    {haberler.length > 1 && (
                      <div className="home-haber__controls">
                        <button
                          type="button"
                          onClick={handlePrev}
                          aria-label="Önceki Haber"
                          className="home-haber__btn"
                        >
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          aria-label="Sonraki Haber"
                          className="home-haber__btn"
                        >
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="home-haber__empty">Haber bulunamadı.</p>
                )}
              </div>

            {haberler.length > 1 && (
              <div ref={thumbRailRef} className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scroll-smooth">
                {haberler.map((h, i) => (
                  <button
                    key={h.id}
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => setHaberIndex(i)}
                    className={`group/thumb relative flex items-center gap-3 shrink-0 min-w-[220px] max-w-[260px] overflow-hidden rounded-xl border p-2 pr-3 text-left transition-all duration-200 ${
                      i === haberIndex
                        ? 'border-amber-400 bg-white shadow-md ring-1 ring-amber-400/40'
                        : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                        i === haberIndex
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover/thumb:bg-slate-200'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={h.resim}
                        alt=""
                        className={`h-full w-full object-cover transition-transform duration-300 ${
                          i === haberIndex ? '' : 'group-hover/thumb:scale-110'
                        }`}
                      />
                      {i !== haberIndex && <div className="absolute inset-0 bg-white/40" />}
                    </div>
                    <span
                      className={`line-clamp-2 text-xs font-semibold leading-snug ${
                        i === haberIndex ? 'text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      {h.baslik}
                    </span>
                    {i === haberIndex && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

            {/* Duyurular bandı */}
            <section id="duyurular-bandi" className="home-duyuru">
              <div className="home-duyuru__label">
                <span className="material-symbols-outlined">campaign</span>
                <span>Duyurular</span>
              </div>

            <div
              className="flex-1 overflow-hidden relative flex items-center py-3 pr-4"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="flex items-stretch gap-4 whitespace-nowrap w-max animate-marquee"
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
              >
                {duyurular.length ? duyurular.map((d, index) => (
                  <div
                    key={`${d.id}-${index}`}
                    className="flex flex-col shrink-0 w-28 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 p-2 transition cursor-pointer"
                  >
                    {d.resim ? (
                      <img
                        src={d.resim}
                        alt=""
                        className="h-20 w-full rounded-lg object-cover shrink-0 border border-white/20"
                      />
                    ) : (
                      <div className="h-20 w-full rounded-lg bg-white/10 border border-white/15 grid place-items-center">
                        <span className="material-symbols-outlined text-white/50">campaign</span>
                      </div>
                    )}
                    <span className="mt-2 whitespace-normal line-clamp-2 text-[11px] font-semibold leading-snug text-white/95">
                      {d.baslik}
                    </span>
                  </div>
                )) : (
                  <p className="home-duyuru__empty">Şu an gösterilecek duyuru yok.</p>
                )}
              </div>
            </div>
            </section>

            {/* Doğum günü */}
            <section id="dogum-gunu" className="home-birthday">
              <div className="home-section-head">
                <div className="home-section-head__left">
                  <div className="home-section-head__icon home-section-head__icon--rose">
                    <span className="material-symbols-outlined">cake</span>
                  </div>
                  <div>
                    <h2>Bugün Doğum Günü Olanlar</h2>
                    <p>Çalışma arkadaşlarımızın yeni yaşını kutlarız!</p>
                  </div>
                </div>
                <span className="home-birthday__date">
                  <span className="home-birthday__dot" />
                  {data?.tarih_tr || 'Bugün'}
                </span>
              </div>

  {/* Dikey Dikdörtgen Kart Yapısı */}
  <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {dogumGunleri.length ? (
      dogumGunleri.map((p) => (
        <div
          key={p.id}
          className="group relative flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white/90 p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-300 hover:bg-white hover:shadow-lg"
        >
          {/* Ortalanmış Profil Fotoğrafı ve Konfeti Rozeti */}
          <div className="relative mb-3">
            <img
              src={p.foto || BRAND_IMG}
              alt={p.ad_soyad}
              className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-rose-400/30 transition-transform duration-300 group-hover:scale-105 group-hover:ring-rose-500"
            />
            <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs shadow-sm ring-2 ring-white">
              🎉
            </span>
          </div>

          {/* Altta İsim ve Mesaj */}
          <div className="flex flex-col items-center justify-center min-w-0 w-full">
            <h3 className="w-full truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-rose-600">
              {p.ad_soyad}
            </h3>
            <span className="mt-1 inline-block text-xs font-semibold text-rose-500">
              Mutlu Yıllar!
            </span>
          </div>
        </div>
      ))
    ) : (
      <div className="col-span-full flex items-center justify-center gap-2 py-8 text-sm text-slate-500 bg-white/60 rounded-xl border border-rose-100/60">
        <span className="material-symbols-outlined text-rose-400">event_busy</span>
        Bugün doğum günü olan personel bulunmamaktadır.
      </div>
    )}
  </div>
</section>

            {/* Otomasyon */}
            <section id="otomasyon" className="home-otomasyon">
              <div className="home-section-head">
                <div className="home-section-head__left">
                  <div className="home-section-head__icon home-section-head__icon--navy">
                    <span className="material-symbols-outlined">grid_view</span>
                  </div>
                  <div>
                    <h2>Kurum İçi Otomasyon Sistemleri</h2>
                    <p>Hızlı erişim ve yönetim portalları</p>
                  </div>
                </div>
                <span className="home-otomasyon__count">{otomasyon.length} Uygulama</span>
              </div>

              <div className="home-otomasyon__grid">
                {otomasyon.map((link) => (
                  <a
                    key={link.id}
                    href={link.hedef_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-system"
                  >
                    <span className="home-system__go" aria-hidden="true">
                      <span className="material-symbols-outlined">north_east</span>
                    </span>
                    <div className="home-system__logo">
                      <img
                        src={link.logo || BRAND_IMG}
                        alt=""
                        className="home-media-contain"
                      />
                    </div>
                    <h3>{link.baslik}</h3>
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
