import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { changeEmail, fetchProfile } from '../api/client';
import '../styles/profil.css';

export default function ChangeEmail() {
  const [current, setCurrent] = useState('');
  const [yeni, setYeni] = useState('');
  const [sifre, setSifre] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        setCurrent(p.email || '');
        setYeni(p.email || '');
      })
      .catch(() => {});
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setBusy(true);
    try {
      const res = await changeEmail({ yeni_email: yeni, sifre });
      setCurrent(res.personel?.email || yeni);
      setMsg('E-posta güncellendi.');
      setSifre('');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="profil-page">
        <Link to="/" className="profil-back">
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Ana sayfa
        </Link>

        <header className="profil-head">
          <span className="profil-head__icon" aria-hidden="true">
            <i className="fas fa-envelope" />
          </span>
          <div className="profil-head__text">
            <h1>E-posta Değiştir</h1>
            <p>
              Mevcut adres: <strong>{current || '—'}</strong>
            </p>
          </div>
        </header>

        <div className="profil-card">
          <form onSubmit={onSubmit} className="profil-form">
            <div className="profil-field">
              <label htmlFor="yeni-email">Yeni e-posta</label>
              <input
                id="yeni-email"
                type="email"
                autoComplete="email"
                value={yeni}
                onChange={(e) => setYeni(e.target.value)}
                required
              />
            </div>
            <div className="profil-field">
              <label htmlFor="email-sifre">Onay için şifre</label>
              <input
                id="email-sifre"
                type="password"
                autoComplete="current-password"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                required
              />
              <p className="profil-hint">Değişikliği onaylamak için hesap şifrenizi girin.</p>
            </div>

            {err && <p className="profil-alert profil-alert--error">{err}</p>}
            {msg && <p className="profil-alert profil-alert--ok">{msg}</p>}

            <div className="profil-actions">
              <button type="submit" className="profil-btn" disabled={busy}>
                <i className="fas fa-save" aria-hidden="true" />
                {busy ? 'Kaydediliyor…' : 'E-postayı Güncelle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
