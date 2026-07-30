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
      <div className="w-full">
        <div className="mb-5 flex items-center gap-3">
          <span
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl"
            style={{ background: '#022842', boxShadow: '0 4px 12px rgba(2, 40, 66, 0.18)' }}
          >
            <i className="fas fa-cake-candles text-[17px] text-white" aria-hidden="true" />
          </span>
          <div>
            <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-tight text-[#022842]">
              Doğum Günü Bilgisi
            </h1>
            <p className="m-0 text-[13px] text-[#5b6b78]">
              Personelimizin doğum günü listesi
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    aktif
                      ? 'bg-[#022842] text-white shadow-sm'
                      : 'border border-[#022842]/10 bg-white text-[#334b5c] hover:bg-[#f4f7f9]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex h-[42px] w-full items-center gap-2 rounded-xl border border-[#022842]/10 bg-white px-3.5 shadow-sm lg:max-w-[340px]">
            <button
              type="button"
              onClick={() => aramaRef.current?.focus()}
              className="flex items-center"
              aria-label="Arama kutusuna odaklan"
            >
              <span className="material-symbols-outlined text-[17px] text-[#9aa5ad]">search</span>
            </button>
            <input
              ref={aramaRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="İsim veya soyisim ile ara…"
              className="w-full border-0 bg-transparent text-sm text-[#0b1c30] outline-none placeholder:text-[#9aa5ad]"
            />
          </div>
        </div>

        {!loading && !error && (
          <div className="mb-4 text-sm text-[#5b6b78]">
            <strong className="text-[#022842]">{veri.toplam}</strong> kayıt bulundu.
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-[#022842]/10 bg-white p-10 text-center text-sm text-[#5b6b78] shadow-sm">
            <span className="material-symbols-outlined mb-2 animate-spin text-[28px] text-[#022842]">
              progress_activity
            </span>
            <p className="m-0">Doğum günü bilgileri yükleniyor…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && veri.kayitlar.length === 0 && (
          <div className="rounded-2xl border border-[#022842]/10 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined mb-2 text-[34px] text-[#9aa5ad]">event_busy</span>
            <p className="m-0 text-sm font-semibold text-[#334b5c]">
              Seçilen kapsamda doğum günü kaydı bulunamadı.
            </p>
          </div>
        )}

        {!loading && !error && veri.kayitlar.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {veri.kayitlar.map((personel) => {
              const bugunMu = personel.gun === bugun.gun && personel.ay === bugun.ay;

              return (
                <article
                  key={personel.id}
                  className="relative overflow-hidden rounded-2xl border border-[#022842]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {bugunMu && (
                    <span className="absolute right-4 top-4 rounded-full bg-[#fff3cd] px-2.5 py-1 text-[11px] font-bold text-[#8a6500]">
                      Bugün
                    </span>
                  )}

                  <div className="flex items-center gap-4 pr-14">
                    {personel.foto ? (
                      <img
                        src={personel.foto}
                        alt={personel.ad_soyad}
                        className="h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                          event.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}

                    <div
                      className={`${personel.foto ? 'hidden' : ''} flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e8eef2] text-lg font-extrabold text-[#022842]`}
                      aria-hidden="true"
                    >
                      {basHarfler(personel.ad_soyad)}
                    </div>

                    <div className="min-w-0">
                      <h2 className="m-0 truncate text-[16px] font-extrabold text-[#022842]">
                        {personel.ad_soyad}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#5b6b78]">
                        <span className="material-symbols-outlined text-[17px] text-[#d49a00]">
                          celebration
                        </span>
                        {personel.tarih_metni}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}