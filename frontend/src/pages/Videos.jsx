import { useEffect, useMemo, useState } from 'react';

import Layout from '../components/Layout';
import { fetchVideos } from '../api/client';

const EMPTY_DATA = {
  videolar: [],
  kategoriler: [],
  vitrin: null,
};

function getCategoryIcon(category) {
  const value = `${category?.slug ?? ''} ${category?.ad ?? ''}`.toLocaleLowerCase(
    'tr-TR',
  );

  if (value.includes('duyuru')) return 'campaign';
  if (value.includes('eğitim') || value.includes('egitim')) return 'school';
  if (value.includes('etkinlik')) return 'event';

  return 'smart_display';
}

function VideoCard({ video }) {
  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white via-[#f2f7fb] to-[#dbeaf5] shadow-[0_6px_22px_rgba(2,40,66,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#022842]/25 hover:shadow-[0_16px_36px_rgba(2,40,66,0.14)]">
      <a
        href={video.youtube_url}
        target="_blank"
        rel="noreferrer"
        className="flex h-full flex-col"
        aria-label={`${video.baslik} videosunu YouTube'da aç`}
      >
        <div className="relative aspect-video overflow-hidden bg-[#dce6ed]">
          <img
            src={video.thumbnail}
            alt={video.baslik}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#011f34]/55 via-transparent to-black/5 opacity-80 transition duration-300 group-hover:opacity-100" />

          {video.kategori && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-[#022842]/85 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
              <span className="material-symbols-outlined text-[15px] text-[#f5a623]">
                {getCategoryIcon(video.kategori)}
              </span>
              {video.kategori.ad}
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

          <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/75 bg-[#022842] text-white shadow-[0_10px_25px_rgba(0,0,0,0.28)] transition-all duration-300 group-hover:scale-110 group-hover:border-[#f5a623]">
            <span className="material-symbols-outlined icon-filled translate-x-px text-3xl">
              play_arrow
            </span>
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

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#022842]/10 pt-4">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[#022842]">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f1f8] text-[#022842] transition group-hover:bg-[#f5a623]">
                <span className="material-symbols-outlined icon-filled text-lg">
                  play_arrow
                </span>
              </span>
              Videoyu izle
            </span>

            <span className="material-symbols-outlined text-xl text-[#7a8994] transition duration-300 group-hover:translate-x-1 group-hover:text-[#022842]">
              arrow_forward
            </span>
          </div>
        </div>

        <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#f5a623] transition-transform duration-300 group-hover:scale-x-100" />
      </a>
    </article>
  );
}

export default function Videos() {
  const [data, setData] = useState(EMPTY_DATA);
  const [kategori, setKategori] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const aktifKategoriAdi =
    data.kategoriler.find((item) => item.slug === kategori)?.ad || 'Tüm Videolar';

  return (
    <Layout>
      <div className="mx-auto w-full max-w-[1440px]">
        <section className="mb-5 rounded-2xl border border-[#022842]/10 bg-white px-5 py-4 shadow-[0_6px_22px_rgba(2,40,66,0.06)] md:px-6 md:py-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="mb-2 h-1 w-9 rounded-full bg-[#f5a623]" />

              <h1 className="text-2xl font-extrabold tracking-tight text-[#0b1c30] md:text-3xl">
                Videolar
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#536575]">
                Kurumumuza ait duyuru, eğitim ve etkinlik videolarını buradan
                izleyebilirsiniz.
              </p>
            </div>

            {!loading && !error && (
              <div className="flex w-fit shrink-0 items-center gap-2.5 rounded-xl border border-[#022842]/10 bg-[#f8fbfd] px-3 py-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#022842] text-[#f5a623]">
                  <span className="material-symbols-outlined icon-filled text-xl">
                    smart_display
                  </span>
                </span>

                <div>
                  <p className="text-lg font-extrabold leading-none text-[#022842]">
                    {data.videolar.length}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-[#6b7b87]">
                    {kategori === '' ? 'Toplam Video' : 'Listelenen Video'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {data.kategoriler.length > 0 && (
          <nav
            className="mb-8 flex gap-3 overflow-x-auto pb-2"
            aria-label="Video kategorileri"
          >
            <button
              type="button"
              aria-pressed={kategori === ''}
              onClick={() => setKategori('')}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                kategori === ''
                  ? 'border-[#022842] bg-[#022842] text-white shadow-[0_5px_14px_rgba(2,40,66,0.18)]'
                  : 'border-[#d5dde5] bg-white text-[#33495a] shadow-sm hover:border-[#022842]/35 hover:bg-[#f8fbfd] hover:text-[#022842] hover:shadow-md'
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
                aria-pressed={kategori === item.slug}
                onClick={() => setKategori(item.slug)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  kategori === item.slug
                    ? 'border-[#022842] bg-[#022842] text-white shadow-[0_5px_14px_rgba(2,40,66,0.18)]'
                    : 'border-[#d5dde5] bg-white text-[#33495a] shadow-sm hover:border-[#022842]/35 hover:bg-[#f8fbfd] hover:text-[#022842] hover:shadow-md'
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">
                  {getCategoryIcon(item)}
                </span>
                {item.ad}
              </button>
            ))}
          </nav>
        )}

        {loading && (
          <div className="rounded-2xl border border-outline-variant/20 bg-white p-8 text-on-surface-variant shadow-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-[#022842]">
                progress_activity
              </span>
              Videolar yükleniyor…
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">
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
              <section className="mb-10 overflow-hidden rounded-[28px] border border-[#022842]/10 bg-white shadow-[0_18px_50px_rgba(2,40,66,0.12)]">
                <div className="grid lg:grid-cols-12">
                  <div className="relative isolate overflow-hidden bg-[#011f34] lg:col-span-8">
                    <img
                      src={data.vitrin.thumbnail}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#011f34]/75 via-[#011f34]/20 to-[#011f34]/75" />
                    <div className="relative z-[1] aspect-video">
                      <iframe
                        className="h-full w-full"
                        src={data.vitrin.embed_url}
                        title={data.vitrin.baslik}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>

                  <div className="relative flex flex-col justify-center overflow-hidden border-t-4 border-[#f5a623] bg-gradient-to-br from-white via-[#f2f7fb] to-[#dbeaf5] p-6 md:p-8 lg:col-span-4 lg:border-l-4 lg:border-t-0 lg:p-10">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined icon-filled absolute -right-7 -top-8 text-[180px] text-[#022842]/[0.035]"
                    >
                      play_circle
                    </span>

                    <div className="relative z-10">
                      <div className="mb-5 flex items-center gap-3">
                        <span className="h-px w-9 bg-[#f5a623]" />
                        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#022842]">
                          Öne Çıkan
                        </span>
                      </div>

                      <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-[#0b1c30] md:text-3xl">
                        {data.vitrin.vitrin_baslik || data.vitrin.baslik}
                      </h2>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {data.vitrin.kategori && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#022842]/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#022842] shadow-sm">
                            <span className="material-symbols-outlined text-base">
                              category
                            </span>
                            {data.vitrin.kategori.ad}
                          </span>
                        )}

                        {data.vitrin.sure && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#022842]/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#536575] shadow-sm">
                            <span className="material-symbols-outlined text-base">
                              schedule
                            </span>
                            {data.vitrin.sure}
                          </span>
                        )}

                      </div>

                      {(data.vitrin.vitrin_aciklama ||
                        data.vitrin.aciklama) && (
                        <p className="mt-5 line-clamp-5 text-sm leading-6 text-[#536575] md:text-base">
                          {data.vitrin.vitrin_aciklama ||
                            data.vitrin.aciklama}
                        </p>
                      )}

                      <div className="mt-7 flex flex-wrap items-center gap-4">
                        <a
                          href={data.vitrin.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex items-center gap-3 rounded-xl bg-[#022842] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(2,40,66,0.18)] transition hover:bg-[#0a3a5c] hover:shadow-[0_10px_24px_rgba(2,40,66,0.24)]"
                        >
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5a623] text-[#022842] transition group-hover:scale-105">
                            <span className="material-symbols-outlined icon-filled">
                              play_arrow
                            </span>
                          </span>
                          YouTube'da İzle
                        </a>
                      </div>

                    </div>
                  </div>
                </div>
              </section>
            )}

            <section>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-on-surface md:text-2xl">
                    {aktifKategoriAdi}
                  </h2>

                  <p className="mt-1 text-sm text-on-surface-variant">
                    {kartVideolari.length > 0
                      ? `${kartVideolari.length} video listeleniyor`
                      : 'Bu kategoride başka video bulunmuyor'}
                  </p>
                </div>
              </div>

              {data.videolar.length === 0 ? (
                <div className="rounded-2xl border border-outline-variant/20 bg-white p-10 text-center shadow-sm">
                  <span className="material-symbols-outlined mb-3 text-5xl text-outline">
                    video_library
                  </span>

                  <h3 className="text-lg font-semibold text-on-surface">
                    Video bulunamadı
                  </h3>

                  <p className="mt-2 text-sm text-on-surface-variant">
                    Bu kategoride veritabanına eklenmiş bir video bulunmuyor.
                  </p>
                </div>
              ) : kartVideolari.length > 0 ? (
                <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {kartVideolari.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-outline-variant/20 bg-white p-8 text-center text-sm text-on-surface-variant shadow-sm">
                  Seçili kategoride yalnızca öne çıkan video bulunuyor.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
