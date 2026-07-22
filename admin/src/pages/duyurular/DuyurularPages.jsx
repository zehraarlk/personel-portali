import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listDuyurular,
  deleteDuyuru,
  createDuyuru,
  getDuyuru,
  updateDuyuru,
} from '../../api/client';
import usePageTitle from '../../hooks/usePageTitle';
import { BRAND_IMG } from '../../constants';
import ImagePickerField from '../../components/ImagePickerField';
import AdminRowActions from '../../components/AdminRowActions';

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('tr-TR');
  } catch {
    return value;
  }
}

/** etkinlikler_duyurular (sayfa_tipi=duyuru) */
export function DuyurularIndex() {
  usePageTitle('Duyurular');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listDuyurular()
      .then((data) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDelete = async (rowId) => {
    if (!window.confirm('Bu duyuruyu silmek istiyor musunuz?')) return;
    try {
      await deleteDuyuru(rowId);
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
            <i className="fas fa-bullhorn" aria-hidden="true" />
            Duyurular
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to="/admin/duyurular/ekle" className="admin-btn admin-btn-primary">
            <i className="fas fa-plus" aria-hidden="true" /> Yeni Duyuru
          </Link>
        </div>
      </header>

      {err && <div className="admin-alert admin-alert-danger">{err}</div>}

      <div className="admin-card admin-card--flush">
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--crud">
            <thead>
              <tr>
                <th>#</th>
                <th>Görsel</th>
                <th>Duyuru</th>
                <th>Tarih</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Henüz duyuru yok. Yeni kayıt ekleyin.
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="admin-td-index">{index + 1}</td>
                  <td className="admin-td-media">
                    <img
                      className="thumb"
                      src={row.resim_display || BRAND_IMG}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = BRAND_IMG;
                      }}
                    />
                  </td>
                  <td>
                    <div className="admin-row-title">{row.baslik}</div>
                  </td>
                  <td>{formatDate(row.tarih)}</td>
                  <td>
                    <AdminRowActions
                      editTo={`/admin/duyurular/${row.id}/duzenle`}
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

function DuyuruForm({ mode, initial, onSubmit, busy, err, msg }) {
  const [baslik, setBaslik] = useState(initial?.baslik || '');
  const [aciklama, setAciklama] = useState(initial?.aciklama || '');
  const [resimUrl, setResimUrl] = useState(initial?.resim_url || '');
  const [tarih, setTarih] = useState(initial?.tarih || '');

  useEffect(() => {
    setBaslik(initial?.baslik || '');
    setAciklama(initial?.aciklama || '');
    setResimUrl(initial?.resim_url || '');
    setTarih(initial?.tarih || '');
  }, [initial]);

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-bullhorn" aria-hidden="true" />
            {mode === 'edit' ? 'Duyuru düzenle' : 'Yeni duyuru'}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to="/admin/duyurular" className="admin-btn admin-btn-secondary">
            <i className="fas fa-arrow-left" aria-hidden="true" /> Listeye dön
          </Link>
        </div>
      </header>

      <div className="admin-crud-form-shell">
        <div className="admin-card">
          <div className="admin-card-body">
            {msg && <div className="admin-alert admin-alert-success">{msg}</div>}
            {err && <div className="admin-alert admin-alert-danger">{err}</div>}
            <form
              className="admin-form admin-form--grid"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                  baslik,
                  aciklama,
                  resim_url: resimUrl || null,
                  tarih: tarih || null,
                  sayfa_tipi: 'duyuru',
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
                    rows={7}
                  />
                </label>
                <label>
                  Tarih
                  <input
                    type="date"
                    value={tarih || ''}
                    onChange={(e) => setTarih(e.target.value)}
                  />
                </label>
              </div>

              <div className="admin-form__side">
                <ImagePickerField value={resimUrl} onChange={setResimUrl} label="Resim" />
              </div>

              <div className="admin-form__actions admin-form__span-2">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to="/admin/duyurular" className="admin-btn admin-btn-secondary">
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

export function DuyurularEkle() {
  usePageTitle('Duyuru Ekle');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  return (
    <DuyuruForm
      mode="create"
      busy={busy}
      err={err}
      msg={msg}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        setMsg('');
        try {
          await createDuyuru(payload);
          navigate('/admin/duyurular');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function DuyurularDuzenle() {
  usePageTitle('Duyuru Düzenle');
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getDuyuru(id)
      .then(setInitial)
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;

  return (
    <DuyuruForm
      mode="edit"
      initial={initial}
      busy={busy}
      err={err}
      msg={msg}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        setMsg('');
        try {
          await updateDuyuru(id, payload);
          setMsg('Güncellendi.');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}
