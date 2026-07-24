import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSizdenGelenler, goruntulenmeArttir } from '../api/client';

function getDeptIcon(kategori) {
  const value = `${kategori?.slug ?? ''} ${kategori?.ad ?? ''}`.toLocaleLowerCase('tr-TR');
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
  const devamEki = refSayfa ? `?ref=${refSayfa}` : '';

  const [kategoriler, setKategoriler] = useState([]);
  const [tumIcerikler, setTumIcerikler] = useState([]);
  const [icerik, setIcerik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resimBuyuk, setResimBuyuk] = useState(false);
  const [seciliMudurluk, setSeciliMudurluk] = useState(undefined);
  const [menuAcik, setMenuAcik] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSizdenGelenler()
      .then((data) => {
        const liste = data.icerikler ?? [];
        setTumIcerikler(liste);
        setKategoriler(data.kategoriler ?? []);
        const bulunan = liste.find((i) => String(i.id) === id);
        setIcerik(bulunan || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    goruntulenmeArttir(id).catch(() => {});
  }, [id]);

  useEffect(() => {
    setSeciliMudurluk(icerik ? icerik.kategori_slug : undefined);
  }, [id, icerik]);

  const digerIcerikler = useMemo(() => {
    const sonuc = seciliMudurluk
      ? tumIcerikler.filter((i) => i.kategori_slug === seciliMudurluk)
      : tumIcerikler;
    return sonuc.filter((i) => String(i.id) !== id).slice(0, 6);
  }, [tumIcerikler, seciliMudurluk, id]);

  const seciliMudurlukAdi = seciliMudurluk
    ? kategoriler.find((k) => k.slug === seciliMudurluk)?.ad
    : 'Tümü';

  return (
    <Layout>
      {loading && (
        <div className="mx-auto max-w-6xl rounded-2xl border border-[#022842]/10 bg-white p-8 text-[#536575] shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-[#022842]">
              progress_activity
            </span>
            Yükleniyor…
          </div>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-6xl rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">
          Veriler alınamadı: {error}
        </div>
      )}

      {!loading && !error && !icerik && (
        <div className="mx-auto max-w-6xl rounded-2xl border border-[#022842]/10 bg-white p-10 text-center shadow-sm">
          <span className="material-symbols-outlined mb-3 text-5xl text-[#c3ccd3]">
            search_off
          </span>
          <h3 className="text-lg font-semibold text-[#0b1c30]">İçerik bulunamadı</h3>
          <p className="mt-2 text-sm text-[#61717d]">Bu içerik kaldırılmış olabilir.</p>
        </div>
      )}

      {!loading && !error && icerik && (
        <div className="mx-auto max-w-6xl">
          {/* Üst gezinti */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              to={listeAdresi}
              className="group inline-flex items-center gap-2 rounded-full border border-[#022842]/10 bg-white px-4 py-2 text-sm font-bold text-[#022842] shadow-sm transition hover:-translate-x-0.5 hover:bg-[#eef1f3] hover:border-[#022842]/20"
            >
              <span className="material-symbols-outlined text-[18px] transition group-hover:-translate-x-0.5">
                arrow_back
              </span>
              Tüm İçeriklere Dön
            </Link>

            
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Fotoğraf */}
            <button
              type="button"
              onClick={() => setResimBuyuk(true)}
              className="group relative block h-[280px] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#dce6ed] sm:h-[380px] md:h-[440px] lg:col-span-8"
              aria-label="Görseli büyüt"
            >
              <img
                src={icerik.resim}
                alt={icerik.kategori}
                className="h-full w-full scale-105 object-cover transition duration-300 group-hover:scale-110"
              />
              <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
              </span>
            </button>

            {/* Sağ: diğer içerikler + hamburger menü, fotoğrafla aynı yükseklikte */}
            <div className="relative lg:col-span-4 h-[280px] sm:h-[380px] md:h-[440px] overflow-y-auto rounded-2xl border border-[#022842]/10 border-t-4 border-t-[#f5a623] bg-gradient-to-br from-white via-[#f2f7fb] to-[#dbeaf5] p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-[#0b1c30]">
                    Diğer İçerikler
                  </h2>
                  <p className="text-xs text-[#8a98a2]">{seciliMudurlukAdi}</p>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuAcik((v) => !v)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#022842]/10 bg-white text-[#022842] shadow-sm transition hover:bg-[#eef1f3]"
                    aria-label="Müdürlükler menüsü"
                  >
                    <span className="material-symbols-outlined text-[20px]">menu</span>
                  </button>

                  {menuAcik && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setMenuAcik(false)} />
                      <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-[#022842]/10 bg-white shadow-[0_16px_36px_rgba(2,40,66,0.14)]">
                        <button
                          type="button"
                          onClick={() => {
                            setSeciliMudurluk(null);
                            setMenuAcik(false);
                          }}
                          className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-semibold transition ${
                            seciliMudurluk === null
                              ? 'bg-[#022842] text-white'
                              : 'text-[#33495a] hover:bg-[#f8fbfd]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">grid_view</span>
                          Tümü
                        </button>
                        {kategoriler.map((k) => (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => {
                              setSeciliMudurluk(k.slug);
                              setMenuAcik(false);
                            }}
                            className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-semibold transition ${
                              seciliMudurluk === k.slug
                                ? 'bg-[#022842] text-white'
                                : 'text-[#33495a] hover:bg-[#f8fbfd]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {getDeptIcon(k)}
                            </span>
                            {k.ad}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {digerIcerikler.map((item) => (
                  <Link
                    key={item.id}
                    to={`/sizden-gelenler/detay/${item.id}${devamEki}`}
                    className="group flex items-center gap-3 rounded-xl bg-white/70 p-2 shadow-sm transition hover:bg-white"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#dce6ed]">
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
                      <p className="mt-0.5 text-xs text-[#94a3b0]">{item.tarih}</p>
                    </div>
                  </Link>
                ))}

                {!digerIcerikler.length && (
                  <p className="px-2 py-3 text-sm text-[#8a98a2]">Bu müdürlükte başka içerik yok.</p>
                )}
              </div>
            </div>

            {/* Başlık ve içerik metni */}
            <div className="lg:col-span-8">
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-[#022842]/10 px-3 py-1.5 text-xs font-bold text-[#022842]">
                  {icerik.kategori}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-[#8a98a2]">
                  <span className="material-symbols-outlined text-[17px]">calendar_today</span>
                  {icerik.tarih}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-[#8a98a2]">
                  <span className="material-symbols-outlined text-[17px]">visibility</span>
                  {icerik.goruntulenme ?? 0}
                </span>
              </div>

              <h1 className="mt-3 text-xl font-extrabold leading-tight tracking-tight text-[#0b1c30] sm:text-2xl">
                {icerik.baslik}
              </h1>

              <article className="mt-6">
                <p className="text-lg leading-8 text-[#33495a]">{icerik.ozet}</p>
              </article>
            </div>
          </div>
        </div>
      )}

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