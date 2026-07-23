import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminDashboard } from '../api/client';
import usePageTitle from '../hooks/usePageTitle';
import { BRAND_IMG } from '../constants';
import { ADMIN_QUICK_ACTIONS, ADMIN_STATS } from '../navConfig';

const TONES = ['tone-teal', 'tone-cyan', 'tone-orange', 'tone-rose', 'tone-amber', 'tone-indigo', 'tone-emerald', 'tone-sky'];

export default function Home() {
  usePageTitle('Dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminDashboard()
      .then(setData)
      .catch((ex) => setError(ex.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = data?.counts || {};

  if (loading) return <p className="admin-muted">Yükleniyor…</p>;
  if (error) return <div className="admin-alert admin-alert-danger">{error}</div>;

  return (
    <>
      <div className="admin-stats">
        {ADMIN_STATS.map((stat, i) => (
          <Link
            key={stat.key}
            to={stat.to}
            className={`admin-stat-card ${TONES[i % TONES.length]}`}
          >
            <div className="admin-stat-card__icon">
              <i className={stat.icon} aria-hidden="true" />
            </div>
            <div className="admin-stat-card__meta">
              <div className="admin-stat-card__value">{counts[stat.key] ?? 0}</div>
              <div className="admin-stat-card__label">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {data.dogum_gunleri?.length > 0 && (
        <div className="admin-card" style={{ marginBottom: '1rem' }}>
          <div className="admin-card-header">
            <h2>
              <i className="fas fa-birthday-cake" aria-hidden="true" /> Bugün doğum günü
            </h2>
          </div>
          <div className="admin-card-body">
            <ul className="admin-list-plain">
              {data.dogum_gunleri.map((p) => (
                <li key={p.id}>
                  <img
                    src={p.foto || BRAND_IMG}
                    alt=""
                    width={36}
                    height={36}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = BRAND_IMG;
                    }}
                  />
                  <strong>{p.ad_soyad}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <i className="fas fa-bolt" aria-hidden="true" /> Hızlı İşlemler
          </h2>
        </div>
        <div className="admin-card-body">
          <div className="admin-quick-links">
            {ADMIN_QUICK_ACTIONS.map((action, i) => (
              <Link
                key={action.key}
                to={action.to}
                className={`admin-quick-link ${TONES[i % TONES.length]}`}
              >
                <span className="admin-quick-link__icon">
                  <i className={action.icon} aria-hidden="true" />
                </span>
                <span className="admin-quick-link__text">
                  <strong>{action.label}</strong>
                  <small>{action.desc}</small>
                </span>
                <i className="fas fa-chevron-right admin-quick-link__arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
