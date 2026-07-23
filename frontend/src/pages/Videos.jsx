import { useEffect, useMemo, useRef, useState } from 'react';

import Layout from '../components/Layout';
import { fetchVideos } from '../api/client';

const EMPTY_DATA = {
  videolar: [],
  kategoriler: [],
  vitrin: null,
};

const VIDEOS_PER_PAGE = 9;

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  if (rangeStart > 2) items.push('left-ellipsis');

  for (let page = rangeStart; page <= rangeEnd; page += 1) {
    items.push(page);
  }

  if (rangeEnd < totalPages - 1) items.push('right-ellipsis');

  items.push(totalPages);
  return items;
}

function parseVideoDuration(duration) {
  if (!duration) return Number.POSITIVE_INFINITY;

  const parts = String(duration)
    .trim()
    .split(':')
    .map((part) => Number(part));

  if (parts.some((part) => Number.isNaN(part))) {
    return Number.POSITIVE_INFINITY;
  }

  return parts.reduce((total, part) => total * 60 + part, 0);
}

function getVideoTimestamp(video) {
  const candidate =
    video?.created_at ??
    video?.updated_at ??
    video?.yayin_tarihi ??
    video?.tarih ??
    null;

  if (candidate) {
    const timestamp = new Date(candidate).getTime();
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  const numericId = Number(video?.id);
  return Number.isFinite(numericId) ? numericId : 0;
}

function getCategoryIcon(category) {
  const value = `${category?.slug ?? ''} ${category?.ad ?? ''}`.toLocaleLowerCase(
    'tr-TR',
  );

  if (value.includes('duyuru')) return 'campaign';
  if (value.includes('eğitim') || value.includes('egitim')) return 'school';
  if (value.includes('etkinlik')) return 'event';

  return 'smart_display';
}

function getAutoplayEmbedUrl(embedUrl) {
  if (!embedUrl) return '';

  const separator = embedUrl.includes('?') ? '&' : '?';

  return `${embedUrl}${separator}autoplay=1&mute=1&playsinline=1&rel=0`;
}


function getModalEmbedUrl(video) {
  if (!video) return '';

  if (video.embed_url) {
    const separator = video.embed_url.includes('?') ? '&' : '?';
    return `${video.embed_url}${separator}autoplay=1&playsinline=1&rel=0`;
  }

  if (!video.youtube_url) return '';

  try {
    const url = new URL(video.youtube_url);
    let videoId = '';

    if (url.hostname.includes('youtu.be')) {
      videoId = url.pathname.replace(/^\//, '').split('/')[0];
    } else if (url.pathname.startsWith('/shorts/')) {
      videoId = url.pathname.split('/shorts/')[1]?.split('/')[0] ?? '';
    } else if (url.pathname.startsWith('/embed/')) {
      videoId = url.pathname.split('/embed/')[1]?.split('/')[0] ?? '';
    } else {
      videoId = url.searchParams.get('v') ?? '';
    }

    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`
      : '';
  } catch {
    return '';
  }
}

function VideoCard({ video, onOpen }) {
  return (
    <article className="group relative z-0 h-full origin-center overflow-hidden rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white via-[#f2f7fb] to-[#dbeaf5] shadow-[0_6px_22px_rgba(2,40,66,0.07)] transition-all duration-300 ease-out hover:z-20 hover:-translate-y-2 hover:scale-[1.035] hover:border-[#022842]/25 hover:shadow-[0_24px_55px_rgba(2,40,66,0.22)] focus-within:z-20 focus-within:-translate-y-2 focus-within:scale-[1.035] focus-within:shadow-[0_24px_55px_rgba(2,40,66,0.22)]">
      <button
        type="button"
        onClick={() => onOpen(video)}
        className="flex h-full w-full flex-col text-left"
        aria-label={`${video.baslik} videosunu sayfada oynat`}
      >
        <div className="relative aspect-video overflow-hidden bg-[#dce6ed]">
          <img
            src={video.thumbnail}
            alt={video.baslik}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#011f34]/55 via-transparent to-black/5 opacity-80 transition duration-300 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-[#011f34]/0 transition-colors duration-300 group-hover:bg-[#011f34]/35 group-focus-within:bg-[#011f34]/35" />

          {video.kategori && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-[#022842]/85 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
              <span className="material-symbols-outlined text-[15px] text-[#f5a623]">
                {getCategoryIcon(video.kategori)}
              </span>
              <span>{video.kategori.ad}</span>
            </span>
          )}

          {video.sure && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/65 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
              <span className="material-symbols-outlined text-[14px]">
                schedule
              </span>
              {video.sure}
            </span>
          )}

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <svg
              viewBox="0 0 100 100"
              width="68"
              height="68"
              className="h-[68px] w-[68px] translate-x-0.5 scale-90 text-white/95 transition-transform duration-200 group-hover:scale-100 group-focus-within:scale-100 group-active:scale-95 sm:h-20 sm:w-20"
              style={{ filter: 'drop-shadow(0 6px 18px rgba(0, 0, 0, 0.95))' }}
              focusable="false"
            >
              <path d="M31 18L82 50L31 82Z" fill="currentColor" />
            </svg>
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h2 className="line-clamp-2 min-h-[3.25rem] text-lg font-extrabold leading-[1.45] tracking-tight text-[#0b1c30] transition group-hover:text-[#022842]">
            {video.baslik}
          </h2>

          {video.aciklama ? (
            <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#61717d]">
              {video.aciklama}
            </p>
          ) : (
            <p className="mt-2 min-h-12 text-sm leading-6 text-[#8a98a2]">
              Video açıklaması bulunmuyor.
            </p>
          )}

        </div>

        <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#f5a623] transition-transform duration-300 group-hover:scale-x-100" />
      </button>
    </article>
  );
}

export default function Videos() {
  const [data, setData] = useState(EMPTY_DATA);
  const [kategori, setKategori] = useState('');
  const [kategoriMenuAcik, setKategoriMenuAcik] = useState(false);
  const [arama, setArama] = useState('');
  const [siralama, setSiralama] = useState('yeni');
  const [sayfa, setSayfa] = useState(1);
  const [acikVideo, setAcikVideo] = useState(null);
  const kategoriMenuRef = useRef(null);
  const videoListesiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!kategoriMenuAcik) return undefined;

    function handleOutsidePointerDown(event) {
      if (
        kategoriMenuRef.current &&
        !kategoriMenuRef.current.contains(event.target)
      ) {
        setKategoriMenuAcik(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setKategoriMenuAcik(false);
      }
    }

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [kategoriMenuAcik]);

  useEffect(() => {
    if (!acikVideo) return undefined;

    const oncekiOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setAcikVideo(null);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = oncekiOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [acikVideo]);

  useEffect(() => {
    let cancelled = false;

    async function loadVideos() {
      setLoading(true);
      setError('');

      try {
        const result = await fetchVideos(kategori);

        if (!cancelled) {
          setData({
            videolar: result.videolar ?? [],
            kategoriler: result.kategoriler ?? [],
            vitrin: result.vitrin ?? null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Videolar yüklenemedi.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadVideos();

    return () => {
      cancelled = true;
    };
  }, [kategori]);

  const kartVideolari = useMemo(() => {
    if (kategori !== '' || !data.vitrin) {
      return data.videolar;
    }

    return data.videolar.filter((video) => video.id !== data.vitrin.id);
  }, [data.videolar, data.vitrin, kategori]);

  const filtrelenmisVideolar = useMemo(() => {
    const sorgu = arama.trim().toLocaleLowerCase('tr-TR');

    const sonuclar = sorgu
      ? kartVideolari.filter((video) => {
          const aranacakMetin = [
            video.baslik,
            video.aciklama,
            video.kategori?.ad,
          ]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase('tr-TR');

          return aranacakMetin.includes(sorgu);
        })
      : kartVideolari;

    return [...sonuclar].sort((a, b) => {
      if (siralama === 'eski') {
        return getVideoTimestamp(a) - getVideoTimestamp(b);
      }

      if (siralama === 'az') {
        return String(a.baslik ?? '').localeCompare(String(b.baslik ?? ''), 'tr-TR', {
          sensitivity: 'base',
        });
      }

      if (siralama === 'kisa') {
        return parseVideoDuration(a.sure) - parseVideoDuration(b.sure);
      }

      return getVideoTimestamp(b) - getVideoTimestamp(a);
    });
  }, [arama, kartVideolari, siralama]);

  const toplamSayfa = Math.max(
    1,
    Math.ceil(filtrelenmisVideolar.length / VIDEOS_PER_PAGE),
  );

  const sayfadakiVideolar = useMemo(() => {
    const baslangic = (sayfa - 1) * VIDEOS_PER_PAGE;
    return filtrelenmisVideolar.slice(baslangic, baslangic + VIDEOS_PER_PAGE);
  }, [filtrelenmisVideolar, sayfa]);

  const sayfaNumaralari = useMemo(
    () => getPaginationItems(sayfa, toplamSayfa),
    [sayfa, toplamSayfa],
  );

  useEffect(() => {
    setSayfa(1);
  }, [kategori, arama, siralama]);

  useEffect(() => {
    if (sayfa > toplamSayfa) {
      setSayfa(toplamSayfa);
    }
  }, [sayfa, toplamSayfa]);

  function videoyuAc(video) {
    setKategoriMenuAcik(false);
    setAcikVideo(video);
  }

  function sayfayaGit(yeniSayfa) {
    const hedefSayfa = Math.min(Math.max(yeniSayfa, 1), toplamSayfa);

    if (hedefSayfa === sayfa) return;

    setSayfa(hedefSayfa);

    window.requestAnimationFrame(() => {
      videoListesiRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  const aktifKategori =
    data.kategoriler.find((item) => item.slug === kategori) ?? null;

  const aktifKategoriAdi = aktifKategori?.ad || 'Tüm Videolar';

  return (
    <Layout videoPage>
      <div className="h-full w-full">
        {loading && (
          <div className="mx-auto w-full max-w-[1440px] rounded-2xl border border-outline-variant/20 bg-white p-8 text-on-surface-variant shadow-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-[#022842]">
                progress_activity
              </span>
              Videolar yükleniyor…
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto w-full max-w-[1440px] rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined">error</span>
              <div>
                <p className="font-semibold">Videolar yüklenemedi</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {kategori === '' && data.vitrin && (
              <section className="relative h-full min-h-full w-full overflow-hidden bg-black">
                <div className="pointer-events-none absolute left-4 top-4 z-20 md:left-6 md:top-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#022842]/70 px-3 py-1.5 text-white shadow-[0_6px_18px_rgba(0,0,0,0.22)] backdrop-blur-md">
                    <span className="material-symbols-outlined icon-filled text-[16px] text-[#f5a623]">
                      workspace_premium
                    </span>
                    <span className="text-[11px] font-semibold tracking-wide md:text-xs">
                      Haftanın Videosu
                    </span>
                  </div>
                </div>

                <div className="relative h-full w-full overflow-hidden">
                  <iframe
                    className="absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] min-h-full w-[max(100%,177.77777778vh)] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
                    src={getAutoplayEmbedUrl(data.vitrin.embed_url)}
                    title={data.vitrin.baslik}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            <div className="mx-auto w-full max-w-[1440px] px-4 pt-6 md:px-8 md:pt-8">
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
                {data.kategoriler.length > 0 && (
                  <nav
                    ref={kategoriMenuRef}
                    className="relative z-50 w-full lg:w-[190px] lg:shrink-0"
                    aria-label="Video kategorileri"
                  >
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={kategoriMenuAcik}
                      onClick={() => setKategoriMenuAcik((acik) => !acik)}
                      className="inline-flex h-[50px] w-full items-center justify-between gap-3 rounded-xl border border-[#022842] bg-[#022842] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(2,40,66,0.18)] transition hover:bg-[#0a3a5c]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[19px]">
                          {aktifKategori ? getCategoryIcon(aktifKategori) : 'grid_view'}
                        </span>
                        {kategori === '' ? 'Tümü' : aktifKategoriAdi}
                      </span>

                      <span
                        className={`material-symbols-outlined text-xl transition-transform duration-200 ${
                          kategoriMenuAcik ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    {kategoriMenuAcik && (
                      <div
                        role="menu"
                        className="absolute left-0 top-full mt-2 min-w-[230px] overflow-hidden rounded-xl border border-[#d5dde5] bg-white p-2 shadow-[0_14px_35px_rgba(2,40,66,0.18)]"
                      >
                        <button
                          type="button"
                          role="menuitemradio"
                          aria-checked={kategori === ''}
                          onClick={() => {
                            setKategori('');
                            setKategoriMenuAcik(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                            kategori === ''
                              ? 'bg-[#022842] text-white'
                              : 'text-[#33495a] hover:bg-[#eef5fa] hover:text-[#022842]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            grid_view
                          </span>
                          Tümü
                        </button>

                        {data.kategoriler.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            role="menuitemradio"
                            aria-checked={kategori === item.slug}
                            onClick={() => {
                              setKategori(item.slug);
                              setKategoriMenuAcik(false);
                            }}
                            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                              kategori === item.slug
                                ? 'bg-[#022842] text-white'
                                : 'text-[#33495a] hover:bg-[#eef5fa] hover:text-[#022842]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[19px]">
                              {getCategoryIcon(item)}
                            </span>
                            {item.ad}
                          </button>
                        ))}
                      </div>
                    )}
                  </nav>
                )}

                <div className="relative w-full lg:w-[190px] lg:shrink-0">
                  <label htmlFor="video-sort" className="sr-only">
                    Videoları sırala
                  </label>

                  <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-[#61717d]">
                    sort
                  </span>

                  <select
                    id="video-sort"
                    value={siralama}
                    onChange={(event) => setSiralama(event.target.value)}
                    className="h-[50px] w-full appearance-none rounded-xl border border-[#cfd9e2] bg-white pl-12 pr-11 text-sm font-semibold text-[#33495a] shadow-sm outline-none transition hover:border-[#022842]/35 focus:border-[#022842] focus:ring-4 focus:ring-[#022842]/10"
                  >
                    <option value="yeni">En Yeni</option>
                    <option value="eski">En Eski</option>
                    <option value="az">A–Z</option>
                    <option value="kisa">Süresi Kısa</option>
                  </select>

                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[21px] text-[#61717d]">
                    expand_more
                  </span>
                </div>


                <div className="relative w-full lg:max-w-[420px]">
                  <label htmlFor="video-search" className="sr-only">
                    Video ara
                  </label>

                  <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-[#61717d]">
                    search
                  </span>

                  <input
                    id="video-search"
                    type="text"
                    role="searchbox"
                    inputMode="search"
                    value={arama}
                    onChange={(event) => setArama(event.target.value)}
                    placeholder="Videolarda ara..."
                    autoComplete="off"
                    className="h-[50px] w-full rounded-xl border border-[#cfd9e2] bg-white pl-12 pr-11 text-sm text-[#0b1c30] shadow-sm outline-none transition placeholder:text-[#7a8994] hover:border-[#022842]/35 focus:border-[#022842] focus:ring-4 focus:ring-[#022842]/10"
                  />

                  {arama && (
                    <button
                      type="button"
                      onClick={() => setArama('')}
                      className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#61717d] transition hover:bg-[#eef5fa] hover:text-[#022842]"
                      aria-label="Aramayı temizle"
                    >
                      <span className="material-symbols-outlined text-[19px]">
                        close
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <section ref={videoListesiRef} className="scroll-mt-4 pb-10">
                <div className="mb-5 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-7 w-1 rounded-full bg-[#f5a623]"
                  />

                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h2 className="text-sm font-extrabold tracking-wide text-[#022842] md:text-base">
                      {kategori === '' ? 'Video Arşivi' : aktifKategoriAdi}
                    </h2>

                    <span className="inline-flex items-center rounded-full bg-[#e8f1f8] px-2.5 py-1 text-xs font-semibold text-[#536575]">
                      {filtrelenmisVideolar.length > 0
                        ? `${filtrelenmisVideolar.length} video`
                        : 'Video bulunamadı'}
                    </span>
                  </div>
                </div>

                {data.videolar.length === 0 ? (
                  <div className="rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white to-[#eef5fa] px-6 py-12 text-center shadow-[0_10px_28px_rgba(2,40,66,0.07)]">
                    <span className="material-symbols-outlined mb-4 text-5xl text-[#7a8994]">
                      video_library
                    </span>

                    <h3 className="text-lg font-extrabold text-[#0b1c30]">
                      Bu kategoride video bulunamadı
                    </h3>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#61717d]">
                      Bu kategoriye henüz video eklenmemiş olabilir. Diğer içerikleri görmek için tüm video arşivine dönebilirsiniz.
                    </p>

                    {kategori !== '' && (
                      <button
                        type="button"
                        onClick={() => {
                          setKategori('');
                          setArama('');
                        }}
                        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#022842] px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(2,40,66,0.18)] transition hover:bg-[#0a3a5c]"
                      >
                        <span className="material-symbols-outlined text-[19px]">
                          video_library
                        </span>
                        Tüm videoları göster
                      </button>
                    )}
                  </div>
                ) : filtrelenmisVideolar.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {sayfadakiVideolar.map((video) => (
                        <VideoCard key={video.id} video={video} onOpen={videoyuAc} />
                      ))}
                    </div>

                    {toplamSayfa > 1 && (
                      <nav
                        className="mx-auto mt-10 flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#022842]/10 bg-white/90 p-2.5 shadow-[0_10px_28px_rgba(2,40,66,0.09)] backdrop-blur sm:gap-3 sm:p-3"
                        aria-label="Video sayfaları"
                      >
                        <button
                          type="button"
                          onClick={() => sayfayaGit(sayfa - 1)}
                          disabled={sayfa === 1}
                          className="inline-flex h-14 items-center justify-center gap-1.5 rounded-xl border border-[#d5dde5] bg-white px-4 text-sm font-semibold text-[#33495a] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d5dde5] disabled:hover:bg-white sm:px-4"
                          aria-label="Önceki sayfa"
                        >
                          <span className="material-symbols-outlined text-xl">
                            chevron_left
                          </span>
                          <span className="hidden sm:inline">Önceki</span>
                        </button>

                        {sayfaNumaralari.map((item) =>
                          typeof item === 'number' ? (
                            <button
                              key={item}
                              type="button"
                              onClick={() => sayfayaGit(item)}
                              aria-current={sayfa === item ? 'page' : undefined}
                              className={`relative inline-flex h-14 min-w-14 items-center justify-center overflow-hidden rounded-xl border px-4 text-base font-extrabold transition ${
                                sayfa === item
                                  ? "border-[#022842] bg-[#022842] text-white shadow-[0_8px_22px_rgba(2,40,66,0.24)] after:absolute after:inset-x-2 after:bottom-0 after:h-1 after:rounded-t-full after:bg-[#f5a623] after:content-['']"
                                  : 'border-[#d5dde5] bg-white text-[#536575] shadow-sm hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842]'
                              }`}
                            >
                              {item}
                            </button>
                          ) : (
                            <span
                              key={item}
                              className="inline-flex h-14 min-w-8 items-center justify-center text-xl font-bold text-[#7a8994]"
                              aria-hidden="true"
                            >
                              …
                            </span>
                          ),
                        )}

                        <button
                          type="button"
                          onClick={() => sayfayaGit(sayfa + 1)}
                          disabled={sayfa === toplamSayfa}
                          className="inline-flex h-14 items-center justify-center gap-1.5 rounded-xl border border-[#d5dde5] bg-white px-4 text-sm font-semibold text-[#33495a] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d5dde5] disabled:hover:bg-white sm:px-4"
                          aria-label="Sonraki sayfa"
                        >
                          <span className="hidden sm:inline">Sonraki</span>
                          <span className="material-symbols-outlined text-xl">
                            chevron_right
                          </span>
                        </button>
                      </nav>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white to-[#eef5fa] px-6 py-12 text-center shadow-[0_10px_28px_rgba(2,40,66,0.07)]">
                    <span className="material-symbols-outlined mb-4 text-5xl text-[#7a8994]">
                      search_off
                    </span>

                    <h3 className="text-lg font-extrabold text-[#0b1c30]">
                      {arama.trim()
                        ? 'Aradığınız video bulunamadı'
                        : 'Başka video bulunamadı'}
                    </h3>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#61717d]">
                      {arama.trim()
                        ? `“${arama.trim()}” ifadesiyle eşleşen bir sonuç yok. Farklı bir kelime deneyin veya filtreleri temizleyin.`
                        : 'Bu kategoride öne çıkan video dışında başka video bulunmuyor. Tüm videolara dönerek diğer içeriklere göz atabilirsiniz.'}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      {arama.trim() && (
                        <button
                          type="button"
                          onClick={() => setArama('')}
                          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#022842]/15 bg-white px-4 text-sm font-semibold text-[#022842] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0]"
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            backspace
                          </span>
                          Aramayı temizle
                        </button>
                      )}

                      {kategori !== '' && (
                        <button
                          type="button"
                          onClick={() => {
                            setKategori('');
                            setArama('');
                          }}
                          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#022842] px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(2,40,66,0.18)] transition hover:bg-[#0a3a5c]"
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            video_library
                          </span>
                          Tüm videoları göster
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        {acikVideo && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${acikVideo.baslik} videosu`}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[6px] sm:p-8"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) {
                setAcikVideo(null);
              }
            }}
          >
            <div
              className="relative overflow-hidden rounded-xl bg-black shadow-[0_22px_65px_rgba(0,0,0,0.45)]"
              style={{ width: 'min(94vw, 72rem, 146dvh)' }}
            >
              <button
                type="button"
                onClick={() => setAcikVideo(null)}
                className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/65 text-white shadow-md backdrop-blur-sm transition hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-[#f5a623] focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Videoyu kapat"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>

              <div className="aspect-video w-full bg-black">
                <iframe
                  className="h-full w-full border-0"
                  src={getModalEmbedUrl(acikVideo)}
                  title={acikVideo.baslik}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
