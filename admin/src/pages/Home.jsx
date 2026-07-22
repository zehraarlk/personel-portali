import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchHomeDashboard } from '../api/client';
import { BRAND_IMG } from '../constants';

const DUYURU_LIMIT = 6;

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [haberIndex, setHaberIndex] = useState(0);

  useEffect(() => {
    fetchHomeDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const list = data?.haberler ?? [];
    if (list.length < 2) return undefined;
    const id = setInterval(() => setHaberIndex((i) => (i + 1) % list.length), 5000);
    return () => clearInterval(id);
  }, [data?.haberler]);

  const haberler = data?.haberler ?? [];
  const duyurular = (data?.duyurular ?? []).slice(0, DUYURU_LIMIT);
  const dogumGunleri = data?.dogum_gunleri ?? [];
  const otomasyon = data?.otomasyon ?? [];
  const aktif = haberler[haberIndex];

  return (
    <Layout>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-on-surface">
          Günaydın, Hoş Geldiniz
        </h1>
        <p className="mt-1 text-base text-on-surface-variant">
          İşte bugün kurumumuzda olan bitenler.
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
          {/* Satır 1: Haberler | Duyurular */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <section
              id="haberler"
              className="lg:col-span-8 flex flex-col rounded-2xl bg-white border border-outline-variant/15 shadow-[0_4px_20px_rgba(30,58,138,0.05)] overflow-hidden min-h-[360px]"
            >
              {aktif ? (
                <>
                  <div className="relative flex-1 min-h-[280px] bg-surface-container">
                    <img
                      src={aktif.resim}
                      alt={aktif.baslik}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-primary px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                          Haberler &amp; Etkinlikler
                        </span>
                        <span className="text-xs text-white/80">{data.tarih_tr}</span>
                      </div>
                      <h2 className="max-w-3xl text-lg md:text-2xl font-semibold leading-snug text-white">
                        {aktif.baslik}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 border-t border-outline-variant/15 bg-white px-4 py-3">
                    {haberler.map((h, i) => (
                      <button
                        key={h.id}
                        type="button"
                        aria-label={h.baslik}
                        onClick={() => setHaberIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === haberIndex
                            ? 'w-8 bg-primary'
                            : 'w-2 bg-outline-variant hover:bg-primary/40'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="m-auto p-8 text-on-surface-variant">Haber bulunamadı.</p>
              )}
            </section>

            <section
              id="duyurular"
              className="lg:col-span-4 flex flex-col rounded-2xl bg-white border border-outline-variant/15 shadow-[0_4px_20px_rgba(30,58,138,0.05)] p-5 md:p-6 min-h-[360px]"
            >
              <div className="mb-4 flex items-center justify-between gap-3 shrink-0">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-primary">campaign</span>
                  Duyurular
                </h2>
                <span className="text-sm font-semibold text-primary">
                  {data.duyurular?.length ?? 0}
                </span>
              </div>

              <ul className="flex flex-1 flex-col divide-y divide-outline-variant/20 overflow-auto">
                {duyurular.map((d) => (
                  <li key={d.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                      <img src={d.resim} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-on-surface">{d.baslik}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-on-surface-variant">
                        {d.aciklama}
                      </p>
                    </div>
                  </li>
                ))}
                {!duyurular.length && (
                  <li className="py-6 text-sm text-on-surface-variant">Duyuru yok.</li>
                )}
              </ul>
            </section>
          </div>

          {/* Satır 2: Otomasyon | Doğum günü */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <section
              id="otomasyon"
              className="lg:col-span-8 flex flex-col rounded-2xl bg-white border border-outline-variant/15 shadow-[0_4px_20px_rgba(30,58,138,0.05)] p-5 md:p-6 min-h-[320px]"
            >
              <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-on-surface shrink-0">
                <span className="material-symbols-outlined text-primary">hub</span>
                Kurum İçi Otomasyon Sistemleri
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 flex-1 content-start">
                {otomasyon.map((link) => (
                  <a
                    key={link.id}
                    href={link.hedef_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-[140px] flex-col items-center rounded-xl border border-outline-variant/25 bg-surface p-4 text-center transition hover:border-primary/25 hover:shadow-md"
                  >
                    <div className="mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-outline-variant/20 bg-white p-2">
                      <img
                        src={link.logo || BRAND_IMG}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <p className="line-clamp-2 flex-1 text-sm font-semibold leading-5 text-on-surface">
                      {link.baslik}
                    </p>
                    <span className="mt-3 text-xs font-semibold text-primary opacity-70 group-hover:opacity-100">
                      Sisteme Git
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <section
              id="dogum-gunu"
              className="lg:col-span-4 flex flex-col rounded-2xl border border-tertiary-fixed-dim/40 bg-gradient-to-br from-tertiary-fixed to-white p-5 md:p-6 shadow-[0_4px_20px_rgba(30,58,138,0.05)] min-h-[320px]"
            >
              <div className="mb-4 flex items-center justify-between gap-2 shrink-0">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-tertiary-container">
                  <span className="material-symbols-outlined icon-filled">cake</span>
                  Mutlu Yıllar!
                </h2>
                <span className="rounded-md bg-white/70 px-2 py-1 text-xs font-medium text-tertiary-container">
                  {data.tarih_tr}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {dogumGunleri.length ? (
                  dogumGunleri.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-xl border border-white bg-white/70 p-3"
                    >
                      <img
                        src={BRAND_IMG}
                        alt={p.ad_soyad}
                        className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm bg-surface-container"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-on-surface">{p.ad_soyad}</p>
                        <p className="text-xs text-on-surface-variant">Personel</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="m-auto rounded-xl bg-white/60 p-4 text-sm text-tertiary-container text-center">
                    Bugün doğum günü olan personel bulunmuyor.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </Layout>
  );
}
