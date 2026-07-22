import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchProfileSessions } from '../api/client';

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
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-4 inline-flex text-sm text-primary hover:underline">
          ← Ana sayfa
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-[#022842]">Oturum Kayıtları</h1>
        <p className="mb-6 text-sm text-on-surface-variant">
          oturum_kayitlari tablosundan son girişler.
        </p>

        {loading && <p className="text-sm text-on-surface-variant">Yükleniyor…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && !err && (
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/25 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-outline-variant/25 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Giriş</th>
                  <th className="px-4 py-3">Çıkış</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">
                      Kayıt yok.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-outline-variant/15 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatTs(r.giris_zamani)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatTs(r.cikis_zamani)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.ip_adresi || '—'}</td>
                    <td className="px-4 py-3">
                      {r.aktif ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                          Açık
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant">
                          {r.kapanis_tipi || 'Kapalı'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
