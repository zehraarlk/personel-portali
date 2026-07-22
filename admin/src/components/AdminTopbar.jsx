import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BRAND_IMG } from '../constants';
import { fetchProfile } from '../api/client';

const PROFILE_MENU = [
  { to: '/admin/profil/sifre-degistir', label: 'Şifre Değiştir', icon: 'fas fa-key' },
  { to: '/admin/profil/oturum-kayitlari', label: 'Oturum Kayıtları', icon: 'fas fa-history' },
];

export default function AdminTopbar({ title, onMenu }) {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const foto = profile?.foto || BRAND_IMG;
  const name = profile?.ad_soyad || profile?.kullanici_adi || 'Yönetici';
  const yetki = profile?.yetki || profile?.rol || 'Yönetici';

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__left">
        <button type="button" className="admin-topbar__menu" onClick={onMenu} aria-label="Menüyü aç">
          <i className="fas fa-bars" aria-hidden="true" />
        </button>
        <h1>{title}</h1>
      </div>

      <div className="admin-topbar__user" ref={menuRef}>
        <button
          type="button"
          className="admin-topbar__badge"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <img
            src={foto}
            alt=""
            onError={(e) => {
              e.currentTarget.src = BRAND_IMG;
            }}
          />
          <span className="admin-topbar__badge-text">
            <strong>{name}</strong>
            <small>{yetki}</small>
          </span>
          <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} aria-hidden="true" />
        </button>

        {open && (
          <div className="admin-topbar__dropdown" role="menu">
            {PROFILE_MENU.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                className="admin-topbar__dropdown-item"
                onClick={() => setOpen(false)}
              >
                <i className={item.icon} aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
