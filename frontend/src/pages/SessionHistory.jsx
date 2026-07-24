import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchProfileSessions } from '../api/client';
import '../styles/profil.css';

function formatTs(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('tr-TR');
  } catch {
    return value;
  }
}

export default function SessionHistory() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileSessions()
      .then((data) => setRows((data.oturumlar || []).slice(0, 10)))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="profil-page">
        <Link to="/" className="profil-back">
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Ana sayfa
        </Link>

        <header className="profil-head">
          <span className="profil-head__icon" aria-hidden="true">
            <i className="fas fa-history" />
          </span>
          <div className="profil-head__text">
            <h1>Oturum Kayıtları</h1>
            <p>Son giriş ve çıkışlarınızın özeti. En fazla 10 kayıt listelenir.</p>
          </div>
        </header>

        {loading && <p className="profil-state">Yükleniyor…</p>}
        {err && <p className="profil-alert profil-alert--error">{err}</p>}

        {!loading && !err && (
          <div className="profil-card">
            <div className="profil-table-wrap">
              <table className="profil-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Giriş</th>
                    <th>Çıkış</th>
                    <th>IP</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="profil-empty">
                        Kayıt yok.
                      </td>
                    </tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.id}</td>
                      <td>{formatTs(r.giris_zamani)}</td>
                      <td>{formatTs(r.cikis_zamani)}</td>
                      <td className="mono">{r.ip_adresi || '—'}</td>
                      <td>
                        {r.aktif ? (
                          <span className="profil-chip">Açık</span>
                        ) : (
                          <span className="profil-muted">{r.kapanis_tipi || 'Kapalı'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
