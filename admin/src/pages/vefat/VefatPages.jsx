import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listVefat,
  getVefat,
  createVefat,
  updateVefat,
  deleteVefat,
} from '../../api/client';
import usePageTitle from '../../hooks/usePageTitle';
import AdminRowActions from '../../components/AdminRowActions';
import AdminAlert from '../../components/AdminAlert';

const TR_MONTHS = [
  '',
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

function formatDateDisplay(row) {
  if (row?.vefat_tarihi_metin) return row.vefat_tarihi_metin;
  if (!row?.vefat_tarihi) return '—';
  try {
    return new Date(`${row.vefat_tarihi}T00:00:00`).toLocaleDateString('tr-TR');
  } catch {
    return row.vefat_tarihi;
  }
}

function buildTarihMetin(isoDate) {
  if (!isoDate) return '';
  const m = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!mo || mo > 12) return '';
  return `${d} ${TR_MONTHS[mo]} ${y}`;
}

function clip(text, max = 50) {
  const raw = (text || '').trim();
  if (!raw) return '—';
  return raw.length > max ? `${raw.slice(0, max - 1)}…` : raw;
}

export function VefatIndex() {
  usePageTitle('Vefat Bilgileri');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listVefat()
      .then((data) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDelete = async (id) => {
    if (!window.confirm('Bu vefat bilgisini silmek istediğinize emin misiniz?')) return;
    try {
      await deleteVefat(id);
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
            <i className="fas fa-ribbon" aria-hidden="true" />
            Vefat Bilgileri
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to="/admin/vefat/ekle" className="admin-btn admin-btn-primary">
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
                <th>Vefat Eden</th>
                <th>İlişki</th>
                <th>Tarih</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    Henüz vefat bilgisi eklenmemiş.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="admin-row-title">{row.vefat_eden_adi}</div>
                  </td>
                  <td>
                    <div className="admin-row-meta">{clip(row.iliski_pozisyon, 50)}</div>
                  </td>
                  <td>{formatDateDisplay(row)}</td>
                  <td>
                    <AdminRowActions
                      editTo={`/admin/vefat/${row.id}/duzenle`}
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

function VefatForm({ mode, initial, onSubmit, busy, err, msg, onClearMsg, onClearErr }) {
  const [adi, setAdi] = useState(initial?.vefat_eden_adi || '');
  const [iliski, setIliski] = useState(initial?.iliski_pozisyon || '');
  const [tarih, setTarih] = useState(initial?.vefat_tarihi || '');
  const [tarihMetin, setTarihMetin] = useState(initial?.vefat_tarihi_metin || '');
  const [tarihMetinTouched, setTarihMetinTouched] = useState(Boolean(initial?.vefat_tarihi_metin));
  const [mesaj, setMesaj] = useState(initial?.cenaze_mesaji || '');
  const [localErr, setLocalErr] = useState('');

  useEffect(() => {
    setAdi(initial?.vefat_eden_adi || '');
    setIliski(initial?.iliski_pozisyon || '');
    setTarih(initial?.vefat_tarihi || '');
    setTarihMetin(initial?.vefat_tarihi_metin || '');
    setTarihMetinTouched(Boolean(initial?.vefat_tarihi_metin));
    setMesaj(initial?.cenaze_mesaji || '');
    setLocalErr('');
  }, [initial]);

  const onTarihChange = (value) => {
    setTarih(value);
    if (!tarihMetinTouched) {
      setTarihMetin(buildTarihMetin(value));
    }
  };

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-ribbon" aria-hidden="true" />
            {mode === 'edit' ? 'Vefat kaydı düzenle' : 'Yeni vefat kaydı'}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to="/admin/vefat" className="admin-btn admin-btn-secondary">
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
              className="admin-form admin-form--vefat"
              onSubmit={(e) => {
                e.preventDefault();
                setLocalErr('');
                if (!adi.trim() || !tarih || !mesaj.trim()) {
                  setLocalErr('Vefat eden adı, tarih ve cenaze mesajı zorunludur.');
                  return;
                }
                onSubmit({
                  vefat_eden_adi: adi.trim(),
                  iliski_pozisyon: iliski.trim(),
                  vefat_tarihi: tarih,
                  vefat_tarihi_metin: (tarihMetin || buildTarihMetin(tarih)).trim(),
                  cenaze_mesaji: mesaj.trim(),
                });
              }}
            >
              <label>
                Vefat eden adı *
                <input value={adi} onChange={(e) => setAdi(e.target.value)} required />
              </label>
              <label>
                İlişki / pozisyon
                <input value={iliski} onChange={(e) => setIliski(e.target.value)} />
              </label>
              <div className="admin-form__row-2">
                <label>
                  Vefat tarihi *
                  <input
                    type="date"
                    value={tarih}
                    onChange={(e) => onTarihChange(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Tarih metni
                  <input
                    value={tarihMetin}
                    onChange={(e) => {
                      setTarihMetinTouched(true);
                      setTarihMetin(e.target.value);
                    }}
                    placeholder="örn: 21 Aralık 2024"
                    maxLength={50}
                  />
                </label>
              </div>
              <label>
                Cenaze mesajı *
                <textarea
                  value={mesaj}
                  onChange={(e) => setMesaj(e.target.value)}
                  rows={5}
                  required
                />
              </label>
              <div className="admin-form__actions">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : mode === 'edit' ? 'Güncelle' : 'Kaydet'}
                </button>
                <Link to="/admin/vefat" className="admin-btn admin-btn-secondary">
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

export function VefatEkle() {
  usePageTitle('Yeni Vefat Kaydı');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <VefatForm
      mode="create"
      busy={busy}
      err={err}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        try {
          await createVefat(payload);
          navigate('/admin/vefat');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function VefatDuzenle() {
  usePageTitle('Vefat Kaydı Düzenle');
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getVefat(id)
      .then(setInitial)
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;

  return (
    <VefatForm
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
          const updated = await updateVefat(id, payload);
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
