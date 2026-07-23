import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import PasswordField from '../../components/PasswordField';
import { loginPersonel } from '../../api/client';
import { getPersonelId, getYoneticiId, setPersonelId, setYoneticiId, setOturumId } from '../../auth/session';

/** Personel giriş — orijinal login.php mantığı (yalnızca personel) */
export default function Login() {
  const navigate = useNavigate();
  const [sicilNo, setSicilNo] = useState('');
  const [sifre, setSifre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (getPersonelId() || getYoneticiId()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    const next = {};
    if (!sicilNo.trim()) next.sicilNo = 'Sicil numarası boş bırakılamaz.';
    if (!sifre.trim()) next.sifre = 'Şifre boş bırakılamaz.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await loginPersonel({ sicil_no: sicilNo.trim(), sifre: sifre.trim() });
      if (data?.personel?.id) {
        setYoneticiId('');
        setPersonelId(data.personel.id);
        setOturumId(data.oturum_id || '');
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Sicil numarası veya şifre hatalı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="PERSONEL GİRİŞ EKRANI">
      <div
        className={`login-alert${error ? ' is-visible' : ''}`}
        role="alert"
        aria-live="polite"
      >
        {error}
      </div>

      <form className="login-form" onSubmit={onSubmit} noValidate>
        <div className="login-field">
          <label htmlFor="sicil_no" className="login-label">
            Sicil Numarası <span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="sicil_no"
            name="sicil_no"
            type="text"
            className={`login-input${fieldErrors.sicilNo ? ' is-invalid' : ''}`}
            value={sicilNo}
            onChange={(e) => setSicilNo(e.target.value)}
            placeholder="Sicil Numaranız..."
            autoComplete="username"
          />
          <p className={`login-field-error${fieldErrors.sicilNo ? ' is-visible' : ''}`}>
            {fieldErrors.sicilNo || 'Sicil numarası boş bırakılamaz.'}
          </p>
        </div>

        <PasswordField
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          invalid={Boolean(fieldErrors.sifre)}
          error={fieldErrors.sifre || 'Şifre boş bırakılamaz.'}
          showForgot
        />

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? 'GİRİŞ YAPILIYOR...' : 'Giriş Yap'}
        </button>

        <div className="login-divider" aria-hidden="true">
          YA DA
        </div>

        <Link to="/sifre-sifirla" className="login-secondary-btn">
          Şifrenizi Sıfırlamak için Tıklayınız.
        </Link>
        <Link to="/admin/giris" className="login-secondary-btn">
          Yönetim Paneli için Tıklayınız.
        </Link>
      </form>
    </AuthShell>
  );
}
