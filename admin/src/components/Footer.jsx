import { Link } from 'react-router-dom';
import { SITE_LOGO_WHITE } from '../constants';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-outline-variant/30 bg-surface-container-low">
      <div className="flex flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <img
            src={SITE_LOGO_WHITE}
            alt="Gebze Belediyesi"
            className="h-10 w-auto max-w-[9.5rem] rounded-md object-contain object-left bg-[#022842] px-2.5 py-1.5 border border-outline-variant/30"
          />
          <span className="text-sm text-on-surface-variant">
            © {year} Gebze Belediyesi Personel Portalı
          </span>
        </div>
        <div className="flex flex-wrap gap-5">
          <a
            href="http://127.0.0.1:8000/api/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-on-surface-variant underline hover:text-primary"
          >
            Django API
          </a>
          <Link to="/test" className="text-xs font-medium text-on-surface-variant underline hover:text-primary">
            Sistem Durumu
          </Link>
        </div>
      </div>
    </footer>
  );
}
