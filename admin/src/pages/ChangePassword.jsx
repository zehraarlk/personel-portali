import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { changePassword } from '../api/client';

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
      <div className="mx-auto max-w-lg">
        <Link to="/" className="mb-4 inline-flex text-sm text-primary hover:underline">
          ← Ana sayfa
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-[#022842]">Şifre Değiştir</h1>
        <p className="mb-6 text-sm text-on-surface-variant">personeller tablosundaki şifre güncellenir.</p>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-outline-variant/25 bg-white p-6 shadow-sm space-y-4"
        >
          <label className="block text-sm font-medium">
            Mevcut şifre
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-outline-variant/40 px-3 py-2"
              value={mevcut}
              onChange={(e) => setMevcut(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Yeni şifre
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-outline-variant/40 px-3 py-2"
              value={yeni}
              onChange={(e) => setYeni(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <label className="block text-sm font-medium">
            Yeni şifre (tekrar)
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-outline-variant/40 px-3 py-2"
              value={tekrar}
              onChange={(e) => setTekrar(e.target.value)}
              required
              minLength={6}
            />
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          {msg && <p className="text-sm text-green-700">{msg}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[#022842] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#033a5c] disabled:opacity-60"
          >
            {busy ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
