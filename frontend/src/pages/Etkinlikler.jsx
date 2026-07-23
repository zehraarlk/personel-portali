import { useEffect, useState } from 'react';
import { fetchEtkinlikler } from '../api/client';
import Layout from '../components/Layout';
import '../styles/etkinlikler.css';

function formatTarih(iso) {
  const d = new Date(iso);
  return {
    gun: d.toLocaleDateString('tr-TR', { day: '2-digit' }),
    ay: d.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', ''),
    tam: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
  };
}

export default function Etkinlikler() {
  const [durumlar, setDurumlar] = useState([]);
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [activeDurum, setActiveDurum] = useState(null); // null = Tümü
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEtkinlikler(activeDurum)
      .then((data) => {
        if (cancelled) return;
        setDurumlar(data.durumlar ?? []);
        setEtkinlikler(data.etkinlikler ?? []);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError('Etkinlikler yüklenirken bir sorun oluştu.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeDurum]);

  return (
    <Layout>
      <div className="etkinlikler-page">
        <div className="etkinlikler-header">
          <h1>Etkinlikler</h1>
          <p>Gebze Belediyesi tarafından düzenlenen güncel ve yaklaşan etkinlikler.</p>
        </div>

        {durumlar.length > 0 && (
          <div className="etkinlikler-tabs">
            <button
              type="button"
              className={`etkinlikler-tab${activeDurum === null ? ' is-active' : ''}`}
              onClick={() => setActiveDurum(null)}
            >
              Tümü
            </button>
            {durumlar.map((d) => (
              <button
                key={d.slug}
                type="button"
                className={`etkinlikler-tab${activeDurum === d.slug ? ' is-active' : ''}`}
                onClick={() => setActiveDurum(d.slug)}
              >
                {d.ad}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="etkinlikler-state">Yükleniyor…</p>}
        {!loading && error && <p className="etkinlikler-state etkinlikler-state--error">{error}</p>}
        {!loading && !error && etkinlikler.length === 0 && (
          <p className="etkinlikler-state">Şu anda gösterilecek bir etkinlik yok.</p>
        )}

        {!loading && !error && etkinlikler.length > 0 && (
          <div className="etkinlikler-grid">
            {etkinlikler.map((e) => {
              const tarih = formatTarih(e.tarih);
              return (
                <article key={e.id} className="etkinlik-card">
                  <div className="etkinlik-card-media">
                    {e.resim ? (
                      <img src={e.resim} alt={e.baslik} />
                    ) : (
                      <div className="etkinlik-card-media--placeholder" />
                    )}
                    <div className="etkinlik-card-date">
                      <span className="etkinlik-card-date-gun">{tarih.gun}</span>
                      <span className="etkinlik-card-date-ay">{tarih.ay}</span>
                    </div>
                    {e.durum_ref && (
                      <span className="etkinlik-card-badge">{e.durum_ref}</span>
                    )}
                  </div>

                  <div className="etkinlik-card-body">
                    <h3 className="etkinlik-card-title">{e.baslik}</h3>

                    <p className="etkinlik-card-meta">
                      <i className="fas fa-calendar-day" aria-hidden="true" />
                      {tarih.tam}
                      {e.bitis_tarihi && ` – ${formatTarih(e.bitis_tarihi).tam}`}
                    </p>

                    {e.aciklama && <p className="etkinlik-card-desc">{e.aciklama}</p>}
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