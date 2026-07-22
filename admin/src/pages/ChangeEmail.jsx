import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { changeEmail, fetchProfile } from '../api/client';

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
      <div className="mx-auto max-w-lg">
        <Link to="/" className="mb-4 inline-flex text-sm text-primary hover:underline">
          ← Ana sayfa
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-[#022842]">E-posta Değiştir</h1>
        <p className="mb-6 text-sm text-on-surface-variant">
          Mevcut: <strong>{current || '—'}</strong>
        </p>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-outline-variant/25 bg-white p-6 shadow-sm space-y-4"
        >
          <label className="block text-sm font-medium">
            Yeni e-posta
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-outline-variant/40 px-3 py-2"
              value={yeni}
              onChange={(e) => setYeni(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Onay için şifre
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-outline-variant/40 px-3 py-2"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
            />
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          {msg && <p className="text-sm text-green-700">{msg}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[#022842] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#033a5c] disabled:opacity-60"
          >
            {busy ? 'Kaydediliyor…' : 'E-postayı Güncelle'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
