import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { fetchVefat } from '../api/client';

const SAYFA_BASI = 6;

function mesajiAyikla(mesaj) {
  if (!mesaj) return { giris: null, cenaze: null, irtibat: null };

  const irtibatMatch = mesaj.match(/İrtibat\s*:?/i);
  let govde = mesaj;
  let irtibat = null;

  if (irtibatMatch) {
    govde = mesaj.slice(0, irtibatMatch.index).trim();
    irtibat = mesaj.slice(irtibatMatch.index + irtibatMatch[0].length).trim() || null;
  }

  const cenazeMatch = govde.match(/\bCenaze(si)?\b[\s\S]*/i);
  let giris = null;
  let cenaze = null;

  if (cenazeMatch && cenazeMatch.index > 0) {
    giris = govde.slice(0, cenazeMatch.index).trim() || null;
    cenaze = govde.slice(cenazeMatch.index).trim() || null;
  } else if (cenazeMatch) {
    cenaze = govde.trim() || null;
  } else {
    giris = govde.trim() || null;
  }

  return { giris, cenaze, irtibat };
}

export default function VefatEdenler() {
  const [vefatlar, setVefatlar] = useState([]);
  const [query, setQuery] = useState('');
  const [seciliYil, setSeciliYil] = useState('tumu');
  const [sayfa, setSayfa] = useState(0);
  const aramaInputRef = useRef(null);
  const yilSelectRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const gecikme = setTimeout(() => {
      fetchVefat(query.trim())
        .then((data) => {
          if (cancelled) return;
          setVefatlar(data?.vefatlar ?? []);
          setError(null);
        })
        .catch(() => {
          if (!cancelled) setError('Vefat bilgileri yüklenirken bir sorun oluştu.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(gecikme);
    };
  }, [query]);

  useEffect(() => {
    setSayfa(0);
  }, [query, seciliYil]);

  const yillar = useMemo(() => {
    const set = new Set(vefatlar.map((v) => new Date(v.vefat_tarihi).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [vefatlar]);

  const siraliVefatlar = useMemo(() => {
    let liste = [...vefatlar];
    if (seciliYil !== 'tumu') {
      liste = liste.filter((v) => new Date(v.vefat_tarihi).getFullYear() === Number(seciliYil));
    }
    liste.sort((a, b) => new Date(b.vefat_tarihi) - new Date(a.vefat_tarihi));
    return liste;
  }, [vefatlar, seciliYil]);

  const toplamSayfa = Math.max(1, Math.ceil(siraliVefatlar.length / SAYFA_BASI));
  const gosterilenler = siraliVefatlar.slice(sayfa * SAYFA_BASI, sayfa * SAYFA_BASI + SAYFA_BASI);
  const sayfaNumaralari = Array.from({ length: toplamSayfa }, (_, i) => i);

  function sayfaAyarla(n) {
    setSayfa(n);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  return (
    <Layout>
      <div className="w-full">
        <div className="mb-4 flex items-center gap-3">
          <span
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl"
            style={{ background: '#022842', boxShadow: '0 4px 12px rgba(2, 40, 66, 0.18)' }}
          >
            <i className="fas fa-ribbon text-[17px] text-white" aria-hidden="true" />
          </span>
          <div>
            <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-tight text-[#022842]">
              Vefat Edenler
            </h1>
            <p className="m-0 text-[13px] text-[#5b6b78]">
              Personelimizin ve yakınlarının vefat duyuruları
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex h-[42px] items-center gap-2 rounded-xl border border-[#022842]/10 bg-white px-3.5 shadow-sm">
            <button
              type="button"
              onClick={() => aramaInputRef.current?.focus()}
              className="flex items-center"
              aria-label="Arama kutusuna odaklan"
            >
              <span className="material-symbols-outlined text-[17px] text-[#9aa5ad]">search</span>
            </button>
            <input
              ref={aramaInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsim veya soyisim ile ara…"
              className="w-full border-0 bg-transparent text-sm text-[#0b1c30] outline-none placeholder:text-[#9aa5ad]"
            />
          </div>

          <div className="flex items-center justify-end">
            <div className="flex h-[42px] w-fit items-center gap-2 rounded-xl border border-[#022842]/10 bg-white px-3.5 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  yilSelectRef.current?.focus();
                  yilSelectRef.current?.click();
                }}
                className="flex items-center"
                aria-label="Yıl menüsünü aç"
              >
                <span className="material-symbols-outlined text-[17px] text-[#9aa5ad]">calendar_month</span>
              </button>
              <select
                ref={yilSelectRef}
                value={seciliYil}
                onChange={(e) => setSeciliYil(e.target.value)}
                className="border-0 bg-transparent text-sm font-semibold text-[#022842] outline-none"
              >
                <option value="tumu">Tüm Yıllar</option>
                {yillar.map((yil) => (
                  <option key={yil} value={yil}>
                    {yil}
                  </option>
                ))}
              </select>
            </div>
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

        {!loading && error && (
          <div className="rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">
            {error}
          </div>
        )}

        {!loading && !error && gosterilenler.length === 0 && (
          <div className="rounded-2xl border border-[#022842]/10 bg-white p-10 text-center shadow-sm">
            <i className="fas fa-ribbon mb-3 block text-3xl text-[#c7cdd2]" aria-hidden="true" />
            <p className="text-sm text-[#5b6b78]">Kayıt bulunamadı.</p>
          </div>
        )}

        {!loading && !error && gosterilenler.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {gosterilenler.map((v) => {
                const { giris, cenaze, irtibat } = mesajiAyikla(v.cenaze_mesaji);
                return (
                  <div
                    key={v.id}
                    className="flex overflow-hidden rounded-xl border border-[#022842]/10 bg-white shadow-sm"
                  >
                    <div
                      className="flex w-24 shrink-0 flex-col items-center justify-center gap-2 px-3 py-4 text-center"
                      style={{
                        background: 'linear-gradient(to bottom, #022842 0%, #134a6e 50%, #022842 100%)',
                      }}
                    >
                      <i className="fas fa-ribbon text-[22px] text-white" aria-hidden="true" />
                      <span className="text-[10px] font-semibold leading-tight text-white/90">
                        {v.vefat_tarihi_metin}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-sm font-bold text-[#022842]">{v.vefat_eden_adi}</p>
                      {v.iliski_pozisyon && (
                        <span className="mt-1 inline-block w-fit rounded-full bg-[#f4f7fa] px-2.5 py-0.5 text-[11px] font-medium text-[#5b6b78]">
                          {v.iliski_pozisyon}
                        </span>
                      )}

                      {giris && (
                        <p className="mt-2.5 text-xs leading-6 text-[#536575]">{giris}</p>
                      )}

                      {cenaze && (
                        <div className="mt-2.5 flex items-start gap-2">
                          <span className="material-symbols-outlined mt-0.5 text-[16px] text-[#a16207]">
                            location_on
                          </span>
                          <div>
                            <p className="text-[11px] font-bold text-[#022842]">Cenaze</p>
                            <p className="mt-0.5 text-xs leading-6 text-[#536575]">{cenaze}</p>
                          </div>
                        </div>
                      )}

                      {irtibat && (
                        <div className="mt-2.5 flex items-start gap-2 border-t border-[#022842]/8 pt-2.5">
                          <span className="material-symbols-outlined mt-0.5 text-[16px] text-[#a16207]">
                            call
                          </span>
                          <div>
                            <p className="text-[11px] font-bold text-[#022842]">İletişim</p>
                            <p className="mt-0.5 text-xs leading-6 text-[#536575]">{irtibat}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {toplamSayfa > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => sayfaAyarla(Math.max(0, sayfa - 1))}
                  disabled={sayfa === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#022842]/10 bg-white shadow-sm disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#5b6b78]">chevron_left</span>
                </button>
                {sayfaNumaralari.map((n) => (
                  <button
                    key={n}
                    onClick={() => sayfaAyarla(n)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shadow-sm ${
                      sayfa === n
                        ? 'bg-[#022842] text-white'
                        : 'border border-[#022842]/10 bg-white text-[#022842]'
                    }`}
                  >
                    {n + 1}
                  </button>
                ))}
                <button
                  onClick={() => sayfaAyarla(Math.min(toplamSayfa - 1, sayfa + 1))}
                  disabled={sayfa >= toplamSayfa - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#022842]/10 bg-white shadow-sm disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#5b6b78]">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}