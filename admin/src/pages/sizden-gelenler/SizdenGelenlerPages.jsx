import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listSizdenGelenler,
  getSizdenGelen,
  createSizdenGelen,
  updateSizdenGelen,
  deleteSizdenGelen,
  listSizdenGelenKategoriler,
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

export function SizdenGelenlerIndex() {
  usePageTitle('Sizden Gelenler');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listSizdenGelenler()
      .then((data) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDelete = async (id) => {
    if (!window.confirm('Bu kaydı silmek istiyor musunuz?')) return;
    try {
      await deleteSizdenGelen(id);
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
            <i className="fas fa-comments" aria-hidden="true" />
            Sizden Gelenler
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to="/admin/sizden-gelenler/ekle" className="admin-btn admin-btn-primary">
            <i className="fas fa-plus" aria-hidden="true" /> Yeni Kayıt
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
                <th>Başlık</th>
                <th>Kategori</th>
                <th>Tarih</th>
                <th>Görüntülenme</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Henüz kayıt yok. Yeni kayıt ekleyin.
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="admin-td-index">{index + 1}</td>
                  <td className="admin-td-media">
                    <img
                      className="thumb"
                      src={row.gorsel_display || BRAND_IMG}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = BRAND_IMG;
                      }}
                    />
                  </td>
                  <td>
                    <div className="admin-row-title">{row.baslik}</div>
                  </td>
                  <td>{row.kategori_ad || '—'}</td>
                  <td>{formatDate(row.tarih)}</td>
                  <td>{row.goruntulenme ?? 0}</td>
                  <td>
                    <AdminRowActions
                      editTo={`/admin/sizden-gelenler/${row.id}/duzenle`}
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

function SizdenGelenForm({ mode, initial, onSubmit, busy, err, msg, onClearMsg, onClearErr }) {
  const [baslik, setBaslik] = useState(initial?.baslik || '');
  const [ozet, setOzet] = useState(initial?.ozet || '');
  const [tarih, setTarih] = useState(initial?.tarih || '');
  const [goruntulenme, setGoruntulenme] = useState(initial?.goruntulenme ?? 0);
  const [gorselYolu, setGorselYolu] = useState(initial?.gorsel_yolu || '');
  const [kategori, setKategori] = useState(initial?.kategori ? String(initial.kategori) : '');
  const [kategoriler, setKategoriler] = useState([]);

  useEffect(() => {
    listSizdenGelenKategoriler()
      .then((data) => setKategoriler(Array.isArray(data) ? data : []))
      .catch(() => setKategoriler([]));
  }, []);

  useEffect(() => {
    setBaslik(initial?.baslik || '');
    setOzet(initial?.ozet || '');
    setTarih(initial?.tarih || '');
    setGoruntulenme(initial?.goruntulenme ?? 0);
    setGorselYolu(initial?.gorsel_yolu || '');
    setKategori(initial?.kategori ? String(initial.kategori) : '');
  }, [initial]);

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-comments" aria-hidden="true" />
            {mode === 'edit' ? 'Kayıt düzenle' : 'Yeni kayıt'}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to="/admin/sizden-gelenler" className="admin-btn admin-btn-secondary">
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
                  ozet: ozet || '',
                  tarih,
                  goruntulenme: Number(goruntulenme) || 0,
                  gorsel_yolu: gorselYolu || null,
                  kategori: kategori ? Number(kategori) : null,
                });
              }}
            >
              <div className="admin-form__main">
                <label>
                  Başlık
                  <input value={baslik} onChange={(e) => setBaslik(e.target.value)} required />
                </label>
                <label>
                  Özet
                  <textarea value={ozet} onChange={(e) => setOzet(e.target.value)} rows={6} required />
                </label>
                <div className="admin-form__row-2">
                  <label>
                    Tarih
                    <input
                      type="date"
                      value={tarih || ''}
                      onChange={(e) => setTarih(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Kategori
                    <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
                      <option value="">Seçiniz</option>
                      {kategoriler.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.ad}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Görüntülenme
                  <input
                    type="number"
                    min="0"
                    value={goruntulenme}
                    onChange={(e) => setGoruntulenme(e.target.value)}
                  />
                </label>
              </div>

              <div className="admin-form__side">
                <ImagePickerField value={gorselYolu} onChange={setGorselYolu} label="Görsel" />
              </div>

              <div className="admin-form__actions admin-form__span-2">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to="/admin/sizden-gelenler" className="admin-btn admin-btn-secondary">
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

export function SizdenGelenlerEkle() {
  usePageTitle('Sizden Gelen Ekle');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <SizdenGelenForm
      mode="create"
      busy={busy}
      err={err}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        try {
          await createSizdenGelen(payload);
          navigate('/admin/sizden-gelenler');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function SizdenGelenlerDuzenle() {
  usePageTitle('Sizden Gelen Düzenle');
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getSizdenGelen(id)
      .then(setInitial)
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;

  return (
    <SizdenGelenForm
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
          await updateSizdenGelen(id, payload);
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
