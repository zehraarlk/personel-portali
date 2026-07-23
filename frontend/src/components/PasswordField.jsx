import { useState } from 'react';
import { Link } from 'react-router-dom';

/** Şifre alanı + göster/gizle (orijinal login.js) */
export default function PasswordField({
  id = 'password',
  label = 'Şifre',
  value,
  onChange,
  invalid,
  error,
  showForgot,
  forgotTo = '/sifre-sifirla',
  placeholder = 'Şifreniz',
  autoComplete = 'current-password',
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="login-field">
      {showForgot ? (
        <div className="login-field-row">
          <label htmlFor={id} className="login-label login-label--inline">
            {label} <span className="required" aria-hidden="true">*</span>
          </label>
          <Link to={forgotTo} className="login-forgot-link">
            Şifremi Unuttum ?
          </Link>
        </div>
      ) : (
        <label htmlFor={id} className="login-label">
          {label} <span className="required" aria-hidden="true">*</span>
        </label>
      )}
      <div className="login-password-wrap">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`login-input${invalid ? ' is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="login-password-toggle"
          aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
          onClick={() => setShow((v) => !v)}
        >
          <i className={`fas ${show ? 'fa-eye' : 'fa-eye-slash'}`} aria-hidden="true" />
        </button>
      </div>
      {error ? (
        <p className={`login-field-error${invalid ? ' is-visible' : ''}`}>{error}</p>
      ) : null}
    </div>
  );
}
