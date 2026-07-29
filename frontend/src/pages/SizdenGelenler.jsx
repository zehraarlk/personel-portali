import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSizdenGelenler } from '../api/client';

const SAYFA_BASI = 12;

function formatTarih(tarih) {
  if (!tarih) return '—';
  const parcalar = tarih.split('-');
  if (parcalar.length !== 3) return tarih;
  const [yil, ay, gun] = parcalar;
  return `${gun}.${ay}.${yil}`;
}

export default function SizdenGelenler() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [arama, setArama] = useState('');
  const listeRef = useRef(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const ilkYuklemeRef = useRef(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const sayfa = Number(searchParams.get('sayfa') || 0);
  const seciliKategori = searchParams.get('kategori');

  function sayfaAyarla(deger, kaydir = true) {
    setSearchParams(
      (prev) => {
        const yeniDeger = typeof deger === 'function' ? deger(sayfa) : deger;
        const next = new URLSearchParams(prev);
        if (yeniDeger === 0) next.delete('sayfa');
        else next.set('sayfa', String(yeniDeger));
        return next;
      },
      { replace: true }
    );
    if (kaydir) listeRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function kategoriSec(slug) {
    setArama('');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (slug) next.set('kategori', slug);
        else next.delete('kategori');
        next.delete('sayfa');
        return next;
      },
      { replace: true }
    );
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  useEffect(() => {
    fetchSizdenGelenler()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const kategoriler = data?.kategoriler ?? [];
  const icerikler = data?.icerikler ?? [];

  const oneCikan = useMemo(
    () => [...icerikler].sort((a, b) => b.goruntulenme - a.goruntulenme)[0],
    [icerikler]
  );

  const filtreliIcerikler = useMemo(() => {
    let sonuc = seciliKategori
      ? icerikler.filter((i) => i.kategori_slug === seciliKategori)
      : icerikler;

    if (arama.trim()) {
      const q = arama.trim().toLocaleLowerCase('tr-TR');
      sonuc = sonuc.filter(
        (i) =>
          i.baslik.toLocaleLowerCase('tr-TR').includes(q) ||
          i.ozet.toLocaleLowerCase('tr-TR').includes(q) ||
          i.kategori.toLocaleLowerCase('tr-TR').includes(q)
      );
    }

    return sonuc;
  }, [icerikler, seciliKategori, arama]);

  useEffect(() => {
    if (ilkYuklemeRef.current) {
      ilkYuklemeRef.current = false;
      return;
    }
    sayfaAyarla(0, false);
  }, [seciliKategori, arama]);

  const toplamSayfa = Math.max(1, Math.ceil(filtreliIcerikler.length / SAYFA_BASI));
  const gosterilenler = filtreliIcerikler.slice(sayfa * SAYFA_BASI, sayfa * SAYFA_BASI + SAYFA_BASI);
  const sayfaNumaralari = Array.from({ length: toplamSayfa }, (_, i) => i);

  return (
    <Layout>
      <div className="w-full">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#022842]">
            <span className="material-symbols-outlined text-[19px] text-[#f5a623]">campaign</span>
          </span>
          <div>
            <h1 className="text-lg font-bold text-[#022842]">Sizden Gelenler</h1>
            <p className="text-sm text-[#5b6b78]">Müdürlüklerden haber ve paylaşımlar</p>
          </div>
        </div>

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

        {!loading && !error && (
          <>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#022842]/10 bg-white px-3.5 py-2 shadow-sm">
                <span className="material-symbols-outlined text-[17px] text-[#9aa5ad]">search</span>
                <input
                  type="text"
                  value={arama}
                  onChange={(e) => setArama(e.target.value)}
                  placeholder="Ara…"
                  className="w-full border-0 bg-transparent text-sm text-[#0b1c30] outline-none placeholder:text-[#9aa5ad]"
                />
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={() => setMenuAcik((v) => !v)}
                  className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-[#022842]/10 bg-white shadow-sm"
                  aria-label="Müdürlükler menüsü"
                >
                  <span className="material-symbols-outlined text-[19px] text-[#022842]">menu</span>
                </button>

                {menuAcik && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMenuAcik(false)} />
                    <div className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-[#022842]/10 bg-white shadow-[0_16px_36px_rgba(2,40,66,0.14)]">
                      <button
                        onClick={() => {
                          kategoriSec(null);
                          setMenuAcik(false);
                        }}
                        className={`flex w-full items-center px-4 py-0.25 text-left text-[11px] font-semibold transition ${
                          seciliKategori === null
                            ? 'bg-[#022842] text-white'
                            : 'text-[#33495a] hover:bg-[#f8fbfd]'
                        }`}
                      >
                        Tümü
                      </button>
                      {kategoriler.map((k) => (
                        <button
                          key={k.id}
                          onClick={() => {
                            kategoriSec(k.slug);
                            setMenuAcik(false);
                          }}
                          className={`flex w-full items-center px-4 py-0.25 text-left text-[11px] font-semibold transition ${
                            seciliKategori === k.slug
                              ? 'bg-[#022842] text-white'
                              : 'text-[#33495a] hover:bg-[#f8fbfd]'
                          }`}
                        >
                          {k.ad}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {oneCikan && !seciliKategori && !arama && (
              <Link
                to={`/sizden-gelenler/detay/${oneCikan.id}`}
                className="mb-6 block overflow-hidden rounded-2xl bg-[#011f34] shadow-sm"
              >
                <div className="relative h-72">
                  <img
                    src={oneCikan.resim}
                    alt={oneCikan.kategori}
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#011f34] via-[#011f34]/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="mb-1.5 inline-block rounded-full bg-[#f5a623] px-2.5 py-1 text-[11px] font-bold text-[#022842]">
                      Öne Çıkan · {oneCikan.kategori}
                    </span>
                    <p className="text-lg font-bold text-white">{oneCikan.baslik}</p>
                  </div>
                </div>
              </Link>
            )}

            <div ref={listeRef} className="scroll-mt-24" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {gosterilenler.map((item) => (
                <Link
                  key={item.id}
                  to={`/sizden-gelenler/detay/${item.id}?ref=${sayfa}`}
                  className="group flex gap-3 overflow-hidden rounded-xl border border-[#022842]/10 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-[60px] w-[78px] shrink-0 overflow-hidden rounded-lg bg-[#dce6ed]">
                    <img
                      src={item.resim}
                      alt={item.kategori}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1 self-center">
                    <p className="mb-0.5 text-[11px] font-bold uppercase text-[#c2410c]">
                      {item.kategori}
                    </p>
                    <p className="line-clamp-1 text-sm font-semibold text-[#022842]">{item.baslik}</p>
                    <p className="mt-0.5 text-[11px] text-[#9aa5ad]">{formatTarih(item.tarih)}</p>
                  </div>
                </Link>
              ))}

              {!gosterilenler.length && (
                <div className="col-span-full rounded-2xl border border-[#022842]/10 bg-white p-8 text-center shadow-sm">
                  <span className="material-symbols-outlined mb-2 text-4xl text-[#c7cdd2]">search_off</span>
                  <p className="text-sm text-[#5b6b78]">Aramanla eşleşen içerik bulunamadı.</p>
                </div>
              )}
            </div>

            {toplamSayfa > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => sayfaAyarla((s) => Math.max(0, s - 1))}
                  disabled={sayfa === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#022842]/10 bg-white disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[14px] text-[#5b6b78]">chevron_left</span>
                </button>
                {sayfaNumaralari.map((n) => (
                  <button
                    key={n}
                    onClick={() => sayfaAyarla(n)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      sayfa === n ? 'bg-[#022842] text-white' : 'border border-[#022842]/10 bg-white text-[#022842]'
                    }`}
                  >
                    {n + 1}
                  </button>
                ))}
                <button
                  onClick={() => sayfaAyarla((s) => Math.min(toplamSayfa - 1, s + 1))}
                  disabled={sayfa >= toplamSayfa - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#022842]/10 bg-white disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[14px] text-[#5b6b78]">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}