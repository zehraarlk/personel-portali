import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSizdenGelenler, goruntulenmeArttir } from '../api/client';

const PANEL_BASI = 6;

function formatTarih(tarih) {
  if (!tarih) return '—';
  const parcalar = tarih.split('-');
  if (parcalar.length !== 3) return tarih;
  const [yil, ay, gun] = parcalar;
  return `${gun}.${ay}.${yil}`;
}

export default function SizdenGelenlerDetayB() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const refSayfa = searchParams.get('ref');
  const listeAdresi = refSayfa ? `/sizden-gelenler?sayfa=${refSayfa}` : '/sizden-gelenler';

  const [tumIcerikler, setTumIcerikler] = useState([]);
  const [icerik, setIcerik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resimBuyuk, setResimBuyuk] = useState(false);
  const [panelSayfa, setPanelSayfa] = useState(0);

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

  useEffect(() => {
    setPanelSayfa(0);
  }, [id]);

  const digerIcerikler = useMemo(() => {
    if (!icerik) return [];
    return tumIcerikler.filter((i) => String(i.id) !== id);
  }, [tumIcerikler, icerik, id]);

  const panelToplamSayfa = Math.max(1, Math.ceil(digerIcerikler.length / PANEL_BASI));
  const panelGosterilenler = digerIcerikler.slice(
    panelSayfa * PANEL_BASI,
    panelSayfa * PANEL_BASI + PANEL_BASI
  );

  return (
    <Layout>
      <div className="w-full pb-16">
        <Link
          to={listeAdresi}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#022842] hover:underline"
        >
          <span className="material-symbols-outlined text-[17px]">arrow_back</span>
          Sizden Gelenler'e Dön
        </Link>

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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-stretch">
            <div className="overflow-hidden rounded-3xl border border-[#022842]/10 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setResimBuyuk(true)}
                className="relative block h-80 w-full cursor-pointer overflow-hidden bg-[#dce6ed] sm:h-[420px]"
                aria-label="Görseli büyüt"
              >
                <img
                  src={icerik.resim}
                  alt={icerik.kategori}
                  className="h-full w-full object-cover"
                />
              </button>

              <div className="p-5 sm:p-7">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">
                  <span className="rounded-full bg-gray-100 border border-gray-200 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#022842]">
                    {icerik.kategori}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#8696a4]">
                    {formatTarih(icerik.tarih)}
                  </span>
                  <span className="text-[#c7cdd2]">|</span>
                  <span className="inline-flex items-center gap-1 text-[#8696a4]">
                    <span className="material-symbols-outlined text-[15px]">visibility</span>
                    {icerik.goruntulenme ?? 0} görüntülenme
                  </span>
                </div>

                <h1 className="mb-3 text-2xl font-bold text-[#022842] sm:text-3xl leading-snug">
                  {icerik.baslik}
                </h1>

                <p className="text-base leading-7 text-[#536575]">{icerik.ozet}</p>
              </div>
            </div>

            <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border border-[#022842]/10 bg-white shadow-sm">
              <div className="border-b border-[#022842]/10 px-5 py-4">
                <p className="text-base font-bold text-[#022842]">Diğer İçerikler</p>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {panelGosterilenler.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {panelGosterilenler.map((item) => (
                      <Link
                        key={item.id}
                        to={`/sizden-gelenler/detay/${item.id}${refSayfa ? `?ref=${refSayfa}` : ''}`}
                        className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#f8fbfd]"
                      >
                        <div className="h-[58px] w-[68px] shrink-0 overflow-hidden rounded-lg bg-[#dce6ed]">
                          <img
                            src={item.resim}
                            alt={item.kategori}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-xs font-bold leading-snug text-[#022842] group-hover:text-[#0a3a5c]">
                            {item.baslik}
                          </p>
                          <p className="mt-1 text-[10.5px] font-medium text-[#8696a4]">
                            {formatTarih(item.tarih)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="p-3 text-xs text-[#8696a4]">Başka içerik bulunmuyor.</p>
                )}
              </div>

              {panelToplamSayfa > 1 && (
                <div className="flex items-center justify-center gap-2 border-t border-[#022842]/10 px-3 py-2.5">
                  <button
                    onClick={() => setPanelSayfa((s) => Math.max(0, s - 1))}
                    disabled={panelSayfa === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#022842]/10 bg-white disabled:opacity-30"
                    aria-label="Önceki"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#022842]">chevron_left</span>
                  </button>
                  <span className="text-[11px] font-semibold text-[#8696a4]">
                    {panelSayfa + 1} / {panelToplamSayfa}
                  </span>
                  <button
                    onClick={() => setPanelSayfa((s) => Math.min(panelToplamSayfa - 1, s + 1))}
                    disabled={panelSayfa >= panelToplamSayfa - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#022842]/10 bg-white disabled:opacity-30"
                    aria-label="Sonraki"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#022842]">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {resimBuyuk && icerik && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setResimBuyuk(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img src={icerik.resim} alt={icerik.kategori} className="max-h-[80vh] w-full object-contain" />
              <button
                onClick={() => setResimBuyuk(false)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                aria-label="Kapat"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4">
              <p className="text-base font-bold text-[#022842]">{icerik.baslik}</p>
              <p className="mt-0.5 text-xs text-[#9aa5ad]">{formatTarih(icerik.tarih)}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}