import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSizdenGelenler, goruntulenmeArttir } from '../api/client';

function deptIkon(kategori) {
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
  const [searchParams] = useSearchParams();
  const refSayfa = searchParams.get('ref');
  const listeAdresi = refSayfa ? `/sizden-gelenler?sayfa=${refSayfa}` : '/sizden-gelenler';

  const [tumIcerikler, setTumIcerikler] = useState([]);
  const [icerik, setIcerik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resimBuyuk, setResimBuyuk] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSizdenGelenler()
      .then((data) => {
        const liste = data.icerikler ?? [];
        setTumIcerikler(liste);
        setIcerik(liste.find((i) => String(i.id) === id) || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    goruntulenmeArttir(id).catch(() => {});
  }, [id]);

  const digerIcerikler = useMemo(() => {
    if (!icerik) return [];
    return tumIcerikler
      .filter((i) => i.kategori_slug === icerik.kategori_slug && String(i.id) !== id)
      .slice(0, 4);
  }, [tumIcerikler, icerik, id]);

  return (
    <Layout>
      <div className="mx-auto w-full max-w-2xl">
        {loading && (
          <div className="rounded-2xl border border-[#022842]/10 bg-white p-8 text-[#536575] shadow-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-[#022842]">progress_activity</span>
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
            <span className="material-symbols-outlined mb-3 text-5xl text-[#c7cdd2]">search_off</span>
            <p className="text-base font-semibold text-[#022842]">İçerik bulunamadı</p>
          </div>
        )}

        {!loading && !error && icerik && (
          <>
            <Link
              to={listeAdresi}
              className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#022842]/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#022842] shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              Tüm içeriklere dön
            </Link>

            <button
              type="button"
              onClick={() => setResimBuyuk(true)}
              className="group relative mb-4 block h-52 w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#dce6ed]"
              aria-label="Görseli büyüt"
            >
              <img
                src={icerik.resim}
                alt={icerik.kategori}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-[#022842]/85 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                <span className="material-symbols-outlined text-[15px]">{deptIkon(icerik.kategori)}</span>
                {icerik.kategori}
              </span>
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                <span className="material-symbols-outlined text-[17px]">zoom_in</span>
              </span>
            </button>

            <h1 className="mb-2 text-xl font-bold text-[#022842]">{icerik.baslik}</h1>

            <div className="mb-4 flex gap-4 text-xs text-[#5b6b78]">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                {icerik.tarih}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">visibility</span>
                {icerik.goruntulenme ?? 0}
              </span>
            </div>

            <p className="mb-8 text-sm leading-7 text-[#33495a]">{icerik.ozet}</p>

            {digerIcerikler.length > 0 && (
              <>
                <p className="mb-3 text-sm font-semibold text-[#022842]">Diğer İçerikler</p>
                <div className="flex flex-col gap-2.5">
                  {digerIcerikler.map((item) => (
                    <Link
                      key={item.id}
                      to={`/sizden-gelenler/detay/${item.id}${refSayfa ? `?ref=${refSayfa}` : ''}`}
                      className="group flex items-center gap-3 rounded-xl border border-[#022842]/10 bg-white p-2.5 shadow-sm transition hover:bg-[#f8fbfd]"
                    >
                      <div className="h-14 w-[70px] shrink-0 overflow-hidden rounded-lg bg-[#dce6ed]">
                        <img
                          src={item.resim}
                          alt={item.kategori}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-[#022842]">{item.baslik}</p>
                        <p className="mt-0.5 text-[11px] text-[#9aa5ad]">{item.tarih}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {resimBuyuk && icerik && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setResimBuyuk(false)}
        >
          <button
            onClick={() => setResimBuyuk(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
          <img
            src={icerik.resim}
            alt={icerik.kategori}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Layout>
  );
}