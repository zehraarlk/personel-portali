import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listYardimciLinkler,
  getYardimciLink,
  createYardimciLink,
  updateYardimciLink,
  deleteYardimciLink,
  listYardimciLinkKategoriler,
} from '../../api/client';
import usePageTitle from '../../hooks/usePageTitle';
import { BRAND_IMG } from '../../constants';
import ImagePickerField from '../../components/ImagePickerField';
import AdminRowActions from '../../components/AdminRowActions';
import AdminAlert from '../../components/AdminAlert';

function toLogoSrc(path) {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('http')) {
    return path;
  }
  return path.replace(/^\.\.\//, '/');
}

function shortLink(url) {
  if (!url) return '—';
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '');
  } catch {
    const clean = String(url);
    return clean.length > 42 ? `${clean.slice(0, 40)}…` : clean;
  }
}

export function YardimciLinklerIndex() {
  usePageTitle('Yardımcı Linkler');
  const [rows, setRows] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [filterKat, setFilterKat] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listYardimciLinkler(filterKat || undefined)
      .then((data) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    listYardimciLinkKategoriler()
      .then((data) => setKategoriler(Array.isArray(data) ? data : data.results || []))
      .catch(() => setKategoriler([]));
  }, []);

  useEffect(load, [filterKat]);

  const onDelete = async (id) => {
    if (!window.confirm('Bu linki silmek istiyor musunuz?')) return;
    try {
      await deleteYardimciLink(id);
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
            <i className="fas fa-link" aria-hidden="true" />
            Yardımcı Linkler
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to="/admin/yardimci-linkler/ekle" className="admin-btn admin-btn-primary">
            <i className="fas fa-plus" aria-hidden="true" /> Yeni Link
          </Link>
        </div>
      </header>

      {err && (
        <AdminAlert type="danger" onClose={() => setErr('')}>
          {err}
        </AdminAlert>
      )}

      <div className="admin-card admin-card--flush admin-yl-card">
        <div className="admin-yl-toolbar">
          <label className="admin-yl-toolbar__label" htmlFor="yl-kat-filter">
            <i className="fas fa-folder-open" aria-hidden="true" />
            <span>Kategori</span>
          </label>
          <select
            id="yl-kat-filter"
            className="admin-toolbar-select"
            value={filterKat}
            onChange={(e) => setFilterKat(e.target.value)}
            aria-label="Kategori filtresi"
          >
            <option value="">Tümü</option>
            {kategoriler.map((k) => (
              <option key={k.id} value={String(k.id)}>
                {k.ad}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table admin-table--crud">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Başlık</th>
                <th>Kategori</th>
                <th>URL</th>
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
                    Bu kategoride link yok. Yeni kayıt ekleyin.
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const logoSrc = toLogoSrc(row.logo_display || row.logo_url);
                return (
                  <tr key={row.id}>
                    <td className="admin-td-media admin-td-media--yl-logo">
                      {logoSrc ? (
                        <img
                          className="admin-yl-thumb"
                          src={logoSrc}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.src = BRAND_IMG;
                          }}
                        />
                      ) : (
                        <span className="admin-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-row-title">{row.baslik}</div>
                    </td>
                    <td>
                      <span className="admin-yl-kat">{row.kategori_ad || '—'}</span>
                    </td>
                    <td>
                      {row.hedef_url ? (
                        <a
                          href={row.hedef_url}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-link-muted"
                        >
                          {shortLink(row.hedef_url)}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <AdminRowActions
                        editTo={`/admin/yardimci-linkler/${row.id}/duzenle`}
                        onDelete={() => onDelete(row.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function YardimciLinkForm({
  mode,
  initial,
  onSubmit,
  busy,
  err,
  msg,
  onClearMsg,
  onClearErr,
}) {
  const [baslik, setBaslik] = useState(initial?.baslik || '');
  const [hedefUrl, setHedefUrl] = useState(initial?.hedef_url || '');
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url || '');
  const [kategori, setKategori] = useState(
    initial?.kategori != null ? String(initial.kategori) : '',
  );
  const [kategoriler, setKategoriler] = useState([]);
  const [localErr, setLocalErr] = useState('');

  useEffect(() => {
    listYardimciLinkKategoriler()
      .then((data) => setKategoriler(Array.isArray(data) ? data : data.results || []))
      .catch(() => setKategoriler([]));
  }, []);

  useEffect(() => {
    setBaslik(initial?.baslik || '');
    setHedefUrl(initial?.hedef_url || '');
    setLogoUrl(initial?.logo_url || '');
    setKategori(initial?.kategori != null ? String(initial.kategori) : '');
    setLocalErr('');
  }, [initial]);

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-link" aria-hidden="true" />
            {mode === 'edit' ? 'Link düzenle' : 'Yeni link'}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to="/admin/yardimci-linkler" className="admin-btn admin-btn-secondary">
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
            {(err || localErr) && (
              <AdminAlert
                key={`err-${err || localErr}`}
                type="danger"
                onClose={() => {
                  setLocalErr('');
                  onClearErr?.();
                }}
              >
                {err || localErr}
              </AdminAlert>
            )}
            <form
              className="admin-form admin-form--grid"
              onSubmit={(e) => {
                e.preventDefault();
                setLocalErr('');
                if (!hedefUrl.trim()) {
                  setLocalErr('Hedef URL zorunludur.');
                  return;
                }
                if (!kategori) {
                  setLocalErr('Kategori seçiniz.');
                  return;
                }
                onSubmit({
                  baslik: baslik.trim(),
                  hedef_url: hedefUrl.trim(),
                  logo_url: logoUrl.trim() || null,
                  kategori: Number(kategori),
                });
              }}
            >
              <div className="admin-form__main">
                <label>
                  Başlık
                  <input value={baslik} onChange={(e) => setBaslik(e.target.value)} required />
                </label>
                <label>
                  Hedef URL
                  <input
                    type="url"
                    value={hedefUrl}
                    onChange={(e) => setHedefUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </label>
                <label>
                  Kategori *
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    required
                    aria-label="Kategori"
                  >
                    <option value="">Kategori seçin</option>
                    {kategoriler.map((k) => (
                      <option key={k.id} value={String(k.id)}>
                        {k.ad}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="admin-form__side">
                <ImagePickerField value={logoUrl} onChange={setLogoUrl} label="Logo" fit="logo" />
              </div>

              <div className="admin-form__actions admin-form__span-2">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to="/admin/yardimci-linkler" className="admin-btn admin-btn-secondary">
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

export function YardimciLinklerEkle() {
  usePageTitle('Link Ekle');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <YardimciLinkForm
      mode="create"
      busy={busy}
      err={err}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        try {
          await createYardimciLink(payload);
          navigate('/admin/yardimci-linkler');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function YardimciLinklerDuzenle() {
  usePageTitle('Link Düzenle');
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getYardimciLink(id)
      .then(setInitial)
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;

  return (
    <YardimciLinkForm
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
          const updated = await updateYardimciLink(id, payload);
          setInitial(updated);
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
