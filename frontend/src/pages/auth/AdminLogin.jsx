import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import PasswordField from '../../components/PasswordField';
import { loginAdmin } from '../../api/client';
import { getYoneticiId, setPersonelId, setYoneticiId, setYoneticiOturumId, setOturumId } from '../../auth/session';

/** Yönetici giriş — orijinal yonetim_giris.php */
export default function AdminLogin() {
  const navigate = useNavigate();
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (getYoneticiId()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    const next = {};
    if (!kullaniciAdi.trim()) next.kullaniciAdi = 'Kullanıcı adı boş bırakılamaz.';
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
      const data = await loginAdmin({
        kullanici_adi: kullaniciAdi.trim(),
        sifre,
      });
      if (data?.yonetici?.id) {
        setPersonelId('');
        setOturumId('');
        setYoneticiId(data.yonetici.id);
        setYoneticiOturumId(data.oturum_id || '');
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Kullanıcı adı veya şifre hatalı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="admin"
      badge={
        <>
          <i className="fas fa-shield-halved" aria-hidden="true" />
          YÖNETİM PANELİ
        </>
      }
      subtitle="YÖNETİCİ GİRİŞ EKRANI"
      note="Yönetim paneli girişi personel girişinden ayrıdır."
      footer={
        <Link to="/giris" className="login-back-link">
          <i className="fas fa-chevron-left" aria-hidden="true" />
          Personel Girişine Dön
        </Link>
      }
    >
      <div
        className={`login-alert${error ? ' is-visible' : ''}`}
        role="alert"
        aria-live="polite"
      >
        {error}
      </div>

      <form className="login-form" onSubmit={onSubmit} noValidate>
        <div className="login-field">
          <label htmlFor="kullanici_adi" className="login-label">
            Kullanıcı Adı <span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="kullanici_adi"
            type="text"
            className={`login-input${fieldErrors.kullaniciAdi ? ' is-invalid' : ''}`}
            value={kullaniciAdi}
            onChange={(e) => setKullaniciAdi(e.target.value)}
            placeholder="Kullanıcı Adınız..."
            autoComplete="username"
          />
          <p className={`login-field-error${fieldErrors.kullaniciAdi ? ' is-visible' : ''}`}>
            {fieldErrors.kullaniciAdi || 'Kullanıcı adı boş bırakılamaz.'}
          </p>
        </div>

        <PasswordField
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          invalid={Boolean(fieldErrors.sifre)}
          error={fieldErrors.sifre || 'Şifre boş bırakılamaz.'}
        />

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
        </button>
      </form>
    </AuthShell>
  );
}
