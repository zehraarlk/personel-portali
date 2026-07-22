import { SITE_LOGO_WHITE } from '../constants';
import '../styles/footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <img src={SITE_LOGO_WHITE} alt="Gebze Belediyesi" className="site-footer-logo" />
          <span className="site-footer-copy">© {year} Gebze Belediyesi Personel Portalı</span>
        </div>

        <div className="site-footer-links">
          <a
            href="http://127.0.0.1:8000/api/"
            target="_blank"
            rel="noreferrer"
            className="site-footer-link"
          >
            Django API
          </a>
        </div>
      </div>
    </footer>
  );
}