import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSizdenGelenler, goruntulenmeArttir } from '../api/client';

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
  const seritRef = useRef(null);

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
    return tumIcerikler.filter((i) => String(i.id) !== id).slice(0, 8);
  }, [tumIcerikler, icerik, id]);

  function seritKaydir(yon) {
    seritRef.current?.scrollBy({ left: yon * 280, behavior: 'smooth' });
  }

  return (
    <Layout>
      <div className="w-full pb-16">
        {/* Geri Dön Linki */}
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
          <>
            {/* TAM GENİŞLİKLİ ANA BEYAZ KART CONTAINER */}
            <div className="overflow-hidden rounded-3xl border border-[#022842]/10 bg-white shadow-sm w-full">
              {/* 
                Görsel Kutusu:
                - Üzerine gelindiğinde (hover) resim hareket etmez/büyümez.
                - Tıklandığında büyük resmi açan buton görevi görür.
              */}
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

              {/* Kart İçerik Alanı */}
              <div className="p-6 sm:p-10">
                {/* Kategori, Tarih ve Görüntülenme */}
                <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">
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

                {/* Başlık */}
                <h1 className="mb-5 text-2xl font-bold text-[#022842] sm:text-3xl leading-snug">
                  {icerik.baslik}
                </h1>

                {/* Özet / İçerik */}
                <p className="text-base leading-8 text-[#536575]">
                  {icerik.ozet}
                </p>
              </div>
            </div>

            {/* DİĞER İÇERİKLER BÖLÜMÜ */}
            {digerIcerikler.length > 0 && (
              <div className="mt-12">
                <p className="mb-5 text-lg font-bold text-[#022842]">Diğer İçerikler</p>

                <div className="relative">
                  {/* Sol Scroll Butonu */}
                  <button
                    onClick={() => seritKaydir(-1)}
                    className="absolute -left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#022842]/10 bg-white shadow-md transition hover:bg-gray-50"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#022842]">chevron_left</span>
                  </button>

                  {/* Şerit Liste */}
                  <div
                    ref={seritRef}
                    className="flex gap-5 overflow-x-auto pb-4 scrollbar-none"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {digerIcerikler.map((item) => (
                      <Link
                        key={item.id}
                        to={`/sizden-gelenler/detay/${item.id}${refSayfa ? `?ref=${refSayfa}` : ''}`}
                        className="group w-56 shrink-0 overflow-hidden rounded-2xl border border-[#022842]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="h-32 overflow-hidden bg-[#dce6ed]">
                          <img
                            src={item.resim}
                            alt={item.kategori}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <p className="line-clamp-2 text-xs font-bold leading-tight text-[#022842]">
                            {item.baslik}
                          </p>
                          <p className="mt-2 text-[10px] font-medium text-[#8696a4]">{formatTarih(item.tarih)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Sağ Scroll Butonu */}
                  <button
                    onClick={() => seritKaydir(1)}
                    className="absolute -right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#022842]/10 bg-white shadow-md transition hover:bg-gray-50"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#022842]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Resim Büyütme Modalı (Büyük Görsel Ekranı) */}
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