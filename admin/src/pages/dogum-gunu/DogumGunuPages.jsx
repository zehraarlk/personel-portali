import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDogumGunu } from '../../api/client';
import usePageTitle from '../../hooks/usePageTitle';
import { BRAND_IMG } from '../../constants';
import AdminAlert from '../../components/AdminAlert';

const SCOPES = [
  { id: 'today', label: 'Bugün' },
  { id: 'month', label: 'Bu ay' },
  { id: 'all', label: 'Tümü' },
];

function formatDogum(iso) {
  if (!iso) return '—';
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('tr-TR');
  } catch {
    return iso;
  }
}

function emptyMessage(scope) {
  if (scope === 'month') return 'Bu ay doğum günü olan personel bulunamadı.';
  if (scope === 'all') return 'Doğum tarihi kayıtlı personel bulunamadı.';
  return 'Bugün doğum günü olan personel bulunmamaktadır.';
}

export function DogumGunuIndex() {
  usePageTitle('Doğum Günü Bilgisi');
  const [scope, setScope] = useState('today');
  const [rows, setRows] = useState([]);
  const [tarihTr, setTarihTr] = useState('');
  const [toplam, setToplam] = useState(0);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr('');
    listDogumGunu(scope)
      .then((data) => {
        if (cancelled) return;
        setRows(Array.isArray(data?.kayitlar) ? data.kayitlar : []);
        setToplam(Number(data?.toplam) || 0);
        setTarihTr(data?.tarih_tr || '');
      })
      .catch((ex) => {
        if (!cancelled) setErr(ex.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope]);

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-birthday-cake" aria-hidden="true" />
            Doğum Günü Bilgisi
          </h2>
          {tarihTr && <p>{tarihTr}</p>}
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            {scope === 'today' ? 'Bugün' : scope === 'month' ? 'Bu ay' : 'Toplam'}{' '}
            <strong>{toplam}</strong>
          </span>
          <Link to="/admin/personeller/ekle" className="admin-btn admin-btn-primary">
            <i className="fas fa-user-plus" aria-hidden="true" /> Yeni Personel
          </Link>
        </div>
      </header>

      <div className="admin-dg-toolbar">
        <label className="admin-dg-toolbar__filter" htmlFor="dg-scope-filter">
          <span className="admin-yl-toolbar__label">
            <i className="fas fa-filter" aria-hidden="true" />
            Filtre
          </span>
          <select
            id="dg-scope-filter"
            className="admin-toolbar-select"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            aria-label="Doğum günü filtresi"
          >
            {SCOPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <Link to="/admin/personeller" className="admin-btn admin-btn-secondary admin-btn-sm">
          <i className="fas fa-users" aria-hidden="true" /> Personeller
        </Link>
      </div>

      {err && (
        <AdminAlert type="danger" onClose={() => setErr('')}>
          {err}
        </AdminAlert>
      )}

      <div className="admin-card admin-card--flush">
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--crud">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Ad Soyad</th>
                <th>Sicil</th>
                <th>E-posta</th>
                <th>Doğum Tarihi</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    {emptyMessage(scope)}
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="admin-td-media">
                      <img
                        className="thumb"
                        src={row.foto || BRAND_IMG}
                        alt=""
                        style={{ width: 40, height: 40, borderRadius: '50%' }}
                        onError={(e) => {
                          e.currentTarget.src = BRAND_IMG;
                        }}
                      />
                    </td>
                    <td>
                      <div className="admin-row-title">{row.ad_soyad}</div>
                    </td>
                    <td>{row.sicil_no || '—'}</td>
                    <td>{row.email || '—'}</td>
                    <td>{formatDogum(row.dogum_tarihi)}</td>
                    <td>
                      <Link
                        to={`/admin/personeller/${row.id}/duzenle`}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        title="Personeli düzenle"
                      >
                        <i className="fas fa-pen" aria-hidden="true" /> Düzenle
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
