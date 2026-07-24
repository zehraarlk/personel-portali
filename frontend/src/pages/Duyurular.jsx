import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Layout from '../components/Layout';
import Footer from '../components/Footer';
import { fetchDuyurular } from '../api/client';

const EMPTY_DATA = {
  duyurular: [],
  kategoriler: [],
};

const DUYURULAR_PER_PAGE = 9;

const SORT_OPTIONS = [
  { value: 'yeni', label: 'En Yeni', icon: 'new_releases' },
  { value: 'eski', label: 'En Eski', icon: 'history' },
  { value: 'az', label: 'A–Z', icon: 'sort_by_alpha' },
  { value: 'za', label: 'Z–A', icon: 'sort_by_alpha' },
];

function SortOptionIcon({ option, className = '' }) {
  const alfabetik = option.value === 'az' || option.value === 'za';

  if (!alfabetik) {
    return (
      <span
        aria-hidden="true"
        className={`material-symbols-outlined shrink-0 text-[18px] ${className}`}
      >
        {option.icon}
      </span>
    );
  }

  const ilkHarf = option.value === 'az' ? 'A' : 'Z';
  const sonHarf = option.value === 'az' ? 'Z' : 'A';

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-5 w-[23px] shrink-0 ${className}`}
    >
      <span className="absolute left-0 top-0 text-[10px] font-black leading-[10px]">
        {ilkHarf}
      </span>
      <span className="absolute bottom-0 left-0 text-[10px] font-black leading-[10px]">
        {sonHarf}
      </span>
      <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[14px] leading-none">
        arrow_downward
      </span>
    </span>
  );
}

const DATE_FORMATTER = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

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

function formatDate(value) {
  if (!value) return '';

  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date);
}

function getDuyuruTimestamp(duyuru) {
  if (duyuru?.tarih) {
    const timestamp = new Date(`${duyuru.tarih}T00:00:00`).getTime();
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  const numericId = Number(duyuru?.id);
  return Number.isFinite(numericId) ? numericId : 0;
}

function getCategoryIcon(category) {
  const value = `${category?.slug ?? ''} ${category?.ad ?? ''}`.toLocaleLowerCase(
    'tr-TR',
  );

  if (value.includes('eğitim') || value.includes('egitim')) return 'school';
  if (value.includes('etkinlik')) return 'event';
  if (value.includes('insan') || value.includes('personel')) return 'groups';
  if (value.includes('sağlık') || value.includes('saglik')) return 'health_and_safety';
  if (value.includes('teknoloji') || value.includes('bilgi')) return 'devices';

  return 'campaign';
}

function DuyuruCard({ duyuru }) {
  const kategoriIkon = getCategoryIcon({ ad: duyuru.kategori });
  return (
    <article className="group relative flex h-full cursor-pointer select-none flex-col rounded-xl border border-[#022842]/10 bg-white shadow-[0_6px_20px_rgba(2,40,66,0.07)] transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-[#f5a623]/70 hover:shadow-[0_26px_52px_rgba(2,40,66,0.22),0_0_0_3px_rgba(245,166,35,0.16)]">
      {/* Hover sırasında kartın tamamını belirginleştiren ince sarı çerçeve */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 rounded-xl border-2 border-[#f5a623] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {/* Kıvrık sayfa köşesi — dosya/belge hissi */}
      <span
        aria-hidden="true"
        className="absolute right-0 top-0 z-20 h-0 w-0 border-b-[26px] border-l-[26px] border-b-transparent border-l-[#eef5fa] drop-shadow-[-2px_2px_3px_rgba(2,40,66,0.14)]"
      />

      <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl bg-[#dce6ed]">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#e7eff5] via-[#d9e8f2] to-[#bfd5e4]">
          <span className="material-symbols-outlined text-6xl text-[#022842]/20">
            {kategoriIkon}
          </span>
        </div>

        {duyuru.resim && (
          <img
            src={duyuru.resim}
            alt={duyuru.baslik}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.08]"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#011f34]/55 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-90" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#f5a623]/20 via-transparent to-[#022842]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {duyuru.tarih && (
          <time
            dateTime={duyuru.tarih}
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-[#022842]/80 px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#f5a623]/70 group-hover:shadow-[0_6px_16px_rgba(2,40,66,0.28)]"
          >
            <span className="material-symbols-outlined text-[14px]">
              calendar_month
            </span>
            {formatDate(duyuru.tarih)}
          </time>
        )}

        <div className="absolute inset-x-6 -bottom-px border-t border-dashed border-[#022842]/20" />
      </div>

      {/* Kategori mührü — sarı, sayfanın vurgu rengi olarak ölçülü kullanılıyor */}
      <div className="relative z-10 -mt-6 flex items-start pl-5">
        <div className="flex h-12 w-12 -rotate-6 items-center justify-center rounded-full border-2 border-dashed border-[#f5a623] bg-white text-[#022842] shadow-[0_3px_10px_rgba(2,40,66,0.16)] ring-4 ring-[#f5a623]/10 transition-all duration-300 group-hover:rotate-0 group-hover:scale-110 group-hover:bg-[#fff4d9] group-hover:shadow-[0_8px_20px_rgba(245,166,35,0.28)] group-hover:ring-[#f5a623]/25">
          <span className="material-symbols-outlined text-[22px]">
            {kategoriIkon}
          </span>
        </div>

        {duyuru.kategori && (
          <span className="ml-2 mt-1 inline-flex max-w-[62%] items-center gap-1.5 truncate rounded-lg bg-[#022842] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm ring-1 ring-[#f5a623]/35 transition-all duration-300 group-hover:translate-x-1 group-hover:ring-[#f5a623]/70">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5a623]"
            />
            <span className="truncate">{duyuru.kategori}</span>
          </span>
        )}

      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <h2 className="line-clamp-2 min-h-[3.25rem] text-lg font-extrabold leading-[1.45] tracking-tight text-[#0b1c30] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#022842]">
          {duyuru.baslik}
        </h2>

        {duyuru.aciklama ? (
          <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#61717d] transition-colors duration-300 group-hover:text-[#405565]">
            {duyuru.aciklama}
          </p>
        ) : (
          <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-[#8a98a2]">
            Duyuru açıklaması bulunmuyor.
          </p>
        )}

        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#022842] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-300 group-hover:gap-2.5 group-hover:bg-[#f5a623] group-hover:text-[#022842] group-hover:shadow-[0_7px_18px_rgba(245,166,35,0.32)]">
            Detaylı bilgi
            <span className="material-symbols-outlined text-[15px] [animation-duration:0.9s] [animation-iteration-count:infinite] [animation-name:none] [animation-timing-function:ease-in-out] group-hover:[animation-name:duyuru-arrow-slide]">
              arrow_forward
            </span>
          </span>
        </div>
      </div>

    </article>
  );
}

export default function Duyurular() {
  const [data, setData] = useState(EMPTY_DATA);
  const [kategori, setKategori] = useState('');
  const [kategoriMenuAcik, setKategoriMenuAcik] = useState(false);
  const [siralamaMenuAcik, setSiralamaMenuAcik] = useState(false);
  const [arama, setArama] = useState('');
  const [siralama, setSiralama] = useState('yeni');
  const [sayfa, setSayfa] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const kategoriMenuRef = useRef(null);
  const siralamaMenuRef = useRef(null);
  const duyuruListesiRef = useRef(null);

  useEffect(() => {
    if (!kategoriMenuAcik && !siralamaMenuAcik) return undefined;

    function handleOutsidePointerDown(event) {
      if (
        kategoriMenuAcik &&
        kategoriMenuRef.current &&
        !kategoriMenuRef.current.contains(event.target)
      ) {
        setKategoriMenuAcik(false);
      }

      if (
        siralamaMenuAcik &&
        siralamaMenuRef.current &&
        !siralamaMenuRef.current.contains(event.target)
      ) {
        setSiralamaMenuAcik(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setKategoriMenuAcik(false);
        setSiralamaMenuAcik(false);
      }
    }

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [kategoriMenuAcik, siralamaMenuAcik]);

  useEffect(() => {
    let cancelled = false;

    async function loadDuyurular() {
      setLoading(true);
      setError('');

      try {
        const result = await fetchDuyurular(kategori);

        if (!cancelled) {
          setData({
            duyurular: Array.isArray(result.duyurular) ? result.duyurular : [],
            kategoriler: Array.isArray(result.kategoriler) ? result.kategoriler : [],
          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || 'Duyurular yüklenemedi.');
          setData((current) => ({
            ...current,
            duyurular: [],
          }));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDuyurular();

    return () => {
      cancelled = true;
    };
  }, [kategori, reloadToken]);

  const filtrelenmisDuyurular = useMemo(() => {
    const sorgu = arama.trim().toLocaleLowerCase('tr-TR');

    const sonuclar = sorgu
      ? data.duyurular.filter((duyuru) => {
          const aranacakMetin = [
            duyuru.baslik,
            duyuru.aciklama,
            duyuru.kategori,
            duyuru.tarih,
          ]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase('tr-TR');

          return aranacakMetin.includes(sorgu);
        })
      : data.duyurular;

    return [...sonuclar].sort((a, b) => {
      if (siralama === 'eski') {
        return getDuyuruTimestamp(a) - getDuyuruTimestamp(b);
      }

      if (siralama === 'az') {
        return String(a.baslik ?? '').localeCompare(String(b.baslik ?? ''), 'tr-TR', {
          sensitivity: 'base',
        });
      }

      if (siralama === 'za') {
        return String(b.baslik ?? '').localeCompare(String(a.baslik ?? ''), 'tr-TR', {
          sensitivity: 'base',
        });
      }

      return getDuyuruTimestamp(b) - getDuyuruTimestamp(a);
    });
  }, [arama, data.duyurular, siralama]);

  const toplamSayfa = Math.max(
    1,
    Math.ceil(filtrelenmisDuyurular.length / DUYURULAR_PER_PAGE),
  );

  const sayfadakiDuyurular = useMemo(() => {
    const baslangic = (sayfa - 1) * DUYURULAR_PER_PAGE;

    return filtrelenmisDuyurular.slice(
      baslangic,
      baslangic + DUYURULAR_PER_PAGE,
    );
  }, [filtrelenmisDuyurular, sayfa]);

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

  function sayfayaGit(yeniSayfa) {
    const hedefSayfa = Math.min(Math.max(yeniSayfa, 1), toplamSayfa);

    if (hedefSayfa === sayfa) return;

    setSayfa(hedefSayfa);

    window.requestAnimationFrame(() => {
      duyuruListesiRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  const aktifKategori =
    data.kategoriler.find((item) => item.slug === kategori) ?? null;

  const aktifKategoriAdi = aktifKategori?.ad || 'Tüm Duyurular';
  const aktifSiralama =
    SORT_OPTIONS.find((option) => option.value === siralama) ?? SORT_OPTIONS[0];

  return (
    <Layout videoPage>
      <div className="min-h-full w-full bg-[#f7fafc]">
        <style>{`
          @keyframes duyuru-arrow-slide {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(5px); }
          }
        `}</style>
        {loading && (
          <div className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8">
            <div className="rounded-2xl border border-outline-variant/20 bg-white p-8 text-on-surface-variant shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-[#022842]">
                  progress_activity
                </span>
                Duyurular yükleniyor…
              </div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8">
            <div className="rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined">error</span>

                <div className="flex-1">
                  <p className="font-semibold">Duyurular yüklenemedi</p>
                  <p className="mt-1 text-sm">{error}</p>

                  <button
                    type="button"
                    onClick={() => setReloadToken((value) => value + 1)}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#022842] px-4 text-sm font-semibold text-white transition hover:bg-[#0a3a5c]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      refresh
                    </span>
                    Yeniden dene
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="mx-auto w-full max-w-[1440px] px-4 pb-6 pt-4 md:px-8 md:pb-8 md:pt-4">
            <nav
              aria-label="Sayfa yolu"
              className="mb-4 flex items-center gap-2 px-2 text-sm font-medium text-[#33495a]"
            >
              <Link
                to="/"
                className="transition hover:text-[#022842] hover:underline"
              >
                Anasayfa
              </Link>

              <span
                className="material-symbols-outlined text-[18px] text-[#536575]"
                aria-hidden="true"
              >
                chevron_right
              </span>

              <span className="font-semibold text-[#022842]" aria-current="page">
                Duyurular
              </span>
            </nav>

            <header className="relative mb-6 w-full overflow-hidden rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-[#022842] via-[#073a5c] to-[#0c5278] px-6 py-4 text-white shadow-[0_14px_38px_rgba(2,40,66,0.18)] md:px-9 md:py-5">
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
              <div className="pointer-events-none absolute -bottom-28 right-28 h-56 w-56 rounded-full border border-[#f5a623]/20 bg-[#f5a623]/5" />

              <div className="relative max-w-3xl">
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                  Duyurular
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/75">
                  Kurum içi güncel duyuru ve bilgilendirmeleri tek ekrandan takip
                  edebilirsiniz.
                </p>
              </div>
            </header>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
              {data.kategoriler.length > 0 && (
                <nav
                  ref={kategoriMenuRef}
                  className="relative z-50 w-full lg:w-[180px] lg:shrink-0"
                  aria-label="Duyuru kategorileri"
                >
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={kategoriMenuAcik}
                    onClick={() => {
                      setKategoriMenuAcik((acik) => !acik);
                      setSiralamaMenuAcik(false);
                    }}
                    className="inline-flex h-[44px] w-full items-center justify-between gap-2.5 rounded-xl border border-[#cfd9e2] bg-white px-4 py-2 text-sm font-semibold text-[#022842] shadow-sm transition hover:border-[#022842]/35 hover:bg-[#f7fafc] focus:outline-none focus:ring-4 focus:ring-[#022842]/10"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#022842]">
                        {aktifKategori ? getCategoryIcon(aktifKategori) : 'grid_view'}
                      </span>
                      <span className="truncate">
                        {kategori === '' ? 'Tümü' : aktifKategoriAdi}
                      </span>
                    </span>

                    <span
                      className={`material-symbols-outlined text-[19px] text-[#022842] transition-transform duration-200 ${
                        kategoriMenuAcik ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {kategoriMenuAcik && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full mt-2 min-w-[250px] overflow-hidden rounded-xl border border-[#d5dde5] bg-white p-2 shadow-[0_14px_35px_rgba(2,40,66,0.18)]"
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
                            ? 'bg-[#e8f1f8] text-[#022842]'
                            : 'text-[#33495a] hover:bg-[#eef5fa] hover:text-[#022842]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#022842]">
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
                              ? 'bg-[#e8f1f8] text-[#022842]'
                              : 'text-[#33495a] hover:bg-[#eef5fa] hover:text-[#022842]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px] text-[#022842]">
                            {getCategoryIcon(item)}
                          </span>
                          {item.ad}
                        </button>
                      ))}
                    </div>
                  )}
                </nav>
              )}

              <nav
                ref={siralamaMenuRef}
                className="relative z-50 w-full lg:w-[180px] lg:shrink-0"
                aria-label="Duyuru sıralama seçenekleri"
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={siralamaMenuAcik}
                  onClick={() => {
                    setSiralamaMenuAcik((acik) => !acik);
                    setKategoriMenuAcik(false);
                  }}
                  className="inline-flex h-[44px] w-full items-center justify-between gap-2.5 rounded-xl border border-[#cfd9e2] bg-white px-4 py-2 text-sm font-semibold text-[#022842] shadow-sm transition hover:border-[#022842]/35 hover:bg-[#f7fafc] focus:outline-none focus:ring-4 focus:ring-[#022842]/10"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <SortOptionIcon
                      option={aktifSiralama}
                      className="text-[#022842]"
                    />
                    <span className="truncate">{aktifSiralama.label}</span>
                  </span>

                  <span
                    className={`material-symbols-outlined text-[19px] text-[#022842] transition-transform duration-200 ${
                      siralamaMenuAcik ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {siralamaMenuAcik && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full mt-2 min-w-[230px] overflow-hidden rounded-xl border border-[#d5dde5] bg-white p-2 shadow-[0_14px_35px_rgba(2,40,66,0.18)]"
                  >
                    {SORT_OPTIONS.map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={siralama === option.value}
                        onClick={() => {
                          setSiralama(option.value);
                          setSiralamaMenuAcik(false);
                        }}
                        className={`${index > 0 ? 'mt-1 ' : ''}flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                          siralama === option.value
                            ? 'bg-[#e8f1f8] text-[#022842]'
                            : 'text-[#33495a] hover:bg-[#eef5fa] hover:text-[#022842]'
                        }`}
                      >
                        <SortOptionIcon
                          option={option}
                          className={
                            siralama === option.value
                              ? 'text-[#022842]'
                              : 'text-[#33495a]'
                          }
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </nav>

              <div className="relative w-full xl:w-[520px] xl:flex-none">
                <label htmlFor="duyuru-search" className="sr-only">
                  Duyurularda ara
                </label>

                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-[#022842]">
                  search
                </span>

                <input
                  id="duyuru-search"
                  type="text"
                  role="searchbox"
                  inputMode="search"
                  value={arama}
                  onChange={(event) => setArama(event.target.value)}
                  placeholder="Duyurularda ara..."
                  autoComplete="off"
                  className="h-[44px] w-full rounded-xl border border-[#cfd9e2] bg-white pl-10 pr-9 text-sm text-[#0b1c30] shadow-sm outline-none transition placeholder:text-[#7a8994] hover:border-[#022842]/35 focus:border-[#022842] focus:ring-4 focus:ring-[#022842]/10"
                />

                {arama && (
                  <button
                    type="button"
                    onClick={() => setArama('')}
                    className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#022842] transition hover:bg-[#eef5fa] hover:text-[#0a3a5c]"
                    aria-label="Aramayı temizle"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      close
                    </span>
                  </button>
                )}
              </div>
            </div>

            <section ref={duyuruListesiRef} className="scroll-mt-4 pb-10">
              <div className="mb-5 flex items-center gap-2.5">
                <span aria-hidden="true" className="h-2.5 w-px shrink-0 bg-[#022842]/25" />

                <h2 className="flex shrink-0 items-center gap-1.5 text-[13px] font-extrabold tracking-wide text-[#022842] md:text-sm">
                  <span className="material-symbols-outlined text-[15px] text-[#f5a623]">
                    folder_open
                  </span>
                  {kategori === '' ? 'Duyuru Arşivi' : aktifKategoriAdi}
                </h2>

                <div aria-hidden="true" className="h-px flex-1 bg-[#022842]/15" />
                <span aria-hidden="true" className="h-2.5 w-px shrink-0 bg-[#022842]/25" />

                <span className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-[#022842]/15 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#536575]">
                  {filtrelenmisDuyurular.length > 0
                    ? `${filtrelenmisDuyurular.length} duyuru`
                    : 'Duyuru bulunamadı'}
                </span>
              </div>

              {data.duyurular.length === 0 ? (
                <div className="rounded-2xl border border-[#022842]/10 bg-gradient-to-br from-white to-[#eef5fa] px-6 py-12 text-center shadow-[0_10px_28px_rgba(2,40,66,0.07)]">
                  <span className="material-symbols-outlined mb-4 text-5xl text-[#7a8994]">
                    campaign
                  </span>

                  <h3 className="text-lg font-extrabold text-[#0b1c30]">
                    Bu kategoride duyuru bulunamadı
                  </h3>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#61717d]">
                    Bu kategoriye henüz duyuru eklenmemiş olabilir. Diğer içerikleri
                    görmek için tüm duyuru arşivine dönebilirsiniz.
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
                        campaign
                      </span>
                      Tüm duyuruları göster
                    </button>
                  )}
                </div>
              ) : filtrelenmisDuyurular.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {sayfadakiDuyurular.map((duyuru) => (
                      <DuyuruCard key={duyuru.id} duyuru={duyuru} />
                    ))}
                  </div>

                  {toplamSayfa > 1 && (
                    <nav
                      className="mx-auto mt-8 flex w-fit max-w-full flex-wrap items-center justify-center gap-1.5 rounded-xl border border-[#022842]/10 bg-white/90 p-1.5 shadow-[0_6px_18px_rgba(2,40,66,0.08)] backdrop-blur sm:gap-2 sm:p-2"
                      aria-label="Duyuru sayfaları"
                    >
                      <button
                        type="button"
                        onClick={() => sayfayaGit(sayfa - 1)}
                        disabled={sayfa === 1}
                        className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#d5dde5] bg-white px-3 text-xs font-semibold text-[#33495a] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d5dde5] disabled:hover:bg-white sm:text-sm"
                        aria-label="Önceki sayfa"
                      >
                        <span className="material-symbols-outlined text-lg">
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
                            className={`relative inline-flex h-10 min-w-10 items-center justify-center overflow-hidden rounded-lg border px-3 text-sm font-extrabold transition ${
                              sayfa === item
                                ? "border-[#022842] bg-[#022842] text-white shadow-[0_5px_14px_rgba(2,40,66,0.22)] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-t-full after:bg-[#f5a623] after:content-['']"
                                : 'border-[#d5dde5] bg-white text-[#536575] shadow-sm hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842]'
                            }`}
                          >
                            {item}
                          </button>
                        ) : (
                          <span
                            key={item}
                            className="inline-flex h-10 min-w-6 items-center justify-center text-lg font-bold text-[#7a8994]"
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
                        className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#d5dde5] bg-white px-3 text-xs font-semibold text-[#33495a] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0] hover:text-[#022842] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d5dde5] disabled:hover:bg-white sm:text-sm"
                        aria-label="Sonraki sayfa"
                      >
                        <span className="hidden sm:inline">Sonraki</span>
                        <span className="material-symbols-outlined text-lg">
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
                    Aradığınız duyuru bulunamadı
                  </h3>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#61717d]">
                    “{arama.trim()}” ifadesiyle eşleşen bir sonuç yok. Farklı bir
                    kelime deneyin veya aramayı temizleyin.
                  </p>

                  <button
                    type="button"
                    onClick={() => setArama('')}
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-[#022842]/15 bg-white px-4 text-sm font-semibold text-[#022842] shadow-sm transition hover:border-[#f5a623] hover:bg-[#fffaf0]"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      backspace
                    </span>
                    Aramayı temizle
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        <Footer />
      </div>
    </Layout>
  );
}
