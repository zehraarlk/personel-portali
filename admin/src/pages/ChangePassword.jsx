import { useState } from 'react';
import { Link } from 'react-router-dom';
import { changePassword } from '../api/client';
import usePageTitle from '../hooks/usePageTitle';
import AdminAlert from '../components/AdminAlert';

export default function ChangePassword() {
  usePageTitle('Şifre Değiştir');
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
      setMsg(res.message || 'Şifre başarıyla güncellendi.');
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
    <>
      {msg && (
        <AdminAlert key={`ok-${msg}`} type="success" onClose={() => setMsg('')}>
          {msg}
        </AdminAlert>
      )}
      {err && (
        <AdminAlert key={`err-${err}`} type="danger" onClose={() => setErr('')}>
          {err}
        </AdminAlert>
      )}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <i className="fas fa-key" aria-hidden="true" /> Şifre değiştir
          </h2>
          <Link to="/admin" className="admin-btn admin-btn-secondary admin-btn-sm">
            Dashboard
          </Link>
        </div>
        <div className="admin-card-body">
          <form className="admin-form" onSubmit={onSubmit}>
            <label>
              Mevcut şifre
              <input
                type="password"
                value={mevcut}
                onChange={(e) => setMevcut(e.target.value)}
                required
              />
            </label>
            <label>
              Yeni şifre
              <input
                type="password"
                value={yeni}
                onChange={(e) => setYeni(e.target.value)}
                required
                minLength={6}
              />
            </label>
            <label>
              Yeni şifre (tekrar)
              <input
                type="password"
                value={tekrar}
                onChange={(e) => setTekrar(e.target.value)}
                required
                minLength={6}
              />
            </label>
            <div className="admin-form__actions">
              <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                {busy ? 'Kaydediliyor…' : 'Güncelle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
