import { Link } from 'react-router-dom';
import { SITE_LOGO_WHITE } from '../constants';
import '../styles/footer.css';

// TODO: Gerçek iletişim bilgileri ve sosyal medya bağlantılarını buradan güncelleyin.
const CONTACT = {
  address: 'Gebze Belediyesi, Hacı Halil Mah. İbni Sina Cad. No:2, 41400 Gebze/Kocaeli',
  phone: '0262 642 04 30',
  phoneHref: 'tel:+902626420430',
  email: 'gebze@gebze.bel.tr',
};

const SOCIAL_LINKS = [
  { label: 'Facebook', icon: 'fab fa-facebook-f', href: 'https://www.facebook.com/gebzebelediye' },
  { label: 'X (Twitter)', icon: 'fab fa-x-twitter', href: 'https://x.com/gebze_belediye' },
  { label: 'Instagram', icon: 'fab fa-instagram', href: 'https://www.instagram.com/gebze_belediyesi' },
  { label: 'YouTube', icon: 'fab fa-youtube', href: 'https://www.youtube.com/channel/UCj2OaUgzp76dOS2jTlz2frg' },
];

const QUICK_LINKS = [
  { to: '/', label: 'Anasayfa' },
  { to: '/duyurular', label: 'Duyurular' },
  { to: '/etkinlikler', label: 'Etkinlikler' },
  { to: '/videolar', label: 'Videolar' },
];

const RESOURCE_LINKS = [
  { to: '/dokumanlar', label: 'Dokümanlar' },
  { to: '/mevzuatlar', label: 'Mevzuatlar' },
  { to: '/protokoller', label: 'Protokoller' },
  { to: '/egitimler', label: 'Eğitimler' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand-col">
            <img src={SITE_LOGO_WHITE} alt="Gebze Belediyesi" className="site-footer-logo" />
            <p className="site-footer-tagline">
              Gebze Belediyesi Personel Portalı; duyurular, etkinlikler ve kurum içi
              kaynaklara tek noktadan erişim sağlar.
            </p>
            <div className="site-footer-social">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="site-footer-social-link"
                  aria-label={s.label}
                >
                  <i className={s.icon} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="site-footer-links-row">
            <div>
              <h3 className="site-footer-col-title">Hızlı Erişim</h3>
              <nav className="site-footer-list">
                {QUICK_LINKS.map((item) => (
                  <Link key={item.to} to={item.to} className="site-footer-link">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="site-footer-col-title">Kaynaklar</h3>
              <nav className="site-footer-list">
                {RESOURCE_LINKS.map((item) => (
                  <Link key={item.to} to={item.to} className="site-footer-link">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div>
            <h3 className="site-footer-col-title">İletişim</h3>
            <div>
              <div className="site-footer-contact-item">
                <i className="fas fa-location-dot site-footer-contact-icon" aria-hidden="true" />
                <span>{CONTACT.address}</span>
              </div>
              <div className="site-footer-contact-item">
                <i className="fas fa-phone site-footer-contact-icon" aria-hidden="true" />
                <a href={CONTACT.phoneHref} className="site-footer-contact-link">
                  {CONTACT.phone}
                </a>
              </div>
              <div className="site-footer-contact-item">
                <i className="fas fa-envelope site-footer-contact-icon" aria-hidden="true" />
                <a href={`mailto:${CONTACT.email}`} className="site-footer-contact-link">
                  {CONTACT.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© {year} Gebze Belediyesi Personel Portalı — Tüm hakları saklıdır.</span>
          <div className="site-footer-bottom-links">
            <Link to="/gizlilik-politikasi" className="site-footer-bottom-link">
              Gizlilik Politikası
            </Link>
            <Link to="/kullanim-kosullari" className="site-footer-bottom-link">
              Kullanım Koşulları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}