import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSizdenGelenler } from '../api/client';

const YAN_SAYFA_BASI = 4;

function getDeptIcon(kategori) {
  const value = `${kategori ?? ''}`.toLocaleLowerCase('tr-TR');
  if (value.includes('insan') || value.includes('kaynak')) return 'groups';
  if (value.includes('fen')) return 'construction';
  if (value.includes('temizlik')) return 'cleaning_services';
  if (value.includes('veteriner')) return 'pets';
  if (value.includes('park') || value.includes('bahce') || value.includes('bahçe')) return 'park';
  if (value.includes('zabita') || value.includes('zabıta')) return 'shield';
  return 'apartment';
}

export default function SizdenGelenlerDetay() {
  const { id } = useParams();
  const [tumIcerikler, setTumIcerikler] = useState([]);
  const [icerik, setIcerik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yanSayfa, setYanSayfa] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchSizdenGelenler()
      .then((data) => {
        const liste = data.icerikler ?? [];
        setTumIcerikler(liste);
        const bulunan = liste.find((i) => String(i.id) === id);
        setIcerik(bulunan || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setYanSayfa(0);
  }, [id]);

  const digerIcerikler = useMemo(
    () => tumIcerikler.filter((i) => String(i.id) !== id),
    [tumIcerikler, id]
  );

  const yanToplamSayfa = Math.max(1, Math.ceil(digerIcerikler.length / YAN_SAYFA_BASI));
  const yanGosterilenler = digerIcerikler.slice(
    yanSayfa * YAN_SAYFA_BASI,
    yanSayfa * YAN_SAYFA_BASI + YAN_SAYFA_BASI
  );

  useEffect(() => {
    if (yanToplamSayfa < 2) return;
    const timer = setInterval(() => {
      setYanSayfa((s) => (s + 1) % yanToplamSayfa);
    }, 4000);
    return () => clearInterval(timer);
  }, [yanToplamSayfa, yanSayfa]);

  return (
    <Layout>
      <div className="mx-auto w-full max-w-[1200px]">
        <Link
          to="/sizden-gelenler"
          className="group mb-5 inline-flex items-center gap-2 rounded-full border border-[#022842]/10 border-t-[3px] border-t-[#f5a623] bg-white px-4 py-2 text-sm font-bold text-[#022842] shadow-sm transition hover:-translate-x-0.5 hover:border-[#022842]/25 hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[18px] transition group-hover:-translate-x-0.5">
            arrow_back
          </span>
          Sizden Gelenler'e Dön
        </Link>

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
            Veriler alınamadı: {error}
          </div>
        )}

        {!loading && !error && !icerik && (
          <div className="rounded-2xl border border-[#022842]/10 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined mb-3 text-5xl text-[#c3ccd3]">
              search_off
            </span>
            <h3 className="text-lg font-semibold text-[#0b1c30]">İçerik bulunamadı</h3>
            <p className="mt-2 text-sm text-[#61717d]">
              Bu içerik kaldırılmış olabilir.
            </p>
          </div>
        )}

        {!loading && !error && icerik && (
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Sol: ana kart - liste sayfasındaki kart stiliyle aynı */}
            <article className="overflow-hidden rounded-2xl border border-[#022842]/10 border-t-4 border-t-[#f5a623] bg-gradient-to-br from-white via-[#f2f7fb] to-[#dbeaf5] shadow-[0_18px_50px_rgba(2,40,66,0.12)] lg:col-span-8">
              <div className="relative h-64 sm:h-96 overflow-hidden bg-[#dce6ed]">
                <img
                  src={icerik.resim}
                  alt={icerik.kategori}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#011f34]/70 via-transparent to-transparent" />
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/65 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                  {icerik.tarih}
                </span>
              </div>

              <div className="p-6 sm:p-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#022842]/10 px-3 py-1.5 text-xs font-bold text-[#022842]">
                  <span className="material-symbols-outlined text-[15px]">
                    {getDeptIcon(icerik.kategori)}
                  </span>
                  {icerik.kategori}
                </span>

                <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1c30]">
                  {icerik.kategori}
                </h1>
                <p className="mt-5 text-base leading-7 text-[#536575]">{icerik.ozet}</p>
              </div>
            </article>

            {/* Sağ: diğer içerikler - kart görünümlü, oklarla + otomatik sayfalanan */}
            {digerIcerikler.length > 0 && (
              <aside className="rounded-2xl border border-[#022842]/10 border-t-4 border-t-[#f5a623] bg-gradient-to-br from-white via-[#f2f7fb] to-[#dbeaf5] p-5 shadow-[0_18px_50px_rgba(2,40,66,0.08)] lg:col-span-4">
                <h2 className="mb-4 text-lg font-extrabold tracking-tight text-[#0b1c30]">
                  Diğer İçerikler
                </h2>

                <div className="flex flex-col gap-3">
                  {yanGosterilenler.map((item) => (
                    <Link
                      key={item.id}
                      to={`/sizden-gelenler/detay/${item.id}`}
                      className="group flex items-center gap-3 overflow-hidden rounded-xl border border-[#022842]/10 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-[#dce6ed]">
                        <img
                          src={item.resim}
                          alt={item.kategori}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-bold leading-snug text-[#0b1c30] group-hover:text-[#022842]">
                          {item.baslik}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#94a3b0]">
                          <span className="material-symbols-outlined text-[12px]">
                            {getDeptIcon(item.kategori)}
                          </span>
                          {item.tarih}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {yanToplamSayfa > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setYanSayfa((s) => Math.max(0, s - 1))}
                      disabled={yanSayfa === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#022842]/10 bg-white shadow-sm transition hover:border-[#022842]/30 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Önceki"
                    >
                      <span className="material-symbols-outlined text-[16px] leading-none">
                        chevron_left
                      </span>
                    </button>
                    <span className="text-xs font-medium text-[#536575]">
                      {yanSayfa + 1} / {yanToplamSayfa}
                    </span>
                    <button
                      onClick={() => setYanSayfa((s) => Math.min(yanToplamSayfa - 1, s + 1))}
                      disabled={yanSayfa >= yanToplamSayfa - 1}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#022842]/10 bg-white shadow-sm transition hover:border-[#022842]/30 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Sonraki"
                    >
                      <span className="material-symbols-outlined text-[16px] leading-none">
                        chevron_right
                      </span>
                    </button>
                  </div>
                )}
              </aside>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}