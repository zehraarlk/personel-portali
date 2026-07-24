import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { changePassword } from '../api/client';
import '../styles/profil.css';

export default function ChangePassword() {
  const [mevcut, setMevcut] = useState('');
  const [yeni, setYeni] = useState('');
  const [tekrar, setTekrar] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setBusy(true);
    try {
      const res = await changePassword({
        mevcut_sifre: mevcut,
        yeni_sifre: yeni,
        yeni_sifre_tekrar: tekrar,
      });
      setMsg(res.message || 'Şifre güncellendi.');
      setMevcut('');
      setYeni('');
      setTekrar('');
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
            <i className="fas fa-key" />
          </span>
          <div className="profil-head__text">
            <h1>Şifre Değiştir</h1>
            <p>Hesap güvenliğiniz için mevcut şifrenizi doğrulayıp yeni şifrenizi belirleyin.</p>
          </div>
        </header>

        <div className="profil-card">
          <form onSubmit={onSubmit} className="profil-form">
            <div className="profil-field">
              <label htmlFor="mevcut-sifre">Mevcut şifre</label>
              <input
                id="mevcut-sifre"
                type="password"
                autoComplete="current-password"
                value={mevcut}
                onChange={(e) => setMevcut(e.target.value)}
                required
              />
            </div>
            <div className="profil-field">
              <label htmlFor="yeni-sifre">Yeni şifre</label>
              <input
                id="yeni-sifre"
                type="password"
                autoComplete="new-password"
                value={yeni}
                onChange={(e) => setYeni(e.target.value)}
                required
                minLength={6}
              />
              <p className="profil-hint">En az 6 karakter olmalıdır.</p>
            </div>
            <div className="profil-field">
              <label htmlFor="yeni-sifre-tekrar">Yeni şifre (tekrar)</label>
              <input
                id="yeni-sifre-tekrar"
                type="password"
                autoComplete="new-password"
                value={tekrar}
                onChange={(e) => setTekrar(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {err && <p className="profil-alert profil-alert--error">{err}</p>}
            {msg && <p className="profil-alert profil-alert--ok">{msg}</p>}

            <div className="profil-actions">
              <button type="submit" className="profil-btn" disabled={busy}>
                <i className="fas fa-save" aria-hidden="true" />
                {busy ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
