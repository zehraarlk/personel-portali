import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { fetchDogumGunleri } from '../api/client';

const KAPSAMLAR = [
  { value: 'today', label: 'Bugün' },
  { value: 'month', label: 'Bu Ay' },
  { value: 'all', label: 'Tümü' },
];

function tarihParcala(isoTarih) {
  const [yil, ay, gun] = String(isoTarih || '').split('-').map(Number);
  return { yil, ay, gun };
}

function basHarfler(adSoyad) {
  return String(adSoyad || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parca) => parca[0]?.toLocaleUpperCase('tr-TR'))
    .join('');
}

function adSoyadDuzenle(adSoyad) {
  return String(adSoyad || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((parca) => {
      const kucuk = parca.toLocaleLowerCase('tr-TR');
      return `${kucuk.charAt(0).toLocaleUpperCase('tr-TR')}${kucuk.slice(1)}`;
    })
    .join(' ');
}

function kalanGunHesapla(personel, bugun) {
  if (!bugun.yil || !bugun.ay || !bugun.gun || !personel?.ay || !personel?.gun) {
    return null;
  }

  const bugunUtc = Date.UTC(bugun.yil, bugun.ay - 1, bugun.gun);
  let dogumGunuUtc = Date.UTC(bugun.yil, personel.ay - 1, personel.gun);

  if (dogumGunuUtc < bugunUtc) {
    dogumGunuUtc = Date.UTC(bugun.yil + 1, personel.ay - 1, personel.gun);
  }

  return Math.round((dogumGunuUtc - bugunUtc) / 86400000);
}

function MiniBirthdayIllustration() {
  return (
    <svg
      viewBox="0 0 280 130"
      className="h-[82px] w-[190px] xl:h-[88px] xl:w-[205px]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroPanel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#e6eff3" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="balloonDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6f95a8" />
          <stop offset="100%" stopColor="#022842" />
        </linearGradient>
        <linearGradient id="balloonLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dce8ee" />
          <stop offset="100%" stopColor="#8eafbf" />
        </linearGradient>
        <linearGradient id="giftBox" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d8e5eb" />
        </linearGradient>
        <linearGradient id="cakeBase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4e1e8" />
          <stop offset="100%" stopColor="#6d91a4" />
        </linearGradient>
        <linearGradient id="cakePlate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#edf4f7" />
          <stop offset="100%" stopColor="#bfd2dc" />
        </linearGradient>
        <linearGradient id="flameGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd978" />
          <stop offset="100%" stopColor="#f6b534" />
        </linearGradient>
        <filter id="heroSoftShadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#022842" floodOpacity="0.12" />
        </filter>
        <filter id="heroBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      <ellipse cx="160" cy="108" rx="112" ry="10" fill="#022842" opacity="0.08" />
      <rect x="26" y="16" width="228" height="92" rx="24" fill="url(#heroPanel)" />
      <path d="M48 30C92 14 168 14 228 28" fill="none" stroke="#9ab2bf" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />

      {[0, 1, 2, 3, 4].map((i) => {
        const xs = [58, 92, 126, 160, 194];
        const colors = ['#d7a93f', '#87a4b4', '#022842', '#d9e7ed', '#6a8ca0'];
        return <path key={i} d={`M${xs[i]} 28l11 18H${xs[i] - 11}Z`} fill={colors[i]} opacity="0.95" />;
      })}

      <circle cx="42" cy="22" r="9" fill="#d7a93f" opacity="0.18" filter="url(#heroBlur)" />
      <circle cx="242" cy="36" r="10" fill="#8eafbf" opacity="0.2" filter="url(#heroBlur)" />
      <circle cx="78" cy="96" r="14" fill="#ffffff" opacity="0.55" filter="url(#heroBlur)" />

      <g transform="translate(44 38)">
        <path d="M22 29c0 16-11 27-24 27S-26 45-26 29-15 0-2 0s24 13 24 29Z" fill="url(#balloonLight)" />
        <path d="M56 18c0 17-11 29-25 29S6 35 6 18 17 -10 31 -10s25 11 25 28Z" fill="url(#balloonDark)" />
        <ellipse cx="-8" cy="18" rx="5" ry="8" fill="#ffffff" opacity="0.3" />
        <ellipse cx="25" cy="6" rx="5" ry="8" fill="#ffffff" opacity="0.26" />
        <path d="M-2 56c6 13 3 20 1 29" fill="none" stroke="#6b8ca0" strokeWidth="2" strokeLinecap="round" />
        <path d="M31 47c5 12 1 22 6 34" fill="none" stroke="#315e75" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 58c6 2 9 6 12 11" fill="none" stroke="#9fb6c2" strokeWidth="1.6" strokeLinecap="round" />
      </g>

      <g filter="url(#heroSoftShadow)" transform="translate(106 57) rotate(-4)">
        <rect x="0" y="0" width="62" height="42" rx="12" fill="url(#giftBox)" />
        <rect x="0" y="0" width="62" height="14" rx="10" fill="#f8fbfc" />
        <rect x="26" y="0" width="10" height="42" rx="4" fill="#022842" opacity="0.92" />
        <rect x="0" y="11" width="62" height="6" fill="#7d9cad" opacity="0.88" />
        <path d="M31 2C16 -7 16 -18 25 -16c6 1 8 9 6 18Z" fill="#86a5b4" />
        <path d="M31 2c15-9 15-20 6-18-6 1-8 9-6 18Z" fill="#5e8193" />
      </g>

      <g filter="url(#heroSoftShadow)" transform="translate(170 46)">
        <ellipse cx="43" cy="63" rx="46" ry="9" fill="#83a0af" opacity="0.18" />
        <rect x="12" y="52" width="62" height="10" rx="5" fill="url(#cakePlate)" />
        <rect x="39" y="43" width="8" height="12" rx="4" fill="#adc1cb" />
        <rect x="0" y="17" width="86" height="37" rx="16" fill="url(#cakeBase)" />
        <path
          d="M0 20c0-10 8-18 18-18h50c10 0 18 8 18 18v7c-6 0-6 8-12 8s-6-8-12-8-6 8-13 8-6-8-12-8-6 8-12 8-6-8-12-8S6 35 0 35v-15Z"
          fill="#ffffff"
          opacity="0.97"
        />
        {[19, 43, 67].map((x) => (
          <g key={x}>
            <rect x={x - 2.5} y="-4" width="5" height="24" rx="2.5" fill="#dce8ed" />
            <path d={`M${x - 2.5} 1l5 4M${x - 2.5} 9l5 4`} stroke="#688ea2" strokeWidth="1.7" />
            <path d={`M${x} -7c-5-6-2-12 0-15 4 4 7 10 0 15Z`} fill="url(#flameGlow)" />
          </g>
        ))}
      </g>

      <g opacity="0.95">
        <path d="M235 64c7 4 10 11 10 19" fill="none" stroke="#7f9fb0" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M243 60c9 5 14 13 14 24" fill="none" stroke="#9ab3bf" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M231 80c5-1 9 1 14 6" fill="none" stroke="#d7a93f" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      </g>

      {[
        ['M72 46l2.8 5.6L80 54l-5.2 2.4-2.8 5.6-2.8-5.6L64 54l5.2-2.4Z', '#d7a93f'],
        ['M205 24l2.2 4.5 4.8 2.1-4.8 2.1-2.2 4.5-2.2-4.5-4.8-2.1 4.8-2.1Z', '#7d9cad'],
        ['M226 48l1.8 3.6 3.8 1.8-3.8 1.8-1.8 3.6-1.8-3.6-3.8-1.8 3.8-1.8Z', '#d7a93f'],
      ].map(([d, fill], index) => (
        <path key={index} d={d} fill={fill} opacity="0.92" />
      ))}

      <circle cx="92" cy="25" r="2.6" fill="#87a4b4" />
      <circle cx="152" cy="35" r="2.4" fill="#d7a93f" />
      <circle cx="224" cy="92" r="2.5" fill="#87a4b4" />
    </svg>
  );
}

function PersonAvatar({ personel }) {
  const [fotoHatali, setFotoHatali] = useState(false);
  const fotoGoster = Boolean(personel.foto) && !fotoHatali;

  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(2,40,66,0.10)] ring-1 ring-[#cfdee5]">
      <div className="absolute inset-[5px] rounded-full bg-gradient-to-br from-[#f8fbfc] to-[#edf4f6]" />
      {fotoGoster ? (
        <img
          src={personel.foto}
          alt={personel.ad_soyad}
          className="relative z-10 h-[50px] w-[50px] rounded-full object-cover"
          onError={() => setFotoHatali(true)}
        />
      ) : (
        <span className="relative z-10 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-br from-[#174a64] to-[#022842] text-[14px] font-black tracking-wide text-white">
          {basHarfler(personel.ad_soyad)}
        </span>
      )}
    </div>
  );
}

