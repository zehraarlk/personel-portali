import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { forgotPassword } from '../../api/client';

/** Şifremi unuttum — orijinal sifre_unuttum.php */
export default function ForgotPassword() {
  const [tcNo, setTcNo] = useState('');
  const [telefon, setTelefon] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const digitsOnly = (value) => value.replace(/\D/g, '');

  const validate = () => {
    const next = {};
    const tc = digitsOnly(tcNo);
    const tel = digitsOnly(telefon);
    if (tc.length !== 11) next.tcNo = 'Geçerli bir T.C. Kimlik Numarası giriniz.';
    if (tel.length !== 11 || !tel.startsWith('05')) {
      next.telefon = 'Geçerli bir cep telefonu numarası giriniz.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await forgotPassword({
        tc_no: digitsOnly(tcNo),
        telefon: digitsOnly(telefon),
      });
      setSuccess(
        data.message ||
          'Şifreniz sıfırlandı. Yeni şifreniz kayıtlı iletişim bilgilerinize gönderildi.'
      );
    } catch (err) {
      setError(err.message || 'İşlem başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="reset"
      title="Şifremi Unuttum ?"
      intro="Şifrenizi sıfırlamak için sizden istenilen bilgileri giriniz."
    >
      <div
        className={`login-alert${error ? ' is-visible' : ''}`}
        role="alert"
        aria-live="polite"
      >
        {error}
      </div>
      <div
        className={`login-alert login-alert--success${success ? ' is-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {success}
      </div>

      <form className="login-form" onSubmit={onSubmit} noValidate>
        <div className="login-field">
          <label htmlFor="tc_no" className="login-label">
            T.C Kimlik Numarası <span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="tc_no"
            type="text"
            className={`login-input${fieldErrors.tcNo ? ' is-invalid' : ''}`}
            inputMode="numeric"
            maxLength={11}
            value={tcNo}
            onChange={(e) => setTcNo(digitsOnly(e.target.value).slice(0, 11))}
            placeholder="Kimlik Numaranız..."
            autoComplete="off"
          />
          <p className={`login-field-error${fieldErrors.tcNo ? ' is-visible' : ''}`}>
            {fieldErrors.tcNo || 'Geçerli bir T.C. Kimlik Numarası giriniz.'}
          </p>
        </div>

        <div className="login-field">
          <label htmlFor="telefon" className="login-label">
            Cep Telefonu <span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="telefon"
            type="text"
            className={`login-input${fieldErrors.telefon ? ' is-invalid' : ''}`}
            inputMode="numeric"
            maxLength={11}
            value={telefon}
            onChange={(e) => setTelefon(digitsOnly(e.target.value).slice(0, 11))}
            placeholder="0**********"
            autoComplete="off"
          />
          <p className={`login-field-error${fieldErrors.telefon ? ' is-visible' : ''}`}>
            {fieldErrors.telefon || 'Geçerli bir cep telefonu numarası giriniz.'}
          </p>
          <p className="login-format-hint">
            Cep Telefonu Yazım Formatı: <code>05** *** ** **</code>
          </p>
        </div>

        <div className="login-btn-row">
          <button
            type="submit"
            className="login-submit login-submit--inline"
            disabled={loading}
          >
            {loading ? 'GÖNDERİLİYOR...' : 'Şifre Sıfırla'}
          </button>
          <Link to="/giris" className="login-cancel-btn">
            Vazgeç
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
