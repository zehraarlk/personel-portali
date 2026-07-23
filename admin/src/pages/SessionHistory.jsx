import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProfileSessions } from '../api/client';
import usePageTitle from '../hooks/usePageTitle';
import AdminAlert from '../components/AdminAlert';

function formatTs(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('tr-TR');
  } catch {
    return value;
  }
}

export default function SessionHistory() {
  usePageTitle('Oturum Kayıtları');
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
    <>
      {loading && <p className="admin-muted">Yükleniyor…</p>}
      {err && (
        <AdminAlert type="danger" onClose={() => setErr('')}>
          {err}
        </AdminAlert>
      )}
      {!loading && !err && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>
              <i className="fas fa-history" aria-hidden="true" /> Oturum kayıtları
            </h2>
            <Link to="/admin" className="admin-btn admin-btn-secondary admin-btn-sm">
              Dashboard
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
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
                    <td colSpan={5} className="admin-empty">
                      Kayıt yok.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{formatTs(r.giris_zamani)}</td>
                    <td>{formatTs(r.cikis_zamani)}</td>
                    <td>{r.ip_adresi || '—'}</td>
                    <td>
                      {r.aktif ? (
                        <span className="admin-chip">Açık</span>
                      ) : (
                        r.kapanis_tipi || 'Kapalı'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