export default function DogumGunu() {
  const [scope, setScope] = useState('month');
  const [query, setQuery] = useState('');
  const [veri, setVeri] = useState({ kayitlar: [], toplam: 0, tarih: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const aramaRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const gecikme = setTimeout(() => {
      fetchDogumGunleri(scope, query)
        .then((data) => {
          if (cancelled) return;
          setVeri({
            kayitlar: data?.kayitlar ?? [],
            toplam: data?.toplam ?? 0,
            tarih: data?.tarih ?? '',
          });
          setError(null);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err?.message || 'Doğum günü bilgileri yüklenemedi.');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(gecikme);
    };
  }, [scope, query]);

  const bugun = useMemo(() => tarihParcala(veri.tarih), [veri.tarih]);

  return (
    <Layout>
      <section className="relative overflow-hidden rounded-[24px] border border-[#d8e4e9] bg-[linear-gradient(135deg,#ffffff_0%,#f6f9fa_55%,#edf3f5_100%)] px-5 py-4 shadow-[0_12px_32px_rgba(2,40,66,0.08)] sm:px-6 sm:py-5 lg:px-8 lg:py-5">
        <span className="pointer-events-none absolute right-[42%] top-7 h-2 w-1.5 rotate-[18deg] rounded-sm bg-[#d7a93f] opacity-70" />
        <span className="pointer-events-none absolute right-[35%] top-[76px] h-2 w-2 rotate-45 rounded-sm bg-[#89aabb] opacity-70" />
        <span className="pointer-events-none absolute right-[29%] top-8 h-1.5 w-1.5 rotate-45 rounded-sm bg-[#d7e5ea]" />

        <header className="relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#174a64] to-[#022842] shadow-[0_8px_18px_rgba(2,40,66,0.20)] sm:h-14 sm:w-14">
                <i
                  className="fas fa-cake-candles text-[22px] text-white sm:text-[24px]"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <h1 className="m-0 truncate text-[26px] font-black leading-tight tracking-[-0.03em] text-[#022842] sm:text-[31px]">
                  Doğum Günü Bilgisi
                </h1>
                <p className="mt-0.5 text-[13px] font-medium text-[#5c6f7a] sm:text-[14px]">
                  Personelimizin doğum günü listesi
                </p>
              </div>
            </div>

            <div className="hidden shrink-0 lg:block">
              <MiniBirthdayIllustration />
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[auto_minmax(280px,410px)] lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Doğum günü kapsamı">
              {KAPSAMLAR.map((item) => {
                const aktif = scope === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    aria-selected={aktif}
                    onClick={() => setScope(item.value)}
                    className={`inline-flex h-11 min-w-[102px] items-center justify-center gap-2 rounded-[13px] px-4 text-[14px] font-bold transition duration-200 ${
                      aktif
                        ? 'bg-gradient-to-r from-[#174a64] to-[#022842] text-white shadow-[0_7px_16px_rgba(2,40,66,0.23)]'
                        : 'border border-[#d2dfe5] bg-white/95 text-[#022842] shadow-none hover:border-[#aebfc8] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${aktif ? 'text-white' : 'text-[#022842]'}`}
                      aria-hidden="true"
                    >
                      calendar_month
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="flex h-11 w-full items-center rounded-[13px] border border-[#c7d7de] bg-white/95 px-4 shadow-[0_2px_8px_rgba(2,40,66,0.04)] focus-within:border-[#7f9faf] focus-within:ring-2 focus-within:ring-[#dbe8ed]">
              <button
                type="button"
                onClick={() => aramaRef.current?.focus()}
                className="mr-2 flex shrink-0 items-center text-[#7a8b94] hover:text-[#022842]"
                aria-label="Arama kutusuna odaklan"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  search
                </span>
              </button>

              <input
                ref={aramaRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="İsim veya soyisim ile ara..."
                className="h-full w-full border-0 bg-transparent text-[14px] font-medium text-[#022842] outline-none placeholder:font-normal placeholder:text-[#8b9aa2]"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    aramaRef.current?.focus();
                  }}
                  className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf3f5] text-[#657984] hover:bg-[#e3ecef] hover:text-[#022842]"
                  aria-label="Aramayı temizle"
                >
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    close
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="relative z-10 mt-5">
          {!loading && !error && (
            <div className="mb-4 flex items-center">
              <span className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-[#d2dfe5] bg-white/80 px-3.5 text-[13px] font-bold text-[#526b78]">
                <span className="material-symbols-outlined text-[18px] text-[#6f93a5]" aria-hidden="true">
                  group
                </span>
                {veri.toplam} kişi
              </span>
            </div>
          )}
          {loading && (
            <div className="rounded-2xl border border-white bg-white/90 p-7 text-center text-[#60747f] shadow-sm">
              <span className="material-symbols-outlined mb-1.5 animate-spin text-[28px] text-[#022842]" aria-hidden="true">
                progress_activity
              </span>
              <p className="m-0 text-[13px] font-semibold">Doğum günü bilgileri yükleniyor…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-[13px] font-medium text-red-700">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && veri.kayitlar.length === 0 && (
            <div className="rounded-2xl border border-white bg-white/90 p-7 text-center shadow-sm">
              <span className="material-symbols-outlined mb-1.5 text-[32px] text-[#8a9aa2]" aria-hidden="true">
                event_busy
              </span>
              <p className="m-0 text-[13px] font-bold text-[#334f5d]">
                Seçilen kapsamda doğum günü kaydı bulunamadı.
              </p>
            </div>
          )}

          {!loading && !error && veri.kayitlar.length > 0 && (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {veri.kayitlar.map((personel) => {
                const kalanGun = kalanGunHesapla(personel, bugun);
                const bugunMu = kalanGun === 0;
                const yakinda = kalanGun !== null && kalanGun > 0 && kalanGun <= 7;
                const kalanGunMetni = bugunMu
                  ? 'Bugün'
                  : kalanGun === 1
                    ? 'Yarın'
                    : kalanGun !== null
                      ? `${kalanGun} gün kaldı`
                      : null;

                return (
                  <article
                    key={personel.id}
                    className="group relative min-h-[118px] overflow-hidden rounded-[18px] border border-[#cfdee5] bg-white/95 px-5 py-4 shadow-[0_4px_14px_rgba(2,40,66,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-[#9fb6c1] hover:shadow-[0_7px_18px_rgba(2,40,66,0.10)]"
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(111,147,165,0.08),rgba(255,255,255,0)_72%)]" />

                    <div className="relative z-10 flex min-h-[84px] items-center gap-4">
                      <PersonAvatar personel={personel} />

                      <div className="min-w-0 flex-1">
                        <h2 className="m-0 truncate text-[18px] font-black tracking-[-0.02em] text-[#022842] sm:text-[19px]">
                          {adSoyadDuzenle(personel.ad_soyad)}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] font-semibold text-[#60747f] sm:text-[14px]">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-[#315e75]" aria-hidden="true">
                              cake
                            </span>
                            {personel.tarih_metni}
                          </span>

                          {kalanGunMetni && (
                            <>
                              <span className="text-[#aebdc4]" aria-hidden="true">·</span>
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${
                                  bugunMu || yakinda
                                    ? 'border-[#efd38d] bg-[#fff7dc] text-[#8a6505]'
                                    : 'border-[#bfd3dc] bg-[#edf5f8] text-[#315e75]'
                                }`}
                              >
                                {kalanGunMetni}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </section>
    </Layout>
  );
}