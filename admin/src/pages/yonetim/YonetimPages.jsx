import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listPersoneller,
  getPersonel,
  createPersonel,
  updatePersonel,
  deletePersonel,
  listYoneticiler,
  getYonetici,
  createYonetici,
  updateYonetici,
  deleteYonetici,
} from '../../api/client';
import usePageTitle from '../../hooks/usePageTitle';
import { BRAND_IMG } from '../../constants';
import ImagePickerField from '../../components/ImagePickerField';
import AdminRowActions from '../../components/AdminRowActions';
import AdminAlert from '../../components/AdminAlert';

export function PersonellerIndex() {
  usePageTitle('Personeller');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listPersoneller()
      .then((data) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDelete = async (id) => {
    if (!window.confirm('Bu personeli silmek istiyor musunuz?')) return;
    try {
      await deletePersonel(id);
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
            <i className="fas fa-users" aria-hidden="true" />
            Personeller
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to="/admin/personeller/ekle" className="admin-btn admin-btn-primary">
            <i className="fas fa-plus" aria-hidden="true" /> Yeni Personel
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
                <th>Foto</th>
                <th>Ad Soyad</th>
                <th>Sicil</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Doğum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Kayıt yok. Yeni personel ekleyin.
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="admin-td-index">{index + 1}</td>
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
                  <td>{row.sicil_no}</td>
                  <td>{row.email}</td>
                  <td>{row.telefon || '—'}</td>
                  <td>{row.dogum_tarihi || '—'}</td>
                  <td>
                    <AdminRowActions
                      editTo={`/admin/personeller/${row.id}/duzenle`}
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

function PersonelForm({ mode, initial, onSubmit, busy, err, msg, onClearMsg, onClearErr }) {
  const [sicilNo, setSicilNo] = useState(initial?.sicil_no || '');
  const [ad, setAd] = useState(initial?.ad || '');
  const [soyad, setSoyad] = useState(initial?.soyad || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [sifre, setSifre] = useState('');
  const [telefon, setTelefon] = useState(initial?.telefon || '');
  const [tcNo, setTcNo] = useState(initial?.tc_no || '');
  const [dogumTarihi, setDogumTarihi] = useState(initial?.dogum_tarihi || '');
  const [fotoUrl, setFotoUrl] = useState(initial?.foto_url || '');

  useEffect(() => {
    setSicilNo(initial?.sicil_no || '');
    setAd(initial?.ad || '');
    setSoyad(initial?.soyad || '');
    setEmail(initial?.email || '');
    setSifre('');
    setTelefon(initial?.telefon || '');
    setTcNo(initial?.tc_no || '');
    setDogumTarihi(initial?.dogum_tarihi || '');
    setFotoUrl(initial?.foto_url || '');
  }, [initial]);

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-users" aria-hidden="true" />
            {mode === 'edit' ? 'Personel düzenle' : 'Yeni personel'}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to="/admin/personeller" className="admin-btn admin-btn-secondary">
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
                const payload = {
                  sicil_no: sicilNo,
                  ad,
                  soyad,
                  email,
                  telefon: telefon || null,
                  tc_no: tcNo || null,
                  dogum_tarihi: dogumTarihi,
                  foto_url: fotoUrl || '../images/gebze-logo.webp',
                };
                if (sifre) payload.sifre = sifre;
                else if (mode === 'create') payload.sifre = sifre;
                onSubmit(payload);
              }}
            >
              <div className="admin-form__main">
                <div className="admin-form__row-2">
                  <label>
                    Ad
                    <input value={ad} onChange={(e) => setAd(e.target.value)} required />
                  </label>
                  <label>
                    Soyad
                    <input value={soyad} onChange={(e) => setSoyad(e.target.value)} required />
                  </label>
                </div>
                <div className="admin-form__row-2">
                  <label>
                    Sicil no
                    <input value={sicilNo} onChange={(e) => setSicilNo(e.target.value)} required />
                  </label>
                  <label>
                    Doğum tarihi
                    <input
                      type="date"
                      value={dogumTarihi || ''}
                      onChange={(e) => setDogumTarihi(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <label>
                  E-posta
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <div className="admin-form__row-2">
                  <label>
                    Şifre{mode === 'edit' ? ' (opsiyonel)' : ''}
                    <input
                      type="password"
                      value={sifre}
                      onChange={(e) => setSifre(e.target.value)}
                      required={mode === 'create'}
                      minLength={mode === 'create' ? 4 : undefined}
                      placeholder={mode === 'edit' ? 'Değiştirmek için doldurun' : ''}
                    />
                  </label>
                  <label>
                    Telefon
                    <input value={telefon} onChange={(e) => setTelefon(e.target.value)} />
                  </label>
                </div>
                <label>
                  T.C. kimlik no
                  <input
                    value={tcNo}
                    onChange={(e) => setTcNo(e.target.value)}
                    maxLength={11}
                  />
                </label>
              </div>

              <div className="admin-form__side">
                <ImagePickerField value={fotoUrl} onChange={setFotoUrl} label="Fotoğraf" />
              </div>

              <div className="admin-form__actions admin-form__span-2">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to="/admin/personeller" className="admin-btn admin-btn-secondary">
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

export function PersonellerEkle() {
  usePageTitle('Personel Ekle');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <PersonelForm
      mode="create"
      busy={busy}
      err={err}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        try {
          await createPersonel(payload);
          navigate('/admin/personeller');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function PersonellerDuzenle() {
  usePageTitle('Personel Düzenle');
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getPersonel(id)
      .then(setInitial)
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;

  return (
    <PersonelForm
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
          await updatePersonel(id, payload);
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

export function YoneticilerIndex() {
  usePageTitle('Yöneticiler');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listYoneticiler()
      .then((data) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDelete = async (id) => {
    if (!window.confirm('Bu yöneticiyi silmek istiyor musunuz?')) return;
    try {
      await deleteYonetici(id);
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
            <i className="fas fa-user-shield" aria-hidden="true" />
            Yöneticiler
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to="/admin/yoneticiler/ekle" className="admin-btn admin-btn-primary">
            <i className="fas fa-plus" aria-hidden="true" /> Yeni Yönetici
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
                <th>Foto</th>
                <th>Ad Soyad</th>
                <th>Kullanıcı</th>
                <th>Yetki</th>
                <th>Durum</th>
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
                    Kayıt yok. Yeni yönetici ekleyin.
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="admin-td-index">{index + 1}</td>
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
                  <td>@{row.kullanici_adi}</td>
                  <td>{row.yetki || '—'}</td>
                  <td>
                    {row.aktif ? (
                      <span className="admin-chip">Aktif</span>
                    ) : (
                      <span className="admin-muted">Pasif</span>
                    )}
                  </td>
                  <td>
                    <AdminRowActions
                      editTo={`/admin/yoneticiler/${row.id}/duzenle`}
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

function YoneticiForm({ mode, initial, onSubmit, busy, err, msg, onClearMsg, onClearErr }) {
  const [kullaniciAdi, setKullaniciAdi] = useState(initial?.kullanici_adi || '');
  const [ad, setAd] = useState(initial?.ad || '');
  const [soyad, setSoyad] = useState(initial?.soyad || '');
  const [sifre, setSifre] = useState('');
  const [yetki, setYetki] = useState(initial?.yetki || 'yonetici');
  const [aktif, setAktif] = useState(String(initial?.aktif ?? 1));
  const [fotoUrl, setFotoUrl] = useState(initial?.foto_url || '');

  useEffect(() => {
    setKullaniciAdi(initial?.kullanici_adi || '');
    setAd(initial?.ad || '');
    setSoyad(initial?.soyad || '');
    setSifre('');
    setYetki(initial?.yetki || 'yonetici');
    setAktif(String(initial?.aktif ?? 1));
    setFotoUrl(initial?.foto_url || '');
  }, [initial]);

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-user-shield" aria-hidden="true" />
            {mode === 'edit' ? 'Yönetici düzenle' : 'Yeni yönetici'}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to="/admin/yoneticiler" className="admin-btn admin-btn-secondary">
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
                const payload = {
                  kullanici_adi: kullaniciAdi,
                  ad,
                  soyad,
                  yetki,
                  aktif: Number(aktif),
                  foto_url: fotoUrl || null,
                };
                if (sifre) payload.sifre = sifre;
                else if (mode === 'create') payload.sifre = sifre;
                onSubmit(payload);
              }}
            >
              <div className="admin-form__main">
                <div className="admin-form__row-2">
                  <label>
                    Ad
                    <input value={ad} onChange={(e) => setAd(e.target.value)} required />
                  </label>
                  <label>
                    Soyad
                    <input value={soyad} onChange={(e) => setSoyad(e.target.value)} required />
                  </label>
                </div>
                <label>
                  Kullanıcı adı
                  <input
                    value={kullaniciAdi}
                    onChange={(e) => setKullaniciAdi(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Şifre{mode === 'edit' ? ' (opsiyonel)' : ''}
                  <input
                    type="password"
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    required={mode === 'create'}
                    minLength={mode === 'create' ? 4 : undefined}
                    placeholder={mode === 'edit' ? 'Değiştirmek için doldurun' : ''}
                  />
                </label>
                <div className="admin-form__row-2">
                  <label>
                    Yetki
                    <select value={yetki} onChange={(e) => setYetki(e.target.value)}>
                      <option value="yonetici">Yönetici</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editör</option>
                    </select>
                  </label>
                  <label>
                    Durum
                    <select value={aktif} onChange={(e) => setAktif(e.target.value)}>
                      <option value="1">Aktif</option>
                      <option value="0">Pasif</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="admin-form__side">
                <ImagePickerField value={fotoUrl} onChange={setFotoUrl} label="Fotoğraf" />
              </div>

              <div className="admin-form__actions admin-form__span-2">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to="/admin/yoneticiler" className="admin-btn admin-btn-secondary">
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

export function YoneticilerEkle() {
  usePageTitle('Yönetici Ekle');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <YoneticiForm
      mode="create"
      busy={busy}
      err={err}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        try {
          await createYonetici(payload);
          navigate('/admin/yoneticiler');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function YoneticilerDuzenle() {
  usePageTitle('Yönetici Düzenle');
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getYonetici(id)
      .then(setInitial)
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;

  return (
    <YoneticiForm
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
          await updateYonetici(id, payload);
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
