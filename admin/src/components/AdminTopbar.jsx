import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BRAND_IMG } from '../constants';
import { fetchProfile, logoutAdmin } from '../api/client';
import { clearAdminSession, getProfileCache, getYoneticiId, setProfileCache } from '../auth/session';
import useMediaFit from '../../../frontend/src/hooks/useMediaFit.js';

const PROFILE_MENU = [
  { to: '/admin/profil/sifre-degistir', label: 'Şifre Değiştir', icon: 'fas fa-key' },
  { to: '/admin/profil/oturum-kayitlari', label: 'Oturum Kayıtları', icon: 'fas fa-history' },
];

export default function AdminTopbar({ title, onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => getProfileCache());
  const [open, setOpen] = useState(false);
  const [fit, setFit] = useMediaFit();
  const menuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (!getYoneticiId()) {
      setProfile(null);
      return undefined;
    }
    const cached = getProfileCache();
    if (cached) setProfile(cached);
    fetchProfile()
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          setProfileCache(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

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

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logoutAdmin();
    } catch {
      /* local clear */
    }
    clearAdminSession();
    navigate('/giris');
  };

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

      <div className="admin-topbar__right">
        <div className="admin-fit-toggle admin-fit-toggle--topbar" role="group" aria-label="Site görsel sığdırma">
          <button
            type="button"
            className={`admin-fit-toggle__btn${fit === 'contain' ? ' is-active' : ''}`}
            onClick={() => setFit('contain')}
            title="Tam ekran — tüm görsel görünür, kenarlar bulanık"
          >
            <i className="fas fa-expand" aria-hidden="true" />
            <span>Tam ekran</span>
          </button>
          <button
            type="button"
            className={`admin-fit-toggle__btn${fit === 'cover' ? ' is-active' : ''}`}
            onClick={() => setFit('cover')}
            title="Sığdır — görsel alanı kaplar (kırpılabilir)"
          >
            <i className="fas fa-compress" aria-hidden="true" />
            <span>Sığdır</span>
          </button>
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
              <button
                type="button"
                role="menuitem"
                className="admin-topbar__dropdown-item"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt" aria-hidden="true" />
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
