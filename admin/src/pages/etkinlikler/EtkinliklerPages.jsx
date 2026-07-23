import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listEtkinlikler,
  deleteEtkinlik,
  createEtkinlik,
  getEtkinlik,
  updateEtkinlik,
} from '../../api/client';
import usePageTitle from '../../hooks/usePageTitle';
import { BRAND_IMG } from '../../constants';
import ImagePickerField from '../../components/ImagePickerField';
import AdminRowActions from '../../components/AdminRowActions';
import AdminAlert from '../../components/AdminAlert';

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('tr-TR');
  } catch {
    return value;
  }
}

export function EtkinliklerIndex() {
  usePageTitle('Etkinlikler');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listEtkinlikler()
      .then((data) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDelete = async (id) => {
    if (!window.confirm('Bu etkinliği silmek istiyor musunuz?')) return;
    try {
      await deleteEtkinlik(id);
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-calendar-check" aria-hidden="true" />
            Etkinlikler
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to="/admin/etkinlikler/ekle" className="admin-btn admin-btn-primary">
            <i className="fas fa-plus" aria-hidden="true" /> Yeni Etkinlik
          </Link>
        </div>
      </header>

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
                <th>#</th>
                <th>Görsel</th>
                <th>Etkinlik</th>
                <th>Tarih</th>
                <th>Durum</th>
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
                    Henüz etkinlik yok. Yeni kayıt ekleyin.
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="admin-td-index">{index + 1}</td>
                  <td className="admin-td-media">
                    <img
                      className="thumb"
                      src={row.resim_url || BRAND_IMG}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = BRAND_IMG;
                      }}
                    />
                  </td>
                  <td>
                    <div className="admin-row-title">{row.baslik}</div>
                  </td>
                  <td>
                    <div>{formatDate(row.tarih)}</div>
                    {row.bitis_tarihi && (
                      <div className="admin-row-meta">→ {formatDate(row.bitis_tarihi)}</div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`admin-badge-status ${
                        row.durum === 'aktif' ? 'is-aktif' : 'is-pasif'
                      }`}
                    >
                      {row.durum || '—'}
                    </span>
                  </td>
                  <td>
                    <AdminRowActions
                      editTo={`/admin/etkinlikler/${row.id}/duzenle`}
                      onDelete={() => onDelete(row.id)}
                    />
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

function EtkinlikForm({ mode, initial, onSubmit, busy, err, msg, onClearMsg, onClearErr }) {
  const [baslik, setBaslik] = useState(initial?.baslik || '');
  const [aciklama, setAciklama] = useState(initial?.aciklama || '');
  const [tarih, setTarih] = useState(initial?.tarih || '');
  const [bitis, setBitis] = useState(initial?.bitis_tarihi || '');
  const [resim, setResim] = useState(initial?.resim || '');
  const [durum, setDurum] = useState(initial?.durum || 'aktif');
  const [view, setView] = useState(initial?.view ?? 0);

  useEffect(() => {
    setBaslik(initial?.baslik || '');
    setAciklama(initial?.aciklama || '');
    setTarih(initial?.tarih || '');
    setBitis(initial?.bitis_tarihi || '');
    setResim(initial?.resim || '');
    setDurum(initial?.durum || 'aktif');
    setView(initial?.view ?? 0);
  }, [initial]);

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-calendar-check" aria-hidden="true" />
            {mode === 'edit' ? 'Etkinlik düzenle' : 'Yeni etkinlik'}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to="/admin/etkinlikler" className="admin-btn admin-btn-secondary">
            <i className="fas fa-arrow-left" aria-hidden="true" /> Listeye dön
          </Link>
        </div>
      </header>

      <div className="admin-crud-form-shell">
        <div className="admin-card">
          <div className="admin-card-body">
            {msg && (
              <AdminAlert key={`ok-${msg}`} type="success" onClose={onClearMsg}>
                {msg}
              </AdminAlert>
            )}
            {err && (
              <AdminAlert key={`err-${err}`} type="danger" onClose={onClearErr}>
                {err}
              </AdminAlert>
            )}
            <form
              className="admin-form admin-form--grid"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                  baslik,
                  aciklama: aciklama || null,
                  tarih,
                  bitis_tarihi: bitis || null,
                  resim: resim || null,
                  durum,
                  view: Number(view) || 0,
                });
              }}
            >
              <div className="admin-form__main">
                <label>
                  Başlık
                  <input value={baslik} onChange={(e) => setBaslik(e.target.value)} required />
                </label>
                <label>
                  Açıklama
                  <textarea
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    rows={6}
                  />
                </label>
                <div className="admin-form__row-2">
                  <label>
                    Başlangıç tarihi
                    <input
                      type="date"
                      value={tarih || ''}
                      onChange={(e) => setTarih(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Bitiş tarihi
                    <input
                      type="date"
                      value={bitis || ''}
                      onChange={(e) => setBitis(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="admin-form__side">
                <ImagePickerField value={resim} onChange={setResim} label="Resim" />
                <div className="admin-form__row-2">
                  <label>
                    Durum
                    <select value={durum} onChange={(e) => setDurum(e.target.value)}>
                      <option value="aktif">Aktif</option>
                      <option value="pasif">Pasif</option>
                    </select>
                  </label>
                  <label>
                    Görüntülenme
                    <input
                      type="number"
                      min="0"
                      value={view}
                      onChange={(e) => setView(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="admin-form__actions admin-form__span-2">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to="/admin/etkinlikler" className="admin-btn admin-btn-secondary">
                  İptal
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EtkinliklerEkle() {
  usePageTitle('Etkinlik Ekle');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  return (
    <EtkinlikForm
      mode="create"
      busy={busy}
      err={err}
      msg={msg}
      onClearMsg={() => setMsg('')}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        setMsg('');
        try {
          await createEtkinlik(payload);
          navigate('/admin/etkinlikler');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function EtkinliklerDuzenle() {
  usePageTitle('Etkinlik Düzenle');
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getEtkinlik(id)
      .then(setInitial)
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;

  return (
    <EtkinlikForm
      mode="edit"
      initial={initial}
      busy={busy}
      err={err}
      msg={msg}
      onClearMsg={() => setMsg('')}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        setMsg('');
        try {
          await updateEtkinlik(id, payload);
          setMsg('Kayıt başarıyla güncellendi.');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}
