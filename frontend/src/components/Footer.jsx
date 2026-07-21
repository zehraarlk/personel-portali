import { Link } from 'react-router-dom';
import { BRAND_IMG } from '../constants';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-outline-variant/30 bg-surface-container-low">
      <div className="flex flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <img
            src={BRAND_IMG}
            alt=""
            className="h-8 w-8 rounded-lg object-contain bg-white border border-outline-variant/30 p-0.5"
          />
          <span className="text-sm text-on-surface-variant">
            © {year} Gebze Belediyesi Personel Portalı
          </span>
        </div>
        <div className="flex gap-5">
          <Link to="/test" className="text-xs font-medium text-on-surface-variant underline hover:text-primary">
            Sistem Durumu
          </Link>
          <a
            href="mailto:personel@gebze.bel.tr"
            className="text-xs font-medium text-on-surface-variant underline hover:text-primary"
          >
            Destek
          </a>
        </div>
      </div>
    </footer>
  );
}
