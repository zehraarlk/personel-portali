import { LOGIN_LOGO } from '../constants';
import '../styles/login.css';

/**
 * Orijinal PHP login iskeleti: .login-page > .login-box
 * variant: 'personel' | 'admin' | 'reset'
 */
export default function AuthShell({
  variant = 'personel',
  subtitle,
  title,
  intro,
  badge,
  note,
  footer,
  children,
}) {
  const pageClass =
    variant === 'admin'
      ? 'login-page login-page--admin'
      : variant === 'reset'
        ? 'login-page login-page--reset'
        : 'login-page';

  return (
    <div className={pageClass}>
      <main className="login-box">
        <div className="login-logo-wrap">
          <img className="login-logo" src={LOGIN_LOGO} alt="Gebze Belediyesi İnsan Kaynakları" />
        </div>
        {badge ? <p className="login-badge">{badge}</p> : null}
        {subtitle ? <p className="login-subtitle">{subtitle}</p> : null}
        {title ? <h1 className="login-title">{title}</h1> : null}
        {intro ? <p className="login-intro">{intro}</p> : null}
        {note ? <p className="login-note">{note}</p> : null}
        {children}
        {footer}
      </main>
    </div>
  );
}
