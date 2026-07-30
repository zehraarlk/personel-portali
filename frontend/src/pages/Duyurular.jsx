import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import MediaFrame from '../components/MediaFrame';
import { fetchDuyurular } from '../api/client';

const EMPTY_DATA = {
  duyurular: [],
  kategoriler: [],
};

const DUYURULAR_PER_PAGE = 12;

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
  return (
    <article className="group flex h-full cursor-pointer select-none flex-col overflow-hidden rounded-[22px] border border-[#dde5eb] bg-white shadow-[0_14px_34px_rgba(2,40,66,0.08)] transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.012] hover:border-[#022842]/28 hover:shadow-[0_24px_56px_rgba(2,40,66,0.16)]">
      <div className="relative">
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-[22px] bg-[#e8eef3]">
          {duyuru.resim ? (
            <MediaFrame
              src={duyuru.resim}
              alt={duyuru.baslik}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-[#eef3f7] via-[#e8eff5] to-[#d7e1ea]"
            />
          )}

          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#022842]/14 to-transparent" />
        </div>

        {duyuru.kategori && (
          <div className="absolute bottom-0 left-4 right-4 z-10 translate-y-1/2">
            <span className="inline-flex max-w-full items-center rounded-full bg-[#022842] px-4.5 py-1.5 text-[13px] font-semibold leading-5 text-white shadow-[0_10px_22px_rgba(2,40,66,0.22)]">
              <span className="truncate">{duyuru.kategori}</span>
            </span>
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6 ${duyuru.kategori ? 'pt-8' : 'pt-5'}`}>
        {duyuru.tarih && (
          <time
            dateTime={duyuru.tarih}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6a7784]"
          >
            <span className="material-symbols-outlined text-[18px] text-[#7b8794]">
              calendar_month
            </span>
            {formatDate(duyuru.tarih)}
          </time>
        )}

        <h2 className="mt-4 line-clamp-2 min-h-[3.9rem] text-[1.45rem] font-black leading-[1.12] tracking-tight text-[#022842] transition-all duration-300 group-hover:translate-x-0.5 sm:text-[1.6rem]">
          {duyuru.baslik}
        </h2>

        <span aria-hidden="true" className="mt-4 h-[3px] w-9 rounded-full bg-[#022842] transition-all duration-300 group-hover:w-11" />

        {duyuru.aciklama ? (
          <p className="mt-4 line-clamp-3 min-h-[5.7rem] text-[15px] leading-7 text-[#5d6977]">
            {duyuru.aciklama}
          </p>
        ) : (
          <p className="mt-4 min-h-[5.7rem] text-[15px] leading-7 text-[#8a98a2]">
            Duyuru açıklaması bulunmuyor.
          </p>
        )}

        <div className="mt-auto pt-5">
          <span className="inline-flex min-h-[50px] w-full items-center justify-between gap-4 rounded-[14px] border border-[#022842]/18 bg-white px-5 text-[15px] font-bold text-[#022842] shadow-[0_8px_22px_rgba(2,40,66,0.06)] transition-all duration-300 group-hover:border-[#022842] group-hover:bg-[#022842] group-hover:text-white group-hover:shadow-[0_14px_30px_rgba(2,40,66,0.18)] sm:w-auto sm:min-w-[190px]">
            <span>Detaylı Bilgi</span>
            <span aria-hidden="true" className="text-[22px] leading-none transition-transform duration-300 group-hover:translate-x-1">
              →
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
            <header className="mb-6 flex w-full items-center gap-4 bg-[#f7fafc] py-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#073a68_0%,#022842_100%)] text-white shadow-[0_8px_20px_rgba(2,40,66,0.2)]">
                <span className="material-symbols-outlined text-[30px]">
                  campaign
                </span>
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-black leading-tight tracking-tight text-[#022842] md:text-[26px]">
                  Duyurular
                </h1>

                <p className="mt-1 text-xs font-medium leading-5 text-[#1f4f7f] md:text-[13px]">
                  Kurum içi güncel duyuru ve bilgilendirmeleri tek ekrandan takip
                  edebilirsiniz.
                </p>
              </div>
            </header>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
              <div className="relative w-full lg:min-w-0 lg:flex-1">
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

              {data.kategoriler.length > 0 && (
                <nav
                  ref={kategoriMenuRef}
                  className="relative z-50 w-full lg:w-[230px] lg:shrink-0"
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
                        {aktifKategori ? getCategoryIcon(aktifKategori) : 'campaign'}
                      </span>
                      <span className="truncate">
                        {kategori === '' ? 'Tüm Duyurular' : aktifKategoriAdi}
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
                          campaign
                        </span>
                        Tüm Duyurular
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
                className="relative z-50 w-full lg:w-[230px] lg:shrink-0"
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
                    className="absolute right-0 top-full mt-2 min-w-[230px] overflow-hidden rounded-xl border border-[#d5dde5] bg-white p-2 shadow-[0_14px_35px_rgba(2,40,66,0.18)]"
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
            </div>

            <section ref={duyuruListesiRef} className="scroll-mt-4 pb-10">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex shrink-0 items-center gap-2">
                  <span className="material-symbols-outlined text-[24px] leading-none text-[#022842]">
                    {kategori === '' ? 'campaign' : getCategoryIcon(aktifKategori)}
                  </span>

                  <h2 className="text-lg font-extrabold leading-none tracking-tight text-[#022842] md:text-[16px]">
                    {kategori === '' ? 'Tüm Duyurular' : aktifKategoriAdi}
                  </h2>

                  <span className="text-sm font-semibold italic text-[#516b86] md:text-[14px]">
                    –
                    {' '}
                    {filtrelenmisDuyurular.length > 0
                      ? `${filtrelenmisDuyurular.length} duyuru`
                      : 'Duyuru bulunamadı'}
                  </span>
                </div>

                <div aria-hidden="true" className="h-px flex-1 bg-[#022842]/20" />
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
                  <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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