import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listAnketler,
  getAnket,
  createAnket,
  updateAnket,
  deleteAnket,
  listAnketKategoriler,
} from '../../api/client';
import usePageTitle from '../../hooks/usePageTitle';
import { BRAND_IMG } from '../../constants';
import ImagePickerField from '../../components/ImagePickerField';
import AdminRowActions from '../../components/AdminRowActions';
import AdminAlert from '../../components/AdminAlert';

const SORU_TIPLERI = [
  { value: 'coktan_secmeli', label: 'Çoktan seçmeli' },
  { value: 'acik_uclu', label: 'Açık uçlu' },
];

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('tr-TR');
  } catch {
    return value;
  }
}

function kategoriBadgeClass(slug) {
  switch (slug) {
    case 'active':
      return 'is-aktif';
    case 'pending':
      return 'is-beklemede';
    case 'completed':
      return 'is-tamam';
    case 'expired':
      return 'is-pasif';
    default:
      return 'is-pasif';
  }
}

function emptySoru(sira = 1) {
  return {
    key: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    id: null,
    soru_metni: '',
    soru_tipi: 'coktan_secmeli',
    sira,
    secenekler: [
      { key: `s-${Date.now()}-a`, id: null, secenek_metni: '' },
      { key: `s-${Date.now()}-b`, id: null, secenek_metni: '' },
    ],
  };
}

function mapSorularFromApi(list) {
  if (!Array.isArray(list) || list.length === 0) return [emptySoru(1)];
  return list.map((s, i) => ({
    key: `q-${s.id || i}`,
    id: s.id || null,
    soru_metni: s.soru_metni || '',
    soru_tipi: s.soru_tipi || 'coktan_secmeli',
    sira: s.sira || i + 1,
    secenekler:
      s.soru_tipi === 'acik_uclu'
        ? []
        : (s.secenekler || []).map((c, j) => ({
            key: `c-${c.id || `${i}-${j}`}`,
            id: c.id || null,
            secenek_metni: c.secenek_metni || '',
          })),
  }));
}

