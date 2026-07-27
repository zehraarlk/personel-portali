/**
 * Genel Kaynaklar CRUD — Dökümanlar, Mevzuatlar, Eğitimler
 * Protokoller yapısının genelleştirilmiş hali.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import AdminRowActions from '../../components/AdminRowActions';
import AdminAlert from '../../components/AdminAlert';
import PdfPickerField from '../../components/PdfPickerField';
import IconSelectField from '../../components/IconSelectField';
import { dokumanlarApi, mevzuatlarApi, egitimlerApi } from '../../api/client';

const META = {
  dokumanlar: {
    title: 'Dokümanlar',
    icon: 'fas fa-file-alt',
    base: '/admin/dokumanlar',
    defaultIcon: 'fas fa-file-alt',
  },
  mevzuatlar: {
    title: 'Mevzuatlar',
    icon: 'fas fa-balance-scale',
    base: '/admin/mevzuatlar',
    defaultIcon: 'fas fa-folder-open',
  },
  egitimler: {
    title: 'Eğitimler',
    icon: 'fas fa-graduation-cap',
    base: '/admin/egitimler',
    defaultIcon: 'fas fa-graduation-cap',
  },
};

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

/** ../images/... → /images/... (admin/portal kökünden açılsın) */
function fileHref(path) {
  if (!path) return '';
  const raw = String(path).trim();
  if (!raw) return '';
  if (/^(https?:|blob:|data:)/i.test(raw)) return raw;
  const clean = raw.replace(/^\.\.\//, '');
  return clean.startsWith('/') ? clean : `/${clean}`;
}

// ─── Index ───

export function KaynakIndex({ slug, api }) {
  const meta = META[slug];
  usePageTitle(meta.title);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr('');
    setRows([]);

    api
      .list()
      .then((data) => {
        if (cancelled) return;
        setRows(Array.isArray(data) ? data : data.results || []);
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
  }, [slug, api]);

  const onDelete = async (id) => {
    if (!window.confirm('Bu kaydı silmek istiyor musunuz?')) return;
    try {
      await api.delete(id);
      setLoading(true);
      const data = await api.list();
      setRows(Array.isArray(data) ? data : data.results || []);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-module" key={slug}>
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className={meta.icon} aria-hidden="true" />
            {meta.title}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to={`${meta.base}/ekle`} className="admin-btn admin-btn-primary">
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
          <table className="admin-table admin-table--crud admin-table--kaynak">
            <thead>
              <tr>
                <th>#</th>
                <th>İkon</th>
                <th>Başlık</th>
                <th>Dosya</th>
                <th>Boyut</th>
                <th>Tarih</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="admin-empty">Yükleniyor…</td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-empty">Henüz kayıt yok. Yeni ekleyin.</td>
                </tr>
              )}
              {!loading &&
                rows.map((row, index) => (
                  <tr key={`${slug}-${row.id}`}>
                    <td className="admin-td-index">{index + 1}</td>
                    <td className="admin-td-media">
                      <span className="admin-icon-pill" title={row.ikon || ''}>
                        <i className={row.ikon || meta.defaultIcon} aria-hidden="true" />
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
                          href={fileHref(row.dosya_yolu)}
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
                    <td className="admin-td-nowrap">{row.boyut || '—'}</td>
                    <td className="admin-td-nowrap">{displayDate(row.tarih)}</td>
                    <td>
                      <AdminRowActions
                        editTo={`${meta.base}/${row.id}/duzenle`}
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

// ─── Form ───

function KaynakForm({ slug, mode, initial, onSubmit, busy, err, msg, onClearMsg, onClearErr }) {
  const meta = META[slug];
  const [baslik, setBaslik] = useState(initial?.baslik || '');
  const [aciklama, setAciklama] = useState(initial?.aciklama || '');
  const [ikon, setIkon] = useState(initial?.ikon || meta.defaultIcon);
  const [dosyaYolu, setDosyaYolu] = useState(initial?.dosya_yolu || '');
  const [resmiSayfa, setResmiSayfa] = useState(initial?.resmi_sayfa || '');
  const [boyut, setBoyut] = useState(initial?.boyut || '');
  const [tarih, setTarih] = useState(toDateInput(initial?.tarih));
  const [localErr, setLocalErr] = useState('');

  useEffect(() => {
    setBaslik(initial?.baslik || '');
    setAciklama(initial?.aciklama || '');
    setIkon(initial?.ikon || meta.defaultIcon);
    setDosyaYolu(initial?.dosya_yolu || '');
    setResmiSayfa(initial?.resmi_sayfa || '');
    setBoyut(initial?.boyut || '');
    setTarih(toDateInput(initial?.tarih));
    setLocalErr('');
  }, [initial, meta.defaultIcon, slug]);

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className={meta.icon} aria-hidden="true" />
            {mode === 'edit' ? `${meta.title} — Düzenle` : `${meta.title} — Yeni`}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to={meta.base} className="admin-btn admin-btn-secondary">
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
                onClose={() => { setLocalErr(''); onClearErr?.(); }}
              >
                {err || localErr}
              </AdminAlert>
            )}
            <form
              className="admin-form admin-form--grid"
              onSubmit={(e) => {
                e.preventDefault();
                if (!dosyaYolu.trim()) {
                  setLocalErr('Dosya zorunludur. Sağdaki alandan seçin veya URL yapıştırın.');
                  return;
                }
                setLocalErr('');
                onSubmit({
                  baslik: baslik.trim(),
                  aciklama: aciklama.trim(),
                  ikon: ikon || meta.defaultIcon,
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
                    placeholder="Kaynak başlığı"
                  />
                </label>
                <label>
                  Açıklama
                  <textarea
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    rows={5}
                    required
                    placeholder="Açıklama / özet"
                  />
                </label>
                <div className="admin-form__row-2">
                  <label>
                    Boyut
                    <input
                      value={boyut}
                      onChange={(e) => setBoyut(e.target.value)}
                      required
                      placeholder="Örn: 1.7 MB"
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
                <label>
                  Resmi sayfa (opsiyonel)
                  <input
                    value={resmiSayfa}
                    onChange={(e) => setResmiSayfa(e.target.value)}
                    placeholder="https://www.mevzuat.gov.tr/…"
                  />
                </label>
              </div>

              <div className="admin-form__side">
                <IconSelectField
                  value={ikon}
                  onChange={setIkon}
                  defaultIcon={meta.defaultIcon}
                  label="İkon değiştir"
                />

                <PdfPickerField
                  value={dosyaYolu}
                  onChange={setDosyaYolu}
                  onUploaded={({ size_label: sizeLabel }) => {
                    if (sizeLabel) setBoyut(sizeLabel);
                  }}
                  mode="document"
                  label="Dosya değiştir"
                />
              </div>

              <div className="admin-form__actions admin-form__span-2">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to={meta.base} className="admin-btn admin-btn-secondary">
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

// ─── Ekle ───

export function KaynakEkle({ slug, api }) {
  const meta = META[slug];
  usePageTitle(`${meta.title} Ekle`);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <KaynakForm
      slug={slug}
      mode="create"
      busy={busy}
      err={err}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        try {
          await api.create(payload);
          navigate(meta.base);
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

// ─── Düzenle ───

export function KaynakDuzenle({ slug, api }) {
  const meta = META[slug];
  usePageTitle(`${meta.title} Düzenle`);
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    setInitial(null);
    setErr('');
    setMsg('');
    api
      .get(id)
      .then((data) => {
        if (!cancelled) setInitial(data);
      })
      .catch((ex) => {
        if (!cancelled) setErr(ex.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, slug, api]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;
  if (!initial && err) {
    return (
      <AdminAlert type="danger" onClose={() => setErr('')}>
        {err}
      </AdminAlert>
    );
  }

  return (
    <KaynakForm
      slug={slug}
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
          const updated = await api.update(id, payload);
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

/**
 * Kalıcı çözüm: her modül ayrı bileşen tipi.
 * Aynı KaynakIndex’i 3 rotada paylaşmak React’in instance’ı yeniden
 * kullanmasına yol açıyordu (eski tablo verisi kalıyordu).
 * Bu sarmalayıcılar farklı function identity ile her geçişte remount eder.
 */
function makeKaynakPages(slug, api) {
  function IndexPage() {
    return <KaynakIndex slug={slug} api={api} />;
  }
  function EklePage() {
    return <KaynakEkle slug={slug} api={api} />;
  }
  function DuzenlePage() {
    return <KaynakDuzenle slug={slug} api={api} />;
  }
  IndexPage.displayName = `KaynakIndex_${slug}`;
  EklePage.displayName = `KaynakEkle_${slug}`;
  DuzenlePage.displayName = `KaynakDuzenle_${slug}`;
  return { IndexPage, EklePage, DuzenlePage };
}

const dokumanlarPages = makeKaynakPages('dokumanlar', dokumanlarApi);
const mevzuatlarPages = makeKaynakPages('mevzuatlar', mevzuatlarApi);
const egitimlerPages = makeKaynakPages('egitimler', egitimlerApi);

export const DokumanlarIndex = dokumanlarPages.IndexPage;
export const DokumanlarEkle = dokumanlarPages.EklePage;
export const DokumanlarDuzenle = dokumanlarPages.DuzenlePage;

export const MevzuatlarIndex = mevzuatlarPages.IndexPage;
export const MevzuatlarEkle = mevzuatlarPages.EklePage;
export const MevzuatlarDuzenle = mevzuatlarPages.DuzenlePage;

export const EgitimlerIndex = egitimlerPages.IndexPage;
export const EgitimlerEkle = egitimlerPages.EklePage;
export const EgitimlerDuzenle = egitimlerPages.DuzenlePage;
