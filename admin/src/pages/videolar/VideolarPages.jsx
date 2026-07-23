import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listVideolar,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  listVideoKategoriler,
} from '../../api/client';
import usePageTitle from '../../hooks/usePageTitle';
import { BRAND_IMG } from '../../constants';
import AdminRowActions from '../../components/AdminRowActions';
import AdminAlert from '../../components/AdminAlert';

export function VideolarIndex() {
  usePageTitle('Videolar');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listVideolar()
      .then((data) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDelete = async (id) => {
    if (!window.confirm('Bu videoyu silmek istiyor musunuz?')) return;
    try {
      await deleteVideo(id);
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
            <i className="fas fa-video" aria-hidden="true" />
            Videolar
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to="/admin/videolar/ekle" className="admin-btn admin-btn-primary">
            <i className="fas fa-plus" aria-hidden="true" /> Yeni Video
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
                <th>Önizleme</th>
                <th>Video</th>
                <th>Kategori</th>
                <th>Süre</th>
                <th>Vitrin</th>
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
                    Henüz video yok. Yeni kayıt ekleyin.
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="admin-td-index">{index + 1}</td>
                  <td className="admin-td-media">
                    <img
                      className="thumb"
                      src={row.thumbnail || BRAND_IMG}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = BRAND_IMG;
                      }}
                    />
                  </td>
                  <td>
                    <div className="admin-row-title">{row.baslik}</div>
                    <div className="admin-row-meta">{row.youtube_id}</div>
                  </td>
                  <td>{row.kategori_ad || '—'}</td>
                  <td>{row.sure || '—'}</td>
                  <td>
                    <span className={`admin-badge-status ${row.vitrin ? 'is-aktif' : 'is-pasif'}`}>
                      {row.vitrin ? 'Evet' : 'Hayır'}
                    </span>
                  </td>
                  <td>
                    <AdminRowActions
                      editTo={`/admin/videolar/${row.id}/duzenle`}
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

function VideoForm({ mode, initial, onSubmit, busy, err, msg, onClearMsg, onClearErr }) {
  const [youtubeId, setYoutubeId] = useState(initial?.youtube_id || '');
  const [baslik, setBaslik] = useState(initial?.baslik || '');
  const [aciklama, setAciklama] = useState(initial?.aciklama || '');
  const [sure, setSure] = useState(initial?.sure || '');
  const [kategori, setKategori] = useState(initial?.kategori ? String(initial.kategori) : '');
  const [vitrin, setVitrin] = useState(String(initial?.vitrin ?? 0));
  const [vitrinBaslik, setVitrinBaslik] = useState(initial?.vitrin_baslik || '');
  const [vitrinAciklama, setVitrinAciklama] = useState(initial?.vitrin_aciklama || '');
  const [kategoriler, setKategoriler] = useState([]);

  useEffect(() => {
    listVideoKategoriler()
      .then((data) => setKategoriler(Array.isArray(data) ? data : []))
      .catch(() => setKategoriler([]));
  }, []);

  useEffect(() => {
    setYoutubeId(initial?.youtube_id || '');
    setBaslik(initial?.baslik || '');
    setAciklama(initial?.aciklama || '');
    setSure(initial?.sure || '');
    setKategori(initial?.kategori ? String(initial.kategori) : '');
    setVitrin(String(initial?.vitrin ?? 0));
    setVitrinBaslik(initial?.vitrin_baslik || '');
    setVitrinAciklama(initial?.vitrin_aciklama || '');
  }, [initial]);

  const preview = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : '';

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-video" aria-hidden="true" />
            {mode === 'edit' ? 'Video düzenle' : 'Yeni video'}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to="/admin/videolar" className="admin-btn admin-btn-secondary">
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
                  youtube_id: youtubeId,
                  baslik,
                  aciklama: aciklama || '',
                  sure: sure || '00:00',
                  kategori: kategori ? Number(kategori) : null,
                  vitrin: Number(vitrin),
                  vitrin_baslik: vitrinBaslik || null,
                  vitrin_aciklama: vitrinAciklama || null,
                });
              }}
            >
              <div className="admin-form__main">
                <label>
                  Başlık
                  <input value={baslik} onChange={(e) => setBaslik(e.target.value)} required />
                </label>
                <label>
                  YouTube ID
                  <input
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value.trim())}
                    required
                    placeholder="örn. qLqYPQgUPEc"
                  />
                </label>
                <label>
                  Açıklama
                  <textarea
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    rows={5}
                  />
                </label>
                <div className="admin-form__row-2">
                  <label>
                    Süre
                    <input
                      value={sure}
                      onChange={(e) => setSure(e.target.value)}
                      placeholder="00:30"
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
                <div className="admin-form__row-2">
                  <label>
                    Vitrin
                    <select value={vitrin} onChange={(e) => setVitrin(e.target.value)}>
                      <option value="0">Hayır</option>
                      <option value="1">Evet</option>
                    </select>
                  </label>
                  <label>
                    Vitrin başlık
                    <input
                      value={vitrinBaslik}
                      onChange={(e) => setVitrinBaslik(e.target.value)}
                    />
                  </label>
                </div>
                <label>
                  Vitrin açıklama
                  <textarea
                    value={vitrinAciklama}
                    onChange={(e) => setVitrinAciklama(e.target.value)}
                    rows={3}
                  />
                </label>
              </div>

              <div className="admin-form__side">
                <div className="admin-form-preview">
                  {preview ? (
                    <img
                      src={preview}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = BRAND_IMG;
                      }}
                    />
                  ) : (
                    <div className="admin-form-preview__empty">
                      <i className="fas fa-video" aria-hidden="true" />
                      YouTube önizleme
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form__actions admin-form__span-2">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to="/admin/videolar" className="admin-btn admin-btn-secondary">
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

export function VideolarEkle() {
  usePageTitle('Video Ekle');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <VideoForm
      mode="create"
      busy={busy}
      err={err}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        try {
          await createVideo(payload);
          navigate('/admin/videolar');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function VideolarDuzenle() {
  usePageTitle('Video Düzenle');
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getVideo(id)
      .then(setInitial)
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;

  return (
    <VideoForm
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
          await updateVideo(id, payload);
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
