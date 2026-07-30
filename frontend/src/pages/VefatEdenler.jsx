import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchVefat } from '../api/client';

export default function VefatEdenler() {
  const [vefatlar, setVefatlar] = useState([]);
  const [query, setQuery] = useState('');
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

  return (
    <Layout>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3a3a3a]">
            <i className="fas fa-ribbon text-[17px] text-white" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-[#022842]">Vefat Edenler</h1>
            <p className="text-sm text-[#5b6b78]">Personelimizin ve yakınlarının vefat duyuruları</p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#022842]/10 bg-white px-3.5 py-2.5 shadow-sm">
          <span className="material-symbols-outlined text-[17px] text-[#9aa5ad]">search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim ara…"
            className="w-full border-0 bg-transparent text-sm text-[#0b1c30] outline-none placeholder:text-[#9aa5ad]"
          />
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

        {!loading && !error && vefatlar.length === 0 && (
          <div className="rounded-2xl border border-[#022842]/10 bg-white p-10 text-center shadow-sm">
            <i className="fas fa-ribbon mb-3 block text-3xl text-[#c7cdd2]" aria-hidden="true" />
            <p className="text-sm text-[#5b6b78]">Kayıt bulunamadı.</p>
          </div>
        )}

        {!loading && !error && vefatlar.length > 0 && (
          <div className="flex flex-col gap-3">
            {vefatlar.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border-l-4 border-l-[#5b6b78] border-y border-r border-y-[#022842]/10 border-r-[#022842]/10 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-base font-bold text-[#022842]">{v.vefat_eden_adi}</h2>
                  <span className="text-xs font-medium text-[#9aa5ad]">{v.vefat_tarihi_metin}</span>
                </div>
                {v.iliski_pozisyon && (
                  <p className="mb-2 text-xs font-medium text-[#5b6b78]">{v.iliski_pozisyon}</p>
                )}
                <p className="text-sm leading-6 text-[#33495a]">{v.cenaze_mesaji}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}