export function AnketlerIndex() {
  usePageTitle('Anketler');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listAnketler()
      .then((data) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDelete = async (id) => {
    if (!window.confirm('Bu anketi ve sorularını silmek istiyor musunuz?')) return;
    try {
      await deleteAnket(id);
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
            <i className="fas fa-poll" aria-hidden="true" />
            Anketler
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <span className="admin-count-pill">
            Toplam <strong>{rows.length}</strong>
          </span>
          <Link to="/admin/anketler/ekle" className="admin-btn admin-btn-primary">
            <i className="fas fa-plus" aria-hidden="true" /> Yeni Anket
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
                <th>Anket</th>
                <th>Tarih</th>
                <th>Katılım</th>
                <th>Durum</th>
                <th>Favori</th>
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
                    Henüz anket yok. Yeni kayıt ekleyin.
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="admin-td-index">{index + 1}</td>
                  <td className="admin-td-media">
                    <img
                      className="thumb"
                      src={row.resim_display || row.resim_url || BRAND_IMG}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = BRAND_IMG;
                      }}
                    />
                  </td>
                  <td>
                    <div className="admin-row-title">{row.baslik}</div>
                    {row.aciklama ? (
                      <div className="admin-row-meta">
                        {row.aciklama.length > 100
                          ? `${row.aciklama.slice(0, 98)}…`
                          : row.aciklama}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    {formatDate(row.baslangic_tarihi)}
                    {' – '}
                    {formatDate(row.bitis_tarihi)}
                  </td>
                  <td>
                    {row.katilim_sayisi ?? 0}
                    {row.hedef_katilim != null ? ` / ${row.hedef_katilim}` : ''}
                  </td>
                  <td>
                    <span
                      className={`admin-badge-status ${kategoriBadgeClass(
                        row.kategori_slug || '',
                      )}`}
                    >
                      {row.kategori_ad || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge-status ${row.favori ? 'is-aktif' : 'is-pasif'}`}>
                      {row.favori ? 'Evet' : 'Hayır'}
                    </span>
                  </td>
                  <td>
                    <AdminRowActions
                      editTo={`/admin/anketler/${row.id}/duzenle`}
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

function AnketForm({ mode, initial, onSubmit, busy, err, msg, onClearMsg, onClearErr }) {
  const [baslik, setBaslik] = useState(initial?.baslik || '');
  const [aciklama, setAciklama] = useState(initial?.aciklama || '');
  const [resimUrl, setResimUrl] = useState(initial?.resim_url || '');
  const [baslangic, setBaslangic] = useState(initial?.baslangic_tarihi || '');
  const [bitis, setBitis] = useState(initial?.bitis_tarihi || '');
  const [hedef, setHedef] = useState(
    initial?.hedef_katilim != null ? String(initial.hedef_katilim) : '',
  );
  const [favori, setFavori] = useState(String(initial?.favori ?? 0));
  const [kategori, setKategori] = useState(
    initial?.kategori != null ? String(initial.kategori) : '',
  );
  const [kategoriler, setKategoriler] = useState([]);
  const [sorular, setSorular] = useState(() => mapSorularFromApi(initial?.sorular));
  const [localErr, setLocalErr] = useState('');

  useEffect(() => {
    listAnketKategoriler()
      .then((data) => setKategoriler(Array.isArray(data) ? data : data.results || []))
      .catch(() => setKategoriler([]));
  }, []);

  useEffect(() => {
    setBaslik(initial?.baslik || '');
    setAciklama(initial?.aciklama || '');
    setResimUrl(initial?.resim_url || '');
    setBaslangic(initial?.baslangic_tarihi || '');
    setBitis(initial?.bitis_tarihi || '');
    setHedef(initial?.hedef_katilim != null ? String(initial.hedef_katilim) : '');
    setFavori(String(initial?.favori ?? 0));
    setKategori(initial?.kategori != null ? String(initial.kategori) : '');
    setSorular(mapSorularFromApi(initial?.sorular));
    setLocalErr('');
  }, [initial]);

  const updateSoru = (key, patch) => {
    setSorular((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  };

  const addSoru = () => {
    setSorular((prev) => [...prev, emptySoru(prev.length + 1)]);
  };

  const removeSoru = (key) => {
    setSorular((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((s) => s.key !== key).map((s, i) => ({ ...s, sira: i + 1 }));
    });
  };

  const addSecenek = (soruKey) => {
    setSorular((prev) =>
      prev.map((s) =>
        s.key === soruKey
          ? {
              ...s,
              secenekler: [
                ...s.secenekler,
                {
                  key: `s-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                  id: null,
                  secenek_metni: '',
                },
              ],
            }
          : s,
      ),
    );
  };

  const updateSecenek = (soruKey, secKey, text) => {
    setSorular((prev) =>
      prev.map((s) =>
        s.key === soruKey
          ? {
              ...s,
              secenekler: s.secenekler.map((c) =>
                c.key === secKey ? { ...c, secenek_metni: text } : c,
              ),
            }
          : s,
      ),
    );
  };

  const removeSecenek = (soruKey, secKey) => {
    setSorular((prev) =>
      prev.map((s) =>
        s.key === soruKey
          ? { ...s, secenekler: s.secenekler.filter((c) => c.key !== secKey) }
          : s,
      ),
    );
  };

  const buildPayload = () => {
    const cleaned = sorular.map((s, i) => {
      const tip = s.soru_tipi;
      const row = {
        soru_metni: s.soru_metni.trim(),
        soru_tipi: tip,
        sira: i + 1,
        secenekler:
          tip === 'acik_uclu'
            ? []
            : s.secenekler
                .map((c) => ({
                  ...(c.id ? { id: c.id } : {}),
                  secenek_metni: c.secenek_metni.trim(),
                }))
                .filter((c) => c.secenek_metni),
      };
      if (s.id) row.id = s.id;
      return row;
    });

    for (const s of cleaned) {
      if (!s.soru_metni) {
        throw new Error('Tüm soru metinleri doldurulmalıdır.');
      }
      if (s.soru_tipi === 'coktan_secmeli' && s.secenekler.length < 2) {
        throw new Error('Çoktan seçmeli sorularda en az 2 seçenek olmalıdır.');
      }
    }

    return {
      baslik: baslik.trim(),
      aciklama: aciklama.trim() || null,
      resim_url: resimUrl.trim() || null,
      baslangic_tarihi: baslangic || null,
      bitis_tarihi: bitis || null,
      hedef_katilim: hedef === '' ? null : Number(hedef),
      favori: Number(favori),
      kategori: kategori ? Number(kategori) : null,
      sorular: cleaned,
    };
  };

  return (
    <div className="admin-module">
      <header className="admin-page-head">
        <div className="admin-page-head__text">
          <h2>
            <i className="fas fa-poll" aria-hidden="true" />
            {mode === 'edit' ? 'Anket düzenle' : 'Yeni anket'}
          </h2>
        </div>
        <div className="admin-page-head__actions">
          <Link to="/admin/anketler" className="admin-btn admin-btn-secondary">
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
                try {
                  onSubmit(buildPayload());
                } catch (ex) {
                  setLocalErr(ex.message);
                }
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
                    rows={4}
                  />
                </label>
                <div className="admin-form__row-2">
                  <label>
                    Başlangıç
                    <input
                      type="date"
                      value={baslangic}
                      onChange={(e) => setBaslangic(e.target.value)}
                    />
                  </label>
                  <label>
                    Bitiş
                    <input type="date" value={bitis} onChange={(e) => setBitis(e.target.value)} />
                  </label>
                </div>
                <div className="admin-form__row-2">
                  <label>
                    Durum
                    <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
                      <option value="">Seçiniz</option>
                      {kategoriler.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.ad}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Hedef katılım
                    <input
                      type="number"
                      min="0"
                      value={hedef}
                      onChange={(e) => setHedef(e.target.value)}
                      placeholder="örn. 200"
                    />
                  </label>
                </div>
                <div className="admin-form__row-2">
                  <label>
                    Favori
                    <select value={favori} onChange={(e) => setFavori(e.target.value)}>
                      <option value="0">Hayır</option>
                      <option value="1">Evet</option>
                    </select>
                  </label>
                  {mode === 'edit' ? (
                    <label>
                      Katılım sayısı
                      <input value={String(initial?.katilim_sayisi ?? 0)} disabled readOnly />
                    </label>
                  ) : (
                    <div />
                  )}
                </div>
              </div>

              <div className="admin-form__side">
                <ImagePickerField value={resimUrl} onChange={setResimUrl} label="Kapak görseli" />
              </div>

              <div className="admin-anket-sorular admin-form__span-2">
                <div className="admin-anket-sorular__head">
                  <div>
                    <h3>Sorular</h3>
                    <p className="admin-anket-sorular__hint">
                      Anket sorularını sırayla ekleyin; çoktan seçmeli için en az iki seçenek gerekir.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={addSoru}
                  >
                    <i className="fas fa-plus" aria-hidden="true" /> Soru ekle
                  </button>
                </div>

                <div className="admin-anket-sorular__list">
                  {sorular.map((soru, index) => (
                    <div key={soru.key} className="admin-anket-soru">
                      <div className="admin-anket-soru__top">
                        <strong>Soru {index + 1}</strong>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => removeSoru(soru.key)}
                          disabled={sorular.length <= 1}
                        >
                          Sil
                        </button>
                      </div>
                      <div className="admin-anket-soru__fields">
                        <label className="admin-anket-soru__metin">
                          Soru metni
                          <textarea
                            value={soru.soru_metni}
                            onChange={(e) =>
                              updateSoru(soru.key, { soru_metni: e.target.value })
                            }
                            rows={3}
                            required
                          />
                        </label>
                        <label className="admin-anket-soru__tip">
                          Tip
                          <select
                            value={soru.soru_tipi}
                            onChange={(e) => {
                              const tip = e.target.value;
                              const patch = { soru_tipi: tip };
                              if (tip === 'acik_uclu') {
                                patch.secenekler = [];
                              } else if (!soru.secenekler?.length) {
                                patch.secenekler = [
                                  { key: `s-${Date.now()}-a`, id: null, secenek_metni: '' },
                                  { key: `s-${Date.now()}-b`, id: null, secenek_metni: '' },
                                ];
                              }
                              updateSoru(soru.key, patch);
                            }}
                          >
                            {SORU_TIPLERI.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {soru.soru_tipi === 'coktan_secmeli' && (
                        <div className="admin-anket-secenekler">
                          <div className="admin-anket-secenekler__head">
                            <span>Seçenekler</span>
                            <button
                              type="button"
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              onClick={() => addSecenek(soru.key)}
                            >
                              Seçenek ekle
                            </button>
                          </div>
                          <div className="admin-anket-secenekler__grid">
                            {soru.secenekler.map((c, ci) => (
                              <div key={c.key} className="admin-anket-secenek">
                                <span className="admin-anket-secenek__idx">{ci + 1}</span>
                                <input
                                  value={c.secenek_metni}
                                  onChange={(e) =>
                                    updateSecenek(soru.key, c.key, e.target.value)
                                  }
                                  placeholder={`Seçenek ${ci + 1}`}
                                  required
                                />
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-secondary admin-btn-sm"
                                  onClick={() => removeSecenek(soru.key, c.key)}
                                  disabled={soru.secenekler.length <= 2}
                                  aria-label="Seçeneği sil"
                                >
                                  <i className="fas fa-times" aria-hidden="true" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-form__actions admin-form__span-2">
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to="/admin/anketler" className="admin-btn admin-btn-secondary">
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

export function AnketlerEkle() {
  usePageTitle('Anket Ekle');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <AnketForm
      mode="create"
      busy={busy}
      err={err}
      onClearErr={() => setErr('')}
      onSubmit={async (payload) => {
        setBusy(true);
        setErr('');
        try {
          await createAnket(payload);
          navigate('/admin/anketler');
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function AnketlerDuzenle() {
  usePageTitle('Anket Düzenle');
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getAnket(id)
      .then(setInitial)
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (!initial && !err) return <p className="admin-muted">Yükleniyor…</p>;

  return (
    <AnketForm
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
          const updated = await updateAnket(id, payload);
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
