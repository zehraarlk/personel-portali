import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listProtokoller,
  getProtokol,
  createProtokol,
  updateProtokol,
  deleteProtokol,
} from '../../api/client';
import usePageTitle from '../../hooks/usePageTitle';
import AdminRowActions from '../../components/AdminRowActions';
import AdminAlert from '../../components/AdminAlert';

const ICON_OPTIONS = [
  { value: 'fas fa-file-signature', label: 'Protokol / İmza' },
  { value: 'fas fa-hospital', label: 'Hastane' },
  { value: 'fas fa-tooth', label: 'Diş sağlığı' },
  { value: 'fas fa-handshake', label: 'Anlaşma' },
  { value: 'fas fa-file-pdf', label: 'PDF belge' },
  { value: 'fas fa-briefcase', label: 'Kurumsal' },
];

/** DB tarih alanı: "04.10.2023" ↔ date input "2023-10-04" */
function toDateInput(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return '';
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function fromDateInput(value) {
  if (!value) return '';
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return value;
  const [, y, mo, d] = m;
  return `${d}.${mo}.${y}`;
}

function displayDate(value) {
  if (!value) return '—';
  const iso = toDateInput(value);
  if (!iso) return value;
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('tr-TR');
  } catch {
    return value;
  }
}

function shortLink(url) {
  if (!url) return '—';
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    const clean = String(url).replace(/^\.\.\//, '');
    return clean.length > 36 ? `${clean.slice(0, 34)}…` : clean;
  }
}

export function ProtokollerIndex() {
  usePageTitle('Protokoller');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listProtokoller()
      .then((data) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDelete = async (id) => {
    if (!window.confirm('Bu protokolü silmek istiyor musunuz?')) return;
    try {
      await deleteProtokol(id);
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
            <i className="fas fa-file-signature" aria-hidden="true" />
            Protokoller
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to="/admin/protokoller/ekle" className="admin-btn admin-btn-primary">
            <i className="fas fa-plus" aria-hidden="true" /> Yeni Protokol
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
                <th>İkon</th>
                <th>Protokol</th>
                <th>Dosya</th>
                <th>Boyut</th>
                <th>Tarih</th>
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
                    Henüz protokol yok. Yeni kayıt ekleyin.
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="admin-td-index">{index + 1}</td>
                  <td className="admin-td-media">
                    <span className="admin-icon-pill" title={row.ikon || ''}>
                      <i className={row.ikon || 'fas fa-file-signature'} aria-hidden="true" />
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-title">{row.baslik}</div>
                    {row.aciklama ? (
                      <div className="admin-row-meta">
                        {row.aciklama.length > 110
                          ? `${row.aciklama.slice(0, 108)}…`
                          : row.aciklama}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    {row.dosya_yolu ? (
                      <a
                        href={row.dosya_yolu}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-link-muted"
                      >
                        {shortLink(row.dosya_yolu)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{row.boyut || '—'}</td>
                  <td>{displayDate(row.tarih)}</td>
                  <td>
                    <AdminRowActions
                      editTo={`/admin/protokoller/${row.id}/duzenle`}
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

function ProtokolForm({ mode, initial, onSubmit, busy, err, msg, onClearMsg, onClearErr }) {
  const [baslik, setBaslik] = useState(initial?.baslik || '');
  const [aciklama, setAciklama] = useState(initial?.aciklama || '');
  const [ikon, setIkon] = useState(initial?.ikon || 'fas fa-file-signature');
  const [dosyaYolu, setDosyaYolu] = useState(initial?.dosya_yolu || '');
  const [resmiSayfa, setResmiSayfa] = useState(initial?.resmi_sayfa || '');
  const [boyut, setBoyut] = useState(initial?.boyut || '');
  const [tarih, setTarih] = useState(toDateInput(initial?.tarih));

  useEffect(() => {
    setBaslik(initial?.baslik || '');
    setAciklama(initial?.aciklama || '');
    setIkon(initial?.ikon || 'fas fa-file-signature');
    setDosyaYolu(initial?.dosya_yolu || '');
    setResmiSayfa(initial?.resmi_sayfa || '');
    setBoyut(initial?.boyut || '');
    setTarih(toDateInput(initial?.tarih));
  }, [initial]);

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-file-signature" aria-hidden="true" />
            {mode === 'edit' ? 'Protokol düzenle' : 'Yeni protokol'}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to="/admin/protokoller" className="admin-btn admin-btn-secondary">
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
                  baslik: baslik.trim(),
                  aciklama: aciklama.trim(),
                  ikon: ikon || 'fas fa-file-signature',
                  dosya_yolu: dosyaYolu.trim(),
                  resmi_sayfa: resmiSayfa.trim() || null,
                  boyut: boyut.trim(),
                  tarih: fromDateInput(tarih) || tarih.trim(),
                });
              }}
            >
              <div className="admin-form__main">
                <label>
                  Başlık
                  <input
                    value={baslik}
                    onChange={(e) => setBaslik(e.target.value)}
                    required
                    maxLength={255}
                    placeholder="Örn: Gebze MedicalPark Hastanesi"
                  />
                </label>
                <label>
                  Açıklama
                  <textarea
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    rows={6}
                    required
                    placeholder="Protokol / anlaşma özeti"
                  />
                </label>
                <div className="admin-form__row-2">
                  <label>
                    İkon
                    <select value={ikon} onChange={(e) => setIkon(e.target.value)}>
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Boyut
                    <input
                      value={boyut}
                      onChange={(e) => setBoyut(e.target.value)}
                      required
                      placeholder="Örn: 1.7 MB"
                    />
                  </label>
                </div>
                <label>
                  Dosya yolu / PDF bağlantısı
                  <input
                    value={dosyaYolu}
                    onChange={(e) => setDosyaYolu(e.target.value)}
                    required
                    placeholder="https://… veya ../images/…"
                  />
                </label>
                <label>
                  Resmi sayfa (opsiyonel)
                  <input
                    value={resmiSayfa}
                    onChange={(e) => setResmiSayfa(e.target.value)}
                    placeholder="https://www.mevzuat.gov.tr/…"
                  />
                </label>
                <label>
                  Tarih
                  <input
                    type="date"
                    value={tarih}
                    onChange={(e) => setTarih(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="admin-form__side">
                <div className="admin-form-preview admin-form-preview--icon">
                  <div className="admin-form-preview__empty">
                    <i className={ikon || 'fas fa-file-signature'} aria-hidden="true" />
                    <span>Önizleme</span>
                  </div>
                </div>
                <p className="admin-muted" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
            Kayıt otomatik olarak <strong>Protokoller</strong> kategorisine yazılır.
          </p>
              </div>

              <div className="admin-form__actions admin-form__span-2">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to="/admin/protokoller" className="admin-btn admin-btn-secondary">
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

export function ProtokollerEkle() {
  usePageTitle('Protokol Ekle');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <ProtokolForm
      mode="create"
      busy={busy}
      err={err}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        try {
          await createProtokol(payload);
          navigate('/admin/protokoller');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function ProtokollerDuzenle() {
  usePageTitle('Protokol Düzenle');
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getProtokol(id)
      .then(setInitial)
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;
  if (!initial && err) {
    return (
      <AdminAlert type="danger" onClose={() => setErr('')}>
        {err}
      </AdminAlert>
    );
  }

  return (
    <ProtokolForm
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
          const updated = await updateProtokol(id, payload);
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
