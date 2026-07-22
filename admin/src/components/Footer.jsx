import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="admin-footer">
      <div className="admin-footer__inner">
        <span className="admin-footer__copy">
          © {year} Gebze Belediyesi Personel Portalı
        </span>
        <div className="admin-footer__links">
          <Link to="/">Personel Portal</Link>
          <Link to="/test">Test</Link>
        </div>
      </div>
    </footer>
  );
}
