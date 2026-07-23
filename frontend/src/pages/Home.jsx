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

  // Haber Slider Otomatik Geçiş
  useEffect(() => {
    const list = data?.haberler ?? [];
    if (list.length < 2) return undefined;
    const id = setInterval(() => {
      setHaberIndex((prev) => (prev + 1) % list.length);
    }, 5000);
    return () => clearInterval(id);
  }, [data?.haberler]);

  // Aktif haber değiştiğinde küçük görsel şeridini kaydır
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
      {loading && (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-slate-500 text-center shadow-sm">
          Yükleniyor…
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 text-red-700 p-6 border border-red-200">
          Veriler alınamadı: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          
          {/* 1. HABER SLIDER */}
          <section id="haberler" className="flex flex-col gap-3">
            <div className="relative flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-md overflow-hidden min-h-[380px] md:min-h-[460px] group">
              {aktif ? (
                <>
                  <div className="relative flex-1 bg-slate-950 overflow-hidden">
                    <img
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
                      <h2 className="max-w-4xl text-xl md:text-3xl font-bold leading-tight text-white drop-shadow">
                        {aktif.baslik}
                      </h2>
                    </div>
                  </div>

                  {haberler.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Önceki Haber"
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition border border-white/10 hover:bg-amber-500 hover:text-white"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Sonraki Haber"
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition border border-white/10 hover:bg-amber-500 hover:text-white"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <p className="m-auto p-8 text-slate-400">Haber bulunamadı.</p>
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

          {/* 2. DUYURU BANT KISMI */}
          <section
            id="duyurular-bandi"
            className="flex items-stretch rounded-2xl bg-[#0b3757] border-b-4 border-amber-500 shadow-md overflow-hidden text-white gap-4 select-none min-h-[132px]"
          >
            <div className="shrink-0 flex items-center gap-2.5 z-10 bg-[#022842] pl-5 pr-6">
              <span className="material-symbols-outlined text-2xl text-amber-400">campaign</span>
              <span className="font-black text-sm md:text-base tracking-wide uppercase">
                Duyurular
              </span>
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
                {[...duyurular, ...duyurular].map((d, index) => (
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
                ))}
              </div>
            </div>
          </section>

          {/* 3. DOĞUM GÜNÜ ALANI (DİKEY DİKDÖRTGEN KART TASARIMI) */}
<section
  id="dogum-gunu"
  className="birthday-section relative overflow-hidden rounded-2xl border border-rose-200/60 bg-gradient-to-r from-rose-50/70 via-white to-amber-50/50 p-5 md:p-6 shadow-sm"
>
  {/* Arka Plan Süsleme Işımaları */}
  <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-rose-300/20 blur-3xl" />
  <div className="pointer-events-none absolute -left-8 -bottom-8 h-36 w-36 rounded-full bg-amber-300/20 blur-2xl" />

  {/* Bölüm Başlığı */}
  <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-rose-100/80 pb-3.5">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-200">
        <span className="material-symbols-outlined text-xl">cake</span>
      </div>
      <div>
        <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
          Bugün Doğum Günü Olanlar
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Çalışma arkadaşlarımızın yeni yaşını kutlarız!
        </p>
      </div>
    </div>
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 px-3.5 py-1 text-xs font-bold text-rose-700 border border-rose-200/50">
      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
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

         {/* 4. YENİLENMİŞ OTOMASYON SİSTEMLERİ ALANI (BÜYÜK LOGOLU MINIMAL KARTLAR) */}
<section
  id="otomasyon"
  className="flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-sm p-5 md:p-6"
>
  {/* Başlık Alanı */}
  <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#022842] text-amber-400 shadow-sm">
        <span className="material-symbols-outlined text-xl">grid_view</span>
      </div>
      <div>
        <h2 className="text-lg md:text-xl font-bold text-[#022842]">
          Kurum İçi Otomasyon Sistemleri
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Hızlı erişim ve yönetim portalları
        </p>
      </div>
    </div>
    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-[#022842] border border-slate-200/60">
      {otomasyon.length} Uygulama
    </span>
  </div>

  {/* Yenilenmiş Kart Yapısı */}
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {otomasyon.map((link) => (
      <a
        key={link.id}
        href={link.hedef_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#022842]/30 hover:bg-white hover:shadow-lg"
      >
        {/* Sağ Üst Çapraz Ok İkonu */}
        <span className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 transition-all duration-300 group-hover:bg-[#022842] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <span className="material-symbols-outlined text-base">north_east</span>
        </span>

        {/* Büyütülmüş Logo/Fotoğraf Alanı */}
        <div className="my-2 flex h-30 w-30 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-xs border border-slate-100 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
          <img
            src={link.logo || BRAND_IMG}
            alt={link.baslik}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Alttaki Başlık */}
        <div className="mt-2 w-full">
          <h3 className="line-clamp-2 text-sm font-bold text-slate-800 transition-colors group-hover:text-[#022842]">
            {link.baslik}
          </h3>
        </div>
      </a>
    ))}
  </div>
</section>

        </div>
      )}
    </Layout>
  );
}