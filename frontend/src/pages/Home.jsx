import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MediaFrame from '../components/MediaFrame';
import { fetchHomeDashboard } from '../api/client';
import { BRAND_IMG } from '../constants';
import useSiteIcons from '../hooks/useSiteIcons';
import '../styles/home.css';

export default function Home() {
  const navigate = useNavigate(); // 2. Hook tanımlandı
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [haberIndex, setHaberIndex] = useState(0);
  const [railPage, setRailPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const RAIL_PAGE_SIZE = 4;
  const { icon } = useSiteIcons();

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

  useEffect(() => {
    setRailPage(Math.floor(haberIndex / RAIL_PAGE_SIZE));
  }, [haberIndex]);

  const haberler = data?.haberler ?? [];
  const duyurular = data?.duyurular ?? [];
  const dogumGunleri = data?.dogum_gunleri ?? [];
  const otomasyon = data?.otomasyon ?? [];
  const aktif = haberler[haberIndex];

  const handleHaberClick = (haber) => {
    if (!haber?.id) return;
    navigate(`/etkinlikler/${haber.id}`);
  };

  const handlePrev = () => {
    setHaberIndex((prev) => (prev === 0 ? haberler.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setHaberIndex((prev) => (prev === haberler.length - 1 ? 0 : prev + 1));
  };

  const railPageCount = Math.max(1, Math.ceil(haberler.length / RAIL_PAGE_SIZE));
  const railStart = railPage * RAIL_PAGE_SIZE;
  const railItems = haberler.slice(railStart, railStart + RAIL_PAGE_SIZE);

  const handleRailPrevPage = () => {
    setRailPage((prev) => {
      const next = Math.max(0, prev - 1);
      setHaberIndex(next * RAIL_PAGE_SIZE);
      return next;
    });
  };

  const handleRailNextPage = () => {
    setRailPage((prev) => {
      const next = Math.min(railPageCount - 1, prev + 1);
      setHaberIndex(next * RAIL_PAGE_SIZE);
      return next;
    });
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
                  {/* Büyük Haber Alanı — Tıklanınca Etkinlik Detayına Gider */}
                  <div 
                    className="relative flex-1 bg-slate-950 overflow-hidden cursor-pointer"
                    onClick={() => handleHaberClick(aktif)}
                  >
                    <MediaFrame
                      src={aktif.resim}
                      alt={aktif.baslik}
                      dark
                      className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                      eager
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                          Öne Çıkan
                        </span>
                        <span className="text-xs text-white/80 font-medium">{data.tarih_tr}</span>
                      </div>
                      <h2 className="max-w-4xl text-xl md:text-3xl font-bold leading-tight text-white drop-shadow hover:text-amber-300 transition-colors">
                        {aktif.baslik}
                      </h2>
                    </div>
                  </div>

                  {/* Önceki / Sonraki İlerleme Butonları (Tıklama Alanına Engel Olmaması İçin stopPropagation Eklenmiştir) */}
                  {haberler.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrev();
                        }}
                        aria-label="Önceki Haber"
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition border border-white/10 hover:bg-amber-500 hover:text-white"
                      >
                        <i className={icon('onceki')} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNext();
                        }}
                        aria-label="Sonraki Haber"
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition border border-white/10 hover:bg-amber-500 hover:text-white"
                      >
                        <i className={icon('sonraki')} aria-hidden="true" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <p className="m-auto p-8 text-slate-400">Haber bulunamadı.</p>
              )}
            </div>

            {/* Alt Thumbnail (Küçük Görsel) Çubuğu */}
            {haberler.length > 1 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-stretch gap-2.5">
                  {railPageCount > 1 && (
                    <button
                      type="button"
                      onClick={handleRailPrevPage}
                      disabled={railPage === 0}
                      aria-label="Önceki Sayfa"
                      className="shrink-0 flex h-auto w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 transition hover:border-amber-400 hover:text-amber-500 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <i className={icon('onceki')} aria-hidden="true" />
                    </button>
                  )}

                  <div className="flex flex-1 gap-2.5 min-w-0">
                    {railItems.map((h, i) => {
                      const realIndex = railStart + i;
                      const isCurrent = realIndex === haberIndex;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            if (isCurrent) {
                              // Zaten seçili habere tekrar tıklarsa direkt etkinliğe gitsin
                              handleHaberClick(h);
                            } else {
                              // Seçili değilse önce slider'da o haberi seçsin
                              setHaberIndex(realIndex);
                            }
                          }}
                          className={`group/thumb relative flex flex-1 min-w-0 items-center gap-3 overflow-hidden rounded-xl border p-2 pr-3 text-left transition-all duration-200 ${
                            isCurrent
                              ? 'border-amber-400 bg-white shadow-md ring-1 ring-amber-400/40'
                              : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                              isCurrent
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 text-slate-500 group-hover/thumb:bg-slate-200'
                            }`}
                          >
                            {realIndex + 1}
                          </span>
                          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                            <MediaFrame src={h.resim} alt="" className="absolute inset-0" />
                            {!isCurrent && <div className="absolute inset-0 bg-white/40" />}
                          </div>
                          <span
                            className={`line-clamp-2 text-xs font-semibold leading-snug ${
                              isCurrent ? 'text-slate-900' : 'text-slate-600'
                            }`}
                          >
                            {h.baslik}
                          </span>
                          {isCurrent && (
                            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {railPageCount > 1 && (
                    <button
                      type="button"
                      onClick={handleRailNextPage}
                      disabled={railPage === railPageCount - 1}
                      aria-label="Sonraki Sayfa"
                      className="shrink-0 flex h-auto w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 transition hover:border-amber-400 hover:text-amber-500 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <i className={icon('sonraki')} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {railPageCount > 1 && (
                  <div className="flex items-center justify-center gap-1.5">
                    {Array.from({ length: railPageCount }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          i === railPage ? 'w-5 bg-amber-500' : 'w-1.5 bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 2. DUYURU BANT KISMI */}
          <section
            id="duyurular-bandi"
            className="flex items-stretch rounded-2xl bg-[#0b3757] border-b-4 border-amber-500 shadow-md overflow-hidden text-white gap-4 select-none min-h-[132px]"
          >
            <div className="shrink-0 flex items-center gap-2.5 z-10 bg-[#022842] pl-5 pr-6">
              <i className={`${icon('duyuru_zili')} text-2xl text-amber-400`} aria-hidden="true" />
              <span className="font-black text-sm md:text-base tracking-wide uppercase">
                Duyurular
              </span>
            </div>

            <div
              className="flex-1 min-w-0 overflow-hidden relative flex items-center py-3 pr-4"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="flex items-start gap-3 whitespace-nowrap w-max animate-marquee"
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
              >
                {[...duyurular, ...duyurular].map((d, index) => (
                  <Link
                    key={`${d.id}-${index}`}
                    to={`/duyurular/${d.id}`}
                    aria-label={`${d.baslik || 'Duyuru'} detayını aç`}
                    className="flex flex-col shrink-0 w-44 gap-0.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-2 transition cursor-pointer text-left no-underline text-inherit"
                  >
                    <span className="whitespace-normal line-clamp-1 text-[11px] font-bold leading-snug text-white/95">
                      {d.baslik}
                    </span>
                    {(d.aciklama || d.icerik) && (
                      <span className="whitespace-normal line-clamp-2 text-[10px] font-medium leading-snug text-white/70">
                        {d.aciklama || d.icerik}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* 3. DOĞUM GÜNÜ ALANI (DİKEY DİKDÖRTGEN KART TASARIMI) */}
<section
  id="dogum-gunu"
  className="birthday-section relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50/70 via-white to-[#022842]/5 p-5 md:p-6 shadow-sm"
>
  {/* Arka Plan Süsleme Işımaları */}
  <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
  <div className="pointer-events-none absolute -left-8 -bottom-8 h-36 w-36 rounded-full bg-[#022842]/10 blur-2xl" />

  {/* Bölüm Başlığı */}
  <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-amber-100/80 pb-3.5">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-[#022842] text-white shadow-sm shadow-amber-200">
        <i className={`${icon('dogum_sayfa')} text-xl`} aria-hidden="true" />
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#022842]/10 px-3.5 py-1 text-xs font-bold text-[#022842] border border-[#022842]/15">
      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
      {data?.tarih_tr || 'Bugün'}
    </span>
  </div>

  {/* Dikey Dikdörtgen Kart Yapısı */}
  <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {dogumGunleri.length ? (
      dogumGunleri.map((p) => (
        <div
          key={p.id}
          className="group relative flex flex-col items-center justify-center rounded-2xl border border-[#022842]/10 bg-white/90 p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:bg-white hover:shadow-lg"
        >
          {/* Ortalanmış Profil Fotoğrafı ve Konfeti Rozeti */}
          <div className="relative mb-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-md ring-2 ring-[#022842]/20 transition-transform duration-300 group-hover:scale-105 group-hover:ring-amber-500">
              <img
                src={p.foto || BRAND_IMG}
                alt={p.ad_soyad}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
            <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs shadow-sm ring-2 ring-white">
              🎉
            </span>
          </div>

          {/* Altta İsim ve Mesaj */}
          <div className="flex flex-col items-center justify-center min-w-0 w-full">
            <h3 className="w-full truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-[#022842]">
              {p.ad_soyad}
            </h3>
            <span className="mt-1 inline-block text-xs font-semibold text-amber-600">
              Mutlu Yıllar!
            </span>
          </div>
        </div>
      ))
    ) : (
      <div className="col-span-full flex items-center justify-center gap-2 py-8 text-sm text-slate-500 bg-white/60 rounded-xl border border-[#022842]/10">
        <i className={`${icon('tarih')} text-[#022842]/60`} aria-hidden="true" />
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
        <i className={`${icon('otomasyon_sistem')} text-xl`} aria-hidden="true" />
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

  {/* Yenilenmiş Kart Yapısı — eski 5'li grid düzeni, sadece büyük logo, başlıksız */}
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {otomasyon.map((link) => (
      <a
        key={link.id}
        href={link.hedef_url}
        target="_blank"
        rel="noopener noreferrer"
        title={link.baslik}
        className="group relative flex aspect-square items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#022842]/30 hover:bg-white hover:shadow-lg"
      >
        {/* Sağ Üst Çapraz Ok İkonu */}
        <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 transition-all duration-300 group-hover:bg-[#022842] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <i className={`${icon('harici_baglanti')} text-sm`} aria-hidden="true" />
        </span>

        {/* Büyütülmüş Logo/Fotoğraf Alanı */}
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 shadow-xs border border-slate-100 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
          <img
            src={link.logo || BRAND_IMG}
            alt={link.baslik}
            className="h-full w-full object-contain"
          />
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